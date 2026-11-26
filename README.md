# THE CHRONICLES OF AARAV — MULTIVERSE OF INTELLIGENCE

> *“Not a wizard. Not a superhero. Just dangerously curious.”*  
> *An explorer of algorithms. A builder of intelligent worlds.*

Interactive 3D portfolio for **Aarav Raj** (Aspiring AI Engineer) blending an original ancient magical archive, dimensional multiverse portals, modern AI laboratory aesthetics, and an inventor’s workshop.

## Implemented Worlds

1. **Gateway:** Full-screen cosmic astrolabe portal with custom GLSL vortex shader, beveled 3D `AR` monogram, pointer parallax, GSAP portal dive, loading screen, muted-by-default procedural Web Audio toggle, and 2D SVG fallback.
2. **Multiverse Hub:** Central observatory dais with five interactive 3D portals, desktop badges, synced keyboard/touch Portal Dock (`Tab`, `← / →`, `Enter`), and persistent top navigation (`Escape` returns to Hub).
3. **Ancient Library:** Curved candlelit stone bays, 120 instanced books (1 draw call), flickering lanterns, interactive hinged Chronicle Tome, and verified About & Education panel.
4. **AI Laboratory:** Holographic 4-layer 3D neural network (`18` skill nodes + `1` `LineSegments` web) synced two-way with honest category filters.
5. **Project Worlds (6 Lazy-Loaded Realms):**
   - *AI Fake Stock Detector* — Financial Data Universe
   - *Business Entity Resolution* — Data-Matching Laboratory
   - *SolarQuest* — Solar Planet
   - *SANGYAN Shield* — Cybersecurity Fortress
   - *Chandrayaan-2 Image Correspondence* — Lunar Research Station *(Research Direction / Proposed Pipeline)*
   - *SkillHub* — Builder’s Workshop
6. **Achievement Hall:** Six illuminated interactive trophy/certificate pedestals synced with verified CV achievements and category filters.
7. **Contact Portal:** Dimensional beacon sanctuary with working `mailto:aaravrajgo@gmail.com` (+ Copy Email button), GitHub, LinkedIn, and Return-to-Hub / Gateway navigation.

## Tech Stack

- **Framework & Bundler:** React 19 + Vite 8 (Rolldown native code-splitting)
- **3D Engine:** Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei/web/Html`)
- **Motion & State:** GSAP + Zustand
- **Icons:** Lucide React
- **Styling:** Modular CSS tokens (`theme.css`, `global.css`, `interface.css`)

## Hardware & Performance Discipline (Apple M1, 8 GB Unified Memory)

- **Single shared WebGL `<Canvas>`** with adaptive DPR/particle tiering, tab-visibility render pause (`frameloop`), WebGL context-loss & restore recovery, and a live **2D View** fallback mode.
- **On-demand lazy loading:** Every 3D scene, all 6 project worlds, and all non-Gateway UI panels load via `React.lazy` on demand; initial Gateway JS entry is `20.43 kB` (`7.09 kB` gzip).
- **Explicit GPU disposal:** Every procedural geometry, material, shader, and canvas texture disposes on unmount.
- **Accessibility:** Skip-to-content link, screen-reader route announcements, keyboard shortcuts (`Tab`, `← / →`, `Enter`, `Escape`), high-contrast parchment text, and full `prefers-reduced-motion` support.

## Commands

```bash
npm install
npm run dev      # Start local Vite dev server
npm run qa       # Run 11-check automated QA suite (content, GPU hygiene, routing, a11y)
npm run build    # Build optimized production bundle into dist/
npm run preview  # Preview local production build
```

## Documentation

- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — Complete milestone history (M0–M6) and performance measurements.
- [`ASSET_MANIFEST.md`](./ASSET_MANIFEST.md) — License and provenance registry for all procedural & external assets.
- [`AGENTS.md`](./AGENTS.md) — Workflow, milestone gate, and content integrity rules.

## Contact

- **Email:** aaravrajgo@gmail.com
- **GitHub:** https://github.com/Aaravhub-coder
- **LinkedIn:** https://www.linkedin.com/in/aarav-raj-a2a49135b
