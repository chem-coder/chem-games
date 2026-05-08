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
    },
    {
      id: "phosphoric_acid_potassium_hydroxide",
      title: "Phosphoric acid and potassium hydroxide",
      difficulty: 2,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep phosphate together: PO4 appears intact in H3PO4 and K3PO4.",
        "Start with potassium: K3PO4 needs three K atoms, so KOH must scale to match it.",
        "In the final balanced equation, KOH should have coefficient 3."
      ],
      reactants: [
        { formula: "H3PO4", atoms: { H: 3, P: 1, O: 4 }, coefficient: 1 },
        { formula: "KOH", atoms: { K: 1, O: 1, H: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "K3PO4", atoms: { K: 3, P: 1, O: 4 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3],
        products: [1, 3]
      }
    },
    {
      id: "potassium_boron_oxide",
      title: "Potassium and boron oxide",
      difficulty: 2,
      topics: ["single-replacement", "oxide-reduction", "redox"],
      hints: [
        "Leave K for last because it is monoatomic.",
        "Start with oxygen: B2O3 has three O atoms, and each K2O has one O atom.",
        "In the final balanced equation, K2O should have coefficient 3."
      ],
      reactants: [
        { formula: "K", atoms: { K: 1 }, coefficient: 1 },
        { formula: "B2O3", atoms: { B: 2, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "K2O", atoms: { K: 2, O: 1 }, coefficient: 1 },
        { formula: "B", atoms: { B: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [6, 1],
        products: [3, 2]
      }
    },
    {
      id: "hydrochloric_acid_sodium_hydroxide",
      title: "Hydrochloric acid and sodium hydroxide",
      difficulty: 1,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "This is a one-to-one strong acid and strong base neutralization.",
        "Na and Cl already match; then H and O form one water molecule.",
        "In the final balanced equation, H2O should have coefficient 1."
      ],
      reactants: [
        { formula: "HCl", atoms: { H: 1, Cl: 1 }, coefficient: 1 },
        { formula: "NaOH", atoms: { Na: 1, O: 1, H: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "NaCl", atoms: { Na: 1, Cl: 1 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 1],
        products: [1, 1]
      }
    },
    {
      id: "sodium_sodium_nitrate",
      title: "Sodium and sodium nitrate",
      difficulty: 3,
      topics: ["redox", "metal-oxidation", "gas-formation"],
      hints: [
        "Leave Na for last because it appears as a monoatomic metal and inside both sodium compounds.",
        "Start with nitrogen: N2 needs an even number of N atoms, so NaNO3 should become even.",
        "In the final balanced equation, NaNO3 should have coefficient 2."
      ],
      reactants: [
        { formula: "Na", atoms: { Na: 1 }, coefficient: 1 },
        { formula: "NaNO3", atoms: { Na: 1, N: 1, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "Na2O", atoms: { Na: 2, O: 1 }, coefficient: 1 },
        { formula: "N2", atoms: { N: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [10, 2],
        products: [6, 1]
      }
    },
    {
      id: "carbon_sulfur",
      title: "Carbon and sulfur",
      difficulty: 2,
      topics: ["synthesis", "nonmetal-oxidation", "redox"],
      hints: [
        "Leave C for last because it is monoatomic.",
        "Start with sulfur: S8 has eight S atoms, and each CS2 contains two S atoms.",
        "In the final balanced equation, CS2 should have coefficient 4."
      ],
      reactants: [
        { formula: "C", atoms: { C: 1 }, coefficient: 1 },
        { formula: "S8", atoms: { S: 8 }, coefficient: 1 }
      ],
      products: [
        { formula: "CS2", atoms: { C: 1, S: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 1],
        products: [4]
      }
    },
    {
      id: "sodium_oxide",
      title: "Sodium oxide formation",
      difficulty: 1,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Na for last because it is monoatomic.",
        "Start with oxygen: O2 has two O atoms, but one Na2O has only one O atom.",
        "In the final balanced equation, Na2O should have coefficient 2."
      ],
      reactants: [
        { formula: "Na", atoms: { Na: 1 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Na2O", atoms: { Na: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 1],
        products: [2]
      }
    },
    {
      id: "dinitrogen_pentoxide",
      title: "Dinitrogen pentoxide formation",
      difficulty: 2,
      topics: ["synthesis", "nonmetal-oxidation", "redox"],
      hints: [
        "Leave O2 for last because it only changes oxygen.",
        "Start with oxygen: N2O5 has oxygen in groups of five, but O2 supplies oxygen in pairs.",
        "In the final balanced equation, N2O5 should have coefficient 2."
      ],
      reactants: [
        { formula: "N2", atoms: { N: 2 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "N2O5", atoms: { N: 2, O: 5 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 5],
        products: [2]
      }
    },
    {
      id: "phosphoric_acid_magnesium_hydroxide",
      title: "Phosphoric acid and magnesium hydroxide",
      difficulty: 3,
      topics: ["acid-base", "neutralization", "double-displacement", "precipitation"],
      hints: [
        "Keep phosphate together: PO4 stays recognizable from H3PO4 to Mg3(PO4)2.",
        "Start with Mg3(PO4)2: it tells you how many Mg groups and phosphate groups are needed.",
        "In the final balanced equation, Mg(OH)2 should have coefficient 3."
      ],
      reactants: [
        { formula: "H3PO4", atoms: { H: 3, P: 1, O: 4 }, coefficient: 1 },
        { formula: "Mg(OH)2", atoms: { Mg: 1, O: 2, H: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Mg3(PO4)2", atoms: { Mg: 3, P: 2, O: 8 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [1, 6]
      }
    },
    {
      id: "sodium_hydroxide_carbonic_acid",
      title: "Sodium hydroxide and carbonic acid",
      difficulty: 2,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep carbonate together: CO3 appears intact in H2CO3 and Na2CO3.",
        "Start with sodium: Na2CO3 needs two Na atoms, so NaOH must scale to match it.",
        "In the final balanced equation, NaOH should have coefficient 2."
      ],
      reactants: [
        { formula: "NaOH", atoms: { Na: 1, O: 1, H: 1 }, coefficient: 1 },
        { formula: "H2CO3", atoms: { H: 2, C: 1, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "Na2CO3", atoms: { Na: 2, C: 1, O: 3 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [1, 2]
      }
    },
    {
      id: "potassium_hydroxide_hydrobromic_acid",
      title: "Potassium hydroxide and hydrobromic acid",
      difficulty: 1,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "This is a one-to-one acid-base neutralization.",
        "K and Br already match; the remaining H and O make water.",
        "In the final balanced equation, KBr should have coefficient 1."
      ],
      reactants: [
        { formula: "KOH", atoms: { K: 1, O: 1, H: 1 }, coefficient: 1 },
        { formula: "HBr", atoms: { H: 1, Br: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "KBr", atoms: { K: 1, Br: 1 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 1],
        products: [1, 1]
      }
    },
    {
      id: "aluminum_carbide",
      title: "Aluminum carbide formation",
      difficulty: 2,
      topics: ["synthesis", "redox"],
      hints: [
        "Start with the product: Al4C3 fixes the aluminum-to-carbon ratio.",
        "Because both reactants are monoatomic, their coefficients can be set directly from Al4C3.",
        "In the final balanced equation, Al should have coefficient 4."
      ],
      reactants: [
        { formula: "Al", atoms: { Al: 1 }, coefficient: 1 },
        { formula: "C", atoms: { C: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al4C3", atoms: { Al: 4, C: 3 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 3],
        products: [1]
      }
    },
    {
      id: "aluminum_sulfide",
      title: "Aluminum sulfide formation",
      difficulty: 3,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Al for last because it is monoatomic.",
        "Start with sulfur: S8 has eight S atoms, but Al2S3 uses sulfur in groups of three.",
        "In the final balanced equation, Al2S3 should have coefficient 8."
      ],
      reactants: [
        { formula: "Al", atoms: { Al: 1 }, coefficient: 1 },
        { formula: "S8", atoms: { S: 8 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al2S3", atoms: { Al: 2, S: 3 }, coefficient: 1 }
      ],
      solution: {
        reactants: [16, 3],
        products: [8]
      }
    },
    {
      id: "cesium_nitride",
      title: "Cesium nitride formation",
      difficulty: 2,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Cs for last because it is monoatomic.",
        "Start with nitrogen: N2 has two N atoms, and one Cs3N has only one N atom.",
        "In the final balanced equation, Cs3N should have coefficient 2."
      ],
      reactants: [
        { formula: "Cs", atoms: { Cs: 1 }, coefficient: 1 },
        { formula: "N2", atoms: { N: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Cs3N", atoms: { Cs: 3, N: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [6, 1],
        products: [2]
      }
    },
    {
      id: "magnesium_chloride",
      title: "Magnesium chloride formation",
      difficulty: 1,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "This one is already matched if each compound has coefficient 1.",
        "MgCl2 contains one Mg atom and two Cl atoms, exactly matching Mg plus Cl2.",
        "In the final balanced equation, MgCl2 should have coefficient 1."
      ],
      reactants: [
        { formula: "Mg", atoms: { Mg: 1 }, coefficient: 1 },
        { formula: "Cl2", atoms: { Cl: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "MgCl2", atoms: { Mg: 1, Cl: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 1],
        products: [1]
      }
    },
    {
      id: "rubidium_rubidium_nitrate",
      title: "Rubidium and rubidium nitrate",
      difficulty: 3,
      topics: ["redox", "metal-oxidation", "gas-formation"],
      hints: [
        "Leave Rb for last because it appears as a monoatomic metal and inside both rubidium compounds.",
        "Start with nitrogen: N2 needs an even number of N atoms, so RbNO3 should become even.",
        "In the final balanced equation, RbNO3 should have coefficient 2."
      ],
      reactants: [
        { formula: "Rb", atoms: { Rb: 1 }, coefficient: 1 },
        { formula: "RbNO3", atoms: { Rb: 1, N: 1, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "Rb2O", atoms: { Rb: 2, O: 1 }, coefficient: 1 },
        { formula: "N2", atoms: { N: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [10, 2],
        products: [6, 1]
      }
    },
    {
      id: "benzene_combustion",
      title: "Benzene combustion",
      difficulty: 3,
      topics: ["combustion", "hydrocarbon", "redox"],
      hints: [
        "In combustion, leave O2 for last because it only changes oxygen.",
        "Start with carbon and hydrogen; if the oxygen total is odd, scale the hydrocarbon first.",
        "In the final balanced equation, O2 should have coefficient 15."
      ],
      reactants: [
        { formula: "C6H6", atoms: { C: 6, H: 6 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 15],
        products: [12, 6]
      }
    },
    {
      id: "decane_combustion",
      title: "Decane combustion",
      difficulty: 3,
      topics: ["combustion", "hydrocarbon", "redox"],
      hints: [
        "In combustion, leave O2 for last because it only changes oxygen.",
        "Start with carbon and hydrogen; the hydrocarbon must be doubled to avoid a fractional O2 coefficient.",
        "In the final balanced equation, O2 should have coefficient 31."
      ],
      reactants: [
        { formula: "C10H22", atoms: { C: 10, H: 22 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 31],
        products: [20, 22]
      }
    },
    {
      id: "aluminum_hydroxide_hydrobromic_acid",
      title: "Aluminum hydroxide and hydrobromic acid",
      difficulty: 2,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Do not start with water. Start with the aluminum and bromide salt.",
        "AlBr3 needs three Br atoms, so HBr must supply three bromides.",
        "In the final balanced equation, HBr should have coefficient 3."
      ],
      reactants: [
        { formula: "Al(OH)3", atoms: { Al: 1, O: 3, H: 3 }, coefficient: 1 },
        { formula: "HBr", atoms: { H: 1, Br: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "AlBr3", atoms: { Al: 1, Br: 3 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3],
        products: [1, 3]
      }
    },
    {
      id: "butane_combustion",
      title: "Butane combustion",
      difficulty: 3,
      topics: ["combustion", "hydrocarbon", "redox"],
      hints: [
        "In combustion, leave O2 for last because it only changes oxygen.",
        "Start with carbon and hydrogen; butane must be doubled to avoid a fractional O2 coefficient.",
        "In the final balanced equation, O2 should have coefficient 13."
      ],
      reactants: [
        { formula: "C4H10", atoms: { C: 4, H: 10 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 13],
        products: [8, 10]
      }
    },
    {
      id: "lithium_aluminum_chloride",
      title: "Lithium and aluminum chloride",
      difficulty: 2,
      topics: ["single-replacement", "redox"],
      hints: [
        "Leave Li for last because it is monoatomic.",
        "Start with chlorine: AlCl3 has three Cl atoms, and each LiCl has one Cl atom.",
        "In the final balanced equation, LiCl should have coefficient 3."
      ],
      reactants: [
        { formula: "Li", atoms: { Li: 1 }, coefficient: 1 },
        { formula: "AlCl3", atoms: { Al: 1, Cl: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "LiCl", atoms: { Li: 1, Cl: 1 }, coefficient: 1 },
        { formula: "Al", atoms: { Al: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [3, 1],
        products: [3, 1]
      }
    },
    {
      id: "ammonium_hydroxide_phosphoric_acid",
      title: "Ammonium hydroxide and phosphoric acid",
      difficulty: 2,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep ammonium together: NH4 appears as the cation in (NH4)3PO4.",
        "Start with (NH4)3PO4; it needs three ammonium groups and one phosphate group.",
        "In the final balanced equation, NH4OH should have coefficient 3."
      ],
      reactants: [
        { formula: "NH4OH", atoms: { N: 1, H: 5, O: 1 }, coefficient: 1 },
        { formula: "H3PO4", atoms: { H: 3, P: 1, O: 4 }, coefficient: 1 }
      ],
      products: [
        { formula: "(NH4)3PO4", atoms: { N: 3, H: 12, P: 1, O: 4 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [3, 1],
        products: [1, 3]
      }
    },
    {
      id: "rubidium_phosphide",
      title: "Rubidium phosphide formation",
      difficulty: 1,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Rb for last because it is monoatomic.",
        "Rb3P needs three Rb atoms for each P atom.",
        "In the final balanced equation, Rb should have coefficient 3."
      ],
      reactants: [
        { formula: "Rb", atoms: { Rb: 1 }, coefficient: 1 },
        { formula: "P", atoms: { P: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Rb3P", atoms: { Rb: 3, P: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [3, 1],
        products: [1]
      }
    },
    {
      id: "aluminum_hydroxide_sulfuric_acid",
      title: "Aluminum hydroxide and sulfuric acid",
      difficulty: 3,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep sulfate together: SO4 appears intact in H2SO4 and Al2(SO4)3.",
        "Start with Al2(SO4)3; it fixes both the aluminum count and the sulfate count.",
        "In the final balanced equation, H2SO4 should have coefficient 3."
      ],
      reactants: [
        { formula: "Al(OH)3", atoms: { Al: 1, O: 3, H: 3 }, coefficient: 1 },
        { formula: "H2SO4", atoms: { H: 2, S: 1, O: 4 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al2(SO4)3", atoms: { Al: 2, S: 3, O: 12 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [1, 6]
      }
    },
    {
      id: "rubidium_sulfide",
      title: "Rubidium sulfide formation",
      difficulty: 3,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Rb for last because it is monoatomic.",
        "Start with sulfur: S8 has eight S atoms, and each Rb2S contains one S atom.",
        "In the final balanced equation, Rb2S should have coefficient 8."
      ],
      reactants: [
        { formula: "Rb", atoms: { Rb: 1 }, coefficient: 1 },
        { formula: "S8", atoms: { S: 8 }, coefficient: 1 }
      ],
      products: [
        { formula: "Rb2S", atoms: { Rb: 2, S: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [16, 1],
        products: [8]
      }
    },
    {
      id: "phosphoric_acid_calcium_hydroxide",
      title: "Phosphoric acid and calcium hydroxide",
      difficulty: 3,
      topics: ["acid-base", "neutralization", "double-displacement", "precipitation"],
      hints: [
        "Keep phosphate together: PO4 stays recognizable from H3PO4 to Ca3(PO4)2.",
        "Start with Ca3(PO4)2; it fixes both the calcium count and the phosphate count.",
        "In the final balanced equation, Ca(OH)2 should have coefficient 3."
      ],
      reactants: [
        { formula: "H3PO4", atoms: { H: 3, P: 1, O: 4 }, coefficient: 1 },
        { formula: "Ca(OH)2", atoms: { Ca: 1, O: 2, H: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Ca3(PO4)2", atoms: { Ca: 3, P: 2, O: 8 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [1, 6]
      }
    },
    {
      id: "ammonia_hydrochloric_acid",
      title: "Ammonia and hydrochloric acid",
      difficulty: 1,
      topics: ["acid-base", "synthesis"],
      hints: [
        "This is a one-to-one formation of an ammonium salt.",
        "NH3 accepts H from HCl to make NH4Cl, and Cl comes along as the counterion.",
        "In the final balanced equation, NH4Cl should have coefficient 1."
      ],
      reactants: [
        { formula: "NH3", atoms: { N: 1, H: 3 }, coefficient: 1 },
        { formula: "HCl", atoms: { H: 1, Cl: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "NH4Cl", atoms: { N: 1, H: 4, Cl: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 1],
        products: [1]
      }
    },
    {
      id: "lithium_water",
      title: "Lithium and water",
      difficulty: 2,
      topics: ["single-replacement", "gas-formation", "redox"],
      hints: [
        "Leave Li for last because it is monoatomic.",
        "Start with hydrogen gas: H2 needs hydrogen in pairs, and water also supplies oxygen for LiOH.",
        "In the final balanced equation, H2 should have coefficient 1."
      ],
      reactants: [
        { formula: "Li", atoms: { Li: 1 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "LiOH", atoms: { Li: 1, O: 1, H: 1 }, coefficient: 1 },
        { formula: "H2", atoms: { H: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 2],
        products: [2, 1]
      }
    },
    {
      id: "calcium_phosphate_silica_carbon",
      title: "Calcium phosphate, silica, and carbon",
      difficulty: 3,
      topics: ["redox", "oxide-reduction", "gas-formation"],
      hints: [
        "Leave C for later because it appears as monoatomic carbon and in CO.",
        "Start with calcium and silicon: Ca3(PO4)2 has three Ca atoms, and each CaSiO3 needs one Si atom.",
        "In the final balanced equation, CaSiO3 should have coefficient 3."
      ],
      reactants: [
        { formula: "Ca3(PO4)2", atoms: { Ca: 3, P: 2, O: 8 }, coefficient: 1 },
        { formula: "SiO2", atoms: { Si: 1, O: 2 }, coefficient: 1 },
        { formula: "C", atoms: { C: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "CaSiO3", atoms: { Ca: 1, Si: 1, O: 3 }, coefficient: 1 },
        { formula: "CO", atoms: { C: 1, O: 1 }, coefficient: 1 },
        { formula: "P", atoms: { P: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3, 5],
        products: [3, 5, 2]
      }
    },
    {
      id: "ammonia_oxygen",
      title: "Ammonia and oxygen",
      difficulty: 3,
      topics: ["redox", "gas-formation"],
      hints: [
        "Leave O2 for last because it only changes oxygen.",
        "Start with nitrogen: NH3 has one N atom, but N2 needs nitrogen in pairs.",
        "In the final balanced equation, NH3 should have coefficient 4."
      ],
      reactants: [
        { formula: "NH3", atoms: { N: 1, H: 3 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "N2", atoms: { N: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 3],
        products: [2, 6]
      }
    },
    {
      id: "pyrite_oxidation",
      title: "Pyrite oxidation",
      difficulty: 3,
      topics: ["redox", "metal-oxidation", "gas-formation"],
      hints: [
        "Leave O2 for last because it only changes oxygen.",
        "Start with iron and sulfur together: FeS2 gives one Fe and two S atoms each time.",
        "In the final balanced equation, FeS2 should have coefficient 4."
      ],
      reactants: [
        { formula: "FeS2", atoms: { Fe: 1, S: 2 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Fe2O3", atoms: { Fe: 2, O: 3 }, coefficient: 1 },
        { formula: "SO2", atoms: { S: 1, O: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 11],
        products: [2, 8]
      }
    },
    {
      id: "carbon_sulfur_dioxide",
      title: "Carbon and sulfur dioxide",
      difficulty: 3,
      topics: ["redox", "oxide-reduction", "gas-formation"],
      hints: [
        "Do not start with carbon; C appears as monoatomic carbon and inside both products.",
        "Start with sulfur: SO2 has one S atom, but CS2 needs sulfur in pairs.",
        "In the final balanced equation, SO2 should have coefficient 2."
      ],
      reactants: [
        { formula: "C", atoms: { C: 1 }, coefficient: 1 },
        { formula: "SO2", atoms: { S: 1, O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "CS2", atoms: { C: 1, S: 2 }, coefficient: 1 },
        { formula: "CO", atoms: { C: 1, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [5, 2],
        products: [1, 4]
      }
    },
    {
      id: "mineral_phosphate_sulfuric_acid",
      title: "Mineral phosphate and sulfuric acid",
      difficulty: 3,
      topics: ["acid-base", "double-displacement", "precipitation"],
      hints: [
        "Keep phosphate together: Ca5(PO4)3F contains three phosphate groups.",
        "Start with calcium: five Ca atoms become five CaSO4 units.",
        "In the final balanced equation, H2SO4 should have coefficient 5."
      ],
      reactants: [
        { formula: "H2SO4", atoms: { H: 2, S: 1, O: 4 }, coefficient: 1 },
        { formula: "Ca5(PO4)3F", atoms: { Ca: 5, P: 3, O: 12, F: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "H3PO4", atoms: { H: 3, P: 1, O: 4 }, coefficient: 1 },
        { formula: "HF", atoms: { H: 1, F: 1 }, coefficient: 1 },
        { formula: "CaSO4", atoms: { Ca: 1, S: 1, O: 4 }, coefficient: 1 }
      ],
      solution: {
        reactants: [5, 1],
        products: [3, 1, 5]
      }
    },
    {
      id: "aluminum_oxide_decomposition",
      title: "Aluminum oxide decomposition",
      difficulty: 2,
      topics: ["decomposition", "redox", "metal-oxidation"],
      hints: [
        "Leave Al for last because it is monoatomic.",
        "Start with oxygen: Al2O3 has oxygen in groups of three, but O2 has oxygen in pairs.",
        "In the final balanced equation, Al2O3 should have coefficient 2."
      ],
      reactants: [
        { formula: "Al2O3", atoms: { Al: 2, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al", atoms: { Al: 1 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2],
        products: [4, 3]
      }
    },
    {
      id: "potassium_cyanide_hydrochloric_acid",
      title: "Potassium cyanide and hydrochloric acid",
      difficulty: 1,
      topics: ["acid-base", "double-displacement", "gas-formation"],
      hints: [
        "This is a one-to-one acid reaction.",
        "Keep CN together: it moves from KCN to HCN.",
        "In the final balanced equation, HCN should have coefficient 1."
      ],
      reactants: [
        { formula: "KCN", atoms: { K: 1, C: 1, N: 1 }, coefficient: 1 },
        { formula: "HCl", atoms: { H: 1, Cl: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "KCl", atoms: { K: 1, Cl: 1 }, coefficient: 1 },
        { formula: "HCN", atoms: { H: 1, C: 1, N: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 1],
        products: [1, 1]
      }
    },
    {
      id: "nitric_oxide_oxygen",
      title: "Nitric oxide and oxygen",
      difficulty: 2,
      topics: ["synthesis", "redox", "gas-formation"],
      hints: [
        "Leave O2 for last because it only changes oxygen.",
        "Start with nitrogen: NO and NO2 each contain one N atom, so their coefficients should match.",
        "In the final balanced equation, NO should have coefficient 2."
      ],
      reactants: [
        { formula: "NO", atoms: { N: 1, O: 1 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "NO2", atoms: { N: 1, O: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [2]
      }
    },
    {
      id: "silver_nitrate_aluminum_chloride",
      title: "Silver nitrate and aluminum chloride",
      difficulty: 2,
      topics: ["double-displacement", "precipitation"],
      hints: [
        "Keep nitrate together: NO3 moves from silver to aluminum.",
        "Start with AlCl3: it has three chloride ions, so it can make three AgCl units.",
        "In the final balanced equation, AgCl should have coefficient 3."
      ],
      reactants: [
        { formula: "AgNO3", atoms: { Ag: 1, N: 1, O: 3 }, coefficient: 1 },
        { formula: "AlCl3", atoms: { Al: 1, Cl: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al(NO3)3", atoms: { Al: 1, N: 3, O: 9 }, coefficient: 1 },
        { formula: "AgCl", atoms: { Ag: 1, Cl: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [3, 1],
        products: [1, 3]
      }
    },
    {
      id: "aluminum_nitrate_sodium_sulfide",
      title: "Aluminum nitrate and sodium sulfide",
      difficulty: 2,
      topics: ["double-displacement", "precipitation"],
      hints: [
        "Keep nitrate together: NO3 stays intact and moves to sodium.",
        "Start with aluminum sulfide: Al2S3 fixes two Al atoms and three sulfide groups.",
        "In the final balanced equation, NaNO3 should have coefficient 6."
      ],
      reactants: [
        { formula: "Al(NO3)3", atoms: { Al: 1, N: 3, O: 9 }, coefficient: 1 },
        { formula: "Na2S", atoms: { Na: 2, S: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al2S3", atoms: { Al: 2, S: 3 }, coefficient: 1 },
        { formula: "NaNO3", atoms: { Na: 1, N: 1, O: 3 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [1, 6]
      }
    },
    {
      id: "ammonia_combustion_to_nitrogen_dioxide",
      title: "Ammonia combustion to nitrogen dioxide",
      difficulty: 3,
      topics: ["redox", "gas-formation"],
      hints: [
        "Leave O2 for last because it only changes oxygen.",
        "Start with nitrogen: NH3 and NO2 each contain one N atom, so their coefficients should match.",
        "In the final balanced equation, O2 should have coefficient 7."
      ],
      reactants: [
        { formula: "NH3", atoms: { N: 1, H: 3 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "NO2", atoms: { N: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 7],
        products: [4, 6]
      }
    },
    {
      id: "cobalt_oxide_reduction",
      title: "Cobalt(III) oxide reduction",
      difficulty: 2,
      topics: ["redox", "oxide-reduction", "gas-formation"],
      hints: [
        "Leave Co for last because it is monoatomic.",
        "Start with oxygen: Co2O3 has oxygen in groups of three, and each CO2 has two O atoms.",
        "In the final balanced equation, Co2O3 should have coefficient 2."
      ],
      reactants: [
        { formula: "Co2O3", atoms: { Co: 2, O: 3 }, coefficient: 1 },
        { formula: "C", atoms: { C: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Co", atoms: { Co: 1 }, coefficient: 1 },
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [4, 3]
      }
    },
    {
      id: "nitrogen_dioxide_water",
      title: "Nitrogen dioxide and water",
      difficulty: 2,
      topics: ["acid-base", "redox"],
      hints: [
        "Start with nitrogen: NO2 appears in two nitrogen-containing products.",
        "HNO3 and NO together require three nitrogen atoms per full pattern.",
        "In the final balanced equation, NO2 should have coefficient 3."
      ],
      reactants: [
        { formula: "NO2", atoms: { N: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "HNO3", atoms: { H: 1, N: 1, O: 3 }, coefficient: 1 },
        { formula: "NO", atoms: { N: 1, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [3, 1],
        products: [2, 1]
      }
    },
    {
      id: "tetraphosphorus_decasulfide",
      title: "Tetraphosphorus decasulfide formation",
      difficulty: 3,
      topics: ["synthesis", "nonmetal-oxidation", "redox"],
      hints: [
        "P4 already matches the phosphorus pattern in P4S10.",
        "The challenge is sulfur: S8 supplies sulfur in groups of eight, but P4S10 needs sulfur in groups of ten.",
        "In the final balanced equation, S8 should have coefficient 5."
      ],
      reactants: [
        { formula: "P4", atoms: { P: 4 }, coefficient: 1 },
        { formula: "S8", atoms: { S: 8 }, coefficient: 1 }
      ],
      products: [
        { formula: "P4S10", atoms: { P: 4, S: 10 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 5],
        products: [4]
      }
    },
    {
      id: "iron_chloride_ammonium_hydroxide",
      title: "Iron(III) chloride and ammonium hydroxide",
      difficulty: 2,
      topics: ["double-displacement", "precipitation"],
      hints: [
        "Keep ammonium together: NH4 moves with chloride to make NH4Cl.",
        "Start with chloride: FeCl3 has three Cl atoms, so it forms three NH4Cl units.",
        "In the final balanced equation, NH4OH should have coefficient 3."
      ],
      reactants: [
        { formula: "FeCl3", atoms: { Fe: 1, Cl: 3 }, coefficient: 1 },
        { formula: "NH4OH", atoms: { N: 1, H: 5, O: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Fe(OH)3", atoms: { Fe: 1, O: 3, H: 3 }, coefficient: 1 },
        { formula: "NH4Cl", atoms: { N: 1, H: 4, Cl: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3],
        products: [1, 3]
      }
    },
    {
      id: "hydrogen_sulfide_sodium_hydroxide",
      title: "Hydrogen sulfide and sodium hydroxide",
      difficulty: 2,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep sulfide as the sulfur-containing product: H2S becomes Na2S.",
        "Start with sodium: Na2S needs two Na atoms, so NaOH must scale to match it.",
        "In the final balanced equation, NaOH should have coefficient 2."
      ],
      reactants: [
        { formula: "H2S", atoms: { H: 2, S: 1 }, coefficient: 1 },
        { formula: "NaOH", atoms: { Na: 1, O: 1, H: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Na2S", atoms: { Na: 2, S: 1 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 2],
        products: [1, 2]
      }
    },
    {
      id: "phosphine_oxygen",
      title: "Phosphine and oxygen",
      difficulty: 3,
      topics: ["redox", "gas-formation", "nonmetal-oxidation"],
      hints: [
        "Leave O2 for last because it only changes oxygen.",
        "Start with phosphorus: P4O10 needs four P atoms, so PH3 must scale to four.",
        "In the final balanced equation, PH3 should have coefficient 4."
      ],
      reactants: [
        { formula: "PH3", atoms: { P: 1, H: 3 }, coefficient: 1 },
        { formula: "O2", atoms: { O: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "P4O10", atoms: { P: 4, O: 10 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [4, 8],
        products: [1, 6]
      }
    },
    {
      id: "titanium_dioxide_carbon",
      title: "Titanium dioxide and carbon",
      difficulty: 2,
      topics: ["redox", "oxide-reduction", "gas-formation"],
      hints: [
        "Leave C for later because it appears as monoatomic carbon and in two products.",
        "Start with oxygen: TiO2 has two O atoms, so it makes two CO units.",
        "In the final balanced equation, CO should have coefficient 2."
      ],
      reactants: [
        { formula: "TiO2", atoms: { Ti: 1, O: 2 }, coefficient: 1 },
        { formula: "C", atoms: { C: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "TiC", atoms: { Ti: 1, C: 1 }, coefficient: 1 },
        { formula: "CO", atoms: { C: 1, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3],
        products: [1, 2]
      }
    },
    {
      id: "calcium_phosphate_sulfuric_acid",
      title: "Calcium phosphate and sulfuric acid",
      difficulty: 3,
      topics: ["acid-base", "double-displacement", "precipitation"],
      hints: [
        "Keep phosphate together: Ca3(PO4)2 contains two phosphate groups.",
        "Start with calcium: three Ca atoms become three CaSO4 units.",
        "In the final balanced equation, H2SO4 should have coefficient 3."
      ],
      reactants: [
        { formula: "Ca3(PO4)2", atoms: { Ca: 3, P: 2, O: 8 }, coefficient: 1 },
        { formula: "H2SO4", atoms: { H: 2, S: 1, O: 4 }, coefficient: 1 }
      ],
      products: [
        { formula: "CaSO4", atoms: { Ca: 1, S: 1, O: 4 }, coefficient: 1 },
        { formula: "H3PO4", atoms: { H: 3, P: 1, O: 4 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3],
        products: [3, 2]
      }
    },
    {
      id: "sodium_phosphate_potassium_sulfate",
      title: "Sodium phosphate and potassium sulfate",
      difficulty: 2,
      topics: ["double-displacement", "formal-equation"],
      hints: [
        "This is a formal ion-exchange equation for balancing practice.",
        "Keep phosphate and sulfate together as groups.",
        "In the final balanced equation, K2SO4 should have coefficient 3."
      ],
      reactants: [
        { formula: "Na3PO4", atoms: { Na: 3, P: 1, O: 4 }, coefficient: 1 },
        { formula: "K2SO4", atoms: { K: 2, S: 1, O: 4 }, coefficient: 1 }
      ],
      products: [
        { formula: "K3PO4", atoms: { K: 3, P: 1, O: 4 }, coefficient: 1 },
        { formula: "Na2SO4", atoms: { Na: 2, S: 1, O: 4 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [2, 3]
      }
    },
    {
      id: "silver_nitrate_barium_chloride",
      title: "Silver nitrate and barium chloride",
      difficulty: 2,
      topics: ["double-displacement", "precipitation"],
      hints: [
        "Keep nitrate together: NO3 moves from silver to barium.",
        "Start with chloride: BaCl2 has two Cl atoms, so it makes two AgCl units.",
        "In the final balanced equation, AgCl should have coefficient 2."
      ],
      reactants: [
        { formula: "AgNO3", atoms: { Ag: 1, N: 1, O: 3 }, coefficient: 1 },
        { formula: "BaCl2", atoms: { Ba: 1, Cl: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "AgCl", atoms: { Ag: 1, Cl: 1 }, coefficient: 1 },
        { formula: "Ba(NO3)2", atoms: { Ba: 1, N: 2, O: 6 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [2, 1]
      }
    },
    {
      id: "arsenic_hydroxide_sulfuric_acid",
      title: "Arsenic hydroxide and sulfuric acid",
      difficulty: 3,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep sulfate together: SO4 appears intact in H2SO4 and As2(SO4)3.",
        "Start with As2(SO4)3; it fixes both arsenic and sulfate counts.",
        "In the final balanced equation, H2SO4 should have coefficient 3."
      ],
      reactants: [
        { formula: "As(OH)3", atoms: { As: 1, O: 3, H: 3 }, coefficient: 1 },
        { formula: "H2SO4", atoms: { H: 2, S: 1, O: 4 }, coefficient: 1 }
      ],
      products: [
        { formula: "As2(SO4)3", atoms: { As: 2, S: 3, O: 12 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [1, 6]
      }
    },
    {
      id: "nitric_acid_calcium_hydroxide",
      title: "Nitric acid and calcium hydroxide",
      difficulty: 2,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep nitrate together: NO3 moves into Ca(NO3)2.",
        "Start with nitrate: Ca(NO3)2 needs two nitrate groups, so HNO3 must scale to two.",
        "In the final balanced equation, HNO3 should have coefficient 2."
      ],
      reactants: [
        { formula: "HNO3", atoms: { H: 1, N: 1, O: 3 }, coefficient: 1 },
        { formula: "Ca(OH)2", atoms: { Ca: 1, O: 2, H: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "Ca(NO3)2", atoms: { Ca: 1, N: 2, O: 6 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [1, 2]
      }
    },
    {
      id: "lithium_fluoride",
      title: "Lithium fluoride formation",
      difficulty: 1,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Li for last because it is monoatomic.",
        "Start with fluorine: F2 has two F atoms, but one LiF has only one F atom.",
        "In the final balanced equation, LiF should have coefficient 2."
      ],
      reactants: [
        { formula: "Li", atoms: { Li: 1 }, coefficient: 1 },
        { formula: "F2", atoms: { F: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "LiF", atoms: { Li: 1, F: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [2]
      }
    },
    {
      id: "iron_silicate_carbonation",
      title: "Iron silicate carbonation",
      difficulty: 3,
      topics: ["double-displacement", "gas-formation"],
      hints: [
        "Treat Fe3Si2O5(OH)4 as one formula and start with Fe and Si.",
        "Three Fe atoms become three FeCO3 units, and two Si atoms become two H4SiO4 units.",
        "In the final balanced equation, CO2 should have coefficient 3."
      ],
      reactants: [
        { formula: "Fe3Si2O5(OH)4", atoms: { Fe: 3, Si: 2, O: 9, H: 4 }, coefficient: 1 },
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "FeCO3", atoms: { Fe: 1, C: 1, O: 3 }, coefficient: 1 },
        { formula: "H4SiO4", atoms: { H: 4, Si: 1, O: 4 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 3, 2],
        products: [3, 2]
      }
    },
    {
      id: "calcium_carbonate_hydrochloric_acid",
      title: "Calcium carbonate and hydrochloric acid",
      difficulty: 2,
      topics: ["acid-base", "gas-formation", "double-displacement"],
      hints: [
        "Keep carbonate's carbon together: CaCO3 produces one CO2.",
        "Start with chloride: CaCl2 needs two Cl atoms, so HCl must scale to two.",
        "In the final balanced equation, HCl should have coefficient 2."
      ],
      reactants: [
        { formula: "CaCO3", atoms: { Ca: 1, C: 1, O: 3 }, coefficient: 1 },
        { formula: "HCl", atoms: { H: 1, Cl: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "CaCl2", atoms: { Ca: 1, Cl: 2 }, coefficient: 1 },
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 2],
        products: [1, 1, 1]
      }
    },
    {
      id: "sodium_azide",
      title: "Sodium azide formation",
      difficulty: 2,
      topics: ["synthesis", "metal-oxidation", "redox"],
      hints: [
        "Leave Na for last because it is monoatomic.",
        "Start with nitrogen: NaN3 needs nitrogen in groups of three, but N2 supplies nitrogen in pairs.",
        "In the final balanced equation, N2 should have coefficient 3."
      ],
      reactants: [
        { formula: "Na", atoms: { Na: 1 }, coefficient: 1 },
        { formula: "N2", atoms: { N: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "NaN3", atoms: { Na: 1, N: 3 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3],
        products: [2]
      }
    },
    {
      id: "barium_hydroxide_chloric_acid",
      title: "Barium hydroxide and chloric acid",
      difficulty: 2,
      topics: ["acid-base", "neutralization", "double-displacement"],
      hints: [
        "Keep chlorate together: ClO3 moves into Ba(ClO3)2.",
        "Start with chlorate: Ba(ClO3)2 needs two chlorate groups, so HClO3 must scale to two.",
        "In the final balanced equation, HClO3 should have coefficient 2."
      ],
      reactants: [
        { formula: "Ba(OH)2", atoms: { Ba: 1, O: 2, H: 2 }, coefficient: 1 },
        { formula: "HClO3", atoms: { H: 1, Cl: 1, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "Ba(ClO3)2", atoms: { Ba: 1, Cl: 2, O: 6 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 2],
        products: [1, 2]
      }
    },
    {
      id: "aluminum_chloride_sodium_carbonate_water",
      title: "Aluminum chloride and sodium carbonate in water",
      difficulty: 3,
      topics: ["double-displacement", "precipitation", "gas-formation", "hydrolysis"],
      hints: [
        "Do not make aluminum carbonate here; in water, aluminum becomes Al(OH)3 and carbonate becomes CO2.",
        "Start with aluminum and chloride: AlCl3 sets Al(OH)3 and also determines how much NaCl you need.",
        "In the final balanced equation, NaCl should have coefficient 6."
      ],
      reactants: [
        { formula: "AlCl3", atoms: { Al: 1, Cl: 3 }, coefficient: 1 },
        { formula: "Na2CO3", atoms: { Na: 2, C: 1, O: 3 }, coefficient: 1 },
        { formula: "H2O", atoms: { H: 2, O: 1 }, coefficient: 1 }
      ],
      products: [
        { formula: "Al(OH)3", atoms: { Al: 1, O: 3, H: 3 }, coefficient: 1 },
        { formula: "CO2", atoms: { C: 1, O: 2 }, coefficient: 1 },
        { formula: "NaCl", atoms: { Na: 1, Cl: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 3, 3],
        products: [2, 3, 6]
      }
    },
    {
      id: "calcium_chloride_sodium_carbonate",
      title: "Calcium chloride and sodium carbonate",
      difficulty: 2,
      topics: ["double-displacement", "precipitation"],
      hints: [
        "Keep carbonate together: CO3 moves from sodium carbonate into calcium carbonate.",
        "Start with sodium: Na2CO3 has two Na atoms, so NaCl must scale to match it.",
        "In the final balanced equation, NaCl should have coefficient 2."
      ],
      reactants: [
        { formula: "CaCl2", atoms: { Ca: 1, Cl: 2 }, coefficient: 1 },
        { formula: "Na2CO3", atoms: { Na: 2, C: 1, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "CaCO3", atoms: { Ca: 1, C: 1, O: 3 }, coefficient: 1 },
        { formula: "NaCl", atoms: { Na: 1, Cl: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 1],
        products: [1, 2]
      }
    },
    {
      id: "barium_chloride_sodium_carbonate",
      title: "Barium chloride and sodium carbonate",
      difficulty: 2,
      topics: ["double-displacement", "precipitation"],
      hints: [
        "Keep carbonate together: CO3 moves from sodium carbonate into barium carbonate.",
        "Start with sodium: Na2CO3 has two Na atoms, so NaCl must scale to match it.",
        "In the final balanced equation, NaCl should have coefficient 2."
      ],
      reactants: [
        { formula: "BaCl2", atoms: { Ba: 1, Cl: 2 }, coefficient: 1 },
        { formula: "Na2CO3", atoms: { Na: 2, C: 1, O: 3 }, coefficient: 1 }
      ],
      products: [
        { formula: "BaCO3", atoms: { Ba: 1, C: 1, O: 3 }, coefficient: 1 },
        { formula: "NaCl", atoms: { Na: 1, Cl: 1 }, coefficient: 1 }
      ],
      solution: {
        reactants: [1, 1],
        products: [1, 2]
      }
    },
    {
      id: "sodium_chloride_barium_hydroxide",
      title: "Sodium chloride and barium hydroxide",
      difficulty: 2,
      topics: ["double-displacement", "formal-equation"],
      hints: [
        "This is a formal ion-exchange equation, not a precipitation example.",
        "Start with barium chloride: BaCl2 needs two chloride ions, so NaCl must scale to two.",
        "In the final balanced equation, NaCl should have coefficient 2."
      ],
      reactants: [
        { formula: "NaCl", atoms: { Na: 1, Cl: 1 }, coefficient: 1 },
        { formula: "Ba(OH)2", atoms: { Ba: 1, O: 2, H: 2 }, coefficient: 1 }
      ],
      products: [
        { formula: "NaOH", atoms: { Na: 1, O: 1, H: 1 }, coefficient: 1 },
        { formula: "BaCl2", atoms: { Ba: 1, Cl: 2 }, coefficient: 1 }
      ],
      solution: {
        reactants: [2, 1],
        products: [2, 1]
      }
    }
  ];
})(window);
