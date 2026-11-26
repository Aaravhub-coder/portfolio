import { ArrowRight, Sparkles } from 'lucide-react';
import { PROFILE } from '../data/profile.js';
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

export default function HeroOverlay({ onEnterGateway }) {
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  if (activeScene !== SCENES.GATEWAY) return null;

  return (
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
  );
}
