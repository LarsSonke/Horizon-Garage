// App entry — selects the hero car based on intersection of hero scroll position,
// stitches sections together.

function App() {
  const cars = window.CARS;
  const [heroCar, setHeroCar] = React.useState(cars[0]);
  const [heroIdx, setHeroIdx] = React.useState(0);

  // Auto-cycle hero car every 6s
  React.useEffect(() => {
    const t = setInterval(() => {
      setHeroIdx(i => {
        const next = (i + 1) % cars.length;
        setHeroCar(cars[next]);
        return next;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [cars]);

  const marqueeItems = [
    'SEASON 06 LIVE',
    'NEW · AETHER GT-X',
    'TOP SPEED 304 MPH',
    'PHOTO MODE V3',
    'CONVOY MATCHMAKING',
    'TUNING LAB OPEN',
    'NIGHT RUNS · FRIDAYS',
  ];

  return (
    <div className="relative grain">
      <TopNav />

      {/* Hero */}
      <Hero car={heroCar} />

      {/* Hero car selector dots */}
      <div className="relative z-30 -mt-12 mb-2 flex justify-center gap-2">
        {cars.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setHeroIdx(i); setHeroCar(c); }}
            className="group flex flex-col items-center gap-1"
          >
            <span
              className="block w-10 h-1 rounded-full transition-all"
              style={{
                background: i === heroIdx ? c.accent : 'rgba(255,255,255,0.18)',
                boxShadow: i === heroIdx ? `0 0 12px ${c.accent}` : 'none',
              }}
            />
            <span className={`font-mono text-[9px] tracking-[0.24em] uppercase ${i === heroIdx ? 'text-white' : 'text-white/40'}`}>
              {c.id}
            </span>
          </button>
        ))}
      </div>

      <Marquee items={marqueeItems} />

      <Garage cars={cars} />

      <Marquee items={['CAUTION · OVERSTEER', 'FUEL · 87%', 'BOOST · MAX', 'LAUNCH · ARMED', 'RACE LINE · ON', 'TIRE TEMP · OPT']} />

      <Showcase cars={cars} />

      <Festival />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
