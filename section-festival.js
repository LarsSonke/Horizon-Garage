// Festival / events section + footer
function Festival() {
  const events = [
    { tag: 'AURORA RUN',   loc: 'NORTH SHORE · IS',  date: 'JUN 14',  type: 'Open lobby',  hue: '#34D7FF' },
    { tag: 'NEON DOCKS',   loc: 'PORT YAMASU · JP',  date: 'JUL 02',  type: 'Drift jam',   hue: '#FF3DA5' },
    { tag: 'MILE OF DUST', loc: 'MOJAVE FLATS · US', date: 'AUG 19',  type: 'Top speed',   hue: '#FF7A1A' },
    { tag: 'COL ROUGE',    loc: 'ALPINE BORDER · CH', date: 'SEP 08', type: 'Hillclimb',   hue: '#A4F03A' },
  ];
  return (
    <section id="festival" className="relative py-28 px-6 lg:px-12 border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">SECTION 04 / FESTIVAL</div>
            <h2 className="font-display text-6xl md:text-8xl leading-none mt-3">Season Six</h2>
            <p className="text-white/60 max-w-xl mt-4">
              Four open-world meets. Pick a stage, bring a build, leave with stories.
            </p>
          </div>
          <button className="btn-cta primary" style={{['--accent']:'#FFD23A'}}>View Calendar</button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((e, i) => (
            <div
              key={e.tag}
              className="relative border border-white/10 p-5 overflow-hidden group cursor-pointer"
              style={{ background: `linear-gradient(180deg, ${e.hue}10 0%, transparent 60%), #07090e` }}
            >
              <div className="hud-corner tl" style={{borderColor: e.hue, width: 14, height: 14}} />
              <div className="hud-corner br" style={{borderColor: e.hue, width: 14, height: 14}} />
              <div className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">EVENT {String(i+1).padStart(2,'0')}</div>
              <div className="font-display text-4xl mt-2" style={{color: 'white', textShadow: `0 0 18px ${e.hue}55`}}>{e.tag}</div>
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/55 mt-2">{e.loc}</div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/45">DATE</div>
                  <div className="font-display text-2xl">{e.date}</div>
                </div>
                <div className="chip" style={{['--accent']: e.hue}}>
                  <span className="dot" />
                  <span>{e.type}</span>
                </div>
              </div>
              {/* hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 80%, ${e.hue}22, transparent 70%)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <div className="font-display text-5xl leading-none">HORIZON<br/>GARAGE</div>
          <p className="text-white/55 mt-4 max-w-sm">
            A fictional showroom for fictional machines. Bring your own renders;
            this is a stage, not a brand.
          </p>
        </div>
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-[11px] tracking-[0.22em] uppercase">
          {[
            ['EXPLORE', ['Showroom', 'Garage', 'Showcase', 'Festival']],
            ['MACHINES', ['Hypercar', 'Muscle', 'Tuner', 'Rally', 'GT']],
            ['CHANNELS', ['Telemetry', 'Photo Mode', 'Livery Lab', 'Convoy']],
            ['LEGAL', ['Codex', 'Imprint', 'Press', 'Contact']],
          ].map(([title, items]) => (
            <div key={title}>
              <div className="text-white/45 mb-3">{title}</div>
              <ul className="space-y-2 text-white/75">
                {items.map(x => <li key={x}><a href="#" className="hover:text-white">{x}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-6 lg:px-12 py-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">
        <span>© 2026 HORIZON GARAGE · A FICTIONAL SHOWROOM</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" style={{boxShadow:'0 0 8px #34d399'}} />
          ALL SYSTEMS · GREEN
        </span>
      </div>
    </footer>
  );
}

window.Festival = Festival;
window.Footer = Footer;
