// Showcase: per-car pinned scenes with scroll-driven transitions, stat animations,
// background environment changes. Uses GSAP ScrollTrigger.

function Showcase({ cars }) {
  const rootRef = React.useRef(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const sectionRefs = React.useRef([]);

  React.useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const triggers = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const t = window.ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setActiveIdx(i),
        onEnterBack: () => setActiveIdx(i),
      });
      triggers.push(t);

      // Parallax the car stage upward as section scrolls
      const stage = el.querySelector('[data-stage]');
      if (stage) {
        const anim = gsap.fromTo(stage,
          { y: 60 },
          { y: -60, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
          }
        );
        triggers.push(anim.scrollTrigger);
      }
      // Fade-in the meta
      const meta = el.querySelector('[data-meta]');
      if (meta) {
        gsap.fromTo(meta,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' }
          }
        );
      }
    });

    return () => triggers.forEach(t => t && t.kill && t.kill());
  }, [cars]);

  const car = cars[activeIdx];

  return (
    <section id="showcase" ref={rootRef} className="relative">
      {/* Sticky environment background that fades between cars */}
      <div className="sticky top-0 h-0 z-0 pointer-events-none">
        <div className="relative w-screen h-screen -mt-px overflow-hidden">
          {cars.map((c, i) => (
            <div
              key={c.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                background: c.bg,
                opacity: i === activeIdx ? 1 : 0,
              }}
            />
          ))}
          <div
            className="absolute inset-0 transition-[background] duration-700"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 70%, ${car.accent}22 0%, transparent 60%)`
            }}
          />
          <div className="speed-lines is-moving" style={{['--accent']: car.accent}} />
          {/* Floating scene label */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            {car.sceneLabel}
          </div>
          {/* Big background slug */}
          <div className="absolute inset-0 grid place-items-center select-none">
            <div
              className="font-display"
              style={{
                fontSize: 'clamp(160px, 28vw, 460px)',
                letterSpacing: '0.02em',
                lineHeight: 0.8,
                color: 'transparent',
                WebkitTextStroke: `1px ${car.accent}33`,
                opacity: 0.55,
              }}
            >
              {String(activeIdx + 1).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Section header (in-flow, above the sticky scenes) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-12">
        <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">SECTION 03 / SHOWCASE</div>
        <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">In The Bay</h2>
        <p className="text-white/60 max-w-xl mt-4">
          Scroll through the lineup. The room dims, the lighting shifts, the floor changes underfoot.
        </p>
      </div>

      {/* Per-car scenes */}
      <div className="relative z-10">
        {cars.map((c, i) => (
          <CarScene
            key={c.id}
            car={c}
            index={i}
            active={i === activeIdx}
            refSetter={(el) => sectionRefs.current[i] = el}
          />
        ))}
      </div>

      {/* Side index nav */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
        {cars.map((c, i) => (
          <a
            key={c.id}
            href={`#scene-${c.id}`}
            className="group flex items-center gap-3 justify-end"
          >
            <span className={`font-mono text-[10px] tracking-[0.22em] uppercase transition ${i === activeIdx ? 'text-white' : 'text-white/35 group-hover:text-white/70'}`}>
              {c.id}
            </span>
            <span
              className="block w-2 h-2 rounded-full transition-all"
              style={{
                background: i === activeIdx ? c.accent : 'rgba(255,255,255,0.25)',
                boxShadow: i === activeIdx ? `0 0 12px ${c.accent}` : 'none',
                transform: i === activeIdx ? 'scale(1.4)' : 'scale(1)'
              }}
            />
          </a>
        ))}
      </div>
    </section>
  );
}

function CarScene({ car, index, active, refSetter }) {
  return (
    <div
      id={`scene-${car.id}`}
      ref={refSetter}
      className="min-h-screen flex items-center px-6 lg:px-12 py-24"
    >
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-10 items-center">
        {/* Left: meta + stats */}
        <div className="lg:col-span-5 space-y-6" data-meta>
          <div className="flex items-center gap-3">
            <div className="font-display text-7xl leading-none opacity-30">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45">
              {car.maker}<br/>{car.class} · {car.year}
            </div>
          </div>
          <h3
            className="font-display leading-[0.86]"
            style={{
              fontSize: 'clamp(48px, 5.6vw, 96px)',
              ['--accent']: car.accent,
            }}
          >
            <span className="text-glow">{car.name}</span>
          </h3>
          <p className="text-white/70 max-w-md leading-relaxed">{car.bio}</p>

          {/* Stats */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">PERFORMANCE INDEX</div>
            <StatRow label="SPEED"        value={car.stats.speed}    accent={car.accent} delay={0}   inView={active} />
            <StatRow label="HANDLING"     value={car.stats.handling} accent={car.accent} delay={120} inView={active} />
            <StatRow label="ACCELERATION" value={car.stats.accel}    accent={car.accent} delay={240} inView={active} />
            <StatRow label="LAUNCH"       value={car.stats.launch}   accent={car.accent} delay={360} inView={active} />
            <StatRow label="BRAKING"      value={car.stats.brake}    accent={car.accent} delay={480} inView={active} />
          </div>

          {/* Spec strip */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <SpecCell label="POWERTRAIN" value={car.powertrain} accent={car.accent} />
            <SpecCell label="0 — 60" value={car.zero} accent={car.accent} />
            <SpecCell label="DRIVE" value={car.drivetrain} accent={car.accent} />
            <SpecCell label="MASS" value={car.weight} accent={car.accent} />
          </div>
        </div>

        {/* Right: stage */}
        <div className="lg:col-span-7" data-stage>
          <CarStage car={car} slotId={`scene-${car.id}`} />
        </div>
      </div>
    </div>
  );
}

function SpecCell({ label, value, accent }) {
  return (
    <div className="border border-white/10 px-3 py-2 bg-white/[0.02]">
      <div className="font-mono text-[10px] tracking-[0.24em] text-white/45 uppercase">{label}</div>
      <div className="font-display text-xl mt-0.5" style={{color: accent}}>{value}</div>
    </div>
  );
}

window.Showcase = Showcase;
