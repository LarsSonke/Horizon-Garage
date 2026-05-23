import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE = [0.25, 0.46, 0.45, 0.94];

const SERVICES = [
  {
    title: 'Engine Diagnostics & Repair',
    desc: 'Full OBD scan, compression and leak-down testing, and hands-on engine work by our senior technicians.',
    icon: '⚙️',
    accent: '#FF1E1E',
  },
  {
    title: 'Performance Tuning',
    desc: 'ECU remapping, exhaust upgrades, suspension geometry — tuned to your spec on our in-house dyno.',
    icon: '📈',
    accent: '#007FFF',
  },
  {
    title: 'Bodywork & Paint Correction',
    desc: 'Panel repair, ceramic coating, and multi-stage paint correction to showroom standard.',
    icon: '🖌',
    accent: '#FFBF00',
  },
  {
    title: 'Scheduled Maintenance',
    desc: 'Manufacturer-specified service intervals, oil and fluid changes, filter replacements, and brake inspection.',
    icon: '📋',
    accent: '#10b981',
  },
  {
    title: 'Brake & Suspension',
    desc: 'Pad and disc replacement, caliper rebuilds, alignment, and full suspension overhaul for any budget.',
    icon: '🔩',
    accent: '#a855f7',
  },
  {
    title: 'Pre-purchase Inspection',
    desc: "Independent 120-point check before you commit. We'll tell you exactly what you're buying.",
    icon: '🔍',
    accent: '#f97316',
  },
];

export default function Services() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-10% 0px' });

  return (
    <section id="services" ref={sectionRef} className="relative py-28 px-6 lg:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">What We Do</div>
          <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">Our Services</h2>
          <p className="text-white/60 max-w-xl mt-4">
            From a quick oil change to a full engine rebuild. We work on performance, classic, and everyday vehicles.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              className="border border-white/10 p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            >
              <div
                className="w-10 h-10 rounded-lg grid place-items-center text-xl mb-4 border border-white/10"
                style={{ background: `${s.accent}18` }}
              >
                {s.icon}
              </div>
              <h3
                className="font-display text-2xl leading-tight mb-2"
                style={{ color: s.accent }}
              >
                {s.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
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
          <div className="font-display text-5xl leading-none">HORIZON<br />GARAGE</div>
          <p className="text-white/55 mt-4 max-w-sm">
            Premium automotive repairs and curated vehicle sales in Amsterdam. Book online or drop us a message.
          </p>

          <div className="flex gap-3 mt-6">
            <a
              href="https://wa.me/31643451816?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20Horizon%20Garage."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta primary flex items-center gap-2"
              style={{ '--accent': '#25D366', fontSize: 14, padding: '10px 18px' }}
            >
              <WhatsAppIcon /> WhatsApp
            </a>
            <a
              href="mailto:contact@horizongarage.com"
              className="btn-cta flex items-center gap-2"
              style={{ '--accent': '#007FFF', fontSize: 14, padding: '10px 18px' }}
            >
              Email Us
            </a>
          </div>
        </div>

        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-[11px] tracking-[0.22em] uppercase">
          {[
            ['Navigate',  ['Showroom', 'Fleet', 'Services', 'Book Appointment']],
            ['Services',  ['Engine Repair', 'Performance Tuning', 'Bodywork', 'Pre-purchase Check']],
            ['Contact',   ['Stationsplein 12', '1012 AB Amsterdam', 'contact@horizongarage.com', '+31 6 43 45 18 16']],
          ].map(([title, items]) => (
            <div key={title as string}>
              <div className="text-white/40 mb-3">{title as string}</div>
              <ul className="space-y-2 text-white/65">
                {(items as string[]).map((x) => (
                  <li key={x}><span className="hover:text-white transition-colors cursor-default">{x}</span></li>
                ))}
              </ul>
            </div>
          ))}
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
