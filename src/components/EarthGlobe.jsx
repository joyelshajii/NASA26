import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Globe, RotateCcw, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';
import { DEFAULT_REGIONS, CONTINENT_POLYGONS, latLonToVector3 } from '../utils/geoUtils.js';

// Module-level GLTF cache so model starts downloading and parsing immediately on script load
let cachedGltfScene = null;
let gltfPromise = null;

function loadEarthModel() {
  if (cachedGltfScene) return Promise.resolve(cachedGltfScene);
  if (!gltfPromise) {
    const gltfLoader = new GLTFLoader();
    const localModelUrl = `${import.meta.env.BASE_URL}Earth_1_12756.glb`;
    gltfPromise = new Promise((resolve) => {
      const setupScene = (gltf) => {
        const scene = gltf.scene;
        scene.scale.set(0.002, 0.002, 0.002);
        scene.rotation.y = -Math.PI / 2;
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.72;
              child.material.metalness = 0.10;
            }
          }
        });
        cachedGltfScene = scene;
        resolve(scene);
      };

      gltfLoader.load(
        localModelUrl,
        setupScene,
        undefined,
        (err) => {
          console.warn('Local NASA 3D model could not be loaded, trying remote NASA URL:', err);
          const remoteModelUrl = 'https://solarsystem.nasa.gov/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaTBSIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7c1183d35fdc9e4b5143c8601376552b89b5d99f/Earth_1_12756.glb';
          gltfLoader.load(remoteModelUrl, setupScene, undefined, () => resolve(null));
        }
      );
    });
  }
  return gltfPromise;
}

