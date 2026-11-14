import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { nasaCredits } from '../data/nasaDatasets.js';

/**
 * CreditsModal Component
 * Strict compliance with NASA Space Apps Challenge Data Attribution requirements.
 * Displays official mission names, hosting centers, DOIs, and direct dataset links.
 */
export default function CreditsModal({ isOpen, onClose, theme = 'dark' }) {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  const creditList = Object.entries(nasaCredits).map(([key, item]) => ({
    key,
    ...item
  }));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-modal-title"
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
              <h2 id="credits-modal-title" className={`text-xl sm:text-2xl font-bold tracking-tight font-serif-instrument ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                NASA Open Data Attribution & Credits
              </h2>
              <p className={`text-xs font-mono uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                Official Space Agency Datasets and Observational Products
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
        <div className={`space-y-4 text-sm font-inter ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
          <p className="leading-relaxed text-sm">
            TerraSonus is powered entirely by open data from the National Aeronautics and Space Administration (NASA) and partner space agencies. 
            All planetary metrics, satellite imagery, and atmospheric telemetry are publicly accessible under open science mandates.
          </p>

          {/* Credits Table / Cards */}
          <div className="space-y-3">
            {creditList.map((item) => (
              <div 
                key={item.key} 
                className={`p-4 sm:p-5 rounded-xl border transition-colors space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900' : 'bg-black border-zinc-800 hover:border-zinc-700 text-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className={`font-semibold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.name}
                  </span>
                  <span className="text-xs text-[#ef233c] font-mono font-medium">
                    {item.agency}
                  </span>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed font-inter ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  {item.description}
                </p>
                <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Product: {item.product}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
                      isLight ? 'text-sky-600 hover:text-sky-700' : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                  >
                    Dataset Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Open Science & Accessibility Statement */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
            isLight ? 'bg-red-50/60 border-[#ef233c]/30 text-slate-700' : 'bg-zinc-900/50 border-[#ef233c]/30 text-zinc-300'
          }`}>
            <span className="font-bold text-[#ef233c] font-mono uppercase tracking-wider block mb-1 text-xs">
              NASA Open Science & Accessibility
            </span>
            Developed as an open-source platform providing multi-sensory Earth science accessibility, STEM education, and planetary telemetry sonification for all audiences.
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t flex justify-end ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-950/60"
          >
            Close Credits
          </button>
        </div>
      </div>
    </div>
  );
}
