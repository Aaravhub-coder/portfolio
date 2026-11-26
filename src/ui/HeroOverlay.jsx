import { ArrowLeft, ArrowRight, Box, Code2, Compass, ExternalLink, Layers, Mail, Sparkles } from 'lucide-react';
import AudioController from '../components/AudioController.jsx';
import { HUB_PORTALS, PROFILE } from '../data/profile.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

function FallbackPortalGraphic() {
  return (
    <div className="fallback-portal" aria-hidden="true">
      <svg viewBox="0 0 280 280" className="fallback-portal__svg">
        <defs>
          <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#21172B" />
            <stop offset="55%" stopColor="#56334D" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#83D9DC" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#100D16" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="140" cy="140" r="118" fill="url(#portalGlow)" />
        <circle
          cx="140"
          cy="140"
          r="116"
          fill="none"
          stroke="#E7BD72"
          strokeWidth="2.5"
          strokeDasharray="10 6"
          className="fallback-portal__ring-outer"
        />
        <circle
          cx="140"
          cy="140"
          r="98"
          fill="none"
          stroke="#56334D"
          strokeWidth="4"
        />
        <circle
          cx="140"
          cy="140"
          r="84"
          fill="none"
          stroke="#83D9DC"
          strokeWidth="1.4"
          strokeDasharray="4 8"
          className="fallback-portal__ring-inner"
        />
        <text
          x="140"
          y="153"
          textAnchor="middle"
          fill="#E7BD72"
          fontSize="44"
          fontFamily="Cinzel, Georgia, serif"
          fontWeight="600"
          letterSpacing="6"
        >
          {PROFILE.initials}
        </text>
      </svg>
    </div>
  );
}

export default function HeroOverlay({ onEnterGateway, onReturnGateway }) {
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const webglError = useExperienceStore((s) => s.webglError);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setViewMode = useExperienceStore((s) => s.setViewMode);

  const toggleViewMode = () => {
    if (webglError) return;
    setViewMode(viewMode === '3d' ? '2d' : '3d');
  };

  return (
    <div className="hud-root">
      <header className="hud-topbar">
        <div className="hud-brand">
          <span className="hud-brand__monogram">{PROFILE.initials}</span>
          <span className="hud-brand__label">Chronicles of Aarav</span>
        </div>

        <nav className="hud-controls" aria-label="Experience controls">
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
        </nav>
      </header>

      {activeScene === SCENES.GATEWAY ? (
        <main className="gateway-layout">
          {viewMode === '2d' ? (
            <FallbackPortalGraphic />
          ) : (
            <div className="gateway-spacer" aria-hidden="true" />
          )}

          <section
            className={`hero-panel ${isTransitioning ? 'hero-panel--exiting' : ''}`}
            aria-labelledby="gateway-heading"
          >
            <p className="hero-eyebrow">{PROFILE.brandSubtitle}</p>
            <h1 id="gateway-heading" className="hero-title">
              {PROFILE.brandTitle}
            </h1>
            <p className="hero-tagline">“{PROFILE.primaryTagline}”</p>
            <p className="hero-identity">
              <strong>{PROFILE.name}</strong> — {PROFILE.role}.
              <span className="hero-supporting"> {PROFILE.supportingLine}</span>
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-enter"
                onClick={onEnterGateway}
                disabled={isTransitioning}
              >
                <Sparkles size={16} aria-hidden="true" />
                <span>ENTER</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <p className="hero-hint">
              {viewMode === '3d'
                ? 'Click the portal or press ENTER to cross into the Multiverse Hub'
                : 'Accessible 2D mode active — press ENTER to explore the Multiverse Hub'}
            </p>
          </section>
        </main>
      ) : (
        <main className="hub-preview-layout">
          <section className="hub-preview-card" aria-labelledby="hub-arrival-heading">
            <div className="hub-preview-header">
              <div>
                <p className="hero-eyebrow">
                  <Compass size={14} aria-hidden="true" /> Multiverse Hub · Portal Destination
                </p>
                <h1 id="hub-arrival-heading" className="hub-preview-title">
                  Gateway Crossed
                </h1>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={onReturnGateway}
                disabled={isTransitioning}
              >
                <ArrowLeft size={15} aria-hidden="true" />
                <span>Return to Gateway</span>
              </button>
            </div>

            <p className="hub-preview-intro">
              Welcome to the <strong>Multiverse of Intelligence</strong>. The five
              interactive 3D Hub portals and individual worlds unlock in Milestones
              M2–M5; preview the realms below or reach {PROFILE.name} directly.
            </p>

            <div className="hub-preview-grid" role="list">
              {HUB_PORTALS.map((portal) => (
                <article
                  key={portal.id}
                  className="hub-preview-tile"
                  role="listitem"
                >
                  <span className="hub-preview-tile__subtitle">
                    {portal.subtitle}
                  </span>
                  <h2 className="hub-preview-tile__title">{portal.title}</h2>
                  <p className="hub-preview-tile__desc">{portal.description}</p>
                </article>
              ))}
            </div>

            <footer className="hub-preview-footer">
              <a href={`mailto:${PROFILE.contact.email}`} className="hub-link">
                <Mail size={15} aria-hidden="true" />
                <span>{PROFILE.contact.email}</span>
              </a>
              <a
                href={PROFILE.contact.github}
                target="_blank"
                rel="noreferrer"
                className="hub-link"
              >
                <Code2 size={15} aria-hidden="true" />
                <span>GitHub</span>
              </a>
              <a
                href={PROFILE.contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hub-link"
              >
                <ExternalLink size={15} aria-hidden="true" />
                <span>LinkedIn</span>
              </a>
            </footer>
          </section>
        </main>
      )}
    </div>
  );
}
