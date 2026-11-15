import * as Tone from 'tone';

/**
 * PENTATONIC_SCALE
 * Constrained strictly to A Minor / C Major Pentatonic notes:
 * A3, C4, D4, E4, G4, A4, C5, D5, E5, G5
 */
const PENTATONIC_SCALE = Object.freeze([
  'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'
]);

/**
 * HarmonicEngine
 * Complete acoustic synthesis engine for TerraSonus (The Earth Information Jukebox).
 *
 * Architecture:
 * - Master bus: Tone.Limiter(-1) and Tone.Reverb(decay: 3.5, wet: 0.35)
 * - Analysers: Tone.Analyser('fft', 64) and Tone.Analyser('waveform', 128)
 * - Voice 1: Sub-Bass Ambient Drone (Tone.FMSynth) for Temperature Anomaly (GISTEMP)
 *            Pitch formula: f = 55 * Math.pow(2, deltaTemp / 12)
 * - Voice 2: Atmospheric Wind Sweeper (Tone.NoiseSynth + Tone.Filter with resonance Q: 2.5)
 *            Mapped to Wind Speed W (cutoff sweeps 250 Hz - 3800 Hz)
 * - Voice 3: Biosphere Chimes (Tone.PolySynth with Tone.Synth)
 *            Mapped to Vegetation Index (NDVI), strictly constrained to pentatonic scale
 * - Voice 4: Thermal Pulse Bass (Tone.MembraneSynth)
 *            Active fire / thermal anomaly pulsation with variable interval and tempo
 */
export class HarmonicEngine {
  constructor() {
    this._isInitialized = false;
    this._isPlaying = false;
    this._droneActive = false;
    this._windActive = false;

    this._fireTimer = null;
    this._chimeTimer = null;

    // Telemetry state with safe defaults
    this.telemetry = {
      tempAnomaly: 0.0,
      windSpeed: 8.0,
      ndvi: 0.45,
      fireIndex: 0.0,
      co2Ppm: 420.0
    };

    // Voice 1 base frequency: 55 Hz (A1)
    this._droneFreq = 55;

    // Master bus & analysis nodes
    this.masterGain = null;
    this.userGain = null;
    this.compressor = null;
    this.limiter = null;
    this.reverb = null;
    this.fftAnalyser = null;
    this.waveformAnalyser = null;
    this._userVolume = 1.0;

    // Voice 1: Sub-Bass Ambient Drone
    this.droneGain = null;
    this.droneSynth = null;

    // Voice 2: Atmospheric Wind Sweeper
    this.windGain = null;
    this.windFilter = null;
    this.windSynth = null;

    // Voice 3: Biosphere Chimes
    this.chimeGain = null;
    this.chimeSynth = null;

    // Voice 4: Thermal Pulse Bass
    this.pulseGain = null;
    this.pulseSynth = null;

    // Voice 5: EIC Visual Frame Scan-line Synth (Continuous Computer Vision Sonification)
    this.scanGain = null;
    this.scanSynth = null;
    this.scanCarrierOsc = null;
    this.scanCarrierGain = null;
    this.scanFilter = null;
    this.scanVoices = [];
    this._isSonifierActive = false;

    // MediaRecorder Audio Export Stream
    this.mediaStreamDestination = null;
    this.mediaRecorder = null;
    this._recordedChunks = [];
    this._isRecording = false;
  }

