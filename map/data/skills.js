// The skills map: one tile per topic of the universe (documentation/TOPIC_UNIVERSE_PLAN.md),
// levels = the topic's ladder tiers, edges = the beginner track order. Names come from
// map/locale/{en,ru}.js under the same ids. `unlock` = points needed on this skill before
// the skills that require it open. `href` = where the skill's games live (null = not built).
// `col`/`row` place the tile on the map grid (columns run left to right by chapter).
export const SKILLS = [
  { id: "charges", symbol: "charges", levels: 0, storyboard: "plus-minus", unlock: 1, href: null, col: 0, row: 2 },
  { id: "atomic-structure", symbol: "atom", levels: 6, unlock: 1, href: "../atomic-structure/", requires: [{ skill: "charges" }], col: 1, row: 2 },
  { id: "periodic-system", symbol: "table", levels: 3, unlock: 1, href: "../periodic-table/", requires: [{ skill: "atomic-structure", points: 1 }], col: 2, row: 2 },
  { id: "formulas-ions", symbol: "ions", levels: 2, unlock: 1, href: "../nomenclature/", requires: [{ skill: "periodic-system" }], col: 3, row: 1 },
  { id: "nomenclature", symbol: "name", levels: 5, unlock: 1, href: "../nomenclature/builder/", requires: [{ skill: "formulas-ions" }], col: 4, row: 1 },
  { id: "measurement", symbol: "measure", levels: 4, unlock: 1, href: "../conversion-conveyor/", requires: [{ skill: "charges" }], col: 1, row: 4 },
  { id: "mole", symbol: "mole", levels: 3, unlock: 1, href: null, requires: [{ skill: "nomenclature" }, { skill: "measurement" }], col: 5, row: 2 },
  { id: "equations", symbol: "balance", levels: 3, unlock: 1, href: "../imat-chem-stoichiometry/", requires: [{ skill: "nomenclature" }], col: 5, row: 0 },
  { id: "stoichiometry", symbol: "factory", levels: 4, unlock: 1, href: "../conversion-builder/", requires: [{ skill: "mole" }, { skill: "equations" }], col: 6, row: 1 },
  { id: "bonds", symbol: "bond", levels: 3, unlock: 1, href: null, requires: [{ skill: "periodic-system" }], col: 3, row: 3 },
  { id: "shape", symbol: "shape", levels: 3, unlock: 1, href: "../shape-lab/", requires: [{ skill: "bonds" }], col: 4, row: 3 },
  { id: "imf", symbol: "imf", levels: 2, unlock: 1, href: null, requires: [{ skill: "shape" }], col: 5, row: 4 },
  { id: "gases", symbol: "gas", levels: 4, unlock: 1, href: "../chem-gas-laws/", requires: [{ skill: "measurement" }], col: 2, row: 5 },
  { id: "solutions", symbol: "solution", levels: 3, unlock: 1, href: null, requires: [{ skill: "stoichiometry" }, { skill: "imf" }], col: 7, row: 3 },
  { id: "thermo", symbol: "fire", levels: 3, unlock: 1, href: null, requires: [{ skill: "stoichiometry" }], col: 7, row: 0 },
  { id: "kinetics", symbol: "clock", levels: 2, unlock: 1, href: null, requires: [{ skill: "thermo" }], col: 8, row: 0 },
  { id: "equilibrium", symbol: "scales", levels: 3, unlock: 1, href: null, requires: [{ skill: "kinetics" }, { skill: "solutions" }], col: 9, row: 1 },
  { id: "acids-bases", symbol: "acid", levels: 2, unlock: 1, href: "../acid-base-sorter/", requires: [{ skill: "solutions" }], col: 8, row: 3 },
  { id: "ph", symbol: "ph", levels: 6, unlock: 1, href: "../ph-lab/", requires: [{ skill: "acids-bases" }, { skill: "equilibrium" }], col: 10, row: 2 },
  { id: "aqueous", symbol: "buffer", levels: 3, unlock: 1, href: null, requires: [{ skill: "ph" }], col: 11, row: 2 },
  { id: "redox", symbol: "redox", levels: 4, unlock: 1, href: "../oxidation-state-trainer/", requires: [{ skill: "equations" }], col: 6, row: 5 },
  { id: "electrochem", symbol: "cell", levels: 2, unlock: 1, href: "../battery-lab/", requires: [{ skill: "redox" }], col: 8, row: 5 },
  { id: "organic-structure", symbol: "carbon", levels: 2, unlock: 1, href: "../organic-nomenclature/builder/", requires: [{ skill: "shape" }], col: 9, row: 4 },
  { id: "organic-nomenclature", symbol: "chain", levels: 9, unlock: 1, href: "../organic-nomenclature/", requires: [{ skill: "organic-structure" }], col: 10, row: 4 },
  { id: "organic-reactions", symbol: "flask", levels: 3, unlock: 1, href: "../organic-nomenclature/reactions/", requires: [{ skill: "organic-nomenclature" }], col: 11, row: 4 }
];

