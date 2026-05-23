import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Showroom', href: '#showroom' },
  { label: 'Fleet',    href: '#fleet' },
  { label: 'Services', href: '#services' },
  { label: 'Booking',  href: '#booking' },
];

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="flex items-center justify-between px-6 lg:px-10 py-4 backdrop-blur-sm"
        animate={{ background: scrolled ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.4 }}
      >
        <a href="#showroom" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-white/30 rotate-45 grid place-items-center">
            <div className="w-2 h-2 bg-white rotate-45" />
          </div>
          <div>
            <div className="font-display text-2xl leading-none tracking-wider">HORIZON</div>
            <div className="font-mono text-[10px] text-white/40 tracking-[0.3em] mt-0.5">GARAGE · EST. 2026</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.22em] text-white/70 uppercase">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="hover:text-white transition-colors relative group">
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        <a
          href="#booking"
          className="btn-cta primary"
          style={{ '--accent': '#007FFF', fontSize: 15, padding: '10px 22px' } as React.CSSProperties}
        >
          Book a Service
        </a>
      </motion.div>
    </header>
  );
}
