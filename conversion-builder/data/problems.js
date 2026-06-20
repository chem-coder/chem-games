// Conversion Builder — content only (no logic). Each ROUND is one balanced reaction plus one
// given amount and several "any → any" target questions answered on the SAME grid.
//
//   species : the coefficient tiles read straight off the balanced equation (value + full unit).
//             Distractors are DERIVED from these by builder.js — nothing here is hand-authored.
//   given   : the starting amount; some rounds start from a reactant, some from the product.
//   answer  : hand-verified ( given × targetCoeff / givenCoeff ) and guarded by builder.test.js.

const rounds = [
  // ── 2 H₂ + O₂ → 2 H₂O ──────────────────────────────────────────────────────────────
  {
    id: "water-from-h2", name: "Water · given H₂",
    equation: "2 H₂ + O₂ → 2 H₂O",
    species: [
      { value: 2, unit: "mol H₂" },
      { value: 1, unit: "mol O₂" },
      { value: 2, unit: "mol H₂O" }
    ],
    given: { value: 6, unit: "mol H₂" },
    questions: [
      { id: "to-h2o", targetUnit: "mol H₂O",
        prompt: "How many mol H₂O can form?",
        answer: { value: 6, unit: "mol H₂O" } },        // 6 × 2/2 = 6
      { id: "to-o2", targetUnit: "mol O₂",
        prompt: "How many mol O₂ are needed to react all of it?",
        answer: { value: 3, unit: "mol O₂" } }           // 6 × 1/2 = 3
    ]
  },
  {
    id: "water-from-h2o", name: "Water · given H₂O",
    equation: "2 H₂ + O₂ → 2 H₂O",
    species: [
      { value: 2, unit: "mol H₂" },
      { value: 1, unit: "mol O₂" },
      { value: 2, unit: "mol H₂O" }
    ],
    given: { value: 8, unit: "mol H₂O" },
    questions: [
      { id: "to-h2", targetUnit: "mol H₂",
        prompt: "How many mol H₂ were required to make it?",
        answer: { value: 8, unit: "mol H₂" } },          // 8 × 2/2 = 8
      { id: "to-o2", targetUnit: "mol O₂",
        prompt: "How many mol O₂ were required to make it?",
        answer: { value: 4, unit: "mol O₂" } }           // 8 × 1/2 = 4
    ]
  },

  // ── N₂ + 3 H₂ → 2 NH₃ ──────────────────────────────────────────────────────────────
  {
    id: "ammonia-from-h2", name: "Ammonia · given H₂",
    equation: "N₂ + 3 H₂ → 2 NH₃",
    species: [
      { value: 1, unit: "mol N₂" },
      { value: 3, unit: "mol H₂" },
      { value: 2, unit: "mol NH₃" }
    ],
    given: { value: 9, unit: "mol H₂" },
    questions: [
      { id: "to-nh3", targetUnit: "mol NH₃",
        prompt: "How many mol NH₃ can form?",
        answer: { value: 6, unit: "mol NH₃" } },         // 9 × 2/3 = 6
      { id: "to-n2", targetUnit: "mol N₂",
        prompt: "How many mol N₂ are needed to react all of it?",
        answer: { value: 3, unit: "mol N₂" } }           // 9 × 1/3 = 3
    ]
  },
  {
    id: "ammonia-from-nh3", name: "Ammonia · given NH₃",
    equation: "N₂ + 3 H₂ → 2 NH₃",
    species: [
      { value: 1, unit: "mol N₂" },
      { value: 3, unit: "mol H₂" },
      { value: 2, unit: "mol NH₃" }
    ],
    given: { value: 8, unit: "mol NH₃" },
    questions: [
      { id: "to-h2", targetUnit: "mol H₂",
        prompt: "How many mol H₂ were required to make it?",
        answer: { value: 12, unit: "mol H₂" } },         // 8 × 3/2 = 12
      { id: "to-n2", targetUnit: "mol N₂",
        prompt: "How many mol N₂ were required to make it?",
        answer: { value: 4, unit: "mol N₂" } }           // 8 × 1/2 = 4
    ]
  },

  // ── H₂ + Cl₂ → 2 HCl ───────────────────────────────────────────────────────────────
  {
    id: "hcl-from-cl2", name: "HCl · given Cl₂",
    equation: "H₂ + Cl₂ → 2 HCl",
    species: [
      { value: 1, unit: "mol H₂" },
      { value: 1, unit: "mol Cl₂" },
      { value: 2, unit: "mol HCl" }
    ],
    given: { value: 5, unit: "mol Cl₂" },
    questions: [
      { id: "to-hcl", targetUnit: "mol HCl",
        prompt: "How many mol HCl can form?",
        answer: { value: 10, unit: "mol HCl" } },        // 5 × 2/1 = 10
      { id: "to-h2", targetUnit: "mol H₂",
        prompt: "How many mol H₂ are needed to react all of it?",
        answer: { value: 5, unit: "mol H₂" } }           // 5 × 1/1 = 5
    ]
  },
  {
    id: "hcl-from-hcl", name: "HCl · given HCl",
    equation: "H₂ + Cl₂ → 2 HCl",
    species: [
      { value: 1, unit: "mol H₂" },
      { value: 1, unit: "mol Cl₂" },
      { value: 2, unit: "mol HCl" }
    ],
    given: { value: 6, unit: "mol HCl" },
    questions: [
      { id: "to-cl2", targetUnit: "mol Cl₂",
        prompt: "How many mol Cl₂ were required to make it?",
        answer: { value: 3, unit: "mol Cl₂" } },         // 6 × 1/2 = 3
      { id: "to-h2", targetUnit: "mol H₂",
        prompt: "How many mol H₂ were required to make it?",
        answer: { value: 3, unit: "mol H₂" } }           // 6 × 1/2 = 3
    ]
  }
];

export const ROUNDS = rounds;
