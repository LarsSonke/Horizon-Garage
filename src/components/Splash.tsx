import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Splash({ onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(ref.current, {
            opacity: 0, scale: 1.04, duration: 0.7, ease: 'power3.in', onComplete: onDone,
          });
        },
      });

      tl.from('.splash-corner', { scale: 0, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)' })
        .from('.splash-h',        { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'expo.out' }, 0.1)
        .from('.splash-g',        { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'expo.out' }, 0.3)
        .from('.splash-sub',      { opacity: 0, y: 12, duration: 0.5 }, 0.7)
        .fromTo('.splash-bar-fill',
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0.9)
        .from('.splash-ready', { opacity: 0, duration: 0.3 }, 2.1)
        .to({}, { duration: 0.4 });
    }, ref);

    return () => ctx.revert();
  }, [onDone]);

  return (
    <div ref={ref} className="splash">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0 1px,transparent 1px 60px),repeating-linear-gradient(90deg,rgba(255,255,255,0.025) 0 1px,transparent 1px 60px)',
        }}
      />

      <div className="splash-corner hud-corner tl" style={{ width: 36, height: 36, borderColor: '#007FFF', borderWidth: 2 }} />
      <div className="splash-corner hud-corner tr" style={{ width: 36, height: 36, borderColor: '#007FFF', borderWidth: 2 }} />
      <div className="splash-corner hud-corner bl" style={{ width: 36, height: 36, borderColor: '#007FFF', borderWidth: 2 }} />
      <div className="splash-corner hud-corner br" style={{ width: 36, height: 36, borderColor: '#007FFF', borderWidth: 2 }} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,127,255,0.07) 0%, transparent 70%)' }}
      />

      <div className="text-center px-6 relative z-10">
        <div className="overflow-hidden">
          <div className="splash-h font-display text-white" style={{ fontSize: 'clamp(60px, 14vw, 220px)', letterSpacing: '0.06em', lineHeight: 0.9 }}>
            HORIZON
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className="splash-g font-display"
            style={{ fontSize: 'clamp(60px, 14vw, 220px)', letterSpacing: '0.06em', lineHeight: 0.9, WebkitTextStroke: '1px rgba(255,255,255,0.35)', color: 'transparent' }}
          >
            GARAGE
          </div>
        </div>

        <div className="splash-sub font-mono text-white/40 text-[11px] tracking-[0.5em] uppercase mt-8 mb-6">
          Est. 2026 · Amsterdam · Automotive Excellence
        </div>

        <div className="mx-auto relative" style={{ width: 300, height: 2, background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="splash-bar-fill absolute inset-y-0 left-0 right-0"
            style={{ background: 'linear-gradient(90deg, #007FFF, #60a5fa)', boxShadow: '0 0 14px #007FFF' }}
          />
        </div>

        <div className="splash-ready font-mono text-[10px] tracking-[0.45em] uppercase text-white/50 mt-4">
          Welcome
        </div>
      </div>
    </div>
  );
}
