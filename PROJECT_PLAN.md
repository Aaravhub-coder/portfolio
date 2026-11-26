# PROJECT PLAN — The Chronicles of Aarav

**Owner:** Aarav Raj (`aaravrajgo@gmail.com`)  
**Repository:** `https://github.com/Aaravhub-coder/portfolio.git`  
**Target Machine:** MacBook Air, Apple M1, 8 GB unified memory  
**Workflow Gate:** One milestone at a time. Complete local work and verification, present a Milestone Completion Report, await owner review and approval, then push to GitHub and begin the next milestone.

---

## Design System Tokens

| Token | Hex | Purpose |
| --- | --- | --- |
| Midnight | `#100D16` | Main background |
| Mystic Plum | `#21172B` | Secondary panel surfaces |
| Royal Purple | `#56334D` | Magical portal accents |
| Ancient Gold | `#E7BD72` | Primary actions, runes, headings |
| AI Cyan | `#83D9DC` | Holograms, AI interfaces, focus rings |
| Parchment | `#F6F0E6` | High-contrast readable text |

Typography: `Cinzel` (display), `Manrope` (UI/body), `DM Mono` (labels/metadata), `Cormorant Garamond` (quotes), all with resilient system fallbacks.

---

## Milestone Roadmap

### M0 — Project Audit & Architecture *(Completed & Pushed — `3b8a43e`)*
- Audited workspace (`/Users/aaravraj/Desktop/portfolio`), Node `v26.10.0`, npm `11.19.1`, Git `2.52.0`, remote URL (`origin` leading whitespace fixed), and free disk space (`51 GiB`).
- Verified and installed compatible stack: `react@^19.3.1`, `react-dom@^19.3.1`, `vite@^8.4.0`, `@vitejs/plugin-react@^6.3.0`, `three@^0.187.0`, `@react-three/fiber@^9.8.2`, `@react-three/drei@^10.7.9`, `gsap@^3.15.1`, `zustand@^5.1.0`, `lucide-react@^1.81.0` (0 npm vulnerabilities).
- Scaffolded folder structure, design tokens, Zustand state store, verified `src/data/` content modules, and documentation (`README.md`, `PROJECT_PLAN.md`, `ASSET_MANIFEST.md`, `AGENTS.md`).
- Verified clean production build (`npm run build`) and pushed approved M0 commit to `origin/master`.

### M1 — 3D Gateway *(Completed & Pushed — `6a0e5d1`)*
- Built single shared React Three Fiber `<Canvas>` (`src/three/CanvasExperience.jsx`) with lazy loading, tab-visibility render pause (`frameloop`), WebGL capability detection, ErrorBoundary, `webglcontextlost` recovery, and a live 2D fallback toggle.
- Built procedural cosmic Gateway scene (`src/scenes/GatewayScene.jsx`) featuring ancient gold astrolabe ring with 36 instanced dial ticks, royal purple dimensional arcs, custom Apple-M1-safe GLSL portal vortex disc, cyan holographic AI circuit ring with 12 instanced nodes, sculptural beveled 3D `AR` monogram, and 640-particle starfield/energy motes (`src/three/Particles.jsx`).
- Built responsive pointer parallax & GSAP portal-entry camera dive (`src/three/CameraController.jsx`), cinematic Hero Overlay (`src/ui/HeroOverlay.jsx`), branded loading screen (`src/components/LoadingScreen.jsx`), transition veil (`src/components/SceneTransition.jsx`), and muted-by-default procedural Web Audio controller (`src/components/AudioController.jsx`).

### M2 — Multiverse Hub *(Completed — Pending Owner Review)*
- Built central cosmic observatory sanctuary (`src/scenes/MultiverseScene.jsx`) with a rotating gold/purple/cyan floor dais, five radial energy conduits, and five reusable procedural 3D portals (`src/components/Portal.jsx`) sharing core ring/plinth geometries for low draw-call overhead.
- Each portal represents a distinct realm with a custom procedural sigil, themed GLSL vortex shader, hover/focus illumination, and world-anchored desktop badge: **Ancient Library**, **AI Laboratory**, **Project Worlds**, **Achievement Hall**, and **Contact Portal**.
- Added persistent accessible top navigation (`src/components/Navigation.jsx`) with quick-jump realm links, Return-to-Hub button, Escape-key shortcut, and synced bottom Portal Dock & Inspector (`src/components/PortalLabel.jsx`) with arrow-key navigation and full 2D Hub fallback mode.
- Upgraded `CameraController.jsx` and `CanvasExperience.jsx` with portal-focused hover tracking, portal-directed GSAP camera dives, and lazy-loaded (`React.lazy`) single-Canvas world routing across all five destination scenes.

### M3 — Ancient Library & AI Laboratory
- **Ancient Library:** Warm stone/shelf archive visuals with readable About, personal story, and verified education panel.
- **AI Laboratory:** Futuristic cyan holographic neural-network visuals with interactive, honest skill/technology panels.

### M4 — Project Worlds (6 Environments)
- Six lazy-loaded visual environments mapped to Aarav’s verified projects:
  1. **AI Fake Stock Detector** — Financial Data Universe
  2. **Business Entity Resolution** — Data-Matching Laboratory
  3. **SolarQuest** — Solar Planet
  4. **SANGYAN Shield** — Cybersecurity Fortress
  5. **Chandrayaan-2 Image Correspondence** — Lunar Research Station *(Research Direction / Proposed Pipeline)*
  6. **SkillHub** — Builder’s Workshop
- Clear project panels with problem statement, highlights, technologies, verified links, and accurate status labels.

### M5 — Achievement Hall & Contact Portal
- **Achievement Hall:** Verified hackathons, certification, and continuous-learning gallery.
- **Contact Portal:** Working `mailto:`, GitHub, and LinkedIn links plus return-to-hub navigation.

### M6 — Optimization, QA & Deployment Prep
- Measure draw calls, particle budgets, frame rate, and memory on Apple M1 / 8 GB.
- Verify desktop/tablet/mobile responsiveness, keyboard accessibility, `prefers-reduced-motion`, and 2D fallback mode.
- Final production build audit and deployment proposal (no publishing without explicit owner approval).

---

## Performance Targets (Hypotheses to Measure)

- Single shared WebGL context; one active 3D scene mounted at a time.
- Fewer than ~100 draw calls per typical scene where practical.
- ~300–800 particles in initial scenes, tuned from real measurements.
- Minimal post-processing; at most 1–2 shadow-casting lights where feasible.
- Pause render loop when `document.hidden` is true; explicit GPU disposal on scene unmount.
