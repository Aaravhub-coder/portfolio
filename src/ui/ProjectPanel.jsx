import {
  ArrowLeft,
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
} from 'lucide-react';
import { PROFILE } from '../data/profile.js';
import { PROJECTS } from '../data/projects.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export default function ProjectPanel({ onReturnHub, onSelectPortal }) {
  const activeProjectId = useExperienceStore((s) => s.activeProjectId);
  const selectProject = useExperienceStore((s) => s.selectProject);
  const panelHidden = useExperienceStore((s) => s.panelHidden);
  const togglePanelHidden = useExperienceStore((s) => s.togglePanelHidden);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const currentIndex = Math.max(
    0,
    PROJECTS.findIndex((p) => p.id === activeProjectId)
  );
  const project = PROJECTS[currentIndex] || PROJECTS[0];

  const handleStep = (delta) => {
    const nextIdx = (currentIndex + delta + PROJECTS.length) % PROJECTS.length;
    selectProject(PROJECTS[nextIdx].id);
  };

  if (panelHidden && viewMode === '3d') {
    return (
      <div className="world-restore-bar world-restore-bar--projects">
        <button
          type="button"
          className="hud-pill"
          onClick={() => handleStep(-1)}
          aria-label="Previous project world"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="hud-pill hud-pill--gold"
          onClick={togglePanelHidden}
        >
          <Eye size={14} aria-hidden="true" />
          <span>{project.title} · Show Details</span>
        </button>
        <button
          type="button"
          className="hud-pill"
          onClick={() => handleStep(1)}
          aria-label="Next project world"
        >
          <ChevronRight size={14} aria-hidden="true" />
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
            World 0{currentIndex + 1} / 0{PROJECTS.length}: {project.worldTitle} —{' '}
            {project.worldMetaphor}
          </p>
        )}
      </div>

      <aside
        className={`world-panel world-panel--projects ${isTransitioning ? 'hero-panel--exiting' : ''}`}
        aria-labelledby="project-world-heading"
      >
        <div className="world-panel__header">
          <div>
            <p className="hero-eyebrow">
              <Globe size={13} aria-hidden="true" /> Scene 5 · Project World 0
              {currentIndex + 1} / 0{PROJECTS.length}
            </p>
            <h1 id="project-world-heading" className="world-panel__title">
              {project.title}
            </h1>
            <p className="project-subtitle">{project.subtitle}</p>
          </div>

          {viewMode === '3d' && (
            <button
              type="button"
              className="world-icon-btn"
              onClick={togglePanelHidden}
              title="Hide panel to inspect the 3D project world"
              aria-label="Hide panel to inspect the 3D project world"
            >
              <EyeOff size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* 6-World Selector Bar */}
        <div
          className="project-switcher"
          role="tablist"
          aria-label="Select project world"
        >
          {PROJECTS.map((item, idx) => {
            const active = item.id === project.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`project-switcher__pill ${active ? 'project-switcher__pill--active' : ''}`}
                onClick={() => selectProject(item.id)}
              >
                <span className="project-switcher__num">0{idx + 1}</span>
                <span className="project-switcher__name">{item.title}</span>
              </button>
            );
          })}
        </div>

        <div className="world-panel__body">
          <div className="project-status-row">
            <span
              className={`project-status-badge ${
                project.status.includes('Research')
                  ? 'project-status-badge--research'
                  : ''
              }`}
            >
              {project.status}
            </span>
            <span className="project-metaphor-tag">
              <Sparkles size={12} aria-hidden="true" /> {project.worldTitle}
            </span>
          </div>

          {project.recognition && (
            <div className="project-recognition">
              <Award size={15} aria-hidden="true" />
              <span>{project.recognition}</span>
            </div>
          )}

          <div className="project-section">
            <h2 className="world-subheading">Problem Statement</h2>
            <p className="project-text">{project.problem}</p>
          </div>

          <div className="project-section">
            <h2 className="world-subheading">
              {project.status.includes('Research')
                ? 'Research Direction & Proposed Pipeline'
                : 'What Aarav Built'}
            </h2>
            <ul className="project-highlights">
              {project.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="project-section">
            <h2 className="world-subheading">Technologies</h2>
            <div className="world-stub-chips project-tech-chips">
              {project.technologies.map((tech) => (
                <span key={tech} className="world-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="project-section project-repo-box">
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="project-repo-link"
              >
                <Code2 size={15} aria-hidden="true" />
                <span>View Verified GitHub Repository</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ) : (
              <p className="project-repo-note">
                Public repository link not yet linked for this project — view
                Aarav’s profile at{' '}
                <a
                  href={PROFILE.contact.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  {PROFILE.contact.githubLabel}
                </a>
                .
              </p>
            )}
          </div>
        </div>

        <footer className="world-panel__footer">
          <div className="project-step-controls">
            <button
              type="button"
              className="btn-secondary"
              onClick={onReturnHub}
              disabled={isTransitioning}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Hub</span>
            </button>

            <button
              type="button"
              className="hud-pill"
              onClick={() => handleStep(-1)}
              aria-label="Previous project world"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <span>Prev</span>
            </button>

            <button
              type="button"
              className="hud-pill"
              onClick={() => handleStep(1)}
              aria-label="Next project world"
            >
              <span>Next</span>
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className="hud-pill hud-pill--gold"
            onClick={() => onSelectPortal(SCENES.ACHIEVEMENTS)}
            disabled={isTransitioning}
          >
            <span>Achievement Hall</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </footer>
      </aside>
    </main>
  );
}
