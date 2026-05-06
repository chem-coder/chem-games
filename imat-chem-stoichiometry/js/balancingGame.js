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
    let isComplete = progress.completedIds.length === reactions.length;

    function syncProgressIndex() {
      storage.saveCurrentIndex(currentIndex);
      progress = storage.getProgress();
    }

    function render() {
      progress = storage.getProgress();
      const isBalanced = engine.isReactionBalanced(currentReaction);
      renderer.render(root, {
        reaction: currentReaction,
        balanceStatus: engine.getElementBalanceStatus(currentReaction),
        elementStyles,
        currentIndex,
        totalLevels: reactions.length,
        completedIds: progress.completedIds,
        isBalanced,
        isComplete,
        isLastLevel: currentIndex === reactions.length - 1,
        onCoefficientChange: handleCoefficientChange,
        onNextLevel: handleNextLevel,
        onResetLevel: handleResetLevel,
        onResetAll: handleResetAll,
        onRestart: handleResetAll
      });
    }

    function handleCoefficientChange(side, moleculeIndex, direction) {
      currentReaction = engine.updateCoefficient(currentReaction, side, moleculeIndex, direction);
      render();
    }

    function handleNextLevel() {
      if (!engine.isReactionBalanced(currentReaction)) return;

      storage.markComplete(currentReaction.id);
      progress = storage.getProgress();

      if (currentIndex >= reactions.length - 1) {
        isComplete = true;
        render();
        return;
      }

      currentIndex += 1;
      currentReaction = engine.createPlayableReaction(reactions[currentIndex]);
      syncProgressIndex();
      render();
    }

    function handleResetLevel() {
      currentReaction = engine.resetReaction(reactions[currentIndex]);
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

