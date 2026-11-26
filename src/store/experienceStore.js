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

const CHAPTER_IDS = ['profile', 'story', 'education'];

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

  // Ancient Library giant interactive book state
  libraryBookOpen: false,
  libraryChapterIndex: 0, // 0: profile, 1: story, 2: education
  libraryTurningDir: 0, // -1: prev page, 0: idle, 1: next page
  libraryTurnNonce: 0,
  activeLibraryChapter: CHAPTER_IDS[0],

  // World-specific interactive state
  selectedSkillCategory: 'all',
  highlightedSkill: null,
  selectedAchievementId: null,
  achievementFilter: 'all',
  hoveredContactChannel: null,
  panelHidden: false,

  navigateTo: (scene, projectId = null) =>
    set({
      activeScene: scene,
      activeProjectId: projectId,
      hoveredPortal: null,
      panelHidden: false,
      highlightedSkill: null,
      selectedAchievementId: null,
      hoveredContactChannel: null,
      libraryBookOpen: false,
      libraryChapterIndex: 0,
      libraryTurningDir: 0,
      activeLibraryChapter: CHAPTER_IDS[0],
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
      selectedAchievementId: null,
      hoveredContactChannel: null,
      libraryBookOpen: false,
      libraryChapterIndex: 0,
      libraryTurningDir: 0,
      activeLibraryChapter: CHAPTER_IDS[0],
    }),

  returnToGateway: () =>
    set({
      activeScene: SCENES.GATEWAY,
      activeProjectId: null,
      hoveredPortal: null,
      panelHidden: false,
      libraryBookOpen: false,
      libraryChapterIndex: 0,
      libraryTurningDir: 0,
      activeLibraryChapter: CHAPTER_IDS[0],
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

  // Ancient Library Giant Book actions
  openLibraryBook: () => set({ libraryBookOpen: true }),
  closeLibraryBook: () =>
    set({ libraryBookOpen: false, libraryTurningDir: 0 }),
  toggleLibraryBook: () =>
    set((state) => ({
      libraryBookOpen: !state.libraryBookOpen,
      libraryTurningDir: 0,
    })),
  setLibraryChapterIndex: (nextIndex) =>
    set((state) => {
      const clamped = Math.max(0, Math.min(CHAPTER_IDS.length - 1, nextIndex));
      if (!state.libraryBookOpen) {
        return {
          libraryBookOpen: true,
          libraryChapterIndex: clamped,
          activeLibraryChapter: CHAPTER_IDS[clamped],
          libraryTurningDir: 0,
        };
      }
      if (clamped === state.libraryChapterIndex) {
        return state;
      }
      return {
        libraryBookOpen: true,
        libraryChapterIndex: clamped,
        activeLibraryChapter: CHAPTER_IDS[clamped],
        libraryTurningDir: clamped > state.libraryChapterIndex ? 1 : -1,
        libraryTurnNonce: state.libraryTurnNonce + 1,
      };
    }),
  stepLibraryChapter: (delta) =>
    set((state) => {
      const next = state.libraryChapterIndex + delta;
      if (next < 0 || next >= CHAPTER_IDS.length) return state;
      return {
        libraryBookOpen: true,
        libraryChapterIndex: next,
        activeLibraryChapter: CHAPTER_IDS[next],
        libraryTurningDir: delta >= 0 ? 1 : -1,
        libraryTurnNonce: state.libraryTurnNonce + 1,
      };
    }),
  clearLibraryTurning: () => set({ libraryTurningDir: 0 }),

  // Backwards-compatible helpers
  setActiveLibraryChapter: (chapterId) =>
    set((state) => {
      const idx = CHAPTER_IDS.indexOf(chapterId);
      const target = idx >= 0 ? idx : 0;
      const dir =
        state.libraryBookOpen && target !== state.libraryChapterIndex
          ? target > state.libraryChapterIndex
            ? 1
            : -1
          : 0;
      return {
        libraryBookOpen: true,
        libraryChapterIndex: target,
        activeLibraryChapter: CHAPTER_IDS[target],
        libraryTurningDir: dir,
        libraryTurnNonce: dir !== 0 ? state.libraryTurnNonce + 1 : state.libraryTurnNonce,
      };
    }),
  toggleLibraryChapter: () =>
    set((state) => {
      const next = (state.libraryChapterIndex + 1) % CHAPTER_IDS.length;
      return {
        libraryBookOpen: true,
        libraryChapterIndex: next,
        activeLibraryChapter: CHAPTER_IDS[next],
        libraryTurningDir: 1,
        libraryTurnNonce: state.libraryTurnNonce + 1,
      };
    }),

  setSelectedSkillCategory: (selectedSkillCategory) =>
    set({ selectedSkillCategory, highlightedSkill: null }),
  setHighlightedSkill: (highlightedSkill) => set({ highlightedSkill }),
  setSelectedAchievementId: (selectedAchievementId) =>
    set({ selectedAchievementId }),
  setAchievementFilter: (achievementFilter) =>
    set({ achievementFilter, selectedAchievementId: null }),
  setHoveredContactChannel: (hoveredContactChannel) =>
    set({ hoveredContactChannel }),
  togglePanelHidden: () => set((state) => ({ panelHidden: !state.panelHidden })),
}));
