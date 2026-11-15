/**
 * TerraSonus: The Earth Information Jukebox
 * NASA Data and Planetary Story Module
 *
 * Primary Scientific Datasets and Synthesized Telemetry:
 * - NASA Goddard Institute for Space Studies (GISTEMP v4)
 * - NASA Langley Research Center POWER Project
 * - NASA GSFC Terra/Aqua MODIS Vegetation Indices
 * - NASA EOSDIS / NOAA VIIRS Active Fire Telemetry
 * - NASA Earth Information Center (EIC) Vital Signs
 */

/**
 * Historical Time-Series Data (1980 to 2026)
 *
 * Metrics:
 * - year: Observation calendar year (1980 to 2026)
 * - tempAnomaly: Global surface temperature anomaly in degrees Celsius relative to GISTEMP baseline (1951-1980 mean)
 * - co2Ppm: Atmospheric carbon dioxide concentration in parts per million (Mauna Loa / NASA observatory records)
 * - arcticIceExtent: September Arctic sea ice minimum extent in million square kilometers (NSIDC / NASA Goddard)
 * - oceanHeatContent: Ocean heat content anomaly for upper 2000m in Zettajoules (ZJ) relative to 1955-2006 baseline
 * - wildfireIndex: Normalized global wildfire activity and biomass burning anomaly (0.0 to 1.0)
 */
