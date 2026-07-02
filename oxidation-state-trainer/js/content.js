// Oxidation-State Trainer — content. The progressive ladder Dalia asked for: simple cases first,
// then molecules, then polyatomic ions. Content only — no logic. Each item names the species, the
// atom to solve for (`target`), the overall `charge` (0 for a molecule), and `expected`: the answer,
// hand-entered so the engine's computed value can be cross-checked against it in the tests.
//
// Every non-target atom is sight-assignable (see oxidation.js) — that's a property of THIS list, kept
// true so the method always works: no peroxides, no OF2, no metal hydrides.

export const TIERS = [
  {
    id: "basics",
    kind: "oxstate",
    label: "Elements & ions",
    tagline: "the two starting rules",
    items: [
      // free elements → 0
      { id: "O2", formula: "O2", charge: 0, target: "O", expected: 0 },
      { id: "Cl2", formula: "Cl2", charge: 0, target: "Cl", expected: 0 },
      { id: "P4", formula: "P4", charge: 0, target: "P", expected: 0 },
      { id: "Na0", formula: "Na", charge: 0, target: "Na", expected: 0 },
      // monatomic ions → the charge itself
      { id: "Na+", formula: "Na", charge: 1, target: "Na", expected: 1 },
      { id: "Mg2+", formula: "Mg", charge: 2, target: "Mg", expected: 2 },
      { id: "Al3+", formula: "Al", charge: 3, target: "Al", expected: 3 },
      { id: "Cl-", formula: "Cl", charge: -1, target: "Cl", expected: -1 },
      { id: "O2-", formula: "O", charge: -2, target: "O", expected: -2 },
      { id: "S2-", formula: "S", charge: -2, target: "S", expected: -2 }
    ]
  },
  {
    id: "molecules",
    kind: "oxstate",
    label: "Molecules",
    tagline: "assign what you know, sum to 0",
    items: [
      { id: "CO2", formula: "CO2", charge: 0, target: "C", expected: 4 },
      { id: "CO", formula: "CO", charge: 0, target: "C", expected: 2 },
      { id: "SO2", formula: "SO2", charge: 0, target: "S", expected: 4 },
      { id: "SO3", formula: "SO3", charge: 0, target: "S", expected: 6 },
      { id: "NO", formula: "NO", charge: 0, target: "N", expected: 2 },
      { id: "NO2", formula: "NO2", charge: 0, target: "N", expected: 4 },
      { id: "N2O", formula: "N2O", charge: 0, target: "N", expected: 1 },
      { id: "NH3", formula: "NH3", charge: 0, target: "N", expected: -3 },
      { id: "CH4", formula: "CH4", charge: 0, target: "C", expected: -4 },
      { id: "H2S", formula: "H2S", charge: 0, target: "S", expected: -2 },
      { id: "PCl3", formula: "PCl3", charge: 0, target: "P", expected: 3 },
      { id: "PCl5", formula: "PCl5", charge: 0, target: "P", expected: 5 },
      { id: "Al2O3", formula: "Al2O3", charge: 0, target: "Al", expected: 3 },
      { id: "Fe2O3", formula: "Fe2O3", charge: 0, target: "Fe", expected: 3 }
    ]
  },
  {
    id: "ions",
    kind: "oxstate",
    label: "Polyatomic ions",
    tagline: "sum to the ion's charge — the redox on-ramp",
    items: [
      { id: "NO3-", formula: "NO3", charge: -1, target: "N", expected: 5 },
      { id: "NO2-", formula: "NO2", charge: -1, target: "N", expected: 3 },
      { id: "SO4-2", formula: "SO4", charge: -2, target: "S", expected: 6 },
      { id: "SO3-2", formula: "SO3", charge: -2, target: "S", expected: 4 },
      { id: "CO3-2", formula: "CO3", charge: -2, target: "C", expected: 4 },
      { id: "PO4-3", formula: "PO4", charge: -3, target: "P", expected: 5 },
      { id: "MnO4-", formula: "MnO4", charge: -1, target: "Mn", expected: 7 },
      { id: "CrO4-2", formula: "CrO4", charge: -2, target: "Cr", expected: 6 },
      { id: "Cr2O7-2", formula: "Cr2O7", charge: -2, target: "Cr", expected: 6 },
      // the chlorine ladder — hypochlorite → perchlorate is +1 / +3 / +5 / +7 (the nomenclature link)
      { id: "ClO-", formula: "ClO", charge: -1, target: "Cl", expected: 1 },
      { id: "ClO2-", formula: "ClO2", charge: -1, target: "Cl", expected: 3 },
      { id: "ClO3-", formula: "ClO3", charge: -1, target: "Cl", expected: 5 },
      { id: "ClO4-", formula: "ClO4", charge: -1, target: "Cl", expected: 7 }
    ]
  },
  {
    id: "half",
    kind: "half",
    label: "Half-reactions",
    tagline: "electrons gained or lost — the redox on-ramp",
    items: [
      // oxidation: element → cation, electrons LOST (written on the product side)
      { id: "Na->", element: "Na", ion: "Na", ionCharge: 1, ionCount: 1 },
      { id: "K->", element: "K", ion: "K", ionCharge: 1, ionCount: 1 },
      { id: "Mg->", element: "Mg", ion: "Mg", ionCharge: 2, ionCount: 1 },
      { id: "Ca->", element: "Ca", ion: "Ca", ionCharge: 2, ionCount: 1 },
      { id: "Zn->", element: "Zn", ion: "Zn", ionCharge: 2, ionCount: 1 },
      { id: "Al->", element: "Al", ion: "Al", ionCharge: 3, ionCount: 1 },
      { id: "H2->", element: "H2", ion: "H", ionCharge: 1, ionCount: 2 }, // diatomic → 2 H⁺
      // reduction: element → anion, electrons GAINED (written on the reactant side)
      { id: "Cl2->", element: "Cl2", ion: "Cl", ionCharge: -1, ionCount: 2 },
      { id: "Br2->", element: "Br2", ion: "Br", ionCharge: -1, ionCount: 2 },
      { id: "O2->", element: "O2", ion: "O", ionCharge: -2, ionCount: 2 },
      { id: "N2->", element: "N2", ion: "N", ionCharge: -3, ionCount: 2 },
      { id: "S->", element: "S", ion: "S", ionCharge: -2, ionCount: 1 }
    ]
  }
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t]));
