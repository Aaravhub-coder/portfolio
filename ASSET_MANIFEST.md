# ASSET MANIFEST — The Chronicles of Aarav

Every external or generated media asset (3D models, textures, fonts, audio, icons) used in this portfolio must be documented here with its source, creator, license, commercial-use status, and attribution requirements.

## Asset Policy

- Prefer **original procedural Three.js geometry** for portals, rune rings, holograms, particles, and geometric props.
- Do **not** use unlicensed franchise logos, characters, film stills, official music, or copyrighted screenshots.
- Keep target asset budgets disciplined for Apple M1 (8 GB unified memory): individual GLB files around 2–5 MB where practical, textures 512–1024 px where adequate.
- Verify licenses and record attribution before adding any external asset.

## Registered Assets

| Asset | Type | Path / Source | Creator / Provider | License | Attribution Required | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Cinzel | Font | Google Fonts (`index.html`) | Natanael Gama | SIL Open Font License 1.1 | No | Active (with system serif fallback) |
| Manrope | Font | Google Fonts (`index.html`) | Mikhail Sharanda | SIL Open Font License 1.1 | No | Active (with system sans fallback) |
| DM Mono | Font | Google Fonts (`index.html`) | Colophon Foundry | SIL Open Font License 1.1 | No | Active (with system mono fallback) |
| Cormorant Garamond | Font | Google Fonts (`index.html`) | Christian Thalmann | SIL Open Font License 1.1 | No | Active (with system serif fallback) |
| Lucide Icons | UI Icons | `lucide-react` npm package (`^1.81.0`) | Lucide Contributors | ISC License | No | Installed in M0 |

## 3D Models & Procedural Geometry (`public/models/`, `src/scenes/`)

| Asset | Type | Path / Source | Creator / Provider | License | Attribution Required | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Gateway Astrolabe Portal & `AR` Monogram | Procedural 3D Geometry (`ExtrudeGeometry`, `TorusGeometry`, `InstancedMesh`) | `src/scenes/GatewayScene.jsx` | Original (project codebase) | Project-owned | No | Active in M1 |
| Cosmic Portal Vortex | Procedural GLSL Shader (`ShaderMaterial`) | `src/scenes/GatewayScene.jsx` | Original (project codebase) | Project-owned | No | Active in M1 |
| Cosmic Starfield & Energy Motes | Procedural Particle Points + Canvas Sprite | `src/three/Particles.jsx` | Original (project codebase) | Project-owned | No | Active in M1 |
| 2D Fallback Astrolabe Portal | Inline SVG | `src/ui/HeroOverlay.jsx` | Original (project codebase) | Project-owned | No | Active in M1 |
| Multiverse Hub Sanctuary & 5 Dimensional Portals | Procedural 3D Geometry + GLSL Vortex Shader | `src/scenes/MultiverseScene.jsx`, `src/components/Portal.jsx` | Original (project codebase) | Project-owned | No | Active in M2 |
| Destination World Chamber Backdrop | Procedural 3D Torus & Core Geometry | `src/scenes/WorldChamberBackdrop.jsx` | Original (project codebase) | Project-owned | No | Active in M2 |

_No external GLB/GLTF models added yet._

## Textures (`public/textures/`)

_No external texture files added yet (soft radial particle sprite generated procedurally via HTML Canvas in `src/three/Particles.jsx`)._

## Audio (`public/audio/`)

| Asset | Type | Path / Source | Creator / Provider | License | Attribution Required | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Ambient Cosmic Pad & Portal Chime | Procedural Web Audio API Synthesis | `src/components/AudioController.jsx` | Original (project codebase) | Project-owned | No | Active in M1 (strictly muted by default) |

_No external audio files downloaded._
