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
