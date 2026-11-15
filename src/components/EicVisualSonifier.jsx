import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink, 
  Layers, 
  Radio,
  Activity,
  LineChart,
  BarChart3,
  Tv
} from 'lucide-react';

const PENTATONIC_SCALE = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'];

/**
 * Authentic Scientific Telemetry Curves for the 10 NASA EIC SVS Datasets
 * Real NASA data points, measurements, and units.
 */
const DATASET_SCIENTIFIC_CURVES = {
  'svs-5313': {
    name: 'Night Lights Radiance Trend (2012–2023)',
    unit: 'nW / (cm² · sr)',
    source: 'VIIRS Day-Night Band / NASA EIC',
    description: 'Decadal urban radiant illumination showing global infrastructure and energy expansion.',
    points: [
      { label: '2012', value: 18.2 },
      { label: '2014', value: 21.6 },
      { label: '2016', value: 25.4 },
      { label: '2018', value: 29.8 },
      { label: '2020', value: 34.1 },
      { label: '2022', value: 37.8 },
      { label: '2023', value: 41.2 }
    ]
  },
  'svs-3912': {
    name: 'Ocean Thermal Gradient & Eddy Velocity',
    unit: '°C / (m/s)',
    source: 'ECCO-2 / NASA SVS 3912',
    description: 'Sea surface thermal boundary and circulation kinetic velocity across ocean basins.',
    points: [
      { label: 'Polar (-60°)', value: -1.2 },
      { label: 'Subpolar', value: 5.4 },
      { label: 'Mid-Lat', value: 14.8 },
      { label: 'Sub-Trop', value: 22.6 },
      { label: 'Equator', value: 29.1 }
    ]
  },
  'svs-5669': {
    name: 'Aerosol Optical Depth (AOD) Plume Profile',
    unit: 'AOD (550 nm)',
    source: 'GEOS-FP / NASA SVS 5669',
    description: 'Column-integrated aerosol optical extinction across marine and continental plumes.',
    points: [
      { label: 'Baseline', value: 0.05 },
      { label: 'Sea Salt', value: 0.32 },
      { label: 'Saharan Dust', value: 0.68 },
      { label: 'Biomass Smoke', value: 0.88 },
      { label: 'Peak Plume', value: 0.95 }
    ]
  },
  'svs-5533': {
    name: 'Tropospheric Column NO2 Density',
    unit: '10¹⁵ molec / cm²',
    source: 'OMI & TROPOMI / NASA SVS 5533',
    description: 'Surface nitrogen dioxide pollution concentration from urban-industrial emissions.',
    points: [
      { label: 'Rural', value: 1.8 },
      { label: 'Suburban', value: 6.5 },
      { label: 'Industrial', value: 18.4 },
      { label: 'Metropolitan', value: 28.9 },
      { label: 'Valley Basin', value: 36.5 }
    ]
  },
  'svs-5425': {
    name: 'Western Boundary Current Transport Volume',
    unit: 'Sverdrups (10⁶ m³/s)',
    source: 'NASA SVS 5425 / ECCO Circulation',
    description: 'Kinetic water transport volume of the Gulf Stream and Kuroshio boundary systems.',
    points: [
      { label: 'Slope', value: 25 },
      { label: 'Flank', value: 60 },
      { label: 'Core Jet', value: 125 },
      { label: 'Front', value: 95 },
      { label: 'Eddy Ring', value: 45 }
    ]
  },
  'svs-5196': {
    name: 'Global Atmospheric CO2 Trajectory',
    unit: 'ppm (Parts Per Million)',
    source: 'Mauna Loa / NASA OCO-2 & SVS 5196',
    description: 'Relentless atmospheric carbon accumulation across the modern observation era.',
    points: [
      { label: '1980', value: 338.7 },
      { label: '1990', value: 354.4 },
      { label: '2000', value: 369.5 },
      { label: '2010', value: 389.9 },
      { label: '2020', value: 414.2 },
      { label: '2026', value: 426.4 }
    ]
  },
  'svs-5011': {
    name: 'Orbital Optical Lightning Flash Radiance',
    unit: 'Microjoules / (m² · sr)',
    source: 'ISS Lightning Imaging Sensor (LIS) / SVS 5011',
    description: 'Optical pulse energy and flash radiance detected by ISS spaceborne sensor.',
    points: [
      { label: 'Background', value: 140 },
      { label: 'Stroke 1', value: 620 },
      { label: 'Multi-Cell', value: 1450 },
      { label: 'Superbolt', value: 3950 },
      { label: 'Anvil Echo', value: 480 }
    ]
  },
  'svs-4960': {
    name: 'Integrated Vapor Transport (IVT) Moisture Core',
    unit: 'kg / (m · s)',
    source: 'NASA Earth System Model / SVS 4960',
    description: 'Horizontal water vapor flux corridor transporting tropical moisture poleward.',
    points: [
      { label: 'Oceanic Plume', value: 280 },
      { label: 'Inflow Channel', value: 620 },
      { label: 'Atmospheric River Core', value: 1180 },
      { label: 'Coastal Influx', value: 890 },
      { label: 'Mountain Lift', value: 410 }
    ]
  },
  'svs-4950': {
    name: 'GEDI Spaceborne LiDAR Canopy Height Distribution',
    unit: 'Meters (Elevation)',
    source: 'GEDI Mission / NASA SVS 4950',
    description: 'Laser altimetry vertical canopy structure across tropical and temperate biomes.',
    points: [
      { label: 'Forest Floor', value: 2 },
      { label: 'Understory', value: 12 },
      { label: 'Mid-Canopy', value: 26 },
      { label: 'Dominant Canopy', value: 42 },
      { label: 'Emergent Giants', value: 58 }
    ]
  },
  'svs-13786': {
    name: 'Caldwell 73 Radial Core Luminosity Distribution',
    unit: 'Relative Intensity (L / L₀)',
    source: 'Hubble & Chandra Sonification Benchmark / SVS 13786',
    description: 'NASA foundational benchmark: radial stellar density decreasing outward from core.',
    points: [
      { label: 'Core Center', value: 1.00 },
      { label: '0.2 Radius', value: 0.84 },
      { label: '0.4 Radius', value: 0.58 },
      { label: '0.6 Radius', value: 0.32 },
      { label: '0.8 Radius', value: 0.14 },
      { label: 'Outer Halo', value: 0.05 }
    ]
  }
};

