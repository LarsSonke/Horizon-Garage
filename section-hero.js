// Section: Hero
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

function Hero({ car }) {
  // motion-y subtitle reveal
  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden">
      {/* Background environment */}
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: car.bg }}
      />
      {/* Sky gradient */}
      <div
        className="absolute inset-x-0 top-0 h-2/3"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${car.accent}33 0%, transparent 60%)`,
        }}
      />
      {/* Speed lines layer */}
      <div className="speed-lines is-moving" style={{['--accent']: car.accent}} />

      {/* Big background type */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
        <div
          className="font-display tracking-[0.06em] leading-none text-center"
          style={{
            fontSize: 'clamp(140px, 22vw, 380px)',
            color: 'transparent',
            WebkitTextStroke: `1px ${car.accent}55`,
            opacity: 0.65,
            transform: 'translateY(-6vh)',
          }}
        >
          HORIZON
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 grid lg:grid-cols-12 gap-6 px-6 lg:px-12 pt-32 lg:pt-36 pb-8">
          {/* Left column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="chip" style={{['--accent']: car.accent}}>
              <span className="dot" />
              <span>Featured · Vol. 06</span>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-[0.28em] text-white/50 uppercase mb-3">
                {car.maker} · {car.year}
              </div>
              <h1
                className="font-display leading-[0.86]"
                style={{
                  fontSize: 'clamp(56px, 7.2vw, 124px)',
                  letterSpacing: '0.005em',
                  ['--accent']: car.accent,
                }}
              >
                <span className="block text-glow">{car.name.split(' ')[0]}</span>
                <span className="block text-white/90">{car.name.split(' ').slice(1).join(' ')}</span>
              </h1>
            </div>
            <p className="text-white/70 text-base max-w-md leading-relaxed">
              {car.bio}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button className="btn-cta primary" style={{['--accent']: car.accent}}>Drive It</button>
              <button className="btn-cta" style={{['--accent']: car.accent}}>Spec Sheet</button>
            </div>
          </div>

          {/* Center stage */}
          <div className="lg:col-span-8 relative">
            <CarStage car={car} slotId={`hero-${car.id}`} label={`SHOWROOM · BAY 01 · ${car.sceneLabel}`} />
            {/* Tagline ribbon */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-black border border-white/15 font-mono text-[10px] tracking-[0.3em] uppercase text-white/70 whitespace-nowrap">
              <span style={{color: car.accent}}>“</span> {car.tagline} <span style={{color: car.accent}}>”</span>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          {[
            ['0 — 60', car.zero],
            ['TOP', `${car.stats.top} MPH`],
            ['POWER', car.powertrain.split('·')[1]?.trim() || car.powertrain],
            ['DRIVE', car.drivetrain],
            ['WEIGHT', car.weight],
          ].map(([k, v], i) => (
            <div key={i} className="px-5 py-4 border-r last:border-r-0 border-white/10">
              <div className="font-mono text-[10px] tracking-[0.28em] text-white/45 uppercase">{k}</div>
              <div className="font-display text-2xl mt-1" style={{ color: i === 0 ? car.accent : 'white' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-4 right-6 z-20 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
        <span>Scroll · Enter Garage</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

window.Hero = Hero;
