# THE CHRONICLES OF AARAV — MULTIVERSE OF INTELLIGENCE

> *“Not a wizard. Not a superhero. Just dangerously curious.”*  
> *An explorer of algorithms. A builder of intelligent worlds.*

Interactive 3D portfolio for **Aarav Raj** (Aspiring AI Engineer) blending an original ancient magical archive, dimensional multiverse portals, modern AI laboratory aesthetics, and an inventor’s workshop.

## Tech Stack

- **Framework & Bundler:** React 19 + Vite
- **3D Engine:** Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **Motion & State:** GSAP + Zustand
- **Icons:** Lucide React
- **Styling:** Modular CSS with custom design tokens (`theme.css`, `global.css`, `interface.css`)

## Architecture Principles

- **Single shared WebGL `<Canvas>`:** Avoids multiple WebGL contexts to stay light on Apple M1 (8 GB unified memory) and browser GPUs.
- **On-demand world mounting:** Only one active 3D scene mounts at a time; worlds lazy-load and dispose unused GPU resources on transition.
- **Procedural-first 3D visuals:** Original Three.js geometry for portals, rings, particles, and props before introducing external `.glb` models.
- **Accessible & recruiter-friendly:** Readable HTML/React panels separated from 3D logic, keyboard and touch support, `prefers-reduced-motion` awareness, optional audio muted by default, and a functional 2D fallback mode.
- **Verified content only:** All profile, education, skills, projects, and achievements live in `src/data/` and strictly reflect Aarav Raj’s verified CV and approved project notes.

## Project Structure

```text
portfolio/
├── public/
│   ├── models/project-artifacts/
│   ├── textures/
│   ├── audio/
│   └── fonts/
├── src/
│   ├── components/         # Shared UI & 3D portal/navigation components
│   ├── scenes/             # Gateway, Hub, Library, AI Lab, Project Worlds, Achievements, Contact
│   ├── three/              # Shared Canvas, CameraController, Lighting, Particles, models/
│   ├── ui/                 # Readable HTML/React overlays separated from 3D scenes
│   ├── data/               # Structured, CV-verified profile, projects, skills, achievements
│   ├── store/              # Zustand state store (experienceStore.js)
│   ├── hooks/              # Custom transition & viewport hooks
│   ├── styles/             # Design tokens (theme.css), base reset (global.css), UI (interface.css)
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── PROJECT_PLAN.md
├── ASSET_MANIFEST.md
└── AGENTS.md
```

## Development Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Milestones

See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the milestone-by-milestone roadmap (M0–M6) and acceptance criteria.

## Contact

- **Email:** aaravrajgo@gmail.com
- **GitHub:** https://github.com/Aaravhub-coder
- **LinkedIn:** https://www.linkedin.com/in/aarav-raj-a2a49135b