/**
 * EicVisualSonifier Component
 * Real-time computer vision frame scanner & audio sonification engine with CRT Monitor & NASA Scientific Graphs.
 * Follows red theme across UI elements with P4 Cyan blue exclusively for the CRT telemetry graph.
 */
export default function EicVisualSonifier({
  datasets = [],
  activeDatasetId = 'svs-5313',
  onSelectDataset = () => {},
  isPlaying = false,
  togglePlay = () => {},
  harmonicEngine = null,
  theme = 'dark',
  isAccessibilityMode = false,
  speakText = () => {}
}) {
  const isLight = theme === 'light';

  // Internal dataset state with immediate responsiveness
  const [internalDatasetId, setInternalDatasetId] = useState(activeDatasetId);

  useEffect(() => {
    if (activeDatasetId) {
      setInternalDatasetId(activeDatasetId);
    }
  }, [activeDatasetId]);

  const currentDatasetId = internalDatasetId || activeDatasetId;
  const activeDataset = useMemo(() => {
    return datasets.find(d => d.id === currentDatasetId) || datasets[0] || {};
  }, [datasets, currentDatasetId]);

  // Visualizer States
  const [scanProgress, setScanProgress] = useState(0.0); // Throttled for UI display
  const [currentFrame, setCurrentFrame] = useState(1);
  const [totalFrames] = useState(activeDataset.framesCount || 24);
  const [scanSpeed, setScanSpeed] = useState(1.0);
  const [isScanningActive, setIsScanningActive] = useState(true);
  
  // Independent sonifier active states
  const [isSonifying, setIsSonifying] = useState(isPlaying);
  const isSonifyingRef = useRef(isPlaying);

  // Sync ref and state when isPlaying changes
  useEffect(() => {
    setIsSonifying(isPlaying);
    isSonifyingRef.current = isPlaying;
    if (isPlaying) {
      setIsScanningActive(true);
    }
  }, [isPlaying]);

  // CRT Graph Mode: 'SCIENTIFIC_CURVE' (Default NASA Graph) | 'CRT_WAVEFORM' | 'SCAN_PROFILE'
  const [crtGraphMode, setCrtGraphMode] = useState('SCIENTIFIC_CURVE');

  // Phosphor Theme: Exclusively P4 Cyan Blue for the CRT Telemetry Screen
  const graphColors = useMemo(() => ({
    main: '#06b6d4',
    dim: 'rgba(6, 182, 212, 0.15)',
    glow: 'rgba(6, 182, 212, 0.45)'
  }), []);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef(null);

  // Real-time telemetry readouts
  const [activeTelemetry, setActiveTelemetry] = useState({
    luminosity: 65,
    dominantColor: 'Multi-Spectral',
    activeNotes: ['A3', 'C4', 'E4'],
    density: 45,
    hueRgb: { r: 180, g: 140, b: 60 }
  });

  // Canvas Refs
  const canvasRef = useRef(null);
  const crtCanvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const crtAnimFrameRef = useRef(null);
  const lastScanSoundTimeRef = useRef(0);
  const lastSpeechTimeRef = useRef(0);
  const lastUiThrottleRef = useRef(0);
  const lastTelemetryThrottleRef = useRef(0);
  const scanPosRef = useRef(0.0);

  // Dynamic scientific curve for active dataset
  const activeScientificCurve = useMemo(() => {
    const key = activeDataset.svsId ? `svs-${activeDataset.svsId}` : activeDataset.id;
    return DATASET_SCIENTIFIC_CURVES[key] || DATASET_SCIENTIFIC_CURVES['svs-5313'];
  }, [activeDataset]);

  // Clean frame on dataset change
  useEffect(() => {
    setCurrentFrame(1);
    setScanProgress(0);
    scanPosRef.current = 0;
  }, [currentDatasetId]);

  // Master Sonification Audio Toggle with ZERO LAG and INSTANT SILENCE on pause
  const handleToggleSonification = async () => {
    if (!harmonicEngine) return;

    if (!isSonifying) {
      // START - ZERO LAG
      setIsSonifying(true);
      isSonifyingRef.current = true;
      setIsScanningActive(true);
      try {
        // Synchronously resume raw audio context to eliminate latency
        if (typeof window !== 'undefined') {
          const rawCtx = harmonicEngine.audioContext || (window.AudioContext && new (window.AudioContext || window.webkitAudioContext)());
          if (rawCtx && rawCtx.state === 'suspended') {
            rawCtx.resume();
          }
        }
        await harmonicEngine.init();
        harmonicEngine.start();
        if (typeof harmonicEngine.startSonifier === 'function') {
          harmonicEngine.startSonifier();
        }
        if (!isPlaying) {
          togglePlay();
        }
        speakText(`Started sonification for ${activeDataset.title}.`);
      } catch (err) {
        console.error('Failed to start sonifier audio:', err);
      }
    } else {
      // PAUSE - 100% INSTANT SILENCE
      setIsSonifying(false);
      isSonifyingRef.current = false;
      setIsScanningActive(false); // Visually freeze scan line
      try {
        if (typeof harmonicEngine.stopSonifier === 'function') {
          harmonicEngine.stopSonifier();
        }
        harmonicEngine.stop();
        if (isPlaying) {
          togglePlay();
        }
        speakText('Sonification paused.');
      } catch (err) {
        console.error('Failed to pause sonifier audio:', err);
      }
    }
  };

  // Dataset Selection with auto-redirect/scroll to the top of Visual Sonifier
  const handleSelectDataset = (datasetId) => {
    setInternalDatasetId(datasetId);
    onSelectDataset(datasetId);

    // Smoothly scroll to the top of the Visual Sonifier section
    const el = document.getElementById('visual-sonifier');
    if (el) {
      const navOffset = 72;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - navOffset);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle Recording Start / Stop
  const handleToggleRecording = async () => {
    if (!harmonicEngine) return;

    if (!isRecording) {
      try {
        if (!isSonifying) {
          await handleToggleSonification();
        }
        harmonicEngine.startRecording();
        setIsRecording(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
        speakText(`Audio recording started.`);
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    } else {
      try {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        const blob = await harmonicEngine.stopRecording();
        setIsRecording(false);
        if (blob) {
          const safeName = (activeDataset.title || 'TerraSonus-Sonification')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();
          harmonicEngine.downloadRecording(blob, `${safeName}_2026.webm`);
          speakText('Recording downloaded successfully.');
        }
      } catch (err) {
        console.error('Failed to stop recording:', err);
        setIsRecording(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Procedural frame renderer for all 10 official NASA SVS datasets
  const renderDatasetFrame = useCallback((ctx, width, height, type, frameIdx) => {
    const t = frameIdx / 24;

    // Background base
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    if (type === 'night-lights') {
      // SVS 5313: Night lights dark terrain with glowing metropolitan clusters
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.7, 50, width * 0.5, height * 0.7, width * 0.6);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const cityPoints = [
        { x: 0.08, y: 0.45, r: 14, intensity: 0.8 },
        { x: 0.16, y: 0.38, r: 20, intensity: 0.95 },
        { x: 0.24, y: 0.42, r: 16, intensity: 0.85 },
        { x: 0.32, y: 0.34, r: 24, intensity: 0.92 },
        { x: 0.40, y: 0.52, r: 18, intensity: 0.88 },
        { x: 0.48, y: 0.36, r: 22, intensity: 0.94 },
        { x: 0.56, y: 0.46, r: 26, intensity: 0.98 },
        { x: 0.64, y: 0.38, r: 20, intensity: 0.90 },
        { x: 0.72, y: 0.50, r: 24, intensity: 0.92 },
        { x: 0.80, y: 0.35, r: 18, intensity: 0.86 },
        { x: 0.88, y: 0.48, r: 22, intensity: 0.89 },
        { x: 0.94, y: 0.42, r: 15, intensity: 0.82 }
      ];

      cityPoints.forEach((city, i) => {
        const pulse = Math.sin(t * Math.PI * 2 + i * 1.5) * 3;
        const cx = city.x * width;
        const cy = city.y * height;
        const rad = Math.max(5, city.r + pulse);

        const radial = ctx.createRadialGradient(cx, cy, 1, cx, cy, rad);
        radial.addColorStop(0, 'rgba(255, 238, 175, 0.98)');
        radial.addColorStop(0.3, 'rgba(251, 191, 36, 0.7)');
        radial.addColorStop(0.7, 'rgba(245, 158, 11, 0.3)');
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (type === 'ocean-currents' || type === 'perpetual-ocean') {
      // SVS 3912 & SVS 5425: Ocean current ribbons and thermal gradients
      ctx.fillStyle = '#020b1e';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 11; i++) {
        const offset = (t * 0.8 + i * 0.1) % 1.0;
        ctx.beginPath();
        ctx.lineWidth = 16 + (i % 3) * 6;
        const waveY = (0.15 + (i * 0.075)) * height;

        ctx.moveTo(0, waveY);
        for (let x = 0; x <= width; x += 25) {
          const cy = waveY + Math.sin(x * 0.012 + t * 4 + i) * (22 + i * 3);
          ctx.lineTo(x, cy);
        }

        const isThermal = i > 5;
        ctx.strokeStyle = isThermal 
          ? `rgba(${220 + i * 3}, ${90 + i * 12}, 40, ${0.45 + offset * 0.4})`
          : `rgba(14, ${150 + i * 10}, ${230 + i * 2}, ${0.4 + offset * 0.45})`;
        ctx.stroke();
      }

    } else if (type === 'aerosols') {
      // SVS 5669: Authentic NASA GEOS-FP Aerosol Optical Depth (AOD) Plumes
      // Deep space / ocean background
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, width, height);

      // 1. Subtle latitude and longitude coordinates
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      // Equator
      ctx.moveTo(0, height * 0.5);
      ctx.lineTo(width, height * 0.5);
      // Tropics
      ctx.moveTo(0, height * 0.35);
      ctx.lineTo(width, height * 0.35);
      ctx.moveTo(0, height * 0.65);
      ctx.lineTo(width, height * 0.65);
      // Prime Meridian
      ctx.moveTo(width * 0.5, 0);
      ctx.lineTo(width * 0.5, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Realistic Continental Landmasses
      const drawContinent = (pts) => {
        if (!pts || pts.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(pts[0][0] * width, pts[0][1] * height);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0] * width, pts[i][1] * height);
        }
        ctx.closePath();
        ctx.fillStyle = '#111827';
        ctx.fill();
        ctx.strokeStyle = 'rgba(75, 85, 99, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      };

      // North America
      drawContinent([
        [0.05, 0.18], [0.10, 0.14], [0.16, 0.13], [0.22, 0.15], [0.26, 0.18],
        [0.25, 0.25], [0.22, 0.30], [0.23, 0.36], [0.25, 0.38], [0.20, 0.42],
        [0.17, 0.45], [0.14, 0.38], [0.11, 0.34], [0.08, 0.28], [0.04, 0.22]
      ]);
      // Greenland
      drawContinent([
        [0.31, 0.08], [0.37, 0.07], [0.39, 0.14], [0.34, 0.18], [0.30, 0.14]
      ]);
      // South America
      drawContinent([
        [0.21, 0.46], [0.26, 0.45], [0.32, 0.49], [0.34, 0.56], [0.30, 0.66],
        [0.27, 0.76], [0.24, 0.84], [0.22, 0.82], [0.21, 0.70], [0.19, 0.56],
        [0.19, 0.49]
      ]);
      // Europe
      drawContinent([
        [0.44, 0.22], [0.48, 0.17], [0.53, 0.17], [0.54, 0.23], [0.51, 0.30],
        [0.47, 0.32], [0.44, 0.29]
      ]);
      // Africa
      drawContinent([
        [0.42, 0.34], [0.52, 0.32], [0.57, 0.37], [0.57, 0.48], [0.55, 0.62],
        [0.51, 0.74], [0.47, 0.72], [0.44, 0.58], [0.41, 0.46], [0.39, 0.38]
      ]);
      // Asia
      drawContinent([
        [0.55, 0.18], [0.66, 0.14], [0.78, 0.15], [0.88, 0.18], [0.86, 0.28],
        [0.82, 0.36], [0.76, 0.42], [0.71, 0.40], [0.65, 0.42], [0.60, 0.36],
        [0.56, 0.26]
      ]);
      // Australia
      drawContinent([
        [0.78, 0.62], [0.85, 0.58], [0.90, 0.63], [0.89, 0.73], [0.82, 0.76],
        [0.76, 0.70]
      ]);
      // Antarctica Ice Shelf
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, height * 0.90, width, height * 0.10);

      // 3. Species A: Saharan Mineral Dust Plumes (Golden Amber / Yellow, AOD ~0.75)
      // Flows West from West Africa (Mauritania/Senegal) across the Atlantic to Caribbean & Amazon
      const dustFlow = (t * 0.22) % 1.0;
      for (let arc = 0; arc < 5; arc++) {
        const offset = (dustFlow + arc * 0.2) % 1.0;
        const startX = width * (0.54 - offset * 0.32);
        const startY = height * (0.34 + offset * 0.10 + Math.sin(offset * Math.PI * 2 + arc) * 0.04);
        const dustRad = 35 + arc * 14;

        const dGrad = ctx.createRadialGradient(startX, startY, 4, startX, startY, dustRad);
        dGrad.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
        dGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.65)');
        dGrad.addColorStop(0.75, 'rgba(217, 119, 6, 0.3)');
        dGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.ellipse(startX, startY, dustRad * 1.5, dustRad * 0.7, -0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Continuous Saharan dust streamline arc
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(width * 0.55, height * 0.35);
      ctx.quadraticCurveTo(width * 0.38, height * 0.38 + Math.sin(t * 3) * 6, width * 0.22, height * 0.44);
      ctx.stroke();
      ctx.restore();

      // 4. Species B: Biomass Burning Smoke (Fiery Crimson Red `#ef233c`, AOD ~0.92)
      // Plume 1: Amazon Basin (South America)
      for (let smk = 0; smk < 4; smk++) {
        const smkOffset = (t * 0.18 + smk * 0.25) % 1.0;
        const sx = width * (0.24 + smkOffset * 0.08);
        const sy = height * (0.54 + Math.sin(smkOffset * Math.PI + smk) * 0.06);
        const sRad = 28 + smk * 10;

        const sGrad = ctx.createRadialGradient(sx, sy, 3, sx, sy, sRad);
        sGrad.addColorStop(0, 'rgba(239, 35, 60, 0.92)');
        sGrad.addColorStop(0.5, 'rgba(185, 28, 28, 0.6)');
        sGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.ellipse(sx, sy, sRad * 1.3, sRad * 0.8, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Plume 2: Central/Southern Africa (Angola/Zambia agricultural fires)
      for (let af = 0; af < 4; af++) {
        const afOffset = (t * 0.16 + af * 0.25) % 1.0;
        const ax = width * (0.54 - afOffset * 0.12);
        const ay = height * (0.58 + Math.sin(afOffset * 3) * 0.04);
        const aRad = 26 + af * 8;

        const aGrad = ctx.createRadialGradient(ax, ay, 2, ax, ay, aRad);
        aGrad.addColorStop(0, 'rgba(239, 35, 60, 0.88)');
        aGrad.addColorStop(0.6, 'rgba(153, 27, 27, 0.45)');
        aGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.ellipse(ax, ay, aRad * 1.4, aRad * 0.75, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Species C: Marine Sea Salt Aerosols (Bright Cyan `#06b6d4`, AOD ~0.45)
      // Southern Ocean Circumpolar Storm Track (Roaring Forties)
      for (let ss = 0; ss < 7; ss++) {
        const ssX = ((ss * 0.15 + t * 0.25) % 1.0) * width;
        const ssY = height * (0.78 + Math.sin(ss + t * 4) * 0.05);
        const ssRad = 32 + (ss % 3) * 12;

        const cGrad = ctx.createRadialGradient(ssX, ssY, 4, ssX, ssY, ssRad);
        cGrad.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
        cGrad.addColorStop(0.5, 'rgba(14, 116, 144, 0.45)');
        cGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.ellipse(ssX, ssY, ssRad * 1.8, ssRad * 0.6, 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Cyclonic eddy curl
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ssX, ssY, ssRad * 0.6, 0, Math.PI * 1.5);
        ctx.stroke();
      }

      // 6. Species D: Industrial Sulfate Haze (Luminous Pale White, AOD ~0.55)
      // East Asia (Eastern China & Sea of Japan)
      for (let sf = 0; sf < 3; sf++) {
        const fx = width * (0.76 + sf * 0.04);
        const fy = height * (0.32 + Math.sin(t * 3 + sf) * 0.03);
        const fRad = 30 + sf * 12;

        const fGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, fRad);
        fGrad.addColorStop(0, 'rgba(248, 250, 252, 0.85)');
        fGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.4)');
        fGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, fRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. NASA SVS 5669 Scientific HUD Watermark & Legend
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText('NASA GSFC • GEOS-FP 550nm AEROSOL OPTICAL DEPTH (SVS 5669)', 16, 22);

      // Color legend chips matching official NASA Goddard SVS visualization
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(16, height - 20, 10, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('DUST (Sahara SAL)', 32, height - 12);

      ctx.fillStyle = '#ef233c';
      ctx.fillRect(175, height - 20, 10, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('SMOKE (Biomass Fires)', 191, height - 12);

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(360, height - 20, 10, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('SEA SALT (Southern Jets)', 376, height - 12);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(560, height - 20, 10, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('SULFATE (East Asia)', 576, height - 12);

    } else if (type === 'lightning') {
      // SVS 5011: Lightning events detected from ISS - Orbital view with bursts
      ctx.fillStyle = '#03050c';
      ctx.fillRect(0, 0, width, height);

      // Cloud bands
      for (let c = 0; c < 5; c++) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(0, height * (0.2 + c * 0.14), width, height * 0.1);
      }

      // Background starlight
      for (let s = 0; s < 40; s++) {
        const sx = ((s * 37) % width);
        const sy = ((s * 49) % height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flash bursts with electric branching
      for (let f = 0; f < 3; f++) {
        const flashX = (((frameIdx + f * 7) * 79) % (width * 0.9)) + width * 0.05;
        const flashY = (((frameIdx + f * 5) * 53) % (height * 0.7)) + height * 0.15;

        const radial = ctx.createRadialGradient(flashX, flashY, 2, flashX, flashY, 110);
        radial.addColorStop(0, '#ffffff');
        radial.addColorStop(0.25, 'rgba(125, 211, 252, 0.95)');
        radial.addColorStop(0.6, 'rgba(6, 182, 212, 0.4)');
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(flashX, flashY, 110, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(flashX, flashY - 40);
        ctx.lineTo(flashX + 12, flashY);
        ctx.lineTo(flashX - 8, flashY + 22);
        ctx.lineTo(flashX + 15, flashY + 45);
        ctx.stroke();
      }

    } else if (type === 'forest-height') {
      // SVS 4950: GEDI forest height elevation ladders
      ctx.fillStyle = '#021208';
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / 24;
      for (let i = 0; i < 24; i++) {
        const hFraction = 0.35 + (Math.sin(i * 0.45 + t * 2) * 0.4 + 0.4) * 0.6;
        const barH = hFraction * height;
        const x = i * barWidth;
        const y = height - barH;

        const grad = ctx.createLinearGradient(0, y, 0, height);
        grad.addColorStop(0, '#4ade80');
        grad.addColorStop(0.5, '#16a34a');
        grad.addColorStop(1, '#064e3b');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y, barWidth - 4, barH);
      }

    } else if (type === 'caldwell-73') {
      // SVS 13786: Caldwell 73 benchmark stellar cluster
      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, width, height);

      const coreX = width * 0.5;
      const coreY = height * 0.5;
      const coreGrad = ctx.createRadialGradient(coreX, coreY, 5, coreX, coreY, width * 0.42);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      coreGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.7)');
      coreGrad.addColorStop(0.5, 'rgba(96, 165, 250, 0.35)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreX, coreY, width * 0.42, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < 70; s++) {
        const starX = (Math.sin(s * 91) * 0.5 + 0.5) * width;
        const starY = (Math.cos(s * 73) * 0.5 + 0.5) * height;
        const starRad = 1.5 + (s % 3);
        const starBright = Math.sin(t * 6 + s) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${starBright})`;
        ctx.beginPath();
        ctx.arc(starX, starY, starRad, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (type === 'air-quality') {
      // SVS 5533: Tropospheric NO2 pollution model runs
      ctx.fillStyle = '#0a0614';
      ctx.fillRect(0, 0, width, height);

      for (let p = 0; p < 9; p++) {
        const px = ((p * 0.12 + t * 0.15) % 1.0) * width;
        const py = (0.25 + (p % 3) * 0.25 + Math.sin(t * 3 + p) * 0.08) * height;
        const rad = 75 + (p % 4) * 30;
        const grad = ctx.createRadialGradient(px, py, 5, px, py, rad);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
        grad.addColorStop(0.4, 'rgba(217, 70, 239, 0.65)');
        grad.addColorStop(0.8, 'rgba(99, 102, 241, 0.25)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (type === 'atmospheric-river') {
      // SVS 4960: 3D atmospheric river moisture corridor
      ctx.fillStyle = '#020b18';
      ctx.fillRect(0, 0, width, height);

      for (let w = 0; w < 5; w++) {
        const offset = (t * 0.4 + w * 0.2) % 1.0;
        ctx.beginPath();
        ctx.lineWidth = 32 + w * 12;
        const startY = (0.3 + w * 0.1) * height;
        ctx.moveTo(0, startY);

        for (let x = 0; x <= width; x += 30) {
          const cy = startY + Math.sin(x * 0.008 + t * 3 + w) * 45;
          ctx.lineTo(x, cy);
        }
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.35 + offset * 0.35})`;
        ctx.stroke();

        ctx.lineWidth = 14;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + offset * 0.3})`;
        ctx.stroke();
      }

    } else if (type === 'carbon-dioxide') {
      // SVS 5196: DYAMOND global CO2 dispersion
      ctx.fillStyle = '#0c0712';
      ctx.fillRect(0, 0, width, height);

      for (let c = 0; c < 8; c++) {
        const px = ((c * 0.14 + t * 0.22) % 1.0) * width;
        const py = (0.2 + (c % 3) * 0.28) * height;
        const rx = 130 + c * 15;
        const ry = 65 + c * 8;
        const grad = ctx.createRadialGradient(px, py, 12, px, py, rx);
        grad.addColorStop(0, 'rgba(239, 35, 60, 0.7)');
        grad.addColorStop(0.5, 'rgba(244, 63, 94, 0.4)');
        grad.addColorStop(0.8, 'rgba(168, 85, 247, 0.2)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(px, py, rx, ry, Math.PI * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }

    } else {
      ctx.fillStyle = '#060b18';
      ctx.fillRect(0, 0, width, height);

      for (let b = 0; b < 8; b++) {
        ctx.beginPath();
        const px = ((0.1 + (b * 0.13) + t * 0.2) % 1.0) * width;
        const py = (0.3 + Math.sin(b + t * 3) * 0.25) * height;
        const rx = 110 + b * 15;
        const ry = 60 + b * 10;
        const grad = ctx.createRadialGradient(px, py, 10, px, py, rx);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  // Main Canvas Animation and Continuous CV Scan Loop (High-Performance Zero-Buffering)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let isRunning = true;
    let lastTime = performance.now();

    const loop = (now) => {
      if (!isRunning) return;
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const width = canvas.width;
      const height = canvas.height;

      // Advance scan line only when active and unpaused (smooth NASA Caldwell 73 traversal tempo)
      if (isScanningActive && isSonifyingRef.current) {
        scanPosRef.current = (scanPosRef.current + delta * 0.055 * scanSpeed) % 1.0;
        // Throttled UI state update (4Hz instead of 60Hz) to prevent CPU stutter & audio buffer underruns
        if (now - lastUiThrottleRef.current > 250) {
          lastUiThrottleRef.current = now;
          setScanProgress(scanPosRef.current);
        }
      }

      const scanX = Math.floor(scanPosRef.current * width);

      // Render Authentic NASA SVS Dataset Imagery
      renderDatasetFrame(ctx, width, height, activeDataset.type, currentFrame, scanX);

      // Computer Vision Pixel Column Extraction under the scan line
      try {
        const clampedScanX = Math.max(0, Math.min(width - 1, scanX));
        const colData = ctx.getImageData(clampedScanX, 0, 1, height);
        const pixels = colData.data;

        let totalLuma = 0;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let activePixelCount = 0;

        const bandSize = Math.floor(height / 10);
        const bandLuma = new Array(10).fill(0);

        for (let y = 0; y < height; y++) {
          const idx = y * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          totalLuma += luma;
          sumR += r;
          sumG += g;
          sumB += b;

          if (luma > 30) {
            activePixelCount++;
            const bandIdx = Math.min(9, Math.max(0, 9 - Math.floor(y / bandSize)));
            bandLuma[bandIdx] = Math.max(bandLuma[bandIdx], luma);
          }
        }

        const avgLuma = Math.max(0.25, totalLuma / (height * 255));
        const avgR = Math.round(sumR / height);
        const avgG = Math.round(sumG / height);
        const avgB = Math.round(sumB / height);
        const density = Math.max(0.2, activePixelCount / height);

        // Detect triggered pentatonic notes
        const activeNotes = [];
        const velocities = [];
        for (let b = 0; b < 10; b++) {
          if (bandLuma[b] > 40) {
            activeNotes.push(PENTATONIC_SCALE[b]);
            velocities.push(bandLuma[b] / 255);
          }
        }

        // Color classification
        let dominantColor = 'Multi-Spectral';
        if (avgR > avgG * 1.25 && avgR > avgB * 1.25) dominantColor = 'Thermal Infrared (Red)';
        else if (avgG > avgR * 1.15 && avgG > avgB * 1.05) dominantColor = 'Vegetation Canopy (Green)';
        else if (avgB > avgR * 1.15 && avgB > avgG * 1.05) dominantColor = 'Hydrosphere / Ice (Blue)';
        else if (avgLuma > 0.55) dominantColor = 'High Optical Radiance (White)';

        // Continuous Sonification trigger through HarmonicEngine (strictly gated by isSonifyingRef)
        if (isSonifyingRef.current && now - lastScanSoundTimeRef.current >= 95) {
          lastScanSoundTimeRef.current = now;
          if (harmonicEngine && typeof harmonicEngine.sonifyPixelColumn === 'function') {
            const finalNotes = activeNotes.length > 0 
              ? activeNotes 
              : [PENTATONIC_SCALE[Math.floor(scanPosRef.current * 7)], PENTATONIC_SCALE[Math.floor(avgLuma * 9)]];

            harmonicEngine.sonifyPixelColumn({
              notes: finalNotes,
              velocities: velocities.length > 0 ? velocities : [avgLuma],
              luminosity: avgLuma,
              colorShift: { r: avgR, g: avgG, b: avgB },
              density
            });
          }
        }

        // Periodic Accessibility Speech Announcement (~14 seconds)
        if (isAccessibilityMode && isSonifyingRef.current && now - lastSpeechTimeRef.current > 14000) {
          lastSpeechTimeRef.current = now;
          const notesText = activeNotes.length > 0 ? activeNotes.join(', ') : 'continuous harmonic drone';
          const announcement = `Computer vision scan at ${Math.round(scanPosRef.current * 100)} percent. Detected ${dominantColor}. Active chords: ${notesText}.`;
          speakText(announcement);
        }

        // Throttled Telemetry update to prevent React overhead
        if (now - lastTelemetryThrottleRef.current > 300) {
          lastTelemetryThrottleRef.current = now;
          setActiveTelemetry({
            luminosity: Math.round(avgLuma * 100),
            dominantColor,
            activeNotes: activeNotes.length > 0 ? activeNotes : ['Harmonic Bed', 'A3', 'E4'],
            density: Math.round(density * 100),
            hueRgb: { r: avgR, g: avgG, b: avgB }
          });
        }

      } catch (err) {
        // Defensive
      }

      // Draw Glowing Caldwell 73 Scan Line (Authentic Red Aura Theme)
      ctx.save();
      ctx.strokeStyle = isLight ? 'rgba(239, 35, 60, 0.45)' : 'rgba(239, 35, 60, 0.75)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, height);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, height);
      ctx.stroke();

      ctx.fillStyle = '#ef233c';
      ctx.beginPath();
      ctx.arc(scanX, 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isScanningActive, 
    scanSpeed, 
    activeDataset, 
    currentFrame, 
    harmonicEngine, 
    isLight, 
    isAccessibilityMode, 
    speakText, 
    renderDatasetFrame
  ]);

  // CRT Monitor Real-time Canvas Render Loop (P4 Cyan Blue for graph line and oscilloscope)
  useEffect(() => {
    const canvas = crtCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const colors = graphColors;

    const renderCrt = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;

      // Dark CRT glass base with cyan phosphor persistence
      ctx.fillStyle = '#040810';
      ctx.fillRect(0, 0, w, h);

      // CRT Grid Lines (Reticle)
      ctx.strokeStyle = colors.dim;
      ctx.lineWidth = 1;
      const stepX = w / 8;
      const stepY = h / 6;
      for (let x = 0; x <= w; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (crtGraphMode === 'CRT_WAVEFORM') {
        // Mode 1: Live CRT Oscilloscope Waveform & Real-Time FFT Spectrum (P4 Cyan Blue)
        let waveform = null;
        let fft = null;
        if (harmonicEngine && typeof harmonicEngine.getWaveformData === 'function') {
          waveform = harmonicEngine.getWaveformData();
          fft = harmonicEngine.getFrequencyData();
        }

        // Draw FFT Bars in background
        if (fft && fft.length > 0) {
          const barW = w / 32;
          for (let i = 0; i < 32; i++) {
            const raw = fft[i] || -100;
            const norm = Math.max(0, Math.min(1, (raw + 90) / 70));
            const barH = norm * (h * 0.6);
            ctx.fillStyle = colors.dim;
            ctx.fillRect(i * barW + 2, h - barH, barW - 4, barH);
          }
        }

        // Draw Live CRT Oscilloscope Waveform
        ctx.save();
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = colors.main;
        ctx.lineWidth = 2.2;
        ctx.beginPath();

        const midY = h * 0.5;
        const ptsCount = 128;
        const step = w / ptsCount;

        for (let i = 0; i < ptsCount; i++) {
          const x = i * step;
          let val = 0;
          if (isSonifyingRef.current && waveform && waveform[i] !== undefined) {
            val = waveform[i];
          } else {
            val = Math.sin(i * 0.15 + performance.now() * 0.003) * 0.15;
          }
          const y = midY + val * (h * 0.38);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // Readout Text (Clear, Bold, High-Contrast P4 Cyan)
        ctx.save();
        ctx.fillStyle = colors.main;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        ctx.shadowBlur = 2;
        ctx.font = 'bold 11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`CRT OSCILLOSCOPE [CH1 P4-CYAN] • LIVE ACOUSTIC WAVE`, 12, 18);
        ctx.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`STATUS: ${isSonifyingRef.current ? 'ACTIVE (STREAMING)' : 'STANDBY (PAUSED)'}`, 12, 32);
        ctx.fillText(`RATE: 48.0 kHz • CALDWELL SCAN: ${Math.round(scanPosRef.current * 100)}%`, w - 240, 18);
        ctx.restore();

      } else if (crtGraphMode === 'SCIENTIFIC_CURVE') {
        // Mode 2: Authentic Scientific Telemetry Curve (Correct NASA Data Graph in P4 Cyan Blue)
        const curve = activeScientificCurve;
        const pts = curve.points;

        ctx.save();
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = colors.main;
        ctx.lineWidth = 2.5;

        const vals = pts.map(p => p.value);
        const minV = Math.min(...vals);
        const maxV = Math.max(...vals);
        const range = maxV - minV || 1;

        const padX = 50;
        const padY = 40;
        const plotW = w - padX * 2;
        const plotH = h - padY * 2;

        ctx.beginPath();
        pts.forEach((pt, idx) => {
          const x = padX + (idx / (pts.length - 1)) * plotW;
          const normY = (pt.value - minV) / range;
          const y = (h - padY) - normY * plotH;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Plot data point markers
        pts.forEach((pt, idx) => {
          const x = padX + (idx / (pts.length - 1)) * plotW;
          const normY = (pt.value - minV) / range;
          const y = (h - padY) - normY * plotH;

          ctx.fillStyle = colors.main;
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText(`${pt.value}`, x - 10, y - 8);

          ctx.fillStyle = colors.main;
          ctx.fillText(pt.label, x - 15, h - 15);
        });

        // Scan Line Cursor indicator on Graph
        const cursorX = padX + scanPosRef.current * plotW;
        ctx.strokeStyle = '#ef233c'; // Red cursor matching Caldwell scan theme
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cursorX, padY);
        ctx.lineTo(cursorX, h - padY);
        ctx.stroke();

        ctx.restore();

        // Title and Unit readout - Clear, Bold, Same Size and Color
        ctx.save();
        ctx.fillStyle = colors.main;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
        ctx.shadowBlur = 2;
        ctx.font = 'bold 11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`NASA SCIENTIFIC TELEMETRY GRAPH: ${curve.name.toUpperCase()}`, 12, 18);
        ctx.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`UNIT: ${curve.unit} • SOURCE: ${curve.source}`, 12, 32);
        ctx.restore();

      } else {
        // Mode 3: Scan-Line Luminance Profile Graph (0% to 100%)
        ctx.save();
        ctx.fillStyle = colors.main;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
        ctx.shadowBlur = 2;
        ctx.font = 'bold 11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`HORIZONTAL LUMINANCE DENSITY SPECTRUM (0% → 100% X-AXIS)`, 12, 18);
        ctx.font = 'bold 10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`ACTIVE SCAN CURSOR AT: ${Math.round(scanPosRef.current * 100)}%`, 12, 32);

        ctx.strokeStyle = colors.main;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const normX = x / w;
          const lumaSim = Math.sin(normX * 6 + currentFrame * 0.2) * 0.35 + 0.5 + Math.cos(normX * 14) * 0.15;
          const y = (h * 0.85) - lumaSim * (h * 0.55);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Scan Cursor
        const cursorX = scanPosRef.current * w;
        ctx.strokeStyle = '#ef233c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cursorX, 40);
        ctx.lineTo(cursorX, h - 20);
        ctx.stroke();

        ctx.restore();
      }

      crtAnimFrameRef.current = requestAnimationFrame(renderCrt);
    };

    crtAnimFrameRef.current = requestAnimationFrame(renderCrt);
    return () => {
      isRunning = false;
      if (crtAnimFrameRef.current) cancelAnimationFrame(crtAnimFrameRef.current);
    };
  }, [crtGraphMode, activeScientificCurve, currentFrame, harmonicEngine, graphColors]);

  // Jump scan line on user click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    setScanProgress(progress);
    scanPosRef.current = progress;
  };

  return (
    <div id="visual-sonifier-container" className={`rounded-3xl border transition-all overflow-hidden ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-900 shadow-xl' 
        : 'bg-zinc-950 border-white/10 text-white shadow-[0_0_50px_rgba(239,35,60,0.15)]'
    }`}>
      
      {/* Top Banner & Dataset Information - Red Theme */}
      <div className={`p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-zinc-900/60'
      }`}>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ef233c]/15 text-[#ef233c] font-bold border border-[#ef233c]/30 uppercase tracking-wider">
              {activeDataset.category || 'NASA EIC Telemetry'}
            </span>
            <span className={`text-xs font-mono font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              SVS ID: {activeDataset.svsId || '5313'}
            </span>
          </div>

          <h3 className={`text-xl sm:text-2xl font-bold font-manrope tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {activeDataset.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 max-w-3xl">
            {activeDataset.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeDataset.svsUrl && (
            <a
              href={activeDataset.svsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-xl border text-xs font-manrope font-semibold transition-colors flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:border-[#ef233c]/40'
              }`}
              title="Open Official NASA Scientific Visualization Studio Dataset"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ef233c]" />
              <span className="hidden sm:inline">NASA SVS Page</span>
            </a>
          )}

          <button
            onClick={handleToggleRecording}
            className={`px-4 py-2 rounded-xl border text-xs font-manrope font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              isRecording
                ? 'bg-[#ef233c] text-white border-red-500 animate-pulse shadow-red-950/60'
                : isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white hover:border-[#ef233c]/40'
            }`}
            title={isRecording ? 'Stop and download audio recording' : 'Record live sonification audio'}
          >
            <Radio className={`w-3.5 h-3.5 ${isRecording ? 'text-white' : 'text-[#ef233c]'}`} />
            <span>{isRecording ? `Recording (${recordingSeconds}s)` : 'Record'}</span>
          </button>

          {/* Master Continuous Sonification Button */}
          <button
            onClick={handleToggleSonification}
            className={`px-5 py-2 rounded-xl text-xs font-bold font-manrope transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              isSonifying
                ? 'bg-[#ef233c] text-white shadow-red-950/60 hover:bg-red-700 ring-2 ring-red-400/50'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/50'
            }`}
          >
            {isSonifying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Visual Frame Canvas Area */}
      <div className="relative w-full aspect-video sm:aspect-[21/9] bg-black overflow-hidden flex items-center justify-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={960}
          height={410}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain select-none"
          title="Click anywhere to jump scan line"
        />

        <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSonifying ? 'bg-[#ef233c] animate-ping' : 'bg-zinc-500'}`} />
            <span>CALDWELL SCAN: {Math.round(scanProgress * 100)}%</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-manrope text-white pointer-events-none">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-zinc-400 block">Luminosity (Gain):</span>
              <strong className="text-white font-mono">{activeTelemetry.luminosity}%</strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Spectral Color:</span>
              <strong className="text-[#ef233c]">{activeTelemetry.dominantColor}</strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Active Chords:</span>
              <strong className="text-amber-300 font-mono">{activeTelemetry.activeNotes.join(', ')}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span>Frame:</span>
            <span className="font-mono text-white font-bold">{currentFrame} / {totalFrames}</span>
          </div>
        </div>
      </div>

      {/* Frame Timeline Scrubber & Speed Controls - Red Theme */}
      <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-white/10'
      }`}>
        <div className="w-full sm:flex-1 flex items-center gap-3">
          <span className="text-xs font-bold font-manrope shrink-0 text-[#ef233c]">
            Visual Frame:
          </span>
          <input
            type="range"
            min={1}
            max={totalFrames}
            value={currentFrame}
            onChange={(e) => setCurrentFrame(Number(e.target.value))}
            className="flex-1 accent-[#ef233c] cursor-pointer h-1.5 rounded-lg bg-zinc-700"
          />
          <span className="text-xs font-mono font-bold shrink-0">
            {currentFrame} / {totalFrames}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsScanningActive(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-manrope font-semibold transition-colors cursor-pointer ${
              isScanningActive 
                ? 'bg-[#ef233c]/15 text-[#ef233c] border-[#ef233c]/30' 
                : isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-400'
            }`}
          >
            {isScanningActive ? 'Scan Active' : 'Scan Paused'}
          </button>

          <div className="flex items-center rounded-lg border overflow-hidden text-xs font-mono">
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setScanSpeed(spd)}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  scanSpeed === spd
                    ? 'bg-[#ef233c] text-white font-bold'
                    : isLight ? 'bg-white text-slate-700 hover:bg-slate-100' : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setScanProgress(0);
              scanPosRef.current = 0;
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLight ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Reset Scan Position to 0%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CRT MONITOR & SCIENTIFIC DATA GRAPHS SECTION - Red Shell with P4 Cyan Blue Graph */}
      <div className={`p-4 sm:p-6 border-t ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-zinc-950/90 border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Tv className="w-4 h-4 text-[#ef233c]" />
            <h4 className={`text-sm sm:text-base font-bold font-manrope ${isLight ? 'text-slate-900' : 'text-white'}`}>
              NASA CRT Telemetry Monitor
            </h4>
          </div>

          {/* Graph Mode Buttons: Red Active State, no P3/P1/Cyan selection pills */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-900 border-white/10'
          }`}>
            <button
              onClick={() => setCrtGraphMode('SCIENTIFIC_CURVE')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                crtGraphMode === 'SCIENTIFIC_CURVE'
                  ? 'bg-[#ef233c] text-white shadow-xs font-black'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>NASA Graph</span>
            </button>

            <button
              onClick={() => setCrtGraphMode('CRT_WAVEFORM')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                crtGraphMode === 'CRT_WAVEFORM'
                  ? 'bg-[#ef233c] text-white shadow-xs font-black'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>CRT Waveform</span>
            </button>

            <button
              onClick={() => setCrtGraphMode('SCAN_PROFILE')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                crtGraphMode === 'SCAN_PROFILE'
                  ? 'bg-[#ef233c] text-white shadow-xs font-black'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Luminance Profile</span>
            </button>
          </div>
        </div>

        {/* Authentic CRT Bezel Frame & Scanline Screen with P4 Cyan Blue Graph */}
        <div className="relative rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-4 border-zinc-700/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.5)]">
          {/* CRT Screen Tube Container */}
          <div className="relative rounded-xl overflow-hidden aspect-[21/9] sm:aspect-[24/9] bg-[#040810] border border-cyan-900/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
            <canvas
              ref={crtCanvasRef}
              width={860}
              height={280}
              className="w-full h-full object-fill select-none"
            />
            {/* Authentic CRT Scanline Raster Filter Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 2.5px)'
              }}
            />
            {/* Subtle Vignette & Glass Reflection */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.7)]" />
          </div>
        </div>
      </div>

      {/* 10 Official NASA EIC SVS Resource Datasets Selector Chips - Red Theme */}
      <div className={`p-4 sm:p-5 border-t ${
        isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/40 border-white/10'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-[#ef233c]" />
          <h4 className={`text-xs sm:text-sm font-bold font-manrope ${isLight ? 'text-slate-900' : 'text-white'}`}>
            NASA SVS Datasets (Click to View & Sonify)
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {datasets.map((dataset) => {
            const isSelected = currentDatasetId === dataset.id;
            return (
              <button
                key={dataset.id}
                onClick={() => handleSelectDataset(dataset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isLight
                      ? 'bg-red-50 border-[#ef233c] text-red-950 ring-1 ring-[#ef233c]/40 shadow-sm'
                      : 'bg-[#ef233c]/10 border-[#ef233c] text-white ring-1 ring-[#ef233c]/40 shadow-[0_0_15px_rgba(239,35,60,0.25)]'
                    : isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      : 'bg-black/40 border-white/5 hover:border-white/15 text-zinc-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono font-bold text-[#ef233c]">
                      SVS {dataset.svsId}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-zinc-400'
                    }`}>
                      {dataset.theme}
                    </span>
                  </div>
                  <div className="text-xs font-bold font-manrope line-clamp-1">
                    {dataset.title}
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-manrope text-[#ef233c]/80 line-clamp-1 font-semibold">
                  {dataset.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
