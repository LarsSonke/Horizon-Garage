import { useRef } from 'react';

import type { ReactNode, CSSProperties } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  style?: CSSProperties;
}

export default function TiltCard({ children, className = '', strength = 14, style = {} }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const onMove = (e) => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * strength;
      const ry = (x - 0.5) * strength;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      el.style.transition = 'transform 80ms linear';
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    });
  };

  const onLeave = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 500ms cubic-bezier(0.2,0.7,0.2,1)';
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card relative ${className}`}
      style={style}
    >
      {children}
      <div className="glare" />
    </div>
  );
}
