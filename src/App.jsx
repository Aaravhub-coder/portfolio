import { PROFILE, HUB_PORTALS } from './data/profile.js';
import { PROJECTS } from './data/projects.js';
import { SKILL_CATEGORIES } from './data/skills.js';
import { ACHIEVEMENTS } from './data/achievements.js';

export default function App() {
  const totalSkills = SKILL_CATEGORIES.reduce(
    (sum, category) => sum + category.items.length,
    0
  );

  return (
    <main className="m0-shell">
      <section className="m0-card" aria-labelledby="chronicles-title">
        <span className="m0-badge">Milestone M0 · Architecture Ready</span>
        <h1 id="chronicles-title" className="m0-title">
          {PROFILE.brandTitle}
        </h1>
        <p className="m0-subtitle">{PROFILE.brandSubtitle}</p>
        <p className="m0-quote">“{PROFILE.primaryTagline}”</p>
        <p className="m0-copy">
          {PROFILE.name} — {PROFILE.role}. {PROFILE.summary}
        </p>

        <div className="m0-grid" aria-label="Verified structured portfolio modules">
          <div className="m0-stat">
            <div className="m0-stat-label">Hub Portals</div>
            <div className="m0-stat-value">{HUB_PORTALS.length} Worlds</div>
          </div>
          <div className="m0-stat">
            <div className="m0-stat-label">Project Worlds</div>
            <div className="m0-stat-value">{PROJECTS.length} Realms</div>
          </div>
          <div className="m0-stat">
            <div className="m0-stat-label">Verified Skills</div>
            <div className="m0-stat-value">{totalSkills} Entries</div>
          </div>
          <div className="m0-stat">
            <div className="m0-stat-label">Achievements</div>
            <div className="m0-stat-value">{ACHIEVEMENTS.length} Verified</div>
          </div>
        </div>

        <footer className="m0-footer">
          <span>Next Milestone: M1 — 3D Gateway Scene</span>
          <span>
            <a href={`mailto:${PROFILE.contact.email}`}>{PROFILE.contact.email}</a>
          </span>
        </footer>
      </section>
    </main>
  );
}
