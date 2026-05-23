import React, { useEffect, useRef, useState } from 'react';
import type { Car } from '../types';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.25, 0.46, 0.45, 0.94];

export default function Fleet({ cars }: { cars: Car[] }) {
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.fleet-card'), {
        opacity: 0, y: 70, scale: 0.93, stagger: 0.1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="fleet" className="relative py-28 px-6 lg:px-12">
      <FleetHeader />
      <div ref={gridRef} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, i) => <FleetCard key={car.id} car={car} index={i} />)}
      </div>
    </section>
  );
}

function FleetHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <div ref={ref} className="max-w-7xl mx-auto mb-14">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">For Sale</div>
        <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">Our Fleet</h2>
        <p className="text-white/60 max-w-xl mt-4">
          Hand-picked, fully inspected, and ready to drive. Every car comes with a full service history and 12-month warranty.
        </p>
      </motion.div>
    </div>
  );
}

function FleetCard({ car, index }: { car: Car; index: number }) {
  const [hovered, setHovered] = useState(false);
  const tiltRef  = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const hasImages = !!(car.imgStatic && car.imgAction);

  const specs = [
    ['ENGINE',  car.powertrain.split('·')[0]?.trim() ?? car.powertrain],
    ['DRIVE',   car.drivetrain],
    ['WEIGHT',  car.weight],
  ];

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el    = tiltRef.current;
    const glare = glareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px   = (e.clientX - rect.left) / rect.width;   // 0–1
    const py   = (e.clientY - rect.top)  / rect.height;
    const rx   = (px - 0.5) * 2;                          // -1 to 1
    const ry   = (py - 0.5) * 2;
    el.style.transition = 'none';
    el.style.transform  = `perspective(900px) rotateY(${rx * 5}deg) rotateX(${-ry * 5}deg) scale3d(1.02,1.02,1.02)`;
    el.style.boxShadow  = `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${car.accent}18`;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.10) 0%, transparent 55%)`;
      glare.style.opacity    = '1';
    }
  };

  const onMouseLeave = () => {
    const el    = tiltRef.current;
    const glare = glareRef.current;
    if (el) {
      el.style.transition = 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.5s ease';
      el.style.transform  = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
      el.style.boxShadow  = '';
    }
    if (glare) glare.style.opacity = '0';
    setHovered(false);
  };

  return (
    <div
      className="fleet-card"
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={tiltRef}
        className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%), #07090e', willChange: 'transform' }}
      >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasImages ? (
          <>
            {/* Static image — always present, fades out on hover */}
            <motion.img
              src={car.imgStatic}
              alt={car.name}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* Action image — underneath, scales up slightly then takes over */}
            <motion.img
              src={car.imgAction}
              alt={`${car.name} in motion`}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 1.06 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* Subtle accent tint overlay on hover */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ background: `linear-gradient(to top, ${car.accent}40 0%, transparent 50%)` }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: car.bg }} />
            <motion.div
              className="absolute inset-0"
              animate={{ background: `radial-gradient(ellipse 80% 60% at 50% 80%, ${car.accent}30 0%, transparent 70%)` }}
            />
            <div
              className="absolute inset-x-0 top-1/2 h-px opacity-50"
              style={{ background: `linear-gradient(90deg, transparent, ${car.accent}, transparent)`, filter: 'blur(1px)' }}
            />
          </>
        )}

        {/* Top scrim so chips are readable over any image */}
        <div className="absolute inset-x-0 top-0 h-20 z-[5] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />

        {/* Condition chip */}
        <div className="absolute top-3 right-3 z-10">
          <div className="chip" style={{ '--accent': car.accent }}>
            <span className="dot" />
            <span>{car.class}</span>
          </div>
        </div>

        {/* Index */}
        <div className="absolute top-3 left-3 z-10 font-mono text-[10px] tracking-[0.28em] text-white/60 uppercase">
          No. {String(index + 1).padStart(2, '0')}
        </div>

        {/* "In Motion" label fades in on hover */}
        <AnimatePresence>
          {hovered && hasImages && (
            <motion.div
              className="absolute bottom-3 left-3 z-10 font-mono text-[9px] tracking-[0.3em] uppercase"
              style={{ color: car.accent }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
            >
              In Motion
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta */}
      <div className="px-5 py-4 border-t border-white/8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">{car.maker} · {car.year}</div>
            <div className="font-display text-2xl leading-tight mt-0.5">{car.name}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">Asking Price</div>
            <div className="font-display text-xl mt-0.5" style={{ color: car.accent }}>{car.price ?? 'POA'}</div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-2 border-t border-white/6">
        {specs.map(([k, v]) => (
          <div key={k} className="pt-3">
            <div className="font-mono text-[9px] tracking-[0.24em] text-white/35 uppercase">{k}</div>
            <div className="text-white/80 text-xs mt-0.5 leading-tight">{v}</div>
          </div>
        ))}
      </div>

      {/* CTA — mt-auto pins it to the bottom regardless of name length */}
      <div className="px-5 pb-5 mt-auto">
        <a
          href="#booking"
          className="btn-cta primary w-full text-center block"
          style={{ '--accent': car.accent, fontSize: 15, padding: '10px 0' }}
        >
          Enquire Now
        </a>
      </div>

      {/* Mouse-follow glare */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
        style={{ opacity: 0, mixBlendMode: 'screen', transition: 'opacity 0.3s' }}
      />
      </div>
    </div>
  );
}
