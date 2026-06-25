// Canonical ion + element data for the Nomenclature engine. Content only — no logic, no DOM.
// ESM so the engine and its node --test suites import it directly.
//
// THE KEY DESIGN (the thing regex couldn't solve): every ion lists *all* the spellings the course
// accepts — both name aliases (bicarbonate / hydrogen carbonate) and formula aliases
// (acetate = C2H3O2 / CH3COO / CH3CO2). Grading tests membership in these sets; it never tries to
// derive one spelling from another. `names[0]` and `formulas[0]` are the canonical/preferred forms
// used for display. Charges and the "variable" cation list follow Dalia's CHEM-101 keys, which are
// the oracle (e.g. nickel is treated as fixed Ni²⁺ — no Roman numeral — in this course).

// ── Element names (for covalent naming + cation roots) ───────────────────────
// symbol → lowercase element name. Covers every element appearing in the worksheets.
export const ELEMENTS = {
  H: "hydrogen", Li: "lithium", Be: "beryllium", B: "boron", C: "carbon", N: "nitrogen",
  O: "oxygen", F: "fluorine", Na: "sodium", Mg: "magnesium", Al: "aluminum", Si: "silicon",
  P: "phosphorus", S: "sulfur", Cl: "chlorine", K: "potassium", Ca: "calcium", Sc: "scandium",
  V: "vanadium", Cr: "chromium", Mn: "manganese", Fe: "iron", Co: "cobalt", Ni: "nickel",
  Cu: "copper", Zn: "zinc", Ga: "gallium", Ge: "germanium", As: "arsenic", Se: "selenium",
  Br: "bromine", Rb: "rubidium", Sr: "strontium", Y: "yttrium", Ag: "silver", Cd: "cadmium",
  In: "indium", Sn: "tin", Sb: "antimony", Te: "tellurium", I: "iodine", Xe: "xenon",
  Cs: "cesium", Ba: "barium", Au: "gold", Hg: "mercury", Pb: "lead", Po: "polonium", Pt: "platinum"
};

// ── Cations ──────────────────────────────────────────────────────────────────
// Fixed-charge cations carry their charge. Variable cations have `variable: true` and no charge —
// the charge is deduced from the formula (reverse criss-cross) and shown as a Roman numeral.
// `states` lists the oxidation states the course uses, for sanity-checking deduced charges.
export const CATIONS = [
  // Group I (+1)
  { symbol: "Li", charge: 1 }, { symbol: "Na", charge: 1 }, { symbol: "K", charge: 1 },
  { symbol: "Rb", charge: 1 }, { symbol: "Cs", charge: 1 },
  // Group II (+2)
  { symbol: "Be", charge: 2 }, { symbol: "Mg", charge: 2 }, { symbol: "Ca", charge: 2 },
  { symbol: "Sr", charge: 2 }, { symbol: "Ba", charge: 2 },
  // Fixed by course convention
  { symbol: "Al", charge: 3 }, { symbol: "Ga", charge: 3 }, { symbol: "In", charge: 3 },
  { symbol: "Sc", charge: 3 }, { symbol: "Y", charge: 3 },
  { symbol: "Zn", charge: 2 }, { symbol: "Cd", charge: 2 }, { symbol: "Ag", charge: 1 },
  // Variable charge → Roman numeral, deduced (rule: any metal with >1 oxidation state in the reference PT)
  { symbol: "Fe", variable: true, states: [2, 3] },
  { symbol: "Cu", variable: true, states: [1, 2] },
  { symbol: "Cr", variable: true, states: [2, 3, 6] },
  { symbol: "V", variable: true, states: [2, 3, 4, 5] },
  { symbol: "Mn", variable: true, states: [2, 3, 4, 7] },
  { symbol: "Co", variable: true, states: [2, 3] },
  { symbol: "Ni", variable: true, states: [2, 3] }, // +2 common, +3 — gets the numeral per the rule
  { symbol: "Sn", variable: true, states: [2, 4] },
  { symbol: "Pb", variable: true, states: [2, 4] },
  { symbol: "Au", variable: true, states: [1, 3] },
  { symbol: "Hg", variable: true, states: [1, 2] },
  { symbol: "Pt", variable: true, states: [2, 4] },
  { symbol: "Sb", variable: true, states: [3, 5] }
];

