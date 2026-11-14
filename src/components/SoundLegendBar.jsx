import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
  harmonicEngine
}) {
  const [testingVoice, setTestingVoice] = useState(null);

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
    <div className="w-full mb-8 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 border border-white/10 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Top Header of Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Audio Equalizer Activity Indicator */}
          <div className="flex items-center gap-1 h-4 px-1 py-0.5 bg-black/60 rounded border border-white/10">
            <span className={`w-0.5 rounded-full transition-all ${isPlaying ? 'h-3.5 bg-[#ef233c] animate-pulse' : 'h-1.5 bg-zinc-600'}`} />
            <span className={`w-0.5 rounded-full transition-all ${isPlaying ? 'h-2 bg-[#ef233c]/80 animate-pulse [animation-delay:150ms]' : 'h-2.5 bg-zinc-600'}`} />
            <span className={`w-0.5 rounded-full transition-all ${isPlaying ? 'h-3 bg-[#ef233c] animate-pulse [animation-delay:300ms]' : 'h-1 bg-zinc-600'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-manrope text-white tracking-tight">
                Live Acoustic Legend &bull; What You Are Hearing
              </h4>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                isPlaying 
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400' 
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {isPlaying ? '4 Voices Streaming' : 'Standby'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-inter">
              Every sound corresponds to live NASA satellite telemetry, synthesized into harmonic scales.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenGuide}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-medium"
        >
          <span>Full Sound Guide & Tutorial</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </div>

      {/* 4 Interactive Indicator Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Voice 1: Low Drone */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isPlaying 
              ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/60' 
              : 'bg-black/60 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef233c]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold">
                VOICE 01 // SUB-BASS
              </span>
            </div>
            <button
              onClick={(e) => handleQuickTest(e, 'drone')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all ${
                testingVoice === 'drone'
                  ? 'bg-[#ef233c] text-white border-[#ef233c]'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'drone' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className="text-xs font-semibold text-white mb-0.5">
            Temperature Anomaly (+{currentTelemetry.tempAnomaly}°C)
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Pitch climbs higher as heat anomaly rises (55 Hz &rarr; 110 Hz).
          </p>
        </div>

        {/* Voice 2: Wind Sweep */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isPlaying 
              ? 'bg-blue-950/20 border-blue-500/30 hover:border-blue-500/60' 
              : 'bg-black/60 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                VOICE 02 // WIND SWEEP
              </span>
            </div>
            <button
              onClick={(e) => handleQuickTest(e, 'wind')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all ${
                testingVoice === 'wind'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'wind' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className="text-xs font-semibold text-white mb-0.5">
            Wind Velocity ({currentTelemetry.windSpeed} m/s)
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Filtered pink noise sweeps open into whistling wind during storms.
          </p>
        </div>

        {/* Voice 3: Biosphere Chimes */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isPlaying 
              ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60' 
              : 'bg-black/60 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                VOICE 03 // CANOPY BELLS
              </span>
            </div>
            <button
              onClick={(e) => handleQuickTest(e, 'chime')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all ${
                testingVoice === 'chime'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'chime' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className="text-xs font-semibold text-white mb-0.5">
            Canopy Density ({Math.round(currentTelemetry.ndvi * 100)}% NDVI)
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Pentatonic bells ring over lush forests; silent over deserts/ice.
          </p>
        </div>

        {/* Voice 4: Heartbeat Pulse */}
        <div 
          onClick={onOpenGuide}
          className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
            isPlaying 
              ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60' 
              : 'bg-black/60 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                VOICE 04 // FIRE PULSE
              </span>
            </div>
            <button
              onClick={(e) => handleQuickTest(e, 'pulse')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all ${
                testingVoice === 'pulse'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Test this voice sample"
            >
              {testingVoice === 'pulse' ? 'PLAYING' : 'TEST'}
            </button>
          </div>
          <div className="text-xs font-semibold text-white mb-0.5">
            Active Fires ({Math.round(60 + currentTelemetry.fireIndex * 80)} BPM)
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Resting heartbeat pulse accelerates into rapid kicks during fires.
          </p>
        </div>

      </div>
    </div>
  );
}
