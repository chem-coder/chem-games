// Acid / Base Sorter — content only (no logic). Each DECK is a set of classification axes plus
// cards (formula + name + the correct option on every axis). The student sees the formula and
// classifies it; Check reveals the name. Correctness is hand-verified and guarded by
// sorter.test.js (strength ⟺ canonical set; type ⟺ formula has O; form ⟺ formula has OH).
//
// Strong acids (the 7 taught): HCl HBr HI HNO₃ HClO₄ H₂SO₄ HClO₃.
// Strong bases: group I + heavy group II hydroxides: LiOH NaOH KOH Ca(OH)₂ Sr(OH)₂ Ba(OH)₂.

const acids = {
  id: "acids",
  label: "Acids",
  axes: [
    { id: "strength", label: "Strength",
      options: [{ id: "strong", label: "Strong" }, { id: "weak", label: "Weak" }] },
    { id: "protons", label: "Protons",
      options: [{ id: "mono", label: "Monoprotic" }, { id: "poly", label: "Polyprotic" }] },
    { id: "type", label: "Type",
      options: [{ id: "binary", label: "Binary" }, { id: "oxy", label: "Oxyacid" }] }
  ],
  cards: [
    // ── strong (the canonical 7) ──
    { id: "hcl",   formula: "HCl",    name: "hydrochloric acid", answers: { strength: "strong", protons: "mono", type: "binary" } },
    { id: "hbr",   formula: "HBr",    name: "hydrobromic acid",  answers: { strength: "strong", protons: "mono", type: "binary" } },
    { id: "hi",    formula: "HI",     name: "hydroiodic acid",   answers: { strength: "strong", protons: "mono", type: "binary" } },
    { id: "hno3",  formula: "HNO₃",   name: "nitric acid",       answers: { strength: "strong", protons: "mono", type: "oxy" } },
    { id: "hclo4", formula: "HClO₄",  name: "perchloric acid",   answers: { strength: "strong", protons: "mono", type: "oxy" } },
    { id: "hclo3", formula: "HClO₃",  name: "chloric acid",      answers: { strength: "strong", protons: "mono", type: "oxy" } },
    { id: "h2so4", formula: "H₂SO₄",  name: "sulfuric acid",     answers: { strength: "strong", protons: "poly", type: "oxy" } },
    // ── weak ──
    { id: "hf",    formula: "HF",     name: "hydrofluoric acid", answers: { strength: "weak", protons: "mono", type: "binary" } },
    { id: "hcn",   formula: "HCN",    name: "hydrocyanic acid",  answers: { strength: "weak", protons: "mono", type: "binary" } },
    { id: "h2s",   formula: "H₂S",    name: "hydrosulfuric acid",answers: { strength: "weak", protons: "poly", type: "binary" } },
    { id: "ace",   formula: "HC₂H₃O₂",name: "acetic acid",       answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "hno2",  formula: "HNO₂",   name: "nitrous acid",      answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "hclo2", formula: "HClO₂",  name: "chlorous acid",     answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "hclo",  formula: "HClO",   name: "hypochlorous acid", answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "hbro",  formula: "HBrO",   name: "hypobromous acid",  answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "h2co3", formula: "H₂CO₃",  name: "carbonic acid",     answers: { strength: "weak", protons: "poly", type: "oxy" } },
    { id: "h2so3", formula: "H₂SO₃",  name: "sulfurous acid",    answers: { strength: "weak", protons: "poly", type: "oxy" } },
    { id: "h3po4", formula: "H₃PO₄",  name: "phosphoric acid",   answers: { strength: "weak", protons: "poly", type: "oxy" } },
    { id: "h2c2o4",formula: "H₂C₂O₄", name: "oxalic acid",       answers: { strength: "weak", protons: "poly", type: "oxy" } }
  ]
};

const bases = {
  id: "bases",
  label: "Bases",
  axes: [
    { id: "strength", label: "Strength",
      options: [{ id: "strong", label: "Strong" }, { id: "weak", label: "Weak" }] },
    { id: "form", label: "Form",
      options: [{ id: "hydroxide", label: "Metal hydroxide" }, { id: "molecular", label: "Molecular" }] }
  ],
  cards: [
    // ── strong: group I + heavy group II hydroxides ──
    { id: "lioh",  formula: "LiOH",     name: "lithium hydroxide",   answers: { strength: "strong", form: "hydroxide" } },
    { id: "naoh",  formula: "NaOH",     name: "sodium hydroxide",    answers: { strength: "strong", form: "hydroxide" } },
    { id: "koh",   formula: "KOH",      name: "potassium hydroxide", answers: { strength: "strong", form: "hydroxide" } },
    { id: "caoh2", formula: "Ca(OH)₂",  name: "calcium hydroxide",   answers: { strength: "strong", form: "hydroxide" } },
    { id: "sroh2", formula: "Sr(OH)₂",  name: "strontium hydroxide", answers: { strength: "strong", form: "hydroxide" } },
    { id: "baoh2", formula: "Ba(OH)₂",  name: "barium hydroxide",    answers: { strength: "strong", form: "hydroxide" } },
    // ── weak ──
    { id: "nh3",   formula: "NH₃",      name: "ammonia",             answers: { strength: "weak", form: "molecular" } },
    { id: "ch3nh2",formula: "CH₃NH₂",   name: "methylamine",         answers: { strength: "weak", form: "molecular" } },
    { id: "aloh3", formula: "Al(OH)₃",  name: "aluminum hydroxide",  answers: { strength: "weak", form: "hydroxide" } },
    { id: "feoh3", formula: "Fe(OH)₃",  name: "iron(III) hydroxide", answers: { strength: "weak", form: "hydroxide" } }
  ]
};

export const DECKS = [acids, bases];