// Polyatomic cations (name them like a fixed cation; ammonium is the workhorse).
export const POLY_CATIONS = [
  { id: "ammonium", names: ["ammonium"], formulas: ["NH4"], display: "NH₄", charge: 1 },
  { id: "hydronium", names: ["hydronium"], formulas: ["H3O"], display: "H₃O", charge: 1 }
];

// ── Monoatomic anions ─────────────────────────────────────────────────────────
// `acidStem` is the root used to build the binary acid: chloride → "chlor" → hydrochloric acid.
export const MONO_ANIONS = [
  { id: "hydride", names: ["hydride"], symbol: "H", charge: -1 },
  { id: "fluoride", names: ["fluoride"], symbol: "F", charge: -1, acidStem: "fluor" },
  { id: "chloride", names: ["chloride"], symbol: "Cl", charge: -1, acidStem: "chlor" },
  { id: "bromide", names: ["bromide"], symbol: "Br", charge: -1, acidStem: "brom" },
  { id: "iodide", names: ["iodide"], symbol: "I", charge: -1, acidStem: "iod" },
  { id: "oxide", names: ["oxide"], symbol: "O", charge: -2 },
  { id: "sulfide", names: ["sulfide"], symbol: "S", charge: -2, acidStem: "sulfur" },
  { id: "selenide", names: ["selenide"], symbol: "Se", charge: -2 },
  { id: "telluride", names: ["telluride"], symbol: "Te", charge: -2 },
  { id: "polonide", names: ["polonide"], symbol: "Po", charge: -2 },
  { id: "nitride", names: ["nitride"], symbol: "N", charge: -3 },
  { id: "phosphide", names: ["phosphide"], symbol: "P", charge: -3 },
  { id: "arsenide", names: ["arsenide"], symbol: "As", charge: -3 }
];

