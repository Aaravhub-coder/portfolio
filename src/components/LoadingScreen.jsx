import { useEffect, useState } from 'react';
import { PROFILE } from '../data/profile.js';
import { useExperienceStore } from '../store/experienceStore.js';

export default function LoadingScreen() {
  const canvasReady = useExperienceStore((s) => s.canvasReady);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const [dismissed, setDismissed] = useState(false);
  const [safetyReady, setSafetyReady] = useState(false);

  const ready = canvasReady || viewMode === '2d' || safetyReady;

  useEffect(() => {
    const safetyTimer = window.setTimeout(() => setSafetyReady(true), 2400);
    return () => window.clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const hideTimer = window.setTimeout(() => setDismissed(true), 520);
    return () => window.clearTimeout(hideTimer);
  }, [ready]);

  if (dismissed) return null;

  return (
    <div
      className={`loading-screen ${ready ? 'loading-screen--fade' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Initializing the Chronicles of Aarav Gateway"
    >
      <div className="loading-emblem" aria-hidden="true">
        <span className="loading-ring loading-ring--outer" />
        <span className="loading-ring loading-ring--inner" />
        <span className="loading-initials">{PROFILE.initials}</span>
      </div>
      <p className="loading-title">{PROFILE.brandTitle}</p>
      <p className="loading-status">Aligning dimensional gateway…</p>
    </div>
  );
}
