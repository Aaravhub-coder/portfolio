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

### M2 — Multiverse Hub *(Completed & Pushed — `0edf900`)*
- Built central cosmic observatory sanctuary (`src/scenes/MultiverseScene.jsx`) with a rotating gold/purple/cyan floor dais, five radial energy conduits, and five reusable procedural 3D portals (`src/components/Portal.jsx`) sharing core ring/plinth geometries for low draw-call overhead.
- Each portal represents a distinct realm with a custom procedural sigil, themed GLSL vortex shader, hover/focus illumination, and world-anchored desktop badge: **Ancient Library**, **AI Laboratory**, **Project Worlds**, **Achievement Hall**, and **Contact Portal**.
- Added persistent accessible top navigation (`src/components/Navigation.jsx`) with quick-jump realm links, Return-to-Hub button, Escape-key shortcut, and synced bottom Portal Dock & Inspector (`src/components/PortalLabel.jsx`) with arrow-key navigation and full 2D Hub fallback mode.
- Upgraded `CameraController.jsx` and `CanvasExperience.jsx` with portal-focused hover tracking, portal-directed GSAP camera dives, and lazy-loaded (`React.lazy`) single-Canvas world routing across all five destination scenes.

### M3 — Ancient Library & AI Laboratory *(Completed & Pushed — `97afa6f`)*
- **Ancient Library (`src/scenes/LibraryScene.jsx` + `src/ui/AboutPanel.jsx`):** Built curved candlelit archive bays with 120 instanced books (1 draw call), flickering floating candle lanterns, an interactive hinged 3D Chronicle Tome that flips between **Profile & Story** and **Education**, and a split-stage glass/parchment panel strictly grounded in Aarav’s CV.
- **AI Laboratory (`src/scenes/AILabScene.jsx` + `src/ui/SkillsPanel.jsx`):** Built a cyan holographic research platform with an interactive 4-layer 3D neural network (`18` skill nodes + `1` `LineSegments` synaptic web draw call) synced two-way with category filters and honest familiarity tags from `src/data/skills.js`.
- Added split-stage desktop camera framing and a `"Hide Panel / Inspect 3D"` toggle so visitors can admire both 3D worlds unobstructed or browse recruiter-friendly readable panels in 3D or 2D mode.

### M4 — Project Worlds (6 Environments) *(Completed & Pushed — `ee87c4b`)*
- Built six lazy-loaded procedural 3D visual environments under `src/three/models/` mounted one at a time by `src/scenes/ProjectWorldScene.jsx`:
  1. **AI Fake Stock Detector** — Financial Data Universe (`StockUniverseWorld.jsx`: 26 instanced bars + trend curve + pulsing anomaly beacons)
  2. **Business Entity Resolution** — Data-Matching Laboratory (`EntityMatchingWorld.jsx`: twin record clouds linked via similarity bridges to a central matching prism)
  3. **SolarQuest** — Solar Planet (`SolarPlanetWorld.jsx`: rotating sunlit planet with 6 angled rooftop solar arrays and orbiting sun)
  4. **SANGYAN Shield** — Cybersecurity Fortress (`CyberFortressWorld.jsx`: sculpted 3D extruded shield emblem, scanning ring, and 6 hexagonal firewall plates)
  5. **Chandrayaan-2 Image Correspondence** — Lunar Research Station (`LunarStationWorld.jsx`: procedurally cratered lunar terrain with low-angle dynamic sunlight and orbiting optical scan probe — explicitly labeled *Research Direction / Proposed Pipeline*)
  6. **SkillHub** — Builder’s Workshop (`BuilderWorkshopWorld.jsx`: blueprint grid table, modular illuminated blocks, and interlocking workshop gears)
- Built `src/ui/ProjectPanel.jsx` with a 6-world selector bar, Prev/Next navigation, verified problem statements, CV-accurate highlights, technology tags, verified hackathon awards, verified Chandrayaan-2 GitHub repo link, and zero fabricated metrics/screenshots.

### M5 — Achievement Hall & Contact Portal *(Completed & Pushed — `7adb218`)*
- **Achievement Hall (`src/scenes/AchievementScene.jsx` + `src/ui/AchievementPanel.jsx`):** Built a ceremonial 3D honors gallery with six illuminated antique-gold/plum/cyan trophy & certificate pedestals synced two-way with filterable cards (`All`, `Hackathons`, `Certification`, `Learning`) strictly reflecting Aarav’s verified CV achievements (no invented dates or IDs).
- **Contact Portal (`src/scenes/ContactScene.jsx` + `src/ui/ContactPanel.jsx`):** Built a 3D dimensional communication beacon with expanding cyan signal rings and three orbiting channel relay nodes synced with working `mailto:aaravrajgo@gmail.com` (+ Copy Email button), GitHub, LinkedIn, Return-to-Hub, and Return-to-Gateway actions.

### M6 — Optimization & QA Testing *(Completed — Pending Owner Review; Deployment Explicitly Excluded per Owner)*
- **Bundle & Lazy-Loading Optimization:** Switched `@react-three/drei` barrel imports to direct `@react-three/drei/web/Html` imports (removing 539 unused `three-stdlib` modules), configured Vite 8 native `rolldownOptions.output.codeSplitting` (`three-core`, `r3f-ecosystem`, `animation-ui`), and lazy-loaded all non-Gateway UI panels in `src/App.jsx` — shrinking Gateway entry JS by **63%** (`54.72 kB` → `20.43 kB`, `7.09 kB` gzip) and cutting build time to `332ms`.
- **Adaptive 3D Performance & Recovery:** Added viewport/device-memory adaptive DPR (`[1, 1.35]` compact vs `[1, 1.75]` desktop) and particle scaling (`350` compact vs `570` desktop), R3F `performance={{ min: 0.5 }}`, and `webglcontextrestored` recovery in `src/three/CanvasExperience.jsx`.
- **Accessibility & Keyboard Hardening:** Added skip-to-content link, live `aria-live` route title announcements, automatic scroll-to-top on scene transitions, `ArrowLeft`/`ArrowRight` stepping across the 6 Project Worlds, and `rel="noopener noreferrer"` on every external link.
- **Automated QA Suite (`scripts/qa-check.mjs`, `npm run qa`):** Verified **11/11 checks passing** across CV content integrity, single-`<Canvas>` architecture, explicit GPU `.dispose()` hygiene, Apple M1 Metal/ANGLE GLSL `pow()` safety, muted-by-default audio, tab-visibility pause, external link security, full 12-state navigation + WebGL 2D fallback flow, and Three.js geometry sanity (0 NaNs).
- **No Deployment Setup:** Per owner instructions, no deployment configurations (Vercel, Netlify, GitHub Pages, etc.) were created or published.

---

## Performance Targets (Hypotheses to Measure)

- Single shared WebGL context; one active 3D scene mounted at a time.
- Fewer than ~100 draw calls per typical scene where practical.
- ~300–800 particles in initial scenes, tuned from real measurements.
- Minimal post-processing; at most 1–2 shadow-casting lights where feasible.
- Pause render loop when `document.hidden` is true; explicit GPU disposal on scene unmount.
