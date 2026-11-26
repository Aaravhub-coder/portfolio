import { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  User,
} from 'lucide-react';
import { PROFILE } from '../data/profile.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

const CHAPTER_ICONS = {
  profile: User,
  story: Sparkles,
  education: GraduationCap,
};

export default function AboutPanel({ onReturnHub, onSelectPortal }) {
  const libraryBookOpen = useExperienceStore((s) => s.libraryBookOpen);
  const libraryChapterIndex = useExperienceStore((s) => s.libraryChapterIndex);
  const openLibraryBook = useExperienceStore((s) => s.openLibraryBook);
  const closeLibraryBook = useExperienceStore((s) => s.closeLibraryBook);
  const setLibraryChapterIndex = useExperienceStore(
    (s) => s.setLibraryChapterIndex
  );
  const stepLibraryChapter = useExperienceStore((s) => s.stepLibraryChapter);
  const panelHidden = useExperienceStore((s) => s.panelHidden);
  const togglePanelHidden = useExperienceStore((s) => s.togglePanelHidden);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const chapters = PROFILE.libraryChapters;
  const currentChapter = chapters[libraryChapterIndex] || chapters[0];
  const isBookReadable = libraryBookOpen || viewMode === '2d';

  // Keyboard ArrowLeft / ArrowRight turns pages across the 3 chapters
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (!libraryBookOpen) openLibraryBook();
        else stepLibraryChapter(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (libraryBookOpen) stepLibraryChapter(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [libraryBookOpen, openLibraryBook, stepLibraryChapter]);

  if (panelHidden && viewMode === '3d') {
    return (
      <div className="world-restore-bar world-restore-bar--projects">
        {libraryBookOpen && (
          <>
            <button
              type="button"
              className="hud-pill"
              onClick={() => stepLibraryChapter(-1)}
              disabled={libraryChapterIndex === 0}
              aria-label="Turn to previous chapter"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hud-pill"
              onClick={() => stepLibraryChapter(1)}
              disabled={libraryChapterIndex === chapters.length - 1}
              aria-label="Turn to next chapter"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          className="hud-pill hud-pill--gold"
          onClick={togglePanelHidden}
        >
          <Eye size={14} aria-hidden="true" />
          <span>Show Chronicle Reader</span>
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
            {libraryBookOpen
              ? `Chapter ${currentChapter.numeral} of III — Click left/right pages or press ← → to turn pages`
              : 'Click the giant floating Ancient Book above the golden runes to open its chapters'}
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

          <div className="library-header-actions">
            {viewMode === '3d' && (
              <button
                type="button"
                className="hud-pill hud-pill--gold"
                onClick={libraryBookOpen ? closeLibraryBook : openLibraryBook}
              >
                <BookMarked size={14} aria-hidden="true" />
                <span>{libraryBookOpen ? 'Close Book' : 'Open Book'}</span>
              </button>
            )}
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
        </div>

        {/* 3-Chapter Navigation Tabs */}
        <div
          className="world-tabs world-tabs--three"
          role="tablist"
          aria-label="Ancient Book chapters"
        >
          {chapters.map((chapter, idx) => {
            const Icon = CHAPTER_ICONS[chapter.id] || BookOpen;
            const selected = isBookReadable && libraryChapterIndex === idx;
            return (
              <button
                key={chapter.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`world-tab ${selected ? 'world-tab--active' : ''}`}
                onClick={() => setLibraryChapterIndex(idx)}
              >
                <Icon size={13} aria-hidden="true" />
                <span>
                  {chapter.numeral}. {chapter.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="world-panel__body">
          {!isBookReadable ? (
            <div className="library-closed-card">
              <p className="parchment-callout__quote">
                “{PROFILE.primaryTagline}”
              </p>
              <p className="library-closed-card__desc">
                The giant ancient tome levitates sealed above the golden rune
                circle. Open the book to turn through three animated chapters:
                <strong> Profile</strong>, <strong>Personal Story</strong>, and{' '}
                <strong>Education</strong>.
              </p>
              <button
                type="button"
                className="btn-enter library-open-cta"
                onClick={openLibraryBook}
              >
                <BookOpen size={16} aria-hidden="true" />
                <span>OPEN ANCIENT BOOK</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="library-section">
              <div className="library-chapter-banner">
                <span className="library-chapter-banner__num">
                  Chapter {currentChapter.numeral} of III
                </span>
                <h2 className="library-chapter-banner__title">
                  {currentChapter.title} — {currentChapter.subtitle}
                </h2>
              </div>

              {currentChapter.id === 'profile' && (
                <>
                  <div className="parchment-callout">
                    <p className="parchment-callout__quote">
                      “{PROFILE.primaryTagline}”
                    </p>
                    <p className="parchment-callout__sub">
                      {PROFILE.supportingLine}
                    </p>
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
                    {currentChapter.paragraphs.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                </>
              )}

              {currentChapter.id === 'story' && (
                <div className="library-copy-block">
                  <div className="parchment-callout">
                    <p className="parchment-callout__quote">
                      “{PROFILE.supportingLine}”
                    </p>
                  </div>
                  {currentChapter.paragraphs.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              )}

              {currentChapter.id === 'education' && (
                <>
                  <div className="library-copy-block">
                    {currentChapter.paragraphs.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
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
                </>
              )}

              {/* In-Book Page Turn Bar */}
              <div className="library-page-controls">
                <button
                  type="button"
                  className="hud-pill"
                  onClick={() => stepLibraryChapter(-1)}
                  disabled={libraryChapterIndex === 0}
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                  <span>Previous Page</span>
                </button>

                <span className="library-page-indicator">
                  Spread 0{libraryChapterIndex + 1} / 0{chapters.length}
                </span>

                <button
                  type="button"
                  className="hud-pill hud-pill--gold"
                  onClick={() => stepLibraryChapter(1)}
                  disabled={libraryChapterIndex === chapters.length - 1}
                >
                  <span>Turn Page</span>
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
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
