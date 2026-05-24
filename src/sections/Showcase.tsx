import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollCar from '../lib/ScrollCar';
import EnquiryDrawer from '../components/EnquiryDrawer';
import type { Car } from '../types';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function Showcase({ cars }: { cars: Car[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [enquiryCar, setEnquiryCar] = useState<Car | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => setActiveIdx(i),
          onEnterBack: () => setActiveIdx(i),
        });

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
      {/* Sticky background */}
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

          <motion.div
            className="absolute inset-0"
            animate={{ background: `radial-gradient(ellipse 80% 50% at 50% 70%, ${car.accent}28 0%, transparent 60%)` }}
            transition={{ duration: 0.8 }}
          />

          {/* Scene label */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/35">
            {car.sceneLabel}
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-12">
        <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">Showroom</div>
        <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">Inspect the Fleet</h2>
        <p className="text-white/60 max-w-xl mt-4">
          Scroll through to inspect each vehicle in detail. Full specification and 3D view.
        </p>
      </div>

      {/* Car scenes */}
      <div className="relative z-10">
        {cars.map((c, i) => (
          <CarScene
            key={c.id}
            car={c}
            index={i}
            refSetter={(el) => (sectionRefs.current[i] = el)}
            onEnquire={setEnquiryCar}
          />
        ))}
      </div>

      <AnimatePresence>
        {enquiryCar && (
          <EnquiryDrawer car={enquiryCar} onClose={() => setEnquiryCar(null)} />
        )}
      </AnimatePresence>

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
  refSetter: (el: HTMLDivElement | null) => void;
  onEnquire: (c: Car) => void;
}

function CarScene({ car, index, refSetter, onEnquire }: CarSceneProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Mount the WebGL renderer only when the section is ~1 viewport away —
  // gives Three.js time to initialise before the user actually scrolls to it.
  const attachRef = useCallback((el: HTMLDivElement | null) => {
    outerRef.current = el;
    refSetter(el);
  }, [refSetter]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMounted(true); io.disconnect(); } },
      { rootMargin: '0px 0px 100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      id={`scene-${car.id}`}
      ref={attachRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        {mounted && (
          <ScrollCar
            glbPath={car.glbPath!}
            accent={car.accent}
            accent2={car.accent2}
            sectionRef={outerRef}
            mode="drivein"
            rotations={1}
            triggerStart="top bottom"
            triggerEnd="bottom top"
            modelOffsetX={car.modelOffsetX}
          />
        )}
      </div>

      <div className="relative z-10 px-6 lg:px-12 py-24 max-w-xl">
        <CarMeta car={car} index={index} onEnquire={onEnquire} />
      </div>
    </div>
  );
}

function CarMeta({ car, index, onEnquire }: { car: Car; index: number; onEnquire: (c: Car) => void }) {
  const specs: [string, string][] = [
    ['POWERTRAIN', car.powertrain],
    ['0 — 60',     car.zero],
    ['DRIVETRAIN', car.drivetrain],
    ['WEIGHT',     car.weight],
    ['ASKING PRICE', car.price ?? 'POA'],
  ];

  return (
    <div className="lg:col-span-5 space-y-6" data-meta style={{ opacity: 0 }}>
      <div className="flex items-center gap-4">
        <div className="font-display text-7xl leading-none opacity-20">
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

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
        {specs.map(([label, value]) => (
          <SpecCell key={label} label={label} value={value} accent={car.accent} highlight={label === 'ASKING PRICE'} />
        ))}
      </div>

      <button
        onClick={() => onEnquire(car)}
        className="btn-cta primary inline-block"
        style={{ '--accent': car.accent } as React.CSSProperties}
      >
        Enquire About This Car
      </button>
    </div>
  );
}

function SpecCell({ label, value, accent, highlight = false }: { label: string; value: string; accent: string; highlight?: boolean }) {
  return (
    <div className="border border-white/10 px-3 py-2 bg-white/[0.02]">
      <div className="font-mono text-[10px] tracking-[0.24em] text-white/45 uppercase">{label}</div>
      <div className="font-display text-xl mt-0.5" style={{ color: highlight ? accent : 'white' }}>{value}</div>
    </div>
  );
}