export const historicalTimeSeries = [
  { year: 1980, tempAnomaly: 0.26, co2Ppm: 338.7, arcticIceExtent: 7.85, oceanHeatContent: -15.4, wildfireIndex: 0.32 },
  { year: 1981, tempAnomaly: 0.32, co2Ppm: 340.1, arcticIceExtent: 7.25, oceanHeatContent: -12.1, wildfireIndex: 0.30 },
  { year: 1982, tempAnomaly: 0.14, co2Ppm: 341.4, arcticIceExtent: 7.45, oceanHeatContent: -9.8, wildfireIndex: 0.38 },
  { year: 1983, tempAnomaly: 0.31, co2Ppm: 343.1, arcticIceExtent: 7.52, oceanHeatContent: -7.5, wildfireIndex: 0.42 },
  { year: 1984, tempAnomaly: 0.16, co2Ppm: 344.6, arcticIceExtent: 7.11, oceanHeatContent: -5.2, wildfireIndex: 0.28 },
  { year: 1985, tempAnomaly: 0.12, co2Ppm: 346.1, arcticIceExtent: 6.93, oceanHeatContent: -2.8, wildfireIndex: 0.31 },
  { year: 1986, tempAnomaly: 0.18, co2Ppm: 347.4, arcticIceExtent: 7.54, oceanHeatContent: 0.1, wildfireIndex: 0.29 },
  { year: 1987, tempAnomaly: 0.32, co2Ppm: 349.2, arcticIceExtent: 7.41, oceanHeatContent: 3.4, wildfireIndex: 0.36 },
  { year: 1988, tempAnomaly: 0.39, co2Ppm: 351.6, arcticIceExtent: 7.50, oceanHeatContent: 6.8, wildfireIndex: 0.44 },
  { year: 1989, tempAnomaly: 0.27, co2Ppm: 353.1, arcticIceExtent: 7.04, oceanHeatContent: 10.2, wildfireIndex: 0.33 },
  { year: 1990, tempAnomaly: 0.45, co2Ppm: 354.4, arcticIceExtent: 6.24, oceanHeatContent: 14.5, wildfireIndex: 0.35 },
  { year: 1991, tempAnomaly: 0.41, co2Ppm: 355.6, arcticIceExtent: 6.55, oceanHeatContent: 18.9, wildfireIndex: 0.37 },
  { year: 1992, tempAnomaly: 0.22, co2Ppm: 356.4, arcticIceExtent: 7.55, oceanHeatContent: 21.4, wildfireIndex: 0.34 },
  { year: 1993, tempAnomaly: 0.24, co2Ppm: 357.1, arcticIceExtent: 6.50, oceanHeatContent: 25.0, wildfireIndex: 0.36 },
  { year: 1994, tempAnomaly: 0.32, co2Ppm: 358.8, arcticIceExtent: 7.18, oceanHeatContent: 29.3, wildfireIndex: 0.41 },
  { year: 1995, tempAnomaly: 0.45, co2Ppm: 360.8, arcticIceExtent: 6.13, oceanHeatContent: 34.1, wildfireIndex: 0.39 },
  { year: 1996, tempAnomaly: 0.33, co2Ppm: 362.6, arcticIceExtent: 7.88, oceanHeatContent: 38.6, wildfireIndex: 0.43 },
  { year: 1997, tempAnomaly: 0.47, co2Ppm: 363.7, arcticIceExtent: 6.74, oceanHeatContent: 43.8, wildfireIndex: 0.68 },
  { year: 1998, tempAnomaly: 0.61, co2Ppm: 366.7, arcticIceExtent: 6.56, oceanHeatContent: 51.2, wildfireIndex: 0.72 },
  { year: 1999, tempAnomaly: 0.39, co2Ppm: 368.4, arcticIceExtent: 6.24, oceanHeatContent: 57.4, wildfireIndex: 0.44 },
  { year: 2000, tempAnomaly: 0.40, co2Ppm: 369.5, arcticIceExtent: 6.32, oceanHeatContent: 64.0, wildfireIndex: 0.46 },
  { year: 2001, tempAnomaly: 0.54, co2Ppm: 371.1, arcticIceExtent: 6.75, oceanHeatContent: 71.5, wildfireIndex: 0.48 },
  { year: 2002, tempAnomaly: 0.63, co2Ppm: 373.3, arcticIceExtent: 5.96, oceanHeatContent: 79.2, wildfireIndex: 0.54 },
  { year: 2003, tempAnomaly: 0.62, co2Ppm: 375.8, arcticIceExtent: 6.15, oceanHeatContent: 88.0, wildfireIndex: 0.58 },
  { year: 2004, tempAnomaly: 0.53, co2Ppm: 377.5, arcticIceExtent: 6.05, oceanHeatContent: 97.4, wildfireIndex: 0.52 },
  { year: 2005, tempAnomaly: 0.68, co2Ppm: 379.8, arcticIceExtent: 5.57, oceanHeatContent: 107.1, wildfireIndex: 0.57 },
  { year: 2006, tempAnomaly: 0.64, co2Ppm: 381.9, arcticIceExtent: 5.92, oceanHeatContent: 116.8, wildfireIndex: 0.55 },
  { year: 2007, tempAnomaly: 0.66, co2Ppm: 383.8, arcticIceExtent: 4.30, oceanHeatContent: 127.3, wildfireIndex: 0.59 },
  { year: 2008, tempAnomaly: 0.54, co2Ppm: 385.6, arcticIceExtent: 4.73, oceanHeatContent: 137.9, wildfireIndex: 0.51 },
  { year: 2009, tempAnomaly: 0.66, co2Ppm: 387.4, arcticIceExtent: 5.39, oceanHeatContent: 149.2, wildfireIndex: 0.56 },
  { year: 2010, tempAnomaly: 0.73, co2Ppm: 389.9, arcticIceExtent: 4.93, oceanHeatContent: 161.0, wildfireIndex: 0.62 },
  { year: 2011, tempAnomaly: 0.61, co2Ppm: 391.7, arcticIceExtent: 4.63, oceanHeatContent: 172.4, wildfireIndex: 0.53 },
  { year: 2012, tempAnomaly: 0.65, co2Ppm: 393.9, arcticIceExtent: 3.57, oceanHeatContent: 184.1, wildfireIndex: 0.58 },
  { year: 2013, tempAnomaly: 0.68, co2Ppm: 396.5, arcticIceExtent: 5.35, oceanHeatContent: 196.5, wildfireIndex: 0.54 },
  { year: 2014, tempAnomaly: 0.75, co2Ppm: 398.7, arcticIceExtent: 5.29, oceanHeatContent: 209.8, wildfireIndex: 0.57 },
  { year: 2015, tempAnomaly: 0.90, co2Ppm: 401.0, arcticIceExtent: 4.68, oceanHeatContent: 224.2, wildfireIndex: 0.69 },
  { year: 2016, tempAnomaly: 1.02, co2Ppm: 404.2, arcticIceExtent: 4.53, oceanHeatContent: 238.6, wildfireIndex: 0.65 },
  { year: 2017, tempAnomaly: 0.93, co2Ppm: 406.6, arcticIceExtent: 4.82, oceanHeatContent: 251.4, wildfireIndex: 0.70 },
  { year: 2018, tempAnomaly: 0.85, co2Ppm: 408.5, arcticIceExtent: 4.79, oceanHeatContent: 263.8, wildfireIndex: 0.73 },
  { year: 2019, tempAnomaly: 0.98, co2Ppm: 411.4, arcticIceExtent: 4.36, oceanHeatContent: 277.1, wildfireIndex: 0.82 },
  { year: 2020, tempAnomaly: 1.02, co2Ppm: 414.2, arcticIceExtent: 3.92, oceanHeatContent: 289.5, wildfireIndex: 0.89 },
  { year: 2021, tempAnomaly: 0.85, co2Ppm: 416.5, arcticIceExtent: 4.92, oceanHeatContent: 301.2, wildfireIndex: 0.84 },
  { year: 2022, tempAnomaly: 0.89, co2Ppm: 418.6, arcticIceExtent: 4.87, oceanHeatContent: 312.8, wildfireIndex: 0.78 },
  { year: 2023, tempAnomaly: 1.17, co2Ppm: 421.1, arcticIceExtent: 4.37, oceanHeatContent: 326.4, wildfireIndex: 0.94 },
  { year: 2024, tempAnomaly: 1.28, co2Ppm: 423.5, arcticIceExtent: 4.28, oceanHeatContent: 339.1, wildfireIndex: 0.88 },
  { year: 2025, tempAnomaly: 1.31, co2Ppm: 425.0, arcticIceExtent: 4.19, oceanHeatContent: 351.0, wildfireIndex: 0.89 },
  { year: 2026, tempAnomaly: 1.35, co2Ppm: 426.4, arcticIceExtent: 4.10, oceanHeatContent: 362.5, wildfireIndex: 0.91 }
];

/**
 * Geographic Regional Hotspots
 * Key biomes and climate-sensitive regions across Earth
 */
export const regionalHotspots = [
  {
    id: 'amazon',
    name: 'Amazon Rainforest',
    color: '#10b981',
    coordinates: [-3.4653, -62.2159],
    tempAnomaly: 1.15,
    windSpeed: 2.8,
    ndvi: 0.82,
    fireIndex: 0.45,
    narrative: 'High vegetation density drives crystalline pentatonic chimes, while deforestation zones show harmonic gaps.'
  },
  {
    id: 'sahara',
    name: 'Sahara Desert',
    color: '#f59e0b',
    coordinates: [23.4162, 25.6628],
    tempAnomaly: 1.85,
    windSpeed: 8.5,
    ndvi: 0.04,
    fireIndex: 0.05,
    narrative: 'Minimal vegetation yields hollow tones, while high solar heat and shifting winds drive sweeping resonant filters.'
  },
  {
    id: 'arctic',
    name: 'Arctic Ocean (Svalbard)',
    color: '#38bdf8',
    coordinates: [78.2232, 15.6267],
    tempAnomaly: 2.80,
    windSpeed: 6.2,
    ndvi: 0.08,
    fireIndex: 0.01,
    narrative: 'The fastest warming zone on Earth, exhibiting high-frequency pitch elevation and decaying ice harmonics.'
  },
  {
    id: 'great-barrier-reef',
    name: 'Great Barrier Reef',
    color: '#06b6d4',
    coordinates: [-18.2871, 147.6992],
    tempAnomaly: 1.42,
    windSpeed: 5.1,
    ndvi: 0.22,
    fireIndex: 0.02,
    narrative: 'Sustained marine heatwave conditions translate to an elevated sub-bass tension and oscillating ocean textures.'
  },
  {
    id: 'indus-gangetic',
    name: 'Indo-Gangetic Basin',
    color: '#ef233c',
    coordinates: [28.6139, 77.2090],
    tempAnomaly: 1.38,
    windSpeed: 3.4,
    ndvi: 0.52,
    fireIndex: 0.60,
    narrative: 'Dense agricultural cycles and urban heat islands generate rapid percussive thermal pulses.'
  }
];

