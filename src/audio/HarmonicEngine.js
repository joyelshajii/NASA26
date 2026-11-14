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
    this.limiter = null;
    this.reverb = null;
    this.fftAnalyser = null;
    this.waveformAnalyser = null;

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
    this.masterGain = new Tone.Gain(0.8);
    this.limiter = new Tone.Limiter(-1);
    this.reverb = new Tone.Reverb({
      decay: 3.5,
      wet: 0.35
    });

    // Real-time visualization analysers
    this.fftAnalyser = new Tone.Analyser('fft', 64);
    this.waveformAnalyser = new Tone.Analyser('waveform', 128);

    // Audio routing chain:
    // masterGain -> reverb -> limiter -> destination
    // limiter -> fftAnalyser & waveformAnalyser
    this.masterGain.connect(this.reverb);
    this.reverb.connect(this.limiter);
    this.limiter.toDestination();
    this.limiter.connect(this.fftAnalyser);
    this.limiter.connect(this.waveformAnalyser);

    // Ensure reverb impulse response is generated
    if (this.reverb.ready) {
      try {
        await this.reverb.ready;
      } catch (err) {
        console.warn('HarmonicEngine: Reverb IR generation notice:', err);
      }
    }

    // 2. Voice 1: Sub-Bass Ambient Drone (Temperature Anomaly)
    // Formula: f = 55 * Math.pow(2, deltaTemp / 12)
    this.droneGain = new Tone.Gain(0.65).connect(this.masterGain);
    this.droneSynth = new Tone.FMSynth({
      harmonicity: 1.0,
      modulationIndex: 1.0,
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 2.5,
        decay: 1.0,
        sustain: 1.0,
        release: 3.0
      },
      modulation: {
        type: 'triangle'
      },
      modulationEnvelope: {
        attack: 2.0,
        decay: 1.0,
        sustain: 1.0,
        release: 3.0
      },
      volume: -6
    }).connect(this.droneGain);

    // 3. Voice 2: Atmospheric Wind Sweeper (Wind Speed W)
    // NoiseSynth fed into Filter with resonance Q: 2.5, cutoff 250 Hz - 3800 Hz
    this.windGain = new Tone.Gain(0.25).connect(this.masterGain);
    this.windFilter = new Tone.Filter({
      frequency: 600,
      type: 'bandpass',
      rolloff: -12,
      Q: 2.5
    }).connect(this.windGain);

    this.windSynth = new Tone.NoiseSynth({
      noise: {
        type: 'pink'
      },
      envelope: {
        attack: 2.0,
        decay: 0.5,
        sustain: 1.0,
        release: 2.5
      },
      volume: -10
    }).connect(this.windFilter);

    // 4. Voice 3: Biosphere Chimes (Vegetation Index - NDVI)
    // Tone.PolySynth with Tone.Synth, attack: 0.05s, decay: 1.2s, sustain: 0.1, release: 1.5s
    this.chimeGain = new Tone.Gain(0.5).connect(this.masterGain);
    this.chimeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.05,
        decay: 1.2,
        sustain: 0.1,
        release: 1.5
      },
      volume: -6
    }).connect(this.chimeGain);

    // 5. Voice 4: Thermal Pulse Bass (Active Fire / Thermal Anomalies)
    // MembraneSynth pulsing with variable interval/tempo based on fireIndex
    this.pulseGain = new Tone.Gain(0.6).connect(this.masterGain);
    this.pulseSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.005,
        decay: 0.45,
        sustain: 0.01,
        release: 0.5
      },
      volume: -6
    }).connect(this.pulseGain);

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
   */
  stop() {
    this._isPlaying = false;

    if (this._fireTimer) {
      clearTimeout(this._fireTimer);
      this._fireTimer = null;
    }

    if (this._chimeTimer) {
      clearTimeout(this._chimeTimer);
      this._chimeTimer = null;
    }

    try {
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
      // Defensive musical clamp: 25 Hz (A0) to 220 Hz (A3)
      const clampedFreq = Math.max(25, Math.min(220, targetFreq));
      this._droneFreq = clampedFreq;

      if (this.droneSynth && this._droneActive) {
        this.droneSynth.frequency.rampTo(clampedFreq, 0.8);
      }

      // CO2 subtle harmonicity modulation
      if (this.droneSynth && typeof this.telemetry.co2Ppm === 'number') {
        const co2Normalized = Math.max(0, Math.min(2.0, (this.telemetry.co2Ppm - 280) / 200));
        const modIndex = 0.8 + co2Normalized * 1.2;
        this.droneSynth.modulationIndex.rampTo(modIndex, 1.0);
      }

      // 2. Voice 2: Wind Speed mapping
      // Cutoff sweeps between 250 Hz and 3800 Hz
      const speed = (typeof this.telemetry.windSpeed === 'number' && !isNaN(this.telemetry.windSpeed))
        ? Math.max(0, this.telemetry.windSpeed)
        : 8.0;
      // Normalization: nominal calm (0 m/s) to gale (35 m/s)
      const normSpeed = Math.min(1, Math.max(0, speed / 35));
      const targetCutoff = 250 + (3800 - 250) * normSpeed;

      if (this.windFilter) {
        this.windFilter.frequency.rampTo(targetCutoff, 0.8);
      }

      if (this.windGain) {
        const windVolume = 0.08 + normSpeed * 0.45;
        this.windGain.gain.rampTo(windVolume, 0.8);
      }

      // 3. Voice 3: Vegetation Index (NDVI) gain adjustment
      const ndvi = typeof this.telemetry.ndvi === 'number' ? this.telemetry.ndvi : 0.45;
      const normNdvi = Math.max(0, Math.min(1, (ndvi + 0.1) / 0.9));
      if (this.chimeGain) {
        const chimeVol = 0.2 + normNdvi * 0.5;
        this.chimeGain.gain.rampTo(chimeVol, 0.6);
      }

      // 4. Voice 4: Thermal Pulse (Active Fire) gain adjustment
      const fire = typeof this.telemetry.fireIndex === 'number' ? this.telemetry.fireIndex : 0.0;
      const normFire = Math.max(0, Math.min(1, fire));
      if (this.pulseGain) {
        const pulseVol = 0.15 + normFire * 0.75;
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

    if (normFire > 0.02 && this.pulseSynth) {
      try {
        const velocity = 0.35 + normFire * 0.65;
        const note = normFire > 0.6 ? 'D1' : 'A0';
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
        const velocity = 0.2 + normNdvi * 0.6;
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
      this.reverb, this.limiter,
      this.fftAnalyser, this.waveformAnalyser,
      this.masterGain
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
