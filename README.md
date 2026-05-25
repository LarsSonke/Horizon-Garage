# Horizon Garage

A cinematic automotive portfolio and service booking site — built as a personal project to practise modern frontend development. Fully deployed as a client-side SPA on GitHub Pages.

**[Live Demo →](https://larssonke.github.io/Horizon-Garage/)**

<video src="https://github.com/user-attachments/assets/ee203e22-46d6-485a-bcdf-68d719db340e" autoplay loop muted playsinline width="100%"></video>

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.170-black?logo=threedotjs)

---

## What it demonstrates

- **3D in the browser** — GLB car models rendered on a transparent Three.js canvas with drag-to-spin, momentum, and scroll-driven drive-in animations via GSAP ScrollTrigger
- **Complex state & interactions** — hero carousel with auto-advance timer, drag detection, pointer capture, and IntersectionObserver-based pause/resume
- **Multi-step form UX** — 5-step booking flow with animated transitions, live licence plate preview (8 countries), vehicle autocomplete with brand logos, and EmailJS integration for real email delivery
- **Component architecture** — reusable slide-in drawer (enquiry, contact), shared event bus via custom DOM events, shared types across features
- **CI/CD** — automated Vite build and GitHub Pages deploy via GitHub Actions; environment secrets passed at build time

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion 11, GSAP 3 + ScrollTrigger |
| 3D | Three.js 0.170, GLTFLoader, DRACOLoader |
| Email | EmailJS |
| Deploy | GitHub Actions → GitHub Pages |

---

## Run locally

```bash
npm install
npm run dev   # http://localhost:5173
```