/**
 * Curated Planetary Stories (Interactive Sonification Tracks)
 */
export const planetaryStories = [
  {
    id: 'arctic-retreat',
    trackNumber: '01',
    title: 'Track 01: Arctic Ice Retreat',
    theme: 'CRYOSPHERE',
    hotspotId: 'arctic',
    years: [1985, 2005, 2026],
    description: 'Witness four decades of polar warming and sea ice decline through deterministic pitch transformation.',
    details: 'Arctic sea ice minimum extent has plummeted from 7.85M km² in 1980 down to approximately 4.10M km² in 2026. As the ice volume contracts, high-frequency glacial resonances fade while the baseline thermal drone steadily climbs.',
    focusMetrics: ['tempAnomaly', 'arcticIceExtent'],
    nasaSources: ['NSIDC / NASA Goddard Sea Ice Index', 'NASA GISTEMP v4'],
    sonificationProfile: {
      leadInstrument: 'Ice Crystal Resonator (High-Freq Sine/FM)',
      harmonicBehavior: 'Frequency ascent coupled with decaying resonance as ice volume contracts',
      bassFloor: 'Glacial sub-rumble diminishing toward 2026'
    }
  },
  {
    id: 'amazon-pulse',
    trackNumber: '02',
    title: 'Track 02: Pulse of the Amazon Basin',
    theme: 'BIOSPHERE',
    hotspotId: 'amazon',
    years: [1990, 2010, 2026],
    description: 'Acoustic contrast between pristine biosphere canopy and encroaching drought cycles.',
    details: 'Tracks the evapotranspiration and green canopy health of the Amazon rainforest. Pristine forest yields dense, sparkling pentatonic arpeggios. During drought episodes and agricultural expansion, canopy chimes thin out and low-end thermal pulses escalate.',
    focusMetrics: ['ndvi', 'wildfireIndex', 'tempAnomaly'],
    nasaSources: ['MODIS Terra/Aqua 16-Day NDVI', 'VIIRS Active Fire 375m'],
    sonificationProfile: {
      leadInstrument: 'Canopy Flute & Pentatonic Chimes',
      harmonicBehavior: 'Rich multi-harmonic pentatonic chords thinning out during high fire and drought episodes',
      bassFloor: 'Warm low-end pulse modulated by evapotranspiration rate'
    }
  },
  {
    id: 'marine-heatwaves',
    trackNumber: '03',
    title: 'Track 03: Global Marine Heatwave',
    theme: 'HYDROSPHERE',
    hotspotId: 'great-barrier-reef',
    years: [1995, 2015, 2026],
    description: 'Thermal expansion of ocean waters captured in sub-bass frequency escalation.',
    details: 'Earth’s oceans absorb over 90% of excess planetary heat. This track captures the continuous accumulation of 360+ Zettajoules in the upper 2000m, driving exponential sub-bass pressure waves and modulating the ocean chorus.',
    focusMetrics: ['oceanHeatContent', 'tempAnomaly'],
    nasaSources: ['NASA JPL ECCO / NOAA Ocean Heat Content', 'GISTEMP v4'],
    sonificationProfile: {
      leadInstrument: 'Sub-surface Ocean Drone',
      harmonicBehavior: 'Exponential sub-bass accumulation reflecting continuous Zettajoule thermal uptake',
      bassFloor: 'Deep 32Hz-55Hz pressure waves with oscillatory oceanic chorus'
    }
  },
  {
    id: 'carbon-trajectory',
    trackNumber: '04',
    title: 'Track 04: The Global Carbon Ascent',
    theme: 'ATMOSPHERE',
    hotspotId: 'sahara',
    years: [1980, 2000, 2026],
    description: 'Atmospheric CO2 rising from 338 ppm to 426 ppm driving harmonic density.',
    details: 'Follows the relentless ascent of atmospheric carbon dioxide recorded from Mauna Loa and NASA atmospheric sounders (AIRS/OCO-2). As greenhouse gas concentrations climb past 400 ppm, additive overtones tighten into sustained acoustic tension.',
    focusMetrics: ['co2Ppm', 'tempAnomaly'],
    nasaSources: ['NOAA ESRL / NASA OCO-2 & AIRS', 'NASA Goddard GISTEMP'],
    sonificationProfile: {
      leadInstrument: 'Additive Atmospheric Organ',
      harmonicBehavior: 'Successive addition of overtone layers indexed to CO2 ppm milestones',
      bassFloor: 'Steadily stiffening fundamental drone mirroring greenhouse thermal trapping'
    }
  },
  {
    id: 'sahara-transatlantic',
    trackNumber: '05',
    title: 'Track 05: Sahara Aerosol & Atlantic Winds',
    theme: 'AEROSOLS',
    hotspotId: 'sahara',
    years: [1988, 2008, 2026],
    description: 'Mineral dust plumes swept across the Atlantic Ocean by powerful trade winds.',
    details: 'Billions of tons of Saharan mineral dust are lofted into the atmosphere each summer, fertilizing the Amazon and dampening Atlantic tropical cyclone formation. Mapped through sweeping resonant bandpass filters and desert thermal harmonics.',
    focusMetrics: ['windSpeed', 'tempAnomaly', 'wildfireIndex'],
    nasaSources: ['NASA POWER / MERRA-2', 'MODIS Terra Aerosol Optical Depth'],
    sonificationProfile: {
      leadInstrument: 'Resonant Sandstorm Bandpass Filter',
      harmonicBehavior: 'Sweeping filter cutoffs between 400 Hz and 3800 Hz modulated by wind velocity',
      bassFloor: 'Dry low-frequency desert thermal resonance'
    }
  },
  {
    id: 'indus-monsoon',
    trackNumber: '06',
    title: 'Track 06: Indo-Gangetic Anthropocene Pulse',
    theme: 'ANTHROPOCENE',
    hotspotId: 'indus-gangetic',
    years: [1992, 2012, 2026],
    description: 'Agricultural seasonal burning and urban heat island dynamics creating rhythmic pulses.',
    details: 'Home to over 400 million people, the Indo-Gangetic Plain undergoes intensive post-harvest crop residue burning coupled with seasonal monsoon fluctuations and intense urban heat, translated into rapid rhythmic percussive shifts.',
    focusMetrics: ['fireIndex', 'tempAnomaly', 'ndvi'],
    nasaSources: ['VIIRS Active Fire 375m', 'MODIS NDVI Surface Reflectance'],
    sonificationProfile: {
      leadInstrument: 'Thermal Pulse Membrane & High Chimes',
      harmonicBehavior: 'Accelerating percussive tempo (60 to 140 BPM) mirroring regional thermal fire density',
      bassFloor: 'Resonant sub-bass rising in concert with regional heat anomalies'
    }
  }
];

