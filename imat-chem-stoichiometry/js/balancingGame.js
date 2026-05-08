(function (window) {
  window.ChemGames = window.ChemGames || {};

  const ANY_FILTER = "all";
  const DEFAULT_SET_SIZE = 5;

  function createBalancingGame(options) {
    const root = options.root;
    const allReactions = options.reactions;
    const elementStyles = options.elementStyles;
    const engine = options.engine;
    const renderer = options.renderer;
    const storage = options.storage;
    const setSize = options.setSize || DEFAULT_SET_SIZE;

    let progress = storage.getProgress();
    let selectedDifficulty = progress.activeSet ? progress.activeSet.difficulty : ANY_FILTER;
    let selectedTopic = progress.activeSet ? progress.activeSet.topic : ANY_FILTER;
    let selectedQuestionCount = progress.activeSet
      ? progress.activeSet.reactionIds.length
      : getDefaultQuestionCount(selectedDifficulty, selectedTopic);
    let reactions = getStoredSetReactions(progress.activeSet);
    let showMenu = reactions.length === 0;
    let currentIndex = showMenu ? 0 : Math.min(progress.currentIndex, reactions.length - 1);
    let currentReaction = showMenu ? null : engine.createPlayableReaction(reactions[currentIndex]);
    let isComplete = !showMenu && areAllLevelsAttempted(progress);
    let reviewMode = false;
    let solutionShown = false;

    function getBaseScore(difficulty) {
      if (difficulty === 1) return 4;
      if (difficulty === 2) return 5;
      return 6;
    }

    function getDifficultyLabel(difficulty) {
      if (difficulty === 1) return "Easy";
      if (difficulty === 2) return "Medium";
      return "Hard";
    }

    function getMaxScore(reactionList) {
      return reactionList.reduce((total, reaction) => total + getBaseScore(reaction.difficulty), 0);
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
      return reactions.length > 0 && getAttemptedCount(currentProgress) === reactions.length;
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

    function getStoredSetReactions(activeSet) {
      if (!activeSet || !Array.isArray(activeSet.reactionIds)) return [];

      return activeSet.reactionIds
        .map((reactionId) => allReactions.find((reaction) => reaction.id === reactionId))
        .filter(Boolean);
    }

    function getNormalizedDifficulty(difficulty) {
      return difficulty === ANY_FILTER ? ANY_FILTER : Number(difficulty);
    }

    function matchesDifficulty(reaction, difficulty) {
      const normalizedDifficulty = getNormalizedDifficulty(difficulty);
      return normalizedDifficulty === ANY_FILTER || reaction.difficulty === normalizedDifficulty;
    }

    function matchesTopic(reaction, topic) {
      return topic === ANY_FILTER || (reaction.topics || []).includes(topic);
    }

    function getMatchingReactions(difficulty, topic) {
      return allReactions.filter((reaction) => (
        matchesDifficulty(reaction, difficulty) && matchesTopic(reaction, topic)
      ));
    }

    function getDefaultQuestionCount(difficulty, topic) {
      return Math.min(setSize, getMatchingReactions(difficulty, topic).length);
    }

    function getClampedQuestionCount(questionCount, maxCount) {
      if (maxCount <= 0) return 0;
      return Math.min(maxCount, Math.max(1, questionCount));
    }

    function getQuestionCountOptions(maxCount) {
      return Array.from({ length: maxCount }, (_, index) => {
        const count = index + 1;
        return {
          value: String(count),
          label: `${count} ${count === 1 ? "question" : "questions"}`
        };
      });
    }

    function getSetReactions(difficulty, topic, questionCount) {
      const matchingReactions = getMatchingReactions(difficulty, topic);
      return matchingReactions.slice(0, getClampedQuestionCount(questionCount, matchingReactions.length));
    }

    function getDifficultyOptions() {
      const difficulties = [1, 2, 3];
      return [
        {
          value: ANY_FILTER,
          label: "Any difficulty",
          count: getMatchingReactions(ANY_FILTER, selectedTopic).length
        },
        ...difficulties.map((difficulty) => ({
          value: String(difficulty),
          label: getDifficultyLabel(difficulty),
          count: getMatchingReactions(String(difficulty), selectedTopic).length
        }))
      ];
    }

    function getTopicOptions() {
      const topicCounts = new Map();
      allReactions
        .filter((reaction) => matchesDifficulty(reaction, selectedDifficulty))
        .forEach((reaction) => {
          (reaction.topics || []).forEach((topic) => {
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          });
        });

      const topicOptions = [...topicCounts.entries()]
        .map(([topic, count]) => ({ value: topic, count }))
        .sort((first, second) => first.value.localeCompare(second.value));

      return [
        {
          value: ANY_FILTER,
          label: "Any topic",
          count: getMatchingReactions(selectedDifficulty, ANY_FILTER).length
        },
        ...topicOptions
      ];
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

    function renderMenu() {
      const matchingReactions = getMatchingReactions(selectedDifficulty, selectedTopic);
      selectedQuestionCount = getClampedQuestionCount(selectedQuestionCount, matchingReactions.length);
      const setPreview = matchingReactions.slice(0, selectedQuestionCount);

      renderer.render(root, {
        showMenu: true,
        totalReactionCount: allReactions.length,
        setSize,
        selectedDifficulty,
        selectedTopic,
        selectedQuestionCount: String(selectedQuestionCount),
        difficultyOptions: getDifficultyOptions(),
        topicOptions: getTopicOptions(),
        questionCountOptions: getQuestionCountOptions(matchingReactions.length),
        matchingCount: matchingReactions.length,
        setCount: setPreview.length,
        setPreview,
        maxScore: getMaxScore(setPreview),
        onDifficultyChange: handleDifficultyChange,
        onTopicChange: handleTopicChange,
        onQuestionCountChange: handleQuestionCountChange,
        onStartSet: handleStartSet
      });
    }

    function render() {
      progress = storage.getProgress();
      if (showMenu) {
        renderMenu();
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
        maxScore: getMaxScore(reactions),
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
        onChooseSet: handleChooseSet,
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
      return willCompleteSetAfterCurrent(currentProgress) ? "Finish set" : "Next";
    }

    function handleDifficultyChange(difficulty) {
      selectedDifficulty = difficulty;
      if (
        selectedTopic !== ANY_FILTER &&
        getMatchingReactions(selectedDifficulty, selectedTopic).length === 0
      ) {
        selectedTopic = ANY_FILTER;
      }
      selectedQuestionCount = getDefaultQuestionCount(selectedDifficulty, selectedTopic);
      render();
    }

    function handleTopicChange(topic) {
      selectedTopic = topic;
      selectedQuestionCount = getDefaultQuestionCount(selectedDifficulty, selectedTopic);
      render();
    }

    function handleQuestionCountChange(questionCount) {
      const parsedCount = Number(questionCount);
      selectedQuestionCount = Number.isInteger(parsedCount) ? parsedCount : setSize;
      render();
    }

    function handleStartSet() {
      const selectedReactions = getSetReactions(
        selectedDifficulty,
        selectedTopic,
        selectedQuestionCount
      );
      if (selectedReactions.length === 0) return;

      reactions = selectedReactions;
      currentIndex = 0;
      currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
      isComplete = false;
      showMenu = false;
      reviewMode = false;
      solutionShown = false;

      storage.saveActiveSet({
        difficulty: selectedDifficulty,
        topic: selectedTopic,
        questionCount: reactions.length,
        reactionIds: reactions.map((reaction) => reaction.id)
      });
      syncProgressIndex();
      render();
    }

    function handleChooseSet() {
      storage.clearActiveSet();
      progress = storage.getProgress();
      showMenu = true;
      isComplete = false;
      reviewMode = false;
      solutionShown = false;
      reactions = [];
      currentIndex = 0;
      currentReaction = null;
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
      selectedDifficulty = ANY_FILTER;
      selectedTopic = ANY_FILTER;
      selectedQuestionCount = getDefaultQuestionCount(selectedDifficulty, selectedTopic);
      reactions = [];
      currentIndex = 0;
      isComplete = false;
      showMenu = true;
      reviewMode = false;
      solutionShown = false;
      currentReaction = null;
      render();
    }

    function start() {
      if (!showMenu) syncProgressIndex();
      render();
    }

    return {
      start
    };
  }

  window.ChemGames.createBalancingGame = createBalancingGame;
})(window);
