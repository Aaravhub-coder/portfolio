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

### M0 — Project Audit & Architecture *(Completed — Pending Owner Review)*
- Audited workspace (`/Users/aaravraj/Desktop/portfolio`), Node `v26.10.0`, npm `11.19.1`, Git `2.52.0`, remote URL (`origin` leading whitespace fixed), and free disk space (`51 GiB`).
- Verified and installed compatible stack: `react@^19.3.1`, `react-dom@^19.3.1`, `vite@^8.4.0`, `@vitejs/plugin-react@^6.3.0`, `three@^0.187.0`, `@react-three/fiber@^9.8.2`, `@react-three/drei@^10.7.9`, `gsap@^3.15.1`, `zustand@^5.1.0`, `lucide-react@^1.81.0` (0 npm vulnerabilities).
- Scaffolded folder structure, design tokens, Zustand state store, verified `src/data/` content modules, and documentation (`README.md`, `PROJECT_PLAN.md`, `ASSET_MANIFEST.md`, `AGENTS.md`).
- Verified clean production build (`npm run build`).

### M1 — 3D Gateway
- Single shared React Three Fiber `<Canvas>` with tab-visibility pause and WebGL error boundary / 2D fallback.
- Full-screen cosmic Gateway scene with procedural golden/purple/cyan portal rings, central `AR` monogram, floating stars/particles, and subtle pointer parallax.
- Cinematic hero overlay copy, accessible `ENTER` interaction, loading screen, and optional muted-by-default audio toggle.

### M2 — Multiverse Hub
- Central 3D hub with five clickable and keyboard/touch-accessible portals: Ancient Library, AI Laboratory, Project Worlds, Achievement Hall, Contact Portal.
- Hover/focus labels with titles and descriptions, smooth GSAP camera transitions, return-to-hub control, and lazy scene loading.

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
