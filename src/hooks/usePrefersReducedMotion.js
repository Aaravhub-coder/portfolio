import { useEffect } from 'react';
import { useExperienceStore } from '../store/experienceStore.js';

export function usePrefersReducedMotion() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setReducedMotion = useExperienceStore((s) => s.setReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setReducedMotion]);

  return reducedMotion;
}
