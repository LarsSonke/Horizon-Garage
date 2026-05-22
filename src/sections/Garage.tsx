import { useEffect, useRef } from 'react';
import type { Car } from '../types';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TiltCard from '../components/TiltCard';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.25, 0.46, 0.45, 0.94];

export default function Garage({ cars }: { cars: Car[] }) {
  const gridRef = useRef(null);

  // GSAP stagger entrance for cards
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const cards = el.querySelectorAll('.garage-card');
      gsap.from(cards, {
        opacity: 0,
        y: 90,
        scale: 0.91,
        stagger: 0.1,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="garage" className="relative py-28 px-6 lg:px-12">
      <SectionHeader />

      {/* Grid */}
      <div ref={gridRef} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, i) => (
          <GarageCard key={car.id} car={car} index={i} />
        ))}
      </div>
    </section>
  );
}

function SectionHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <div ref={ref} className="max-w-7xl mx-auto mb-14">
      <div className="flex items-end justify-between flex-wrap gap-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">
            SECTION 02 / GARAGE
          </div>
          <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">The Roster</h2>
          <p className="text-white/60 max-w-xl mt-4">
            Five machines. Five disciplines. Hover to scan — click to step into the bay.
          </p>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 flex-wrap"
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        >
          {['ALL', 'HYPER', 'MUSCLE', 'TUNER', 'RALLY', 'GT'].map((t, i) => (
            <button
              key={t}
              className={`chip transition-all hover:border-white/40 ${i === 0 ? 'text-white' : 'text-white/55'}`}
              style={{ '--accent': '#34D7FF' }}
            >
              {i === 0 && <span className="dot" />}
              <span>{t}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function GarageCard({ car, index }: { car: Car; index: number }) {
  const miniStats = [
    ['SPD', car.stats.speed],
    ['HND', car.stats.handling],
    ['ACC', car.stats.accel],
  ];

  return (
    <TiltCard
      className="garage-card rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%), #07090e',
        '--accent': car.accent,
      }}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Background env */}
        <div className="absolute inset-0" style={{ background: car.bg }} />

        {/* Horizon halo */}
        <div
          className="absolute inset-x-0 top-1/2 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${car.accent}, transparent)`, filter: 'blur(1px)' }}
        />

        {/* Speed lines */}
        <div className="speed-lines is-moving" style={{ '--accent': car.accent }} />

        {/* Holographic shimmer */}
        <div className="holo-shimmer" />

        {/* Number tag */}
        <div className="absolute top-3 left-3 tilt-layer z-10">
          <div className="font-mono text-[10px] tracking-[0.28em] text-white/50 uppercase">
            No. {String(index + 1).padStart(2, '0')}
          </div>
          <div className="font-display text-4xl text-white text-glow chroma" style={{ '--accent': car.accent }}>
            {car.id.toUpperCase()}
          </div>
        </div>

        {/* Class chip */}
        <div className="absolute top-3 right-3 tilt-layer z-10">
          <div className="chip" style={{ '--accent': car.accent }}>
            <span className="dot" />
            <span>{car.class}</span>
          </div>
        </div>

        {/* Car render placeholder */}
        <div className="absolute inset-x-6 inset-y-10 grid place-items-center tilt-deep z-10">
          <div
            className="font-display text-5xl text-center leading-tight opacity-20"
            style={{ color: car.accent }}
          >
            {car.name.split(' ')[0]}
          </div>
        </div>

        {/* Smoke */}
        <div className="smoke smoke-accent s2" style={{ left: '10%', bottom: '2%', width: 200, height: 100, '--accent': car.accent }} />
        <div className="smoke smoke-white s3 r" style={{ right: '12%', bottom: '0%', width: 200, height: 100 }} />

        {/* HUD corners */}
        <div className="hud-corner tl" style={{ borderColor: car.accent, width: 14, height: 14 }} />
        <div className="hud-corner br" style={{ borderColor: car.accent, width: 14, height: 14 }} />
      </div>

      {/* Meta strip */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-t border-white/8">
        <div>
          <div className="font-display text-2xl leading-tight">{car.name}</div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase mt-1">{car.maker}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase">0—60</div>
          <div className="font-display text-2xl" style={{ color: car.accent }}>{car.zero}</div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="px-5 pb-5 grid grid-cols-3 gap-3">
        {miniStats.map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.24em] text-white/45 uppercase">
              <span>{k}</span>
              <span className="ticker text-white">{v}</span>
            </div>
            <div className="h-1 bg-white/10 mt-1 rounded overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${v}%`, background: car.accent, boxShadow: `0 0 10px ${car.accent}` }}
              />
            </div>
          </div>
        ))}
      </div>
    </TiltCard>
  );
}