export const SKILLS_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// Line icons in the alchemical manner, one per symbol id, drawn in a 40×40 box.
// Stroke only, so they take the theme's colours.
export const SYMBOLS = {
  charges: "M12 20h8M16 16v8M24 20h6",
  atom: "M20 20m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M20 20m-13 0a13 13 0 1 0 26 0a13 13 0 1 0-26 0M20 20m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0",
  table: "M8 10h24v22H8zM8 18h24M8 26h24M16 10v22M24 10v22",
  ions: "M14 20m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M11 20h6M14 17v6M28 20m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M25 20h6",
  name: "M9 30V10l11 14 11-14v20",
  measure: "M8 26h24v6H8zM12 26v-4M18 26v-6M24 26v-4M30 26v-6M8 14h24",
  mole: "M20 8l10 6v12l-10 6-10-6V14zM20 8v24M10 14l20 12M30 14L10 26",
  balance: "M20 8v24M8 14h24M8 14l-4 8h8zM32 14l-4 8h8zM14 32h12",
  factory: "M8 32V18l8 6v-6l8 6v-6l8 6v8zM12 12h4v6h-4z",
  bond: "M12 20m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M28 20m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M17 18h6M17 22h6",
  shape: "M20 8l12 20H8zM20 8v20M8 28l12-8 12 8",
  imf: "M8 14c4-4 8 4 12 0s8 4 12 0M8 20c4-4 8 4 12 0s8 4 12 0M8 26c4-4 8 4 12 0s8 4 12 0",
  gas: "M20 20m-11 0a11 11 0 1 0 22 0a11 11 0 1 0-22 0M14 16m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M25 23m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M22 13m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  solution: "M12 8h16v8l5 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2l5-14zM14 24h12",
  fire: "M20 8c6 6 8 10 8 15a8 8 0 0 1-16 0c0-3 1-5 3-7 0 3 1 5 3 5 0-5 1-9 2-13z",
  clock: "M20 20m-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0M20 12v8l6 4",
  scales: "M20 8v24M12 32h16M8 16l-4 8h8zM32 16l-4 8h8zM10 14h20",
  acid: "M16 8h8M18 8v8l-7 14a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3l-7-14V8",
  ph: "M8 30h24M8 30V12M12 22h4M14 20v4M24 22h4",
  buffer: "M8 24h24M8 16h24M12 12v20M28 12v20",
  redox: "M8 20h10M13 15l5 5-5 5M22 20h10M27 15l5 5-5 5",
  cell: "M8 16h18v8H8zM26 18h4v4h-4zM12 20h6M14 18v4",
  carbon: "M20 20m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M20 17V9M20 23v8M17 18l-7-4M23 18l7-4M17 22l-7 4M23 22l7 4",
  chain: "M6 24l7-8 7 8 7-8 7 8M13 16v-6M27 16v-6",
  flask: "M16 8h8M18 8v9l-8 13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2l-8-13V8M13 26h14"
};
