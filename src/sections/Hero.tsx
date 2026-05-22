import { useEffect, useRef, useMemo } from 'react';
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
import CarStage from '../components/CarStage';
import ScrollCar from '../lib/ScrollCar';
import Particles from '../components/Particles';

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

  // ─── Cursor parallax ──────────────────────────────────────────────
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

  // Map cursor to parallax offsets
  const bgTextX  = useTransform(smoothX, [-0.5, 0.5], [50, -50]);
  const stageOffX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const stageOffY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  // ─── Scroll parallax ──────────────────────────────────────────────
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgTextY     = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const bgTextOp    = useTransform(scrollYProgress, [0, 0.55], [0.6, 0]);
  const stageScrollY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const contentY    = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOp   = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // ─── Entrance animation ────────────────────────────────────────────
  const entranceDone = useRef(false);
  useEffect(() => {
    if (!heroReady || entranceDone.current) return;
    entranceDone.current = true;
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-stage-wrap', { opacity: 0, y: 90, scale: 0.93, filter: 'blur(16px)', duration: 1.2 }, 0.1)
        .from('.hero-chip',       { opacity: 0, x: -28,  duration: 0.5 }, 0.5)
        .from('.hero-title span', { opacity: 0, y: 55, skewY: 5, stagger: 0.1, duration: 0.75 }, 0.55)
        .from('.hero-bio',        { opacity: 0, y: 24,  duration: 0.5 }, 0.8)
        .from('.hero-btn',        { opacity: 0, y: 18,  stagger: 0.1,  duration: 0.4 }, 0.9)
        .from('.hero-stat',       { opacity: 0, y: 18,  stagger: 0.05, duration: 0.4 }, 1.0)
        .from('.hero-scroll-cue', { opacity: 0, duration: 0.4 }, 1.25);
    }, el);

    return () => ctx.revert();
  }, [heroReady]);

  // ─── Particles ────────────────────────────────────────────────────
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        size: +(Math.random() * 2.8 + 0.8).toFixed(1),
        dur: +(Math.random() * 3.5 + 4).toFixed(1),
        delay: +(Math.random() * 8).toFixed(1),
        dx: +((Math.random() - 0.5) * 100).toFixed(0),
      })),
    []
  );

  const statsData = [
    ['0 — 60', car.zero],
    ['TOP SPEED', `${car.stats.top} MPH`],
    ['POWER', car.powertrain.split('·')[1]?.trim() ?? car.powertrain],
    ['DRIVE', car.drivetrain],
    ['WEIGHT', car.weight],
  ];

  return (
    <section ref={sectionRef} id="showroom" className="relative min-h-screen w-full overflow-hidden">
      {/* ── Animated background env ── */}
      <motion.div
        className="absolute inset-0"
        animate={{ background: car.bg }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />

      {/* ── Sky radial ── */}
      <motion.div
        className="absolute inset-x-0 top-0 h-3/4 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse 100% 80% at 50% -5%, ${car.accent}40 0%, transparent 65%)` }}
        transition={{ duration: 1.1 }}
      />

      {/* ── Particles ── */}
      <div className="particle-field absolute inset-0" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`, bottom: '10%',
              width: `${p.size}px`, height: `${p.size}px`,
              '--accent': car.accent, '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`, '--dx': `${p.dx}px`,
            }}
          />
        ))}
      </div>

      {/* ── Speed lines ── */}
      <div className="speed-lines is-moving" style={{ '--accent': car.accent }} />

      {/* ── Ghost background text (cursor + scroll parallax) ── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ x: bgTextX, y: bgTextY, opacity: bgTextOp }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={car.id}
            className="font-display leading-none text-center"
            style={{
              fontSize: 'clamp(110px, 21vw, 380px)',
              letterSpacing: '0.06em',
              color: 'transparent',
              WebkitTextStroke: `1px ${car.accent}44`,
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            HORIZON
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Vignette ── */}
      <div className="vignette absolute inset-0 pointer-events-none" />

      {/* ── Main content ── */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <motion.div
          className="flex-1 grid lg:grid-cols-12 gap-6 px-6 lg:px-12 pt-32 lg:pt-36 pb-8"
          style={{ y: contentY, opacity: contentOp }}
        >
          {/* Left column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
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
                <span>Featured · Vol. 06</span>
              </motion.div>
            </AnimatePresence>

            <div>
              <div className="font-mono text-[11px] tracking-[0.28em] text-white/50 uppercase mb-3">
                {car.maker} · {car.year}
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
              <button className="hero-btn btn-cta primary" style={{ '--accent': car.accent }}>Drive It</button>
              <button className="hero-btn btn-cta" style={{ '--accent': car.accent }}>Spec Sheet</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${car.id}`}
                className="font-mono text-[11px] tracking-[0.18em] text-white/40 italic"
                style={{ borderLeft: `2px solid ${car.accent}88`, paddingLeft: 12 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {car.tagline}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center: car stage with dual parallax */}
          <div className="lg:col-span-8">
            <motion.div
              className="hero-stage-wrap relative"
              style={{ y: stageScrollY, x: stageOffX }}
            >
              <motion.div style={{ y: stageOffY }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`stage-${car.id}`}
                    initial={{ opacity: 0, scale: 0.96, filter: 'blur(16px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.03, filter: 'blur(16px)' }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    {car.model3d && car.glbPath ? (
                      <div className="w-full h-[56vh]">
                        <ScrollCar
                          glbPath={car.glbPath}
                          accent={car.accent}
                          accent2={car.accent2}
                          mode="auto"
                        />
                      </div>
                    ) : (
                      <CarStage car={car} slotId={`hero-${car.id}`} label={`SHOWROOM · BAY 01 · ${car.sceneLabel}`} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Tagline ribbon */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`ribbon-${car.id}`}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-4 py-1 bg-black border border-white/15 font-mono text-[10px] tracking-[0.3em] uppercase text-white/70 whitespace-nowrap z-10"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <span style={{ color: car.accent }}>"</span> {car.tagline} <span style={{ color: car.accent }}>"</span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stat strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 border-t border-white/10 bg-black/55 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {statsData.map(([k, v], i) => (
              <motion.div
                key={`${car.id}-${k}`}
                className="hero-stat px-5 py-4 border-r last:border-r-0 border-white/10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: EASE }}
              >
                <div className="font-mono text-[10px] tracking-[0.28em] text-white/45 uppercase">{k}</div>
                <div className="font-display text-2xl mt-1" style={{ color: i === 0 ? car.accent : 'white' }}>{v}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Car selector dots ── */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex gap-3">
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

      {/* ── Scroll cue ── */}
      <div className="hero-scroll-cue absolute bottom-4 right-6 z-20 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
        <span>Scroll · Enter Garage</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
