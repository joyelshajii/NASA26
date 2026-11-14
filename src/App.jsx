import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Pause, 
  Play,
  Eye, 
  ChevronRight, 
  ArrowRight,
  Headphones,
  X,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  Disc
} from 'lucide-react';

import EarthGlobe from './components/EarthGlobe.jsx';
import AudioVisualizer from './components/AudioVisualizer.jsx';
import ScienceModal from './components/ScienceModal.jsx';
import CreditsModal from './components/CreditsModal.jsx';
import SoundGuideModal from './components/SoundGuideModal.jsx';
import SoundLegendBar from './components/SoundLegendBar.jsx';
import ClimateTimeline from './components/ClimateTimeline.jsx';
import JukeboxModal from './components/JukeboxModal.jsx';

import { harmonicEngine } from './audio/HarmonicEngine.js';
import { 
  regionalHotspots, 
  planetaryStories, 
  interpolateYearData 
} from './data/nasaDatasets.js';

export default function App() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('terrasonus_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });
  const isLight = theme === 'light';

  useEffect(() => {
    try {
      localStorage.setItem('terrasonus_theme', theme);
    } catch {}
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setScreenReaderAnnouncement(`Switched to ${next} theme mode.`);
      return next;
    });
  }, []);

  // Playback & Audio States
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedListening, setHasStartedListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.0);

  // Planetary Exploration States
  const [currentYear, setCurrentYear] = useState(2026);
  const [activeRegionId, setActiveRegionId] = useState('amazon');
  const [activeStoryId, setActiveStoryId] = useState(null);

  // Modals & Accessibility States
  const [showScienceModal, setShowScienceModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showSoundGuideModal, setShowSoundGuideModal] = useState(false);
  const [showJukeboxModal, setShowJukeboxModal] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Floating scroll-down invitation cue (auto-hides once the user scrolls)
  const [showFloatingScrollCue, setShowFloatingScrollCue] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowFloatingScrollCue(false);
      } else {
        setShowFloatingScrollCue(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Headphones Recommendation States
  // Centered entrance announcement modal (displays on entering)
  const [showHeadphonesEntranceModal, setShowHeadphonesEntranceModal] = useState(true);

  // Clear any persistent suppression and announce on entering
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('terrasonus_headphones_seen');
    }
    setScreenReaderAnnouncement('Notice: Wearing headphones is strongly recommended for full spatial clarity and planetary sonification.');
  }, []);
  // Quick status pill/toast when listening begins
  const [showHeadphonesBanner, setShowHeadphonesBanner] = useState(false);
  const headphonesTimerRef = useRef(null);

  // Trigger brief floating notification when listening starts
  const triggerListeningHeadphonesToast = useCallback(() => {
    setShowHeadphonesBanner(true);
    if (headphonesTimerRef.current) {
      clearTimeout(headphonesTimerRef.current);
    }
    headphonesTimerRef.current = setTimeout(() => {
      setShowHeadphonesBanner(false);
    }, 7000);
  }, []);

  // Animation frame loop ref
  const animFrameRef = useRef(null);
  const storyTimerRef = useRef(null);

  // Find active region object
  const activeRegion = useMemo(() => {
    return regionalHotspots.find((r) => r.id === activeRegionId) || regionalHotspots[0];
  }, [activeRegionId]);

  // Current year interpolated data
  const currentData = useMemo(() => {
    return interpolateYearData(currentYear);
  }, [currentYear]);

  // Synthesized current telemetry (combining regional baseline and historical year anomaly)
  const currentTelemetry = useMemo(() => {
    return {
      tempAnomaly: activeRegion ? Number((activeRegion.tempAnomaly * (currentData.tempAnomaly / 1.35)).toFixed(2)) : currentData.tempAnomaly,
      windSpeed: activeRegion ? activeRegion.windSpeed : 7.2,
      ndvi: activeRegion ? activeRegion.ndvi : 0.48,
      fireIndex: activeRegion ? activeRegion.fireIndex : currentData.wildfireIndex,
      co2Ppm: currentData.co2Ppm
    };
  }, [activeRegion, currentData]);

  // Centralized Blind & Low-Vision Accessibility narration and mode toggle
  const toggleAccessibilityMode = useCallback(() => {
    setIsAccessibilityMode((prev) => {
      const nextState = !prev;
      const msg = nextState
        ? 'Blind and low-vision access started. Speech narration enabled.'
        : 'Blind and low-vision access ended. Speech narration disabled.';
      
      setScreenReaderAnnouncement(msg);

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(msg);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window._activeUtterance = utterance;
          utterance.onend = () => { window._activeUtterance = null; };
          utterance.onerror = () => { window._activeUtterance = null; };
          window.speechSynthesis.speak(utterance);
        } catch {
          // Ignore speech synthesis failures
        }
      }

      return nextState;
    });
  }, []);

  // Text-to-Speech Announcement helper for Accessibility
  const speakText = useCallback((text, force = false) => {
    if ((!isAccessibilityMode && !force) || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window._activeUtterance = utterance;
      utterance.onend = () => { window._activeUtterance = null; };
      utterance.onerror = () => { window._activeUtterance = null; };
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis failures
    }
  }, [isAccessibilityMode]);

  // Scroll to the visual stage (globe & bento stage)
  const scrollToVisualStage = useCallback(() => {
    const stage = document.getElementById('interactive-stage') || document.getElementById('bento-stage');
    if (stage) {
      const navOffset = 72;
      const elementPosition = stage.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - navOffset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Master Audio Toggle
  const togglePlay = useCallback(async () => {
    if (!isPlaying) {
      // Close entrance modal if open, show listening toast, and smooth scroll to visual stage
      setShowHeadphonesEntranceModal(false);
      triggerListeningHeadphonesToast();
      scrollToVisualStage();
      try {
        await harmonicEngine.init();
        try {
          const savedVol = localStorage.getItem('terrasonus_volume');
          if (savedVol !== null && !isNaN(Number(savedVol))) {
            harmonicEngine.setVolume(Number(savedVol) / 100);
          }
        } catch {}
        harmonicEngine.setTelemetry(currentTelemetry);
        harmonicEngine.start();
        setIsPlaying(true);
        setHasStartedListening(true);
        const msg = `Audio playback started. Headphones recommended for full spatial clarity. Year: ${Math.round(currentYear)}. Region: ${activeRegion.name}. Surface temperature anomaly: ${currentTelemetry.tempAnomaly} degrees Celsius.`;
        setScreenReaderAnnouncement(msg);
        speakText(msg);
      } catch (err) {
        console.error('Failed to start audio engine:', err);
      }
    } else {
      harmonicEngine.stop();
      setIsPlaying(false);
      setScreenReaderAnnouncement('Audio playback stopped.');
    }
  }, [isPlaying, currentTelemetry, currentYear, activeRegion, speakText, scrollToVisualStage, triggerListeningHeadphonesToast]);

  // Synchronize telemetry with harmonic engine whenever state changes
  useEffect(() => {
    if (isPlaying) {
      harmonicEngine.setTelemetry(currentTelemetry);
    }
  }, [currentTelemetry, isPlaying]);

  // Audio level polling for 3D atmospheric reactivity
  useEffect(() => {
    let isRunning = true;
    const updateLevel = () => {
      if (!isRunning) return;
      if (isPlaying) {
        const freqData = harmonicEngine.getFrequencyData();
        if (freqData && freqData.length > 0) {
          let sum = 0;
          for (let i = 0; i < 16; i++) {
            const val = Math.max(0, (freqData[i] + 90) / 80);
            sum += val;
          }
          const avg = sum / 16;
          setAudioLevel(Math.min(1.0, avg * 1.4));
        }
      } else {
        setAudioLevel(0.0);
      }
      animFrameRef.current = requestAnimationFrame(updateLevel);
    };

    animFrameRef.current = requestAnimationFrame(updateLevel);
    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Handle Region Selection
  const handleSelectRegion = useCallback((regionId) => {
    setActiveRegionId(regionId);
    setActiveStoryId(null);
    const region = regionalHotspots.find((r) => r.id === regionId);
    if (region) {
      const msg = `Selected region: ${region.name}. ${region.narrative}`;
      setScreenReaderAnnouncement(msg);
      speakText(msg);
    }
  }, [speakText]);

  // Handle Curated Planetary Story Activation
  const handleSelectStory = (storyId) => {
    if (activeStoryId === storyId) {
      // Stop story
      setActiveStoryId(null);
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
      return;
    }

    const story = planetaryStories.find((s) => s.id === storyId);
    if (!story) return;

    setActiveStoryId(storyId);

    // Map story to relevant hotspot
    if (story.hotspotId) {
      setActiveRegionId(story.hotspotId);
    } else if (story.id === 'arctic-retreat') {
      setActiveRegionId('arctic');
    } else if (story.id === 'amazon-pulse') {
      setActiveRegionId('amazon');
    } else if (story.id === 'marine-heatwaves') {
      setActiveRegionId('great-barrier-reef');
    } else if (story.id === 'carbon-trajectory') {
      setActiveRegionId('sahara');
    } else if (story.id === 'sahara-transatlantic') {
      setActiveRegionId('sahara');
    } else if (story.id === 'indus-monsoon') {
      setActiveRegionId('indus-gangetic');
    }

    if (!isPlaying) {
      togglePlay();
    } else {
      scrollToVisualStage();
    }

    const introMsg = `Playing curated story: ${story.title}. ${story.description}`;
    setScreenReaderAnnouncement(introMsg);
    speakText(introMsg);

    // Automated year progression
    let currentStep = 0;
    const yearSteps = story.years;
    setCurrentYear(yearSteps[0]);

    if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    storyTimerRef.current = setInterval(() => {
      currentStep++;
      if (currentStep < yearSteps.length) {
        const nextYear = yearSteps[currentStep];
        setCurrentYear(nextYear);
      } else {
        clearInterval(storyTimerRef.current);
        setActiveStoryId(null);
      }
    }, 6000);
  };

  // Cleanup story timer on unmount
  useEffect(() => {
    return () => {
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    };
  }, []);

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (showHeadphonesEntranceModal) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          setShowHeadphonesEntranceModal(false);
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentYear((prev) => Math.min(2026, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentYear((prev) => Math.max(1980, prev - 1));
      } else if (e.key === 'a' || e.key === 'A') {
        toggleAccessibilityMode();
      } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        setShowSoundGuideModal((prev) => !prev);
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (regionalHotspots[idx]) {
          handleSelectRegion(regionalHotspots[idx].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSelectRegion, toggleAccessibilityMode, showHeadphonesEntranceModal]);

  return (
    <div className={`min-h-screen font-manrope relative overflow-x-hidden transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900 selection:bg-[#ef233c] selection:text-white' : 'bg-black text-white selection:bg-[#ef233c] selection:text-white'
    } ${isAccessibilityMode ? 'contrast-125' : ''}`}>
      
      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isLight ? 'bg-gradient-to-b from-sky-50/70 via-slate-50 to-slate-100' : 'bg-gradient-to-b from-[#1a0505] to-black'
        }`}></div>
        {!isLight && (
          <>
            <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]"></div>
            <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]"></div>
          </>
        )}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-all ${
          isLight ? 'w-[600px] h-[600px] bg-sky-200/30' : 'w-[800px] h-[800px] bg-red-600/5'
        }`}></div>
        <div className={`absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_80%)] ${
          isLight 
            ? 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]'
        }`}></div>
      </div>

      {/* Top Blur Header */}
      <div className="gradient-blur"></div>

      {/* Screen Reader ARIA Live Region for Accessibility */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 pt-5 sm:pt-6 px-4">
        <nav className={`max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between rounded-full px-5 sm:px-6 py-2.5 sm:py-3 transition-all ${
          isLight 
            ? 'bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/60' 
            : 'bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl'
        }`}>
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0 mr-4 lg:mr-8">
            <img 
              src="/favicon.svg" 
              alt="TerraSonus" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
            />
            <span className={`text-base sm:text-lg font-bold font-manrope tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              TerraSonus
            </span>
          </div>
          
          {/* Navigation Links - Single line, balanced spacing, no wrapping */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-manrope">
            <button 
              id="nav-sound-guide-link"
              onClick={() => setShowSoundGuideModal(true)} 
              className={`text-xs xl:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sound Guide
            </button>
            <button 
              id="nav-product-link"
              onClick={() => setShowScienceModal(true)} 
              className={`text-xs xl:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Science & Math
            </button>
            <button 
              id="nav-solutions-link"
              onClick={() => setShowCreditsModal(true)} 
              className={`text-xs xl:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              NASA Open Data
            </button>
            <a 
              id="nav-resources-link"
              href="https://science.nasa.gov/earth/earth-information-center/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Earth Info Center
            </a>
            <a 
              id="nav-timeline-link"
              href="#timeline-section" 
              className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Time Machine
            </a>
          </div>

          {/* Right Action & Utility Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Button (Light/Dark Mode) replacing old Headset icon on header */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={isLight ? 'Switch to Dark Theme' : 'Switch to White Theme'}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-amber-500/10 border-amber-300 text-amber-600 hover:bg-amber-500/20 shadow-xs' 
                  : 'bg-white/5 border-white/10 text-amber-300 hover:text-white hover:border-amber-400/50'
              }`}
              aria-label={isLight ? 'Switch to Dark Theme' : 'Switch to White Theme'}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Accessibility Speech Narration Toggle - Prominent, Noticeable Pill with Name */}
            <button
              id="header-accessibility-btn"
              onClick={toggleAccessibilityMode}
              title={isAccessibilityMode ? 'Disable Blind & Low-Vision Access (Keyboard: A)' : 'Enable Blind & Low-Vision Access (Keyboard: A)'}
              className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full border text-xs font-semibold font-manrope transition-all cursor-pointer shadow-sm ${
                isAccessibilityMode 
                  ? 'bg-[#ef233c] text-white border-[#ef233c] shadow-[0_0_16px_rgba(239,35,60,0.5)] ring-2 ring-red-400/40' 
                  : isLight
                    ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100 hover:border-red-300 hover:text-red-950'
                    : 'bg-red-950/40 border-red-500/40 text-red-200 hover:bg-red-900/50 hover:border-red-400 hover:text-white shadow-[0_0_12px_rgba(239,35,60,0.2)]'
              }`}
              aria-label={isAccessibilityMode ? 'Disable Blind and Low-Vision Access (Keyboard shortcut A)' : 'Enable Blind and Low-Vision Access (Keyboard shortcut A)'}
              aria-pressed={isAccessibilityMode}
            >
              <Eye className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110 ${
                isAccessibilityMode ? 'text-white' : 'text-[#ef233c]'
              }`} />
              <span className="hidden sm:inline font-bold whitespace-nowrap">
                Blind Access
              </span>
              <span className="sm:hidden font-bold whitespace-nowrap">
                Blind
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase transition-colors ${
                isAccessibilityMode
                  ? 'bg-white/25 text-white'
                  : isLight
                    ? 'bg-red-200/80 text-red-900'
                    : 'bg-red-500/25 text-red-300'
              }`}>
                {isAccessibilityMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Subtle Divider */}
            <div className={`hidden sm:block h-4 w-[1px] mx-0.5 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}></div>

            {/* Primary Action Button (Listen/Pause) */}
            <button 
              id="nav-get-access-btn" 
              onClick={togglePlay}
              className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-4 sm:px-5 py-2 transition-transform active:scale-95 cursor-pointer whitespace-nowrap shadow-sm ${
                isLight ? 'bg-slate-900 text-white' : 'bg-white/5'
              }`}
            >
              {!isLight && (
                <>
                  <span className="absolute inset-0 border border-white/10 rounded-full"></span>
                  <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#ef233c_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute inset-[1px] rounded-full bg-black"></span>
                </>
              )}
              <span className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-[#ef233c] text-[#ef233c]" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <span>Listen</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#ef233c]" />
                  </>
                )}
              </span>
            </button>

            {/* Mobile / Tablet Menu Button (< lg) */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className={`lg:hidden p-2 rounded-full border transition-all cursor-pointer ${
                isLight 
                  ? 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 shadow-xs' 
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:border-white/20'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-[#ef233c]" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden max-w-6xl mx-auto mt-2 p-4 rounded-2xl shadow-2xl animate-fade-up ${
            isLight 
              ? 'bg-white/95 backdrop-blur-2xl border border-slate-200 text-slate-800' 
              : 'bg-black/90 backdrop-blur-2xl border border-white/10 text-white'
          }`}>
            <div className="flex flex-col gap-1 font-manrope">
              <button 
                onClick={() => { setShowSoundGuideModal(true); setMobileMenuOpen(false); }} 
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/5 text-white'
                }`}
              >
                <span>Sound Guide</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
              <button 
                onClick={() => { setShowScienceModal(true); setMobileMenuOpen(false); }} 
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <span>Science & Math</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
              <button 
                onClick={() => { setShowCreditsModal(true); setMobileMenuOpen(false); }} 
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <span>NASA Open Data</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
              <button 
                onClick={() => { setShowJukeboxModal(true); setMobileMenuOpen(false); }} 
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-[#ef233c]" />
                  <span>Earth Jukebox Vault</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30">
                  6 TRACKS
                </span>
              </button>
              <a 
                href="https://science.nasa.gov/earth/earth-information-center/" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <span>Earth Info Center</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>
              <a 
                href="#timeline-section" 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <span>Time Machine</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>
              <button 
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} 
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
                  <span>Appearance</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-manrope font-bold uppercase ${
                  isLight ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white/10 text-zinc-300'
                }`}>
                  {isLight ? 'White Theme' : 'Dark Theme'}
                </span>
              </button>
              <button 
                onClick={() => { toggleAccessibilityMode(); setMobileMenuOpen(false); }} 
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#ef233c]" />
                  <span>Blind & Low-Vision Access</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-manrope ${isAccessibilityMode ? 'bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/40' : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-zinc-400')}`}>
                  {isAccessibilityMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6">
          <div className="text-center max-w-5xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md mb-8 animate-fade-up ${
              isLight ? 'bg-white/80 border-slate-200 text-slate-800 shadow-xs' : 'bg-white/5 border-white/10 text-red-100/90'
            }`} style={{ animationDelay: '0.1s' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]"></span>
              </span>
              <span className={`text-xs font-medium tracking-wide font-manrope ${
                isLight ? 'text-slate-700' : 'text-red-100/90'
              }`}>
                TerraSonus
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight font-manrope leading-[1.15] mb-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <span className={`block text-transparent bg-clip-text ${
                isLight ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-700' : 'bg-gradient-to-b from-white via-white to-white/50'
              }`}>
                Earth Intelligence
              </span>
              <span className={`block text-transparent bg-clip-text ${
                isLight ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-700' : 'bg-gradient-to-b from-white via-white to-white/50'
              }`}>
                for the <span className="text-[#ef233c] inline-block relative">
                  Future
                  <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#ef233c] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </span>
            </h1>

            <p className={`text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`} style={{ animationDelay: '0.3s' }}>
              TerraSonus translates multi-spectral NASA Earth Observation telemetry into real-time harmonic soundscapes for science, exploration, and accessibility.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <button id="hero-cta-btn" onClick={togglePlay} className="shiny-cta group cursor-pointer w-full sm:w-auto text-sm">
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-medium font-manrope">
                  {isPlaying ? 'Pause Acoustic Stream' : 'Start Acoustic Stream'} <ArrowRight className="transition-transform group-hover:translate-x-1 w-4 h-4 text-[#ef233c]" />
                </span>
              </button>

              <button 
                id="hero-sound-guide-btn" 
                onClick={() => setShowSoundGuideModal(true)} 
                className={`group px-5 py-3 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer font-manrope w-full sm:w-auto ${
                  isLight 
                    ? 'bg-white border border-slate-200 hover:border-[#ef233c]/60 text-slate-800 hover:text-slate-950 hover:bg-slate-50 shadow-md' 
                    : 'bg-white/5 border border-white/10 text-zinc-200 hover:text-white hover:bg-white/10 hover:border-[#ef233c]/40 shadow-lg'
                }`}
              >
                <span>What Are These Sounds?</span>
              </button>
              
              <button 
                id="hero-github-btn" 
                onClick={() => setShowScienceModal(true)} 
                className={`group px-5 py-3 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer font-manrope w-full sm:w-auto ${
                  isLight 
                    ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>Scientific Math</span>
              </button>
            </div>

            {/* Quick Blind & Low-Vision Access Hero Toggle */}
            <div className="mt-5 flex items-center justify-center animate-fade-up" style={{ animationDelay: '0.42s' }}>
              <button
                id="hero-accessibility-toggle-btn"
                onClick={toggleAccessibilityMode}
                className={`group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full border text-xs sm:text-sm font-manrope font-semibold transition-all cursor-pointer shadow-md ${
                  isAccessibilityMode
                    ? 'bg-[#ef233c] text-white border-[#ef233c] shadow-[0_0_22px_rgba(239,35,60,0.5)] ring-2 ring-red-400/50'
                    : isLight
                      ? 'bg-red-50/90 border-red-200 hover:border-red-400 text-red-900 hover:bg-red-100 shadow-xs'
                      : 'bg-red-950/30 border-red-500/40 hover:border-red-400 text-red-200 hover:bg-red-900/50 hover:text-white shadow-[0_0_14px_rgba(239,35,60,0.2)]'
                }`}
                title="Toggle Web Speech Narration & High Contrast Mode (Keyboard: A)"
                aria-pressed={isAccessibilityMode}
              >
                <div className={`p-1 rounded-full ${isAccessibilityMode ? 'bg-white/20' : 'bg-red-500/15'}`}>
                  <Eye className={`w-4 h-4 transition-transform group-hover:scale-110 ${isAccessibilityMode ? 'text-white' : 'text-[#ef233c]'}`} />
                </div>
                <span>
                  Blind &amp; Low-Vision Audio Narration: <strong className={isAccessibilityMode ? 'text-white underline' : 'text-[#ef233c]'}>{isAccessibilityMode ? 'ACTIVE (Speech On)' : 'Enable Speech (Key A)'}</strong>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  isAccessibilityMode ? 'bg-white/25 text-white' : (isLight ? 'bg-red-200/80 text-red-900' : 'bg-red-500/25 text-red-300')
                }`}>
                  {isAccessibilityMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Direct Stage Navigation Chips for First-Time Explorers */}
            <div className={`mt-8 pt-6 border-t flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 animate-fade-up ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`} style={{ animationDelay: '0.45s' }}>
              <span className={`text-xs font-medium mr-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Explore:
              </span>

              <button
                onClick={scrollToVisualStage}
                className={`px-3.5 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 text-zinc-300 hover:text-white'
                }`}
              >
                <span>3D Earth Globe</span>
                <span className={isLight ? 'text-slate-400 text-xs' : 'text-zinc-500 text-xs'}>&darr;</span>
              </button>

              <button
                onClick={scrollToVisualStage}
                className={`px-3.5 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 text-zinc-300 hover:text-white'
                }`}
              >
                <span>Sensor Telemetry</span>
                <span className={isLight ? 'text-slate-400 text-xs' : 'text-zinc-500 text-xs'}>&darr;</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('timeline-section');
                  if (el) {
                    const navOffset = 70;
                    const pos = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
                    window.scrollTo({ top: Math.max(0, pos), behavior: 'smooth' });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 text-zinc-300 hover:text-white'
                }`}
              >
                <span>Climate Time Machine</span>
                <span className={isLight ? 'text-slate-400 text-xs' : 'text-zinc-500 text-xs'}>&darr;</span>
              </button>

              <button
                onClick={() => setShowJukeboxModal(true)}
                className={`px-3.5 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 text-zinc-300 hover:text-white'
                }`}
              >
                <span>All 6 Jukebox Tracks</span>
                <span className={isLight ? 'text-slate-400 text-xs' : 'text-zinc-500 text-xs'}>&darr;</span>
              </button>
            </div>
          </div>

          {/* Logo Strip */}
          <div className={`w-full mt-20 border-y py-7 transition-all ${
            isLight 
              ? 'border-slate-200 bg-white/80 backdrop-blur-sm shadow-xs' 
              : 'border-white/5 bg-white/[0.02] backdrop-blur-sm opacity-70 hover:opacity-100'
          }`}>
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <p className={`text-xs font-bold tracking-widest uppercase shrink-0 font-manrope ${
                isLight ? 'text-slate-500' : 'text-zinc-500'
              }`}>
                Open NASA Telemetry:
              </p>
              <div className={`flex flex-wrap justify-center gap-6 md:gap-10 items-center w-full text-xs sm:text-sm ${
                isLight ? 'text-slate-700' : 'text-zinc-300'
              }`}>
                <div className="flex items-center gap-2 font-manrope font-semibold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/20 text-white'
                  }`}>GI</div>
                  NASA GISS
                </div>
                <div className="flex items-center gap-2 font-manrope font-semibold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/20 text-white'
                  }`}>MO</div>
                  MODIS Terra/Aqua
                </div>
                <div className="flex items-center gap-2 font-manrope font-semibold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/20 text-white'
                  }`}>VI</div>
                  VIIRS Active Fire
                </div>
                <div className="flex items-center gap-2 font-manrope font-semibold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/20 text-white'
                  }`}>PO</div>
                  NASA POWER
                </div>
                <div className="flex items-center gap-2 font-manrope font-semibold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/20 text-white'
                  }`}>EI</div>
                  Earth Info Center
                </div>
              </div>
            </div>
          </div>

          {/* Hero Bottom Interactive Scroll Down Prompt */}
          <div className="w-full flex flex-col items-center justify-center pt-8 pb-4 animate-fade-up" style={{ animationDelay: '0.55s' }}>
            <button
              onClick={scrollToVisualStage}
              className={`group flex flex-col items-center gap-2 transition-all cursor-pointer focus:outline-none ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
              aria-label="Scroll down to interactive 3D Globe and telemetry stage"
            >
              <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all backdrop-blur-md shadow-lg ${
                isLight 
                  ? 'bg-white/95 border-slate-200 group-hover:border-[#ef233c]/50 group-hover:bg-red-50/50 shadow-slate-200/50' 
                  : 'bg-white/[0.04] border-white/10 group-hover:border-[#ef233c]/50 group-hover:bg-[#ef233c]/10'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]"></span>
                </span>
                <span className={`text-[11px] font-manrope tracking-widest uppercase font-medium ${
                  isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-zinc-300 group-hover:text-white'
                }`}>
                  Scroll To Explore 3D Globe & Soundscapes
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#ef233c] group-hover:translate-y-1 transition-transform" />
              </div>

              {/* Animated Futuristic Mouse Wheel Indicator */}
              <div className={`w-5 h-8 rounded-full border flex items-start justify-center p-1 transition-colors shadow-sm ${
                isLight 
                  ? 'border-slate-300 group-hover:border-[#ef233c] bg-white' 
                  : 'border-white/20 group-hover:border-[#ef233c] bg-black/40 shadow-[0_0_15px_rgba(239,35,60,0.15)]'
              }`}>
                <div className="w-1.5 h-2 rounded-full bg-[#ef233c] animate-scroll-wheel" />
              </div>
            </button>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="interactive-stage" className="scroll-mt-24 py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14 text-center max-w-2xl mx-auto animate-fade-up">
              <h2 className={`text-3xl sm:text-4xl font-semibold tracking-tight font-manrope mb-3 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Planetary Sonification <span className="text-[#ef233c]">Platform</span>
              </h2>
              <p className={`text-sm sm:text-base font-normal leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                Experience real-time interactive telemetry transformed into harmonically balanced acoustic soundscapes.
              </p>
            </div>

            {/* Live Acoustic Legend Bar - What you are hearing */}
            <SoundLegendBar
              currentTelemetry={currentTelemetry}
              isPlaying={isPlaying}
              onOpenGuide={() => setShowSoundGuideModal(true)}
              harmonicEngine={harmonicEngine}
              theme={theme}
              togglePlay={togglePlay}
            />

            <div id="bento-stage" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto">
              {/* Main Feature Card: 3D Earth Globe */}
              <div className={`lg:col-span-2 lg:row-span-2 group relative overflow-hidden p-6 sm:p-7 border transition-all rounded-2xl flex flex-col min-h-[560px] ${
                isPlaying 
                  ? isLight 
                    ? 'border-[#ef233c]/40 bg-white shadow-xl shadow-red-500/10 ring-1 ring-[#ef233c]/30'
                    : 'border-[#ef233c]/40 bg-gradient-to-b from-zinc-900/60 via-black to-black shadow-[0_0_50px_rgba(239,35,60,0.18)] ring-1 ring-[#ef233c]/30' 
                  : isLight 
                    ? 'border-slate-200 bg-white shadow-md hover:border-slate-300'
                    : 'border-white/10 bg-gradient-to-b from-zinc-900/50 to-black hover:border-white/20'
              }`}>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        isLight ? 'text-slate-500' : 'text-zinc-400'
                      }`}>
                        Planetary 3D View
                      </span>
                      <span className={`text-[11px] font-manrope px-2 py-0.5 rounded-full border font-semibold ${
                        isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/5 text-zinc-300 border-white/10'
                      }`}>
                        Year {Math.round(currentYear)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className={`group flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold font-manrope transition-all cursor-pointer border shadow-md active:scale-95 ${
                          isPlaying
                            ? 'bg-[#ef233c] text-white border-[#ef233c] shadow-red-950/50 hover:bg-[#d90429]'
                            : (isLight 
                                ? 'bg-[#ef233c] hover:bg-[#d90429] text-white border-[#ef233c] shadow-md shadow-red-200' 
                                : 'bg-[#ef233c] hover:bg-[#d90429] text-white border-[#ef233c] shadow-[0_0_16px_rgba(239,35,60,0.4)] hover:shadow-[0_0_22px_rgba(239,35,60,0.6)]')
                        }`}
                        title={isPlaying ? 'Pause acoustic stream' : 'Start planetary acoustic sonification'}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current shrink-0" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current shrink-0" />
                            <span>Start</span>
                          </>
                        )}
                      </button>
                      <span className="text-xs font-manrope text-[#ef233c] font-semibold">
                        {isPlaying ? 'Audio Active' : 'Offline Topology'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className={`text-2xl font-semibold font-manrope mb-2 tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Planetary Coordinate Navigator
                  </h3>
                  <p className={`text-sm leading-relaxed mb-4 ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    High-contrast procedural WebGL globe with offline continental topology, audio-reactive atmospheric pulse, and interactive telemetry hotspots.
                  </p>

                  <div className={`flex-1 w-full relative min-h-[340px] my-2 rounded-xl overflow-hidden border ${
                    isLight ? 'border-slate-200' : 'border-white/5'
                  }`}>
                    <EarthGlobe
                      activeRegion={activeRegionId}
                      onSelectRegion={handleSelectRegion}
                      audioLevel={audioLevel}
                      autoRotateDefault={!isPlaying}
                      className="w-full h-full min-h-[340px]"
                      theme={theme}
                      isPlaying={isPlaying}
                      togglePlay={togglePlay}
                      currentYear={currentYear}
                    />
                  </div>

                  <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${
                    isLight ? 'border-slate-200' : 'border-white/10'
                  }`}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {regionalHotspots.map((r, idx) => (
                        <button
                          key={r.id}
                          onClick={() => handleSelectRegion(r.id)}
                          className={`px-3 py-1 rounded-full text-xs font-manrope tracking-wider uppercase transition-all cursor-pointer ${
                            activeRegionId === r.id 
                              ? 'bg-[#ef233c] text-white font-bold' 
                              : isLight 
                                ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200' 
                                : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {idx + 1}. {r.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-manrope text-[#ef233c]">
                      <span>EXPLORE</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #ef233c, transparent 70%)' }}></div>
              </div>

              {/* Feature 2: Telemetry Matrix */}
              <div className={`lg:col-span-2 group relative overflow-hidden p-6 sm:p-7 border transition-all rounded-xl flex flex-col justify-between ${
                isPlaying 
                  ? isLight 
                    ? 'border-[#ef233c]/40 bg-white shadow-xl shadow-red-500/10 ring-1 ring-[#ef233c]/30'
                    : 'border-[#ef233c]/40 bg-gradient-to-b from-zinc-900/60 via-black to-black shadow-[0_0_50px_rgba(239,35,60,0.18)] ring-1 ring-[#ef233c]/30' 
                  : isLight 
                    ? 'border-slate-200 bg-white shadow-md hover:border-slate-300'
                    : 'border-white/10 bg-black hover:border-white/20'
              }`}>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        isLight ? 'text-slate-500' : 'text-zinc-400'
                      }`}>
                        Active Sensor Feed
                      </span>
                      <span className={`text-[11px] font-manrope px-2 py-0.5 rounded-full border font-semibold ${
                        isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/5 text-zinc-300 border-white/10'
                      }`}>
                        Year {Math.round(currentYear)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-manrope ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        {activeRegion.coordinates[0].toFixed(2)}°N, {activeRegion.coordinates[1].toFixed(2)}°E
                      </span>
                    </div>
                  </div>

                  <h3 className={`text-xl sm:text-2xl font-semibold font-manrope mb-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {activeRegion.name} &mdash; Sensor Telemetry
                  </h3>
                  <p className={`text-sm mb-5 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    {activeRegion.narrative}
                  </p>

                  {/* 4 Sensor Metric Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className={`p-3.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-zinc-900/50 border-zinc-800'
                    }`}>
                      <div className="text-xs font-medium text-red-500 mb-1">
                        Temperature Anomaly
                      </div>
                      <div className={`text-lg sm:text-xl font-bold font-manrope ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        +{currentTelemetry.tempAnomaly}°C
                      </div>
                      <div className={`text-xs font-manrope mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-zinc-500'
                      }`}>
                        Drone Pitch: {Math.round(55 * Math.pow(2, currentTelemetry.tempAnomaly / 12))} Hz
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-zinc-900/50 border-zinc-800'
                    }`}>
                      <div className="text-xs font-medium text-blue-500 mb-1">
                        Wind Velocity
                      </div>
                      <div className={`text-lg sm:text-xl font-bold font-manrope ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {currentTelemetry.windSpeed} m/s
                      </div>
                      <div className={`text-xs font-manrope mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-zinc-500'
                      }`}>
                        Sweep Filter: {Math.round(250 + 3550 * (currentTelemetry.windSpeed / 15))} Hz
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-zinc-900/50 border-zinc-800'
                    }`}>
                      <div className="text-xs font-medium text-emerald-600 mb-1">
                        Canopy Vegetation (NDVI)
                      </div>
                      <div className={`text-lg sm:text-xl font-bold font-manrope ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {currentTelemetry.ndvi}
                      </div>
                      <div className={`text-xs font-manrope mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-zinc-500'
                      }`}>
                        Density: {Math.round(currentTelemetry.ndvi * 100)}%
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-zinc-900/50 border-zinc-800'
                    }`}>
                      <div className="text-xs font-medium text-amber-600 mb-1">
                        Active Fire Index
                      </div>
                      <div className={`text-lg sm:text-xl font-bold font-manrope ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {currentTelemetry.fireIndex}
                      </div>
                      <div className={`text-xs font-manrope mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-zinc-500'
                      }`}>
                        Pulse Tempo: {Math.round(60 + currentTelemetry.fireIndex * 80)} BPM
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className={`text-xs font-manrope ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Trigger harmonic chord:</span>
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          const randIdx = Math.floor(Math.random() * 8);
                          harmonicEngine.triggerChime(randIdx);
                        } else {
                          togglePlay();
                        }
                      }}
                      className={`px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer font-manrope ${
                        isLight 
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#ef233c]/40 text-white'
                      }`}
                    >
                      Harmonic Chime
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #3b82f6, transparent 70%)' }}></div>
              </div>

              {/* Feature 3: Curated Track 1 */}
              <div 
                onClick={() => handleSelectStory('arctic-retreat')}
                className={`group relative overflow-hidden p-6 sm:p-7 border transition-all rounded-xl cursor-pointer ${
                  activeStoryId === 'arctic-retreat' 
                    ? isLight 
                      ? 'border-[#ef233c] bg-white shadow-xl shadow-red-500/15 ring-1 ring-[#ef233c]/30' 
                      : 'border-[#ef233c] bg-zinc-900/40 shadow-[0_0_30px_rgba(239,35,60,0.15)]' 
                    : isLight 
                      ? 'border-slate-200 bg-white hover:border-slate-300 shadow-sm' 
                      : 'border-white/10 bg-black hover:border-white/20'
                }`}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-amber-700' : 'text-amber-400'
                    }`}>
                      Curated Story 01
                    </span>
                    <span className={`text-[10px] font-manrope px-2 py-0.5 rounded border ${
                      isLight 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                    }`}>
                      CRYOSPHERE
                    </span>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-semibold font-manrope mb-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Track: Arctic Ice Retreat
                  </h3>
                  <p className={`text-sm mb-4 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    Witness four decades of polar warming and sea ice decline through deterministic pitch transformation.
                  </p>
                  <div className="mt-auto flex items-center justify-between text-xs font-manrope">
                    <span className="text-[#ef233c] font-semibold">{activeStoryId === 'arctic-retreat' ? 'PLAYING NOW' : 'ACTIVATE STORY'}</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowJukeboxModal(true); }}
                      className={`text-[11px] font-semibold underline underline-offset-2 transition-colors cursor-pointer ${
                        isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      All 6 tracks &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature 4: Curated Track 2 */}
              <div 
                onClick={() => handleSelectStory('amazon-pulse')}
                className={`group relative overflow-hidden p-6 sm:p-7 border transition-all rounded-xl cursor-pointer ${
                  activeStoryId === 'amazon-pulse' 
                    ? isLight 
                      ? 'border-[#ef233c] bg-white shadow-xl shadow-red-500/15 ring-1 ring-[#ef233c]/30' 
                      : 'border-[#ef233c] bg-zinc-900/40 shadow-[0_0_30px_rgba(239,35,60,0.15)]' 
                    : isLight 
                      ? 'border-slate-200 bg-white hover:border-slate-300 shadow-sm' 
                      : 'border-white/10 bg-black hover:border-white/20'
                }`}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}>
                      Curated Story 02
                    </span>
                    <span className={`text-[10px] font-manrope px-2 py-0.5 rounded border ${
                      isLight 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                    }`}>
                      BIOSPHERE
                    </span>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-semibold font-manrope mb-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Track: Pulse of the Amazon
                  </h3>
                  <p className={`text-sm mb-4 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    Acoustic contrast between pristine biosphere canopy and encroaching drought and fire cycles.
                  </p>
                  <div className="mt-auto flex items-center justify-between text-xs font-manrope">
                    <span className="text-[#ef233c] font-semibold">{activeStoryId === 'amazon-pulse' ? 'PLAYING NOW' : 'ACTIVATE STORY'}</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowJukeboxModal(true); }}
                      className={`text-[11px] font-semibold underline underline-offset-2 transition-colors cursor-pointer ${
                        isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      All 6 tracks &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Earth Jukebox: Full Planetary Tracks Vault Banner */}
            <div className={`mt-5 p-5 sm:p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
              isLight 
                ? 'bg-gradient-to-r from-red-50/70 via-white to-slate-50 border-red-200/80 shadow-md shadow-red-500/5' 
                : 'bg-gradient-to-r from-red-950/30 via-zinc-950 to-zinc-900 border-[#ef233c]/30 shadow-[0_0_40px_rgba(239,35,60,0.12)]'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isLight 
                    ? 'bg-red-50 border-red-200 text-[#ef233c] shadow-xs' 
                    : 'bg-gradient-to-tr from-[#ef233c]/30 to-zinc-900 border-[#ef233c]/40 text-[#ef233c] shadow-[0_0_20px_rgba(239,35,60,0.25)]'
                }`}>
                  <Disc className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ef233c]/15 text-[#ef233c] font-bold border border-[#ef233c]/30 uppercase tracking-wider">
                      Earth Jukebox Vault &bull; 6 Curated Tracks
                    </span>
                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Automated Multi-Sensory Data Tours
                    </span>
                  </div>
                  <h4 className={`text-base sm:text-lg font-bold font-manrope ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Explore More Planetary Sonification Stories
                  </h4>
                  <p className={`text-xs sm:text-sm font-manrope mt-1 leading-relaxed max-w-2xl ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Beyond these 2 featured biomes, listen to guided sonifications for <strong>Global Marine Heatwaves</strong> (deep ocean thermal uptake), <strong>The Global Carbon Ascent</strong> (atmospheric CO₂), <strong>Sahara Dust &amp; Atlantic Winds</strong>, and the <strong>Indo-Gangetic Anthropocene Pulse</strong>.
                  </p>
                </div>
              </div>

              <button
                id="explore-jukebox-vault-btn"
                onClick={() => setShowJukeboxModal(true)}
                className="shrink-0 w-full md:w-auto px-6 py-3 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/50 hover:shadow-[0_0_25px_rgba(239,35,60,0.5)] active:scale-95 whitespace-nowrap"
              >
                <Disc className="w-4 h-4" />
                <span>Explore All 6 Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Climate Time Machine & Sonification Grid Section */}
        <section id="timeline-section" className={`py-20 sm:py-24 px-6 relative border-t transition-colors ${
          isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-black border-white/5'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl sm:text-4xl font-semibold font-manrope mb-3 tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Climate Time Machine & Sonification Grid
              </h2>
              <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                Scrub across 47 years of observation. Audibly detect the acceleration of planetary warming.
              </p>
            </div>

            {/* Interactive Climate Time Machine & Sonification Grid */}
            <ClimateTimeline
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
              currentData={currentData}
              currentTelemetry={currentTelemetry}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              audioLevel={audioLevel}
              harmonicEngine={harmonicEngine}
              setShowScienceModal={setShowScienceModal}
              setShowCreditsModal={setShowCreditsModal}
              activeRegion={activeRegion}
              theme={theme}
            />

            {/* 3 Sonification Voice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Voice 1: Thermal Drone */}
              <div className={`p-6 sm:p-7 border transition-all rounded-2xl flex flex-col ${
                isLight 
                  ? 'border-slate-200 bg-white shadow-md hover:border-slate-300' 
                  : 'border-zinc-800 bg-black hover:border-zinc-700'
              }`}>
                <h3 className={`text-lg sm:text-xl font-semibold font-manrope mb-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>Thermal Drone</h3>
                <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}>NASA GISTEMP v4 anomaly mapped to deterministic sub-bass frequency.</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl font-bold font-manrope ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {Math.round(55 * Math.pow(2, currentTelemetry.tempAnomaly / 12))}
                  </span>
                  <span className={`text-sm font-manrope ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Hz</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> f(&Delta;T) = 55.0 &times; 2^(&Delta;T/12)</li>
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> Continuous Bass Drone</li>
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> Low-Frequency Oscillator</li>
                </ul>
                <button 
                  id="voice-drone-btn" 
                  onClick={() => setShowScienceModal(true)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all font-manrope cursor-pointer border ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  Inspect Math
                </button>
              </div>

              {/* Voice 2: Biosphere Canopy */}
              <div className={`relative p-6 sm:p-7 border rounded-2xl flex flex-col md:-translate-y-1 z-10 transition-all ${
                isLight 
                  ? 'border-[#ef233c] bg-white shadow-xl shadow-red-500/15 ring-1 ring-[#ef233c]/20' 
                  : 'border-[#ef233c] bg-zinc-900/40 shadow-[0_0_30px_rgba(239,35,60,0.1)]'
              }`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ef233c] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-manrope">
                  Primary Voice
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold font-manrope mb-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>Biosphere Canopy</h3>
                <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}>MODIS NDVI vegetation quantized to an A Minor / C Pentatonic grid.</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl font-bold font-manrope ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {Math.round(currentTelemetry.ndvi * 100)}%
                  </span>
                  <span className={`text-sm font-manrope ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Density</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> Pentatonic Harmonic Space</li>
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> GEOS-FP Wind Filter Sweep</li>
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> Zero Dissonance Guarantee</li>
                </ul>
                <button 
                  id="voice-canopy-btn" 
                  onClick={() => {
                    if (isPlaying) {
                      const randIdx = Math.floor(Math.random() * 8);
                      harmonicEngine.triggerChime(randIdx);
                    } else {
                      togglePlay();
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-[#ef233c] hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all font-manrope cursor-pointer shadow-lg shadow-red-950/60"
                >
                  Trigger Chime
                </button>
              </div>

              {/* Voice 3: Thermal Pulse */}
              <div className={`p-6 sm:p-7 border transition-all rounded-2xl flex flex-col ${
                isLight 
                  ? 'border-slate-200 bg-white shadow-md hover:border-slate-300' 
                  : 'border-zinc-800 bg-black hover:border-zinc-700'
              }`}>
                <h3 className={`text-lg sm:text-xl font-semibold font-manrope mb-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>Thermal Fire Pulse</h3>
                <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}>VIIRS 375m active fire telemetry driving sub-bass membrane tempo.</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl font-bold font-manrope ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {Math.round(60 + currentTelemetry.fireIndex * 80)}
                  </span>
                  <span className={`text-sm font-manrope ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>BPM</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> Interval = 2800 &minus; 2400 &times; Fire Index ms</li>
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> Membrane Pulse Resonator</li>
                  <li className={`flex items-center gap-2 text-xs sm:text-sm ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}><span className="text-[#ef233c] font-bold select-none">&ndash;</span> Planetary Heartbeat Tempo</li>
                </ul>
                <button 
                  id="voice-pulse-btn" 
                  onClick={() => setShowCreditsModal(true)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all font-manrope cursor-pointer border ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  View NASA Citations
                </button>
              </div>
            </div>

            {/* Real-time Spectrum Visualizer */}
            <div className={`border rounded-2xl overflow-hidden shadow-2xl ${
              isLight ? 'border-slate-200 bg-white shadow-slate-200/50' : 'border-white/10 bg-black'
            }`}>
              <AudioVisualizer
                harmonicEngine={harmonicEngine}
                isPlaying={isPlaying}
                audioLevel={audioLevel}
                height={140}
                theme={isLight ? 'cyan' : 'crimson'}
                appTheme={theme}
                title="ACOUSTIC FREQUENCY SPECTRUM"
                subtitle="Real-time Tone.js FFT Analysis & Waveform Oscilloscope"
              />
            </div>
          </div>
        </section>

        {/* CTA Waitlist / Listen */}
        <section className={`py-20 sm:py-24 px-6 text-center border-t transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/40 border-white/5'
        }`}>
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl font-semibold font-manrope mb-3 tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Ready to <span className="text-[#ef233c]">Listen?</span>
            </h2>
            <p className={`text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              Experience planetary telemetry synthesized into real-time sound. Accessible, deterministic, and open source.
            </p>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                togglePlay();
              }}
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            >
              <input 
                type="text" 
                readOnly
                value={isPlaying ? `Playing: ${activeRegion.name}` : `Ready: ${activeRegion.name} (${Math.round(currentYear)})`} 
                className={`flex-1 rounded-full px-5 py-3 transition-all text-xs font-manrope border ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-800 focus:outline-none focus:border-[#ef233c]' 
                    : 'bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#ef233c]'
                }`}
              />
              <button 
                id="stream-submit-btn" 
                type="submit"
                className="bg-[#ef233c] hover:bg-red-700 text-white font-semibold rounded-full px-7 py-3 transition-all cursor-pointer font-manrope shadow-lg shadow-red-950/60 text-xs sm:text-sm"
              >
                {isPlaying ? 'Pause Audio' : 'Start Stream'}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t pt-16 pb-10 relative overflow-hidden transition-colors ${
        isLight ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-black border-zinc-900'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <img 
                src="/favicon.svg" 
                alt="TerraSonus" 
                className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]" 
              />
              <span className="text-2xl font-bold font-manrope tracking-tight text-white">TerraSonus</span>
            </div>
            <p className="text-zinc-400 max-w-xs leading-relaxed">
              Pioneering multi-sensory planetary observation through deterministic sonification, open satellite telemetry, and accessible scientific design.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">Platform</h4>
            <ul className="space-y-4 text-zinc-400 text-sm font-manrope">
              <li><button onClick={() => setShowSoundGuideModal(true)} id="footer-sound-guide-link" className="text-white hover:text-[#ef233c] font-semibold transition-colors cursor-pointer">Sound Guide & Tutorial</button></li>
              <li><button onClick={() => setShowJukeboxModal(true)} id="footer-jukebox-link" className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"><Disc className="w-3.5 h-3.5 text-[#ef233c]" /><span>Earth Jukebox Vault (6 Tracks)</span></button></li>
              <li><button onClick={() => setShowScienceModal(true)} id="footer-feat-link" className="hover:text-white transition-colors cursor-pointer">Science Methodology</button></li>
              <li><button onClick={() => setShowCreditsModal(true)} id="footer-int-link" className="hover:text-white transition-colors cursor-pointer">NASA Open Data</button></li>
              <li><a href="#timeline-section" id="footer-timeline-link" className="hover:text-white transition-colors">Time Machine</a></li>
              <li><a href="https://science.nasa.gov/earth/earth-information-center/" target="_blank" rel="noopener noreferrer" id="footer-docs-link" className="hover:text-white transition-colors">Earth Info Center</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">Accessibility</h4>
            <ul className="space-y-4 text-zinc-400 text-sm font-manrope">
              <li>
                <button 
                  onClick={toggleAccessibilityMode} 
                  id="footer-accessibility-btn" 
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left"
                >
                  <Eye className="w-3.5 h-3.5 text-[#ef233c] shrink-0" />
                  <span>Blind & Low-Vision Access</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-manrope uppercase ${isAccessibilityMode ? 'bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/40' : 'bg-white/5 text-zinc-500'}`}>
                    {isAccessibilityMode ? 'ON' : 'OFF'}
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowSoundGuideModal(true)} 
                  id="footer-spatial-audio-btn" 
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Headphones className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Sound Guide & Frequencies</span>
                </button>
              </li>
              <li>
                <span className="text-zinc-500 text-xs block leading-relaxed">
                  Keyboard: Press <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-manrope text-[10px]">A</kbd> for voice narration
                </span>
              </li>
              <li>
                <span className="text-zinc-500 text-xs block leading-relaxed">
                  ARIA live screen reader supported
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Huge Footer Text */}
        <div className="flex justify-center items-center py-4 opacity-[0.05] pointer-events-none">
          <h1 className="text-[14vw] leading-none font-bold font-manrope tracking-tight text-stroke select-none">TERRASONUS</h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-[10px] uppercase tracking-widest">
          <p>&copy; 2026 TerraSonus. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-manrope">
            <span id="social-twitter-link" className="text-zinc-400">GISTEMP v4</span>
            <span id="social-linkedin-link" className="text-zinc-400">MODIS NDVI</span>
            <span id="social-github-link" className="text-zinc-400">VIIRS Active Fire</span>
          </div>
        </div>
      </footer>

      {/* Prominent Center-Stage Headphones Entrance Modal */}
      {showHeadphonesEntranceModal && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-up ${
            isLight ? 'bg-slate-900/50' : 'bg-black/85'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="headphones-dialog-title"
        >
          <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden transition-all ${
            isLight 
              ? 'bg-white border border-slate-200 text-slate-900 shadow-slate-300/60' 
              : 'bg-zinc-950/95 border border-[#ef233c]/40 text-white shadow-[0_0_80px_rgba(239,35,60,0.25)] ring-1 ring-[#ef233c]/30'
          }`}>
            {/* Glowing atmospheric red blob */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
              isLight ? 'bg-red-400/10' : 'bg-red-600/15'
            }`} />

            {/* Close Button */}
            <button
              onClick={() => setShowHeadphonesEntranceModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-900' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
              }`}
              aria-label="Close announcement"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon */}
            <div className={`relative z-10 w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center text-[#ef233c] shadow-xl ${
              isLight 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-gradient-to-tr from-[#ef233c]/25 via-zinc-900 to-zinc-950 border border-[#ef233c]/50 shadow-red-950/80'
            }`}>
              <Headphones className="w-10 h-10 animate-pulse" />
            </div>

            {/* Badge */}
            <div className={`relative z-10 inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 border ${
              isLight ? 'bg-red-50 border-red-200 text-[#ef233c]' : 'bg-white/5 border-white/10 text-[#ef233c]'
            }`}>
              Headphones Recommended
            </div>

            {/* Title */}
            <h2 id="headphones-dialog-title" className={`relative z-10 text-2xl sm:text-3xl font-bold font-manrope tracking-tight mb-3 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Please Wear <span className="text-[#ef233c]">Headphones</span>
            </h2>

            {/* Description */}
            <p className={`relative z-10 text-sm leading-relaxed font-manrope mb-6 ${
              isLight ? 'text-slate-600' : 'text-zinc-300'
            }`}>
              TerraSonus translates NASA Earth Observation telemetry into real-time deterministic soundscapes. For the best sensory perception of 55 Hz sub-bass planetary drones, spatial wind filter sweeps, and crystal pentatonic harmonics, wearing headphones is strongly recommended.
            </p>

            {/* Telemetry Feature Badges */}
            <div className="relative z-10 grid grid-cols-3 gap-2.5 mb-7 text-left">
              <div className={`p-3 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-zinc-800'
              }`}>
                <div className={`text-[10px] font-manrope uppercase ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Sub-Bass Drone</div>
                <div className={`text-xs font-bold font-manrope mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>55 Hz Pitch</div>
              </div>
              <div className={`p-3 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-zinc-800'
              }`}>
                <div className={`text-[10px] font-manrope uppercase ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Stereo Field</div>
                <div className={`text-xs font-bold font-manrope mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>3D Spatial Pan</div>
              </div>
              <div className={`p-3 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-zinc-800'
              }`}>
                <div className={`text-[10px] font-manrope uppercase ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Harmonics</div>
                <div className={`text-xs font-bold font-manrope mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>Pentatonic Grid</div>
              </div>
            </div>

            {/* Single Confirmation Action */}
            <div className="relative z-10 flex justify-center mt-2">
              <button
                id="headphones-ok-btn"
                onClick={() => setShowHeadphonesEntranceModal(false)}
                className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-sm tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-red-950/60 hover:shadow-[0_0_25px_rgba(239,35,60,0.5)] active:scale-95 flex items-center justify-center gap-2"
              >
                <span>OK</span>
              </button>
            </div>

            {/* Blind & Low-Vision Access Shortcut in Modal */}
            <div className={`relative z-10 mt-5 pt-3.5 border-t flex items-center justify-center gap-2 text-xs font-manrope ${
              isLight ? 'border-slate-200 text-slate-600' : 'border-white/10 text-zinc-400'
            }`}>
              <Eye className="w-3.5 h-3.5 text-[#ef233c] shrink-0" />
              <span>
                Blind &amp; Low-Vision users: Press <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/10 text-white'}`}>A</kbd> or click <strong>Blind Access</strong> in header for speech narration.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Non-Intrusive Scroll-Down Invitation Pill */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 pointer-events-auto ${
          showFloatingScrollCue 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToVisualStage}
          className={`group flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full backdrop-blur-xl border text-xs font-manrope transition-all cursor-pointer hover:scale-105 active:scale-95 ${
            isLight 
              ? 'bg-white/95 border-slate-300 hover:border-[#ef233c] shadow-xl shadow-slate-300/60 text-slate-800 hover:text-slate-950 ring-1 ring-slate-200' 
              : 'bg-black/90 border-white/20 hover:border-[#ef233c] shadow-[0_10px_35px_rgba(0,0,0,0.9)] hover:shadow-[0_0_30px_rgba(239,35,60,0.4)] text-zinc-200 hover:text-white ring-1 ring-white/10'
          }`}
          aria-label="Scroll down to 3D Globe and sensory telemetry"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]"></span>
          </span>
          <span className="font-semibold tracking-wide">Explore 3D Globe & Data Below</span>
          <div className="flex items-center text-[#ef233c] group-hover:translate-y-0.5 transition-transform">
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </button>
      </div>

      {/* Floating Persistent Play/Pause Button on Bottom Right Corner (Starts only after listening has started) */}
      {hasStartedListening && (
        <aside 
          aria-label="Floating playback controls"
          className="fixed bottom-6 right-4 sm:right-6 z-50 animate-fade-up pointer-events-auto"
        >
          <button
            id="floating-playback-toggle-btn"
            type="button"
            onClick={togglePlay}
            className={`group flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full backdrop-blur-2xl border transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95 ${
              isPlaying
                ? isLight
                  ? 'bg-[#ef233c] text-white border-red-500 shadow-xl shadow-red-500/30 hover:bg-red-600 ring-2 ring-red-400/40'
                  : 'bg-[#ef233c] text-white border-red-400/50 shadow-[0_0_30px_rgba(239,35,60,0.6)] hover:bg-red-600 ring-2 ring-[#ef233c]/50'
                : isLight
                  ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/40 hover:bg-slate-800 hover:border-[#ef233c]'
                  : 'bg-zinc-900/95 text-white border-white/20 shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:bg-zinc-800 hover:border-[#ef233c]/60'
            }`}
            aria-label={isPlaying ? 'Pause acoustic stream' : 'Play acoustic stream'}
            title={isPlaying ? 'Pause acoustic stream' : 'Play acoustic stream'}
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-white' : 'bg-emerald-400'}`} />
            </span>

            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-white shrink-0" />
                <span className="text-xs font-bold font-manrope tracking-wider uppercase">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white shrink-0" />
                <span className="text-xs font-bold font-manrope tracking-wider uppercase">Play</span>
              </>
            )}

            {/* Mini Equalizer Activity Animation when playing */}
            {isPlaying && (
              <div className="flex items-center gap-0.5 h-3 ml-0.5">
                <span className="w-0.5 h-3 bg-white/90 rounded-full animate-pulse" />
                <span className="w-0.5 h-1.5 bg-white/70 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-0.5 h-2.5 bg-white/90 rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
            )}
          </button>
        </aside>
      )}

      {/* Headphones Active Listening Toast (Appears upon starting playback) */}
      {showHeadphonesBanner && (
        <div 
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm animate-fade-up pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div className={`relative backdrop-blur-xl border border-[#ef233c]/50 rounded-2xl p-4 shadow-2xl ring-1 ring-[#ef233c]/30 ${
            isLight 
              ? 'bg-white/95 text-slate-900 shadow-slate-300/80' 
              : 'bg-zinc-950/95 text-white shadow-red-950/80'
          }`}>
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ef233c]/15 border border-[#ef233c]/40 flex items-center justify-center shrink-0 text-[#ef233c]">
                  <Headphones className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className={`text-xs font-bold font-manrope ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Headphones Recommended
                  </div>
                  <div className={`text-[11px] font-manrope ${
                    isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}>
                    Stereo spatial audio streaming live
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHeadphonesBanner(false)}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                }`}
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ScienceModal 
        isOpen={showScienceModal} 
        onClose={() => setShowScienceModal(false)} 
        theme={theme}
      />
      <CreditsModal 
        isOpen={showCreditsModal} 
        onClose={() => setShowCreditsModal(false)} 
        theme={theme}
      />
      <SoundGuideModal 
        isOpen={showSoundGuideModal} 
        onClose={() => setShowSoundGuideModal(false)} 
        onStartListening={togglePlay}
        harmonicEngine={harmonicEngine}
        isPlaying={isPlaying}
        theme={theme}
      />
      <JukeboxModal
        isOpen={showJukeboxModal}
        onClose={() => setShowJukeboxModal(false)}
        planetaryStories={planetaryStories}
        activeStoryId={activeStoryId}
        onSelectStory={(storyId) => {
          handleSelectStory(storyId);
          setShowJukeboxModal(false);
        }}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        theme={theme}
      />
    </div>
  );
}
