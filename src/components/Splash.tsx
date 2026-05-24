import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface SplashProps {
  onDone: () => void;
  loadProgress?: number; // 0 → 1
}

export default function Splash({ onDone, loadProgress = 1 }: SplashProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Shared mutable state — avoids stale-closure issues across effects
  const state = useRef({ animDone: false, exiting: false });

  // Keep onDone stable inside the exit animation callback
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Call once both the animation AND all models are ready
  const tryExit = useCallback(() => {
    if (!state.current.animDone || state.current.exiting) return;
    state.current.exiting = true;
    gsap.to(ref.current, {
      opacity: 0, scale: 1.04, duration: 0.7, ease: 'power3.in',
      onComplete: () => onDoneRef.current(),
    });
  }, []);

  // Drive the bar with real load progress
  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, {
        scaleX: loadProgress,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: true,
      });
    }
    if (loadProgress >= 1) tryExit();
  }, [loadProgress, tryExit]);

  // Splash animation — onComplete marks animation done and checks if we can exit
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({
        onComplete: () => { state.current.animDone = true; tryExit(); },
      })
        .from('.splash-corner', { scale: 0, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)' })
        .from('.splash-h',      { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'expo.out' }, 0.1)
        .from('.splash-g',      { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'expo.out' }, 0.3)
        .from('.splash-sub',    { opacity: 0, y: 12, duration: 0.5 }, 0.7)
        .from('.splash-ready',  { opacity: 0, duration: 0.3 }, 2.1)
        .to({}, { duration: 0.4 });
    }, ref);

    return () => ctx.revert();
  }, [tryExit]);

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
            ref={barRef}
            className="absolute inset-y-0 left-0 right-0"
            style={{
              background: 'linear-gradient(90deg, #007FFF, #60a5fa)',
              boxShadow: '0 0 14px #007FFF',
              transformOrigin: 'left',
              transform: 'scaleX(0)',
            }}
          />
        </div>

        <div className="splash-ready font-mono text-[10px] tracking-[0.45em] uppercase text-white/50 mt-4">
          Welcome
        </div>
      </div>
    </div>
  );
}
