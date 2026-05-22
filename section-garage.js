// Garage grid: 3D tilt cards for every car
function Garage({ cars, onSelect }) {
  return (
    <section id="garage" className="relative py-28 px-6 lg:px-12">
      {/* Section header */}
      <div className="max-w-7xl mx-auto mb-14">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">SECTION 02 / GARAGE</div>
            <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">The Roster</h2>
            <p className="text-white/60 max-w-xl mt-4">
              Five machines. Five disciplines. Hover to scan their plates — click to step into the bay.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['ALL', 'HYPER', 'MUSCLE', 'TUNER', 'RALLY', 'GT'].map((t, i) => (
              <button
                key={t}
                className={`chip ${i === 0 ? 'text-white' : 'text-white/55'}`}
                style={{['--accent']: '#34D7FF'}}
              >
                {i === 0 && <span className="dot" />}
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, i) => (
          <TiltCard
            key={car.id}
            className="rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.0) 100%), #07090e',
              ['--accent']: car.accent,
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {/* environment bg */}
              <div className="absolute inset-0" style={{ background: car.bg }} />
              {/* horizon halo */}
              <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${car.accent}, transparent)`, filter: 'blur(1px)' }} />
              {/* speed lines */}
              <div className="speed-lines is-moving" style={{['--accent']: car.accent}} />
              {/* number tag */}
              <div className="absolute top-3 left-3 tilt-layer">
                <div className="font-mono text-[10px] tracking-[0.28em] text-white/50 uppercase">No. {String(i + 1).padStart(2, '0')}</div>
                <div className="font-display text-4xl text-white text-glow" style={{['--accent']: car.accent}}>{car.id.toUpperCase()}</div>
              </div>
              {/* class chip */}
              <div className="absolute top-3 right-3 tilt-layer">
                <div className="chip" style={{['--accent']: car.accent}}>
                  <span className="dot" />
                  <span>{car.class}</span>
                </div>
              </div>
              {/* car slot */}
              <div className="absolute inset-x-6 inset-y-10 grid place-items-center tilt-deep">
                <image-slot
                  id={`garage-${car.id}`}
                  shape="rect"
                  placeholder={`${car.name} 3/4 render`}
                  style={{width: '100%', height: '100%'}}
                ></image-slot>
              </div>
              {/* smoke */}
              <div className="smoke" style={{ left: '15%', bottom: '4%', width: 200, height: 100 }} />
              <div className="smoke s2" style={{ right: '15%', bottom: '2%', width: 200, height: 100 }} />
              {/* corner ticks */}
              <div className="hud-corner tl" style={{borderColor: car.accent, width: 14, height: 14}} />
              <div className="hud-corner br" style={{borderColor: car.accent, width: 14, height: 14}} />
            </div>

            {/* meta strip */}
            <div className="px-5 py-4 flex items-center justify-between gap-4 border-t border-white/8">
              <div>
                <div className="font-display text-2xl leading-tight">{car.name}</div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase mt-1">{car.maker}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase">0—60</div>
                <div className="font-display text-2xl" style={{color: car.accent}}>{car.zero}</div>
              </div>
            </div>
            {/* mini stats */}
            <div className="px-5 pb-5 grid grid-cols-3 gap-3">
              {[
                ['SPD', car.stats.speed],
                ['HND', car.stats.handling],
                ['ACC', car.stats.accel],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.24em] text-white/45 uppercase">
                    <span>{k}</span>
                    <span className="ticker text-white">{v}</span>
                  </div>
                  <div className="h-1 bg-white/10 mt-1 rounded">
                    <div className="h-full rounded" style={{ width: `${v}%`, background: car.accent, boxShadow: `0 0 10px ${car.accent}` }} />
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}

window.Garage = Garage;
