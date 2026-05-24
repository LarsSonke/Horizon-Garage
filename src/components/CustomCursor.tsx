import { useEffect, useRef } from 'react';

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function CustomCursor() {
  if (isTouch) return null;
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -200, my = -200, rx = -200, ry = -200;
    let appeared = false;
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      rx = lerp(rx, mx, 0.1);
      ry = lerp(ry, my, 0.1);
      dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!appeared) {
        appeared = true;
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      if (t.closest('input, textarea, select')) {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
      } else if (t.closest('a, button, [role="button"]')) {
        dot.style.opacity      = '0';
        ring.style.width       = '52px';
        ring.style.height      = '52px';
        ring.style.borderColor = 'rgba(255,255,255,0.6)';
        ring.style.opacity     = appeared ? '1' : '0';
      } else {
        dot.style.opacity      = appeared ? '1' : '0';
        ring.style.width       = '36px';
        ring.style.height      = '36px';
        ring.style.borderColor = 'rgba(255,255,255,0.28)';
        ring.style.opacity     = appeared ? '1' : '0';
      }
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full bg-white"
        style={{ width: 8, height: 8, opacity: 0, transition: 'opacity 0.15s' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
        style={{
          width: 36,
          height: 36,
          border: '1px solid rgba(255,255,255,0.28)',
          opacity: 0,
          transition: 'width 0.25s ease, height 0.25s ease, border-color 0.25s ease, opacity 0.15s',
        }}
      />
    </>
  );
}
