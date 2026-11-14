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
    title: 'Track 01: Arctic Ice Retreat',
    years: [1985, 2005, 2026],
    description: 'Witness four decades of polar warming and sea ice decline through pitch transformation.',
    focusMetrics: ['tempAnomaly', 'arcticIceExtent'],
    sonificationProfile: {
      leadInstrument: 'Ice Crystal Resonator',
      harmonicBehavior: 'Frequency ascent coupled with decaying resonance as ice volume contracts',
      bassFloor: 'Glacial sub-rumble diminishing toward 2026'
    }
  },
  {
    id: 'amazon-pulse',
    title: 'Track 02: Pulse of the Amazon Basin',
    years: [1990, 2010, 2026],
    description: 'Acoustic contrast between pristine biosphere canopy and encroaching drought cycles.',
    focusMetrics: ['ndvi', 'wildfireIndex', 'tempAnomaly'],
    sonificationProfile: {
      leadInstrument: 'Canopy Flute and Pentatonic Marimba',
      harmonicBehavior: 'Rich multi-harmonic chords thinning out during high fire and drought episodes',
      bassFloor: 'Warm low-end pulse modulated by evapotranspiration rate'
    }
  },
  {
    id: 'marine-heatwaves',
    title: 'Track 03: Global Marine Heatwave',
    years: [1995, 2015, 2026],
    description: 'Thermal expansion of ocean waters captured in sub-bass frequency escalation.',
    focusMetrics: ['oceanHeatContent', 'tempAnomaly'],
    sonificationProfile: {
      leadInstrument: 'Sub-surface Ocean Drone',
      harmonicBehavior: 'Exponential sub-bass accumulation reflecting continuous Zettajoule uptake',
      bassFloor: 'Deep 32Hz-55Hz pressure waves with oscillatory oceanic chorus'
    }
  },
  {
    id: 'carbon-trajectory',
    title: 'Track 04: The Global Carbon Ascent',
    years: [1980, 2000, 2026],
    description: 'Atmospheric CO2 rising from 338 ppm to 426 ppm driving harmonic density.',
    focusMetrics: ['co2Ppm', 'tempAnomaly'],
    sonificationProfile: {
      leadInstrument: 'Additive Atmospheric Organ',
      harmonicBehavior: 'Successive addition of dissonant overtone layers indexed to ppm thresholds',
      bassFloor: 'Steadily stiffening fundamental tone mirroring greenhouse thermal trapping'
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

export default {
  historicalTimeSeries,
  regionalHotspots,
  planetaryStories,
  nasaCredits,
  getDataByYear,
  interpolateYearData
};
