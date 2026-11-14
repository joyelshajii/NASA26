import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Activity,
  Sparkles,
  Thermometer,
  Droplets,
  Flame,
  Info,
  Calendar,
  Waves,
  ArrowUpRight,
  Repeat,
  Compass,
  X
} from 'lucide-react';

import { 
  historicalTimeSeries, 
  climateMilestones, 
  climateEpochs 
} from '../data/nasaDatasets.js';

/**
 * Maps a temperature anomaly to an authentic Warming Stripes color
 */
function getStripeColor(tempAnomaly) {
  if (tempAnomaly < 0.20) return '#1d4ed8'; // deep ocean blue
  if (tempAnomaly < 0.35) return '#2563eb'; // blue
  if (tempAnomaly < 0.50) return '#38bdf8'; // sky cyan
  if (tempAnomaly < 0.65) return '#e2e8f0'; // neutral white-slate
  if (tempAnomaly < 0.85) return '#f59e0b'; // amber
  if (tempAnomaly < 1.05) return '#f97316'; // orange
  if (tempAnomaly < 1.25) return '#ef4444'; // red
  return '#ef233c'; // fiery crimson
}

export default function ClimateTimeline({
  currentYear,
  setCurrentYear,
  currentData,
  currentTelemetry,
  isPlaying,
  togglePlay,
  audioLevel = 0.0,
  harmonicEngine = null,
  setShowScienceModal,
  setShowCreditsModal,
  activeRegion,
  theme = 'dark'
}) {
  const isLight = theme === 'light';
  // Metric Display Mode in the Warming Stripes Visualizer
  const [selectedMetric, setSelectedMetric] = useState('tempAnomaly'); // 'tempAnomaly' | 'co2Ppm' | 'arcticIceExtent' | 'oceanHeatContent'
  
  // Auto-Scrubbing Playback Engine
  const [isAutoScrubbing, setIsAutoScrubbing] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2, 4
  const [isLooping, setIsLooping] = useState(true);

  // Active milestone inspection drawer
  const [activeMilestone, setActiveMilestone] = useState(null);

  // Hover states for warming stripes chart
  const [hoveredData, setHoveredData] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Refs for smooth animation
  const ribbonRef = useRef(null);
  const autoScrubAnimRef = useRef(null);
  const lastTimeRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Calculate live sub-bass acoustic frequency
  const droneFreq = useMemo(() => {
    return (55 * Math.pow(2, currentTelemetry.tempAnomaly / 12)).toFixed(1);
  }, [currentTelemetry.tempAnomaly]);

  // Baseline deltas from 1980
  const baselineDeltas = useMemo(() => {
    const baseline = historicalTimeSeries[0];
    return {
      tempDelta: Number((currentData.tempAnomaly - baseline.tempAnomaly).toFixed(2)),
      co2Delta: Number((currentData.co2Ppm - baseline.co2Ppm).toFixed(1)),
      co2Pct: Number((((currentData.co2Ppm - baseline.co2Ppm) / baseline.co2Ppm) * 100).toFixed(1)),
      iceDelta: Number((currentData.arcticIceExtent - baseline.arcticIceExtent).toFixed(2)),
      icePct: Number((((currentData.arcticIceExtent - baseline.arcticIceExtent) / baseline.arcticIceExtent) * 100).toFixed(1)),
      oceanDelta: Number((currentData.oceanHeatContent - baseline.oceanHeatContent).toFixed(1))
    };
  }, [currentData]);

  // Active Epoch based on currentYear
  const activeEpoch = useMemo(() => {
    const yr = Math.round(currentYear);
    return climateEpochs.find(e => yr >= e.range[0] && yr <= e.range[1]) || climateEpochs[climateEpochs.length - 1];
  }, [currentYear]);

  // Auto-Scrubbing Playback Engine Loop
  useEffect(() => {
    if (!isAutoScrubbing) {
      if (autoScrubAnimRef.current) {
        cancelAnimationFrame(autoScrubAnimRef.current);
        autoScrubAnimRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const advanceTimeline = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Base speed: 2.8 years per second at 1x
      const yearsPerSecond = 2.8 * playbackSpeed;
      const yearIncrement = deltaTime * yearsPerSecond;

      setCurrentYear((prev) => {
        const next = prev + yearIncrement;
        if (next >= 2026) {
          if (isLooping) {
            return 1980;
          } else {
            setIsAutoScrubbing(false);
            return 2026;
          }
        }
        return next;
      });

      autoScrubAnimRef.current = requestAnimationFrame(advanceTimeline);
    };

    autoScrubAnimRef.current = requestAnimationFrame(advanceTimeline);

    return () => {
      if (autoScrubAnimRef.current) {
        cancelAnimationFrame(autoScrubAnimRef.current);
      }
    };
  }, [isAutoScrubbing, playbackSpeed, isLooping, setCurrentYear]);

  // Jump to specific milestone
  const handleJumpToMilestone = useCallback((m) => {
    setCurrentYear(m.year);
    setActiveMilestone(m);
    if (isPlaying && harmonicEngine && typeof harmonicEngine.triggerChime === 'function') {
      const chimeIdx = Math.floor(Math.random() * 8);
      harmonicEngine.triggerChime(chimeIdx);
    }
  }, [setCurrentYear, isPlaying, harmonicEngine]);

  // Quick navigation helpers
  const handleStepYear = (step) => {
    setCurrentYear((prev) => Math.max(1980, Math.min(2026, Math.round(prev + step))));
  };

  const handleResetTo1980 = () => {
    setCurrentYear(1980);
    setActiveMilestone(climateMilestones[0]);
  };

  const handleJumpTo2026 = () => {
    setCurrentYear(2026);
    setActiveMilestone(climateMilestones[climateMilestones.length - 1]);
  };

  // Click & Drag scrubber handler directly on warming stripes chart
  const handleRibbonInteract = useCallback((e) => {
    if (!ribbonRef.current) return;
    const rect = ribbonRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = clickX / rect.width;
    const calculatedYear = 1980 + ratio * (2026 - 1980);
    setCurrentYear(Number(calculatedYear.toFixed(1)));
  }, [setCurrentYear]);

  const handleMouseDownRibbon = (e) => {
    isDraggingRef.current = true;
    handleRibbonInteract(e);

    const handleMouseMove = (moveEvent) => {
      if (isDraggingRef.current) {
        handleRibbonInteract(moveEvent);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Hover inspection over Warming Stripes chart
  const handleRibbonMouseMove = (e) => {
    if (!ribbonRef.current) return;
    const rect = ribbonRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = x / rect.width;
    const yearFloat = 1980 + ratio * (2026 - 1980);
    const roundedYear = Math.round(yearFloat);
    const data = historicalTimeSeries.find(d => d.year === roundedYear) || historicalTimeSeries[0];
    const milestone = climateMilestones.find(m => m.year === roundedYear);

    setHoveredData({ ...data, milestone });
    setHoverPosition({ x, y: e.clientY - rect.top });
  };

  const handleRibbonMouseLeave = () => {
    if (!isDraggingRef.current) {
      setHoveredData(null);
    }
  };

  // Position percentage for scrubber thumb
  const scrubberPercent = useMemo(() => {
    return Math.max(0, Math.min(100, ((currentYear - 1980) / (2026 - 1980)) * 100));
  }, [currentYear]);

  // Metric calculation helpers for chart bar height
  const getBarHeightPercent = useCallback((item, metric) => {
    switch (metric) {
      case 'tempAnomaly': {
        const norm = (item.tempAnomaly - 0.10) / (1.35 - 0.10);
        return Math.max(18, Math.min(100, 18 + norm * 82));
      }
      case 'co2Ppm': {
        const norm = (item.co2Ppm - 335) / (428 - 335);
        return Math.max(20, Math.min(100, 20 + norm * 80));
      }
      case 'arcticIceExtent': {
        const loss = 8.0 - item.arcticIceExtent;
        const norm = loss / (8.0 - 3.5);
        return Math.max(22, Math.min(100, 22 + norm * 78));
      }
      case 'oceanHeatContent': {
        const norm = (item.oceanHeatContent - (-20)) / (370 - (-20));
        return Math.max(15, Math.min(100, 15 + norm * 85));
      }
      default:
        return 50;
    }
  }, []);

  return (
    <div className="w-full">
      {/* Time Machine Master Console Box */}
      <div className={`p-6 sm:p-8 lg:p-10 border rounded-3xl mb-12 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900'
          : 'bg-zinc-950/90 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white'
      }`}>
        
        {/* Subtle Ambient Background Gradient reacting to Temperature & Audio */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700"
          style={{
            opacity: isLight ? (0.12 + audioLevel * 0.15) : (0.2 + audioLevel * 0.25),
            background: currentData.tempAnomaly > 1.0 
              ? 'radial-gradient(circle, #ef233c 0%, transparent 70%)' 
              : currentData.tempAnomaly > 0.6 
                ? 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' 
                : 'radial-gradient(circle, #38bdf8 0%, transparent 70%)'
          }}
        />

        {/* 1. Header: Observation Epoch, Telemetry Readout & Transport Hub */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b relative z-10 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs uppercase tracking-wider font-semibold ${
                isLight ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                NASA Observation Epoch (1980&ndash;2026)
              </span>
              {activeRegion && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                  isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-white/5 text-zinc-400 border-white/10'
                }`}>
                  <Compass className="w-3 h-3 text-[#ef233c]" />
                  <span>Regional Focus: <strong className={isLight ? 'text-slate-900' : 'text-zinc-200'}>{activeRegion.name}</strong></span>
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-baseline gap-4">
              <span className={`text-4xl sm:text-5xl font-black font-manrope tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {Math.round(currentYear)}
              </span>
              <span className={`text-sm font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                ({currentYear.toFixed(1)} Continuous Telemetry)
              </span>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Era Status:</span>
                <span className="font-semibold" style={{ color: activeEpoch.color }}>
                  {activeEpoch.status}
                </span>
              </div>
            </div>
          </div>

          {/* Time Machine Playback Transport Controls */}
          <div className={`flex flex-wrap items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-2xl border ${
            isLight ? 'bg-slate-100/90 border-slate-200/80' : 'bg-black/60 border-white/10'
          }`}>
            {/* Auto-Scrub Play / Pause */}
            <button
              onClick={() => setIsAutoScrubbing(!isAutoScrubbing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-manrope text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                isAutoScrubbing
                  ? 'bg-[#ef233c] text-white shadow-red-950/80 animate-pulse'
                  : (isLight 
                      ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm' 
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/10')
              }`}
              title={isAutoScrubbing ? 'Pause timeline sweep' : 'Auto-sweep across 47 years'}
            >
              {isAutoScrubbing ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Sweep</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Sweep 47 Yrs</span>
                </>
              )}
            </button>

            {/* Step Controls */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-white/5 border-white/5'
            }`}>
              <button
                onClick={() => handleStepYear(-1)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-950' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                }`}
                title="Step backward 1 year"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepYear(1)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-950' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                }`}
                title="Step forward 1 year"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Presets */}
            <div className={`hidden sm:flex items-center gap-1 p-1 rounded-xl border text-[11px] font-mono ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-white/5 border-white/5'
            }`}>
              {[0.5, 1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? (isLight ? 'bg-slate-900 text-white font-bold shadow-xs' : 'bg-white/20 text-white font-bold')
                      : (isLight ? 'text-slate-600 hover:text-slate-950' : 'text-zinc-400 hover:text-zinc-200')
                  }`}
                  title={`${spd}x playback speed`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-xl transition-all cursor-pointer text-xs font-mono flex items-center gap-1 border ${
                isLooping
                  ? (isLight ? 'bg-white text-slate-900 border-slate-300 shadow-xs' : 'bg-white/10 text-white border-white/20')
                  : (isLight ? 'text-slate-400 border-transparent hover:text-slate-700' : 'text-zinc-500 border-transparent hover:text-zinc-300')
              }`}
              title={isLooping ? 'Loop Mode: ON' : 'Loop Mode: OFF'}
            >
              <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'text-[#ef233c]' : ''}`} />
            </button>

            {/* Reset / Jump to endpoints */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetTo1980}
                className={`p-2 rounded-xl transition-colors cursor-pointer text-xs font-mono ${
                  isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-950' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                }`}
                title="Jump to 1980 Baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleJumpTo2026}
                className={`p-2 rounded-xl transition-colors cursor-pointer text-xs font-mono font-semibold ${
                  isLight ? 'text-[#ef233c] hover:bg-red-50' : 'text-[#ef233c] hover:bg-[#ef233c]/10'
                }`}
                title="Jump to 2026 Present Day"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Audio Live Sonification Connection Pill */}
            <div className={`ml-auto pl-2 sm:pl-3 border-l flex items-center gap-2 ${
              isLight ? 'border-slate-300' : 'border-white/10'
            }`}>
              <button
                onClick={togglePlay}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isPlaying
                    ? (isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]')
                    : (isLight ? 'bg-slate-200/90 text-slate-700 hover:bg-slate-300 border border-slate-300' : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700')
                }`}
                title={isPlaying ? 'Audio active - modulating with timeline' : 'Click to start sonification audio'}
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span className="hidden md:inline font-bold">Drone {droneFreq} Hz</span>
                    <span className="md:hidden">Audio On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Connect Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Four Interactive Vital Sign Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 relative z-10">
          {/* Card 1: Global Temperature Anomaly */}
          <div
            onClick={() => setSelectedMetric('tempAnomaly')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedMetric === 'tempAnomaly'
                ? (isLight ? 'bg-red-50/50 border-[#ef233c] shadow-md shadow-red-100 ring-1 ring-[#ef233c]/40' : 'bg-zinc-900/90 border-[#ef233c] shadow-[0_0_20px_rgba(239,35,60,0.15)] ring-1 ring-[#ef233c]/50')
                : (isLight ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs' : 'bg-black/40 border-white/5 hover:border-white/20')
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-mono mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-[#ef233c]" />
                TEMP ANOMALY
              </span>
              <span className={`text-[10px] uppercase ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>GISTEMP v4</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                +{currentData.tempAnomaly.toFixed(2)}&deg;C
              </span>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="text-[#ef233c] font-semibold">
                ▲ +{baselineDeltas.tempDelta > 0 ? baselineDeltas.tempDelta : 0}&deg;C
              </span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>since 1980</span>
            </div>
          </div>

          {/* Card 2: Atmospheric CO2 */}
          <div
            onClick={() => setSelectedMetric('co2Ppm')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedMetric === 'co2Ppm'
                ? (isLight ? 'bg-amber-50/50 border-[#f59e0b] shadow-md shadow-amber-100 ring-1 ring-[#f59e0b]/40' : 'bg-zinc-900/90 border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-[#f59e0b]/50')
                : (isLight ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs' : 'bg-black/40 border-white/5 hover:border-white/20')
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-mono mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
                ATMOSPHERIC CO2
              </span>
              <span className={`text-[10px] uppercase ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Mauna Loa</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {currentData.co2Ppm.toFixed(1)}
              </span>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>ppm</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="text-[#f59e0b] font-semibold">
                ▲ +{baselineDeltas.co2Delta} ppm
              </span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>(+{baselineDeltas.co2Pct}%)</span>
            </div>
          </div>

          {/* Card 3: Arctic Sea Ice Extent */}
          <div
            onClick={() => setSelectedMetric('arcticIceExtent')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedMetric === 'arcticIceExtent'
                ? (isLight ? 'bg-sky-50/50 border-[#38bdf8] shadow-md shadow-sky-100 ring-1 ring-[#38bdf8]/40' : 'bg-zinc-900/90 border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-[#38bdf8]/50')
                : (isLight ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs' : 'bg-black/40 border-white/5 hover:border-white/20')
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-mono mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Droplets className="w-3.5 h-3.5 text-[#38bdf8]" />
                ARCTIC SEA ICE
              </span>
              <span className={`text-[10px] uppercase ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>NSIDC Min</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {currentData.arcticIceExtent.toFixed(2)}
              </span>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>M km&sup2;</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="text-[#0284c7] font-semibold">
                ▼ {baselineDeltas.iceDelta} M km&sup2;
              </span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>({baselineDeltas.icePct}%)</span>
            </div>
          </div>

          {/* Card 4: Ocean Heat Uptake */}
          <div
            onClick={() => setSelectedMetric('oceanHeatContent')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedMetric === 'oceanHeatContent'
                ? (isLight ? 'bg-purple-50/50 border-purple-400 shadow-md shadow-purple-100 ring-1 ring-purple-400/40' : 'bg-zinc-900/90 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-400/50')
                : (isLight ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs' : 'bg-black/40 border-white/5 hover:border-white/20')
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-mono mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Waves className="w-3.5 h-3.5 text-purple-500" />
                OCEAN HEAT
              </span>
              <span className={`text-[10px] uppercase ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>0-2000m</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {currentData.oceanHeatContent > 0 ? '+' : ''}{currentData.oceanHeatContent.toFixed(1)}
              </span>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>ZJ</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              <span className="text-purple-600 font-semibold">
                ▲ +{baselineDeltas.oceanDelta} ZJ
              </span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>uptake</span>
            </div>
          </div>
        </div>

        {/* 3. The Centerpiece: Interactive Warming Stripes & Climate Ribbon */}
        <div className="mb-6 relative z-10">
          {/* Ribbon View Mode Toggle & Metric Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs font-mono">
            <div className={`flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <Activity className="w-3.5 h-3.5 text-[#ef233c]" />
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>47-YEAR CLIMATE STRIPES & WAVEFORM RIBBON</span>
              <span className={`hidden sm:inline ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>&bull; Click or scrub anywhere along the ribbon</span>
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/60 border-white/10'
            }`}>
              <button
                onClick={() => setSelectedMetric('tempAnomaly')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'tempAnomaly'
                    ? 'bg-[#ef233c] text-white font-bold shadow'
                    : (isLight ? 'text-slate-600 hover:text-slate-950' : 'text-zinc-400 hover:text-white')
                }`}
              >
                &Delta;T Anomaly
              </button>
              <button
                onClick={() => setSelectedMetric('co2Ppm')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'co2Ppm'
                    ? 'bg-[#f59e0b] text-white font-bold shadow'
                    : (isLight ? 'text-slate-600 hover:text-slate-950' : 'text-zinc-400 hover:text-white')
                }`}
              >
                CO2 PPM
              </button>
              <button
                onClick={() => setSelectedMetric('arcticIceExtent')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'arcticIceExtent'
                    ? 'bg-[#38bdf8] text-white font-bold shadow'
                    : (isLight ? 'text-slate-600 hover:text-slate-950' : 'text-zinc-400 hover:text-white')
                }`}
              >
                Ice Loss
              </button>
              <button
                onClick={() => setSelectedMetric('oceanHeatContent')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'oceanHeatContent'
                    ? 'bg-purple-500 text-white font-bold shadow'
                    : (isLight ? 'text-slate-600 hover:text-slate-950' : 'text-zinc-400 hover:text-white')
                }`}
              >
                Ocean Heat
              </button>
            </div>
          </div>

          {/* The Warming Stripes Canvas / Interactive Ribbon */}
          <div
            ref={ribbonRef}
            onMouseDown={handleMouseDownRibbon}
            onMouseMove={handleRibbonMouseMove}
            onMouseLeave={handleRibbonMouseLeave}
            className="relative h-28 sm:h-36 w-full bg-black/80 rounded-2xl border border-white/10 overflow-hidden cursor-crosshair select-none group shadow-inner"
          >
            {/* Background Grid Lines (1980, 1990, 2000, 2010, 2020, 2026) */}
            <div className="absolute inset-0 pointer-events-none flex justify-between px-2 text-[10px] font-mono text-zinc-600 border-b border-white/5 z-0">
              <div className="h-full border-l border-white/5 pl-1 pt-1">1980</div>
              <div className="h-full border-l border-white/5 pl-1 pt-1">1990</div>
              <div className="h-full border-l border-white/5 pl-1 pt-1">2000</div>
              <div className="h-full border-l border-white/5 pl-1 pt-1">2010</div>
              <div className="h-full border-l border-white/5 pl-1 pt-1">2020</div>
              <div className="h-full border-r border-white/5 pr-1 pt-1">2026</div>
            </div>

            {/* 47 Individual Annual Stripes / Bars */}
            <div className="absolute inset-0 flex items-end px-1 gap-[1px] sm:gap-[2px] z-10">
              {historicalTimeSeries.map((item) => {
                const isPastOrCurrent = item.year <= currentYear;
                const isCurrent = Math.round(currentYear) === item.year;
                const barHeight = getBarHeightPercent(item, selectedMetric);
                const stripeColor = getStripeColor(item.tempAnomaly);
                const milestone = climateMilestones.find(m => m.year === item.year);

                return (
                  <div
                    key={item.year}
                    className="relative flex-1 flex flex-col justify-end h-full group/bar transition-all"
                    style={{
                      opacity: isPastOrCurrent ? 1 : 0.35
                    }}
                  >
                    {/* Milestone Pin Dot on top of bar */}
                    {milestone && (
                      <div 
                        className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-black z-20 ${
                          isCurrent ? 'bg-white ring-2 ring-[#ef233c] animate-ping' : 'bg-amber-400'
                        }`}
                      />
                    )}

                    {/* Bar Fill */}
                    <div
                      className="w-full rounded-t-sm transition-all duration-300 relative"
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: stripeColor,
                        boxShadow: isCurrent 
                          ? `0 0 15px ${stripeColor}` 
                          : isPastOrCurrent 
                            ? `0 0 5px ${stripeColor}40` 
                            : 'none'
                      }}
                    >
                      {/* Audio reactive pulse effect on active bar */}
                      {isCurrent && isPlaying && (
                        <div
                          className="absolute inset-x-0 -top-1 h-1.5 bg-white rounded-full animate-pulse"
                          style={{
                            boxShadow: '0 0 10px #ffffff'
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Laser Scrubber Reticle Line */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30 transition-all duration-75"
              style={{
                left: `${scrubberPercent}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Vertical Laser Beam */}
              <div 
                className="w-[2px] h-full bg-white relative transition-all"
                style={{
                  boxShadow: `0 0 ${12 + audioLevel * 10}px #ef233c`
                }}
              >
                {/* Top Reticle Triangle */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ef233c] rotate-45 border border-white" />
                {/* Bottom Reticle Dot */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#ef233c]" />
              </div>
            </div>

            {/* Hover Tooltip HUD over chart */}
            {hoveredData && (
              <div
                className={`absolute z-40 pointer-events-none px-3 py-2 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3 border ${
                  isLight
                    ? 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-300/60'
                    : 'bg-zinc-900/95 border-white/20 text-white'
                }`}
                style={{
                  left: `${hoverPosition.x}px`,
                  top: `${Math.max(25, hoverPosition.y)}px`
                }}
              >
                <div className={`flex items-center gap-2 font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Calendar className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>{hoveredData.year}</span>
                  {hoveredData.milestone && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#ef233c]/20 text-[#ef233c] font-normal border border-[#ef233c]/30">
                      {hoveredData.milestone.category}
                    </span>
                  )}
                </div>
                <div className={`space-y-0.5 text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  <div className="flex justify-between gap-4">
                    <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>Temp Anomaly:</span>
                    <span className={`font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>+{hoveredData.tempAnomaly}&deg;C</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>CO2 Level:</span>
                    <span className="text-[#f59e0b] font-bold">{hoveredData.co2Ppm} ppm</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>Arctic Ice:</span>
                    <span className="text-[#0284c7] font-bold">{hoveredData.arcticIceExtent} M km&sup2;</span>
                  </div>
                </div>
                {hoveredData.milestone && (
                  <div className={`mt-1.5 pt-1.5 border-t text-[10px] italic max-w-xs ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-zinc-400'
                  }`}>
                    {hoveredData.milestone.title}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Precision Range Seeker Slider with Floating HUD */}
        <div className="relative pt-6 pb-2 mb-8 z-10">
          
          {/* Floating Telemetry Badge that moves directly with the thumb */}
          <div
            className="absolute top-0 pointer-events-none transition-all duration-75"
            style={{
              left: `${scrubberPercent}%`,
              transform: scrubberPercent > 82
                ? 'translateX(-90%) translateY(-4px)'
                : scrubberPercent < 18
                  ? 'translateX(-10%) translateY(-4px)'
                  : 'translateX(-50%) translateY(-4px)'
            }}
          >
            <div className={`border text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              isLight
                ? 'bg-white border-[#ef233c] text-slate-900 shadow-lg shadow-red-200/50'
                : 'bg-black/95 border-[#ef233c] text-white shadow-[0_0_15px_rgba(239,35,60,0.4)]'
            }`}>
              <span className="text-[#ef233c] font-black">{Math.round(currentYear)}</span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>&bull;</span>
              <span>+{currentData.tempAnomaly.toFixed(2)}&deg;C</span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>&bull;</span>
              <span className="text-emerald-500 font-bold">{droneFreq} Hz</span>
            </div>
            {/* Pointer arrow */}
            <div 
              className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#ef233c] mt-0.5"
              style={{
                marginLeft: scrubberPercent > 82 ? '85%' : scrubberPercent < 18 ? '15%' : 'auto',
                marginRight: scrubberPercent > 82 ? '0' : scrubberPercent < 18 ? 'auto' : 'auto'
              }}
            />
          </div>

          {/* Range Slider Track */}
          <div className="relative">
            <input
              type="range"
              min="1980"
              max="2026"
              step="0.1"
              value={currentYear}
              onChange={(e) => setCurrentYear(parseFloat(e.target.value))}
              className={`w-full h-3 rounded-full appearance-none cursor-pointer accent-[#ef233c] focus:outline-none ring-1 shadow-inner ${
                isLight ? 'bg-slate-200 ring-slate-300' : 'bg-zinc-900 ring-white/10'
              }`}
              style={{
                background: `linear-gradient(to right, #38bdf8 0%, #60a5fa 25%, #f59e0b 55%, #ef233c ${scrubberPercent}%, ${isLight ? '#cbd5e1' : '#27272a'} ${scrubberPercent}%, ${isLight ? '#e2e8f0' : '#18181b'} 100%)`
              }}
              aria-label="Historical climate observation timeline slider from 1980 to 2026"
            />
          </div>

          {/* Precision Tick Mark Ruler */}
          <div className={`flex justify-between text-[11px] font-mono pt-3 px-1 select-none ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}>
            <button 
              onClick={() => setCurrentYear(1980)} 
              className={`transition-colors cursor-pointer text-left ${isLight ? 'hover:text-slate-950' : 'hover:text-white'}`}
            >
              <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>1980</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Baseline</div>
            </button>
            <button 
              onClick={() => setCurrentYear(1988)} 
              className={`hidden sm:block transition-colors cursor-pointer text-center ${isLight ? 'hover:text-slate-950' : 'hover:text-white'}`}
            >
              <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>1988</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Hansen</div>
            </button>
            <button 
              onClick={() => setCurrentYear(1997)} 
              className={`transition-colors cursor-pointer text-center ${isLight ? 'hover:text-slate-950' : 'hover:text-white'}`}
            >
              <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>1997</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Kyoto</div>
            </button>
            <button 
              onClick={() => setCurrentYear(2007)} 
              className={`hidden md:block transition-colors cursor-pointer text-center ${isLight ? 'hover:text-slate-950' : 'hover:text-white'}`}
            >
              <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>2007</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Ice Shock</div>
            </button>
            <button 
              onClick={() => setCurrentYear(2015)} 
              className={`transition-colors cursor-pointer text-center ${isLight ? 'hover:text-slate-950' : 'hover:text-white'}`}
            >
              <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>2015</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Paris</div>
            </button>
            <button 
              onClick={() => setCurrentYear(2023)} 
              className={`hidden sm:block transition-colors cursor-pointer text-center ${isLight ? 'hover:text-slate-950' : 'hover:text-white'}`}
            >
              <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>2023</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Super-Heat</div>
            </button>
            <button 
              onClick={() => setCurrentYear(2026)} 
              className={`transition-colors cursor-pointer text-right ${isLight ? 'hover:text-slate-950' : 'hover:text-white'}`}
            >
              <div className="font-bold text-[#ef233c]">2026</div>
              <div className="text-[10px] text-[#ef233c]/80 font-semibold">Present</div>
            </button>
          </div>
        </div>

        {/* 5. Interactive Milestone Inflection Pins */}
        <div className={`mb-6 pt-4 border-t relative z-10 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              KEY CLIMATE INFLECTION MILESTONES (CLICK TO JUMP & AUDIT)
            </span>
            <span className={`hidden sm:inline ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>NASA & IPCC Historical Benchmarks</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {climateMilestones.map((m) => {
              const isActive = Math.round(currentYear) === m.year;
              return (
                <button
                  key={m.year}
                  onClick={() => handleJumpToMilestone(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? (isLight
                          ? 'bg-red-50 text-slate-950 border-[#ef233c] shadow-sm ring-1 ring-[#ef233c]'
                          : 'bg-zinc-800 text-white border-[#ef233c] shadow-[0_0_15px_rgba(239,35,60,0.3)] ring-1 ring-[#ef233c]')
                      : (isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-950'
                          : 'bg-black/60 text-zinc-400 border-white/10 hover:border-white/25 hover:text-zinc-200')
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="font-bold">{m.year}</span>
                  <span className={`text-[11px] hidden sm:inline ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>&bull; {m.tag}</span>
                </button>
              );
            })}
          </div>

          {/* Active Milestone Expanded Context Box */}
          {activeMilestone && (
            <div className={`mt-4 p-4 rounded-2xl border animate-fade-up relative ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm' : 'bg-white/5 border-white/10 text-white'
            }`}>
              <button
                onClick={() => setActiveMilestone(null)}
                className={`absolute top-3 right-3 p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200' : 'text-zinc-500 hover:text-white hover:bg-white/10'
                }`}
                title="Dismiss milestone view"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1.5">
                <span 
                  className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold"
                  style={{ backgroundColor: `${activeMilestone.color}25`, color: activeMilestone.color }}
                >
                  {activeMilestone.category} &bull; {activeMilestone.year}
                </span>
                <span className={`text-xs font-bold font-manrope ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {activeMilestone.title}
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                {activeMilestone.description}
              </p>
              <div className={`flex flex-wrap items-center gap-4 text-xs font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span>Temp Anomaly: <strong className={isLight ? 'text-slate-900' : 'text-white'}>+{activeMilestone.temp}&deg;C</strong></span>
                <span>CO2: <strong className="text-[#f59e0b]">{activeMilestone.co2} ppm</strong></span>
                <span>Arctic Ice: <strong className="text-[#0284c7]">{activeMilestone.arctic} M km&sup2;</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Dynamic Climate Epoch Intelligence Banner & Narrative */}
        <div className={`p-5 sm:p-6 rounded-2xl border relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isLight ? 'bg-slate-50/90 border-slate-200 text-slate-900 shadow-xs' : 'bg-black/80 border-white/10 text-white'
        }`}>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-3 h-3 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: activeEpoch.color }}
              />
              <h4 className={`text-sm sm:text-base font-bold font-manrope ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {activeEpoch.epochName}
              </h4>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              {activeEpoch.narrative}
            </p>
            <div className={`flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-xl border ${
              isLight ? 'bg-white text-slate-700 border-slate-200 shadow-xs' : 'bg-white/5 text-zinc-400 border-white/5'
            }`}>
              <Waves className="w-4 h-4 text-[#ef233c] shrink-0" />
              <span>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>Acoustic Signature:</strong> {activeEpoch.acousticNote}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setShowScienceModal(true)}
              className={`py-2 px-4 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Inspect Science Model</span>
            </button>
            <button
              onClick={() => setShowCreditsModal(true)}
              className={`py-2 px-4 rounded-xl text-xs font-mono transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/5'
              }`}
            >
              <span>NASA Citations</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
