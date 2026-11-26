import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Code2,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Mail,
  Phone,
  Send,
} from 'lucide-react';
import { PROFILE } from '../data/profile.js';
import { useExperienceStore } from '../store/experienceStore.js';

export default function ContactPanel({ onReturnHub, onReturnGateway }) {
  const hoveredContactChannel = useExperienceStore(
    (s) => s.hoveredContactChannel
  );
  const setHoveredContactChannel = useExperienceStore(
    (s) => s.setHoveredContactChannel
  );
  const panelHidden = useExperienceStore((s) => s.panelHidden);
  const togglePanelHidden = useExperienceStore((s) => s.togglePanelHidden);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const [copiedField, setCopiedField] = useState(null);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async (field, value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopiedField(field);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedField(null), 2200);
    } catch {
      setCopiedField(null);
    }
  };

  if (panelHidden && viewMode === '3d') {
    return (
      <div className="world-restore-bar">
        <button
          type="button"
          className="hud-pill hud-pill--active"
          onClick={togglePanelHidden}
        >
          <Eye size={14} aria-hidden="true" />
          <span>Show Contact Portal Panel</span>
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
            Hover any contact channel or CV download card to illuminate its
            dimensional relay beacon
          </p>
        )}
      </div>

      <aside
        className={`world-panel world-panel--contact ${isTransitioning ? 'hero-panel--exiting' : ''}`}
        aria-labelledby="contact-heading"
      >
        <div className="world-panel__header">
          <div>
            <p className="hero-eyebrow">
              <Send size={13} aria-hidden="true" /> Scene 7 · Contact Portal
            </p>
            <h1 id="contact-heading" className="world-panel__title">
              Open a Direct Channel
            </h1>
          </div>

          {viewMode === '3d' && (
            <button
              type="button"
              className="world-icon-btn"
              onClick={togglePanelHidden}
              title="Hide panel to inspect the 3D Contact Portal"
              aria-label="Hide panel to inspect the 3D Contact Portal"
            >
              <EyeOff size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <p className="world-panel__lead">
          Reach <strong>{PROFILE.name}</strong> ({PROFILE.role}) directly for
          internships, AI/ML collaborations, hackathons, or download the
          verified CV.
        </p>

        <div className="world-panel__body">
          <div className="contact-channels">
            {/* Downloadable CV Document Card */}
            <div
              className={`contact-card contact-card--cv ${hoveredContactChannel === 'cv' ? 'contact-card--active' : ''}`}
              onMouseEnter={() => setHoveredContactChannel('cv')}
              onMouseLeave={() => setHoveredContactChannel(null)}
            >
              <div className="contact-card__main">
                <span
                  className="contact-card__icon contact-card__icon--gold"
                  aria-hidden="true"
                >
                  <FileText size={18} />
                </span>
                <span className="contact-card__text">
                  <span className="contact-card__label">Curriculum Vitae</span>
                  <strong className="contact-card__value">
                    {PROFILE.cvFileName || PROFILE.contact.cvFileName}
                  </strong>
                  <span className="contact-card__hint">
                    Verified 1-page PDF resume
                  </span>
                </span>
              </div>

              <div className="contact-cv-actions">
                <a
                  href={PROFILE.contact.cvUrl}
                  download={PROFILE.contact.cvFileName}
                  className="contact-download-btn"
                  onFocus={() => setHoveredContactChannel('cv')}
                  onBlur={() => setHoveredContactChannel(null)}
                >
                  <Download size={14} aria-hidden="true" />
                  <span>Download CV</span>
                </a>
                <a
                  href={PROFILE.contact.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-copy-btn"
                  aria-label="Open CV PDF in a new tab"
                  onFocus={() => setHoveredContactChannel('cv')}
                  onBlur={() => setHoveredContactChannel(null)}
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  <span>View</span>
                </a>
              </div>
            </div>

            {/* Phone Direct Card */}
            <div
              className={`contact-card ${hoveredContactChannel === 'phone' ? 'contact-card--active' : ''}`}
              onMouseEnter={() => setHoveredContactChannel('phone')}
              onMouseLeave={() => setHoveredContactChannel(null)}
            >
              <a
                href={PROFILE.contact.phoneHref}
                className="contact-card__main"
                onFocus={() => setHoveredContactChannel('phone')}
                onBlur={() => setHoveredContactChannel(null)}
              >
                <span className="contact-card__icon" aria-hidden="true">
                  <Phone size={18} />
                </span>
                <span className="contact-card__text">
                  <span className="contact-card__label">Phone</span>
                  <strong className="contact-card__value">
                    {PROFILE.contact.phone}
                  </strong>
                  <span className="contact-card__hint">
                    Direct call or mobile contact
                  </span>
                </span>
              </a>

              <button
                type="button"
                className={`contact-copy-btn ${copiedField === 'phone' ? 'contact-copy-btn--copied' : ''}`}
                onClick={() => handleCopy('phone', PROFILE.contact.phone)}
                aria-label="Copy phone number"
              >
                {copiedField === 'phone' ? (
                  <>
                    <Check size={14} aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Email Direct Card */}
            <div
              className={`contact-card ${hoveredContactChannel === 'email' ? 'contact-card--active' : ''}`}
              onMouseEnter={() => setHoveredContactChannel('email')}
              onMouseLeave={() => setHoveredContactChannel(null)}
            >
              <a
                href={`mailto:${PROFILE.contact.email}`}
                className="contact-card__main"
                onFocus={() => setHoveredContactChannel('email')}
                onBlur={() => setHoveredContactChannel(null)}
              >
                <span className="contact-card__icon" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <span className="contact-card__text">
                  <span className="contact-card__label">Email</span>
                  <strong className="contact-card__value">
                    {PROFILE.contact.email}
                  </strong>
                  <span className="contact-card__hint">
                    Opens your default mail client
                  </span>
                </span>
              </a>

              <button
                type="button"
                className={`contact-copy-btn ${copiedField === 'email' ? 'contact-copy-btn--copied' : ''}`}
                onClick={() => handleCopy('email', PROFILE.contact.email)}
                aria-label="Copy email address"
              >
                {copiedField === 'email' ? (
                  <>
                    <Check size={14} aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* GitHub Card */}
            <a
              href={PROFILE.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`contact-card contact-card--link ${hoveredContactChannel === 'github' ? 'contact-card--active' : ''}`}
              onMouseEnter={() => setHoveredContactChannel('github')}
              onMouseLeave={() => setHoveredContactChannel(null)}
              onFocus={() => setHoveredContactChannel('github')}
              onBlur={() => setHoveredContactChannel(null)}
            >
              <span className="contact-card__icon" aria-hidden="true">
                <Code2 size={18} />
              </span>
              <span className="contact-card__text">
                <span className="contact-card__label">GitHub</span>
                <strong className="contact-card__value">
                  {PROFILE.contact.githubLabel}
                </strong>
                <span className="contact-card__hint">
                  Repositories, experiments &amp; source code
                </span>
              </span>
              <ExternalLink
                size={15}
                className="contact-card__ext"
                aria-hidden="true"
              />
            </a>

            {/* LinkedIn Card */}
            <a
              href={PROFILE.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={`contact-card contact-card--link ${hoveredContactChannel === 'linkedin' ? 'contact-card--active' : ''}`}
              onMouseEnter={() => setHoveredContactChannel('linkedin')}
              onMouseLeave={() => setHoveredContactChannel(null)}
              onFocus={() => setHoveredContactChannel('linkedin')}
              onBlur={() => setHoveredContactChannel(null)}
            >
              <span className="contact-card__icon" aria-hidden="true">
                <Send size={18} />
              </span>
              <span className="contact-card__text">
                <span className="contact-card__label">LinkedIn</span>
                <strong className="contact-card__value">
                  {PROFILE.contact.linkedinLabel}
                </strong>
                <span className="contact-card__hint">
                  Professional profile &amp; direct messaging
                </span>
              </span>
              <ExternalLink
                size={15}
                className="contact-card__ext"
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="parchment-callout contact-signoff">
            <p className="parchment-callout__quote">
              “{PROFILE.primaryTagline}”
            </p>
            <p className="parchment-callout__sub">
              {PROFILE.name} — {PROFILE.role}
            </p>
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
            onClick={onReturnGateway}
            disabled={isTransitioning}
          >
            <Compass size={14} aria-hidden="true" />
            <span>Return to Gateway</span>
          </button>
        </footer>
      </aside>
    </main>
  );
}
