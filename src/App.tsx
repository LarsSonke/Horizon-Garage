import { useState, useEffect, useCallback } from 'react';
import { motion, useScroll } from 'framer-motion';
import { CARS } from './data/cars';
import TopNav from './components/TopNav';
import Marquee from './components/Marquee';
import Splash from './components/Splash';
import Hero from './sections/Hero';
import Garage from './sections/Garage';
import Showcase from './sections/Showcase';
import Festival, { Footer } from './sections/Festival';

const MARQUEE_A = ['SEASON 06 LIVE', 'NEW · RS-992 GT3', 'TOP SPEED 304 MPH', 'PHOTO MODE V3', 'CONVOY MATCHMAKING', 'TUNING LAB OPEN', 'NIGHT RUNS · FRIDAYS'];
const MARQUEE_B = ['CAUTION · OVERSTEER', 'FUEL · 87%', 'BOOST · MAX', 'LAUNCH · ARMED', 'RACE LINE · ON', 'TIRE TEMP · OPT'];

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [accent, setAccent] = useState('#34D7FF');

  // Pull accent from hero car (first car)
  useEffect(() => { setAccent(CARS[0].accent); }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left pointer-events-none"
      style={{
        scaleX: scrollYProgress,
        background: `linear-gradient(90deg, ${accent}, #7C5CFF)`,
        boxShadow: `0 0 14px ${accent}`,
      }}
    />
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);

  // Auto-cycle hero car
  useEffect(() => {
    if (!splashDone) return;
    const t = setInterval(() => {
      setHeroIdx((i) => (i + 1) % CARS.length);
    }, 7000);
    return () => clearInterval(t);
  }, [splashDone]);

  const handleSelectCar = useCallback((i) => setHeroIdx(i), []);

  return (
    <div className="relative grain">
      <ScrollProgress />

      {!splashDone && <Splash onDone={() => setSplashDone(true)} />}

      <TopNav />

      <Hero
        car={CARS[heroIdx]}
        heroReady={splashDone}
        heroIdx={heroIdx}
        cars={CARS}
        onSelectCar={handleSelectCar}
      />

      <Marquee items={MARQUEE_A} />

      <Garage cars={CARS} />

      <Marquee items={MARQUEE_B} speed={22} />

      <Showcase cars={CARS} />

      <Festival />
      <Footer />
    </div>
  );
}
