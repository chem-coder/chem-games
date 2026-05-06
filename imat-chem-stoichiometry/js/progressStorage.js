(function (window) {
  window.ChemGames = window.ChemGames || {};

  const STORAGE_KEY = "chem-games:imat-stoichiometry-balancer";

  function readState() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { currentIndex: 0, completedIds: [] };
    } catch (error) {
      return { currentIndex: 0, completedIds: [] };
    }
  }

  function writeState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      return false;
    }
    return true;
  }

  function getProgress() {
    const state = readState();
    return {
      currentIndex: Number.isInteger(state.currentIndex) ? state.currentIndex : 0,
      completedIds: Array.isArray(state.completedIds) ? state.completedIds : []
    };
  }

  function saveCurrentIndex(currentIndex) {
    const state = getProgress();
    state.currentIndex = currentIndex;
    writeState(state);
  }

  function markComplete(reactionId) {
    const state = getProgress();
    if (!state.completedIds.includes(reactionId)) {
      state.completedIds.push(reactionId);
    }
    writeState(state);
  }

  function resetProgress() {
    writeState({ currentIndex: 0, completedIds: [] });
  }

  window.ChemGames.ProgressStorage = {
    getProgress,
    saveCurrentIndex,
    markComplete,
    resetProgress
  };
})(window);

