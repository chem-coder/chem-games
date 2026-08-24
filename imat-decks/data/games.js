// Chem Games linked from the reveal of a drill card.
//
// Lookup order: the question's `sub` tag first, then its deck. So a deck can
// have a broad fallback while individual question types point somewhere sharper
// — every redox card goes to the Ox-State Trainer, but a stoichiometry deck
// splits three ways between Ratio Factory, the Balancer and Conversion Builder.
//
// A question with no match shows no link. That is deliberate: a loose link is
// worse than none, because it sends him off to drill the wrong skill.

export const GAMES = {
  phLab:               { name: "pH Lab",                    href: "../ph-lab/" },
  acidBaseSorter:      { name: "Acid / Base Sorter",        href: "../acid-base-sorter/" },
  shapeLab:            { name: "Shape Lab",                 href: "../shape-lab/" },
  ratioFactory:        { name: "Ratio Factory",             href: "../ratio-factory/" },
  equationBalancer:    { name: "Visual Equation Balancer",  href: "../imat-chem-stoichiometry/" },
  conversionBuilder:   { name: "Conversion Builder",        href: "../conversion-builder/" },
  gasLaws:             { name: "Gas Laws",                  href: "../chem-gas-laws/" },
  oxStateTrainer:      { name: "Oxidation-State Trainer",   href: "../oxidation-state-trainer/" },
  periodicSystem:      { name: "The Periodic System",       href: "../periodic-table/" },
  trendLadder:         { name: "Trend Ladder",              href: "../periodic-table/trends/" },
  nameBuilder:         { name: "Chemical Nomenclature",     href: "../nomenclature/builder/" },
  ionTrainer:          { name: "Polyatomic Ion Trainer",    href: "../nomenclature/" },
  organicNomenclature: { name: "Organic Nomenclature",      href: "../organic-nomenclature/" },
  organicReactions:    { name: "Organic Reactions",         href: "../organic-nomenclature/reactions/" },
  moleculeBuilder:     { name: "Molecule Builder",          href: "../organic-nomenclature/builder/" },
};

// Question-level: keyed by the `sub` tag exactly as it appears in decks.js.
export const GAME_BY_SUB = {
  // acids & bases — arithmetic goes to pH Lab, classification to the Sorter
  "pH of strong acid": "phLab",
  "strong acid pH": "phLab",
  "pH calculation": "phLab",
  "pH of base via Kw": "phLab",
  "weak acid pH": "phLab",
  "pH after dilution": "phLab",
  "pH change on dilution": "phLab",
  "pH and H+ concentration": "phLab",
  "pH ordering of solutions": "phLab",
  "weak vs strong acids": "acidBaseSorter",
  "weak diprotic acid identification": "acidBaseSorter",
  "identify acid-base reaction": "acidBaseSorter",
  "salt hydrolysis": "acidBaseSorter",
  "salt solutions": "acidBaseSorter",

  // bonding — only the shape-and-polarity half has a game
  "VSEPR geometry": "shapeLab",
  "VSEPR shape angle": "shapeLab",
  "molecular geometry": "shapeLab",
  "molecular geometry, bond angles": "shapeLab",
  "molecular polarity": "shapeLab",
  "molecular shape and polarity": "shapeLab",
  "dipole moment and geometry": "shapeLab",
  "linear geometry, acidic oxide": "shapeLab",

  // stoichiometry — splits three ways
  "limiting reagent masses": "ratioFactory",
  "mole ratios, limiting reagent": "ratioFactory",
  "gas volumes limiting reagent": "ratioFactory",
  "balanced equation selection": "equationBalancer",
  "balancing combustion equation": "equationBalancer",
  "ionic equation, precipitation": "equationBalancer",
  "net ionic equation": "equationBalancer",
  "reaction type classification": "equationBalancer",
  "Avogadro atom count": "conversionBuilder",
  "moles and molar volume": "conversionBuilder",
  "molar mass calculation": "conversionBuilder",
  "solution stoichiometry": "conversionBuilder",
  "empirical formula": "conversionBuilder",
  "formula from composition": "conversionBuilder",

  // solutions — the unit-conversion half
  "dilution calculation": "conversionBuilder",
  "mol/L to g/L conversion": "conversionBuilder",
  "mass from molarity": "conversionBuilder",
  "ion moles from molarity": "conversionBuilder",
  "solubility unit conversion": "conversionBuilder",

  // periodic trends get the ladder; everything else falls back to the hub
  "atomic radius trend": "trendLadder",
  "first ionisation energy trend": "trendLadder",
  "ionisation energy trend": "trendLadder",
  "group 7 trends": "trendLadder",

  // inorganic naming — formulas to the Name Builder, charges to the Ion Trainer
  "Roman numerals": "nameBuilder",
  "classical names": "nameBuilder",
  "acid names": "nameBuilder",
  "salt formula validity": "nameBuilder",
  "lithium compound formulas": "nameBuilder",
  "criss-cross": "ionTrainer",

  // organic structure — isomers and formulas are what the sandbox is for
  "molecular formula from structure": "moleculeBuilder",
  "structural isomer identification": "moleculeBuilder",
  "structural isomerism": "moleculeBuilder",
  "structural isomers": "moleculeBuilder",
  "counting structural isomers": "moleculeBuilder",
  "isomer definition": "moleculeBuilder",
  "aromatic molecular formulae": "moleculeBuilder",
  "counting H from names": "moleculeBuilder",
};

// Deck-level fallback, used when the `sub` tag has no entry above.
// Decks left out here (matter, atomic structure, equilibrium, kinetics) have no
// game that drills them yet.
export const GAME_BY_DECK = {
  "gas-laws": "gasLaws",
  "redox-electrochem": "oxStateTrainer",
  "periodic-table": "periodicSystem",
  "organic-nomenclature-groups": "organicNomenclature",
  "organic-reactions": "organicReactions",
};
