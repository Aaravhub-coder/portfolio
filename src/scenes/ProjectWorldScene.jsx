import { Suspense, lazy } from 'react';
import { PROJECTS } from '../data/projects.js';
import { useExperienceStore } from '../store/experienceStore.js';

// Lazy-load each of the 6 project worlds on demand so strictly one project environment mounts at a time
const StockUniverseWorld = lazy(() =>
  import('../three/models/StockUniverseWorld.jsx')
);
const EntityMatchingWorld = lazy(() =>
  import('../three/models/EntityMatchingWorld.jsx')
);
const SolarPlanetWorld = lazy(() =>
  import('../three/models/SolarPlanetWorld.jsx')
);
const CyberFortressWorld = lazy(() =>
  import('../three/models/CyberFortressWorld.jsx')
);
const LunarStationWorld = lazy(() =>
  import('../three/models/LunarStationWorld.jsx')
);
const BuilderWorkshopWorld = lazy(() =>
  import('../three/models/BuilderWorkshopWorld.jsx')
);

const PROJECT_WORLDS = {
  'ai-fake-stock-detector': StockUniverseWorld,
  'business-entity-resolution': EntityMatchingWorld,
  solarquest: SolarPlanetWorld,
  'sangyan-shield': CyberFortressWorld,
  'chandrayaan-2-image-correspondence': LunarStationWorld,
  skillhub: BuilderWorkshopWorld,
};

export default function ProjectWorldScene() {
  const activeProjectId = useExperienceStore((s) => s.activeProjectId);
  const currentId = activeProjectId || PROJECTS[0].id;
  const ActiveWorld = PROJECT_WORLDS[currentId] || StockUniverseWorld;

  return (
    <Suspense fallback={null}>
      <ActiveWorld />
    </Suspense>
  );
}
