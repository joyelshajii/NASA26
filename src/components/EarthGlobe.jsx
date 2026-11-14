import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Globe, RotateCcw, Play, Pause } from 'lucide-react';
import { DEFAULT_REGIONS, CONTINENT_POLYGONS, latLonToVector3 } from '../utils/geoUtils.js';

/**
 * Creates high-contrast dark-mode Earth canvas texture with offline procedural landmasses.
 * Uses 100% client-side canvas generation without any CDN or external assets.
 */
function createProceduralEarthTexture(isLight = false) {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  if (isLight) {
    // 1. Serene Crystalline Oceanic Gradient: #cbe5fd to #9fcbfb with polar cyan highlights
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#c7d2fe');
    oceanGrad.addColorStop(0.2, '#bae6fd');
    oceanGrad.addColorStop(0.5, '#e0f2fe');
    oceanGrad.addColorStop(0.8, '#bae6fd');
    oceanGrad.addColorStop(1, '#c7d2fe');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Latitude and Longitude Grids (Sky Cyan)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.22)';

    for (let lat = -75; lat <= 75; lat += 15) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      if (lat === 0) {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.20)';
        ctx.lineWidth = 1;
      }
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * width;
      ctx.beginPath();
      if (lon === 0) {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.20)';
        ctx.lineWidth = 1;
      }
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 3. Draw Continental Landmasses
    for (const continent of CONTINENT_POLYGONS) {
      if (continent.pts.length < 3) continue;

      ctx.save();
      ctx.beginPath();
      const firstPt = continent.pts[0];
      ctx.moveTo(((firstPt[0] + 180) / 360) * width, ((90 - firstPt[1]) / 180) * height);

      for (let i = 1; i < continent.pts.length; i++) {
        const pt = continent.pts[i];
        ctx.lineTo(((pt[0] + 180) / 360) * width, ((90 - pt[1]) / 180) * height);
      }
      ctx.closePath();

      ctx.save();
      ctx.clip();

      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
      let minLon = 180;
      let maxLon = -180;
      let minLat = 90;
      let maxLat = -90;
      for (const [lon, lat] of continent.pts) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      const startX = Math.floor(((minLon + 180) / 360) * width);
      const endX = Math.ceil(((maxLon + 180) / 360) * width);
      const startY = Math.floor(((90 - maxLat) / 180) * height);
      const endY = Math.ceil(((90 - minLat) / 180) * height);

      const step = 16;
      for (let px = startX; px <= endX; px += step) {
        for (let py = startY; py <= endY; py += step) {
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.70)';
      ctx.stroke();

      ctx.restore();
    }

    // 4. Subtle Biome Telemetry Zones on the texture
    const biomeHalos = [
      { lon: -62.2, lat: -3.5, color: 'rgba(16, 185, 129, 0.45)', r: 65 },  // Amazon
      { lon: 25.6, lat: 23.4, color: 'rgba(245, 158, 11, 0.40)', r: 80 },   // Sahara
      { lon: 15.6, lat: 78.2, color: 'rgba(14, 165, 233, 0.45)', r: 95 },   // Arctic
      { lon: 147.7, lat: -18.3, color: 'rgba(6, 182, 212, 0.45)', r: 55 },  // Reef
      { lon: 77.2, lat: 28.6, color: 'rgba(239, 68, 68, 0.40)', r: 60 }    // Indo-Gangetic
    ];

    for (const b of biomeHalos) {
      const cx = ((b.lon + 180) / 360) * width;
      const cy = ((90 - b.lat) / 180) * height;
      const radial = ctx.createRadialGradient(cx, cy, 2, cx, cy, b.r);
      radial.addColorStop(0, b.color);
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // 1. Deep Oceanic Void: #080b12 with polar depth gradients
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#04060a');
    oceanGrad.addColorStop(0.2, '#080c16');
    oceanGrad.addColorStop(0.5, '#0b101d');
    oceanGrad.addColorStop(0.8, '#080c16');
    oceanGrad.addColorStop(1, '#04060a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Latitude and Longitude Grids (#334155/30)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.28)';

    // Parallels (every 15 degrees)
    for (let lat = -75; lat <= 75; lat += 15) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      if (lat === 0) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
        ctx.lineWidth = 1;
      }
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Meridians (every 30 degrees)
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * width;
      ctx.beginPath();
      if (lon === 0) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
        ctx.lineWidth = 1;
      }
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 3. Draw Continental Landmasses
    for (const continent of CONTINENT_POLYGONS) {
      if (continent.pts.length < 3) continue;

      ctx.save();
      ctx.beginPath();
      const firstPt = continent.pts[0];
      ctx.moveTo(((firstPt[0] + 180) / 360) * width, ((90 - firstPt[1]) / 180) * height);

      for (let i = 1; i < continent.pts.length; i++) {
        const pt = continent.pts[i];
        ctx.lineTo(((pt[0] + 180) / 360) * width, ((90 - pt[1]) / 180) * height);
      }
      ctx.closePath();

      // Clip to continent for interior topography and sensor dot matrix
      ctx.save();
      ctx.clip();

      // Continent Base: Dark Slate #1a2233
      ctx.fillStyle = '#1a2233';
      ctx.fill();

      // Subtle elevation shading
      ctx.fillStyle = '#222f46';
      ctx.fill();

      // Cybernetic Sensor Dots across landmass
      ctx.fillStyle = 'rgba(56, 189, 248, 0.20)';
      let minLon = 180;
      let maxLon = -180;
      let minLat = 90;
      let maxLat = -90;
      for (const [lon, lat] of continent.pts) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      const startX = Math.floor(((minLon + 180) / 360) * width);
      const endX = Math.ceil(((maxLon + 180) / 360) * width);
      const startY = Math.floor(((90 - maxLat) / 180) * height);
      const endY = Math.ceil(((90 - minLat) / 180) * height);

      const step = 16;
      for (let px = startX; px <= endX; px += step) {
        for (let py = startY; py <= endY; py += step) {
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Luminous Shoreline Outline in Cyan-Slate (#38bdf8 / #334155)
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.stroke();

      ctx.restore();
    }

    // 4. Subtle Biome Telemetry Zones on the texture
    const biomeHalos = [
      { lon: -62.2, lat: -3.5, color: 'rgba(16, 185, 129, 0.35)', r: 60 },  // Amazon
      { lon: 25.6, lat: 23.4, color: 'rgba(245, 158, 11, 0.30)', r: 75 },   // Sahara
      { lon: 15.6, lat: 78.2, color: 'rgba(56, 189, 248, 0.40)', r: 90 },   // Arctic
      { lon: 147.7, lat: -18.3, color: 'rgba(6, 182, 212, 0.35)', r: 50 },  // Reef
      { lon: 77.2, lat: 28.6, color: 'rgba(239, 68, 68, 0.30)', r: 55 }    // Indo-Gangetic
    ];

    for (const b of biomeHalos) {
      const cx = ((b.lon + 180) / 360) * width;
      const cy = ((90 - b.lat) / 180) * height;
      const radial = ctx.createRadialGradient(cx, cy, 2, cx, cy, b.r);
      radial.addColorStop(0, b.color);
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a circular glowing star particle texture.
 */
function createProceduralStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.8)');
  grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
  grad.addColorStop(1, 'transparent');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates subtle procedural clouds texture.
 */
function createProceduralCloudsTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, width, height);

  // Wispy cloud bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 28; i++) {
    const y = 80 + Math.random() * (height - 160);
    const x = Math.random() * width;
    const radiusX = 60 + Math.random() * 140;
    const radiusY = 15 + Math.random() * 35;

    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, Math.random() * 0.2 - 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * EarthGlobe Component
 * Interactive 3D Earth Globe with audio-reactive atmosphere, 5 hotspot beacons, and OrbitControls.
 */
export default function EarthGlobe({
  activeRegion = 'amazon',
  onSelectRegion = () => {},
  audioLevel = 0.0,
  frequencyData = null,
  customRegions = null,
  showControls = true,
  autoRotateDefault = true,
  className = '',
  theme = 'dark',
  isPlaying = false,
  togglePlay = null,
  currentYear = 2026
}) {
  const mountRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const tooltipRef = useRef(null);
  const topStemRef = useRef(null);
  const bottomStemRef = useRef(null);

  // Three.js object references for real-time manipulation
  const sceneRef = useRef(null);
  const earthMaterialRef = useRef(null);
  const starPointsRef = useRef(null);
  const ambientLightRef = useRef(null);
  const sunLightRef = useRef(null);
  const earthGroupRef = useRef(null);
  const atmosphereMeshRef = useRef(null);
  const outerHaloMeshRef = useRef(null);
  const cloudMeshRef = useRef(null);

  // Transition & Interaction State
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const autoRotateRef = useRef(autoRotateDefault);
  const isDraggingRef = useRef(false);
  const targetQuaternionRef = useRef(null);
  const currentAudioPulseRef = useRef(0.0);

  // Dynamic props & state refs to avoid tearing down the WebGL scene on state changes
  const audioLevelRef = useRef(audioLevel);
  const frequencyDataRef = useRef(frequencyData);
  const onSelectRegionRef = useRef(onSelectRegion);
  const currentRegionRef = useRef(null);
  const regionsRef = useRef([]);
  const initialThemeRef = useRef(theme);

  // Consolidate regions
  const regions = useMemo(() => {
    if (customRegions && customRegions.length > 0) {
      return customRegions;
    }
    return DEFAULT_REGIONS;
  }, [customRegions]);

  // Find active region item
  const currentRegion = useMemo(() => {
    if (!activeRegion) return regions[0];
    const match = regions.find(
      (r) => r.id === activeRegion || (r.aliases && r.aliases.includes(activeRegion))
    );
    return match || regions[0];
  }, [activeRegion, regions]);

  // Synchronize mutable refs
  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    frequencyDataRef.current = frequencyData;
  }, [frequencyData]);

  useEffect(() => {
    onSelectRegionRef.current = onSelectRegion;
  }, [onSelectRegion]);

  useEffect(() => {
    currentRegionRef.current = currentRegion;
  }, [currentRegion]);

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  // Synchronize autoRotate when default prop changes
  const [prevDefault, setPrevDefault] = useState(autoRotateDefault);
  if (prevDefault !== autoRotateDefault) {
    setPrevDefault(autoRotateDefault);
    setAutoRotate(autoRotateDefault);
  }

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Synchronize target orientation when activeRegion prop changes
  useEffect(() => {
    if (!currentRegion || !earthGroupRef.current) return;

    const coords = { lat: currentRegion.lat, lon: currentRegion.lon };
    const pos = latLonToVector3(coords.lat, coords.lon, 1.0);

    // Compute exact quaternion to orient this hotspot directly toward the camera line of sight
    const cameraDir = new THREE.Vector3(0, 0.4, 2.85).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(
      pos.clone().normalize(),
      cameraDir
    );
    targetQuaternionRef.current = q;
  }, [currentRegion]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Pre-allocated vectors for frame calculations (zero garbage collection overhead)
    const tempVec = new THREE.Vector3();
    const toCameraVec = new THREE.Vector3();
    const normalVec = new THREE.Vector3();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene & Canvas
    const isLightMode = initialThemeRef.current === 'light';
    const scene = new THREE.Scene();
    scene.background = isLightMode ? null : new THREE.Color(0x020408);
    sceneRef.current = scene;

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 2.85);

    // 3. WebGL Renderer with High-DPI support
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls with smooth inertia
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 1.6;
    controls.maxDistance = 5.2;
    controls.enablePan = false;

    controls.addEventListener('start', () => {
      isDraggingRef.current = true;
      targetQuaternionRef.current = null;
    });
    controls.addEventListener('end', () => {
      isDraggingRef.current = false;
    });

    // 5. Ambient & Directional Lighting (Atmospheric Light-Blade Horizon)
    const ambientLight = new THREE.AmbientLight(isLightMode ? 0xffffff : 0x0e1726, isLightMode ? 1.4 : 0.85);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Primary Sun Light creating sharp terminator
    const sunLight = new THREE.DirectionalLight(0xffffff, isLightMode ? 2.6 : 2.4);
    sunLight.position.set(5.5, 3.2, 4.8);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Tangential Light-Blade rim light for high-contrast limb aura
    const rimLight = new THREE.DirectionalLight(isLightMode ? 0x0284c7 : 0x38bdf8, isLightMode ? 1.8 : 1.6);
    rimLight.position.set(-6.0, -2.5, -4.5);
    scene.add(rimLight);

    // 6. Deep Space Background Starfield
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 90 + Math.random() * 50;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const tint = Math.random();
      if (tint < 0.65) {
        starColors[i * 3] = 0.9;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 1.0;
      } else if (tint < 0.85) {
        starColors[i * 3] = 0.35;
        starColors[i * 3 + 1] = 0.8;
        starColors[i * 3 + 2] = 1.0;
      } else {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.82;
        starColors[i * 3 + 2] = 0.55;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      map: createProceduralStarTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const starPoints = new THREE.Points(starGeo, starMaterial);
    starPoints.visible = !isLightMode;
    scene.add(starPoints);
    starPointsRef.current = starPoints;

    // 7. Earth Group (holds Earth Sphere, Clouds, and 3D Hotspot Pins)
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Earth Sphere (Radius: 1.0)
    const earthGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const earthTexture = createProceduralEarthTexture(isLightMode);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.12,
      emissive: new THREE.Color(isLightMode ? 0x000000 : 0x040812),
      emissiveIntensity: isLightMode ? 0.05 : 0.35
    });
    earthMaterialRef.current = earthMaterial;
    const earthMesh = new THREE.Mesh(earthGeo, earthMaterial);
    earthGroup.add(earthMesh);

    // Atmospheric Cloud Layer (Radius: 1.015)
    const cloudGeo = new THREE.SphereGeometry(1.015, 48, 48);
    const cloudTexture = createProceduralCloudsTexture();
    const cloudMaterial = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMaterial);
    earthGroup.add(cloudMesh);
    cloudMeshRef.current = cloudMesh;

    // 8. Audio-Reactive Atmosphere Glow (Dual-Sphere Fresnel Shader)
    // Inner Fresnel Rim
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float audioPulse;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
          float intensity = pow(rim, 3.2);
          float alpha = clamp(intensity * (0.65 + audioPulse * 0.75), 0.0, 1.0);
          gl_FragColor = vec4(glowColor, alpha);
        }
      `,
      uniforms: {
        glowColor: { value: new THREE.Color(0x06b6d4) }, // Radiant Cyan
        audioPulse: { value: 0.0 }
      },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 64), atmosphereMaterial);
    scene.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // Outer Atmospheric Halo Ring
    const outerHaloMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 haloColor;
        uniform float audioPulse;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
          float intensity = pow(rim, 4.0);
          float alpha = clamp(intensity * (0.45 + audioPulse * 0.90), 0.0, 1.0);
          gl_FragColor = vec4(haloColor, alpha);
        }
      `,
      uniforms: {
        haloColor: { value: new THREE.Color(0x0284c7) },
        audioPulse: { value: 0.0 }
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const outerHaloMesh = new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 64), outerHaloMaterial);
    scene.add(outerHaloMesh);
    outerHaloMeshRef.current = outerHaloMesh;

    // 9. Interactive 3D Hotspot Pins & Radar Rings for 5 Key Regions
    const markersGroup = new THREE.Group();
    earthGroup.add(markersGroup);

    const hitTargets = [];

    regions.forEach((region) => {
      const markerGroup = new THREE.Group();
      const pos = latLonToVector3(region.lat, region.lon, 1.0);
      markerGroup.position.copy(pos);

      // Orient marker group perpendicular to Earth's curvature
      markerGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pos.clone().normalize()
      );

      // 1. Surface Anchor Dot
      const anchorGeo = new THREE.SphereGeometry(0.024, 16, 16);
      const anchorMat = new THREE.MeshBasicMaterial({
        color: region.colorHex,
        transparent: true,
        opacity: 0.95
      });
      const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
      markerGroup.add(anchorMesh);

      // 2. Vertical Light Beacon (Tapered Cylinder)
      const beaconGeo = new THREE.CylinderGeometry(0.004, 0.016, 0.16, 16);
      beaconGeo.translate(0, 0.08, 0);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: region.colorHex,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      markerGroup.add(beaconMesh);

      // 3. Concentric Surface Radar Pulse Rings
      const ringGeo = new THREE.RingGeometry(0.025, 0.045, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: region.colorHex,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
      markerGroup.add(ringMesh1);

      const ringMesh2 = new THREE.Mesh(ringGeo, ringMat.clone());
      markerGroup.add(ringMesh2);

      // 4. Invisible Hit-Target Sphere for raycasting
      const hitGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false,
        wireframe: true
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { region, markerGroup, beaconMesh, ringMesh1, ringMesh2 };
      markerGroup.add(hitMesh);
      hitTargets.push(hitMesh);

      markersGroup.add(markerGroup);
    });

    // 10. Raycasting for Hover & Click Interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitTargets, false);

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    };

    const handlePointerDown = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitTargets, false);

      if (intersects.length > 0) {
        const clickedRegion = intersects[0].object.userData.region;
        if (onSelectRegionRef.current) {
          onSelectRegionRef.current(clickedRegion.id);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Initial camera focus on initial region directly facing camera line of sight
    const initialRegion = currentRegionRef.current;
    if (initialRegion) {
      const initialPos = latLonToVector3(initialRegion.lat, initialRegion.lon, 1.0);
      const cameraDir = new THREE.Vector3(0, 0.4, 2.85).normalize();
      const initialQuat = new THREE.Quaternion().setFromUnitVectors(
        initialPos.clone().normalize(),
        cameraDir
      );
      earthGroup.quaternion.copy(initialQuat);
    }

    // 11. Animation & Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Controls update with damping
      controls.update();

      // Audio-reactive calculation using mutable refs without restarting the WebGL loop
      let rawAudio = 0;
      const lvl = audioLevelRef.current;
      const freq = frequencyDataRef.current;
      if (typeof lvl === 'number') {
        rawAudio = Math.max(0, Math.min(1, lvl));
      } else if (freq && freq.length > 0) {
        let sum = 0;
        const count = Math.min(freq.length, 24);
        for (let i = 0; i < count; i++) {
          const val = freq[i];
          if (val <= 0 && val >= -140) {
            sum += Math.max(0, Math.min(1, (val + 90) / 80));
          } else if (val > 1) {
            sum += Math.max(0, Math.min(1, val / 255));
          } else {
            sum += Math.max(0, val);
          }
        }
        rawAudio = sum / count;
      }

      // Smooth attack/decay for atmosphere pulse
      const smoothing = rawAudio > currentAudioPulseRef.current ? 0.22 : 0.08;
      currentAudioPulseRef.current += (rawAudio - currentAudioPulseRef.current) * smoothing;
      const pulse = currentAudioPulseRef.current;

      // Pulse Atmosphere mesh scale and shader uniforms
      if (atmosphereMeshRef.current && outerHaloMeshRef.current) {
        const scaleVal = 1.0 + pulse * 0.06;
        atmosphereMeshRef.current.scale.set(scaleVal, scaleVal, scaleVal);
        atmosphereMaterial.uniforms.audioPulse.value = pulse;

        const haloScale = 1.0 + pulse * 0.08;
        outerHaloMeshRef.current.scale.set(haloScale, haloScale, haloScale);
        outerHaloMaterial.uniforms.audioPulse.value = pulse;
      }

      // Smooth Quaternion Slerp to active region
      if (targetQuaternionRef.current && !isDraggingRef.current) {
        earthGroup.quaternion.slerp(targetQuaternionRef.current, 0.05);
        if (earthGroup.quaternion.angleTo(targetQuaternionRef.current) < 0.003) {
          targetQuaternionRef.current = null;
        }
      } else if (autoRotateRef.current && !isDraggingRef.current) {
        // Gentle planetary idle rotation
        earthGroup.rotateY(0.0009);
      }

      // Differential Cloud Rotation
      if (cloudMeshRef.current) {
        cloudMeshRef.current.rotateY(0.0014);
      }

      // Animate 3D Hotspot Beacons & Radar Rings
      const curReg = currentRegionRef.current;
      hitTargets.forEach((hit) => {
        const { region, beaconMesh, ringMesh1, ringMesh2 } = hit.userData;
        const isSelected =
          curReg &&
          (region.id === curReg.id || (region.aliases && region.aliases.includes(curReg.id)));

        // Radar pulse phase 1 & 2
        const phase1 = (elapsed * 1.5) % 1;
        const phase2 = (elapsed * 1.5 + 0.5) % 1;

        const scale1 = 1.0 + phase1 * 2.2;
        const scale2 = 1.0 + phase2 * 2.2;
        ringMesh1.scale.set(scale1, scale1, 1);
        ringMesh2.scale.set(scale2, scale2, 1);

        ringMesh1.material.opacity = (1 - phase1) * (isSelected ? 0.95 : 0.6);
        ringMesh2.material.opacity = (1 - phase2) * (isSelected ? 0.95 : 0.6);

        // Active region beacon elevation & pulse
        if (isSelected) {
          const beaconScaleY = 1.4 + Math.sin(elapsed * 4) * 0.2 + pulse * 0.6;
          beaconMesh.scale.set(1.4, beaconScaleY, 1.4);
          beaconMesh.material.opacity = 0.95;
        } else {
          beaconMesh.scale.set(1.0, 1.0, 1.0);
          beaconMesh.material.opacity = 0.72;
        }
      });

      // Update projected 2D screen positions for active tooltip badge with frame-perfect GPU synchronization
      const tooltipEl = tooltipRef.current;
      if (tooltipEl && curReg) {
        const activeHit = hitTargets.find(
          (h) => h.userData.region.id === curReg.id ||
            (h.userData.region.aliases && h.userData.region.aliases.includes(curReg.id))
        );

        if (activeHit) {
          activeHit.getWorldPosition(tempVec);
          toCameraVec.copy(camera.position).sub(tempVec).normalize();
          normalVec.copy(tempVec).normalize();
          const dotVal = normalVec.dot(toCameraVec);
          const isFacingCamera = dotVal > 0.15;

          if (isFacingCamera) {
            tempVec.project(camera);
            const domW = renderer.domElement.clientWidth || container.clientWidth;
            const domH = renderer.domElement.clientHeight || container.clientHeight;

            const screenX = (tempVec.x * 0.5 + 0.5) * domW;
            const screenY = (-tempVec.y * 0.5 + 0.5) * domH;

            // Half-width of card for boundary protection
            const cardHalfWidth = 135;
            const clampedX = Math.max(cardHalfWidth + 12, Math.min(domW - cardHalfWidth - 12, screenX));
            const stemOffset = Math.max(-90, Math.min(90, screenX - clampedX));

            // Determine vertical placement:
            // Default: place BELOW the hotspot (stem at top, card body below),
            // strictly ensuring it never floats above or covers the top options HUD.
            // Only flip ABOVE if near the very bottom of the viewport where there is no room below.
            const isNearBottom = screenY > domH - 175;

            if (isNearBottom) {
              if (topStemRef.current) topStemRef.current.style.display = 'none';
              if (bottomStemRef.current) {
                bottomStemRef.current.style.display = 'block';
                bottomStemRef.current.style.transform = `translateX(${stemOffset}px)`;
              }
              tooltipEl.style.transform = `translate3d(${clampedX}px, ${screenY}px, 0) translate(-50%, -100%)`;
            } else {
              if (topStemRef.current) {
                topStemRef.current.style.display = 'block';
                topStemRef.current.style.transform = `translateX(${stemOffset}px)`;
              }
              if (bottomStemRef.current) bottomStemRef.current.style.display = 'none';
              // Ensure top of stem/card never clips into the top options bar (header occupies y = 16 to 64px)
              const safeY = Math.max(68, screenY);
              tooltipEl.style.transform = `translate3d(${clampedX}px, ${safeY}px, 0) translate(-50%, 0)`;
            }

            // Smooth fade near horizon boundary
            const edgeAlpha = Math.min(1, Math.max(0, (dotVal - 0.15) / 0.15));
            tooltipEl.style.opacity = edgeAlpha.toFixed(2);
            tooltipEl.style.display = 'block';
          } else {
            tooltipEl.style.display = 'none';
          }
        } else {
          tooltipEl.style.display = 'none';
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Responsive Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 13. Component Cleanup & Unmount
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);

      controls.dispose();
      renderer.dispose();
      earthGeo.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      cloudGeo.dispose();
      cloudMaterial.dispose();
      cloudTexture.dispose();
      atmosphereMaterial.dispose();
      outerHaloMaterial.dispose();
      starGeo.dispose();
      starMaterial.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [regions]);

  // Handle live theme switching for Three.js scene
  useEffect(() => {
    const isLight = theme === 'light';
    if (!sceneRef.current || !earthMaterialRef.current) return;

    const newTexture = createProceduralEarthTexture(isLight);
    earthMaterialRef.current.map = newTexture;
    earthMaterialRef.current.emissive = new THREE.Color(isLight ? 0x000000 : 0x040812);
    earthMaterialRef.current.emissiveIntensity = isLight ? 0.05 : 0.35;
    earthMaterialRef.current.needsUpdate = true;

    if (sceneRef.current) {
      sceneRef.current.background = isLight ? null : new THREE.Color(0x020408);
    }

    if (starPointsRef.current) {
      starPointsRef.current.visible = !isLight;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(isLight ? 0xffffff : 0x0e1726);
      ambientLightRef.current.intensity = isLight ? 1.4 : 0.85;
    }
    if (sunLightRef.current) {
      sunLightRef.current.intensity = isLight ? 2.6 : 2.4;
    }

    if (atmosphereMeshRef.current && atmosphereMeshRef.current.material) {
      atmosphereMeshRef.current.material.uniforms.glowColor.value.setHex(isLight ? 0x0284c7 : 0x06b6d4);
    }
    if (outerHaloMeshRef.current && outerHaloMeshRef.current.material) {
      outerHaloMeshRef.current.material.uniforms.haloColor.value.setHex(isLight ? 0x38bdf8 : 0x0284c7);
    }
  }, [theme]);

  // Reset Camera View
  const handleResetView = useCallback(() => {
    if (!currentRegion || !earthGroupRef.current) return;
    const pos = latLonToVector3(currentRegion.lat, currentRegion.lon, 1.0);
    const cameraDir = new THREE.Vector3(0, 0.4, 2.85).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(
      pos.clone().normalize(),
      cameraDir
    );
    targetQuaternionRef.current = q;
  }, [currentRegion]);

  return (
    <div className={`relative w-full h-full min-h-[400px] overflow-hidden select-none ${theme === 'light' ? 'bg-transparent' : 'bg-black'} font-inter ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Vignette Overlay */}
      <div className={`absolute inset-0 pointer-events-none ${
        theme === 'light' 
          ? 'bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(241,245,249,0.7)_100%)]' 
          : 'bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.85)_95%)]'
      }`} />

      {/* Top Header HUD Telemetry - Z-30 to guarantee priority and visibility above 3D space */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
        <div className={`flex items-center gap-2.5 backdrop-blur-xl border px-3 py-2 rounded-xl shadow-xl pointer-events-auto ${
          theme === 'light'
            ? 'bg-white/90 border-slate-200/90 text-slate-900 shadow-slate-200/50'
            : 'bg-black/85 border-white/10 text-white shadow-2xl'
        }`}>
          <Globe className="w-4 h-4 text-[#ef233c] animate-spin-slow shrink-0" />
          <div>
            <div className={`text-[10px] tracking-wider uppercase font-semibold ${
              theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
            }`}>
              TerraSonus Planetary Model
            </div>
            <div className={`text-sm font-semibold font-manrope flex items-center gap-2 ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              <span>{currentRegion.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ef233c]/15 border border-[#ef233c]/40 text-[#ef233c] font-semibold">
                {currentRegion.category}
              </span>
              {currentYear && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                  theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/20 text-zinc-300'
                }`}>
                  {Math.round(currentYear)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Control Badges: Start Listening, Auto-Rotate & Reset */}
        {showControls && (
          <div className="flex items-center gap-2 pointer-events-auto">
            {togglePlay && (
              <button
                type="button"
                onClick={togglePlay}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-manrope transition-all border cursor-pointer ${
                  isPlaying
                    ? 'bg-[#ef233c] text-white border-[#ef233c] shadow-lg shadow-red-950/50'
                    : (theme === 'light'
                        ? 'bg-red-50 hover:bg-[#ef233c] text-[#ef233c] hover:text-white border-red-200'
                        : 'bg-[#ef233c]/15 hover:bg-[#ef233c] text-[#ef233c] hover:text-white border-[#ef233c]/40')
                }`}
                title={isPlaying ? "Pause Acoustic Stream" : "Start Listening to Planetary Sonification"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Listening</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const nextState = !autoRotate;
                setAutoRotate(nextState);
                autoRotateRef.current = nextState;
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                autoRotate
                  ? 'bg-[#ef233c]/20 border-[#ef233c]/60 text-white shadow-lg shadow-red-950/50'
                  : (theme === 'light'
                      ? 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      : 'bg-black/80 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700')
              }`}
              title="Toggle Planetary Auto-Rotation"
            >
              <span>{autoRotate ? 'Auto-Rotate: On' : 'Auto-Rotate: Off'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetView}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  : 'bg-black/80 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700'
              }`}
              title="Re-Center on Active Region"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`} />
              <span>Reset View</span>
            </button>
          </div>
        )}
      </div>

      {/* Screen-Space Holographic Beacon Badge (Direct GPU Transform Sync with 3D Hotspot) */}
      <div
        ref={tooltipRef}
        className="absolute top-0 left-0 pointer-events-auto z-20 will-change-transform"
        style={{ display: 'none' }}
      >
        {/* Top Beacon Pointer Stem (when card is below hotspot - pointing up to hotspot) */}
        <div
          ref={topStemRef}
          className="w-0.5 h-4 mx-auto"
          style={{
            backgroundColor: currentRegion.color || '#ef233c',
            boxShadow: `0 0 8px ${currentRegion.color || '#ef233c'}`
          }}
        />

        <div className={`backdrop-blur-xl border rounded-xl p-3 shadow-2xl min-w-[210px] max-w-[270px] ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
            : 'bg-black/95 border-white/10 text-white shadow-red-950/50'
        }`}>
          {/* Holographic Header Bar */}
          <div className={`flex items-center justify-between gap-2 border-b pb-1.5 mb-1.5 ${
            theme === 'light' ? 'border-slate-200' : 'border-zinc-800'
          }`}>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: currentRegion.color || '#ef233c' }}
              />
              <span className={`text-xs sm:text-sm font-semibold tracking-wide font-manrope ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {currentRegion.name}
              </span>
            </div>
            <span className={`text-[10px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
              {currentRegion.lat.toFixed(1)}° N, {currentRegion.lon.toFixed(1)}° E
            </span>
          </div>

          {/* Metrics Chips */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {(currentRegion.metrics || []).slice(0, 2).map((m, idx) => (
              <div key={idx} className={`rounded-lg p-1.5 border ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200/80 text-slate-900'
                  : 'bg-zinc-900/80 border-zinc-800 text-white'
              }`}>
                <div className={`text-[10px] font-mono uppercase font-semibold ${
                  theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                }`}>{m.label}</div>
                <div className={`text-xs font-bold font-mono ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Quick narrative caption */}
          <p className={`text-[11px] leading-relaxed font-inter ${
            theme === 'light' ? 'text-slate-600' : 'text-zinc-300'
          }`}>
            {currentRegion.narrative || currentRegion.subtitle}
          </p>
        </div>

        {/* Bottom Beacon Pointer Stem (when card is above hotspot - pointing down to hotspot) */}
        <div
          ref={bottomStemRef}
          className="w-0.5 h-4 mx-auto"
          style={{
            display: 'none',
            backgroundColor: currentRegion.color || '#ef233c',
            boxShadow: `0 0 8px ${currentRegion.color || '#ef233c'}`
          }}
        />
      </div>

      {/* Bottom Region Quick Selector Rail */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center pointer-events-none z-30">
        <div className={`flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-xl border shadow-2xl pointer-events-auto ${
          theme === 'light'
            ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50'
            : 'bg-black/85 border-white/10'
        }`}>
          {regions.map((region) => {
            const isSelected =
              currentRegion &&
              (region.id === currentRegion.id || (region.aliases && region.aliases.includes(currentRegion.id)));

            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onSelectRegion(region.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#ef233c] border-[#ef233c] text-white shadow-lg shadow-red-950/60 font-semibold'
                    : (theme === 'light'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                        : 'bg-white/5 border-transparent text-zinc-300 hover:text-white hover:bg-white/10')
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: region.color }}
                />
                <span>{region.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
