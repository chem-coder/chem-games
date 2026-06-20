// Conversion Conveyor — everyday problems (Tier 1: one conversion factor).
// Each problem converts `given` into `targetUnit` using a single `factor` that relates
// the two units. The learner must orient the factor so the starting unit cancels.
// Units are singular tokens; the UI pluralizes for display.
export const PROBLEMS = [
  {
    id: "wheels-to-cars",
    prompt: "A toy car needs 4 wheels. You have 12 wheels — how many cars can you build?",
    given: { value: 12, unit: "wheel" },
    targetUnit: "car",
    factor: { a: { value: 4, unit: "wheel" }, b: { value: 1, unit: "car" } },
    answer: { value: 3, unit: "car" }
  },
  {
    id: "wheels-to-bikes",
    prompt: "Each bike has 2 wheels. You have 14 wheels — how many bikes?",
    given: { value: 14, unit: "wheel" },
    targetUnit: "bike",
    factor: { a: { value: 2, unit: "wheel" }, b: { value: 1, unit: "bike" } },
    answer: { value: 7, unit: "bike" }
  },
  {
    id: "petals-to-flowers",
    prompt: "Each flower has 5 petals. You collected 30 petals — how many flowers is that?",
    given: { value: 30, unit: "petal" },
    targetUnit: "flower",
    factor: { a: { value: 5, unit: "petal" }, b: { value: 1, unit: "flower" } },
    answer: { value: 6, unit: "flower" }
  },
  {
    id: "eggs-to-cartons",
    prompt: "A carton holds 12 eggs. You have 36 eggs — how many cartons can you fill?",
    given: { value: 36, unit: "egg" },
    targetUnit: "carton",
    factor: { a: { value: 12, unit: "egg" }, b: { value: 1, unit: "carton" } },
    answer: { value: 3, unit: "carton" }
  },
  {
    id: "legs-to-stools",
    prompt: "A stool has 3 legs. You have 24 legs — how many stools can you make?",
    given: { value: 24, unit: "leg" },
    targetUnit: "stool",
    factor: { a: { value: 3, unit: "leg" }, b: { value: 1, unit: "stool" } },
    answer: { value: 8, unit: "stool" }
  }
];