/**
 * NASA Data Credits, Attributions, and Official Repositories
 */
export const nasaCredits = {
  eic: {
    name: 'NASA Earth Information Center',
    agency: 'National Aeronautics and Space Administration',
    centers: ['NASA Headquarters', 'Goddard Space Flight Center', 'Jet Propulsion Laboratory'],
    description: 'Vital signs of the planet, Earth system models, and real-time visualization frameworks.',
    url: 'https://science.nasa.gov/earth/earth-information-center/',
    citation: 'NASA Earth Information Center (2024). Vital Signs of the Planet: Global Climate Change. National Aeronautics and Space Administration.'
  },
  gistemp: {
    name: 'GISTEMP v4 (Global Surface Temperature Anomaly Analysis)',
    agency: 'NASA / GISS',
    centers: ['NASA Goddard Institute for Space Studies'],
    description: 'Estimates of global surface temperature change updated monthly using NOAA GHCNv4 and ERSSTv5.',
    url: 'https://data.giss.nasa.gov/gistemp/',
    citation: 'GISTEMP Team (2024). GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Lenssen et al. (2019), J. Geophys. Res. Atmos., 124(12), 6307-6326.'
  },
  power: {
    name: 'NASA POWER Project (Prediction Of Worldwide Energy Resources)',
    agency: 'NASA Earth Science Division',
    centers: ['NASA Langley Research Center (LaRC)'],
    description: 'Synthesis of solar irradiance, surface meteorology, and wind dynamics derived from GMAO MERRA-2 and CERES.',
    url: 'https://power.larc.nasa.gov/',
    citation: 'NASA Langley Research Center POWER Project. NASA Applied Sciences Program, Earth Science Division.'
  },
  modis: {
    name: 'MODIS Biosphere and Land Products',
    agency: 'NASA EOSDIS',
    centers: ['NASA Goddard Space Flight Center', 'Land Processes Distributed Active Archive Center (LP DAAC)'],
    description: 'Normalized Difference Vegetation Index (NDVI) and surface reflectance monitoring from Terra and Aqua satellites.',
    url: 'https://modis.gsfc.nasa.gov/',
    citation: 'Didan, K. (2015). MOD13A2 MODIS/Terra Vegetation Indices 16-Day L3 Global 1km SIN Grid V006. NASA EOSDIS Land Processes DAAC.'
  },
  firms: {
    name: 'FIRMS (Fire Information for Resource Management System)',
    agency: 'NASA EOSDIS / NOAA',
    centers: ['NASA Goddard Space Flight Center LANCE'],
    description: 'Near real-time active fire locations and thermal anomalies detected by VIIRS 375m and MODIS sensors.',
    url: 'https://firms.modaps.eosdis.nasa.gov/',
    citation: 'NASA Earth Observing System Data and Information System (EOSDIS) Land, Atmosphere Near real-time Capability for EOS (LANCE).'
  },
  gibs: {
    name: 'GIBS (Global Imagery Browse Services)',
    agency: 'NASA Earthdata',
    centers: ['NASA Earth Science Data and Information System (ESDIS) Project'],
    description: 'Standardized full-resolution satellite imagery browse layers and WMTS visual telemetry.',
    url: 'https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs',
    citation: 'NASA Earthdata Global Imagery Browse Services (GIBS), Earth Science Data and Information System (ESDIS) Project.'
  }
};

/**
 * Retrieves the exact time-series record for a given integer year.
 * Clamps to available bounds (1980 to 2026).
 *
 * @param {number|string} year - Integer year between 1980 and 2026
 * @returns {object} Climate record object for that year
 */
export function getDataByYear(year) {
  const numericYear = Math.round(Number(year));
  const minYear = historicalTimeSeries[0].year;
  const maxYear = historicalTimeSeries[historicalTimeSeries.length - 1].year;

  if (isNaN(numericYear) || numericYear <= minYear) {
    return historicalTimeSeries[0];
  }
  if (numericYear >= maxYear) {
    return historicalTimeSeries[historicalTimeSeries.length - 1];
  }

  const match = historicalTimeSeries.find((record) => record.year === numericYear);
  return match || historicalTimeSeries[0];
}

