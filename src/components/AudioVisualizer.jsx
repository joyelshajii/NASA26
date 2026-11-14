import React, { useEffect, useRef, useState, useMemo } from 'react';

/**
 * Normalizes FFT values across Tone.js decibels (-100 to 0 dB) and standard Web Audio (0-255).
 * @param {number} val - Raw frequency bin value
 * @returns {number} Normalized value between 0.0 and 1.0
 */
function normalizeFftValue(val) {
  if (val === -Infinity || isNaN(val)) return 0;
  // Tone.js Analyser returns decibels <= 0 (e.g. -100 to 0 dB)
  if (val <= 0 && val >= -140) {
    return Math.max(0, Math.min(1, (val + 90) / 80));
  }
  // Standard Web Audio Uint8Array 0 to 255
  if (val > 1.0) {
    return Math.max(0, Math.min(1, val / 255));
  }
  // Already normalized 0.0 to 1.0
  return Math.max(0, Math.min(1, val));
}

/**
 * AudioVisualizer Component
 * High-performance liquid-glass dual-spectrum FFT frequency bars and bezier oscilloscope visualizer.
 */
export default function AudioVisualizer({
  harmonicEngine = null,
  frequencyData = null,
  waveformData = null,
  isPlaying = false,
  audioLevel = 0.0,
  mode = 'dual', // 'dual' | 'bars' | 'wave'
  theme = 'crimson', // 'crimson' | 'hybrid' | 'cyan' | 'amber'
  title = 'SPECTRAL HARMONICS',
  subtitle = 'NASA Earth Observation Acoustic FFT & Oscilloscope',
  height = 180,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // User interactive display states
  const [activeMode, setActiveMode] = useState(mode);
  const [activeTheme, setActiveTheme] = useState(theme);

  // Telemetry readout states (throttled updates)
  const [telemetry, setTelemetry] = useState({
    peakFreq: '--- Hz',
    rmsLevel: '-inf dB',
    activeBand: 'STANDBY'
  });

  // Inertia and peak hold buffers (64 bins)
  const smoothedBarsRef = useRef(new Float32Array(64));
  const peakHoldRef = useRef(new Float32Array(64));
  const peakDecayRef = useRef(new Float32Array(64));

  // Determine active playback state
  const isAudioActive = useMemo(() => {
    if (typeof isPlaying === 'boolean' && isPlaying) return true;
    if (harmonicEngine && typeof harmonicEngine.isPlaying === 'function') {
      return Boolean(harmonicEngine.isPlaying());
    }
    return false;
  }, [isPlaying, harmonicEngine]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = container.clientWidth || 600;
    let canvasHeight = height;

    const updateCanvasDimensions = () => {
      dpr = window.devicePixelRatio || 1;
      width = container.clientWidth || 600;
      canvasHeight = height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${canvasHeight}px`;
    };

    updateCanvasDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    resizeObserver.observe(container);

    let frameCount = 0;
    let idlePhase = 0;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);
      frameCount++;
      idlePhase += 0.035;

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Clear background with deep void #040711
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, width, canvasHeight);

      // 2. Reference Gridlines and Frequency Ticks
      const baselineY = Math.floor(canvasHeight * 0.74);
      const topMargin = 24;
      const barAreaHeight = baselineY - topMargin;

      // Subtle horizontal dB reference lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.22)';
      ctx.lineWidth = 1;

      const dbLines = [
        { label: '0 dB', y: topMargin },
        { label: '-12 dB', y: topMargin + barAreaHeight * 0.33 },
        { label: '-24 dB', y: topMargin + barAreaHeight * 0.66 }
      ];

      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.textAlign = 'right';

      for (const line of dbLines) {
        ctx.beginPath();
        ctx.moveTo(48, line.y);
        ctx.lineTo(width - 12, line.y);
        ctx.stroke();
        ctx.fillText(line.label, 42, line.y + 4);
      }

      // Solid baseline separating bars from liquid reflection
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.moveTo(0, baselineY);
      ctx.lineTo(width, baselineY);
      ctx.stroke();

      // Frequency legend along the bottom
      const freqMarkers = [
        { label: '60 Hz', ratio: 0.1 },
        { label: '250 Hz', ratio: 0.28 },
        { label: '1 kHz', ratio: 0.52 },
        { label: '4 kHz', ratio: 0.74 },
        { label: '16 kHz', ratio: 0.92 }
      ];

      ctx.textAlign = 'center';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
      for (const marker of freqMarkers) {
        const x = marker.ratio * width;
        ctx.fillText(marker.label, x, canvasHeight - 8);
      }

      // 3. Audio Data Retrieval
      let rawFft = null;
      let rawWave = null;

      if (frequencyData && frequencyData.length > 0) {
        rawFft = frequencyData;
      } else if (harmonicEngine && typeof harmonicEngine.getFrequencyData === 'function') {
        rawFft = harmonicEngine.getFrequencyData();
      }

      if (waveformData && waveformData.length > 0) {
        rawWave = waveformData;
      } else if (harmonicEngine && typeof harmonicEngine.getWaveformData === 'function') {
        rawWave = harmonicEngine.getWaveformData();
      }

      const barCount = 64;
      const smoothed = smoothedBarsRef.current;
      const peakHold = peakHoldRef.current;
      const peakDecay = peakDecayRef.current;

      let maxBinVal = 0;
      let maxBinIndex = 0;
      let sumEnergy = 0;

      // 4. Update Bars (Active or Idle Ambient Breath)
      for (let i = 0; i < barCount; i++) {
        let val = 0;
        if (isAudioActive && rawFft && rawFft.length > 0) {
          const sampleIdx = Math.min(
            rawFft.length - 1,
            Math.floor((i / barCount) * rawFft.length)
          );
          val = normalizeFftValue(rawFft[sampleIdx]);
          if (typeof audioLevel === 'number' && audioLevel > 0) {
            val = Math.min(1, val * (0.8 + audioLevel * 0.4));
          }
        } else if (isAudioActive && typeof audioLevel === 'number' && audioLevel > 0) {
          val = audioLevel * (0.4 + 0.6 * Math.abs(Math.sin(idlePhase * 2 + i * 0.15)));
        } else {
          // Ambient resting wave when standby
          val = 0.05 + 0.04 * Math.sin(idlePhase + i * 0.18);
        }

        if (val > maxBinVal) {
          maxBinVal = val;
          maxBinIndex = i;
        }
        sumEnergy += val;

        // Inertia attack and decay
        if (val > smoothed[i]) {
          smoothed[i] += (val - smoothed[i]) * 0.45;
        } else {
          smoothed[i] += (val - smoothed[i]) * 0.12;
        }

        // Peak hold animation
        if (smoothed[i] > peakHold[i]) {
          peakHold[i] = smoothed[i];
          peakDecay[i] = 0;
        } else {
          peakDecay[i] += 1;
          if (peakDecay[i] > 18) {
            peakHold[i] = Math.max(0, peakHold[i] - 0.012);
          }
        }
      }

      // Update Telemetry readout every 12 frames
      if (frameCount % 12 === 0) {
        if (isAudioActive && sumEnergy > 0.5) {
          // Estimate frequency based on bin index
          const approxFreq = Math.round(55 * Math.pow(2, (maxBinIndex / barCount) * 7.5));
          const rmsDb = (20 * Math.log10(Math.max(0.001, sumEnergy / barCount))).toFixed(1);
          let band = 'MID-RANGE';
          if (approxFreq < 200) band = 'SUB-BASS';
          else if (approxFreq < 600) band = 'BASS FLUX';
          else if (approxFreq < 2500) band = 'MID HARMONICS';
          else band = 'HIGH AEROSOL';

          setTelemetry({
            peakFreq: `${approxFreq} Hz`,
            rmsLevel: `${rmsDb} dB`,
            activeBand: band
          });
        } else {
          setTelemetry({
            peakFreq: '--- Hz',
            rmsLevel: '-inf dB',
            activeBand: 'STANDBY'
          });
        }
      }

      // 5. Render FFT Frequency Bars & Liquid-Glass Floor Reflection
      if (activeMode === 'bars' || activeMode === 'dual') {
        const startX = 40;
        const availableWidth = width - startX - 16;
        const barSpacing = 2.5;
        const totalBarWidth = (availableWidth - (barCount - 1) * barSpacing) / barCount;
        const barWidth = Math.max(2, totalBarWidth);

        for (let i = 0; i < barCount; i++) {
          const x = startX + i * (barWidth + barSpacing);
          const barHeight = Math.max(2, smoothed[i] * barAreaHeight);
          const y = baselineY - barHeight;

          // Upper Bar Gradient
          const upperGrad = ctx.createLinearGradient(0, baselineY, 0, y);
          if (activeTheme === 'crimson') {
            upperGrad.addColorStop(0, '#881337');
            upperGrad.addColorStop(0.5, '#ef233c');
            upperGrad.addColorStop(1, '#fb7185');
          } else if (activeTheme === 'cyan') {
            upperGrad.addColorStop(0, '#0369a1');
            upperGrad.addColorStop(0.5, '#06b6d4');
            upperGrad.addColorStop(1, '#67e8f9');
          } else if (activeTheme === 'amber') {
            upperGrad.addColorStop(0, '#b45309');
            upperGrad.addColorStop(0.5, '#f59e0b');
            upperGrad.addColorStop(1, '#fef08a');
          } else {
            // Default Hybrid: Warm Crimson -> Amber -> Cyan
            upperGrad.addColorStop(0, '#ef233c');
            upperGrad.addColorStop(0.55, '#ffb347');
            upperGrad.addColorStop(1, '#06b6d4');
          }

          ctx.fillStyle = upperGrad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          // Peak Hold Cap (Floating Neon Chip)
          const peakY = baselineY - Math.max(2, peakHold[i] * barAreaHeight);
          ctx.fillStyle = activeTheme === 'crimson' ? '#f43f5e' : '#38bdf8';
          ctx.fillRect(x, peakY - 2, barWidth, 1.8);

          // Liquid-Glass Floor Reflection below baseline
          const reflectHeight = Math.floor(barHeight * 0.32);
          const reflectGrad = ctx.createLinearGradient(0, baselineY, 0, baselineY + reflectHeight);
          if (activeTheme === 'crimson') {
            reflectGrad.addColorStop(0, 'rgba(239, 35, 60, 0.28)');
            reflectGrad.addColorStop(1, 'rgba(239, 35, 60, 0.0)');
          } else if (activeTheme === 'cyan') {
            reflectGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
            reflectGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
          } else if (activeTheme === 'amber') {
            reflectGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
            reflectGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
          } else {
            reflectGrad.addColorStop(0, 'rgba(239, 35, 60, 0.25)');
            reflectGrad.addColorStop(0.6, 'rgba(255, 179, 71, 0.12)');
            reflectGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
          }

          ctx.fillStyle = reflectGrad;
          ctx.fillRect(x, baselineY + 1, barWidth, reflectHeight);
        }
      }

      // 6. Render Smooth Bezier Oscilloscope Waveform
      if (activeMode === 'wave' || activeMode === 'dual') {
        const waveCenterY = topMargin + barAreaHeight * 0.48;
        const waveAmplitude = barAreaHeight * 0.42;
        const waveLength = rawWave ? rawWave.length : 128;

        ctx.save();
        ctx.beginPath();

        const startX = 40;
        const waveWidth = width - startX - 16;
        const stepX = waveWidth / (waveLength - 1);

        for (let i = 0; i < waveLength; i++) {
          let sample = 0;
          if (isAudioActive && rawWave && rawWave.length > 0) {
            sample = rawWave[i];
            if (sample > 1.0) sample = (sample / 128) - 1.0;
          } else {
            // Idle gentle harmonic oscillation
            sample = 0.15 * Math.sin(idlePhase * 1.5 + (i / waveLength) * Math.PI * 4);
          }

          const wx = startX + i * stepX;
          const wy = waveCenterY + sample * waveAmplitude;

          if (i === 0) {
            ctx.moveTo(wx, wy);
          } else {
            const prevSample = isAudioActive && rawWave ? rawWave[i - 1] : 0;
            const prevWx = startX + (i - 1) * stepX;
            const prevWy = waveCenterY + prevSample * waveAmplitude;
            const midX = (prevWx + wx) / 2;
            const midY = (prevWy + wy) / 2;
            ctx.quadraticCurveTo(prevWx, prevWy, midX, midY);
          }
        }

        // Luminous Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = activeTheme === 'crimson' ? '#ef233c' : '#06b6d4';
        ctx.strokeStyle = activeTheme === 'crimson' ? '#fda4af' : '#67e8f9';
        ctx.lineWidth = activeMode === 'wave' ? 2.4 : 1.8;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [activeMode, activeTheme, isAudioActive, height, frequencyData, waveformData, harmonicEngine, audioLevel]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl bg-black border border-white/10 p-5 shadow-2xl font-inter overflow-hidden select-none ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-zinc-800 pb-3">
        {/* Left Title & Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center gap-1 w-9 h-9 rounded-lg border ${
              isAudioActive
                ? 'bg-[#ef233c]/20 border-[#ef233c]/60 shadow-lg shadow-red-950/50'
                : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <span className={`w-0.5 rounded-full transition-all ${isAudioActive ? 'h-4 bg-[#ef233c] animate-pulse' : 'h-1.5 bg-zinc-600'}`} />
            <span className={`w-0.5 rounded-full transition-all ${isAudioActive ? 'h-2.5 bg-[#ef233c]/80 animate-pulse [animation-delay:150ms]' : 'h-2.5 bg-zinc-600'}`} />
            <span className={`w-0.5 rounded-full transition-all ${isAudioActive ? 'h-3.5 bg-[#ef233c] animate-pulse [animation-delay:300ms]' : 'h-1 bg-zinc-600'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-bold text-white tracking-wider font-mono uppercase">
                {title}
              </span>
              <span
                className={`text-xs sm:text-sm font-mono px-2.5 py-0.5 rounded border font-semibold ${
                  isAudioActive
                    ? 'bg-[#ef233c]/20 border-[#ef233c]/50 text-[#ef233c] animate-pulse'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                {isAudioActive ? 'AUDIO ACTIVE' : 'IDLE STANDBY'}
              </span>
            </div>
            <div className="text-xs text-zinc-400 font-mono tracking-normal">{subtitle}</div>
          </div>
        </div>

        {/* Center Live Telemetry Chips */}
        <div className="hidden sm:flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-[11px] uppercase text-zinc-400 font-semibold">PEAK:</span>
            <span className="font-bold text-white">{telemetry.peakFreq}</span>
          </div>
          <span className="text-zinc-700 font-bold">|</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-[11px] uppercase text-zinc-400 font-semibold">ENERGY:</span>
            <span className="font-bold text-amber-400">{telemetry.rmsLevel}</span>
          </div>
          <span className="text-zinc-700 font-bold">|</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-[11px] uppercase text-zinc-400 font-semibold">BAND:</span>
            <span className="font-bold text-[#ef233c]">{telemetry.activeBand}</span>
          </div>
        </div>

        {/* Right Mode & Theme Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setActiveMode('dual')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                activeMode === 'dual'
                  ? 'bg-[#ef233c] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              DUAL
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('bars')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                activeMode === 'bars'
                  ? 'bg-[#ef233c] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              FFT
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('wave')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                activeMode === 'wave'
                  ? 'bg-[#ef233c] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              WAVE
            </button>
          </div>

          {/* Color Theme Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTheme('crimson')}
              className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                activeTheme === 'crimson' ? 'ring-2 ring-[#ef233c] scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Warm Crimson Palette"
            >
              <div className="w-4 h-4 rounded-full bg-[#ef233c]" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTheme('hybrid')}
              className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                activeTheme === 'hybrid' ? 'ring-2 ring-sky-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Hybrid Radiant Spectrum"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTheme('cyan')}
              className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                activeTheme === 'cyan' ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Electric Cyan Palette"
            >
              <div className="w-4 h-4 rounded-full bg-[#06b6d4]" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTheme('amber')}
              className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                activeTheme === 'amber' ? 'ring-2 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              title="Solar Amber Palette"
            >
              <div className="w-4 h-4 rounded-full bg-[#ffb347]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main High-DPI Visualizer Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black border border-zinc-800/80 shadow-inner">
        <canvas ref={canvasRef} className="block w-full" />
      </div>
    </div>
  );
}
