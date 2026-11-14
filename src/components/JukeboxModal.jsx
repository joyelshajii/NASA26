import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Disc, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  Layers, 
  Calendar,
  Globe,
  Compass
} from 'lucide-react';

/**
 * JukeboxModal Component
 * Comprehensive catalog vault for all curated Earth Jukebox sonification tracks.
 * Allows users to browse, filter, inspect scientific telemetry, and launch planetary tracks.
 */
export default function JukeboxModal({
  isOpen,
  onClose,
  planetaryStories = [],
  activeStoryId = null,
  onSelectStory = () => {},
  isPlaying = false,
  togglePlay = () => {},
  theme = 'dark'
}) {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'All Tracks' },
    { id: 'CRYOSPHERE', label: 'Cryosphere' },
    { id: 'BIOSPHERE', label: 'Biosphere' },
    { id: 'HYDROSPHERE', label: 'Oceans' },
    { id: 'ATMOSPHERE', label: 'Atmosphere' },
    { id: 'AEROSOLS', label: 'Aerosols & Dust' },
    { id: 'ANTHROPOCENE', label: 'Anthropocene' }
  ];

  const filteredStories = selectedFilter === 'ALL'
    ? planetaryStories
    : planetaryStories.filter(s => s.theme === selectedFilter);

  const handleTrackClick = (storyId) => {
    onSelectStory(storyId);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl animate-fade-up ${
        isLight ? 'bg-slate-900/50' : 'bg-black/85'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="jukebox-catalog-title"
    >
      <div className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60' 
          : 'bg-zinc-950/95 border-white/10 text-white shadow-[0_0_80px_rgba(239,35,60,0.25)]'
      }`}>

        {/* Ambient atmospheric glow */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isLight ? 'bg-red-400/10' : 'bg-[#ef233c]/15'
        }`} />

        {/* Header */}
        <div className={`relative z-10 flex items-start justify-between pb-5 border-b mb-6 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isLight 
                ? 'bg-red-50 border-red-200 text-[#ef233c]' 
                : 'bg-gradient-to-tr from-[#ef233c]/30 to-zinc-900 border-[#ef233c]/50 text-[#ef233c] shadow-[0_0_20px_rgba(239,35,60,0.3)]'
            }`}>
              <Disc className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ef233c]/10 border border-[#ef233c]/20 text-[10px] font-manrope text-[#ef233c] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> Earth Jukebox &bull; Complete Track Vault
              </div>
              <h2 id="jukebox-catalog-title" className={`text-2xl sm:text-3xl font-bold tracking-tight font-manrope ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Planetary Sonification Catalog
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-900' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
            aria-label="Close Jukebox Catalog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Educational Concept Banner */}
        <div className={`relative z-10 p-4 sm:p-5 rounded-2xl border mb-6 text-xs sm:text-sm font-manrope leading-relaxed ${
          isLight 
            ? 'bg-slate-50 border-slate-200 text-slate-700' 
            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
        }`}>
          <strong className={isLight ? 'text-slate-900' : 'text-white'}>What is an Earth Jukebox Track?</strong> Each curated track pairs NASA Earth Information Center multi-spectral satellite imagery with a guided, multi-decadal timeline journey. When activated, the 3D globe navigates to the target ecosystem, the synthesizer voices align with satellite telemetry, and historical milestones scrub automatically to sonify planetary transformation over time.
        </div>

        {/* Filter Tabs */}
        <div className="relative z-10 flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold font-manrope transition-all cursor-pointer ${
                selectedFilter === cat.id
                  ? 'bg-[#ef233c] text-white shadow-md shadow-red-950/40'
                  : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Track Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredStories.map((story) => {
            const isCurrent = activeStoryId === story.id;
            return (
              <div
                key={story.id}
                className={`group relative overflow-hidden rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? isLight
                      ? 'bg-red-50/60 border-[#ef233c] ring-2 ring-[#ef233c]/30 shadow-lg'
                      : 'bg-zinc-900/80 border-[#ef233c] ring-2 ring-[#ef233c]/30 shadow-[0_0_30px_rgba(239,35,60,0.2)]'
                    : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                      : 'bg-black/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/40'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isLight 
                        ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                        : 'bg-white/10 text-zinc-300 border border-white/10'
                    }`}>
                      {story.theme || 'PLANETARY'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#ef233c] font-manrope font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{story.years ? story.years.join(' → ') : 'Multi-Decadal'}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-base sm:text-lg font-bold font-manrope mb-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {story.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed mb-3.5 font-manrope ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    {story.details || story.description}
                  </p>

                  {/* Sonification Profile Box */}
                  {story.sonificationProfile && (
                    <div className={`p-3 rounded-xl border mb-4 text-[11px] font-manrope space-y-1.5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/70 border-zinc-800'
                    }`}>
                      <div className="flex items-center gap-1.5 font-semibold text-[#ef233c]">
                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Lead Voice: {story.sonificationProfile.leadInstrument}</span>
                      </div>
                      <div className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
                        {story.sonificationProfile.harmonicBehavior}
                      </div>
                    </div>
                  )}

                  {/* NASA Citations */}
                  {story.nasaSources && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {story.nasaSources.map((src, i) => (
                        <span 
                          key={i} 
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-zinc-400'
                          }`}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                  <span className="text-xs font-manrope text-zinc-400">
                    {isCurrent ? (
                      <span className="flex items-center gap-1.5 text-[#ef233c] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#ef233c] animate-ping" />
                        Active in Jukebox
                      </span>
                    ) : (
                      'Guided Acoustic Tour'
                    )}
                  </span>

                  <button
                    onClick={() => handleTrackClick(story.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold font-manrope transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                      isCurrent
                        ? 'bg-[#ef233c] text-white shadow-red-950/50 hover:bg-red-700'
                        : isLight
                          ? 'bg-slate-900 hover:bg-black text-white hover:shadow-lg'
                          : 'bg-white/10 hover:bg-[#ef233c] text-white hover:shadow-[0_0_20px_rgba(239,35,60,0.5)] border border-white/10'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Playing Now</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Track</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`relative z-10 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-manrope ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-zinc-400'
        }`}>
          <div>
            Showing {filteredStories.length} of {planetaryStories.length} curated NASA EIC sonification tracks
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-full border font-semibold transition-colors cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
            }`}
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
}
