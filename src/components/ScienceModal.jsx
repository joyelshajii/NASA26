import React from 'react';
import { X } from 'lucide-react';

/**
 * ScienceModal Component
 * Documents the scientific validity and mathematical sonification transfer functions
 * connecting official NASA Earth Observation datasets to Tone.js acoustic parameters.
 */
export default function ScienceModal({ isOpen, onClose, theme = 'dark' }) {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="science-modal-title"
    >
      <div className={`relative w-full max-w-3xl max-h-[85vh] overflow-y-auto border rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
          : 'bg-zinc-950 border-white/10 text-white shadow-red-950/40'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b mb-6 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-8 bg-[#ef233c] rounded-sm shrink-0" />
            <div>
              <h2 id="science-modal-title" className={`text-xl sm:text-2xl font-bold tracking-tight font-manrope ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Scientific Sonification Methodology
              </h2>
              <p className={`text-xs font-manrope uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                NASA EIC to Tone.js Mathematical Transfer Functions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-zinc-300 hover:text-white'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className={`space-y-4 text-sm font-manrope ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
          <p className="leading-relaxed text-sm font-manrope">
            TerraSonus rejects random noise generation in favor of deterministic mathematical transfer functions. 
            Every pitch, filter sweep, chime arpeggio, and pulse interval is directly calculated from peer-reviewed NASA Earth Observation datasets.
          </p>

          {/* Formulas Grid */}
          <div className="space-y-4">
            {/* Formula 1 */}
            <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-black border-zinc-800 hover:border-zinc-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className={`font-semibold text-sm sm:text-base tracking-tight flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef233c]" />
                  1. Surface Temperature Anomaly to Root Drone Pitch
                </span>
                <span className="text-xs text-[#ef233c] font-manrope font-medium">NASA GISTEMP v4</span>
              </div>
              <div className={`p-3 sm:p-3.5 rounded-lg border font-manrope text-xs sm:text-sm font-medium ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
              }`}>
                f(ΔT) = f₀ &times; 2^(ΔT / 12) &nbsp;&nbsp;<span className={isLight ? 'text-slate-500 font-normal' : 'text-zinc-400 font-normal'}>[Where f₀ = 55.0 Hz (A1)]</span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed font-manrope ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Maps surface temperature anomalies logarithmically across chromatic pitch space. A baseline anomaly of 0.0°C produces a steady 55 Hz A1 sub-bass drone; rising anomalies in warming regions audibly shift the fundamental pitch higher.
              </p>
            </div>

            {/* Formula 2 */}
            <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-black border-zinc-800 hover:border-zinc-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className={`font-semibold text-sm sm:text-base tracking-tight flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  2. Wind Speed to Resonant Filter Cutoff
                </span>
                <span className="text-xs text-blue-500 font-manrope font-medium">NASA POWER / GEOS-FP</span>
              </div>
              <div className={`p-3 sm:p-3.5 rounded-lg border font-manrope text-xs sm:text-sm font-medium ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
              }`}>
                f_c = 250 + 3550 &times; ((W - W_min) / (W_max - W_min)) Hz &nbsp;&nbsp;<span className={isLight ? 'text-slate-500 font-normal' : 'text-zinc-400 font-normal'}>[Q = 2.5]</span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed font-manrope ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Surface wind velocity dynamically sweeps a 24 dB/octave resonant low-pass filter over pink noise. Calm doldrums yield muted, warm textures, while high-velocity jet streams and storms open high-frequency harmonic breath.
              </p>
            </div>

            {/* Formula 3 */}
            <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-black border-zinc-800 hover:border-zinc-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className={`font-semibold text-sm sm:text-base tracking-tight flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  3. Biosphere Vegetation (NDVI) to Pentatonic Chimes
                </span>
                <span className="text-xs text-emerald-500 font-manrope font-medium">MODIS Terra/Aqua</span>
              </div>
              <div className={`p-3 sm:p-3.5 rounded-lg border font-manrope text-xs sm:text-sm font-medium ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
              }`}>
                Scale: [A3, C4, D4, E4, G4, A4, C5, D5, E5, G5] | Velocity = 0.2 + 0.6 &times; NDVI
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed font-manrope ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Normalized Difference Vegetation Index (NDVI) quantizes polyphonic chime notes into an A Minor / C Major Pentatonic harmonic space. Dense canopies trigger crystalline cascading notes; arid zones produce sparse, muted intervals.
              </p>
            </div>

            {/* Formula 4 */}
            <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-black border-zinc-800 hover:border-zinc-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className={`font-semibold text-sm sm:text-base tracking-tight flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  4. Thermal Anomalies to Percussive Tempo
                </span>
                <span className="text-xs text-amber-500 font-manrope font-medium">VIIRS Active Fire / FIRMS</span>
              </div>
              <div className={`p-3 sm:p-3.5 rounded-lg border font-manrope text-xs sm:text-sm font-medium ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
              }`}>
                Interval = 2800 - (fireIndex &times; 2400) ms &nbsp;&nbsp;<span className={isLight ? 'text-slate-500 font-normal' : 'text-zinc-400 font-normal'}>[Tempo: 21 to 150 BPM]</span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed font-manrope ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Active thermal hot spots and wildfire biomass burning indices control the tempo of a deep sub-bass membrane pulse, conveying environmental stress and urgency to the listener.
              </p>
            </div>
          </div>

          {/* Harmonic Constraint Guarantee */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
            isLight ? 'bg-red-50/70 border-red-200 text-slate-800' : 'bg-red-950/20 border-[#ef233c]/30 text-zinc-200'
          }`}>
            <span className="font-bold text-[#ef233c] font-manrope uppercase tracking-wider block mb-1 text-xs">
              Harmonic Aesthetic Guarantee
            </span>
            By restricting audio frequencies to integer pentatonic quantization and anchoring drones to low-frequency sub-bass fundamentals, TerraSonus guarantees that sonification always remains musical, evocative, and non-dissonant.
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t flex justify-end ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-950/60"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
