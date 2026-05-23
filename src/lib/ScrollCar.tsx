/**
 * ScrollCar — A Three.js car rendered on a fully transparent canvas.
 *
 * Two modes:
 *  - mode="scroll"  : model.rotation.y is driven by the scroll progress
 *                     of `sectionRef` (default).
 *  - mode="auto"    : model auto-rotates continuously (used in the Hero).
 *
 * No stage border, no background — the car floats over whatever CSS is behind.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollCarProps {
  glbPath: string;
  accent?: string;
  accent2?: string;
  /** The scroll container whose progress drives rotation (mode="scroll"). */
  sectionRef?: React.RefObject<HTMLElement | null>;
  /** How many full rotations over the section scroll. Default: 1. */
  rotations?: number;
  mode?: 'scroll' | 'auto';
  /** ScrollTrigger start value. Default: 'top top' */
  triggerStart?: string;
  /** ScrollTrigger end value. Default: 'bottom bottom' */
  triggerEnd?: string;
  /** Horizontal nudge applied after Box3 centering (Three.js units). Positive = right. */
  modelOffsetX?: number;
  /** Ref updated each mousemove — applied as additive pitch / roll / yaw on the model. */
  mouseInfluenceRef?: React.RefObject<{ yaw: number; pitch: number; roll: number }>;
  className?: string;
}

export default function ScrollCar({
  glbPath,
  accent = '#34D7FF',
  accent2 = '#7C5CFF',
  sectionRef,
  rotations = 1,
  mode = 'scroll',
  triggerStart = 'top top',
  triggerEnd = 'bottom bottom',
  modelOffsetX = 0,
  mouseInfluenceRef,
  className = '',
}: ScrollCarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    // ─── Renderer — transparent background ───────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = false; // shadows are the biggest GPU cost — off for perf

    const scene = new THREE.Scene();
    // scene.background stays null → transparent

    // FOV wide enough that the car never clips at any rotation angle
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(3.5, 1.4, 8.5);
    camera.lookAt(0, 0.7, 0);

    // ─── Lighting ────────────────────────────────────────────────────
    // Ambient low enough that rim colours read clearly on any car
    scene.add(new THREE.AmbientLight(0xffffff, 0.38));

    // Neutral key — defines form, doesn't fight livery colours
    const key = new THREE.DirectionalLight(0xffffff, 0.72);
    key.position.set(4, 7, 6);
    scene.add(key);

    // Cool-blue fill so the shadow side stays readable
    const fill = new THREE.DirectionalLight(0xaaccff, 0.28);
    fill.position.set(-5, 2, 4);
    scene.add(fill);

    // Accent rim behind-left — strong enough to tint a white car beautifully
    const rim1 = new THREE.PointLight(new THREE.Color(accent), 95, 22, 2);
    rim1.position.set(-7, 4, -5);
    scene.add(rim1);

    // Accent2 rim behind-right
    const rim2 = new THREE.PointLight(new THREE.Color(accent2), 70, 18, 2);
    rim2.position.set(6, 3, -5);
    scene.add(rim2);

    // Subtle under-glow — colour reflection up from the floor
    const under = new THREE.PointLight(new THREE.Color(accent), 28, 7, 2);
    under.position.set(0, -1.2, 0);
    scene.add(under);

    // ─── Minimal PMREM — only for glass reflections, low intensity ────
    // RoomEnvironment was flooding panels with white; we zero it on paint
    // and leave a trace on glass via scene.environment at very low intensity.
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      pmrem.dispose();
    } catch { /* noop */ }

    // Soft accent glow beneath the car (light only, no visible floor mesh)
    const floorGlow = new THREE.PointLight(new THREE.Color(accent), 18, 5, 2);
    floorGlow.position.set(0, -0.2, 0);
    scene.add(floorGlow);

    // ─── Rotation state ───────────────────────────────────────────────
    let model: THREE.Group | null = null;
    const START_YAW = 1.1; // side-on angle so livery stripes face camera on load
    let currentYaw = START_YAW;
    let targetYaw = START_YAW;
    const AUTO_SPEED = 0.18; // rad/sec

    // Mouse-influence lerp targets (additive on top of base rotation)
    let mYaw = 0, mPitch = 0, mRoll = 0;

    // ─── Load GLB ─────────────────────────────────────────────────────
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(
      glbPath,
      (gltf) => {
        if (disposed) return;

        const obj = gltf.scene;

        // Centre, sit on floor, scale uniformly to ~4.4 units wide
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        obj.position.sub(center);
        obj.position.y -= box.min.y - center.y;
        obj.position.x += modelOffsetX;
        obj.scale.setScalar(4.4 / Math.max(size.x, size.y, size.z));

        obj.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          node.castShadow = true;
          node.receiveShadow = true;
          const mats = Array.isArray(node.material)
            ? node.material
            : [node.material];
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial;
            if (std.envMapIntensity === undefined) return;
            // Glass/transparent surfaces keep a reflection; opaque paint gets none
            // so the white RoomEnvironment cannot wash out the livery colours.
            std.envMapIntensity = std.transparent || std.opacity < 0.95 ? 0.6 : 0.0;
            std.needsUpdate = true;
          });
        });

        scene.add(obj);
        model = obj as THREE.Group;
        if (!disposed) setLoaded(true);
      },
      (ev) => {
        if (ev.lengthComputable) setLoadPct(ev.loaded / ev.total);
      },
      (err) => console.error('ScrollCar: load failed', err),
    );

    // ─── GSAP ScrollTrigger (scroll mode) ────────────────────────────
    let st: ScrollTrigger | null = null;

    if (mode === 'scroll' && sectionRef?.current) {
      st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: triggerStart,
        end: triggerEnd,
        onUpdate: (self) => {
          // Fast at viewport edges, slow when centered — sinusoidal easing
          const p = self.progress;
          const A = 0.65;
          const eased = p + A * Math.sin(2 * Math.PI * p) / (2 * Math.PI);
          targetYaw = START_YAW + eased * Math.PI * 2 * rotations;
        },
      });
    }

    // ─── Resize ───────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    // ─── Render loop — pauses automatically when canvas is off-screen ──
    let raf: number;
    let lastT = performance.now();
    let visible = true;

    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 },
    );
    io.observe(canvas);

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return; // skip GPU work when not in viewport

      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      // Lerp mouse influence toward latest ref values
      if (mouseInfluenceRef?.current) {
        const inf = mouseInfluenceRef.current;
        const s = Math.min(1, dt * 2.2);
        mYaw   += (inf.yaw   - mYaw)   * s;
        mPitch += (inf.pitch - mPitch) * s;
        mRoll  += (inf.roll  - mRoll)  * s;
      }

      if (model) {
        if (mode === 'auto') {
          currentYaw += dt * AUTO_SPEED;
        } else {
          currentYaw += (targetYaw - currentYaw) * Math.min(1, dt * 7);
        }
        model.rotation.y = currentYaw + mYaw;
        model.rotation.x = mPitch;
        model.rotation.z = mRoll;
        model.position.y = Math.sin(t * 0.00065) * 0.055;
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      st?.kill();
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
    };
  }, [glbPath, accent, accent2, mode, rotations, triggerStart, triggerEnd, modelOffsetX]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Loading bar — disappears once loaded */}
      {!loaded && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">
            LOADING MODEL · {Math.round(loadPct * 100)}%
          </div>
          <div className="w-52 h-px bg-white/10 mx-auto overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${loadPct * 100}%`,
                background: accent,
                boxShadow: `0 0 14px ${accent}`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