if (typeof window !== 'undefined') {
  loadEarthModel();
}

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
      const dotSpacing = 7;
      const startX = Math.floor(((minLon + 180) / 360) * width);
      const endX = Math.ceil(((maxLon + 180) / 360) * width);
      const startY = Math.floor(((90 - maxLat) / 180) * height);
      const endY = Math.ceil(((90 - minLat) / 180) * height);

      for (let x = startX; x <= endX; x += dotSpacing) {
        for (let y = startY; y <= endY; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
      ctx.lineWidth = 4.0;
      ctx.stroke();

      ctx.restore();
    }
  } else {
    // Dark mode
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#020617');
    oceanGrad.addColorStop(0.3, '#040d21');
    oceanGrad.addColorStop(0.5, '#051329');
    oceanGrad.addColorStop(0.7, '#040d21');
    oceanGrad.addColorStop(1, '#020617');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.18)';

    for (let lat = -75; lat <= 75; lat += 15) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      if (lat === 0) {
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
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
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.lineWidth = 1;
      }
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

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

      ctx.fillStyle = '#061325';
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
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
      const dotSpacing = 7;
      const startX = Math.floor(((minLon + 180) / 360) * width);
      const endX = Math.ceil(((maxLon + 180) / 360) * width);
      const startY = Math.floor(((90 - maxLat) / 180) * height);
      const endY = Math.ceil(((90 - minLat) / 180) * height);

      for (let x = startX; x <= endX; x += dotSpacing) {
        for (let y = startY; y <= endY; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates subtle procedural star sprite texture.
 */
function createProceduralStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  grad.addColorStop(0.6, 'rgba(186, 230, 253, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  return new THREE.CanvasTexture(canvas);
}

/**
 * EarthGlobe Component
 * Interactive 3D Earth Globe with NASA 3D model, balanced 360° lighting, audio-reactive atmosphere,
 * 5 hotspot beacons, and OrbitControls.
 */
export default function EarthGlobe({
  activeRegion = 'amazon',
  regionSelectionTrigger = 0,
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
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const earthMaterialRef = useRef(null);
  const starPointsRef = useRef(null);
  const ambientLightRef = useRef(null);
  const sunLightRef = useRef(null);
  const earthGroupRef = useRef(null);
  const outerHaloMeshRef = useRef(null);

  // Transition & Interaction State
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const autoRotateRef = useRef(autoRotateDefault);
  const isDraggingRef = useRef(false);
  const isCameraFocusingRef = useRef(false);
  const targetQuaternionRef = useRef(null);
  const targetCameraPosRef = useRef(new THREE.Vector3(0, 0.4, 2.85));
  const currentAudioPulseRef = useRef(0.0);

  // Minimizable Hotspot Description Card State
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const isCardMinimizedRef = useRef(false);
  useEffect(() => {
    isCardMinimizedRef.current = isCardMinimized;
  }, [isCardMinimized]);

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

  // Helper to re-orient the globe directly toward the camera for any region
  // Upright rotation matching NASA model-viewer (North Pole stays strictly +Y, zero sideways tilt)
  const focusRegion = useCallback((reg) => {
    if (!reg || !earthGroupRef.current) return;
    const coords = { lat: reg.lat, lon: reg.lon };
    const pos = latLonToVector3(coords.lat, coords.lon, 1.0);
    const angleY = Math.atan2(pos.x, pos.z);

    // Rotate purely around vertical polar Y-axis so North Pole stays upright at +Y
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -angleY
    );
    targetQuaternionRef.current = q;

    // Set camera elevation based on target latitude while keeping camera in Y-Z plane
    const targetY = THREE.MathUtils.clamp(
      reg.lat >= 0
        ? 0.38 + (reg.lat / 90) * 1.10
        : 0.38 + (reg.lat / 90) * 0.40,
      0.15,
      1.55
    );
    const targetDist = 2.88;
    const targetZ = Math.sqrt(Math.max(0, targetDist * targetDist - targetY * targetY));
    targetCameraPosRef.current = new THREE.Vector3(0, targetY, targetZ);

    isCameraFocusingRef.current = true;
  }, []);

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

  const hasMountedRef = useRef(false);

  // Synchronize target orientation when activeRegion or regionSelectionTrigger changes
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (currentRegion) {
      setAutoRotate(false);
      autoRotateRef.current = false;
      focusRegion(currentRegion);
    }
  }, [currentRegion, regionSelectionTrigger, focusRegion]);

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
    cameraRef.current = camera;

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
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isDraggingRef.current = true;
      targetQuaternionRef.current = null;
      isCameraFocusingRef.current = false;
    });
    controls.addEventListener('end', () => {
      isDraggingRef.current = false;
    });

    // 5. Balanced Omnidirectional Studio Lighting - Crisp, clear visibility on all 360° sides
    const ambientLight = new THREE.AmbientLight(0xffffff, isLightMode ? 2.4 : 2.2);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Primary front-facing key light
    const keyLight = new THREE.DirectionalLight(0xffffff, isLightMode ? 1.6 : 1.4);
    keyLight.position.set(5.0, 3.0, 5.0);
    scene.add(keyLight);
    sunLightRef.current = keyLight;

    // Opposite back fill light to ensure full 360° illumination without dark shadows
    const backLight = new THREE.DirectionalLight(0xffffff, isLightMode ? 1.6 : 1.4);
    backLight.position.set(-5.0, -2.0, -5.0);
    scene.add(backLight);

    // Lateral fill light for uniform rim and polar clarity
    const sideLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sideLight.position.set(-5.0, 4.0, 4.0);
    scene.add(sideLight);

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

    // 7. Earth Group (holds NASA 3D Earth Model and 3D Hotspot Pins)
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Model group container
    const modelGroup = new THREE.Group();
    earthGroup.add(modelGroup);

    let isDisposed = false;
    let placeholderMesh = null;
    let earthGeo = null;
    let earthMaterial = null;
    let earthTexture = null;
    let loadedNasaScene = null;

    const attachModel = (nasaScene) => {
      if (!nasaScene || isDisposed) return;
      loadedNasaScene = nasaScene;

      // Remove placeholder immediately
      if (placeholderMesh && modelGroup.children.includes(placeholderMesh)) {
        modelGroup.remove(placeholderMesh);
        if (earthGeo) earthGeo.dispose();
        if (earthMaterial) earthMaterial.dispose();
        if (earthTexture) earthTexture.dispose();
        placeholderMesh = null;
      }
      modelGroup.add(nasaScene);

      // Snap orientation immediately to active region when model is attached (pure vertical polar axis)
      const curReg = currentRegionRef.current;
      if (curReg) {
        const coords = { lat: curReg.lat, lon: curReg.lon };
        const pos = latLonToVector3(coords.lat, coords.lon, 1.0);
        const angleY = Math.atan2(pos.x, pos.z);
        const initialQuat = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          -angleY
        );
        earthGroup.quaternion.copy(initialQuat);
        targetQuaternionRef.current = null;
      }
    };

    if (cachedGltfScene) {
      // Model is already cached! Attach immediately with zero delay
      attachModel(cachedGltfScene.clone());
    } else {
      // Light temporary placeholder only if cache is still resolving (takes a few milliseconds)
      earthGeo = new THREE.SphereGeometry(1.0, 64, 64);
      earthTexture = createProceduralEarthTexture(isLightMode);
      earthMaterial = new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.65,
        metalness: 0.12,
        emissive: new THREE.Color(isLightMode ? 0x000000 : 0x040812),
        emissiveIntensity: isLightMode ? 0.05 : 0.35
      });
      earthMaterialRef.current = earthMaterial;
      placeholderMesh = new THREE.Mesh(earthGeo, earthMaterial);
      modelGroup.add(placeholderMesh);

      loadEarthModel().then((scene) => {
        if (scene) {
          attachModel(scene.clone());
        }
      });
    }

    // 8. Subtle Atmospheric Rim Highlight (fine, reduced border size)
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
          float intensity = pow(rim, 6.0);
          float alpha = clamp(intensity * (0.35 + audioPulse * 0.4), 0.0, 0.6);
          gl_FragColor = vec4(haloColor, alpha);
        }
      `,
      uniforms: {
        haloColor: { value: new THREE.Color(isLightMode ? 0x0284c7 : 0x38bdf8) },
        audioPulse: { value: 0.0 }
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    // Reduced outer halo radius to 1.018 for a thin, refined atmospheric border
    const outerHaloMesh = new THREE.Mesh(new THREE.SphereGeometry(1.018, 64, 64), outerHaloMaterial);
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
        focusRegion(clickedRegion);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Initial camera focus on initial region directly facing camera line of sight (pure vertical polar axis)
    const initialRegion = currentRegionRef.current;
    if (initialRegion) {
      const initialPos = latLonToVector3(initialRegion.lat, initialRegion.lon, 1.0);
      const angleY = Math.atan2(initialPos.x, initialPos.z);
      const initialQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -angleY
      );
      earthGroup.quaternion.copy(initialQuat);
    }

    // 11. Animation & Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth spherical camera return to canonical viewpoint when focusing a region
      if (isCameraFocusingRef.current && !isDraggingRef.current) {
        const targetPos = targetCameraPosRef.current || new THREE.Vector3(0, 0.4, 2.85);
        const targetCenter = new THREE.Vector3(0, 0, 0);
        const targetDist = targetPos.length();
        const targetDir = targetPos.clone().normalize();

        const curPos = camera.position.clone();
        const curDist = curPos.length();
        const curDir = curPos.clone().normalize();

        if (curPos.distanceTo(targetPos) < 0.005 && controls.target.lengthSq() < 0.0001) {
          camera.position.copy(targetPos);
          controls.target.set(0, 0, 0);
          controls.update();
          isCameraFocusingRef.current = false;
        } else {
          const qStep = new THREE.Quaternion().setFromUnitVectors(curDir, targetDir);
          const idQuat = new THREE.Quaternion();
          idQuat.slerp(qStep, 0.09);
          const newDir = curDir.applyQuaternion(idQuat).normalize();
          const newDist = THREE.MathUtils.lerp(curDist, targetDist, 0.09);
          camera.position.copy(newDir.multiplyScalar(newDist));

          controls.target.lerp(targetCenter, 0.09);
          controls.update();
        }
      } else {
        controls.update();
      }

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

      // Pulse outer atmosphere halo ring subtly
      if (outerHaloMeshRef.current) {
        const haloScale = 1.0 + pulse * 0.012;
        outerHaloMeshRef.current.scale.set(haloScale, haloScale, haloScale);
        outerHaloMaterial.uniforms.audioPulse.value = pulse;
      }

      // Smooth Quaternion Slerp to active region
      if (targetQuaternionRef.current && !isDraggingRef.current) {
        earthGroup.quaternion.slerp(targetQuaternionRef.current, 0.06);
        if (earthGroup.quaternion.angleTo(targetQuaternionRef.current) < 0.002) {
          earthGroup.quaternion.copy(targetQuaternionRef.current);
          targetQuaternionRef.current = null;
        }
      } else if (autoRotateRef.current && !isDraggingRef.current && !isCameraFocusingRef.current) {
        // Gentle planetary idle rotation
        earthGroup.rotateY(0.0009);
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
        ringMesh1.scale.set(scale1, scale1, scale1);
        ringMesh2.scale.set(scale2, scale2, scale2);

        ringMesh1.material.opacity = (1 - phase1) * (isSelected ? 0.95 : 0.45);
        ringMesh2.material.opacity = (1 - phase2) * (isSelected ? 0.95 : 0.45);

        // Height & pulse modulation for selected hotspot
        if (isSelected) {
          const bounce = 1.0 + Math.sin(elapsed * 4) * 0.25;
          beaconMesh.scale.set(1.4, 1.4 * bounce, 1.4);
          beaconMesh.material.opacity = 1.0;
        } else {
          beaconMesh.scale.set(1.0, 1.0, 1.0);
          beaconMesh.material.opacity = 0.65;
        }
      });

      // 12. Floating Dynamic HUD Telemetry Position Tracker
      if (curReg && tooltipRef.current && mountRef.current) {
        const targetHit = hitTargets.find(
          (h) =>
            h.userData.region.id === curReg.id ||
            (h.userData.region.aliases && h.userData.region.aliases.includes(curReg.id))
        );

        if (targetHit) {
          tempVec.set(0, 0.16, 0);
          targetHit.localToWorld(tempVec);

          tempVec.project(camera);

          const hw = width / 2;
          const hh = height / 2;
          const screenX = tempVec.x * hw + hw;
          const screenY = -tempVec.y * hh + hh;

          // Check if hotspot is facing camera (dot product of normal with camera direction)
          targetHit.getWorldPosition(normalVec);
          normalVec.normalize();
          toCameraVec.subVectors(camera.position, normalVec).normalize();
          const dot = normalVec.dot(toCameraVec);

          if (tempVec.z < 1.0 && dot > 0.15) {
            tooltipRef.current.style.opacity = '1';
            tooltipRef.current.style.pointerEvents = 'auto';

            // Place HUD card intelligently in viewport
            const cardWidth = isCardMinimizedRef.current ? 220 : 260;
            const cardHeight = isCardMinimizedRef.current ? 44 : 120;
            let cardLeft = screenX + 30;
            let cardTop = screenY - cardHeight / 2;

            if (cardLeft + cardWidth > width - 20) {
              cardLeft = screenX - cardWidth - 30;
            }
            if (cardTop < 70) {
              cardTop = 70;
            } else if (cardTop + cardHeight > height - 70) {
              cardTop = height - cardHeight - 70;
            }

            tooltipRef.current.style.transform = `translate3d(${cardLeft}px, ${cardTop}px, 0)`;

            // Adaptive stem visibility
            if (cardLeft > screenX) {
              if (topStemRef.current) topStemRef.current.style.display = 'block';
              if (bottomStemRef.current) bottomStemRef.current.style.display = 'none';
            } else {
              if (topStemRef.current) topStemRef.current.style.display = 'none';
              if (bottomStemRef.current) bottomStemRef.current.style.display = 'block';
            }
          } else {
            tooltipRef.current.style.opacity = '0';
            tooltipRef.current.style.pointerEvents = 'none';
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth || 800;
      const nh = mountRef.current.clientHeight || 600;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // 13. Component Cleanup & Unmount
    return () => {
      isDisposed = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);

      controls.dispose();
      renderer.dispose();
      try {
        earthGeo.dispose();
        earthMaterial.dispose();
        earthTexture.dispose();
      } catch {}

      if (loadedNasaScene) {
        loadedNasaScene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }

      outerHaloMaterial.dispose();
      starGeo.dispose();
      starMaterial.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle live theme switching for Three.js scene
  useEffect(() => {
    const isLight = theme === 'light';
    if (!sceneRef.current) return;

    if (earthMaterialRef.current && earthMaterialRef.current.map) {
      const newTexture = createProceduralEarthTexture(isLight);
      earthMaterialRef.current.map = newTexture;
      earthMaterialRef.current.emissive = new THREE.Color(isLight ? 0x000000 : 0x040812);
      earthMaterialRef.current.emissiveIntensity = isLight ? 0.05 : 0.35;
      earthMaterialRef.current.needsUpdate = true;
    }

    if (sceneRef.current) {
      sceneRef.current.background = isLight ? null : new THREE.Color(0x020408);
    }
    if (starPointsRef.current) {
      starPointsRef.current.visible = !isLight;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = isLight ? 2.4 : 2.2;
    }
    if (sunLightRef.current) {
      sunLightRef.current.intensity = isLight ? 1.6 : 1.4;
    }

    if (outerHaloMeshRef.current && outerHaloMeshRef.current.material) {
      outerHaloMeshRef.current.material.uniforms.haloColor.value.setHex(isLight ? 0x0284c7 : 0x38bdf8);
    }
  }, [theme]);

  // Reset Camera View
  const handleResetView = useCallback(() => {
    if (currentRegion) {
      focusRegion(currentRegion);
    }
  }, [currentRegion, focusRegion]);

  return (
    <div className={`relative w-full h-full min-h-[400px] overflow-hidden select-none ${theme === 'light' ? 'bg-transparent' : 'bg-black'} font-manrope ${className}`}>
      {/* Top Header HUD Telemetry - Z-30 to guarantee priority and visibility above 3D space */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-30">
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
              <span className="text-[10px] font-manrope px-1.5 py-0.5 rounded bg-[#ef233c]/15 border border-[#ef233c]/40 text-[#ef233c] font-semibold">
                {currentRegion.category}
              </span>
              {currentYear && (
                <span className={`text-[10px] font-manrope px-1.5 py-0.5 rounded border font-bold ${
                  theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/20 text-zinc-300'
                }`}>
                  {Math.round(currentYear)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Control Badges: Auto-Rotate & Reset View */}
        {showControls && (
          <div className="flex items-center gap-2 pointer-events-auto">
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
              title="Reset View Orientation to Selected Region"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset View</span>
            </button>
          </div>
        )}
      </div>

      {/* 3D WebGL Canvas & Hotspot HUD Container (shifted slightly down so Earth doesn't overlap top controls) */}
      <div className="w-full h-full relative translate-y-5 sm:translate-y-6">
        {/* 3D WebGL Canvas Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Card attached to Active Hotspot */}
      <div
        ref={tooltipRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-20"
        style={{ opacity: 0 }}
      >
        <div
          ref={topStemRef}
          className="w-0.5 h-4 mx-auto"
          style={{
            display: 'none',
            backgroundColor: currentRegion.color || '#ef233c',
            boxShadow: `0 0 8px ${currentRegion.color || '#ef233c'}`
          }}
        />

        <div className={`p-3 rounded-xl backdrop-blur-xl border shadow-2xl pointer-events-auto transition-all duration-300 ${
          isCardMinimized ? 'w-[220px]' : 'w-[260px]'
        } ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-300/60'
            : 'bg-black/90 border-white/15 text-white shadow-black/80'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between ${isCardMinimized ? 'mb-0' : 'mb-2'}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full animate-ping shrink-0"
                style={{ backgroundColor: currentRegion.color || '#ef233c' }}
              />
              <span className="text-xs font-bold font-manrope truncate">
                {currentRegion.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              <span className={`text-[10px] font-manrope ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                {currentRegion.lat.toFixed(1)}°, {currentRegion.lon.toFixed(1)}°
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCardMinimized(!isCardMinimized);
                }}
                className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center ${
                  theme === 'light'
                    ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-950'
                    : 'hover:bg-white/15 text-zinc-400 hover:text-white'
                }`}
                title={isCardMinimized ? "Expand telemetry description" : "Minimize description"}
                aria-label={isCardMinimized ? "Expand description" : "Minimize description"}
              >
                {isCardMinimized ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#ef233c]" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {!isCardMinimized && (
            <>
              {/* Key Metrics Chips */}
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {currentRegion.metrics && currentRegion.metrics.map((m, idx) => (
                  <div key={idx} className={`p-1.5 rounded-lg border text-center ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200/80 text-slate-900'
                      : 'bg-zinc-900/80 border-zinc-800 text-white'
                  }`}>
                    <div className={`text-[10px] font-manrope uppercase font-semibold ${
                      theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                    }`}>{m.label}</div>
                    <div className={`text-xs font-bold font-manrope ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Quick narrative caption */}
              <p className={`text-[11px] leading-relaxed font-manrope ${
                theme === 'light' ? 'text-slate-600' : 'text-zinc-300'
              }`}>
                {currentRegion.narrative || currentRegion.subtitle}
              </p>
            </>
          )}
        </div>

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
      </div>
    </div>
  );
}
