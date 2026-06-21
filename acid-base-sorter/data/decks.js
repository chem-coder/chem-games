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
  intro: {
    blurb: "Three quick reads before the stack. You'll sort each acid by strength, by how many H⁺ it can give, and by whether it carries oxygen.",
    concepts: [
      { title: "Strong vs Weak",
        text: "A strong acid ionizes completely in water — practically every molecule lets go of its H⁺. A weak acid only partly ionizes; most molecules stay whole. There are just seven strong acids: treat anything not on that list as weak.",
        examples: [
          { label: "Strong (memorize)", items: ["HCl", "HNO₃", "H₂SO₄", "HClO₄"] },
          { label: "Weak (everything else)", items: ["HF", "HC₂H₃O₂", "H₂CO₃"] }
        ] },
      { title: "Monoprotic vs Polyprotic",
        text: "“Protic” counts the H⁺ an acid can donate. Monoprotic gives one; polyprotic gives two or more. Count only the ionizable H — acetic acid has 4 H but donates just one, so it's monoprotic.",
        examples: [
          { label: "Monoprotic", items: ["HCl", "HNO₃", "HC₂H₃O₂"] },
          { label: "Polyprotic", items: ["H₂SO₄", "H₃PO₄"] }
        ] },
      { title: "Binary vs Oxyacid",
        text: "A binary acid is hydrogen plus one nonmetal, no oxygen. An oxyacid contains oxygen — usually H plus a polyatomic oxyanion. The quick test: is there an O in the formula?",
        examples: [
          { label: "Binary (no O)", items: ["HCl", "H₂S", "HCN"] },
          { label: "Oxyacid (has O)", items: ["HNO₃", "H₂SO₄"] }
        ] }
    ],
    pt: {
      title: "The strong binary acids live in the halogen column",
      highlight: { Cl: "halide", Br: "halide", I: "halide", F: "exception" },
      palette: {
        halide: { fill: "var(--accent-soft)", stroke: "var(--accent)", text: "var(--accent-dark)" },
        exception: { fill: "var(--danger-soft)", stroke: "var(--danger-line)", text: "var(--danger)" }
      },
      legend: [
        { cat: "halide", label: "Strong binary acids — HCl, HBr, HI" },
        { cat: "exception", label: "HF is the exception — it's weak" }
      ],
      note: "The three strong binary acids are the halogens just below fluorine. HF breaks the pattern — it's weak. The strong oxyacids (HNO₃, H₂SO₄, HClO₄, HClO₃) have no clean column; they're a separate short list to memorize."
    }
  },
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
  intro: {
    blurb: "Two reads and a periodic-table trick before the stack. The strong-base list is short — and it's sitting right there in the table.",
    concepts: [
      { title: "Strong vs Weak",
        text: "A strong base dissociates completely, releasing all of its OH⁻. The strong bases are a short list: the group 1 hydroxides plus the heavy group 2 hydroxides (Ca, Sr, Ba). Ammonia and most other bases are weak.",
        examples: [
          { label: "Strong (memorize)", items: ["NaOH", "KOH", "Ba(OH)₂"] },
          { label: "Weak (everything else)", items: ["NH₃", "Al(OH)₃"] }
        ] },
      { title: "Metal hydroxide vs Molecular",
        text: "Most bases are metal hydroxides — a metal cation joined to OH⁻. Molecular bases have no OH in the formula; they pull an H⁺ off water instead. The quick test: look for OH.",
        examples: [
          { label: "Metal hydroxide", items: ["NaOH", "Ca(OH)₂"] },
          { label: "Molecular", items: ["NH₃", "CH₃NH₂"] }
        ] },
      { title: "Monoacidic vs Polyacidic",
        text: "This counts how many OH⁻ a base provides (or H⁺ it can neutralize). One makes it monoacidic; two or more, polyacidic. It's the base's mirror of mono/polyprotic for acids.",
        examples: [
          { label: "Monoacidic", items: ["NaOH", "NH₃"] },
          { label: "Polyacidic", items: ["Ca(OH)₂", "Al(OH)₃"] }
        ] }
    ],
    pt: {
      title: "Strong bases sit in two columns",
      highlight: {
        Li: "strong", Na: "strong", K: "strong", Rb: "strong", Cs: "strong", Fr: "strong",
        Ca: "strong", Sr: "strong", Ba: "strong",
        Be: "light", Mg: "light"
      },
      palette: {
        strong: { fill: "var(--success-vivid-soft)", stroke: "var(--success-vivid)", text: "var(--success)" },
        light: { fill: "var(--danger-soft)", stroke: "var(--danger-line)", text: "var(--danger)" }
      },
      legend: [
        { cat: "strong", label: "Group 1 + Ca/Sr/Ba — form strong base hydroxides" },
        { cat: "light", label: "Be, Mg — not strong (Mg(OH)₂ is weak)" }
      ],
      note: "Every group 1 metal forms a strong base hydroxide (LiOH … CsOH). In group 2, only the heavy three — Ca, Sr, Ba — do; Be and Mg don't. That's the whole strong-base list, read straight off the table."
    }
  },
  axes: [
    { id: "strength", label: "Strength",
      options: [{ id: "strong", label: "Strong" }, { id: "weak", label: "Weak" }] },
    { id: "form", label: "Form",
      options: [{ id: "hydroxide", label: "Metal hydroxide" }, { id: "molecular", label: "Molecular" }] },
    { id: "ohcount", label: "OH⁻ given",
      options: [{ id: "mono", label: "One (monoacidic)" }, { id: "poly", label: "Two+ (polyacidic)" }] }
  ],
  cards: [
    // ── strong: soluble group I hydroxides + heavy group II hydroxides (the memorize set) ──
    { id: "lioh",  formula: "LiOH",     name: "lithium hydroxide",   answers: { strength: "strong", form: "hydroxide", ohcount: "mono" } },
    { id: "naoh",  formula: "NaOH",     name: "sodium hydroxide",    answers: { strength: "strong", form: "hydroxide", ohcount: "mono" } },
    { id: "koh",   formula: "KOH",      name: "potassium hydroxide", answers: { strength: "strong", form: "hydroxide", ohcount: "mono" } },
    { id: "rboh",  formula: "RbOH",     name: "rubidium hydroxide",  answers: { strength: "strong", form: "hydroxide", ohcount: "mono" } },
    { id: "csoh",  formula: "CsOH",     name: "cesium hydroxide",    answers: { strength: "strong", form: "hydroxide", ohcount: "mono" } },
    { id: "caoh2", formula: "Ca(OH)₂",  name: "calcium hydroxide",   answers: { strength: "strong", form: "hydroxide", ohcount: "poly" } },
    { id: "sroh2", formula: "Sr(OH)₂",  name: "strontium hydroxide", answers: { strength: "strong", form: "hydroxide", ohcount: "poly" } },
    { id: "baoh2", formula: "Ba(OH)₂",  name: "barium hydroxide",    answers: { strength: "strong", form: "hydroxide", ohcount: "poly" } },
    // ── weak ──
    { id: "nh3",   formula: "NH₃",      name: "ammonia",             answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "ch3nh2",formula: "CH₃NH₂",   name: "methylamine",         answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "aloh3", formula: "Al(OH)₃",  name: "aluminum hydroxide",  answers: { strength: "weak", form: "hydroxide", ohcount: "poly" } },
    { id: "feoh3", formula: "Fe(OH)₃",  name: "iron(III) hydroxide", answers: { strength: "weak", form: "hydroxide", ohcount: "poly" } }
  ]
};

export const DECKS = [acids, bases];