  /**
   * Initializes audio synthesis graph and starts Tone audio context on user gesture.
   */
  async init() {
    if (this._isInitialized) {
      if (Tone.getContext().state !== 'running') {
        try {
          await Tone.start();
        } catch (err) {
          console.warn('HarmonicEngine: Context resume on init failed:', err);
        }
      }
      return;
    }

    try {
      // Browsers require a user gesture to activate audio context
      await Tone.start();
    } catch (err) {
      console.warn('HarmonicEngine: Tone.start awaiting user gesture:', err);
    }

    // 1. Master Bus Routing
    // Master stage configured for maximum high-fidelity presence and loudness across all playback devices
    this.masterGain = new Tone.Gain(1.25);
    this.userGain = new Tone.Gain(this._userVolume);

    // Dynamic processing: gently compresses to glue voices and raise average perceived loudness (LUFS)
    this.compressor = new Tone.Compressor({
      threshold: -12,
      ratio: 3.0,
      attack: 0.02,
      release: 0.25
    });

    // Precision brickwall limiter to catch peaks at -0.1 dB and prevent digital clipping
    this.limiter = new Tone.Limiter(-0.1);

    this.reverb = new Tone.Reverb({
      decay: 2.8,
      wet: 0.20
    });

    // Real-time visualization analysers
    this.fftAnalyser = new Tone.Analyser('fft', 64);
    this.waveformAnalyser = new Tone.Analyser('waveform', 128);

    // Audio routing chain:
    // masterGain -> userGain -> reverb -> compressor -> limiter -> destination
    // limiter -> fftAnalyser & waveformAnalyser
    this.masterGain.connect(this.userGain);
    this.userGain.connect(this.reverb);
    this.reverb.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.toDestination();
    this.limiter.connect(this.fftAnalyser);
    this.limiter.connect(this.waveformAnalyser);

    // Audio recording destination stream setup
    try {
      const rawCtx = Tone.getContext().rawContext;
      if (rawCtx && typeof rawCtx.createMediaStreamDestination === 'function') {
        this.mediaStreamDestination = rawCtx.createMediaStreamDestination();
        this.limiter.connect(this.mediaStreamDestination);
      }
    } catch (e) {
      console.warn('HarmonicEngine: MediaStreamDestination setup notice:', e);
    }

    // Ensure reverb impulse response is generated in the background without blocking audio startup
    if (this.reverb.ready) {
      try {
        this.reverb.ready.catch(() => {});
      } catch (err) {
        console.warn('HarmonicEngine: Reverb IR generation notice:', err);
      }
    }

    // 2. Voice 1: Sub-Bass & Warm Resonant Drone (Temperature Anomaly)
    // Formula: f = 55 * Math.pow(2, deltaTemp / 12)
    // Triangle carrier with FM modulation produces strong 2nd & 3rd harmonics (110 Hz - 220 Hz)
    // so the bass is clearly audible on laptop and phone speakers (psychoacoustic missing fundamental)
    this.droneGain = new Tone.Gain(1.0).connect(this.masterGain);
    this.droneSynth = new Tone.FMSynth({
      harmonicity: 2.0,
      modulationIndex: 1.8,
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 1.8,
        decay: 1.0,
        sustain: 1.0,
        release: 2.5
      },
      modulation: {
        type: 'sine'
      },
      modulationEnvelope: {
        attack: 1.5,
        decay: 1.0,
        sustain: 1.0,
        release: 2.5
      },
      volume: 0
    }).connect(this.droneGain);

    // 3. Voice 2: Atmospheric Wind Sweeper (Wind Speed W)
    // Wide-aperture resonant filter sweeping 350 Hz - 3900 Hz with rich pink noise presence
    // Loud and distinct on laptop & mobile speakers
    this.windGain = new Tone.Gain(0.75).connect(this.masterGain);
    this.windFilter = new Tone.Filter({
      frequency: 650,
      type: 'bandpass',
      rolloff: -12,
      Q: 0.85
    }).connect(this.windGain);

    this.windSynth = new Tone.NoiseSynth({
      noise: {
        type: 'pink'
      },
      envelope: {
        attack: 1.2,
        decay: 0.4,
        sustain: 1.0,
        release: 1.8
      },
      volume: 0
    }).connect(this.windFilter);

