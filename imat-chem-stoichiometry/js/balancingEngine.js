(function (window) {
  window.ChemGames = window.ChemGames || {};

  const MAX_COEFFICIENT = 12;

  function cloneMolecule(molecule) {
    return {
      formula: molecule.formula,
      atoms: { ...molecule.atoms },
      coefficient: molecule.coefficient || 1
    };
  }

  function cloneReaction(reaction) {
    return {
      id: reaction.id,
      title: reaction.title,
      difficulty: reaction.difficulty,
      solution: {
        reactants: [...reaction.solution.reactants],
        products: [...reaction.solution.products]
      },
      reactants: reaction.reactants.map(cloneMolecule),
      products: reaction.products.map(cloneMolecule)
    };
  }

  function createPlayableReaction(reaction) {
    const playable = cloneReaction(reaction);
    playable.reactants.forEach((molecule) => {
      molecule.coefficient = 1;
    });
    playable.products.forEach((molecule) => {
      molecule.coefficient = 1;
    });
    return playable;
  }

  function getSideTotals(molecules) {
    return molecules.reduce((totals, molecule) => {
      Object.entries(molecule.atoms).forEach(([symbol, count]) => {
        totals[symbol] = (totals[symbol] || 0) + count * molecule.coefficient;
      });
      return totals;
    }, {});
  }

  function getAllElements(reaction) {
    const symbols = new Set();
    [...reaction.reactants, ...reaction.products].forEach((molecule) => {
      Object.keys(molecule.atoms).forEach((symbol) => symbols.add(symbol));
    });
    return [...symbols].sort();
  }

  function getReactionTotals(reaction) {
    return {
      reactants: getSideTotals(reaction.reactants),
      products: getSideTotals(reaction.products)
    };
  }

  function getElementBalanceStatus(reaction) {
    const totals = getReactionTotals(reaction);
    return getAllElements(reaction).reduce((status, symbol) => {
      const left = totals.reactants[symbol] || 0;
      const right = totals.products[symbol] || 0;
      status[symbol] = {
        left,
        right,
        balanced: left === right
      };
      return status;
    }, {});
  }

  function isReactionBalanced(reaction) {
    const status = getElementBalanceStatus(reaction);
    return Object.values(status).every((element) => element.balanced);
  }

  function updateCoefficient(reaction, side, moleculeIndex, direction) {
    const nextReaction = cloneReaction(reaction);
    const molecules = nextReaction[side];

    if (!molecules || !molecules[moleculeIndex]) {
      return nextReaction;
    }

    const delta = direction === "up" ? 1 : -1;
    const current = molecules[moleculeIndex].coefficient;
    molecules[moleculeIndex].coefficient = Math.min(
      MAX_COEFFICIENT,
      Math.max(1, current + delta)
    );

    return nextReaction;
  }

  function resetReaction(reaction) {
    return createPlayableReaction(reaction);
  }

  window.ChemGames.BalancingEngine = {
    MAX_COEFFICIENT,
    createPlayableReaction,
    cloneReaction,
    getSideTotals,
    getAllElements,
    getReactionTotals,
    getElementBalanceStatus,
    isReactionBalanced,
    updateCoefficient,
    resetReaction
  };
})(window);

