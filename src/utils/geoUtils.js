import * as THREE from 'three';

/**
 * 5 Canonical Regional Hotspots with rich climate telemetry.
 * Matches regionalHotspots in nasaDatasets.js with robust alias resolution.
 */
export const DEFAULT_REGIONS = [
  {
    id: 'amazon',
    aliases: ['amazon', 'amazon_basin', 'amazon-basin', 'amazon-rainforest'],
    name: 'Amazon Rainforest',
    subtitle: 'Biosphere & Carbon Sinks',
    category: 'BIOSPHERE',
    lat: -3.4653,
    lon: -62.2159,
    color: '#10b981',
    colorHex: 0x10b981,
    accentClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    metrics: [
      { label: 'CO2 FLUX', value: '-1.2 Gt/yr' },
      { label: 'NDVI CANOPY', value: '0.82 High' },
      { label: 'FIRE INDEX', value: '0.45 Mod' }
    ],
    narrative: 'High vegetation density drives crystalline pentatonic chimes, while deforestation zones create harmonic gaps.'
  },
  {
    id: 'sahara',
    aliases: ['sahara', 'sahara_desert', 'sahara-desert'],
    name: 'Sahara Desert',
    subtitle: 'Solar Radiance & Mineral Dust',
    category: 'ATMOSPHERE',
    lat: 23.4162,
    lon: 25.6628,
    color: '#f59e0b',
    colorHex: 0xf59e0b,
    accentClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    metrics: [
      { label: 'SOLAR FLUX', value: '1,120 W/m2' },
      { label: 'AOD 550nm', value: '0.86 Index' },
      { label: 'WIND SPEED', value: '8.5 m/s' }
    ],
    narrative: 'Minimal vegetation yields hollow tones, while high solar heat and shifting winds drive sweeping resonant filters.'
  },
  {
    id: 'arctic',
    aliases: ['arctic', 'arctic_ocean', 'arctic-ocean', 'svalbard', 'cryosphere'],
    name: 'Arctic Cryosphere',
    subtitle: 'Albedo Deficit & Polar Amplification',
    category: 'CRYOSPHERE',
    lat: 78.2232,
    lon: 15.6267,
    color: '#38bdf8',
    colorHex: 0x38bdf8,
    accentClass: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
    metrics: [
      { label: 'SEA ICE', value: '4.10 M km2' },
      { label: 'ALBEDO', value: '0.54 Refl' },
      { label: 'TEMP ANOMALY', value: '+2.80 C' }
    ],
    narrative: 'The fastest warming zone on Earth, exhibiting high-frequency pitch elevation and decaying ice harmonics.'
  },
  {
    id: 'great-barrier-reef',
    aliases: ['great-barrier-reef', 'great_barrier_reef', 'barrier_reef', 'reef'],
    name: 'Great Barrier Reef',
    subtitle: 'Marine Thermal Stress & Calcification',
    category: 'OCEANIC',
    lat: -18.2871,
    lon: 147.6992,
    color: '#06b6d4',
    colorHex: 0x06b6d4,
    accentClass: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    metrics: [
      { label: 'DHW INDEX', value: '+4.2 C-wks' },
      { label: 'OCEAN PH', value: '8.06' },
      { label: 'TEMP ANOMALY', value: '+1.42 C' }
    ],
    narrative: 'Sustained marine heatwave conditions translate to an elevated sub-bass tension and oscillating ocean textures.'
  },
  {
    id: 'indus-gangetic',
    aliases: ['indus-gangetic', 'indo_gangetic', 'indo-gangetic', 'indo_gangetic_plain', 'ganga'],
    name: 'Indo-Gangetic Basin',
    subtitle: 'Tropospheric Aerosols & Hydrology',
    category: 'ANTHROPOCENE',
    lat: 28.6139,
    lon: 77.2090,
    color: '#ef4444',
    colorHex: 0xef4444,
    accentClass: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    metrics: [
      { label: 'PM2.5 DENSITY', value: '142 ug/m3' },
      { label: 'FIRE INDEX', value: '0.60 High' },
      { label: 'TEMP ANOMALY', value: '+1.38 C' }
    ],
    narrative: 'Dense agricultural cycles and urban heat islands generate rapid percussive thermal pulses.'
  }
];

/**
 * Procedural polygon coordinates for global continents [longitude, latitude].
 * Guaranteed 100% offline with zero external network or image dependencies.
 */
