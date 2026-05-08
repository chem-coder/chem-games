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
    let showIntro = !progress.introSeen && getAttemptedCount(progress) === 0;
    let reviewMode = false;
    let solutionShown = false;

    if (showIntro) {
      currentIndex = 0;
      currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
    }

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

    function getReviewIndexes(currentProgress) {
      return reactions.reduce((indexes, reaction, index) => {
        const record = currentProgress.levels[reaction.id];
        if (record && record.status === "review") indexes.push(index);
        return indexes;
      }, []);
    }

    function getReviewCount(currentProgress) {
      return getReviewIndexes(currentProgress).length;
    }

    function getReviewPosition(currentProgress) {
      const reviewIndexes = getReviewIndexes(currentProgress);
      const position = reviewIndexes.indexOf(currentIndex);
      return position >= 0 ? position + 1 : 0;
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

    function getNextReviewIndex(currentProgress) {
      const reviewIndexes = getReviewIndexes(currentProgress);
      if (reviewIndexes.length === 0) return -1;

      const nextIndex = reviewIndexes.find((index) => index > currentIndex);
      return nextIndex === undefined ? reviewIndexes[0] : nextIndex;
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

    function loadReaction(index, shouldBeginReviewAttempt) {
      currentIndex = index;
      solutionShown = false;

      if (shouldBeginReviewAttempt) {
        storage.beginReviewAttempt(reactions[currentIndex].id);
        progress = storage.getProgress();
      }

      currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
      syncProgressIndex();
    }

    function syncProgressIndex() {
      storage.saveCurrentIndex(currentIndex);
      progress = storage.getProgress();
    }

    function render() {
      progress = storage.getProgress();
      if (showIntro) {
        renderer.render(root, {
          showIntro: true,
          totalLevels: reactions.length,
          maxScore: getMaxScore(),
          onStartIntro: handleStartIntro
        });
        return;
      }

      const isBalanced = engine.isReactionBalanced(currentReaction);
      const currentRecord = getLevelRecord(currentReaction.id);
      const hintsUsed = getCurrentHintsUsed();
      const reviewCount = getReviewCount(progress);
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
        reviewCount,
        reviewPosition: getReviewPosition(progress),
        hintsUsed,
        potentialScore: getPotentialScore(currentReaction, hintsUsed),
        currentBestScore: currentRecord.bestScore || 0,
        isReview: currentRecord.status === "review",
        isReviewMode: reviewMode,
        isSolutionShown: solutionShown,
        isBalanced,
        isComplete,
        primaryActionLabel: getPrimaryActionLabel(progress),
        primaryActionDisabled: solutionShown && reviewMode ? false : !isBalanced,
        onCoefficientChange: handleCoefficientChange,
        onPrimaryAction: solutionShown && reviewMode ? handleResetLevel : handleNextLevel,
        onResetLevel: handleResetLevel,
        onResetAll: handleResetAll,
        onShowHint: handleShowHint,
        onShowSolution: handleShowSolution,
        onSelectLevel: handleSelectLevel,
        onStartReviewMode: handleStartReviewMode,
        onExitReviewMode: handleExitReviewMode,
        onRestart: handleResetAll
      });
    }

    function getPrimaryActionLabel(currentProgress) {
      if (solutionShown && reviewMode) return "Try again";
      if (reviewMode) {
        return getReviewCount(currentProgress) <= 1 ? "Finish review" : "Next review";
      }
      return willCompleteSetAfterCurrent(currentProgress) ? "Finish" : "Next";
    }

    function handleStartIntro() {
      storage.markIntroSeen();
      showIntro = false;
      render();
    }

    function handleStartReviewMode() {
      progress = storage.getProgress();
      const reviewIndexes = getReviewIndexes(progress);
      if (reviewIndexes.length === 0) return;

      reviewMode = true;
      isComplete = false;
      loadReaction(reviewIndexes[0], true);
      render();
    }

    function handleExitReviewMode() {
      reviewMode = false;
      solutionShown = false;
      progress = storage.getProgress();
      isComplete = areAllLevelsAttempted(progress);
      render();
    }

    function handleCoefficientChange(side, moleculeIndex, direction) {
      currentReaction = engine.updateCoefficient(currentReaction, side, moleculeIndex, direction);
      render();
    }

    function handleNextLevel() {
      if (!engine.isReactionBalanced(currentReaction)) return;

      const hintsUsed = getCurrentHintsUsed();
      if (solutionShown) {
        storage.markReview(currentReaction.id, hintsUsed);
      } else {
        storage.markComplete(
          currentReaction.id,
          getPotentialScore(currentReaction, hintsUsed),
          hintsUsed
        );
      }
      progress = storage.getProgress();

      if (reviewMode) {
        const nextReviewIndex = getNextReviewIndex(progress);
        if (nextReviewIndex >= 0) {
          loadReaction(nextReviewIndex, true);
          render();
          return;
        }

        reviewMode = false;
        if (areAllLevelsAttempted(progress)) {
          isComplete = true;
          render();
          return;
        }

        currentIndex = getNextUnattemptedIndex(progress);
        solutionShown = false;
        currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
        syncProgressIndex();
        render();
        return;
      }

      if (areAllLevelsAttempted(progress)) {
        isComplete = true;
        render();
        return;
      }

      loadReaction(getNextUnattemptedIndex(progress), false);
      render();
    }

    function handleResetLevel() {
      storage.resetLevelAttempt(currentReaction.id);
      solutionShown = false;
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
      solutionShown = true;
      storage.markReview(currentReaction.id, hintsUsed);
      render();
    }

    function handleSelectLevel(index) {
      if (index < 0 || index >= reactions.length) return;
      progress = storage.getProgress();
      const record = progress.levels[reactions[index].id] || {};
      if (reviewMode && record.status !== "review") return;

      isComplete = false;
      loadReaction(index, record.status === "review");
      render();
    }

    function handleResetAll() {
      storage.resetProgress();
      progress = storage.getProgress();
      currentIndex = 0;
      isComplete = false;
      showIntro = true;
      reviewMode = false;
      solutionShown = false;
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
