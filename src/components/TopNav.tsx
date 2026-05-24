import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Showroom', href: '#showroom' },
  { label: 'Fleet',    href: '#fleet' },
  { label: 'Services', href: '#services' },
  { label: 'Booking',  href: '#booking' },
];

export default function TopNav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [active,    setActive]    = useState('showroom');
  const [menuOpen,  setMenuOpen]  = useState(false);

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

  // Close menu when resizing back to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Prevent body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <motion.div
          className="flex items-center justify-between px-6 lg:px-10 py-4 backdrop-blur-sm"
          animate={{ background: scrolled || menuOpen ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0)' }}
          transition={{ duration: 0.4 }}
        >
          <a href="#showroom" onClick={close}>
            <img src={`${import.meta.env.BASE_URL}images/horizon-garage-logo.png`} alt="Horizon Garage" className="h-14 w-auto" />
          </a>

          {/* Desktop nav */}
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
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <a
            href="#booking"
            className="hidden md:block btn-cta primary"
            style={{ '--accent': '#007FFF', fontSize: 15, padding: '10px 22px' } as React.CSSProperties}
          >
            Book a Service
          </a>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-10 h-10"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <motion.span className="block h-px bg-white origin-center" style={{ width: 24 }}
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }} transition={{ duration: 0.25 }} />
            <motion.span className="block h-px bg-white" style={{ width: 24 }}
              animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }} transition={{ duration: 0.2 }} />
            <motion.span className="block h-px bg-white origin-center" style={{ width: 24 }}
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }} transition={{ duration: 0.25 }} />
          </button>
        </motion.div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(16px)' }}
          >
            <nav className="flex flex-col justify-center flex-1 px-8 gap-2">
              {NAV_LINKS.map(({ label, href }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  onClick={close}
                  className="font-display text-5xl text-white/70 hover:text-white transition-colors py-3 border-b border-white/8"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  {label}
                </motion.a>
              ))}
            </nav>

            <div className="px-8 pb-12">
              <a
                href="#booking"
                onClick={close}
                className="btn-cta primary block text-center"
                style={{ '--accent': '#007FFF', fontSize: 16, padding: '14px 24px' } as React.CSSProperties}
              >
                Book a Service
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