export const CONTINENT_POLYGONS = [
  {
    name: 'North America',
    pts: [
      [-168, 65], [-160, 71], [-140, 70], [-120, 72], [-90, 70], [-80, 65],
      [-75, 62], [-65, 60], [-60, 50], [-64, 45], [-70, 42], [-75, 35],
      [-80, 25], [-82, 25], [-88, 30], [-97, 26], [-97, 20], [-88, 16],
      [-83, 10], [-77, 8], [-80, 9], [-85, 12], [-95, 17], [-105, 22],
      [-110, 24], [-115, 30], [-120, 34], [-124, 40], [-125, 50], [-130, 55],
      [-135, 58], [-160, 56], [-168, 65]
    ]
  },
  {
    name: 'South America',
    pts: [
      [-77, 8], [-72, 12], [-62, 11], [-50, 0], [-35, -5], [-35, -10],
      [-38, -15], [-40, -22], [-45, -24], [-50, -30], [-58, -35], [-65, -42],
      [-68, -54], [-74, -53], [-75, -45], [-72, -35], [-71, -25], [-76, -15],
      [-81, -5], [-79, 2], [-77, 8]
    ]
  },
  {
    name: 'Greenland',
    pts: [
      [-50, 60], [-40, 60], [-25, 70], [-18, 77], [-20, 82], [-40, 83],
      [-60, 82], [-55, 75], [-50, 60]
    ]
  },
  {
    name: 'Africa',
    pts: [
      [-6, 36], [0, 36], [10, 37], [12, 33], [25, 32], [32, 31], [35, 28],
      [43, 12], [51, 12], [45, 5], [40, -3], [40, -12], [35, -24], [32, -28],
      [28, -33], [18, -35], [18, -30], [12, -18], [9, -5], [9, 5], [3, 6],
      [-5, 5], [-15, 11], [-17, 15], [-17, 21], [-12, 28], [-6, 36]
    ]
  },
  {
    name: 'Madagascar',
    pts: [[44, -12], [50, -12], [50, -25], [44, -25], [44, -12]]
  },
  {
    name: 'Eurasia',
    pts: [
      [-9, 36], [-9, 43], [-1, 46], [-5, 48], [2, 51], [8, 54], [8, 58],
      [12, 56], [18, 55], [24, 60], [28, 70], [20, 71], [15, 68], [10, 63],
      [5, 62], [10, 58], [5, 54], [2, 51], [0, 48], [-1, 46], [3, 43],
      [12, 44], [16, 40], [23, 38], [28, 41], [35, 42], [40, 44], [50, 45],
      [60, 42], [68, 24], [72, 19], [75, 12], [78, 8], [80, 13], [85, 21],
      [88, 22], [90, 22], [100, 14], [104, 10], [104, 1], [108, 12],
      [108, 16], [118, 22], [121, 25], [122, 30], [120, 38], [128, 38],
      [130, 42], [132, 43], [140, 50], [143, 58], [160, 60], [170, 66],
      [180, 67], [180, 72], [170, 72], [140, 74], [100, 76], [70, 73],
      [60, 70], [50, 67], [40, 67], [30, 70], [20, 70], [10, 60], [0, 55],
      [-9, 45], [-9, 36]
    ]
  },
  {
    name: 'Arabia',
    pts: [[35, 31], [40, 22], [50, 15], [55, 22], [58, 25], [50, 30], [45, 30], [35, 31]]
  },
  {
    name: 'British Isles',
    pts: [[-5, 50], [0, 51], [1, 53], [-2, 58], [-5, 58], [-6, 54], [-5, 50]]
  },
  {
    name: 'Japan',
    pts: [[130, 32], [136, 35], [141, 40], [144, 44], [141, 43], [139, 37], [132, 33], [130, 32]]
  },
  {
    name: 'Australia',
    pts: [
      [114, -22], [115, -34], [130, -32], [138, -35], [148, -38], [150, -34],
      [153, -28], [145, -15], [142, -10], [136, -12], [130, -12], [122, -17],
      [114, -22]
    ]
  },
  {
    name: 'New Zealand',
    pts: [[172, -35], [178, -38], [174, -42], [170, -46], [167, -46], [172, -35]]
  },
  {
    name: 'Antarctica',
    pts: [
      [-180, -78], [-120, -75], [-60, -65], [-30, -72], [0, -70], [60, -68],
      [120, -66], [150, -72], [180, -78], [180, -90], [-180, -90], [-180, -78]
    ]
  },
  {
    name: 'Indonesia',
    pts: [[95, 5], [105, -5], [115, -8], [108, -7], [100, -1], [95, 5]]
  },
  {
    name: 'Borneo',
    pts: [[109, 1], [117, 4], [119, 0], [114, -4], [109, 1]]
  },
  {
    name: 'New Guinea',
    pts: [[131, -1], [140, -3], [150, -9], [145, -8], [135, -4], [131, -1]]
  }
];

/**
 * Converts latitude and longitude to a 3D Vector3 on a sphere of radius R.
 * Matches Three.js SphereGeometry UV mapping exactly.
 */
export function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
