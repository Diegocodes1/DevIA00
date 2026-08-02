(function () {
  const STORAGE_KEY = 'devmentor-progress-state';
  const DEFAULT_STATE = {
    progress: 42,
    hoursStudied: 12,
    projectsCompleted: 2,
    streakDays: 4
  };

  function readState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : { ...DEFAULT_STATE };
    } catch (error) {
      return { ...DEFAULT_STATE };
    }
  }

  function writeState(nextState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new CustomEvent('devmentor:progress-updated', { detail: nextState }));
  }

  function updateProgress(delta) {
    const state = readState();
    const nextState = {
      ...state,
      progress: Math.min(100, Math.max(0, state.progress + delta.progress)),
      hoursStudied: Number((state.hoursStudied + delta.hours).toFixed(1)),
      projectsCompleted: Math.max(0, state.projectsCompleted + delta.projects),
      streakDays: Math.max(1, state.streakDays + delta.streak)
    };
    writeState(nextState);
    return nextState;
  }

  function loadState() {
    return readState();
  }

  function getState() {
    return readState();
  }

  window.devmentorProgress = {
    loadState,
    getState,
    updateProgress,
    writeState
  };
})();
