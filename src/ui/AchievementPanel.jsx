import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

const FILTERS = [
  { id: 'all', label: 'All (6)' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'certification', label: 'Certification' },
  { id: 'learning', label: 'Learning' },
];

function CategoryIcon({ category }) {
  if (category === 'Certification') return <BadgeCheck size={16} aria-hidden="true" />;
  if (category === 'Learning') return <Sparkles size={16} aria-hidden="true" />;
  return <Trophy size={16} aria-hidden="true" />;
}

export default function AchievementPanel({ onReturnHub, onSelectPortal }) {
  const selectedAchievementId = useExperienceStore(
    (s) => s.selectedAchievementId
  );
  const setSelectedAchievementId = useExperienceStore(
    (s) => s.setSelectedAchievementId
  );
  const achievementFilter = useExperienceStore((s) => s.achievementFilter);
  const setAchievementFilter = useExperienceStore(
    (s) => s.setAchievementFilter
  );
  const panelHidden = useExperienceStore((s) => s.panelHidden);
  const togglePanelHidden = useExperienceStore((s) => s.togglePanelHidden);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const visibleAchievements =
    achievementFilter === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter(
          (item) => item.category.toLowerCase() === achievementFilter
        );

  if (panelHidden && viewMode === '3d') {
    return (
      <div className="world-restore-bar">
        <button
          type="button"
          className="hud-pill hud-pill--gold"
          onClick={togglePanelHidden}
        >
          <Eye size={14} aria-hidden="true" />
          <span>Show Achievement Hall Panel</span>
        </button>
      </div>
    );
  }

  return (
    <main
      className={`world-split-layout ${viewMode === '2d' ? 'world-split-layout--2d' : ''}`}
    >
      <div className="world-3d-window" aria-hidden="true">
        {viewMode === '3d' && (
          <p className="world-canvas-tip">
            Tip: Hover or click any trophy pedestal in the hall to spotlight a
            verified honor
          </p>
        )}
      </div>

      <aside
        className={`world-panel world-panel--achievements ${isTransitioning ? 'hero-panel--exiting' : ''}`}
        aria-labelledby="achievement-heading"
      >
        <div className="world-panel__header">
          <div>
            <p className="hero-eyebrow">
              <Award size={13} aria-hidden="true" /> Scene 6 · Achievement Hall
            </p>
            <h1 id="achievement-heading" className="world-panel__title">
              Honors &amp; Certifications
            </h1>
          </div>

          {viewMode === '3d' && (
            <button
              type="button"
              className="world-icon-btn"
              onClick={togglePanelHidden}
              title="Hide panel to inspect the 3D Achievement Hall"
              aria-label="Hide panel to inspect the 3D Achievement Hall"
            >
              <EyeOff size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <p className="world-panel__lead">
          Verified hackathon recognitions, certification, and continuous AI
          learning milestones directly from Aarav Raj’s CV.
        </p>

        <div
          className="skill-filter-bar"
          role="tablist"
          aria-label="Filter achievements by category"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={achievementFilter === filter.id}
              className={`skill-filter-pill ${achievementFilter === filter.id ? 'skill-filter-pill--active' : ''}`}
              onClick={() => setAchievementFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="world-panel__body">
          <div className="achievement-list" role="list">
            {visibleAchievements.map((item) => {
              const active = selectedAchievementId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  className={`achievement-card ${active ? 'achievement-card--active' : ''}`}
                  onMouseEnter={() => setSelectedAchievementId(item.id)}
                  onMouseLeave={() => setSelectedAchievementId(null)}
                  onFocus={() => setSelectedAchievementId(item.id)}
                  onBlur={() => setSelectedAchievementId(null)}
                  onClick={() =>
                    setSelectedAchievementId(active ? null : item.id)
                  }
                >
                  <span className="achievement-card__icon">
                    <CategoryIcon category={item.category} />
                  </span>
                  <span className="achievement-card__content">
                    <span className="achievement-card__meta">
                      {item.category} · {item.issuer}
                    </span>
                    <span className="achievement-card__title">{item.title}</span>
                    <span className="achievement-card__detail">
                      {item.detail}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="world-panel__footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onReturnHub}
            disabled={isTransitioning}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Multiverse Hub</span>
          </button>

          <button
            type="button"
            className="hud-pill hud-pill--active"
            onClick={() => onSelectPortal(SCENES.CONTACT)}
            disabled={isTransitioning}
          >
            <span>Next: Contact Portal</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </footer>
      </aside>
    </main>
  );
}
