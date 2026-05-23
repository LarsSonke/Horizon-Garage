import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CarStage from '../components/CarStage';
import ScrollCar from '../lib/ScrollCar';
import StatRow from '../components/StatRow';
import type { Car } from '../types';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function Showcase({ cars }: { cars: Car[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll-velocity tracker (for dynamic speed line intensity)
  useEffect(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf: number;
    const tick = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY);
      const dt = now - lastT;
      setVelocity(Math.min(1, dy / (dt * 0.1)));
      lastY = window.scrollY; lastT = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // GSAP ScrollTrigger per car section
  useEffect(() => {
    const ctx = gsap.context(() => {
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;

        // Activate on scroll (works for both 100vh and 300vh sections)
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => setActiveIdx(i),
          onEnterBack: () => setActiveIdx(i),
        });

        // Parallax car stage — only for non-sticky sections (data-stage present)
        const stage = el.querySelector('[data-stage]');
        if (stage) {
          gsap.fromTo(stage,
            { y: 70 },
            {
              y: -70, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
            }
          );
        }

        // Fade-in meta
        const meta = el.querySelector('[data-meta]');
        if (meta) {
          gsap.fromTo(meta,
            { opacity: 0, x: -50 },
            {
              opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 72%', toggleActions: 'play none none reverse' },
            }
          );
        }
      });
    }, rootRef);

    return () => ctx.revert();
  }, [cars]);

  const car = cars[activeIdx];

  return (
    <section id="showcase" ref={rootRef} className="relative">
      {/* Sticky background environment */}
      <div className="sticky top-0 h-0 z-0 pointer-events-none overflow-visible">
        <div className="relative w-screen h-screen -mt-px overflow-hidden">
          {cars.map((c, i) => (
            <motion.div
              key={c.id}
              className="absolute inset-0"
              animate={{ opacity: i === activeIdx ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              style={{ background: c.bg }}
            />
          ))}

          {/* Accent glow */}
          <motion.div
            className="absolute inset-0"
            animate={{ background: `radial-gradient(ellipse 80% 50% at 50% 70%, ${car.accent}28 0%, transparent 60%)` }}
            transition={{ duration: 0.8 }}
          />

          {/* Speed lines — intensity responds to scroll velocity */}
          <div
            className={`speed-lines is-moving ${velocity > 0.4 ? 'fast' : ''}`}
            style={{ '--accent': car.accent, opacity: 0.4 + velocity * 0.6 } as React.CSSProperties}
          />

          {/* Big number slug */}
          <div className="absolute inset-0 grid place-items-center select-none pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                className="font-display leading-none"
                style={{
                  fontSize: 'clamp(160px, 28vw, 480px)',
                  letterSpacing: '0.02em',
                  color: 'transparent',
                  WebkitTextStroke: `1px ${car.accent}30`,
                }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 0.55, scale: 1 }}
                exit={{ opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {String(activeIdx + 1).padStart(2, '0')}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Scene label */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            {car.sceneLabel}
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-12">
        <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">
          SECTION 03 / SHOWCASE
        </div>
        <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">In The Bay</h2>
        <p className="text-white/60 max-w-xl mt-4">
          Scroll through the lineup. The room dims, the lighting shifts, the floor changes underfoot.
        </p>
      </div>

      {/* Per-car scenes */}
      <div className="relative z-10">
        {cars.map((c, i) => (
          <CarScene
            key={c.id}
            car={c}
            index={i}
            active={i === activeIdx}
            refSetter={(el) => (sectionRefs.current[i] = el)}
          />
        ))}
      </div>

      {/* Side index nav */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-4">
        {cars.map((c, i) => (
          <a key={c.id} href={`#scene-${c.id}`} className="group flex items-center gap-3 justify-end">
            <span className={`font-mono text-[10px] tracking-[0.22em] uppercase transition-colors ${i === activeIdx ? 'text-white' : 'text-white/35 group-hover:text-white/70'}`}>
              {c.id}
            </span>
            <motion.span
              className="block w-2 h-2 rounded-full"
              animate={{
                background: i === activeIdx ? c.accent : 'rgba(255,255,255,0.25)',
                boxShadow: i === activeIdx ? `0 0 14px ${c.accent}` : 'none',
                scale: i === activeIdx ? 1.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          </a>
        ))}
      </div>
    </section>
  );
}

interface CarSceneProps {
  car: Car;
  index: number;
  active: boolean;
  refSetter: (el: HTMLDivElement | null) => void;
}

function CarMeta({ car, index }: { car: Car; index: number }) {
  return (
    <div className="lg:col-span-5 space-y-6" data-meta style={{ opacity: 0 }}>
      <div className="flex items-center gap-4">
        <div className="font-display text-7xl leading-none opacity-25">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45">
          {car.maker}<br />{car.class} · {car.year}
        </div>
      </div>

      <h3
        className="font-display leading-[0.86]"
        style={{ fontSize: 'clamp(44px, 5.5vw, 92px)', '--accent': car.accent } as React.CSSProperties}
      >
        <span className="text-glow">{car.name}</span>
      </h3>

      <p className="text-white/70 max-w-md leading-relaxed">{car.bio}</p>

      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">
          PERFORMANCE INDEX
        </div>
        {(
          [
            ['SPEED',        car.stats.speed,    0],
            ['HANDLING',     car.stats.handling, 120],
            ['ACCELERATION', car.stats.accel,    240],
            ['LAUNCH',       car.stats.launch,   360],
            ['BRAKING',      car.stats.brake,    480],
          ] as [string, number, number][]
        ).map(([label, value, delay]) => (
          <StatRow key={label} label={label} value={value} accent={car.accent} delay={delay} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        {(
          [
            ['POWERTRAIN', car.powertrain],
            ['0 — 60',     car.zero],
            ['DRIVE',      car.drivetrain],
            ['MASS',       car.weight],
          ] as [string, string][]
        ).map(([label, value]) => (
          <SpecCell key={label} label={label} value={value} accent={car.accent} />
        ))}
      </div>
    </div>
  );
}

function CarScene({ car, index, active: _active, refSetter }: CarSceneProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const is3D = !!(car.model3d && car.glbPath);

  return (
    <div
      id={`scene-${car.id}`}
      ref={(el) => {
        outerRef.current = el;
        refSetter(el);
      }}
      className="min-h-screen flex items-center px-6 lg:px-12 py-24"
    >
      {is3D ? (
        /* Natural-scroll section: car spins as you scroll past, no page lock */
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-10 items-center">
          <CarMeta car={car} index={index} />
          <div className="lg:col-span-7 h-[72vh]">
            <ScrollCar
              glbPath={car.glbPath!}
              accent={car.accent}
              accent2={car.accent2}
              sectionRef={outerRef}
              mode="scroll"
              rotations={2}
              triggerStart="top bottom"
              triggerEnd="bottom top"
              modelOffsetX={car.modelOffsetX}
            />
          </div>
        </div>
      ) : (
        /* Standard section: parallax-able CarStage */
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-10 items-center">
          <CarMeta car={car} index={index} />
          <div className="lg:col-span-7" data-stage>
            <CarStage car={car} slotId={`scene-${car.id}`} />
          </div>
        </div>
      )}
    </div>
  );
}

function SpecCell({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="border border-white/10 px-3 py-2 bg-white/[0.02]">
      <div className="font-mono text-[10px] tracking-[0.24em] text-white/45 uppercase">{label}</div>
      <div className="font-display text-xl mt-0.5" style={{ color: accent }}>{value}</div>
    </div>
  );
}