/**
 * Linearly interpolates all climate metrics for any continuous fractional year.
 * Allows ultra-smooth audio-visual transitions when scrubbing timelines.
 * Clamps to available bounds (1980.0 to 2026.0).
 *
 * @param {number|string} fractionalYear - Floating-point year (e.g., 1995.5)
 * @returns {object} Interpolated climate metrics object
 */
export function interpolateYearData(fractionalYear) {
  const numericYear = Number(fractionalYear);
  const minYear = historicalTimeSeries[0].year;
  const maxYear = historicalTimeSeries[historicalTimeSeries.length - 1].year;

  if (isNaN(numericYear) || numericYear <= minYear) {
    return { ...historicalTimeSeries[0] };
  }
  if (numericYear >= maxYear) {
    return { ...historicalTimeSeries[historicalTimeSeries.length - 1] };
  }

  const baseYear = Math.floor(numericYear);
  const fraction = numericYear - baseYear;

  const currentIndex = historicalTimeSeries.findIndex((record) => record.year === baseYear);
  if (currentIndex === -1 || currentIndex >= historicalTimeSeries.length - 1) {
    return getDataByYear(numericYear);
  }

  const current = historicalTimeSeries[currentIndex];
  const next = historicalTimeSeries[currentIndex + 1];

  const lerp = (start, end, t) => start + (end - start) * t;

  return {
    year: Number(numericYear.toFixed(2)),
    tempAnomaly: Number(lerp(current.tempAnomaly, next.tempAnomaly, fraction).toFixed(3)),
    co2Ppm: Number(lerp(current.co2Ppm, next.co2Ppm, fraction).toFixed(2)),
    arcticIceExtent: Number(lerp(current.arcticIceExtent, next.arcticIceExtent, fraction).toFixed(3)),
    oceanHeatContent: Number(lerp(current.oceanHeatContent, next.oceanHeatContent, fraction).toFixed(2)),
    wildfireIndex: Number(lerp(current.wildfireIndex, next.wildfireIndex, fraction).toFixed(3))
  };
}

/**
 * Curated Historical Climate Inflection Points & Milestones (1980-2026)
 */
export const climateMilestones = [
  {
    year: 1980,
    title: 'NASA Baseline Epoch',
    category: 'Baseline',
    tag: '1980 Baseline',
    headline: 'GISTEMP surface observation network baseline',
    description: 'Systematic global climate observation baseline established by NASA Goddard Institute for Space Studies. Atmospheric carbon stood at 338.7 ppm.',
    color: '#38bdf8',
    temp: 0.26,
    co2: 338.7,
    arctic: 7.85
  },
  {
    year: 1988,
    title: 'Hansen Senate Testimony',
    category: 'Alert',
    tag: '1988 Alert',
    headline: 'NASA alerts US Congress; IPCC founded',
    description: 'Dr. James Hansen testifies to US Senate with 99% confidence that global warming is human-driven. IPCC is formally established.',
    color: '#60a5fa',
    temp: 0.39,
    co2: 351.6,
    arctic: 7.50
  },
  {
    year: 1997,
    title: 'Kyoto Protocol Signed',
    category: 'Treaty',
    tag: '1997 Kyoto',
    headline: 'First binding international treaty on emissions',
    description: 'First international treaty adopted in Kyoto to commit industrialized economies to legally binding greenhouse gas reduction targets.',
    color: '#818cf8',
    temp: 0.47,
    co2: 363.7,
    arctic: 6.74
  },
  {
    year: 2007,
    title: 'Arctic Sea Ice Shock',
    category: 'Cryosphere',
    tag: '2007 Sea Ice',
    headline: 'Unprecedented summer polar ice retreat',
    description: 'September Arctic sea ice collapsed to 4.30 M km², breaking previous satellite records by over 1 million km² in a single melt season.',
    color: '#f59e0b',
    temp: 0.66,
    co2: 383.8,
    arctic: 4.30
  },
  {
    year: 2012,
    title: 'All-Time Record Arctic Low',
    category: 'Record Low',
    tag: '2012 Low',
    headline: 'Arctic sea ice plunges to historic minimum of 3.57 M km²',
    description: 'Lowest minimum sea ice extent in 45+ years of continuous satellite observation, down nearly 55% from the 1980 baseline.',
    color: '#f97316',
    temp: 0.65,
    co2: 393.9,
    arctic: 3.57
  },
  {
    year: 2015,
    title: 'Paris Climate Accord',
    category: 'Accord',
    tag: '2015 Paris',
    headline: '196 nations pledge to limit warming to 1.5°C',
    description: 'Global agreement adopted to hold average warming well below 2.0°C and pursue efforts toward 1.5°C. Atmospheric CO2 crosses 400 ppm.',
    color: '#ef4444',
    temp: 0.90,
    co2: 401.0,
    arctic: 4.68
  },
  {
    year: 2020,
    title: 'Global Megafire Crisis',
    category: 'Wildfire',
    tag: '2020 Megafire',
    headline: 'Australian Black Summer and Siberian peat fires',
    description: 'Unprecedented biomass burning releases 1.75 gigatons of CO2; Siberian peatlands ignite above the Arctic circle during intense heatwaves.',
    color: '#dc2626',
    temp: 1.02,
    co2: 414.2,
    arctic: 3.92
  },
  {
    year: 2023,
    title: 'Hottest Year in Human History',
    category: 'Record Peak',
    tag: '2023 Record',
    headline: 'Super El Niño & ocean thermal heat spike (+1.17°C)',
    description: 'Global mean surface temperature shatter modern records across every continent; North Atlantic ocean temperatures reach unprecedented highs.',
    color: '#e11d48',
    temp: 1.17,
    co2: 421.1,
    arctic: 4.37
  },
  {
    year: 2026,
    title: 'Present Day Observation',
    category: 'Live Telemetry',
    tag: '2026 Present',
    headline: 'Active observation epoch: +1.35°C anomaly, 426.4 ppm',
    description: 'Current real-time telemetry baseline. Arctic sea ice minimum stabilized at 4.10 M km²; ocean heat uptake exceeds 362 Zettajoules.',
    color: '#ef233c',
    temp: 1.35,
    co2: 426.4,
    arctic: 4.10
  }
];

