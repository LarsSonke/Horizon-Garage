// Three.js GLB viewer with drag-and-drop loading + IndexedDB persistence.
// Drop a .glb on the canvas; it auto-orbits with cinematic lighting.
// Globals: window.CarViewer (React component)

(function () {
  // ---------- IndexedDB blob store ----------
  const DB_NAME = 'horizon-garage';
  const STORE = 'glbs';
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
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
      r.onsuccess = () => res(r.result || null);
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

  // ---------- Three.js scene builder ----------
  function buildScene(canvas, opts) {
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
    camera.position.set(5.2, 1.7, 5.6);
    camera.lookAt(0, 0.5, 0);

    // ===== Lighting =====
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    // Key light (warm-ish white from above-front)
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0005;
    scene.add(key);

    // Accent rim light (from behind, tinted to car accent)
    const rim = new THREE.PointLight(0x34D7FF, 60, 18, 2);
    rim.position.set(-3.5, 2.5, -3);
    scene.add(rim);

    // Accent fill (from below-side, second accent)
    const fill = new THREE.PointLight(0x7C5CFF, 30, 16, 2);
    fill.position.set(3.5, 0.8, -2.5);
    scene.add(fill);

    // Ground spot
    const spot = new THREE.SpotLight(0xffffff, 40, 10, Math.PI / 7, 0.5, 1.5);
    spot.position.set(0, 8, 0);
    spot.target.position.set(0, 0, 0);
    scene.add(spot); scene.add(spot.target);

    // ===== Ground (subtle reflective floor) =====
    const groundGeo = new THREE.CircleGeometry(8, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x05080d,
      roughness: 0.35,
      metalness: 0.5,
      transparent: true,
      opacity: 0.95,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid overlay
    const grid = new THREE.GridHelper(14, 28, 0x34D7FF, 0x1a2233);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    scene.add(grid);

    // Environment (PMREM from a simple gradient via RoomEnvironment if available, else null)
    try {
      if (window.RoomEnvironment) {
        const pmrem = new THREE.PMREMGenerator(renderer);
        const env = pmrem.fromScene(new window.RoomEnvironment(renderer), 0.04).texture;
        scene.environment = env;
      }
    } catch (e) { /* noop */ }

    // ===== State =====
    const state = {
      model: null,
      autoRotate: true,
      target: new THREE.Vector3(0, 0.5, 0),
      yaw: 0.6,
      pitch: 0.18,
      dist: 7.2,
      dragging: false,
      lastX: 0, lastY: 0,
      accent: 0x34D7FF,
      accent2: 0x7C5CFF,
    };

    function setAccent(hex1, hex2) {
      state.accent = new THREE.Color(hex1).getHex();
      state.accent2 = new THREE.Color(hex2 || hex1).getHex();
      rim.color.setHex(state.accent);
      fill.color.setHex(state.accent2);
      grid.material.color.setHex(state.accent);
    }

    function fitModel(obj) {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center); // center at origin
      obj.position.y -= box.min.y - center.y; // sit on floor
      // Scale so longest side ≈ 4 units
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 4.0 / maxDim;
      obj.scale.setScalar(scale);
      // Enable shadows
      obj.traverse(n => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
          if (n.material) {
            // Slight bump in metalness for that "showroom" look
            if ('envMapIntensity' in n.material) n.material.envMapIntensity = 1.1;
          }
        }
      });
    }

    async function loadGLBBlob(blob, onProgress) {
      const url = URL.createObjectURL(blob);
      const { GLTFLoader } = window;
      const loader = new GLTFLoader();
      try {
        if (window.DRACOLoader) {
          const draco = new window.DRACOLoader();
          draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
          loader.setDRACOLoader(draco);
        }
      } catch (e) { /* */ }
      return new Promise((resolve, reject) => {
        loader.load(url, gltf => {
          if (state.model) {
            scene.remove(state.model);
            state.model.traverse(n => {
              if (n.isMesh) {
                n.geometry?.dispose();
                if (Array.isArray(n.material)) n.material.forEach(m => m.dispose());
                else n.material?.dispose();
              }
            });
          }
          fitModel(gltf.scene);
          scene.add(gltf.scene);
          state.model = gltf.scene;
          URL.revokeObjectURL(url);
          resolve(gltf);
        }, ev => {
          if (onProgress && ev.lengthComputable) onProgress(ev.loaded / ev.total);
        }, err => { URL.revokeObjectURL(url); reject(err); });
      });
    }

    // ===== Interaction =====
    canvas.addEventListener('pointerdown', e => {
      state.dragging = true; state.lastX = e.clientX; state.lastY = e.clientY;
      state.autoRotate = false;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointerup', e => { state.dragging = false; });
    canvas.addEventListener('pointerleave', () => { state.dragging = false; });
    canvas.addEventListener('pointermove', e => {
      if (!state.dragging) return;
      const dx = e.clientX - state.lastX, dy = e.clientY - state.lastY;
      state.lastX = e.clientX; state.lastY = e.clientY;
      state.yaw -= dx * 0.005;
      state.pitch = Math.max(-0.15, Math.min(0.55, state.pitch - dy * 0.003));
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      state.dist = Math.max(4, Math.min(14, state.dist + e.deltaY * 0.008));
    }, { passive: false });

    // ===== Resize =====
    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ===== Loop =====
    let raf;
    let last = performance.now();
    function tick(t) {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (state.autoRotate) state.yaw += dt * 0.25;
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
      loadGLBBlob,
      resumeAutoRotate: () => { state.autoRotate = true; },
      dispose: () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.dispose();
      },
      isLoaded: () => !!state.model,
    };
  }

  // ---------- React component ----------
  const { useEffect, useRef, useState, useCallback } = React;

  function waitForThree() {
    return new Promise(resolve => {
      if (window.THREE && window.GLTFLoader) return resolve();
      const handler = () => { window.removeEventListener('three-ready', handler); resolve(); };
      window.addEventListener('three-ready', handler);
      // Fallback poll
      const iv = setInterval(() => {
        if (window.THREE && window.GLTFLoader) { clearInterval(iv); window.removeEventListener('three-ready', handler); resolve(); }
      }, 100);
    });
  }

  function CarViewer({ storageKey, accent = '#34D7FF', accent2 = '#7C5CFF', label = 'Drop .glb to load' }) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const [status, setStatus] = useState('empty'); // empty | loading | loaded | error
    const [progress, setProgress] = useState(0);
    const [errMsg, setErrMsg] = useState('');
    const [hover, setHover] = useState(false);

    // Init scene
    useEffect(() => {
      let disposed = false;
      let scene;
      (async () => {
        await waitForThree();
        if (disposed || !canvasRef.current) return;
        try {
          scene = buildScene(canvasRef.current);
          sceneRef.current = scene;
          scene.setAccent(accent, accent2);
        } catch (e) {
          console.error(e);
          setStatus('error');
          setErrMsg('WebGL init failed');
          return;
        }

        // Try loading persisted blob
        try {
          const blob = await dbGet(storageKey);
          if (blob && !disposed) {
            setStatus('loading');
            await scene.loadGLBBlob(blob, p => setProgress(p));
            if (!disposed) setStatus('loaded');
          }
        } catch (e) {
          console.warn('No persisted GLB or load failed', e);
        }
      })();
      return () => {
        disposed = true;
        if (scene) scene.dispose();
      };
    }, []);

    // Update accent when changed
    useEffect(() => {
      sceneRef.current?.setAccent(accent, accent2);
    }, [accent, accent2]);

    const handleFile = useCallback(async (file) => {
      if (!file || !sceneRef.current) return;
      const name = (file.name || '').toLowerCase();
      if (!name.endsWith('.glb') && !name.endsWith('.gltf')) {
        setStatus('error'); setErrMsg('Need .glb or .gltf');
        return;
      }
      setStatus('loading'); setProgress(0); setErrMsg('');
      try {
        await sceneRef.current.loadGLBBlob(file, p => setProgress(p));
        await dbPut(storageKey, file);
        setStatus('loaded');
      } catch (e) {
        console.error(e);
        setStatus('error'); setErrMsg('Load failed: ' + (e.message || e));
      }
    }, [storageKey]);

    const onDrop = useCallback((e) => {
      e.preventDefault(); setHover(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    }, [handleFile]);

    const onPick = useCallback((e) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    }, [handleFile]);

    const reset = useCallback(async () => {
      await dbDel(storageKey);
      location.reload();
    }, [storageKey]);

    return (
      <div
        className="absolute inset-0"
        onDragOver={e => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        style={{ borderRadius: 'inherit' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block', touchAction: 'none', cursor: status === 'loaded' ? 'grab' : 'default' }}
        />

        {/* Drop overlay — visible when empty or hovered */}
        {(status === 'empty' || status === 'error' || hover) && (
          <label
            className="absolute inset-6 grid place-items-center cursor-pointer rounded-xl"
            style={{
              border: `1px dashed ${hover ? accent : 'rgba(255,255,255,0.22)'}`,
              background: hover ? `${accent}10` : 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(2px)',
              transition: 'all 200ms',
            }}
          >
            <input type="file" accept=".glb,.gltf" onChange={onPick} className="sr-only" />
            <div className="text-center px-6">
              <div className="font-mono text-[10px] tracking-[0.3em] text-white/60 uppercase mb-2">
                {status === 'error' ? 'ERROR' : '3D MODEL SLOT'}
              </div>
              <div className="font-display text-3xl text-white text-glow" style={{ ['--accent']: accent }}>
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
          <div className="absolute left-1/2 bottom-10 -translate-x-1/2 w-64">
            <div className="font-mono text-[10px] tracking-[0.3em] text-white/70 uppercase mb-2 text-center">
              LOADING · {Math.round(progress * 100)}%
            </div>
            <div className="h-1 bg-white/10 rounded">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${progress * 100}%`, background: accent, boxShadow: `0 0 12px ${accent}` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        {status === 'loaded' && (
          <div className="absolute top-3 right-3 flex gap-2 z-10 pointer-events-auto">
            <button
              onClick={() => sceneRef.current?.resumeAutoRotate()}
              className="font-mono text-[10px] tracking-[0.24em] uppercase px-2 py-1 border border-white/20 bg-black/40 text-white/70 hover:text-white hover:border-white/40 rounded"
              title="Resume auto-rotate"
            >
              ⟳ Auto
            </button>
            <button
              onClick={reset}
              className="font-mono text-[10px] tracking-[0.24em] uppercase px-2 py-1 border border-white/20 bg-black/40 text-white/60 hover:text-white hover:border-white/40 rounded"
              title="Clear stored model"
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>
    );
  }

  window.CarViewer = CarViewer;
})();
