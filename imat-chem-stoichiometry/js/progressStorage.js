(function (window) {
  window.ChemGames = window.ChemGames || {};

  const STORAGE_KEY = "chem-games:imat-stoichiometry-balancer";
  const EMPTY_STATE = { currentIndex: 0, levels: {}, introSeen: false, activeSet: null };

  function normalizeActiveSet(activeSet) {
    if (!activeSet || !Array.isArray(activeSet.reactionIds)) return null;

    return {
      difficulty: typeof activeSet.difficulty === "string" ? activeSet.difficulty : "all",
      topic: typeof activeSet.topic === "string" ? activeSet.topic : "all",
      questionCount: Number.isInteger(activeSet.questionCount)
        ? activeSet.questionCount
        : activeSet.reactionIds.length,
      reactionIds: activeSet.reactionIds.filter((reactionId) => typeof reactionId === "string")
    };
  }

  function readState() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { ...EMPTY_STATE };
    } catch (error) {
      return { ...EMPTY_STATE };
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
    const levels = state.levels && typeof state.levels === "object" ? state.levels : {};

    if (Array.isArray(state.completedIds)) {
      state.completedIds.forEach((reactionId) => {
        levels[reactionId] = levels[reactionId] || {
          status: "completed",
          bestScore: 0,
          hintsUsed: 0
        };
      });
    }

    return {
      currentIndex: Number.isInteger(state.currentIndex) ? state.currentIndex : 0,
      levels,
      introSeen: state.introSeen === true,
      activeSet: normalizeActiveSet(state.activeSet)
    };
  }

  function markIntroSeen() {
    const state = getProgress();
    state.introSeen = true;
    writeState(state);
  }

  function saveCurrentIndex(currentIndex) {
    const state = getProgress();
    state.currentIndex = currentIndex;
    writeState(state);
  }

  function saveActiveSet(activeSet) {
    const state = getProgress();
    state.activeSet = normalizeActiveSet(activeSet);
    state.currentIndex = 0;
    state.introSeen = true;
    writeState(state);
  }

  function clearActiveSet() {
    const state = getProgress();
    state.activeSet = null;
    state.currentIndex = 0;
    writeState(state);
  }

  function saveHintsUsed(reactionId, hintsUsed) {
    const state = getProgress();
    const previous = state.levels[reactionId] || {};
    state.levels[reactionId] = {
      status: previous.status || "pending",
      bestScore: previous.bestScore || 0,
      hintsUsed
    };
    writeState(state);
  }

  function beginReviewAttempt(reactionId) {
    const state = getProgress();
    const previous = state.levels[reactionId] || {};
    state.levels[reactionId] = {
      status: "review",
      bestScore: previous.bestScore || 0,
      hintsUsed: 0
    };
    writeState(state);
  }

  function markComplete(reactionId, score, hintsUsed) {
    const state = getProgress();
    const previous = state.levels[reactionId] || {};
    state.levels[reactionId] = {
      status: "completed",
      bestScore: Math.max(previous.bestScore || 0, score),
      hintsUsed
    };
    writeState(state);
  }

  function markReview(reactionId, hintsUsed) {
    const state = getProgress();
    const previous = state.levels[reactionId] || {};
    state.levels[reactionId] = {
      status: previous.status === "completed" ? "completed" : "review",
      bestScore: previous.bestScore || 0,
      hintsUsed
    };
    writeState(state);
  }

  function resetLevelAttempt(reactionId) {
    const state = getProgress();
    const previous = state.levels[reactionId] || {};
    state.levels[reactionId] = {
      status: previous.status === "review"
        ? "review"
        : previous.bestScore > 0
          ? "completed"
          : "pending",
      bestScore: previous.bestScore || 0,
      hintsUsed: 0
    };
    writeState(state);
  }

  function resetProgress() {
    writeState({ ...EMPTY_STATE });
  }

  window.ChemGames.ProgressStorage = {
    getProgress,
    saveCurrentIndex,
    saveActiveSet,
    clearActiveSet,
    markIntroSeen,
    saveHintsUsed,
    beginReviewAttempt,
    markComplete,
    markReview,
    resetLevelAttempt,
    resetProgress
  };
})(window);