/**
 * Historical Climate Epochs (Decadal narratives)
 */
export const climateEpochs = [
  {
    range: [1980, 1989],
    epochName: 'Epoch I: Pre-Acceleration Baseline (1980–1989)',
    color: '#38bdf8',
    status: 'Stable Cryosphere',
    narrative: 'High Arctic multi-year ice pack (>7.5 M km²) with stable circumpolar jet stream dynamics. Atmospheric CO2 hovered between 338 and 353 ppm.',
    acousticNote: 'Sub-bass drone fundamental resides near 55 Hz (A1), reflecting an undisturbed, stable planetary baseline.'
  },
  {
    range: [1990, 1999],
    epochName: 'Epoch II: Early Industrial Ascent & Kyoto (1990–1999)',
    color: '#60a5fa',
    status: 'Emerging Thermal Anomaly',
    narrative: 'NASA GISTEMP registers persistent positive temperature deviations. The Kyoto Protocol establishes first binding international reduction treaties.',
    acousticNote: 'Fundamental drone experiences initial micro-tonal elevation (~56.5 Hz). Wind resonance filter begins subtle upward expansion.'
  },
  {
    range: [2000, 2011],
    epochName: 'Epoch III: Polar Destabilization & Albedo Loss (2000–2011)',
    color: '#f59e0b',
    status: 'Cryosphere Albedo Feedback',
    narrative: 'Accelerating loss of polar sea ice triggers albedo feedback loop: exposed darker ocean water absorbs more solar radiation, accelerating polar warming.',
    acousticNote: 'Drone climbs to 57.5 Hz. Active fire membrane pulses accelerate as regional drought cycles expand across the Amazon and Mediterranean.'
  },
  {
    range: [2012, 2019],
    epochName: 'Epoch IV: Threshold Breaches & Paris Accord (2012–2019)',
    color: '#f97316',
    status: '400 ppm Milestone Breached',
    narrative: 'Atmospheric carbon permanently crosses the historic 400 ppm threshold. Sequential marine heatwaves trigger widespread coral bleaching.',
    acousticNote: 'Drone tension ascends to 58.5 Hz. Canopy pentatonic harmonies show noticeable gaps in high-deforestation zones.'
  },
  {
    range: [2020, 2026],
    epochName: 'Epoch V: Anthropocene Acceleration (2020–2026)',
    color: '#ef233c',
    status: 'Extreme Oceanic Thermal Storage',
    narrative: 'Consecutive record-breaking global temperatures (+1.35°C anomaly). Upper ocean heat content exceeds 362 Zettajoules, driving extreme weather severity.',
    acousticNote: 'Drone fundamental reaches strained 59.4 Hz (A1#). Rapid fire pulses create persistent acoustic tension mirroring planetary urgency.'
  }
];

/**
 * 10 Official NASA Earth Information Center (EIC) SVS Resource Datasets
 * Complies with the NASA Space Apps Challenge Earth Information Jukebox specifications.
 */
