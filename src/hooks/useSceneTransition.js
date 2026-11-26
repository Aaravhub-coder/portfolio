import { useCallback, useEffect, useRef } from 'react';
import { HUB_PORTALS } from '../data/profile.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export function useSceneTransition() {
  const activeScene = useExperienceStore((s) => s.activeScene);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setIsTransitioning = useExperienceStore((s) => s.setIsTransitioning);
  const navigateTo = useExperienceStore((s) => s.navigateTo);

  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const transitionToScene = useCallback(
    (targetScene, label = '', projectId = null, focusPoint = null) => {
      if (isTransitioning) return;
      if (targetScene === activeScene && projectId === null) return;

      if (reducedMotion) {
        navigateTo(targetScene, projectId);
        return;
      }

      clearTimers();
      setIsTransitioning(true, label, focusPoint);

      const switchTimer = window.setTimeout(() => {
        navigateTo(targetScene, projectId);
      }, 600);

      const endTimer = window.setTimeout(() => {
        setIsTransitioning(false, '', null);
      }, 1020);

      timersRef.current = [switchTimer, endTimer];
    },
    [
      activeScene,
      isTransitioning,
      reducedMotion,
      clearTimers,
      setIsTransitioning,
      navigateTo,
    ]
  );

  const enterMultiverse = useCallback(() => {
    transitionToScene(SCENES.HUB, 'Entering the Multiverse Hub', null, [0, 0.82, 0]);
  }, [transitionToScene]);

  const openPortal = useCallback(
    (portalOrId) => {
      const portal =
        typeof portalOrId === 'string'
          ? HUB_PORTALS.find((p) => p.id === portalOrId)
          : portalOrId;
      if (!portal) return;

      const focusPoint = activeScene === SCENES.HUB ? portal.position : null;
      transitionToScene(portal.id, `Entering ${portal.title}`, null, focusPoint);
    },
    [activeScene, transitionToScene]
  );

  const returnToHub = useCallback(() => {
    transitionToScene(SCENES.HUB, 'Returning to Multiverse Hub');
  }, [transitionToScene]);

  const returnToGateway = useCallback(() => {
    transitionToScene(SCENES.GATEWAY, 'Returning to the Gateway');
  }, [transitionToScene]);

  return {
    isTransitioning,
    transitionToScene,
    enterMultiverse,
    openPortal,
    returnToHub,
    returnToGateway,
  };
}
