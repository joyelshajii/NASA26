# TerraSonus: The Earth Information Jukebox

> NASA International Space Apps Challenge 2026
> Challenge: The Earth Information Jukebox
> Target Global Awards: Art & Technology | Most Inspirational | Best Use of Data

---

## Executive Summary

TerraSonus transforms visual data from NASA's Earth Information Center (EIC) into an accessible, real-time auditory symphony. By combining multi-spectral satellite telemetry with deterministic mathematical sound synthesis, TerraSonus allows researchers, educators, students, and Blind or Low-Vision (BLV) communities to listen to the pulse of our changing planet.

---

## The Core Problem

Over 2.2 billion people worldwide live with visual impairments (WHO). While NASA's Earth Information Center provides stunning visual frameworks for climate change, deforestation, and atmospheric dynamics, these datasets remain largely silent and inaccessible to non-sighted audiences. Furthermore, cognitive visual fatigue often obscures subtle multi-decadal trends that human auditory perception can detect with rapid sensitivity.

---

## The Solution: Multi-Sensory Planetary Sonification

TerraSonus creates a 1-to-1 mathematical bridge between peer-reviewed NASA Earth observation datasets and Web Audio synthesis (Tone.js). 

Key Features:
1. Interactive 3D Earth: Procedural WebGL globe with offline resilience, day/night terminator, atmospheric Fresnel glow, and coordinate hot spots.
2. Harmonic Constraint Engine: Constrains all frequencies to an A Minor / C Major Pentatonic grid, guaranteeing that the planetary soundscape remains musical, evocative, and non-dissonant.
3. Climate Time Machine (1980 to 2026): Scrub across 47 years of observation. As temperatures climb, the root drone audibly climbs in pitch while Arctic ice chimes diminish.
4. Curated Jukebox Tracks: One-click narrative tracks for Arctic Ice Retreat, Pulse of the Amazon Basin, Global Marine Heatwaves, and Carbon Trajectory.
5. Blind & Low-Vision Accessibility: Integrated Web Speech narration, WCAG 2.1 AAA high-contrast toggle, ARIA live regions, and full keyboard navigation.
6. Interactive Sound Guide & Live Legend: First-time visitor onboarding tutorial with isolated instrument audio previews and continuous live indicators mapping sounds to NASA datasets.
7. Real-Time Spectral Visualizer: 64-bin FFT frequency spectrum with peak-hold physics and cubic bezier oscilloscope waveform.

---

## Alignment with NASA Judging Criteria (5 Pillars)

### 1. Impact
- Solves data exclusion for 2.2+ billion visually impaired individuals worldwide.
- Implements Web Speech synthesis narration and keyboard controls for classrooms and museums.
- Provides researchers an auditory channel to perceive micro-temporal anomalies faster than visual inspection.

### 2. Creativity
- Synthesizes multi-variate telemetry into a cohesive 4-voice harmonic chamber.
- Implements audio-reactive atmospheric pulse where 3D planetary shaders breathe in sync with sound synthesis.
- Replaces generic dashboards with an immersive, tactile sensory experience.

### 3. Scientific Validity
TerraSonus rejects random noise. All acoustic parameters are governed by deterministic formulas:
- Surface Temperature Anomaly (NASA GISTEMP v4): f(deltaT) = 55.0 * 2^(deltaT / 12) Hz
- Wind Velocity (NASA POWER / GEOS-FP): fc = 250 + 3550 * ((W - Wmin) / (Wmax - Wmin)) Hz
- Biosphere Vegetation (MODIS NDVI): Pentatonic note quantization with velocity = 0.2 + 0.6 * NDVI
- Active Fires & Thermal Anomalies (VIIRS): Pulse Interval = 2800 - (fireIndex * 2400) ms

### 4. Relevance
Directly answers "The Earth Information Jukebox" challenge requirements from NASA EIC. Integrates open data across 5 distinct NASA missions and centers with full citations.

### 5. Presentation
- High-contrast editorial typography (Instrument Serif paired with Inter and JetBrains Mono).
- Liquid glassmorphic layout inspired by modern design systems.
- Zero extraneous clutter: instantly understandable within 5 seconds of opening.

---

## NASA Open Data Credits & Attributions

| Dataset / Mission | Agency / Center | Product Citation | Link |
| :--- | :--- | :--- | :--- |
| Earth Information Center | NASA Headquarters | Core Earth Vital Signs Framing | https://science.nasa.gov/earth/earth-information-center/ |
| GISTEMP v4 | NASA Goddard Institute for Space Studies | Global Surface Temperature Anomalies (1880-present) | https://data.giss.nasa.gov/gistemp/ |
| NASA POWER | NASA Langley Research Center | Surface Meteorology and Solar Energy Telemetry | https://power.larc.nasa.gov/ |
| MODIS Terra/Aqua | NASA GSFC / LP DAAC | MOD13A2 16-Day Vegetation Indices (NDVI) | https://lpdaac.usgs.gov/ |
| VIIRS Active Fire | NASA EOSDIS / NOAA | 375m Thermal Anomaly & Active Fire Data | https://firms.modaps.eosdis.nasa.gov/ |
| NASA GIBS | NASA Earthdata | Global Imagery Browse Services | https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs |

---

## Tech Stack & Architecture

- Frontend Framework: React 19 + Vite 8
- Sound Synthesis: Tone.js (Web Audio API)
- 3D Graphics: Three.js (Procedural Canvas Textures, Additive Blending Atmosphere, OrbitControls)
- Styling: Tailwind CSS v4 + Liquid Glassmorphism
- Typography: Instrument Serif, Inter, JetBrains Mono
- Icons: Lucide React (Zero emojis, zero external image asset dependencies)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
git clone https://github.com/your-team/terrasonus.git
cd terrasonus
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## Keyboard Navigation

- Space: Play / Pause Audio
- ArrowLeft / ArrowRight: Scrub Climate Timeline (1980 to 2026)
- 1 to 5: Select Regional Biomes (Amazon, Sahara, Arctic, Coral Reef, Indo-Gangetic)
- A: Toggle Accessibility Speech Narration & High Contrast
- ? / H: Toggle Sound Guide & Audio Tutorial Dialog
