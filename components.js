// Shared components: nav, marquee, HUD bits, tilt card, car stage, stat row, smoke, speed lines
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- NAV ----------
function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="scanline h-[2px] w-full" />
      <div className="flex items-center justify-between px-6 lg:px-10 py-4 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 border border-white/30 rotate-45 grid place-items-center">
              <div className="w-2 h-2 bg-white rotate-45" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl leading-none tracking-wider">HORIZON</div>
            <div className="font-mono text-[10px] text-white/40 tracking-[0.3em] mt-0.5">GARAGE · EST. 2026</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.22em] text-white/70 uppercase">
          <a href="#hero" className="hover:text-white">Showroom</a>
          <a href="#garage" className="hover:text-white">Garage</a>
          <a href="#showcase" className="hover:text-white">Showcase</a>
          <a href="#festival" className="hover:text-white">Festival</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex chip">
            <span className="dot" style={{['--accent']:'#A4F03A'}} />
            <span>LIVE · S6 OPEN</span>
          </div>
          <button className="btn-cta primary" style={{['--accent']:'#34D7FF'}}>Enter Garage</button>
        </div>
      </div>
    </header>
  );
}

// ---------- MARQUEE ----------
function Marquee({ items }) {
  const content = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {content.map((t, i) => (
          <span key={i} className={i % 3 === 0 ? 'hot' : ''}>
            {t} <span className="text-white/30 mx-2">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- TILT CARD ----------
function TiltCard({ children, className = '', strength = 14, style = {} }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * strength;
    const ry = (x - 0.5) * strength;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
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

// ---------- CAR STAGE (frames a placeholder / dropped render) ----------
function CarStage({ car, slotId, label, children }) {
  return (
    <div
      className="car-stage"
      style={{
        ['--accent']: car.accent,
        ['--accent2']: car.accent2,
        ['--stage-bg']: car.bg,
      }}
    >
      {/* HUD corners */}
      <div className="hud-corner tl" style={{borderColor: car.accent}} />
      <div className="hud-corner tr" style={{borderColor: car.accent}} />
      <div className="hud-corner bl" style={{borderColor: car.accent}} />
      <div className="hud-corner br" style={{borderColor: car.accent}} />

      {/* Scene label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-white/60 uppercase">
        {label || car.sceneLabel}
      </div>

      {/* Speed lines on the back wall */}
      <div className="speed-lines is-moving" style={{['--accent']: car.accent}} />

      {/* Tire smoke at the floor */}
      <div className="smoke" style={{ left: '18%', bottom: '8%' }} />
      <div className="smoke s2" style={{ right: '20%', bottom: '6%' }} />
      <div className="smoke s3" style={{ left: '45%', bottom: '4%' }} />

      {/* The slot */}
      <div className="car-slot">
        {car.model3d ? (
          <CarViewer
            storageKey={`car-3d-${car.id}`}
            accent={car.accent}
            accent2={car.accent2}
            label={`${car.name} · 3D`}
          />
        ) : (
          <image-slot
            id={slotId}
            shape="rect"
            placeholder={`${car.name} render`}
          ></image-slot>
        )}
      </div>

      {/* Bottom HUD strip */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between font-mono text-[10px] tracking-[0.24em] text-white/70 uppercase">
        <div className="space-y-1">
          <div className="text-white/40">UNIT · {car.id.toUpperCase()}-{car.year}</div>
          <div style={{color: car.accent}}>{car.class}</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-white/40">TOP SPEED</div>
          <div className="text-white text-base font-display tracking-widest">{car.stats.top} <span className="text-white/40 text-xs">MPH</span></div>
        </div>
      </div>

      {children}
    </div>
  );
}

// ---------- STAT ROW (animated bar) ----------
function StatRow({ label, value, accent, delay = 0, inView }) {
  const [w, setW] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) { setW(0); setN(0); return; }
    const t = setTimeout(() => setW(value), delay);
    const start = performance.now();
    const dur = 1100;
    let raf;
    const tick = (now) => {
      const k = Math.min(1, (now - start - delay) / dur);
      if (k < 0) { raf = requestAnimationFrame(tick); return; }
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(eased * value));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [inView, value, delay]);

  return (
    <div className="stat-row">
      <div className="font-mono text-[11px] tracking-[0.22em] text-white/60 uppercase">{label}</div>
      <div className="stat-bar" style={{['--w']: `${w}%`, ['--accent']: accent}}>
        <div className="stat-ticks" />
      </div>
      <div className="ticker text-right text-white text-sm">{n}<span className="text-white/30">/100</span></div>
    </div>
  );
}

// expose
Object.assign(window, { TopNav, Marquee, TiltCard, CarStage, StatRow });
