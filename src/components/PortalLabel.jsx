import { useRef } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  Compass,
  Cpu,
  Globe,
  Send,
} from 'lucide-react';
import { HUB_PORTALS, PROFILE } from '../data/profile.js';
import { useExperienceStore } from '../store/experienceStore.js';

const PORTAL_ICONS = {
  library: BookOpen,
  ailab: Cpu,
  projects: Globe,
  achievements: Award,
  contact: Send,
};

export default function PortalLabel({ onSelectPortal, onReturnGateway }) {
  const hoveredPortal = useExperienceStore((s) => s.hoveredPortal);
  const setHoveredPortal = useExperienceStore((s) => s.setHoveredPortal);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const buttonRefs = useRef([]);

  const inspectedPortal =
    HUB_PORTALS.find((portal) => portal.id === hoveredPortal) || null;

  const handleKeyNavigation = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (index + 1) % HUB_PORTALS.length;
      buttonRefs.current[next]?.focus();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = (index - 1 + HUB_PORTALS.length) % HUB_PORTALS.length;
      buttonRefs.current[prev]?.focus();
    }
  };

  if (viewMode === '2d') {
    return (
      <main className="hub-2d-layout">
        <section className="hub-2d-card" aria-labelledby="hub-2d-heading">
          <div className="hub-preview-header">
            <div>
              <p className="hero-eyebrow">
                <Compass size={14} aria-hidden="true" /> {PROFILE.brandSubtitle}
              </p>
              <h1 id="hub-2d-heading" className="hub-preview-title">
                Multiverse Hub
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
            Choose any portal below to explore {PROFILE.name}’s education, AI skills,
            featured project worlds, verified achievements, or contact channels.
          </p>

          <div className="hub-2d-grid" role="list">
            {HUB_PORTALS.map((portal) => {
              const Icon = PORTAL_ICONS[portal.id] || Compass;
              return (
                <button
                  key={portal.id}
                  type="button"
                  role="listitem"
                  className="hub-2d-portal-btn"
                  onClick={() => onSelectPortal(portal)}
                  disabled={isTransitioning}
                >
                  <div className="hub-2d-portal-btn__top">
                    <span className="hub-2d-portal-btn__icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </div>
                  <span className="hub-preview-tile__subtitle">
                    {portal.subtitle}
                  </span>
                  <span className="hub-preview-tile__title">{portal.title}</span>
                  <span className="hub-preview-tile__desc">
                    {portal.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="hub-3d-layout">
      <div className="hub-3d-spacer" aria-hidden="true" />

      <section
        className={`hub-dock-shell ${isTransitioning ? 'hero-panel--exiting' : ''}`}
        aria-label="Multiverse Hub portals"
      >
        <div className="portal-inspector" aria-live="polite">
          {inspectedPortal ? (
            <>
              <span className="portal-inspector__eyebrow">
                {inspectedPortal.subtitle}
              </span>
              <h1 className="portal-inspector__title">{inspectedPortal.title}</h1>
              <p className="portal-inspector__desc">
                {inspectedPortal.description}
              </p>
            </>
          ) : (
            <>
              <span className="portal-inspector__eyebrow">
                <Compass size={13} aria-hidden="true" /> Multiverse Hub · 5 Dimensional Portals
              </span>
              <h1 className="portal-inspector__title">Choose Your World</h1>
              <p className="portal-inspector__desc">
                Click any glowing 3D portal above—or hover, tap, or use arrow keys below—to enter a realm.
              </p>
            </>
          )}
        </div>

        <div className="portal-dock" role="toolbar" aria-label="Portal destinations">
          {HUB_PORTALS.map((portal, index) => {
            const Icon = PORTAL_ICONS[portal.id] || Compass;
            const active = hoveredPortal === portal.id;

            return (
              <button
                key={portal.id}
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                type="button"
                className={`portal-dock-btn ${active ? 'portal-dock-btn--active' : ''}`}
                onClick={() => onSelectPortal(portal)}
                onMouseEnter={() => setHoveredPortal(portal.id)}
                onMouseLeave={() => setHoveredPortal(null)}
                onFocus={() => setHoveredPortal(portal.id)}
                onBlur={() => setHoveredPortal(null)}
                onKeyDown={(event) => handleKeyNavigation(event, index)}
                disabled={isTransitioning}
              >
                <span className="portal-dock-btn__icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className="portal-dock-btn__text">
                  <span className="portal-dock-btn__title">{portal.title}</span>
                  <span className="portal-dock-btn__sub">{portal.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="hub-dock-footer">
          <button
            type="button"
            className="hub-back-link"
            onClick={onReturnGateway}
            disabled={isTransitioning}
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>Back to Gateway</span>
          </button>
          <span className="hub-keyboard-hint">
            Tip: Use Tab or ← → arrow keys + Enter to navigate portals
          </span>
        </div>
      </section>
    </main>
  );
}
