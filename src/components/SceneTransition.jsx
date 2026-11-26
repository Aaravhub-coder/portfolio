import { useExperienceStore } from '../store/experienceStore.js';

export default function SceneTransition() {
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const transitionLabel = useExperienceStore((s) => s.transitionLabel);

  return (
    <div
      className={`scene-transition ${isTransitioning ? 'scene-transition--active' : ''}`}
      aria-hidden={!isTransitioning}
      role="status"
      aria-live="polite"
    >
      <div className="scene-transition__ring" aria-hidden="true" />
      {transitionLabel && (
        <p className="scene-transition__label">{transitionLabel}</p>
      )}
    </div>
  );
}
