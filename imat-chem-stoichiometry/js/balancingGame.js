(function (window) {
  window.ChemGames = window.ChemGames || {};

  function createBalancingGame(options) {
    const root = options.root;
    const reactions = options.reactions;
    const elementStyles = options.elementStyles;
    const engine = options.engine;
    const renderer = options.renderer;
    const storage = options.storage;

    let progress = storage.getProgress();
    let currentIndex = Math.min(progress.currentIndex, reactions.length - 1);
    let currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
    let isComplete = areAllLevelsAttempted(progress);

    function getBaseScore(difficulty) {
      if (difficulty === 1) return 4;
      if (difficulty === 2) return 5;
      return 6;
    }

    function getMaxScore() {
      return reactions.reduce((total, reaction) => total + getBaseScore(reaction.difficulty), 0);
    }

    function getTotalScore(currentProgress) {
      return reactions.reduce((total, reaction) => {
        const record = currentProgress.levels[reaction.id];
        return total + (record ? record.bestScore || 0 : 0);
      }, 0);
    }

    function getAttemptedCount(currentProgress) {
      return reactions.filter((reaction) => {
        const record = currentProgress.levels[reaction.id];
        return record && (record.status === "completed" || record.status === "review");
      }).length;
    }

    function areAllLevelsAttempted(currentProgress) {
      return getAttemptedCount(currentProgress) === reactions.length;
    }

    function willCompleteSetAfterCurrent(currentProgress) {
      return reactions.every((reaction) => {
        if (reaction.id === currentReaction.id) return true;
        return isAttempted(reaction, currentProgress);
      });
    }

    function isAttempted(reaction, currentProgress) {
      const record = currentProgress.levels[reaction.id];
      return record && (record.status === "completed" || record.status === "review");
    }

    function getNextUnattemptedIndex(currentProgress) {
      for (let index = currentIndex + 1; index < reactions.length; index += 1) {
        if (!isAttempted(reactions[index], currentProgress)) return index;
      }

      for (let index = 0; index <= currentIndex; index += 1) {
        if (!isAttempted(reactions[index], currentProgress)) return index;
      }

      return currentIndex;
    }

    function getLevelRecord(reactionId) {
      return progress.levels[reactionId] || { status: "pending", bestScore: 0, hintsUsed: 0 };
    }

    function getCurrentHintsUsed() {
      return getLevelRecord(currentReaction.id).hintsUsed || 0;
    }

    function getPotentialScore(reaction, hintsUsed) {
      return Math.max(1, getBaseScore(reaction.difficulty) - hintsUsed);
    }

    function createSolvedReaction(reaction) {
      const solved = engine.createPlayableReaction(reaction);
      solved.reactants.forEach((molecule, index) => {
        molecule.coefficient = reaction.solution.reactants[index];
      });
      solved.products.forEach((molecule, index) => {
        molecule.coefficient = reaction.solution.products[index];
      });
      return solved;
    }

    function syncProgressIndex() {
      storage.saveCurrentIndex(currentIndex);
      progress = storage.getProgress();
    }

    function render() {
      progress = storage.getProgress();
      const isBalanced = engine.isReactionBalanced(currentReaction);
      const currentRecord = getLevelRecord(currentReaction.id);
      const hintsUsed = getCurrentHintsUsed();
      renderer.render(root, {
        reaction: currentReaction,
        reactions,
        balanceStatus: engine.getElementBalanceStatus(currentReaction),
        elementStyles,
        levelRecords: progress.levels,
        currentIndex,
        totalLevels: reactions.length,
        attemptedCount: getAttemptedCount(progress),
        totalScore: getTotalScore(progress),
        maxScore: getMaxScore(),
        hintsUsed,
        potentialScore: getPotentialScore(currentReaction, hintsUsed),
        currentBestScore: currentRecord.bestScore || 0,
        isReview: currentRecord.status === "review",
        isBalanced,
        isComplete,
        willCompleteSet: willCompleteSetAfterCurrent(progress),
        onCoefficientChange: handleCoefficientChange,
        onNextLevel: handleNextLevel,
        onResetLevel: handleResetLevel,
        onResetAll: handleResetAll,
        onShowHint: handleShowHint,
        onShowSolution: handleShowSolution,
        onSelectLevel: handleSelectLevel,
        onRestart: handleResetAll
      });
    }

    function handleCoefficientChange(side, moleculeIndex, direction) {
      currentReaction = engine.updateCoefficient(currentReaction, side, moleculeIndex, direction);
      render();
    }

    function handleNextLevel() {
      if (!engine.isReactionBalanced(currentReaction)) return;

      const record = getLevelRecord(currentReaction.id);
      if (record.status !== "review") {
        const hintsUsed = getCurrentHintsUsed();
        storage.markComplete(
          currentReaction.id,
          getPotentialScore(currentReaction, hintsUsed),
          hintsUsed
        );
      }
      progress = storage.getProgress();

      if (areAllLevelsAttempted(progress)) {
        isComplete = true;
        render();
        return;
      }

      currentIndex = getNextUnattemptedIndex(progress);
      currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
      syncProgressIndex();
      render();
    }

    function handleResetLevel() {
      storage.resetLevelAttempt(currentReaction.id);
      currentReaction = engine.resetReaction(reactions[currentIndex]);
      render();
    }

    function handleShowHint() {
      const hints = currentReaction.hints || [];
      const hintsUsed = getCurrentHintsUsed();
      if (hintsUsed >= hints.length) return;

      storage.saveHintsUsed(currentReaction.id, hintsUsed + 1);
      render();
    }

    function handleShowSolution() {
      const hintsUsed = getCurrentHintsUsed();
      currentReaction = createSolvedReaction(reactions[currentIndex]);
      storage.markReview(currentReaction.id, hintsUsed);
      render();
    }

    function handleSelectLevel(index) {
      if (index < 0 || index >= reactions.length) return;
      currentIndex = index;
      isComplete = false;
      currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
      syncProgressIndex();
      render();
    }

    function handleResetAll() {
      storage.resetProgress();
      progress = storage.getProgress();
      currentIndex = 0;
      isComplete = false;
      currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
      render();
    }

    function start() {
      syncProgressIndex();
      render();
    }

    return {
      start
    };
  }

  window.ChemGames.createBalancingGame = createBalancingGame;
})(window);
