import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { nasaCredits } from '../data/nasaDatasets.js';

/**
 * CreditsModal Component
 * Strict compliance with NASA Space Apps Challenge Data Attribution requirements.
 * Displays official mission names, hosting centers, DOIs, and direct dataset links.
 */
export default function CreditsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 text-white shadow-2xl shadow-red-950/40">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-8 bg-[#ef233c] rounded-sm shrink-0" />
            <div>
              <h2 id="credits-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight font-serif-instrument text-white">
                NASA Open Data Attribution & Credits
              </h2>
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                Official Space Agency Datasets and Observational Products
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm text-zinc-300 font-inter">
          <p className="text-zinc-300 leading-relaxed text-sm">
            TerraSonus is powered entirely by open data from the National Aeronautics and Space Administration (NASA) and partner space agencies. 
            All planetary metrics, satellite imagery, and atmospheric telemetry are publicly accessible under open science mandates.
          </p>

          {/* Credits Table / Cards */}
          <div className="space-y-3">
            {creditList.map((item) => (
              <div 
                key={item.key} 
                className="p-4 sm:p-5 rounded-xl bg-black border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-white text-sm sm:text-base">
                    {item.name}
                  </span>
                  <span className="text-xs text-[#ef233c] font-mono font-medium">
                    {item.agency}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-inter">
                  {item.description}
                </p>
                <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-400 font-mono">
                    Product: {item.product}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Dataset Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Open Science & Accessibility Statement */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-[#ef233c]/30 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <span className="font-bold text-[#ef233c] font-mono uppercase tracking-wider block mb-1 text-xs">
              NASA Open Science & Accessibility
            </span>
            Developed as an open-source platform providing multi-sensory Earth science accessibility, STEM education, and planetary telemetry sonification for all audiences.
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
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
