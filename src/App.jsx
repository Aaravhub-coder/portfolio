import { Suspense, lazy } from 'react';
import Navigation from './components/Navigation.jsx';
import PortalLabel from './components/PortalLabel.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import SceneTransition from './components/SceneTransition.jsx';
import HeroOverlay from './ui/HeroOverlay.jsx';
import AboutPanel from './ui/AboutPanel.jsx';
import SkillsPanel from './ui/SkillsPanel.jsx';
import ProjectPanel from './ui/ProjectPanel.jsx';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';
import { useSceneTransition } from './hooks/useSceneTransition.js';
import { SCENES, useExperienceStore } from './store/experienceStore.js';

const CanvasExperience = lazy(() => import('./three/CanvasExperience.jsx'));

export default function App() {
  usePrefersReducedMotion();
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const { enterMultiverse, openPortal, returnToHub, returnToGateway } =
    useSceneTransition();

  return (
    <div className="experience-shell">
      {viewMode === '3d' && (
        <Suspense fallback={null}>
          <CanvasExperience
            onEnterGateway={enterMultiverse}
            onSelectPortal={openPortal}
          />
        </Suspense>
      )}

      <div className="hud-root">
        <Navigation
          onSelectPortal={openPortal}
          onReturnHub={returnToHub}
          onReturnGateway={returnToGateway}
        />

        {activeScene === SCENES.HUB && (
          <PortalLabel
            onSelectPortal={openPortal}
            onReturnGateway={returnToGateway}
          />
        )}

        {activeScene === SCENES.LIBRARY && (
          <AboutPanel
            onReturnHub={returnToHub}
            onSelectPortal={openPortal}
          />
        )}

        {activeScene === SCENES.AILAB && (
          <SkillsPanel
            onReturnHub={returnToHub}
            onSelectPortal={openPortal}
          />
        )}

        {activeScene === SCENES.PROJECTS && (
          <ProjectPanel
            onReturnHub={returnToHub}
            onSelectPortal={openPortal}
          />
        )}

        {(activeScene === SCENES.GATEWAY ||
          activeScene === SCENES.ACHIEVEMENTS ||
          activeScene === SCENES.CONTACT) && (
          <HeroOverlay
            onEnterGateway={enterMultiverse}
            onReturnHub={returnToHub}
            onSelectPortal={openPortal}
          />
        )}
      </div>

      <SceneTransition />
      <LoadingScreen />
    </div>
  );
}
