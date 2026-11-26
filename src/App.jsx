import { Suspense, lazy, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import SceneTransition from './components/SceneTransition.jsx';
import HeroOverlay from './ui/HeroOverlay.jsx';
import { HUB_PORTALS } from './data/profile.js';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';
import { useSceneTransition } from './hooks/useSceneTransition.js';
import { SCENES, useExperienceStore } from './store/experienceStore.js';

// Lazy-load 3D Canvas and non-Gateway world panels so the initial Gateway paints rapidly
const CanvasExperience = lazy(() => import('./three/CanvasExperience.jsx'));
const PortalLabel = lazy(() => import('./components/PortalLabel.jsx'));
const AboutPanel = lazy(() => import('./ui/AboutPanel.jsx'));
const SkillsPanel = lazy(() => import('./ui/SkillsPanel.jsx'));
const ProjectPanel = lazy(() => import('./ui/ProjectPanel.jsx'));
const AchievementPanel = lazy(() => import('./ui/AchievementPanel.jsx'));
const ContactPanel = lazy(() => import('./ui/ContactPanel.jsx'));

const SCENE_TITLES = {
  [SCENES.GATEWAY]: 'Gateway — The Chronicles of Aarav',
  [SCENES.HUB]: 'Multiverse Hub — The Chronicles of Aarav',
  ...Object.fromEntries(
    HUB_PORTALS.map((p) => [p.id, `${p.title} — The Chronicles of Aarav`])
  ),
};

export default function App() {
  usePrefersReducedMotion();
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const { enterMultiverse, openPortal, returnToHub, returnToGateway } =
    useSceneTransition();

  // Keep page title, scroll position, and screen-reader context synced across realms
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title =
        SCENE_TITLES[activeScene] ||
        'The Chronicles of Aarav — Multiverse of Intelligence';
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeScene]);

  return (
    <div className="experience-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {SCENE_TITLES[activeScene]}
      </div>

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

        <div id="main-content" className="hud-main-slot" tabIndex={-1}>
          {activeScene === SCENES.GATEWAY && (
            <HeroOverlay onEnterGateway={enterMultiverse} />
          )}

          <Suspense fallback={null}>
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

            {activeScene === SCENES.ACHIEVEMENTS && (
              <AchievementPanel
                onReturnHub={returnToHub}
                onSelectPortal={openPortal}
              />
            )}

            {activeScene === SCENES.CONTACT && (
              <ContactPanel
                onReturnHub={returnToHub}
                onReturnGateway={returnToGateway}
              />
            )}
          </Suspense>
        </div>
      </div>

      <SceneTransition />
      <LoadingScreen />
    </div>
  );
}