    // 4. Voice 3: Biosphere Chimes (Vegetation Index - NDVI)
    // Tone.PolySynth with Tone.Synth, attack: 0.04s, decay: 1.4s, sustain: 0.12, release: 1.6s
    this.chimeGain = new Tone.Gain(0.85).connect(this.masterGain);
    this.chimeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.04,
        decay: 1.4,
        sustain: 0.12,
        release: 1.6
      },
      volume: 0
    }).connect(this.chimeGain);

    // 5. Voice 4: Thermal Pulse Bass (Active Fire / Thermal Anomalies)
    // MembraneSynth pulsing with punchy transient thump and resonant body
    this.pulseGain = new Tone.Gain(0.85).connect(this.masterGain);
    this.pulseSynth = new Tone.MembraneSynth({
      pitchDecay: 0.06,
      octaves: 3.5,
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.003,
        decay: 0.4,
        sustain: 0.01,
        release: 0.35
      },
      volume: 0
    }).connect(this.pulseGain);

    // 6. Voice 5: EIC Visual Frame Scan-line Synth (Continuous Computer Vision Sonification)
    this.scanGain = new Tone.Gain(0).connect(this.masterGain);

    this.scanFilter = new Tone.Filter({
      frequency: 1800,
      type: 'lowpass',
      rolloff: -12,
      Q: 1.2
    }).connect(this.scanGain);

    this.scanCarrierGain = new Tone.Gain(0).connect(this.scanFilter);
    this.scanCarrierOsc = new Tone.FatOscillator({
      frequency: 220,
      type: 'triangle',
      count: 3,
      spread: 18
    }).connect(this.scanCarrierGain);

    // Dedicated Monophonic synths for harmonic intervals
    this.scanVoices = [
      new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.1, release: 0.15 },
        volume: -2
      }).connect(this.scanGain),
      new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.1, release: 0.15 },
        volume: -3
      }).connect(this.scanGain),
      new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.1, release: 0.15 },
        volume: -3
      }).connect(this.scanGain)
    ];

    this.scanSynth = this.scanVoices[0];

    this._isInitialized = true;
    this._updateAudioParameters();
  }

  /**
   * Starts playback of the synthesis engine.
   */
  async start() {
    if (this._isPlaying) {
      return;
    }

    if (!this._isInitialized) {
      await this.init();
    }

    try {
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
      }
    } catch (err) {
      console.warn('HarmonicEngine: Failed to start audio context:', err);
    }

    this._isPlaying = true;

    // Restore master volume smoothly
    if (this.masterGain && this.masterGain.gain) {
      try {
        this.masterGain.gain.cancelScheduledValues(Tone.now());
        this.masterGain.gain.rampTo(1.25, 0.05);
      } catch {}
    }

    // Start Voice 1 (Sub-Bass Drone)
    if (this.droneSynth && !this._droneActive) {
      try {
        this.droneSynth.triggerAttack(this._droneFreq);
        this._droneActive = true;
      } catch (err) {
        console.warn('HarmonicEngine: Failed to trigger drone attack:', err);
      }
    }

    // Start Voice 2 (Wind Sweeper)
    if (this.windSynth && !this._windActive) {
      try {
        this.windSynth.triggerAttack();
        this._windActive = true;
      } catch (err) {
        console.warn('HarmonicEngine: Failed to trigger wind attack:', err);
      }
    }

    // Begin generative pulse and chime cycles
    this._scheduleFirePulse();
    this._scheduleGenerativeChime();
  }

  /**
   * Stops playback of all voices and clears timers.
   * Completely silences audio immediately.
   */
  stop() {
    this._isPlaying = false;
    this.stopSonifier();

    if (this._fireTimer) {
      clearTimeout(this._fireTimer);
      this._fireTimer = null;
    }

    if (this._chimeTimer) {
      clearTimeout(this._chimeTimer);
      this._chimeTimer = null;
    }

    try {
      // Immediate silence on master bus to prevent lingering drone or reverb
      if (this.masterGain && this.masterGain.gain) {
        this.masterGain.gain.cancelScheduledValues(Tone.now());
        this.masterGain.gain.setValueAtTime(0, Tone.now());
      }
      if (this.droneSynth && this._droneActive) {
        this.droneSynth.triggerRelease();
        this._droneActive = false;
      }
    } catch (err) {
      console.warn('HarmonicEngine: Error releasing drone synth:', err);
    }

    try {
      if (this.windSynth && this._windActive) {
        this.windSynth.triggerRelease();
        this._windActive = false;
      }
    } catch (err) {
      console.warn('HarmonicEngine: Error releasing wind synth:', err);
    }

    try {
      if (this.chimeSynth) {
        this.chimeSynth.releaseAll();
      }
    } catch (err) {
      console.warn('HarmonicEngine: Error releasing chime synth:', err);
    }
  }

  /**
   * Starts continuous carrier audio for the EIC visual sonifier.
   */
  startSonifier() {
    if (!this._isInitialized) return;
    this._isSonifierActive = true;
    try {
      if (Tone.getContext().state !== 'running') {
        Tone.start().catch(() => {});
      }
      // Ensure master is unmuted
      if (this.masterGain && this.masterGain.gain) {
        this.masterGain.gain.cancelScheduledValues(Tone.now());
        this.masterGain.gain.rampTo(1.25, 0.05);
      }
      if (this.scanGain && this.scanGain.gain) {
        this.scanGain.gain.cancelScheduledValues(Tone.now());
        this.scanGain.gain.rampTo(1.2, 0.05);
      }
      if (this.scanCarrierGain && this.scanCarrierGain.gain) {
        this.scanCarrierGain.gain.cancelScheduledValues(Tone.now());
        this.scanCarrierGain.gain.rampTo(0.55, 0.05);
      }
      if (this.scanCarrierOsc && this.scanCarrierOsc.state !== 'started') {
        try {
          this.scanCarrierOsc.start();
        } catch {}
      }
    } catch (err) {
      console.warn('HarmonicEngine: Failed to start sonifier carrier:', err);
    }
  }

  /**
   * Pauses continuous carrier audio for the EIC visual sonifier.
   * Completely cuts all sonification audio output immediately.
   */
  stopSonifier() {
    this._isSonifierActive = false;
    try {
      if (this.scanCarrierGain && this.scanCarrierGain.gain) {
        this.scanCarrierGain.gain.cancelScheduledValues(Tone.now());
        this.scanCarrierGain.gain.setValueAtTime(0, Tone.now());
      }
      if (this.scanGain && this.scanGain.gain) {
        this.scanGain.gain.cancelScheduledValues(Tone.now());
        this.scanGain.gain.setValueAtTime(0, Tone.now());
      }
      if (this.scanVoices && this.scanVoices.length > 0) {
        this.scanVoices.forEach(v => {
          try { v.triggerRelease(); } catch {}
        });
      }
    } catch (err) {
      console.warn('HarmonicEngine: Failed to stop sonifier carrier:', err);
    }
  }

  /**
   * Sonifies a vertical pixel column scanned from an EIC visual frame.
   * Modeled after NASA's Caldwell 73 benchmark:
   * - Vertical Y coordinates map to Pentatonic notes (higher Y = higher pitch)
   * - Luminance translates to velocity and gain
   * - Red/Green/Blue color balance shifts timbre, filters, and thermal triggers
   * @param {Object} columnData
   */
  sonifyPixelColumn(columnData = {}) {
    if (!this._isInitialized) return;
    // Strict pause guard: if paused, produce zero sound
    if (!this._isSonifierActive) return;

    try {
      if (Tone.getContext().state !== 'running') {
        Tone.start().catch(() => {});
      }
    } catch {}

    // Ensure continuous carrier oscillator is active
    if (this.scanCarrierOsc && this.scanCarrierOsc.state !== 'started') {
      try {
        this.scanCarrierOsc.start();
      } catch {}
    }

    const { notes = [], velocities = [], luminosity = 0.5, colorShift = {} } = columnData;

    // 1. Smoothly glide continuous carrier frequency & gain based on luminosity & scan coordinate
    const safeLuma = Math.max(0.18, Math.min(1.0, luminosity || 0.5));
    const baseFreq = 110 + safeLuma * 330; // 110 Hz (A2) to 440 Hz (A4)
    const carrierVol = Math.max(0.28, Math.min(0.75, safeLuma * 0.8));

    if (this.scanCarrierOsc && this.scanCarrierOsc.frequency) {
      try {
        this.scanCarrierOsc.frequency.rampTo(baseFreq, 0.08);
      } catch {}
    }

    if (this.scanCarrierGain && this.scanCarrierGain.gain) {
      try {
        this.scanCarrierGain.gain.rampTo(carrierVol, 0.08);
      } catch {}
    }

    // 2. Modulate low-pass filter cutoff based on spectral brightness and blue/cyan radiance
    if (this.scanFilter && this.scanFilter.frequency) {
      const { b = 100 } = colorShift || {};
      const targetCutoff = Math.round(500 + safeLuma * 1600 + (b / 255) * 1200);
      try {
        this.scanFilter.frequency.rampTo(targetCutoff, 0.08);
      } catch {}
    }

    // 3. Trigger fixed 3-voice chord accents on pentatonic notes
    if (this.scanVoices && this.scanVoices.length > 0) {
      const targetNotes = (notes && notes.length > 0)
        ? notes.slice(0, 3)
        : ['A3', 'E4'];

      const safeVel = Math.max(0.35, Math.min(1.0, (velocities[0] || safeLuma) * 1.1));

      targetNotes.forEach((note, idx) => {
        const voice = this.scanVoices[idx];
        if (voice) {
          try {
            voice.triggerAttackRelease(note, 0.08, undefined, safeVel);
          } catch {}
        }
      });
    }

    // 4. Color Channels Special Acoustic Triggers (NASA CV Specs)
    if (colorShift) {
      const { r = 0, g = 0, b = 0 } = colorShift;

      // Red Dominance (Thermal / Active Fire): triggers transient membrane thump
      if (r > 150 && r > g * 1.25 && r > b * 1.25 && this.pulseSynth) {
        try {
          this.pulseSynth.triggerAttackRelease('D2', 0.08, undefined, 0.8);
        } catch {}
      }

      // Blue Dominance (Ocean / Atmospheric vapor): sweeps resonant filter
      if (b > 120 && this.windFilter) {
        const targetFreq = Math.round(350 + (b / 255) * 2600);
        try {
          this.windFilter.frequency.rampTo(targetFreq, 0.12);
        } catch {}
      }

      // Green Dominance (Canopy / Biosphere): triggers gentle canopy bell
      if (g > 135 && g > r * 1.1 && this.chimeSynth && Math.random() < 0.35) {
        try {
          const chimeNote = PENTATONIC_SCALE[Math.floor(Math.random() * 4) + 4];
          this.chimeSynth.triggerAttackRelease(chimeNote, '16n', undefined, 0.75);
        } catch {}
      }
    }
  }

  /**
   * Starts in-browser Web Audio stream recording using MediaRecorder.
   */
  startRecording() {
    if (!this._isInitialized) {
      throw new Error('HarmonicEngine must be initialized before recording.');
    }

    if (this._isRecording) {
      return;
    }

    if (!this.mediaStreamDestination) {
      try {
        const rawCtx = Tone.getContext().rawContext;
        if (rawCtx && typeof rawCtx.createMediaStreamDestination === 'function') {
          this.mediaStreamDestination = rawCtx.createMediaStreamDestination();
          if (this.limiter) {
            this.limiter.connect(this.mediaStreamDestination);
          }
        }
      } catch (err) {
        console.warn('HarmonicEngine: Failed to create MediaStreamDestination:', err);
      }
    }

    if (!this.mediaStreamDestination || !this.mediaStreamDestination.stream) {
      throw new Error('MediaStream audio destination is not supported in this environment.');
    }

    this._recordedChunks = [];
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4'
    ];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    try {
      this.mediaRecorder = selectedMime
        ? new MediaRecorder(this.mediaStreamDestination.stream, { mimeType: selectedMime })
        : new MediaRecorder(this.mediaStreamDestination.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this._recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      this._isRecording = true;
    } catch (err) {
      console.error('HarmonicEngine: MediaRecorder start failed:', err);
      throw err;
    }
  }

  /**
   * Stops recording and returns the final audio Blob.
   * @returns {Promise<Blob|null>}
   */
  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this._isRecording) {
        this._isRecording = false;
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this._isRecording = false;
        const mimeType = (this.mediaRecorder && this.mediaRecorder.mimeType) || 'audio/webm';
        const blob = new Blob(this._recordedChunks, { type: mimeType });
        this._recordedChunks = [];
        resolve(blob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.warn('HarmonicEngine: MediaRecorder stop error:', err);
        this._isRecording = false;
        resolve(null);
      }
    });
  }

  /**
   * Returns whether audio is currently recording.
   * @returns {boolean}
   */
  isRecording() {
    return Boolean(this._isRecording);
  }

  /**
   * Downloads an audio Blob to the user's filesystem.
   * @param {Blob} blob
   * @param {string} [filename]
   */
  downloadRecording(blob, filename = 'TerraSonus-EIC-Sonification.webm') {
    if (!blob) return;
    try {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error('HarmonicEngine: Download failed:', err);
    }
  }

  /**
   * Updates telemetry data and recalculates synthesis parameters.
   * @param {Object} telemetry
   * @param {number} [telemetry.tempAnomaly] - GISTEMP temperature anomaly in degrees C
   * @param {number} [telemetry.windSpeed] - Wind speed in m/s
   * @param {number} [telemetry.ndvi] - Normalized Difference Vegetation Index (-0.1 to 1.0)
   * @param {number} [telemetry.fireIndex] - Active fire anomaly index (0.0 to 1.0+)
   * @param {number} [telemetry.co2Ppm] - Carbon dioxide concentration in ppm
   */
  setTelemetry(telemetry = {}) {
    if (!telemetry || typeof telemetry !== 'object') {
      return;
    }

    if (typeof telemetry.tempAnomaly === 'number' && !isNaN(telemetry.tempAnomaly)) {
      this.telemetry.tempAnomaly = telemetry.tempAnomaly;
    }
    if (typeof telemetry.windSpeed === 'number' && !isNaN(telemetry.windSpeed)) {
      this.telemetry.windSpeed = telemetry.windSpeed;
    }
    if (typeof telemetry.ndvi === 'number' && !isNaN(telemetry.ndvi)) {
      this.telemetry.ndvi = telemetry.ndvi;
    }
    if (typeof telemetry.fireIndex === 'number' && !isNaN(telemetry.fireIndex)) {
      this.telemetry.fireIndex = telemetry.fireIndex;
    }
    if (typeof telemetry.co2Ppm === 'number' && !isNaN(telemetry.co2Ppm)) {
      this.telemetry.co2Ppm = telemetry.co2Ppm;
    }

    this._updateAudioParameters();
  }

  /**
   * Triggers a biosphere chime from the pentatonic scale.
   * @param {number} [index] - Pentatonic note index (0 to 9)
   */
  triggerChime(index) {
    if (!this.chimeSynth) {
      return;
    }

    let note;
    if (typeof index === 'number' && !isNaN(index)) {
      const safeIdx = ((Math.floor(index) % PENTATONIC_SCALE.length) + PENTATONIC_SCALE.length) % PENTATONIC_SCALE.length;
      note = PENTATONIC_SCALE[safeIdx];
    } else {
      const ndvi = typeof this.telemetry.ndvi === 'number' ? this.telemetry.ndvi : 0.45;
      const normNdvi = Math.max(0, Math.min(1, (ndvi + 0.1) / 0.9));
      const idx = Math.min(PENTATONIC_SCALE.length - 1, Math.floor(normNdvi * PENTATONIC_SCALE.length));
      note = PENTATONIC_SCALE[idx];
    }

    try {
      if (Tone.getContext().state === 'suspended') {
        Tone.start().catch(() => {});
      }
      this.chimeSynth.triggerAttackRelease(note, '8n');
    } catch (err) {
      console.warn('HarmonicEngine: Failed to trigger chime:', err);
    }
  }

  /**
   * Sets master user volume scaling (0.0 to 1.5, default 1.0 = 100%)
   * @param {number} level
   */
  setVolume(level) {
    const safeLevel = Math.max(0, Math.min(1.5, typeof level === 'number' && !isNaN(level) ? level : 1.0));
    this._userVolume = safeLevel;
    if (this.userGain && this.userGain.gain) {
      try {
        this.userGain.gain.rampTo(safeLevel, 0.08);
      } catch {
        this.userGain.gain.value = safeLevel;
      }
    }
  }

  /**
   * Retrieves current master user volume setting
   * @returns {number}
   */
  getVolume() {
    return this._userVolume ?? 1.0;
  }

  /**
   * Plays a short isolated preview sample of an individual acoustic voice.
   * Enables users to immediately connect their ears to what each instrument represents.
   * @param {'drone'|'wind'|'chime'|'pulse'} voice
   */
  async previewVoice(voice) {
    if (!this._isInitialized) {
      await this.init();
    }
    try {
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
      }
    } catch (err) {
      console.warn('HarmonicEngine: Context resume on preview failed:', err);
    }

    try {
      if (voice === 'drone' && this.droneSynth) {
        const freq = this._droneFreq || 55;
        this.droneSynth.triggerAttackRelease(freq, '1.4', undefined, 1.0);
      } else if (voice === 'wind' && this.windSynth) {
        this.windSynth.triggerAttackRelease('1.4', undefined, 1.0);
      } else if (voice === 'chime' && this.chimeSynth) {
        this.chimeSynth.triggerAttackRelease('C5', '8n', undefined, 0.9);
        setTimeout(() => {
          try { this.chimeSynth.triggerAttackRelease('E5', '8n', undefined, 0.95); } catch {}
        }, 180);
        setTimeout(() => {
          try { this.chimeSynth.triggerAttackRelease('G5', '8n', undefined, 1.0); } catch {}
        }, 360);
      } else if (voice === 'pulse' && this.pulseSynth) {
        // A1 (55 Hz) and D2 (73.4 Hz) with punchy transient drop audible on laptop/phone speakers
        this.pulseSynth.triggerAttackRelease('A1', '8n', undefined, 0.95);
        setTimeout(() => {
          try { this.pulseSynth.triggerAttackRelease('D2', '8n', undefined, 1.0); } catch {}
        }, 380);
      }
    } catch (err) {
      console.warn(`HarmonicEngine: Failed to preview voice ${voice}:`, err);
    }
  }

  /**
   * Retrieves real-time FFT frequency data from the master bus analyser.
   * @returns {Float32Array}
   */
  getFrequencyData() {
    if (!this.fftAnalyser) {
      return new Float32Array(64);
    }
    try {
      return this.fftAnalyser.getValue();
    } catch {
      return new Float32Array(64);
    }
  }

  /**
   * Retrieves real-time time-domain waveform data from the master bus analyser.
   * @returns {Float32Array}
   */
  getWaveformData() {
    if (!this.waveformAnalyser) {
      return new Float32Array(128);
    }
    try {
      return this.waveformAnalyser.getValue();
    } catch {
      return new Float32Array(128);
    }
  }

  /**
   * Returns whether the acoustic synthesis engine is actively playing.
   * @returns {boolean}
   */
  isPlaying() {
    return Boolean(this._isPlaying);
  }

  /**
   * Internal parameter mapper responding to updated telemetry values.
   * @private
   */
  _updateAudioParameters() {
    if (!this._isInitialized) {
      return;
    }

    try {
      // 1. Voice 1: Temperature Anomaly mapping
      // Pitch formula: f = 55 * Math.pow(2, deltaTemp / 12)
      const deltaTemp = (typeof this.telemetry.tempAnomaly === 'number' && !isNaN(this.telemetry.tempAnomaly))
        ? this.telemetry.tempAnomaly
        : 0.0;
      const targetFreq = 55 * Math.pow(2, deltaTemp / 12);
      // Musical clamp: 48 Hz (G1) to 220 Hz (A3) ensures full presence across micro-speakers
      const clampedFreq = Math.max(48, Math.min(220, targetFreq));
      this._droneFreq = clampedFreq;

      if (this.droneSynth && this._droneActive) {
        this.droneSynth.frequency.rampTo(clampedFreq, 0.8);
      }

      // CO2 subtle harmonicity modulation
      if (this.droneSynth && typeof this.telemetry.co2Ppm === 'number') {
        const co2Normalized = Math.max(0, Math.min(2.0, (this.telemetry.co2Ppm - 280) / 200));
        const modIndex = 1.4 + co2Normalized * 1.8;
        this.droneSynth.modulationIndex.rampTo(modIndex, 1.0);
      }

      // 2. Voice 2: Wind Speed mapping
      // Cutoff sweeps between 350 Hz and 3900 Hz for full atmospheric presence
      const speed = (typeof this.telemetry.windSpeed === 'number' && !isNaN(this.telemetry.windSpeed))
        ? Math.max(0, this.telemetry.windSpeed)
        : 8.0;
      // Normalization: nominal calm (0 m/s) to gale (35 m/s)
      const normSpeed = Math.min(1, Math.max(0, speed / 35));
      const targetCutoff = 350 + (3900 - 350) * normSpeed;

      if (this.windFilter) {
        this.windFilter.frequency.rampTo(targetCutoff, 0.8);
      }

      if (this.windGain) {
        const windVolume = 0.40 + normSpeed * 0.55;
        this.windGain.gain.rampTo(windVolume, 0.8);
      }

      // 3. Voice 3: Vegetation Index (NDVI) gain adjustment
      const ndvi = typeof this.telemetry.ndvi === 'number' ? this.telemetry.ndvi : 0.45;
      const normNdvi = Math.max(0, Math.min(1, (ndvi + 0.1) / 0.9));
      if (this.chimeGain) {
        const chimeVol = 0.40 + normNdvi * 0.55;
        this.chimeGain.gain.rampTo(chimeVol, 0.6);
      }

      // 4. Voice 4: Thermal Pulse (Active Fire) gain adjustment
      const fire = typeof this.telemetry.fireIndex === 'number' ? this.telemetry.fireIndex : 0.0;
      const normFire = Math.max(0, Math.min(1, fire));
      if (this.pulseGain) {
        const pulseVol = 0.50 + normFire * 0.50;
        this.pulseGain.gain.rampTo(pulseVol, 0.5);
      }
    } catch (err) {
      console.warn('HarmonicEngine: Parameter update warning:', err);
    }
  }

  /**
   * Schedules active fire thermal pulse bass hits at variable intervals.
   * @private
   */
  _scheduleFirePulse() {
    if (!this._isPlaying) {
      return;
    }

    const fireVal = typeof this.telemetry.fireIndex === 'number' ? this.telemetry.fireIndex : 0.0;
    const normFire = Math.max(0, Math.min(1, fireVal));

    if (normFire > 0.01 && this.pulseSynth) {
      try {
        const velocity = 0.65 + normFire * 0.35;
        const note = normFire > 0.6 ? 'D2' : 'A1';
        this.pulseSynth.triggerAttackRelease(note, '8n', undefined, velocity);
      } catch {
        // Defensive handle
      }
    }

    // Interval shifts dynamically: 2800ms (low fire) down to 400ms (severe fire)
    const intervalMs = Math.round(2800 - normFire * 2400);
    this._fireTimer = setTimeout(() => {
      this._scheduleFirePulse();
    }, Math.max(350, intervalMs));
  }

  /**
   * Generatively triggers periodic biosphere chimes reflecting vegetation levels.
   * @private
   */
  _scheduleGenerativeChime() {
    if (!this._isPlaying) {
      return;
    }

    const ndviVal = typeof this.telemetry.ndvi === 'number' ? this.telemetry.ndvi : 0.45;
    const normNdvi = Math.max(0, Math.min(1, (ndviVal + 0.1) / 0.9));

    if (normNdvi > 0.05 && this.chimeSynth) {
      try {
        // Upper pentatonic registers become available with dense vegetation
        const maxIdx = Math.max(3, Math.min(PENTATONIC_SCALE.length, Math.floor(normNdvi * PENTATONIC_SCALE.length) + 3));
        const noteIdx = Math.floor(Math.random() * maxIdx);
        const note = PENTATONIC_SCALE[noteIdx];
        const velocity = 0.45 + normNdvi * 0.55;
        this.chimeSynth.triggerAttackRelease(note, '8n', undefined, velocity);
      } catch {
        // Defensive handle
      }
    }

    // Interval ranges 2200ms to 5200ms based on vegetation density
    const baseDelay = Math.round(5200 - normNdvi * 3000 + (Math.random() * 800 - 400));
    this._chimeTimer = setTimeout(() => {
      this._scheduleGenerativeChime();
    }, Math.max(1200, baseDelay));
  }

  /**
   * Full cleanup of all synths and nodes.
   */
  dispose() {
    this.stop();

    const nodes = [
      this.droneSynth, this.droneGain,
      this.windSynth, this.windFilter, this.windGain,
      this.chimeSynth, this.chimeGain,
      this.pulseSynth, this.pulseGain,
      this.reverb, this.compressor, this.limiter,
      this.fftAnalyser, this.waveformAnalyser,
      this.masterGain, this.userGain
    ];

    for (const node of nodes) {
      if (node && typeof node.dispose === 'function') {
        try {
          node.dispose();
        } catch {
          // Ignore disposal errors
        }
      }
    }

    this._isInitialized = false;
  }
}

// Export singleton instance as default and named export
export const harmonicEngine = new HarmonicEngine();
export default harmonicEngine;
