import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface StatRowProps {
  label: string;
  value: number;
  accent: string;
  delay?: number;
}

export default function StatRow({ label, value, accent, delay = 0 }: StatRowProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-10% 0px -10% 0px' });
  const [display, setDisplay] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!inView) {
      setDisplay(0);
      setWidth(0);
      return;
    }
    const start = performance.now() + delay;
    const dur = 1300;
    let raf;
    const tick = (now) => {
      const k = Math.min(1, (now - start) / dur);
      if (k < 0) { raf = requestAnimationFrame(tick); return; }
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(eased * value));
      setWidth(eased * value);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, delay]);

  return (
    <div ref={ref} className="stat-row">
      <div className="font-mono text-[11px] tracking-[0.22em] text-white/60 uppercase">{label}</div>
      <div className="stat-bar" style={{ '--accent': accent }}>
        <div className="fill" style={{ width: `${width}%` }} />
        <div className="stat-ticks" />
      </div>
      <div className="ticker text-right text-white text-sm">
        {display}<span className="text-white/30">/100</span>
      </div>
    </div>
  );
}
