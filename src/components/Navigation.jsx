import { useEffect } from 'react';
import { ArrowLeft, Box, Compass, Layers } from 'lucide-react';
import AudioController from './AudioController.jsx';
import { HUB_PORTALS, PROFILE } from '../data/profile.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export default function Navigation({
  onSelectPortal,
  onReturnHub,
  onReturnGateway,
}) {
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const webglError = useExperienceStore((s) => s.webglError);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setViewMode = useExperienceStore((s) => s.setViewMode);

  const isInWorld =
    activeScene !== SCENES.GATEWAY && activeScene !== SCENES.HUB;

  // Escape shortcut returns cleanly from any individual world back to the Multiverse Hub
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && isInWorld && !isTransitioning) {
        onReturnHub();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isInWorld, isTransitioning, onReturnHub]);

  const toggleViewMode = () => {
    if (webglError) return;
    setViewMode(viewMode === '3d' ? '2d' : '3d');
  };

  return (
    <header className="hud-topbar">
      <div className="hud-left">
        <button
          type="button"
          className="hud-brand-btn"
          onClick={onReturnGateway}
          disabled={isTransitioning || activeScene === SCENES.GATEWAY}
          title="Return to Gateway"
        >
          <span className="hud-brand__monogram">{PROFILE.initials}</span>
          <span className="hud-brand__label">Chronicles of Aarav</span>
        </button>

        {isInWorld && (
          <button
            type="button"
            className="hud-pill hud-pill--gold"
            onClick={onReturnHub}
            disabled={isTransitioning}
            aria-label="Return to Multiverse Hub"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Multiverse Hub</span>
          </button>
        )}

        {activeScene === SCENES.HUB && (
          <span className="hud-location" aria-current="page">
            <Compass size={14} aria-hidden="true" />
            <span>Multiverse Hub</span>
          </span>
        )}
      </div>

      {activeScene !== SCENES.GATEWAY && (
        <nav className="hud-quicknav" aria-label="Quick world navigation">
          {HUB_PORTALS.map((portal) => {
            const active = activeScene === portal.id;
            return (
              <button
                key={portal.id}
                type="button"
                className={`hud-navlink ${active ? 'hud-navlink--active' : ''}`}
                onClick={() => onSelectPortal(portal)}
                disabled={isTransitioning || active}
                aria-current={active ? 'page' : undefined}
              >
                {portal.title}
              </button>
            );
          })}
        </nav>
      )}

      <div className="hud-controls" role="group" aria-label="Experience controls">
        {reducedMotion && (
          <span className="hud-tag" title="System reduced motion preference active">
            Reduced Motion
          </span>
        )}
        <button
          type="button"
          className={`hud-pill ${viewMode === '2d' ? 'hud-pill--active' : ''}`}
          onClick={toggleViewMode}
          disabled={Boolean(webglError)}
          aria-pressed={viewMode === '2d'}
          title={
            webglError
              ? '2D Fallback active (WebGL unavailable)'
              : viewMode === '3d'
                ? 'Switch to accessible 2D view'
                : 'Switch back to immersive 3D view'
          }
        >
          {viewMode === '3d' ? (
            <>
              <Layers size={15} aria-hidden="true" />
              <span>2D View</span>
            </>
          ) : (
            <>
              <Box size={15} aria-hidden="true" />
              <span>{webglError ? '2D Fallback' : '3D View'}</span>
            </>
          )}
        </button>
        <AudioController />
      </div>
    </header>
  );
}
