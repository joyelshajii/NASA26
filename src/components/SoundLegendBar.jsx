import React, { useState, useEffect } from 'react';
import { ChevronRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';

/**
 * SoundLegendBar Component
 * An always-accessible in-situ indicator bar displayed directly on the main exploration stage.
 * Informs first-time users what each sound layer represents using clean, instrument-grade audio cues
 * without generic clip-art icons.
 */
export default function SoundLegendBar({
  currentTelemetry,
  isPlaying,
  onOpenGuide,
  harmonicEngine,
  theme = 'dark',
  togglePlay = null
}) {
  const [testingVoice, setTestingVoice] = useState(null);
  const isLight = theme === 'light';

  const [masterVolume, setMasterVolume] = useState(() => {
    try {
      const saved = localStorage.getItem('terrasonus_volume');
      if (saved !== null && !isNaN(Number(saved))) return Number(saved);
    } catch {}
    return 100;
  });

  useEffect(() => {
    if (harmonicEngine && typeof harmonicEngine.setVolume === 'function') {
      harmonicEngine.setVolume(masterVolume / 100);
    }
  }, [harmonicEngine, masterVolume]);

  const handleVolumeChange = (newVal) => {
    const val = Math.max(0, Math.min(150, Number(newVal) || 0));
    setMasterVolume(val);
    try {
      localStorage.setItem('terrasonus_volume', String(val));
    } catch {}
    if (harmonicEngine && typeof harmonicEngine.setVolume === 'function') {
      harmonicEngine.setVolume(val / 100);
    }
  };

  const handleQuickTest = async (e, voice) => {
    e.stopPropagation();
    setTestingVoice(voice);
    if (harmonicEngine && typeof harmonicEngine.previewVoice === 'function') {
      await harmonicEngine.previewVoice(voice);
    }
    setTimeout(() => {
      setTestingVoice((prev) => (prev === voice ? null : prev));
    }, 1200);
  };

  return (
    <div className={`w-full mb-8 rounded-2xl border p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-colors ${
      isLight 
        ? 'bg-white border-slate-200/90 shadow-slate-200/40 text-slate-900' 
        : 'bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 border-white/10 text-white'
    }`}>
      {/* Top Header of Legend */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          {/* Audio Equalizer Activity Indicator */}
          <div className={`flex items-center gap-1 h-4 px-1 py-0.5 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/60 border-white/10'
          }`}>
            <span className={`w-0.5 rounded-full transition-all ${isPlaying ? 'h-3.5 bg-[#ef233c] animate-pulse' : (isLight ? 'h-1.5 bg-slate-400' : 'h-1.5 bg-zinc-600')}`} />
            <span className={`w-0.5 rounded-full transition-all ${isPlaying ? 'h-2 bg-[#ef233c]/80 animate-pulse [animation-delay:150ms]' : (isLight ? 'h-2.5 bg-slate-400' : 'h-2.5 bg-zinc-600')}`} />
            <span className={`w-0.5 rounded-full transition-all ${isPlaying ? 'h-3 bg-[#ef233c] animate-pulse [animation-delay:300ms]' : (isLight ? 'h-1 bg-slate-400' : 'h-1 bg-zinc-600')}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-bold font-manrope tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Acoustic Legend & Sound Layer Guide
              </h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
                isPlaying 
                  ? (isLight ? 'bg-emerald-100 border border-emerald-300 text-emerald-800' : 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400')
                  : (isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-zinc-800 text-zinc-400')
              }`}>
                {isPlaying ? '4 Voices Active' : 'Standby'}
              </span>
            </div>
            <p className={`text-xs font-inter ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Every sound corresponds to live NASA satellite telemetry, synthesized into harmonic scales.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Master Volume & Boost Slider */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-white/5 border-white/10'
          }`}>
            <button
              onClick={() => handleVolumeChange(masterVolume === 0 ? 100 : 0)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={masterVolume === 0 ? "Unmute Audio" : "Mute Audio"}
              aria-label="Toggle Mute"
            >
              {masterVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Volume2 className={`w-3.5 h-3.5 ${masterVolume > 100 ? 'text-[#ef233c] animate-pulse' : 'text-emerald-500'}`} />
              )}
            </button>
            <span className={`text-[11px] font-mono font-medium ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Volume
            </span>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={masterVolume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-16 sm:w-24 h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-[#ef233c]"
              title={`Master Volume: ${masterVolume}%`}
              aria-label="Master Volume Slider"
            />
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
              masterVolume > 100
                ? (isLight ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/30')
                : (isLight ? 'bg-slate-200 text-slate-700' : 'bg-zinc-800 text-zinc-300')
            }`}>
              {masterVolume}%{masterVolume > 100 ? ' Boost' : ''}
            </span>
          </div>

          <button
            onClick={onOpenGuide}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-950'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            <span>Full Sound Guide & Tutorial</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* 4 Interactive Indicator Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Voice 1: Low Drone */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? (isPlaying ? 'bg-red-50/70 border-red-200 hover:border-red-400' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300')
              : (isPlaying ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/60' : 'bg-black/60 border-zinc-800 hover:border-zinc-700')
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-red-500 tracking-wide">
              Sub-Bass Drone
            </span>
            <button
              onClick={(e) => handleQuickTest(e, 'drone')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
                testingVoice === 'drone'
                  ? 'bg-[#ef233c] text-white border-[#ef233c]'
                  : (isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10')
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'drone' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className={`text-xs font-semibold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Temperature Anomaly (+{currentTelemetry.tempAnomaly}°C)
          </div>
          <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Pitch climbs higher as heat anomaly rises (55 Hz &rarr; 110 Hz).
          </p>
        </div>

        {/* Voice 2: Wind Sweep */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? (isPlaying ? 'bg-sky-50/70 border-sky-200 hover:border-sky-400' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300')
              : (isPlaying ? 'bg-blue-950/20 border-blue-500/30 hover:border-blue-500/60' : 'bg-black/60 border-zinc-800 hover:border-zinc-700')
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-blue-500 tracking-wide">
              Wind Velocity Sweep
            </span>
            <button
              onClick={(e) => handleQuickTest(e, 'wind')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
                testingVoice === 'wind'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : (isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10')
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'wind' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className={`text-xs font-semibold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Wind Velocity ({currentTelemetry.windSpeed} m/s)
          </div>
          <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Filtered pink noise sweeps open into whistling wind during storms.
          </p>
        </div>

        {/* Voice 3: Biosphere Chimes */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? (isPlaying ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300')
              : (isPlaying ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60' : 'bg-black/60 border-zinc-800 hover:border-zinc-700')
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-500 tracking-wide">
              Canopy Pentatonic Bells
            </span>
            <button
              onClick={(e) => handleQuickTest(e, 'chime')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
                testingVoice === 'chime'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : (isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10')
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'chime' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className={`text-xs font-semibold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Canopy Density ({Math.round(currentTelemetry.ndvi * 100)}% NDVI)
          </div>
          <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Pentatonic bells ring over lush forests; silent over deserts/ice.
          </p>
        </div>

        {/* Voice 4: Heartbeat Pulse */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? (isPlaying ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300')
              : (isPlaying ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60' : 'bg-black/60 border-zinc-800 hover:border-zinc-700')
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-amber-500 tracking-wide">
              Active Fire Pulse
            </span>
            <button
              onClick={(e) => handleQuickTest(e, 'pulse')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
                testingVoice === 'pulse'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : (isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10')
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'pulse' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className={`text-xs font-semibold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Active Fires ({Math.round(60 + currentTelemetry.fireIndex * 80)} BPM)
          </div>
          <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Resting heartbeat pulse accelerates into rapid kicks during fires.
          </p>
        </div>

      </div>
    </div>
  );
}
