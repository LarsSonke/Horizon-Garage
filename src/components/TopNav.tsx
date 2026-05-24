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
  const [active,   setActive]   = useState('showroom');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (hit.length > 0) setActive(hit[0].target.id);
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="flex items-center justify-between px-6 lg:px-10 py-4 backdrop-blur-sm"
        animate={{ background: scrolled ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.4 }}
      >
        <a href="#showroom">
          <img src={`${import.meta.env.BASE_URL}images/horizon-garage-logo.png`} alt="Horizon Garage" className="h-14 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.22em] text-white/70 uppercase">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = active === href.slice(1);
            return (
              <a
                key={label}
                href={href}
                className="relative transition-colors duration-200"
                style={{ color: isActive ? 'white' : undefined }}
              >
                {label}
                <motion.span
                  className="absolute -bottom-1 left-0 h-px"
                  style={{ background: '#007FFF' }}
                  animate={{ width: isActive ? '100%' : '0%' }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
                {/* hover underline for non-active */}
                {!isActive && (
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white/40 group-hover:w-full transition-all duration-300" />
                )}
              </a>
            );
          })}
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
