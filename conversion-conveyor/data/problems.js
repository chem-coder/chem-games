// Conversion Conveyor — problem packs. Every pack runs on the same dimensional-analysis
// engine; only the conversion factor changes. Units are exact-match tokens.
//   kind "everyday"  -> unit tokens are singular ("wheel"); the UI pluralizes.
//   kind "reaction"  -> unit tokens are full ("mol H₂"); shown as-is, plus a balanced
//                       equation. The factor is the mole ratio read off the coefficients.
// Each problem's answer is hand-checked and guarded by problems.test.js.

const everyday = [
  {
    id: "wheels-to-cars", kind: "everyday",
    prompt: "A toy car needs 4 wheels. You have 12 wheels — how many cars can you build?",
    given: { value: 12, unit: "wheel" }, targetUnit: "car",
    factor: { a: { value: 4, unit: "wheel" }, b: { value: 1, unit: "car" } },
    answer: { value: 3, unit: "car" }
  },
  {
    id: "wheels-to-bikes", kind: "everyday",
    prompt: "Each bike has 2 wheels. You have 14 wheels — how many bikes?",
    given: { value: 14, unit: "wheel" }, targetUnit: "bike",
    factor: { a: { value: 2, unit: "wheel" }, b: { value: 1, unit: "bike" } },
    answer: { value: 7, unit: "bike" }
  },
  {
    id: "petals-to-flowers", kind: "everyday",
    prompt: "Each flower has 5 petals. You collected 30 petals — how many flowers is that?",
    given: { value: 30, unit: "petal" }, targetUnit: "flower",
    factor: { a: { value: 5, unit: "petal" }, b: { value: 1, unit: "flower" } },
    answer: { value: 6, unit: "flower" }
  },
  {
    id: "eggs-to-cartons", kind: "everyday",
    prompt: "A carton holds 12 eggs. You have 36 eggs — how many cartons can you fill?",
    given: { value: 36, unit: "egg" }, targetUnit: "carton",
    factor: { a: { value: 12, unit: "egg" }, b: { value: 1, unit: "carton" } },
    answer: { value: 3, unit: "carton" }
  },
  {
    id: "legs-to-stools", kind: "everyday",
    prompt: "A stool has 3 legs. You have 24 legs — how many stools can you make?",
    given: { value: 24, unit: "leg" }, targetUnit: "stool",
    factor: { a: { value: 3, unit: "leg" }, b: { value: 1, unit: "stool" } },
    answer: { value: 8, unit: "stool" }
  }
];

// Mole-ratio problems: the conversion factor is the ratio of coefficients from the
// balanced equation. Equations/ratios verified by hand against the balancer's set.
const moleRatio = [
  {
    id: "h2-to-h2o", kind: "reaction", equation: "2 H₂ + O₂ → 2 H₂O",
    prompt: "You have 6 mol H₂. Using the balanced equation, how many mol of H₂O can form?",
    given: { value: 6, unit: "mol H₂" }, targetUnit: "mol H₂O",
    factor: { a: { value: 2, unit: "mol H₂" }, b: { value: 2, unit: "mol H₂O" } },
    answer: { value: 6, unit: "mol H₂O" }
  },
  {
    id: "h2-to-nh3", kind: "reaction", equation: "N₂ + 3 H₂ → 2 NH₃",
    prompt: "You have 9 mol H₂. How many mol of NH₃ can form?",
    given: { value: 9, unit: "mol H₂" }, targetUnit: "mol NH₃",
    factor: { a: { value: 3, unit: "mol H₂" }, b: { value: 2, unit: "mol NH₃" } },
    answer: { value: 6, unit: "mol NH₃" }
  },
  {
    id: "n2-to-nh3", kind: "reaction", equation: "N₂ + 3 H₂ → 2 NH₃",
    prompt: "You have 4 mol N₂. How many mol of NH₃ can form?",
    given: { value: 4, unit: "mol N₂" }, targetUnit: "mol NH₃",
    factor: { a: { value: 1, unit: "mol N₂" }, b: { value: 2, unit: "mol NH₃" } },
    answer: { value: 8, unit: "mol NH₃" }
  },
  {
    id: "cl2-to-hcl", kind: "reaction", equation: "H₂ + Cl₂ → 2 HCl",
    prompt: "You have 5 mol Cl₂. How many mol of HCl can form?",
    given: { value: 5, unit: "mol Cl₂" }, targetUnit: "mol HCl",
    factor: { a: { value: 1, unit: "mol Cl₂" }, b: { value: 2, unit: "mol HCl" } },
    answer: { value: 10, unit: "mol HCl" }
  },
  {
    id: "o2-to-h2o", kind: "reaction", equation: "2 H₂ + O₂ → 2 H₂O",
    prompt: "You have 4 mol O₂. How many mol of H₂O can form?",
    given: { value: 4, unit: "mol O₂" }, targetUnit: "mol H₂O",
    factor: { a: { value: 1, unit: "mol O₂" }, b: { value: 2, unit: "mol H₂O" } },
    answer: { value: 8, unit: "mol H₂O" }
  }
];

export const PACKS = [
  { id: "everyday", label: "Everyday", problems: everyday },
  { id: "mole-ratio", label: "Mole ratios", problems: moleRatio }
];
