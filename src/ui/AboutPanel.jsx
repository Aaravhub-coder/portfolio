import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { PROFILE } from '../data/profile.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export default function AboutPanel({ onReturnHub, onSelectPortal }) {
  const activeLibraryChapter = useExperienceStore((s) => s.activeLibraryChapter);
  const setActiveLibraryChapter = useExperienceStore(
    (s) => s.setActiveLibraryChapter
  );
  const panelHidden = useExperienceStore((s) => s.panelHidden);
  const togglePanelHidden = useExperienceStore((s) => s.togglePanelHidden);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  if (panelHidden && viewMode === '3d') {
    return (
      <div className="world-restore-bar">
        <button
          type="button"
          className="hud-pill hud-pill--gold"
          onClick={togglePanelHidden}
        >
          <Eye size={14} aria-hidden="true" />
          <span>Show Archive Tome Panel</span>
        </button>
      </div>
    );
  }

  return (
    <main className={`world-split-layout ${viewMode === '2d' ? 'world-split-layout--2d' : ''}`}>
      <div className="world-3d-window" aria-hidden="true">
        {viewMode === '3d' && (
          <p className="world-canvas-tip">
            Tip: Click the floating Chronicle Tome in the library to flip between
            Profile &amp; Education
          </p>
        )}
      </div>

      <aside
        className={`world-panel world-panel--library ${isTransitioning ? 'hero-panel--exiting' : ''}`}
        aria-labelledby="library-heading"
      >
        <div className="world-panel__header">
          <div>
            <p className="hero-eyebrow">
              <BookOpen size={13} aria-hidden="true" /> Scene 3 · Ancient Library
            </p>
            <h1 id="library-heading" className="world-panel__title">
              The Chronicle of {PROFILE.name}
            </h1>
          </div>

          {viewMode === '3d' && (
            <button
              type="button"
              className="world-icon-btn"
              onClick={togglePanelHidden}
              title="Hide panel to inspect the 3D Ancient Library"
              aria-label="Hide panel to inspect the 3D Ancient Library"
            >
              <EyeOff size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="world-tabs" role="tablist" aria-label="Library chapters">
          <button
            type="button"
            role="tab"
            aria-selected={activeLibraryChapter === 'chronicle'}
            className={`world-tab ${activeLibraryChapter === 'chronicle' ? 'world-tab--active' : ''}`}
            onClick={() => setActiveLibraryChapter('chronicle')}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Profile &amp; Story</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLibraryChapter === 'education'}
            className={`world-tab ${activeLibraryChapter === 'education' ? 'world-tab--active' : ''}`}
            onClick={() => setActiveLibraryChapter('education')}
          >
            <GraduationCap size={14} aria-hidden="true" />
            <span>Education</span>
          </button>
        </div>

        <div className="world-panel__body">
          {activeLibraryChapter === 'chronicle' ? (
            <div className="library-section">
              <div className="parchment-callout">
                <p className="parchment-callout__quote">
                  “{PROFILE.primaryTagline}”
                </p>
                <p className="parchment-callout__sub">{PROFILE.supportingLine}</p>
              </div>

              <div className="library-meta-row">
                <div className="library-meta-chip">
                  <span className="library-meta-chip__label">Identity</span>
                  <strong>{PROFILE.name}</strong>
                </div>
                <div className="library-meta-chip">
                  <span className="library-meta-chip__label">Focus</span>
                  <strong>{PROFILE.role}</strong>
                </div>
              </div>

              <div className="library-copy-block">
                <h2 className="world-subheading">About</h2>
                <p>{PROFILE.summary}</p>
                <p>
                  Currently pursuing a{' '}
                  <strong>
                    B.Tech in Data Science &amp; Artificial Intelligence
                  </strong>{' '}
                  at <strong>The ICFAI University, Dehradun (2024–2028)</strong>,
                  building hands-on projects spanning financial anomaly detection,
                  entity resolution, rooftop solar recommendations, cybersecurity
                  workflows, and optical lunar imagery research.
                </p>
              </div>
            </div>
          ) : (
            <div className="library-section">
              <h2 className="world-subheading">Verified Academic Path</h2>
              <ol className="education-timeline">
                {PROFILE.education.map((entry) => (
                  <li key={entry.id} className="education-node">
                    <span className="education-node__dot" aria-hidden="true" />
                    <div className="education-node__content">
                      <span className="education-node__period">
                        {entry.period} · {entry.stage}
                      </span>
                      <h3 className="education-node__school">
                        {entry.institution}
                      </h3>
                      <p className="education-node__degree">
                        {entry.qualification}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
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
            onClick={() => onSelectPortal(SCENES.AILAB)}
            disabled={isTransitioning}
          >
            <span>Next: AI Laboratory</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </footer>
      </aside>
    </main>
  );
}
