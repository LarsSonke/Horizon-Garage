import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE = [0.25, 0.46, 0.45, 0.94];

const SERVICES = [
  {
    bookingId: 'engine',
    title: 'Engine Diagnostics & Repair',
    desc: 'Full OBD scan, compression and leak-down testing, and hands-on engine work by our senior technicians.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    accent: '#FF1E1E',
  },
  {
    bookingId: 'tuning',
    title: 'Performance Tuning',
    desc: 'ECU remapping, exhaust upgrades, suspension geometry — tuned to your spec on our in-house dyno.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    accent: '#007FFF',
  },
  {
    bookingId: 'bodywork',
    title: 'Bodywork & Paint Correction',
    desc: 'Panel repair, ceramic coating, and multi-stage paint correction to showroom standard.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    accent: '#FFBF00',
  },
  {
    bookingId: 'general',
    title: 'Scheduled Maintenance',
    desc: 'Manufacturer-specified service intervals, oil and fluid changes, filter replacements, and brake inspection.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    accent: '#10b981',
  },
  {
    bookingId: 'brakes',
    title: 'Brake & Suspension',
    desc: 'Pad and disc replacement, caliper rebuilds, alignment, and full suspension overhaul for any budget.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    accent: '#a855f7',
  },
  {
    bookingId: 'prepurchase',
    title: 'Pre-purchase Inspection',
    desc: "Independent 120-point check before you commit. We'll tell you exactly what you're buying.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    accent: '#f97316',
  },
];

function ServiceCard({ s, i, inView }: { s: typeof SERVICES[number]; i: number; inView: boolean }) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleBook = () => {
    window.dispatchEvent(new CustomEvent('horizon:select-service', { detail: { id: s.bookingId } }));
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el    = cardRef.current;
    const glare = glareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px   = (e.clientX - rect.left) / rect.width;
    const py   = (e.clientY - rect.top)  / rect.height;
    const rx   = (px - 0.5) * 2;
    const ry   = (py - 0.5) * 2;
    el.style.transition  = 'none';
    el.style.transform   = `perspective(800px) rotateY(${rx * 6}deg) rotateX(${-ry * 6}deg) scale3d(1.02,1.02,1.02)`;
    el.style.borderColor = `${s.accent}55`;
    el.style.boxShadow   = `0 0 30px ${s.accent}18, 0 16px 40px rgba(0,0,0,0.4)`;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.08) 0%, transparent 55%)`;
      glare.style.opacity    = '1';
    }
  };

  const onMouseLeave = () => {
    const el    = cardRef.current;
    const glare = glareRef.current;
    if (el) {
      el.style.transition  = 'transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94), border-color 0.4s, box-shadow 0.4s';
      el.style.transform   = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
      el.style.borderColor = '';
      el.style.boxShadow   = '';
    }
    if (glare) glare.style.opacity = '0';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
    >
      <div
        ref={cardRef}
        className="relative border border-white/10 p-6 bg-white/[0.02] h-full"
        style={{ willChange: 'transform' }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div
          className="w-10 h-10 rounded-lg grid place-items-center mb-4 border border-white/10"
          style={{ background: `${s.accent}18`, color: s.accent }}
        >
          {s.icon}
        </div>
        <h3 className="font-display text-2xl leading-tight mb-2" style={{ color: s.accent }}>
          {s.title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed mb-5">{s.desc}</p>

        <button
          onClick={handleBook}
          className="btn-cta text-sm flex items-center gap-2 mt-auto"
          style={{ '--accent': s.accent, fontSize: 12, padding: '8px 14px' } as React.CSSProperties}
        >
          Book This Service
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Mouse-follow glare */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0, mixBlendMode: 'screen', transition: 'opacity 0.3s' }}
        />
      </div>
    </motion.div>
  );
}

export default function Services() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-10% 0px' });

  return (
    <section id="services" ref={sectionRef} className="relative py-28 px-6 lg:px-12 border-t border-white/10" style={{ background: 'radial-gradient(ellipse at 90% 0%, #180800 0%, #0c0300 40%, #030100 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase" style={{ color: '#f97316' }}>What We Do</div>
          <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">Our Services</h2>
          <p className="text-white/60 max-w-xl mt-4">
            From a quick oil change to a full engine rebuild. We work on performance, classic, and everyday vehicles.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} s={s} i={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <img src={`${import.meta.env.BASE_URL}images/horizon-garage-logo.png`} alt="Horizon Garage" className="h-14 w-auto" />
          <p className="text-white/55 mt-4 max-w-sm">
            Premium automotive repairs and curated vehicle sales in Amsterdam. Book online or drop us a message.
          </p>

          <div className="flex gap-3 mt-6">
            <a
              href="mailto:service.horizon.garage@gmail.com"
              className="btn-cta primary flex items-center gap-2"
              style={{ '--accent': '#007FFF', fontSize: 14, padding: '10px 18px' }}
            >
              Email Us
            </a>
          </div>
        </div>

        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-[11px] tracking-[0.22em] uppercase">
          <div>
            <div className="text-white/40 mb-3">Navigate</div>
            <ul className="space-y-2 text-white/65">
              {([
                { label: 'Showroom',         href: '#showroom' },
                { label: 'Fleet',            href: '#fleet' },
                { label: 'Services',         href: '#services' },
                { label: 'Book Appointment', href: '#booking' },
              ] as const).map(({ label, href }) => (
                <li key={label}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white/40 mb-3">Services</div>
            <ul className="space-y-2 text-white/65">
              {([
                { label: 'Engine Repair',      id: 'engine' },
                { label: 'Performance Tuning', id: 'tuning' },
                { label: 'Bodywork',           id: 'bodywork' },
                { label: 'Pre-purchase Check', id: 'prepurchase' },
              ] as const).map(({ label, id }) => (
                <li key={label}>
                  <button
                    className="hover:text-white transition-colors text-left"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('horizon:select-service', { detail: { id } }));
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white/40 mb-3">Contact</div>
            <ul className="space-y-2 text-white/65">
              <li><span className="cursor-default">Stationsplein 12</span></li>
              <li><span className="cursor-default">1012 AB Amsterdam</span></li>
              <li>
                <a href="mailto:service.horizon.garage@gmail.com" className="hover:text-white transition-colors normal-case">
                  service.horizon.garage@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 lg:px-12 py-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">
        <span>© 2026 Horizon Garage · Amsterdam</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px #34d399' }} />
          Open Mon – Sat
        </span>
      </div>
    </footer>
  );
}

