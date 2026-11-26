import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/skills.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export default function SkillsPanel({ onReturnHub, onSelectPortal }) {
  const selectedSkillCategory = useExperienceStore(
    (s) => s.selectedSkillCategory
  );
  const setSelectedSkillCategory = useExperienceStore(
    (s) => s.setSelectedSkillCategory
  );
  const highlightedSkill = useExperienceStore((s) => s.highlightedSkill);
  const setHighlightedSkill = useExperienceStore((s) => s.setHighlightedSkill);
  const panelHidden = useExperienceStore((s) => s.panelHidden);
  const togglePanelHidden = useExperienceStore((s) => s.togglePanelHidden);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const visibleCategories =
    selectedSkillCategory === 'all'
      ? SKILL_CATEGORIES
      : SKILL_CATEGORIES.filter((cat) => cat.id === selectedSkillCategory);

  const totalCount = SKILL_CATEGORIES.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  if (panelHidden && viewMode === '3d') {
    return (
      <div className="world-restore-bar">
        <button
          type="button"
          className="hud-pill hud-pill--active"
          onClick={togglePanelHidden}
        >
          <Eye size={14} aria-hidden="true" />
          <span>Show AI Lab Skills Panel</span>
        </button>
      </div>
    );
  }

  return (
    <main className={`world-split-layout ${viewMode === '2d' ? 'world-split-layout--2d' : ''}`}>
      <div className="world-3d-window" aria-hidden="true">
        {viewMode === '3d' && (
          <p className="world-canvas-tip">
            Tip: Hover or click any 3D neural node—or filter categories—to inspect
            verified skills
          </p>
        )}
      </div>

      <aside
        className={`world-panel world-panel--ailab ${isTransitioning ? 'hero-panel--exiting' : ''}`}
        aria-labelledby="ailab-heading"
      >
        <div className="world-panel__header">
          <div>
            <p className="hero-eyebrow">
              <Cpu size={13} aria-hidden="true" /> Scene 4 · AI Laboratory
            </p>
            <h1 id="ailab-heading" className="world-panel__title">
              Skills &amp; Technologies
            </h1>
          </div>

          {viewMode === '3d' && (
            <button
              type="button"
              className="world-icon-btn"
              onClick={togglePanelHidden}
              title="Hide panel to inspect the 3D AI Laboratory"
              aria-label="Hide panel to inspect the 3D AI Laboratory"
            >
              <EyeOff size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <p className="world-panel__lead">
          Verified languages, frameworks, and tools from Aarav Raj’s CV and
          documented project work—presented with honest context labels rather than
          arbitrary proficiency percentages.
        </p>

        <div
          className="skill-filter-bar"
          role="tablist"
          aria-label="Filter skill categories"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedSkillCategory === 'all'}
            className={`skill-filter-pill ${selectedSkillCategory === 'all' ? 'skill-filter-pill--active' : ''}`}
            onClick={() => setSelectedSkillCategory('all')}
          >
            All ({totalCount})
          </button>
          {SKILL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selectedSkillCategory === category.id}
              className={`skill-filter-pill ${selectedSkillCategory === category.id ? 'skill-filter-pill--active' : ''}`}
              onClick={() => setSelectedSkillCategory(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="world-panel__body">
          <div className="skill-groups">
            {visibleCategories.map((category) => (
              <section key={category.id} className="skill-group">
                <div className="skill-group__head">
                  <h2 className="world-subheading">
                    <Layers size={13} aria-hidden="true" /> {category.title}
                  </h2>
                  <p className="skill-group__desc">{category.description}</p>
                </div>

                <div className="skill-cards">
                  {category.items.map((item) => {
                    const active = highlightedSkill === item.name;
                    const isLearning = item.familiarity
                      .toLowerCase()
                      .includes('learning');

                    return (
                      <button
                        key={item.name}
                        type="button"
                        className={`skill-card ${active ? 'skill-card--active' : ''}`}
                        onMouseEnter={() => setHighlightedSkill(item.name)}
                        onMouseLeave={() => setHighlightedSkill(null)}
                        onFocus={() => setHighlightedSkill(item.name)}
                        onBlur={() => setHighlightedSkill(null)}
                        onClick={() =>
                          setHighlightedSkill(active ? null : item.name)
                        }
                      >
                        <span className="skill-card__name">{item.name}</span>
                        <span
                          className={`skill-card__tag ${isLearning ? 'skill-card__tag--learning' : ''}`}
                        >
                          {item.familiarity}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
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
            className="hud-pill hud-pill--gold"
            onClick={() => onSelectPortal(SCENES.PROJECTS)}
            disabled={isTransitioning}
          >
            <span>Next: Project Worlds</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </footer>
      </aside>
    </main>
  );
}
