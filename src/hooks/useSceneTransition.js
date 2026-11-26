import { useCallback, useEffect, useRef } from 'react';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export function useSceneTransition() {
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
    (targetScene, label = '', projectId = null) => {
      if (isTransitioning) return;

      if (reducedMotion) {
        navigateTo(targetScene, projectId);
        return;
      }

      clearTimers();
      setIsTransitioning(true, label);

      const switchTimer = window.setTimeout(() => {
        navigateTo(targetScene, projectId);
      }, 620);

      const endTimer = window.setTimeout(() => {
        setIsTransitioning(false, '');
      }, 1050);

      timersRef.current = [switchTimer, endTimer];
    },
    [isTransitioning, reducedMotion, clearTimers, setIsTransitioning, navigateTo]
  );

  const enterMultiverse = useCallback(() => {
    transitionToScene(SCENES.HUB, 'Entering the Multiverse Hub');
  }, [transitionToScene]);

  const returnToGateway = useCallback(() => {
    transitionToScene(SCENES.GATEWAY, 'Returning to the Gateway');
  }, [transitionToScene]);

  return {
    isTransitioning,
    transitionToScene,
    enterMultiverse,
    returnToGateway,
  };
}
