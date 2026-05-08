(function (window) {
  window.ChemGames = window.ChemGames || {};

  window.ChemGames.reactions = [
    {
      id: "hydrogen_combustion",
      title: "Hydrogen combustion",
      difficulty: 1,
      topics: ["combustion", "synthesis", "redox"],
      hints: [
        "Leave H2 for last; it only changes hydrogen.",
        "Start with water: one H2O has only one O atom, but O2 has two O atoms.",
        "In the final balanced equation, H2O should have coefficient 2."
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
      topics: ["combustion", "hydrocarbon", "redox"],
      hints: [
        "In combustion, leave O2 for last because it only changes oxygen.",
        "Start with carbon and hydrogen: carbon is already matched, but CH4 has hydrogen that must become water.",
        "In the final balanced equation, H2O should have coefficient 2."
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
      topics: ["synthesis", "redox"],
      hints: [
        "Leave H2 for last; it only changes hydrogen.",
        "Start with nitrogen: N2 has two N atoms, but one NH3 has only one N atom.",
        "In the final balanced equation, NH3 should have coefficient 2."
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
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Na for last because it is monoatomic.",
        "Start with chlorine: Cl2 has two Cl atoms, but one NaCl has only one Cl atom.",
        "In the final balanced equation, NaCl should have coefficient 2."
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
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Mg for last because it is monoatomic.",
        "Start with oxygen: O2 has two O atoms, but one MgO has only one O atom.",
        "In the final balanced equation, MgO should have coefficient 2."
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
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Al for last because it is monoatomic.",
        "Start with oxygen: Al2O3 has oxygen in groups of three, but O2 supplies oxygen in pairs.",
        "In the final balanced equation, Al2O3 should have coefficient 2."
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
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Fe for last because it is monoatomic.",
        "Start with oxygen: Fe2O3 has oxygen in groups of three, but O2 supplies oxygen in pairs.",
        "In the final balanced equation, Fe2O3 should have coefficient 2."
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
      topics: ["decomposition", "gas-formation", "redox"],
      hints: [
        "Keep K and Cl together; they appear as KClO3 on the left and KCl on the right.",
        "The hard part is oxygen: KClO3 has oxygen in groups of three, but O2 has oxygen in pairs.",
        "In the final balanced equation, O2 should have coefficient 3."
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
      topics: ["combustion", "hydrocarbon", "redox"],
      hints: [
        "In combustion, leave O2 for last because it only changes oxygen.",
        "Start with carbon and hydrogen; if oxygen comes out odd, scale the hydrocarbon pattern before setting O2.",
        "In the final balanced equation, O2 should have coefficient 7."
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
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Do not start with water. Start with the ions/groups that stay recognizable.",
        "Use CaCl2 to think about chloride, and use the two OH groups to think about water.",
        "In the final balanced equation, HCl should have coefficient 2."
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
      topics: ["combustion", "hydrocarbon", "redox"],
      hints: [
        "In combustion, leave O2 for last because it only changes oxygen.",
        "Start with carbon and hydrogen; once those are fixed, count oxygen on the product side.",
        "In the final balanced equation, O2 should have coefficient 5."
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
      topics: ["single-replacement", "acid-metal", "gas-formation", "redox"],
      hints: [
        "Leave Al for last because it is monoatomic.",
        "Start with chlorine and hydrogen together: AlCl3 needs Cl in groups of three, but H2 needs H in pairs.",
        "In the final balanced equation, HCl should have coefficient 6."
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
      topics: ["redox", "reduction", "oxide-reduction"],
      hints: [
        "Do not start with Fe. Fe is monoatomic, so leave it for the final cleanup.",
        "Balance carbon first: CO and CO2 each contain one C atom, so their coefficients should match.",
        "In the final balanced equation, CO should have coefficient 3."
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
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep sulfate together: SO4 appears intact in H2SO4 and Na2SO4.",
        "Use sodium to set NaOH, then leave water for last.",
        "In the final balanced equation, NaOH should have coefficient 2."
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
      topics: ["synthesis", "nonmetal-oxidation", "redox"],
      hints: [
        "Leave O2 for last because it only changes oxygen.",
        "Start with phosphorus: P4 has four P atoms, but P2O5 has phosphorus in pairs.",
        "In the final balanced equation, O2 should have coefficient 5."
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
