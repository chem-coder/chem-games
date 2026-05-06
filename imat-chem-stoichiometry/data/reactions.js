(function (window) {
  window.ChemGames = window.ChemGames || {};

  window.ChemGames.reactions = [
    {
      id: "hydrogen_combustion",
      title: "Hydrogen combustion",
      difficulty: 1,
      hints: [
        "Hydrogen appears in pairs on both sides.",
        "Water has only one oxygen atom, but oxygen gas has two.",
        "Try making two water molecules first, then rebalance hydrogen."
      ],
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
      hints: [
        "Carbon is already balanced at the start.",
        "Balance hydrogen by changing water.",
        "After carbon and hydrogen are balanced, count oxygen last."
      ],
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
      hints: [
        "Nitrogen starts as N2, so the product side needs two nitrogen atoms.",
        "Two ammonia molecules contain six hydrogen atoms.",
        "Use hydrogen gas to supply hydrogen in pairs."
      ],
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
      id: "sodium_chloride",
      title: "Sodium chloride formation",
      difficulty: 1,
      hints: [
        "Chlorine gas is diatomic: Cl2.",
        "Each sodium chloride unit has one chlorine atom.",
        "Make two NaCl units, then match sodium."
      ],
      reactants: [
        { formula: "Na", atoms: { Na: 1 }, coefficient: 1 },
        { formula: "Cl2", atoms: { Cl: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "NaCl", atoms: { Na: 1, Cl: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [2]
      }
    },
    {
      id: "magnesium_oxide",
      title: "Magnesium oxide formation",
      difficulty: 1,
      hints: [
        "Oxygen gas supplies oxygen atoms in pairs.",
        "Each MgO unit has one oxygen atom.",
        "Two MgO units require two magnesium atoms."
      ],
      reactants: [
        { formula: "Mg", atoms: { Mg: 1 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "MgO", atoms: { Mg: 1, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [2]
      }
    },
    {
      id: "aluminum_oxide",
      title: "Aluminum oxide formation",
      difficulty: 2,
      hints: [
        "Al2O3 has two aluminum atoms and three oxygen atoms.",
        "Oxygen gas comes in pairs, so oxygen needs a common multiple of 2 and 3.",
        "Try two Al2O3 units, then count aluminum."
      ],
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
      hints: [
        "Fe2O3 has the same 2-to-3 metal-to-oxygen pattern as Al2O3.",
        "Balance oxygen using a common multiple of 2 and 3.",
        "Once oxygen is balanced, count iron atoms."
      ],
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
    },
    {
      id: "potassium_chlorate_decomposition",
      title: "Potassium chlorate decomposition",
      difficulty: 2,
      hints: [
        "Keep K and Cl together by comparing KClO3 with KCl.",
        "Oxygen is the tricky element because O3 becomes O2.",
        "Use a common multiple of 3 and 2 for oxygen."
      ],
      reactants: [
        { formula: "KClO3", atoms: { K: 1, Cl: 1, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "KCl", atoms: { K: 1, Cl: 1 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2],
        products: [2, 3]
      }
    },
    {
      id: "ethane_combustion",
      title: "Ethane combustion",
      difficulty: 2,
      hints: [
        "Start with carbon: each ethane has two carbon atoms.",
        "Balance hydrogen by changing water.",
        "If oxygen ends up odd, double the hydrocarbon first."
      ],
      reactants: [
        { formula: "C2H6", atoms: { C: 2, H: 6 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 7],
        products: [4, 6]
      }
    },
    {
      id: "calcium_hydroxide_hydrochloric_acid",
      title: "Calcium hydroxide and hydrochloric acid",
      difficulty: 2,
      hints: [
        "Calcium appears once on each side.",
        "There are two hydroxide groups in Ca(OH)2, so expect two water molecules.",
        "Two chloride ions are needed for CaCl2."
      ],
      reactants: [
        { formula: "Ca(OH)2", atoms: { Ca: 1, O: 2, H: 2 }, coefficient: 1 },
        { formula: "HCl", atoms: { H: 1, Cl: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "CaCl2", atoms: { Ca: 1, Cl: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 2],
        products: [1, 2]
      }
    },
    {
      id: "propane_combustion",
      title: "Propane combustion",
      difficulty: 3,
      hints: [
        "For hydrocarbons, balance carbon first and hydrogen second.",
        "Three carbons make three CO2 molecules.",
        "Eight hydrogens make four H2O molecules."
      ],
      reactants: [
        { formula: "C3H8", atoms: { C: 3, H: 8 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 5],
        products: [3, 4]
      }
    },
    {
      id: "aluminum_hydrochloric_acid",
      title: "Aluminum and hydrochloric acid",
      difficulty: 3,
      hints: [
        "AlCl3 contains three chlorine atoms.",
        "Hydrogen leaves as H2, so hydrogen must be even.",
        "Try two AlCl3 units to make chlorine and hydrogen easier."
      ],
      reactants: [
        { formula: "Al", atoms: { Al: 1 }, coefficient: 1 },
        { formula: "HCl", atoms: { H: 1, Cl: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "AlCl3", atoms: { Al: 1, Cl: 3 }, coefficient: 1 },
        { formula: "H2", atoms: { H: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 6],
        products: [2, 3]
      }
    },
    {
      id: "iron_oxide_reduction",
      title: "Iron(III) oxide reduction",
      difficulty: 3,
      hints: [
        "Fe2O3 already contains two iron atoms.",
        "Carbon monoxide becomes carbon dioxide.",
        "Each CO can carry one oxygen atom away from the iron oxide."
      ],
      reactants: [
        { formula: "Fe2O3", atoms: { Fe: 2, O: 3 }, coefficient: 1 },
        { formula: "CO", atoms: { C: 1, O: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Fe", atoms: { Fe: 1 }, coefficient: 1 },
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3],
        products: [2, 3]
      }
    },
    {
      id: "sulfuric_acid_sodium_hydroxide",
      title: "Sulfuric acid and sodium hydroxide",
      difficulty: 3,
      hints: [
        "Sulfate stays together as SO4.",
        "Na2SO4 needs two sodium atoms.",
        "After sodium is balanced, count hydrogen and oxygen through water."
      ],
      reactants: [
        { formula: "H2SO4", atoms: { H: 2, S: 1, O: 4 }, coefficient: 1 },
        { formula: "NaOH", atoms: { Na: 1, O: 1, H: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Na2SO4", atoms: { Na: 2, S: 1, O: 4 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 2],
        products: [1, 2]
      }
    },
    {
      id: "phosphorus_oxide",
      title: "Phosphorus(V) oxide formation",
      difficulty: 3,
      hints: [
        "P4 contains four phosphorus atoms.",
        "Each P2O5 unit contains two phosphorus atoms.",
        "After phosphorus is balanced, oxygen becomes a multiple of five."
      ],
      reactants: [
        { formula: "P4", atoms: { P: 4 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "P2O5", atoms: { P: 2, O: 5 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 5],
        products: [2]
      }
    }
  ];
})(window);