// ── Polyatomic anions ──────────────────────────────────────────────────────────
// `acidStem` already includes any hypo-/per- modifier (hypochlorite → "hypochlor" → hypochlorous);
// the -ic / -ous ending is chosen from whether the anion name ends in -ate or -ite.
export const POLY_ANIONS = [
  // single-formula, single-name oxyanions
  { id: "nitrate", names: ["nitrate"], formulas: ["NO3"], display: "NO₃", charge: -1, acidStem: "nitr" },
  { id: "nitrite", names: ["nitrite"], formulas: ["NO2"], display: "NO₂", charge: -1, acidStem: "nitr" },
  { id: "hydroxide", names: ["hydroxide"], formulas: ["OH"], display: "OH", charge: -1 },
  { id: "cyanide", names: ["cyanide"], formulas: ["CN"], display: "CN", charge: -1, acidStem: "cyan" },
  { id: "permanganate", names: ["permanganate"], formulas: ["MnO4"], display: "MnO₄", charge: -1, acidStem: "permangan" },
  { id: "carbonate", names: ["carbonate"], formulas: ["CO3"], display: "CO₃", charge: -2, acidStem: "carbon" },
  { id: "sulfate", names: ["sulfate"], formulas: ["SO4"], display: "SO₄", charge: -2, acidStem: "sulfur" },
  { id: "sulfite", names: ["sulfite"], formulas: ["SO3"], display: "SO₃", charge: -2, acidStem: "sulfur" },
  { id: "phosphate", names: ["phosphate"], formulas: ["PO4"], display: "PO₄", charge: -3, acidStem: "phosphor" },
  { id: "chromate", names: ["chromate"], formulas: ["CrO4"], display: "CrO₄", charge: -2, acidStem: "chrom" },
  { id: "dichromate", names: ["dichromate"], formulas: ["Cr2O7"], display: "Cr₂O₇", charge: -2 },
  { id: "thiosulfate", names: ["thiosulfate"], formulas: ["S2O3"], display: "S₂O₃", charge: -2 },
  { id: "arsenate", names: ["arsenate"], formulas: ["AsO4"], display: "AsO₄", charge: -3, acidStem: "arsen" },
  { id: "borate", names: ["borate"], formulas: ["BO3"], display: "BO₃", charge: -3, acidStem: "bor" },

  // multi-formula / multi-name ions — the accepted-set workhorses
  { id: "acetate", names: ["acetate"], formulas: ["C2H3O2", "CH3COO", "CH3CO2"], display: "C₂H₃O₂", charge: -1, acidStem: "acet" },
  { id: "oxalate", names: ["oxalate"], formulas: ["C2O4"], display: "C₂O₄", charge: -2, acidStem: "oxal" },
  { id: "citrate", names: ["citrate"], formulas: ["C6H5O7"], display: "C₆H₅O₇", charge: -3, acidStem: "citr" },
  { id: "bicarbonate", names: ["bicarbonate", "hydrogen carbonate"], formulas: ["HCO3"], display: "HCO₃", charge: -1 },
  { id: "bisulfate", names: ["bisulfate", "hydrogen sulfate"], formulas: ["HSO4"], display: "HSO₄", charge: -1 },
  { id: "bisulfite", names: ["bisulfite", "hydrogen sulfite"], formulas: ["HSO3"], display: "HSO₃", charge: -1 },
  { id: "biphosphate", names: ["hydrogen phosphate", "biphosphate"], formulas: ["HPO4"], display: "HPO₄", charge: -2 },
  { id: "dihydrogen-phosphate", names: ["dihydrogen phosphate"], formulas: ["H2PO4"], display: "H₂PO₄", charge: -1 },

  // halogen oxyanion families (the hypo-/-ite/-ate/per- ladder), all charge −1
  { id: "hypochlorite", names: ["hypochlorite"], formulas: ["ClO"], display: "ClO", charge: -1, acidStem: "hypochlor" },
  { id: "chlorite", names: ["chlorite"], formulas: ["ClO2"], display: "ClO₂", charge: -1, acidStem: "chlor" },
  { id: "chlorate", names: ["chlorate"], formulas: ["ClO3"], display: "ClO₃", charge: -1, acidStem: "chlor" },
  { id: "perchlorate", names: ["perchlorate"], formulas: ["ClO4"], display: "ClO₄", charge: -1, acidStem: "perchlor" },
  { id: "hypobromite", names: ["hypobromite"], formulas: ["BrO"], display: "BrO", charge: -1, acidStem: "hypobrom" },
  { id: "bromite", names: ["bromite"], formulas: ["BrO2"], display: "BrO₂", charge: -1, acidStem: "brom" },
  { id: "bromate", names: ["bromate"], formulas: ["BrO3"], display: "BrO₃", charge: -1, acidStem: "brom" },
  { id: "perbromate", names: ["perbromate"], formulas: ["BrO4"], display: "BrO₄", charge: -1, acidStem: "perbrom" },
  { id: "hypoiodite", names: ["hypoiodite"], formulas: ["IO"], display: "IO", charge: -1, acidStem: "hypoiod" },
  { id: "iodite", names: ["iodite"], formulas: ["IO2"], display: "IO₂", charge: -1, acidStem: "iod" },
  { id: "iodate", names: ["iodate"], formulas: ["IO3"], display: "IO₃", charge: -1, acidStem: "iod" },
  { id: "periodate", names: ["periodate"], formulas: ["IO4"], display: "IO₄", charge: -1, acidStem: "period" }
];

// Lookups by id (built once).
export const MONO_ANION_BY_ID = Object.fromEntries(MONO_ANIONS.map((a) => [a.id, a]));
export const POLY_ANION_BY_ID = Object.fromEntries(POLY_ANIONS.map((a) => [a.id, a]));
export const CATION_BY_SYMBOL = Object.fromEntries(CATIONS.map((c) => [c.symbol, c]));
export const POLY_CATION_BY_ID = Object.fromEntries(POLY_CATIONS.map((c) => [c.id, c]));
