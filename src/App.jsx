import { Suspense, lazy } from 'react';
import HeroOverlay from './ui/HeroOverlay.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import SceneTransition from './components/SceneTransition.jsx';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';
import { useSceneTransition } from './hooks/useSceneTransition.js';
import { useExperienceStore } from './store/experienceStore.js';

const CanvasExperience = lazy(() => import('./three/CanvasExperience.jsx'));

export default function App() {
  usePrefersReducedMotion();
  const viewMode = useExperienceStore((s) => s.viewMode);
  const { enterMultiverse, returnToGateway } = useSceneTransition();

  return (
    <div className="experience-shell">
      {viewMode === '3d' && (
        <Suspense fallback={null}>
          <CanvasExperience onEnterGateway={enterMultiverse} />
        </Suspense>
      )}
      <HeroOverlay
        onEnterGateway={enterMultiverse}
        onReturnGateway={returnToGateway}
      />
      <SceneTransition />
      <LoadingScreen />
    </div>
  );
}
