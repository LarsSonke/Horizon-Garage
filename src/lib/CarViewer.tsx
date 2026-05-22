import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ─── IndexedDB blob store ──────────────────────────────────────────────
const DB_NAME = 'horizon-garage';
const STORE = 'glbs';

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function dbPut(key, blob) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function dbGet(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => res(r.result ?? null);
    r.onerror = () => rej(r.error);
  });
}
async function dbDel(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

// ─── Three.js scene ───────────────────────────────────────────────────
function buildScene(canvas, accentHex = '#34D7FF', accent2Hex = '#7C5CFF') {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
  camera.position.set(5.2, 1.8, 5.6);
  camera.lookAt(0, 0.5, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { near: 0.5, far: 30, left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.bias = -0.0005;
  scene.add(key);

  const rim = new THREE.PointLight(new THREE.Color(accentHex), 70, 20, 2);
  rim.position.set(-3.5, 2.5, -3);
  scene.add(rim);

  const fill = new THREE.PointLight(new THREE.Color(accent2Hex), 35, 18, 2);
  fill.position.set(3.5, 0.8, -2.5);
  scene.add(fill);

  const spot = new THREE.SpotLight(0xffffff, 50, 12, Math.PI / 7, 0.5, 1.5);
  spot.position.set(0, 10, 0);
  spot.target.position.set(0, 0, 0);
  scene.add(spot); scene.add(spot.target);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(10, 64),
    new THREE.MeshStandardMaterial({ color: 0x04070d, roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(16, 32, new THREE.Color(accentHex), 0x1a2233);
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  scene.add(grid);

  // Environment
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  } catch {}

  const state = {
    model: null,
    autoRotate: true,
    target: new THREE.Vector3(0, 0.5, 0),
    yaw: 0.6,
    pitch: 0.18,
    dist: 7.5,
    dragging: false,
    lastX: 0, lastY: 0,
  };

  function setAccent(hex1, hex2) {
    rim.color.set(hex1);
    fill.color.set(hex2 || hex1);
    grid.material.color.set(hex1);
  }

  function fitModel(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center);
    obj.position.y -= box.min.y - center.y;
    const scale = 4.2 / Math.max(size.x, size.y, size.z);
    obj.scale.setScalar(scale);
    obj.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        if (n.material?.envMapIntensity !== undefined) n.material.envMapIntensity = 1.2;
      }
    });
  }

  function createLoader() {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(draco);
    return loader;
  }

  function loadFromURL(url, onProgress) {
    return new Promise((resolve, reject) => {
      createLoader().load(
        url,
        (gltf) => {
          if (state.model) {
            scene.remove(state.model);
            disposeModel(state.model);
          }
          fitModel(gltf.scene);
          scene.add(gltf.scene);
          state.model = gltf.scene;
          resolve(gltf);
        },
        (ev) => { if (ev.lengthComputable && onProgress) onProgress(ev.loaded / ev.total); },
        reject
      );
    });
  }

  function loadFromBlob(blob, onProgress) {
    const url = URL.createObjectURL(blob);
    return loadFromURL(url, onProgress).finally(() => URL.revokeObjectURL(url));
  }

  function disposeModel(obj) {
    obj.traverse((n) => {
      if (!n.isMesh) return;
      n.geometry?.dispose();
      (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => m?.dispose());
    });
  }

  // Pointer controls
  canvas.addEventListener('pointerdown', (e) => {
    state.dragging = true; state.autoRotate = false;
    state.lastX = e.clientX; state.lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', () => { state.dragging = false; });
  canvas.addEventListener('pointermove', (e) => {
    if (!state.dragging) return;
    state.yaw -= (e.clientX - state.lastX) * 0.005;
    state.pitch = Math.max(-0.15, Math.min(0.55, state.pitch - (e.clientY - state.lastY) * 0.003));
    state.lastX = e.clientX; state.lastY = e.clientY;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    state.dist = Math.max(3.5, Math.min(14, state.dist + e.deltaY * 0.008));
  }, { passive: false });

  // Resize
  const ro = new ResizeObserver(() => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas);

  // Loop
  let raf;
  let lastT = performance.now();
  function tick(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000); lastT = t;
    if (state.autoRotate) state.yaw += dt * 0.22;
    const cx = state.dist * Math.cos(state.pitch) * Math.sin(state.yaw);
    const cy = state.dist * Math.sin(state.pitch) + 0.7;
    const cz = state.dist * Math.cos(state.pitch) * Math.cos(state.yaw);
    camera.position.set(cx, cy, cz);
    camera.lookAt(state.target);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  return {
    setAccent,
    loadFromURL,
    loadFromBlob,
    resumeAutoRotate: () => { state.autoRotate = true; },
    isLoaded: () => !!state.model,
    dispose: () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
  };
}

// ─── React component ──────────────────────────────────────────────────
interface CarViewerProps {
  glbPath?: string;
  accent?: string;
  accent2?: string;
  label?: string;
}

export default function CarViewer({ glbPath, accent = '#34D7FF', accent2 = '#7C5CFF', label = 'Drop .glb to load' }: CarViewerProps) {
  const storageKey = glbPath ?? label;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(null);
  const [status, setStatus] = useState('empty'); // empty | loading | loaded | error
  const [progress, setProgress] = useState(0);
  const [errMsg, setErrMsg] = useState('');
  const [hover, setHover] = useState(false);

  // Init
  useEffect(() => {
    let disposed = false;
    let sc;

    (async () => {
      if (!canvasRef.current) return;
      try {
        sc = buildScene(canvasRef.current, accent, accent2);
        sceneRef.current = sc;
      } catch (e) {
        setStatus('error'); setErrMsg('WebGL failed'); return;
      }

      if (disposed) return;

      // 1. Try auto-loading from glbPath URL (works with Vite dev server)
      if (glbPath) {
        setStatus('loading'); setProgress(0);
        try {
          await sc.loadFromURL(glbPath, (p) => setProgress(p));
          if (!disposed) setStatus('loaded');
          return;
        } catch {
          // CORS / file not found — fall through to IndexedDB
        }
      }

      // 2. Try persisted blob from IndexedDB
      try {
        const blob = await dbGet(storageKey);
        if (blob && !disposed) {
          setStatus('loading');
          await sc.loadFromBlob(blob, (p) => setProgress(p));
          if (!disposed) setStatus('loaded');
        }
      } catch {}
    })();

    return () => {
      disposed = true;
      sc?.dispose();
    };
  }, []);

  // Update accent
  useEffect(() => { sceneRef.current?.setAccent(accent, accent2); }, [accent, accent2]);

  const handleFile = useCallback(async (file) => {
    if (!file || !sceneRef.current) return;
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setStatus('error'); setErrMsg('Need .glb or .gltf'); return;
    }
    setStatus('loading'); setProgress(0); setErrMsg('');
    try {
      await sceneRef.current.loadFromBlob(file, (p) => setProgress(p));
      await dbPut(storageKey, file);
      setStatus('loaded');
    } catch (e) {
      setStatus('error'); setErrMsg('Load failed: ' + (e?.message ?? e));
    }
  }, [storageKey]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setHover(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const reset = useCallback(async () => {
    await dbDel(storageKey);
    location.reload();
  }, [storageKey]);

  return (
    <div
      className="absolute inset-0"
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      style={{ borderRadius: 'inherit' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block', touchAction: 'none', cursor: status === 'loaded' ? 'grab' : 'default' }}
      />

      {/* Drop / error overlay */}
      {(status === 'empty' || status === 'error' || hover) && (
        <label
          className="absolute inset-6 grid place-items-center cursor-pointer rounded-xl"
          style={{
            border: `1px dashed ${hover ? accent : 'rgba(255,255,255,0.2)'}`,
            background: hover ? `${accent}12` : 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            transition: 'all 200ms',
          }}
        >
          <input type="file" accept=".glb,.gltf" onChange={(e) => handleFile(e.target.files?.[0])} className="sr-only" />
          <div className="text-center px-6">
            <div className="font-mono text-[10px] tracking-[0.3em] text-white/60 uppercase mb-2">
              {status === 'error' ? 'ERROR' : '3D MODEL SLOT'}
            </div>
            <div className="font-display text-3xl text-white" style={{ textShadow: `0 0 18px ${accent}` }}>
              {status === 'error' ? errMsg : label}
            </div>
            <div className="font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase mt-3">
              DROP .GLB · OR CLICK TO PICK
            </div>
          </div>
        </label>
      )}

      {/* Loading bar */}
      {status === 'loading' && (
        <div className="absolute left-1/2 bottom-12 -translate-x-1/2 w-72">
          <div className="font-mono text-[10px] tracking-[0.3em] text-white/70 uppercase mb-2 text-center">
            LOADING · {Math.round(progress * 100)}%
          </div>
          <div className="h-1 bg-white/10 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{ width: `${progress * 100}%`, background: accent, boxShadow: `0 0 14px ${accent}` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      {status === 'loaded' && (
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={() => sceneRef.current?.resumeAutoRotate()}
            className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-black/50 text-white/70 hover:text-white rounded"
          >
            ⟳ Auto
          </button>
          <button
            onClick={reset}
            className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-black/50 text-white/60 hover:text-white rounded"
          >
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  );
}
