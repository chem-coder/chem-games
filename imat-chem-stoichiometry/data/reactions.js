(function (window) {
  window.ChemGames = window.ChemGames || {};

  window.ChemGames.reactions = [
    {
      id: "hydrogen_combustion",
      title: "Hydrogen combustion",
      difficulty: 1,
      reactants: [
        { formula: "H2", atoms: { H: 2 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [2]
      }
    },
    {
      id: "methane_combustion",
      title: "Methane combustion",
      difficulty: 1,
      reactants: [
        { formula: "CH4", atoms: { C: 1, H: 4 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 2],
        products: [1, 2]
      }
    },
    {
      id: "ammonia_synthesis",
      title: "Ammonia synthesis",
      difficulty: 1,
      reactants: [
        { formula: "N2", atoms: { N: 2 }, coefficient: 1 },
        { formula: "H2", atoms: { H: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "NH3", atoms: { N: 1, H: 3 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3],
        products: [2]
      }
    },
    {
      id: "aluminum_oxide",
      title: "Aluminum oxide formation",
      difficulty: 2,
      reactants: [
        { formula: "Al", atoms: { Al: 1 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al2O3", atoms: { Al: 2, O: 3 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 3],
        products: [2]
      }
    },
    {
      id: "iron_oxide",
      title: "Iron(III) oxide formation",
      difficulty: 2,
      reactants: [
        { formula: "Fe", atoms: { Fe: 1 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Fe2O3", atoms: { Fe: 2, O: 3 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 3],
        products: [2]
      }
    }
  ];
})(window);

