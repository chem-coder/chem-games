(function (window) {
  const root = document.getElementById("app");
  const game = window.ChemGames.createBalancingGame({
    root,
    reactions: window.ChemGames.reactions,
    elementStyles: window.ChemGames.elementStyles,
    engine: window.ChemGames.BalancingEngine,
    renderer: window.ChemGames.BalancingRenderer,
    storage: window.ChemGames.ProgressStorage
  });

  game.start();
})(window);

