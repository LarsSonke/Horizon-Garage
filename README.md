# Horizon Garage

A cinematic automotive portfolio built with React, Three.js, and GSAP. Features scroll-driven 3D car showcases, a service booking form, and a live licence plate preview — all running as a client-side SPA.

<video src="https://github.com/LarsSonke/Horizon-Garage/raw/main/public/videos/preview.mp4" autoplay loop muted playsinline width="100%"></video>

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.170-black?logo=threedotjs)

---

## Features

- **3D car viewer** — GLB models rendered on a transparent Three.js canvas with accent rim lighting and a subtle float animation
- **Scroll-driven drive-in** — each car in the Showcase section drives in from off-screen, then rotates as you scroll, powered by GSAP ScrollTrigger
- **Hero auto-carousel** — cycles through the fleet every 9 seconds; clicking a tab resets the timer
- **Mouse parallax** — the hero model reacts to cursor position with yaw/pitch/roll tilt
- **GLB cache** — models are parsed once and cloned on reuse, eliminating stutter when switching cars
- **Licence plate preview** — live preview with per-country formatting (NL, DE, GB, FR, ES, IT, BE, PL) and a realistic gradient metallic frame
- **Booking form** — service enquiry sent via EmailJS; validates required fields client-side
- **Custom cursor & spotlight** — CSS cursor replacement and a radial mouse-follow spotlight
- **Scroll progress bar** — thin top-of-page indicator driven by Framer Motion `useScroll`

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3, custom CSS variables |
| Animation | Framer Motion 11, GSAP 3 + ScrollTrigger |
| 3D | Three.js 0.170, GLTFLoader, DRACOLoader |
| Email | EmailJS Browser |
| Fonts | Bebas Neue · Space Grotesk · JetBrains Mono |

---

## Getting Started

**Prerequisites:** Node 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

---

## Project Structure

```
src/
├── components/       # Reusable UI (TopNav, CustomCursor, Marquee, Splash)
├── data/
│   └── cars.ts       # Fleet data — specs, accent colours, GLB paths
├── lib/
│   └── ScrollCar.tsx # Three.js canvas component + module-level GLB cache
├── sections/
│   ├── Hero.tsx      # Full-screen hero with auto-cycling car + mouse parallax
│   ├── Garage.tsx    # Fleet grid cards
│   ├── Showcase.tsx  # Scroll-driven drive-in showcase
│   ├── Festival.tsx  # Services section + footer
│   └── Booking.tsx   # Service booking form with plate preview
├── types.ts          # Car + CarStats interfaces
└── App.tsx           # Root layout, timer logic, scroll progress
public/
├── models/           # GLB car models (992.glb, audi.glb, mazzanti.glb)
└── images/           # Logos and static car images
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

---

## Adding a Car

1. Add the GLB to `public/models/`
2. Add an entry to `src/data/cars.ts` following the `Car` type
3. Adjust `modelOffsetX` if the model isn't centred correctly after Box3 normalisation

Key fields:

```ts
{
  id: 'ferrari',           // used as URL anchor and nav dot label
  accent: '#FF2800',       // rim light + glow colour
  accent2: '#FFD700',      // secondary rim colour
  bg: 'radial-gradient(…)',// section background gradient
  glbPath: '/models/ferrari.glb',
  model3d: true,
  modelOffsetX: 0,         // Three.js units — positive = nudge right
}
```

---

## Licence

MIT
