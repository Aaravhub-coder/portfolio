import { create } from 'zustand';

const getInitialReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const SCENES = {
  GATEWAY: 'gateway',
  HUB: 'hub',
  LIBRARY: 'library',
  AILAB: 'ailab',
  PROJECTS: 'projects',
  ACHIEVEMENTS: 'achievements',
  CONTACT: 'contact',
};

export const useExperienceStore = create((set) => ({
  activeScene: SCENES.GATEWAY,
  activeProjectId: null,
  hoveredPortal: null,
  isTransitioning: false,
  transitionLabel: '',
  canvasReady: false,
  audioEnabled: false, // Strictly muted by default per brief
  viewMode: '3d', // Falls back to '2d' on WebGL failure or user preference
  webglError: null,
  reducedMotion: getInitialReducedMotion(),

  navigateTo: (scene, projectId = null) =>
    set({
      activeScene: scene,
      activeProjectId: projectId,
      hoveredPortal: null,
    }),

  selectProject: (projectId) =>
    set({
      activeScene: SCENES.PROJECTS,
      activeProjectId: projectId,
    }),

  returnToHub: () =>
    set({
      activeScene: SCENES.HUB,
      activeProjectId: null,
      hoveredPortal: null,
    }),

  returnToGateway: () =>
    set({
      activeScene: SCENES.GATEWAY,
      activeProjectId: null,
      hoveredPortal: null,
    }),

  setHoveredPortal: (portalId) => set({ hoveredPortal: portalId }),
  setIsTransitioning: (isTransitioning, transitionLabel = '') =>
    set({ isTransitioning, transitionLabel }),
  setCanvasReady: (canvasReady) => set({ canvasReady }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  setViewMode: (viewMode) => set({ viewMode }),
  setWebglError: (webglError) =>
    set({
      webglError,
      viewMode: webglError ? '2d' : '3d',
      canvasReady: true,
    }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
