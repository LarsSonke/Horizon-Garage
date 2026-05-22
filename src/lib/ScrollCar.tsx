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
  className?: string;
}

export default function ScrollCar({
  glbPath,
  accent = '#34D7FF',
  accent2 = '#7C5CFF',
  sectionRef,
  rotations = 1,
  mode = 'scroll',
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
    renderer.setClearColor(0x000000, 0); // fully transparent
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    // scene.background stays null → transparent

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(4.2, 1.5, 7);
    camera.lookAt(0, 0.7, 0);

    // ─── Lighting ────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.18));

    const key = new THREE.DirectionalLight(0xfff8f0, 3.0);
    key.position.set(6, 9, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0005;
    scene.add(key);

    // Accent rim (behind-left — creates the neon edge glow)
    const rim1 = new THREE.PointLight(new THREE.Color(accent), 90, 20, 2);
    rim1.position.set(-5, 3.5, -5);
    scene.add(rim1);

    // Second accent (behind-right — fills the other side)
    const rim2 = new THREE.PointLight(new THREE.Color(accent2), 55, 16, 2);
    rim2.position.set(4, 1.5, -4);
    scene.add(rim2);

    // Cool under-fill (barely visible, stops the underbody going pure black)
    const under = new THREE.PointLight(0x0a1832, 20, 10, 2);
    under.position.set(0, -2, 3);
    scene.add(under);

    // ─── PMREM environment for glass & panel reflections ────────────
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(
        new RoomEnvironment(),
        0.04,
      ).texture;
    } catch { /* noop */ }

    // ─── Very subtle ground reflection ───────────────────────────────
    const mirrorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.MeshStandardMaterial({
        color: 0x040810,
        roughness: 0.08,
        metalness: 0.95,
        transparent: true,
        opacity: 0.25,
      }),
    );
    mirrorMesh.rotation.x = -Math.PI / 2;
    mirrorMesh.receiveShadow = true;
    scene.add(mirrorMesh);

    // Faint accent glow on the floor directly under the car
    const floorGlow = new THREE.PointLight(new THREE.Color(accent), 12, 5, 2);
    floorGlow.position.set(0, -0.1, 0);
    scene.add(floorGlow);

    // ─── Rotation state ───────────────────────────────────────────────
    let model: THREE.Group | null = null;
    const START_YAW = 0.45; // front-right 3/4 starting angle
    let currentYaw = START_YAW;
    let targetYaw = START_YAW;
    const AUTO_SPEED = 0.18; // rad/sec

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
        obj.scale.setScalar(4.4 / Math.max(size.x, size.y, size.z));

        // Boost material quality for a showroom look
        obj.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          node.castShadow = true;
          node.receiveShadow = true;
          const mats = Array.isArray(node.material)
            ? node.material
            : [node.material];
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial;
            if (std.envMapIntensity !== undefined) std.envMapIntensity = 1.5;
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
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          targetYaw = START_YAW + self.progress * Math.PI * 2 * rotations;
        },
      });
    }

    // ─── Resize ───────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    // ─── Render loop ──────────────────────────────────────────────────
    let raf: number;
    let lastT = performance.now();

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      if (model) {
        if (mode === 'auto') {
          currentYaw += dt * AUTO_SPEED;
        } else {
          // Smooth lag follows scroll target
          currentYaw += (targetYaw - currentYaw) * Math.min(1, dt * 7);
        }

        model.rotation.y = currentYaw;
        // Subtle breathing float
        model.position.y = Math.sin(t * 0.00065) * 0.055;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      st?.kill();
      ro.disconnect();
      renderer.dispose();
    };
  }, [glbPath, accent, accent2, mode, rotations]);

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
