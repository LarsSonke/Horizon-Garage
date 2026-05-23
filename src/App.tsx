import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { CARS } from './data/cars';
import TopNav from './components/TopNav';
import Marquee from './components/Marquee';
import Splash from './components/Splash';
import Hero from './sections/Hero';
import Fleet from './sections/Garage';
import Showcase from './sections/Showcase';
import Services from './sections/Festival';
import { Footer } from './sections/Festival';
import Booking from './sections/Booking';
import Process from './sections/Process';
import CustomCursor from './components/CustomCursor';

const MARQUEE_ITEMS = [
  'FREE DIAGNOSTICS WITH ANY BOOKING',
  'CERTIFIED TECHNICIANS',
  '3-YEAR PARTS WARRANTY',
  'SAME-DAY SERVICE AVAILABLE',
  'COLLECTION & DELIVERY',
  'MOT APPROVED CENTRE',
  'PREMIUM VEHICLES FOR SALE',
];

function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.background = `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(0,127,255,0.055), transparent 40%)`;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return <div ref={ref} className="fixed inset-0 pointer-events-none z-[3]" />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left pointer-events-none"
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, #007FFF, #60a5fa)',
        boxShadow: '0 0 14px #007FFF',
      }}
    />
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    if (!splashDone) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % CARS.length), 9000);
    return () => clearInterval(t);
  }, [splashDone]);

  const handleSelectCar = useCallback((i: number) => setHeroIdx(i), []);

  return (
    <div className="relative grain">
      <CustomCursor />
      <CursorSpotlight />
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

      <Marquee items={MARQUEE_ITEMS} speed={32} />

      <Fleet cars={CARS} />

      <Showcase cars={CARS} />

      <Services />

      <Process />

      <Booking />

      <Footer />
    </div>
  );
}
