import { useMemo } from 'react';

interface ParticlesProps {
  accent: string;
  count?: number;
}

export default function Particles({ accent, count = 20 }: ParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        size: +(Math.random() * 2.5 + 0.8).toFixed(1),
        dur: +(Math.random() * 3.5 + 3.5).toFixed(1),
        delay: +(Math.random() * 7).toFixed(1),
        dx: +((Math.random() - 0.5) * 90).toFixed(0),
      })),
    [count]
  );

  return (
    <div className="particle-field" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            bottom: '12%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--accent': accent,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
            '--dx': `${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}
