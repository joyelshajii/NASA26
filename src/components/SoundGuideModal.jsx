import React, { useState } from 'react';
import { X, Play } from 'lucide-react';

/**
 * SoundGuideModal Component
 * Onboarding and audio tutorial modal that educates users on what they are hearing,
 * clearly explaining the 4 acoustic voices and distinguishing them from random beeps.
 * Styled with instrument-grade clarity without generic clip-art icons.
 */
export default function SoundGuideModal({ 
  isOpen, 
  onClose, 
  onStartListening, 
  harmonicEngine,
  isPlaying = false,
  theme = 'dark'
}) {
  const [activePreview, setActivePreview] = useState(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const handlePreview = async (voice) => {
    setActivePreview(voice);
    if (harmonicEngine && typeof harmonicEngine.previewVoice === 'function') {
      await harmonicEngine.previewVoice(voice);
    }
    setTimeout(() => {
      setActivePreview((prev) => (prev === voice ? null : prev));
    }, 1500);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('terrasonus_tutorial_seen', 'true');
      } catch {
        // Safe handle if localStorage is restricted
      }
    }
    onClose();
  };

  const handleStartListening = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('terrasonus_tutorial_seen', 'true');
      } catch {}
    }
    onStartListening();
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-fade-up ${
        isLight ? 'bg-slate-900/40' : 'bg-black/85'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sound-guide-title"
    >
      <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 transition-colors ${
        isLight 
          ? 'bg-white border border-slate-200 text-slate-900 shadow-2xl shadow-slate-400/20' 
          : 'bg-zinc-950 border border-white/10 text-white shadow-2xl shadow-red-950/40'
      }`}>
        
        {/* Header */}
        <div className={`flex items-start justify-between pb-4 border-b mb-6 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-10 bg-[#ef233c] rounded-sm shrink-0" />
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ef233c]/10 border border-[#ef233c]/20 text-[10px] font-manrope text-[#ef233c] font-bold uppercase tracking-wider mb-1">
                Listener Guide &mdash; Audio Tutorial
              </div>
              <h2 id="sound-guide-title" className={`text-2xl sm:text-3xl font-bold tracking-tight font-manrope ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                What Are You Listening To?
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Intro Banner */}
        <div className={`mb-6 p-4 rounded-xl border ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
        }`}>
          <p className="text-sm leading-relaxed font-manrope">
            <strong className={isLight ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>
              Deterministic Sonification:
            </strong> TerraSonus transforms live NASA satellite observations into an ambient musical symphony. Four real-world planetary measurements directly shape four harmonious instruments.
          </p>
        </div>

        {/* 4 Sound Indicator Cards */}
        <div className="space-y-4 mb-6">
          
          {/* 1. Temperature Drone */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-colors ${
            isLight 
              ? 'bg-slate-50/80 border-slate-200 hover:border-red-400 shadow-xs' 
              : 'bg-black border-zinc-800 hover:border-red-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h3 className={`font-bold text-base font-manrope flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  1. Low Bass Drone
                  <span className={`text-xs px-2 py-0.5 rounded font-manrope font-semibold border ${
                    isLight 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-red-950/60 border-red-800/40 text-red-400'
                  }`}>
                    Surface Temperature
                  </span>
                </h3>
              </div>
              <button
                onClick={() => handlePreview('drone')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-manrope font-semibold transition-all flex items-center gap-1.5 cursor-pointer w-fit ${
                  activePreview === 'drone'
                    ? 'bg-[#ef233c] border-[#ef233c] text-white animate-pulse'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                title="Preview sample sound"
              >
                <span>{activePreview === 'drone' ? 'Playing Sample...' : 'Sample Drone'}</span>
              </button>
            </div>
            <p className={`text-sm leading-relaxed font-manrope mb-2 ${
              isLight ? 'text-slate-600' : 'text-zinc-300'
            }`}>
              A continuous, warm low-frequency hum. As global temperatures climb, this drone <strong>audibly rises to higher, tenser pitches</strong>. Scrubbing 1980 to 2026 demonstrates decades of warming.
            </p>
            <div className={`text-[11px] font-manrope flex items-center gap-2 ${
              isLight ? 'text-slate-500' : 'text-zinc-500'
            }`}>
              <span className="text-[#ef233c] font-semibold">NASA GISTEMP v4</span> &bull; 
              <span>Pitch formula: 55 Hz (A1 baseline) &rarr; climbs with +ΔT</span>
            </div>
          </div>

          {/* 2. Wind Sweep */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-colors ${
            isLight 
              ? 'bg-slate-50/80 border-slate-200 hover:border-blue-400 shadow-xs' 
              : 'bg-black border-zinc-800 hover:border-blue-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h3 className={`font-bold text-base font-manrope flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  2. Atmospheric Wind Sweep
                  <span className={`text-xs px-2 py-0.5 rounded font-manrope font-semibold border ${
                    isLight 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-blue-950/60 border-blue-800/40 text-blue-400'
                  }`}>
                    Wind Velocity
                  </span>
                </h3>
              </div>
              <button
                onClick={() => handlePreview('wind')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-manrope font-semibold transition-all flex items-center gap-1.5 cursor-pointer w-fit ${
                  activePreview === 'wind'
                    ? 'bg-blue-600 border-blue-500 text-white animate-pulse'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                title="Preview sample sound"
              >
                <span>{activePreview === 'wind' ? 'Playing Sample...' : 'Sample Wind'}</span>
              </button>
            </div>
            <p className={`text-sm leading-relaxed font-manrope mb-2 ${
              isLight ? 'text-slate-600' : 'text-zinc-300'
            }`}>
              A soft, ocean-like whooshing sound. Whispers quietly during gentle breezes, and <strong>sweeps open into bright, airy whistling wind</strong> during storms and high-velocity jet streams.
            </p>
            <div className={`text-[11px] font-manrope flex items-center gap-2 ${
              isLight ? 'text-slate-500' : 'text-zinc-500'
            }`}>
              <span className="text-blue-500 font-semibold">NASA POWER / GEOS-FP</span> &bull; 
              <span>Filter sweep: 250 Hz (calm) &rarr; 3800 Hz (gale)</span>
            </div>
          </div>

          {/* 3. Biosphere Chimes */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-colors ${
            isLight 
              ? 'bg-slate-50/80 border-slate-200 hover:border-emerald-400 shadow-xs' 
              : 'bg-black border-zinc-800 hover:border-emerald-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h3 className={`font-bold text-base font-manrope flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  3. Biosphere Forest Chimes
                  <span className={`text-xs px-2 py-0.5 rounded font-manrope font-semibold border ${
                    isLight 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400'
                  }`}>
                    Plant Canopy (NDVI)
                  </span>
                </h3>
              </div>
              <button
                onClick={() => handlePreview('chime')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-manrope font-semibold transition-all flex items-center gap-1.5 cursor-pointer w-fit ${
                  activePreview === 'chime'
                    ? 'bg-emerald-600 border-emerald-500 text-white animate-pulse'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                title="Preview sample sound"
              >
                <span>{activePreview === 'chime' ? 'Playing Sample...' : 'Sample Chimes'}</span>
              </button>
            </div>
            <p className={`text-sm leading-relaxed font-manrope mb-2 ${
              isLight ? 'text-slate-600' : 'text-zinc-300'
            }`}>
              Sparkling, bell-like chimes strictly locked to an <strong>A Minor / C Major Pentatonic scale</strong>. Lush regions (like the Amazon) ring out frequently in high octaves; barren deserts and ice caps fall quiet.
            </p>
            <div className={`text-[11px] font-manrope flex items-center gap-2 ${
              isLight ? 'text-slate-500' : 'text-zinc-500'
            }`}>
              <span className="text-emerald-500 font-semibold">MODIS Terra/Aqua</span> &bull; 
              <span>Quantized Pentatonic Scale &bull; Zero musical dissonance</span>
            </div>
          </div>

          {/* 4. Thermal Pulse */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-colors ${
            isLight 
              ? 'bg-slate-50/80 border-slate-200 hover:border-amber-400 shadow-xs' 
              : 'bg-black border-zinc-800 hover:border-amber-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h3 className={`font-bold text-base font-manrope flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  4. Planetary Heartbeat Pulse
                  <span className={`text-xs px-2 py-0.5 rounded font-manrope font-semibold border ${
                    isLight 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-amber-950/60 border-amber-800/40 text-amber-400'
                  }`}>
                    Active Wildfires
                  </span>
                </h3>
              </div>
              <button
                onClick={() => handlePreview('pulse')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-manrope font-semibold transition-all flex items-center gap-1.5 cursor-pointer w-fit ${
                  activePreview === 'pulse'
                    ? 'bg-amber-600 border-amber-500 text-white animate-pulse'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                title="Preview sample sound"
              >
                <span>{activePreview === 'pulse' ? 'Playing Sample...' : 'Sample Heartbeat'}</span>
              </button>
            </div>
            <p className={`text-sm leading-relaxed font-manrope mb-2 ${
              isLight ? 'text-slate-600' : 'text-zinc-300'
            }`}>
              A deep, rhythmic bass drum thump. Paces like a slow, resting planetary heartbeat under normal conditions (~2.8s intervals), but <strong>races into a rapid, urgent pounding</strong> during wildfire outbreaks.
            </p>
            <div className={`text-[11px] font-manrope flex items-center gap-2 ${
              isLight ? 'text-slate-500' : 'text-zinc-500'
            }`}>
              <span className="text-amber-500 font-semibold">VIIRS Active Fire</span> &bull; 
              <span>Tempo: 60 BPM (baseline) &rarr; up to 140+ BPM (wildfire)</span>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className={`p-4 rounded-xl border mb-6 text-xs space-y-2 font-manrope ${
          isLight ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-white/[0.02] border-white/5 text-zinc-400'
        }`}>
          <div className={`font-semibold uppercase tracking-wider text-[11px] font-manrope mb-1 ${
            isLight ? 'text-slate-800' : 'text-zinc-200'
          }`}>
            Quick Discovery Tips:
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#ef233c] font-bold select-none">&bull;</span>
            <span>Click between different biomes (Amazon vs. Sahara vs. Arctic) to hear the sounds transform instantly.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#ef233c] font-bold select-none">&bull;</span>
            <span>Drag the 1980&ndash;2026 timeline slider to hear four decades of Earth&apos;s baseline drone shifting upward.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <label className={`flex items-center gap-2 text-xs cursor-pointer select-none ${
            isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200'
          }`}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-[#ef233c] focus:ring-[#ef233c] cursor-pointer"
            />
            <span>Don&apos;t show this tutorial automatically on startup</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className={`px-5 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer font-manrope ${
                isLight 
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              Close
            </button>
            <button
              onClick={handleStartListening}
              className="px-6 py-2.5 rounded-full bg-[#ef233c] hover:bg-red-700 text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/60 font-manrope"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isPlaying ? 'Resume Listening' : 'Start Listening Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