export const eicVisualDatasets = [
  {
    id: 'svs-5313',
    svsId: '5313',
    title: 'Change in Night Lights (2012–2023)',
    subtitle: 'NASA Earth Information Center / SVS 5313',
    theme: 'ANTHROPOCENE',
    category: 'Night Lights & Energy',
    description: 'Tracks the decadal evolution of urban illumination across the globe. High contrast between dark terrain and brilliant city light provides ideal targets for mapping intensity to audio tempo and twinkling upper pentatonic chords.',
    svsUrl: 'https://svs.gsfc.nasa.gov/5313/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Left-to-Right Luminosity Sweep (Caldwell 73 Style)',
      pitchMapping: 'Vertical coordinate Y mapped to A Minor / C Pentatonic scale (top = high frequency)',
      volumeMapping: 'Pixel luminance intensity (0-255) mapped directly to note velocity',
      rhythmMapping: 'Metropolitan cluster density mapped to rapid percussive tempo (60-140 BPM)',
      colorResponse: 'High gold/amber light triggers crystalline upper chimes (E5, G5, A5)'
    },
    audioDescription: 'Scanning high-contrast urban night lights across global terrain. Pinpoint cities trigger bright upper-register chimes against dark ocean silence.',
    type: 'night-lights',
    framesCount: 24,
    tags: ['VIIRS Day-Night Band', 'SVS 5313', 'Urban Heat', 'Luminosity']
  },
  {
    id: 'svs-3912',
    svsId: '3912',
    title: 'Global Sea Surface Currents & Temperature',
    subtitle: 'NASA Scientific Visualization Studio / SVS 3912',
    theme: 'HYDROSPHERE',
    category: 'Ocean Dynamics',
    description: 'Illustrates the fluid kinetic movement of ocean currents alongside thermal gradients. Converts continuous fluid motion and shifting temperature ribbons into evolving ambient soundscapes.',
    svsUrl: 'https://svs.gsfc.nasa.gov/3912/#media_group_349716',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Fluid Flow Vector Scan',
      pitchMapping: 'Warm surface ribbons (red/orange) trigger warm fundamentals; deep cold currents trigger sub-bass resonance',
      volumeMapping: 'Current velocity and flow density mapped to master presence and oceanic reverb',
      rhythmMapping: 'Eddy vorticity creates oscillating acoustic chorus waves',
      colorResponse: 'Cyan to red thermal transition drives resonant bandpass filter sweeps (350 Hz to 2400 Hz)'
    },
    audioDescription: 'Fluid ocean currents and thermal gradients. Swirling oceanic eddies drive sweeping resonant filters and oceanic sub-bass.',
    type: 'ocean-currents',
    framesCount: 24,
    tags: ['ECCO-2 Model', 'SVS 3912', 'Thermal Gradients', 'Currents']
  },
  {
    id: 'svs-5669',
    svsId: '5669',
    title: 'GEOS Aerosol Plumes: Smoke, Dust & Sea Salt',
    subtitle: 'NASA Goddard Earth Observing System / SVS 5669',
    theme: 'AEROSOLS',
    category: 'Atmospheric Physics',
    description: 'Monitors the transcontinental paths of smoke, mineral dust, and sea salt aerosols categorized by optical particle type. Multi-track acoustic layering where visual color bands trigger distinctive audio textures.',
    svsUrl: 'https://svs.gsfc.nasa.gov/5669/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Multi-Track Aerosol Spectral Scan',
      pitchMapping: 'Dust plumes (orange) sweep bandpass filters (400-3800 Hz); smoke (red) triggers percussive pulses; sea salt (cyan) triggers fluid sine layers',
      volumeMapping: 'Aerosol Optical Depth (AOD) opacity mapped to acoustic density',
      rhythmMapping: 'Atmospheric trade wind velocity sets arpeggiation speed',
      colorResponse: 'Red/Orange mineral plumes trigger warm transient beats and resonant filters'
    },
    audioDescription: 'Layered atmospheric aerosol plumes. Red biomass smoke, golden Saharan dust, and oceanic sea spray mapped to distinct acoustic textures.',
    type: 'aerosols',
    framesCount: 24,
    tags: ['GEOS FP', 'SVS 5669', 'Dust Plumes', 'Multi-Track']
  },
  {
    id: 'svs-5533',
    svsId: '5533',
    title: 'Air Quality & Nitrogen Dioxide Model Runs',
    subtitle: 'NASA SVS / SVS 5533',
    theme: 'ATMOSPHERE',
    category: 'Atmospheric Chemistry',
    description: 'High-resolution atmospheric models showing nitrogen dioxide (NO2) and surface emissions. Converts localized color palettes and dense industrial plumes into dynamic acoustic warning profiles.',
    svsUrl: 'https://svs.gsfc.nasa.gov/5533/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Plume Density & Contrast Scan',
      pitchMapping: 'Clean tropospheric air resonates at baseline 55 Hz (A1); elevated NO2 concentrations trigger ascending tension frequencies',
      volumeMapping: 'Trace gas parts-per-billion (ppb) mapped to note velocity',
      rhythmMapping: 'Emission gradients drive percussive intervals',
      colorResponse: 'Intense purple/yellow industrial hotspots trigger sharp metallic bell harmonics'
    },
    audioDescription: 'Atmospheric air quality models. Intense urban emission plumes introduce metallic overtone tension into the harmonic stream.',
    type: 'air-quality',
    framesCount: 24,
    tags: ['TROPOMI', 'SVS 5533', 'Tropospheric NO2', 'Urban Emissions']
  },
  {
    id: 'svs-5425',
    svsId: '5425',
    title: 'Perpetual Ocean 2: Western Boundary Currents',
    subtitle: 'NASA SVS / SVS 5425',
    theme: 'HYDROSPHERE',
    category: 'Ocean Circulation',
    description: 'High-contrast visual maps of major oceanic boundary currents including the Gulf Stream and Kuroshio. Computer vision tracks kinetic boundaries, aligning rapid current shifts with vibrant musical scales.',
    svsUrl: 'https://svs.gsfc.nasa.gov/5425/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Current Boundary Edge Detection',
      pitchMapping: 'Flow line spatial curvature mapped to pentatonic melodic sequences',
      volumeMapping: 'Water transport volume (Sverdrups) mapped to sub-surface bass presence',
      rhythmMapping: 'Kinetic flow velocity drives 16th-note arpeggiator momentum',
      colorResponse: 'High-contrast blue/white filaments drive crisp multi-note chimes'
    },
    audioDescription: 'Western boundary ocean currents. High-speed flow vectors drive rapid melodic arpeggios and rhythmic momentum.',
    type: 'perpetual-ocean',
    framesCount: 24,
    tags: ['Gulf Stream', 'SVS 5425', 'ECCO Circulation', 'High Contrast']
  },
  {
    id: 'svs-5196',
    svsId: '5196',
    title: 'DYAMOND Global Carbon Dioxide Dispersion',
    subtitle: 'NASA GSFC Global Modeling / SVS 5196',
    theme: 'ATMOSPHERE',
    category: 'Carbon Cycle',
    description: 'Showcases global atmospheric CO2 plumes swirling across planetary hemispheres over time. Visual patterns of biosphere respiration and fossil fuel combustion drive interactive harmonic synthesis.',
    svsUrl: 'https://svs.gsfc.nasa.gov/5196/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Hemispheric Plume Concentration Sweep',
      pitchMapping: 'Global CO2 concentration (ppm) tightens additive harmonic intervals',
      volumeMapping: 'Column-averaged carbon density mapped to master synth presence',
      rhythmMapping: 'Synoptic weather front winds modulate arpeggiation rate',
      colorResponse: 'Red/Magenta carbon concentrations introduce additive organ overtone layers'
    },
    audioDescription: 'Global atmospheric carbon dioxide distribution. Shifting CO2 plumes add progressive harmonic overtones to the baseline drone.',
    type: 'carbon-dioxide',
    framesCount: 24,
    tags: ['GMAO DYAMOND', 'SVS 5196', 'CO2 Respiration', 'Additive Organ']
  },
  {
    id: 'svs-5011',
    svsId: '5011',
    title: 'Lightning Events Detected from ISS (2017–2023)',
    subtitle: 'NASA ISS Lightning Imaging Sensor / SVS 5011',
    theme: 'ATMOSPHERE',
    category: 'Extreme Weather',
    description: 'Compilation of orbital optical lightning telemetry detected from the International Space Station. Features punctuated sonification where percussive hits and sudden audio triggers correspond to rapid optical flashes.',
    svsUrl: 'https://svs.gsfc.nasa.gov/5011/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Optical Flash Peak Detector',
      pitchMapping: 'Strike latitude determines pitch (tropical strikes = lower register, high-latitude strikes = high chimes)',
      volumeMapping: 'Optical flash radiance mapped directly to impact transient volume',
      rhythmMapping: 'Flash repetition rate generates spontaneous polyrhythms',
      colorResponse: 'Brilliant white/electric cyan flashes trigger explosive punchy membrane thumps and crystal bell bursts'
    },
    audioDescription: 'Orbital lightning flashes detected from space. Rapid optical lightning events trigger punctuated percussive strikes and crystal bursts.',
    type: 'lightning',
    framesCount: 24,
    tags: ['ISS LIS', 'SVS 5011', 'Optical Radiance', 'Punctuated Percussion']
  },
  {
    id: 'svs-4960',
    svsId: '4960',
    title: '3D View of an Atmospheric River System',
    subtitle: 'NASA GSFC Earth System Model / SVS 4960',
    theme: 'HYDROSPHERE',
    category: 'Precipitation & Water',
    description: 'Follows the volumetric path of a dense atmospheric river carrying moisture over the Pacific. Extracts individual frames to map moisture density and geographic spread into an immersive musical landscape.',
    svsUrl: 'https://svs.gsfc.nasa.gov/4960/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Volumetric Moisture Density Scan',
      pitchMapping: 'Altitude of water vapor corridor mapped to pitch height',
      volumeMapping: 'Total precipitable water vapor column mapped to ocean swell volume',
      rhythmMapping: 'Jet stream advection velocity controls rhythmic breathing cycle',
      colorResponse: 'Deep blue/cyan moisture channels drive cascading stereo chorus and sub-bass waves'
    },
    audioDescription: '3D atmospheric river moisture corridor. Plume thickness and moisture volume create swelling ocean wave acoustics.',
    type: 'atmospheric-river',
    framesCount: 24,
    tags: ['Atmospheric River', 'SVS 4960', 'Precipitable Water', 'Ocean Swell']
  },
  {
    id: 'svs-4950',
    svsId: '4950',
    title: 'GEDI Global Forest Canopy Height',
    subtitle: 'NASA GEDI Spaceborne LiDAR / SVS 4950',
    theme: 'BIOSPHERE',
    category: 'Forest Ecology',
    description: 'High-resolution maps of forest canopy elevation measured from the ISS. Maps color spectrums (representing varying tree canopy heights and biomass densities) to dynamic rhythm, frequency, and pentatonic pitch.',
    svsUrl: 'https://svs.gsfc.nasa.gov/4950/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Canopy Height Elevation Ladder',
      pitchMapping: 'Canopy height (0 to 60+ meters) mapped directly to ascending pentatonic harp notes (A3 to G5)',
      volumeMapping: 'Biomass density mapped to chord richness and sustain',
      rhythmMapping: 'Canopy structural heterogeneity drives rhythmic syncopation',
      colorResponse: 'Deep green/emerald hues trigger sparkling polyphonic nature chimes'
    },
    audioDescription: 'GEDI spaceborne LiDAR forest canopy height. Taller rainforest canopies trigger higher-pitched pentatonic chimes.',
    type: 'forest-height',
    framesCount: 24,
    tags: ['GEDI LiDAR', 'SVS 4950', 'Canopy Elevation', 'Pentatonic Harp']
  },
  {
    id: 'svs-13786',
    svsId: '13786',
    title: 'Data Sonification: Caldwell 73 Benchmark',
    subtitle: 'NASA SVS / Hubble & Chandra Benchmark / SVS 13786',
    theme: 'METHODOLOGY',
    category: 'Sonification Benchmark',
    description: 'NASA’s gold standard benchmark demonstrating how visual imagery is converted into auditory experiences. A scan line sweeps across coordinates: luminosity and vertical Y position translate directly into volume and pitch.',
    svsUrl: 'https://svs.gsfc.nasa.gov/13786/',
    eicUrl: 'https://science.nasa.gov/earth/earth-information-center/',
    scanDirection: 'horizontal',
    sonificationProfile: {
      scanMethod: 'Foundational Left-to-Right Coordinate Sweep',
      pitchMapping: 'Vertical Y-coordinate maps linearly to pitch (top = high frequency, bottom = low frequency)',
      volumeMapping: 'Optical luminosity (brightness) mapped to note volume',
      rhythmMapping: 'Radial star cluster concentration creates dense acoustic clusters',
      colorResponse: 'Starlight spectral hues modulate synthesizer timbre and filter cutoff'
    },
    audioDescription: 'NASA’s official sonification benchmark. A left-to-right scan line directly converts vertical coordinate position to pitch and brightness to volume.',
    type: 'caldwell-73',
    framesCount: 24,
    tags: ['Caldwell 73', 'SVS 13786', 'Scan-Line Benchmark', 'Luminosity-to-Pitch']
  }
];

export default {
  historicalTimeSeries,
  regionalHotspots,
  planetaryStories,
  eicVisualDatasets,
  nasaCredits,
  climateMilestones,
  climateEpochs,
  getDataByYear,
  interpolateYearData
};
