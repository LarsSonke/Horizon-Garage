import { useEffect, useRef } from 'react';
import type { Car } from '../types';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollCar from '../lib/ScrollCar';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.25, 0.46, 0.45, 0.94];

interface HeroProps {
  car: Car;
  heroReady: boolean;
  heroIdx: number;
  cars: Car[];
  onSelectCar: (index: number) => void;
}

export default function Hero({ car, heroReady, heroIdx, cars, onSelectCar }: HeroProps) {
  const sectionRef = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 40, damping: 18 });
  const smoothY = useSpring(rawY, { stiffness: 40, damping: 18 });

  useEffect(() => {
    const handler = (e) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [rawX, rawY]);

  const stageOffX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const stageOffY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const stageScrollY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const contentY    = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOp   = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const entranceDone = useRef(false);
  useEffect(() => {
    if (!heroReady || entranceDone.current) return;
    entranceDone.current = true;
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-chip',        { opacity: 0, x: -28, duration: 0.5 }, 0.3)
        .from('.hero-title span',  { opacity: 0, y: 55, skewY: 5, stagger: 0.1, duration: 0.75 }, 0.4)
        .from('.hero-bio',         { opacity: 0, y: 24, duration: 0.5 }, 0.65)
        .from('.hero-btn',         { opacity: 0, y: 18, stagger: 0.1, duration: 0.4 }, 0.75)
        .from('.hero-price-strip', { opacity: 0, y: 12, duration: 0.4 }, 0.9);
    }, el);

    return () => ctx.revert();
  }, [heroReady]);

  const priceStrip = [
    ['YEAR',   String(car.year)],
    ['ENGINE', car.powertrain.split('·')[0]?.trim() ?? car.powertrain],
    ['DRIVE',  car.drivetrain],
    ['PRICE',  car.price ?? 'POA'],
  ];

  return (
    <section ref={sectionRef} id="showroom" className="relative min-h-screen w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{ background: car.bg }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-x-0 top-0 h-3/4 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse 100% 80% at 50% -5%, ${car.accent}40 0%, transparent 65%)` }}
        transition={{ duration: 1.1 }}
      />

      <div className="vignette absolute inset-0 pointer-events-none" />

      <AnimatePresence>
        {car.model3d && car.glbPath && (
          <motion.div
            key={`hero-3d-${car.id}`}
            className="absolute inset-y-0 right-0 w-[72%] z-[1] pointer-events-none"
            style={{ y: stageScrollY, x: stageOffX }}
            initial={{ opacity: 0, filter: 'blur(20px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
          >
            <motion.div style={{ y: stageOffY }} className="w-full h-full">
              <ScrollCar
                glbPath={car.glbPath}
                accent={car.accent}
                accent2={car.accent2}
                mode="auto"
                modelOffsetX={car.modelOffsetX}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 pointer-events-none z-[2]"
        animate={{ opacity: car.model3d ? 1 : 0 }}
        transition={{ duration: 0.9 }}
        style={{ background: 'linear-gradient(to right, #000 0%, rgba(0,0,0,0.88) 26%, rgba(0,0,0,0.48) 50%, transparent 70%)' }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <motion.div
          className="flex-1 grid lg:grid-cols-12 gap-6 px-6 lg:px-12 pt-32 lg:pt-36 pb-8"
          style={{ y: contentY, opacity: contentOp }}
        >
          <div className="lg:col-span-5 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`chip-${car.id}`}
                className="hero-chip chip"
                style={{ '--accent': car.accent }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <span className="dot" />
                <span>Available Now · {car.year}</span>
              </motion.div>
            </AnimatePresence>

            <div>
              <div className="font-mono text-[11px] tracking-[0.28em] text-white/50 uppercase mb-3">
                {car.maker} · {car.class}
              </div>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`title-${car.id}`}
                  className="hero-title font-display leading-[0.86]"
                  style={{ fontSize: 'clamp(52px, 7vw, 120px)', '--accent': car.accent }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <span className="block text-glow">{car.name.split(' ')[0]}</span>
                  <span className="block text-white/90">{car.name.split(' ').slice(1).join(' ')}</span>
                </motion.h1>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={`bio-${car.id}`}
                className="hero-bio text-white/70 text-base max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, delay: 0.08, ease: EASE }}
              >
                {car.bio}
              </motion.p>
            </AnimatePresence>

            <div className="flex items-center gap-3 mt-1">
              <a href="#fleet" className="hero-btn btn-cta primary" style={{ '--accent': car.accent }}>View Listing</a>
              <a href="#booking" className="hero-btn btn-cta" style={{ '--accent': car.accent }}>Book a Service</a>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`price-${car.id}`}
                className="hero-price-strip grid grid-cols-4 gap-4 pt-4 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {priceStrip.map(([k, v], i) => (
                  <div key={k}>
                    <div className="font-mono text-[9px] tracking-[0.28em] text-white/40 uppercase">{k}</div>
                    <div
                      className="font-display text-lg mt-0.5 leading-tight"
                      style={{ color: i === 3 ? car.accent : 'white' }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {cars.map((c, i) => (
            <button key={c.id} onClick={() => onSelectCar(i)} className="group flex flex-col items-center gap-1">
              <motion.span
                className="block w-10 h-1 rounded-full"
                animate={{
                  background: i === heroIdx ? c.accent : 'rgba(255,255,255,0.18)',
                  boxShadow: i === heroIdx ? `0 0 14px ${c.accent}` : 'none',
                }}
                transition={{ duration: 0.3 }}
              />
              <span className={`font-mono text-[9px] tracking-[0.24em] uppercase transition-colors ${i === heroIdx ? 'text-white' : 'text-white/40'}`}>
                {c.id}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
