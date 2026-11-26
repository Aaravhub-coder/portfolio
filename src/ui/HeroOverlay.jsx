import { ArrowLeft, ArrowRight, Code2, Compass, ExternalLink, Mail, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { HUB_PORTALS, PROFILE } from '../data/profile.js';
import { PROJECTS } from '../data/projects.js';
import { SKILL_CATEGORIES } from '../data/skills.js';
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

function WorldDestinationSummary({ sceneId }) {
  if (sceneId === SCENES.LIBRARY) {
    return (
      <div className="world-stub-list">
        <p className="world-stub-quote">“{PROFILE.summary}”</p>
        {PROFILE.education.map((edu) => (
          <div key={edu.id} className="world-stub-item">
            <strong>{edu.institution}</strong>
            <span>
              {edu.qualification} · {edu.period}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (sceneId === SCENES.AILAB) {
    return (
      <div className="world-stub-chips">
        {SKILL_CATEGORIES.flatMap((cat) => cat.items).map((skill) => (
          <span key={skill.name} className="world-chip">
            {skill.name}
          </span>
        ))}
      </div>
    );
  }

  if (sceneId === SCENES.PROJECTS) {
    return (
      <div className="world-stub-list">
        {PROJECTS.map((project) => (
          <div key={project.id} className="world-stub-item">
            <strong>{project.title}</strong>
            <span>
              {project.subtitle} · <em>{project.status}</em>
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (sceneId === SCENES.ACHIEVEMENTS) {
    return (
      <div className="world-stub-list">
        {ACHIEVEMENTS.map((item) => (
          <div key={item.id} className="world-stub-item">
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
        ))}
      </div>
    );
  }

  if (sceneId === SCENES.CONTACT) {
    return (
      <div className="hub-preview-footer world-stub-contact">
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
          <span>{PROFILE.contact.githubLabel}</span>
        </a>
        <a
          href={PROFILE.contact.linkedin}
          target="_blank"
          rel="noreferrer"
          className="hub-link"
        >
          <ExternalLink size={15} aria-hidden="true" />
          <span>{PROFILE.contact.linkedinLabel}</span>
        </a>
      </div>
    );
  }

  return null;
}

export default function HeroOverlay({
  onEnterGateway,
  onReturnHub,
  onSelectPortal,
}) {
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  if (activeScene === SCENES.GATEWAY) {
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

  // Destination World Arrival Panel (lazy-loaded 3D world route verified in M2; full rich worlds build in M3–M5)
  const portal = HUB_PORTALS.find((p) => p.id === activeScene);
  if (!portal) return null;

  return (
    <main className="hub-preview-layout">
      <section
        className={`hub-preview-card ${isTransitioning ? 'hero-panel--exiting' : ''}`}
        aria-labelledby="world-heading"
      >
        <div className="hub-preview-header">
          <div>
            <p className="hero-eyebrow">
              <Compass size={14} aria-hidden="true" /> {portal.subtitle}
            </p>
            <h1 id="world-heading" className="hub-preview-title">
              {portal.title}
            </h1>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onReturnHub}
            disabled={isTransitioning}
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Return to Multiverse Hub</span>
          </button>
        </div>

        <p className="hub-preview-intro">{portal.description}</p>
        <p className="world-milestone-badge">{portal.milestoneNote}</p>

        <WorldDestinationSummary sceneId={activeScene} />

        <footer className="world-other-links" aria-label="Jump to another world">
          <span className="world-other-links__label">Explore another realm:</span>
          <div className="world-other-links__pills">
            {HUB_PORTALS.filter((item) => item.id !== activeScene).map((item) => (
              <button
                key={item.id}
                type="button"
                className="hud-pill"
                onClick={() => onSelectPortal(item)}
                disabled={isTransitioning}
              >
                {item.title}
              </button>
            ))}
          </div>
        </footer>
      </section>
    </main>
  );
}
