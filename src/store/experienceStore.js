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
  transitionFocus: null,
  canvasReady: false,
  audioEnabled: false, // Strictly muted by default per brief
  viewMode: '3d', // Falls back to '2d' on WebGL failure or user preference
  webglError: null,
  reducedMotion: getInitialReducedMotion(),

  // M3 World-specific interactive state
  activeLibraryChapter: 'chronicle', // 'chronicle' | 'education'
  selectedSkillCategory: 'all',
  highlightedSkill: null,
  panelHidden: false,

  navigateTo: (scene, projectId = null) =>
    set({
      activeScene: scene,
      activeProjectId: projectId,
      hoveredPortal: null,
      panelHidden: false,
      highlightedSkill: null,
    }),

  selectProject: (projectId) =>
    set({
      activeScene: SCENES.PROJECTS,
      activeProjectId: projectId,
      panelHidden: false,
    }),

  returnToHub: () =>
    set({
      activeScene: SCENES.HUB,
      activeProjectId: null,
      hoveredPortal: null,
      panelHidden: false,
    }),

  returnToGateway: () =>
    set({
      activeScene: SCENES.GATEWAY,
      activeProjectId: null,
      hoveredPortal: null,
      panelHidden: false,
    }),

  setHoveredPortal: (portalId) => set({ hoveredPortal: portalId }),
  setIsTransitioning: (isTransitioning, transitionLabel = '', transitionFocus = null) =>
    set({ isTransitioning, transitionLabel, transitionFocus }),
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

  setActiveLibraryChapter: (activeLibraryChapter) =>
    set({ activeLibraryChapter }),
  toggleLibraryChapter: () =>
    set((state) => ({
      activeLibraryChapter:
        state.activeLibraryChapter === 'chronicle' ? 'education' : 'chronicle',
    })),
  setSelectedSkillCategory: (selectedSkillCategory) =>
    set({ selectedSkillCategory, highlightedSkill: null }),
  setHighlightedSkill: (highlightedSkill) => set({ highlightedSkill }),
  togglePanelHidden: () => set((state) => ({ panelHidden: !state.panelHidden })),
}));
