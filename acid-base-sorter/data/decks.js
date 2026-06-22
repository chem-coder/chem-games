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
    // Order the intro sections (concept ids + the special blocks pt/memorize/naming/molecular).
    order: ["strength", "pt", "memorize", "protons", "type", "naming", "carboxylic", "spellings"],
    concepts: [
      { id: "strength", title: "Strong vs Weak",
        text: "A strong acid ionizes completely in water — practically every molecule lets go of its H⁺. A weak acid only partly ionizes; most molecules stay whole. There are just seven strong acids: treat anything not on that list as weak.",
        examples: [
          { label: "Strong — all 7, memorize", items: ["HCl", "HBr", "HI", "HNO₃", "H₂SO₄", "HClO₃", "HClO₄"] },
          { label: "Weak (everything else)", items: ["HF", "HC₂H₃O₂", "H₂CO₃"] }
        ] },
      { id: "protons", title: "Monoprotic vs Polyprotic",
        text: "“Protic” counts the H⁺ an acid can donate. Monoprotic gives one; polyprotic gives two or more. Count only the ionizable H — acetic acid has 4 H but donates just one, so it's monoprotic.",
        examples: [
          { label: "Monoprotic", items: ["HCl", "HNO₃", "HC₂H₃O₂"] },
          { label: "Polyprotic", items: ["H₂SO₄", "H₃PO₄"] }
        ] },
      { id: "type", title: "Binary vs Oxyacid",
        text: "A binary acid is hydrogen plus one nonmetal, no oxygen. An oxyacid contains oxygen — usually H plus a polyatomic oxyanion. The quick test: is there an O in the formula?",
        examples: [
          { label: "Binary (no O)", items: ["HCl", "H₂S", "HCN"] },
          { label: "Oxyacid (has O)", items: ["HNO₃", "H₂SO₄"] }
        ] },
      { id: "carboxylic", title: "Carboxylic acids — the H hides at the end",
        text: "Most acids write the acidic H first (HCl, HNO₃). But carboxylic acids carry it on a –COOH group, usually written at the END of the formula — so HCOOH, CH₃COOH and C₆H₅COOH are all acids even though they don't start with H. That last H, the one on –COOH, is what ionizes (it's still just monoprotic).",
        examples: [
          { label: "–COOH (acidic H at the end)", items: ["HCOOH", "CH₃COOH", "C₆H₅COOH", "CH₂ClCOOH"] }
        ] },
      { id: "spellings", title: "Same acid, written many ways",
        text: "Don't take \"H at the end\" as a rule, though — people DO write the acidic H at the front too, and the carboxyl group itself shows up as –COOH, –COO, or –CO₂. Acetic acid alone appears a half-dozen ways below; they're all the exact same molecule (its molecular formula C₂H₄O₂ hides which H is acidic, so it's rarely used for acids). The skill is spotting the carboxyl group and its one acidic H, however it's drawn.",
        examples: [
          { label: "Acetic acid — all the same molecule", items: ["CH₃COOH", "CH₃CO₂H", "HC₂H₃O₂", "HCH₃COO", "HCH₃CO₂"] }
        ] }
    ],
    pt: {
      title: "Strong acids on the periodic table",
      highlight: { Cl: ["halide", "central"], Br: "halide", I: "halide", F: "exception", N: "central", S: "central" },
      palette: {
        halide: { fill: "var(--accent-soft)", stroke: "var(--accent)", text: "var(--accent-dark)" },
        central: { fill: "var(--plum-soft)", stroke: "var(--plum)", text: "var(--plum-dark)" },
        exception: { fill: "var(--danger-soft)", stroke: "var(--danger-line)", text: "var(--danger)" }
      },
      legend: [
        { cat: "halide", label: "Strong binary acids — HCl, HBr, HI" },
        { cat: "central", label: "Central atom of a strong oxyacid — N, S, Cl" },
        { cat: "exception", label: "HF is the exception — it's weak" }
      ],
      note: "Two patterns. The binary strong acids are the halogens just below fluorine — HCl, HBr, HI (HF breaks it: it's weak). The strong oxyacids are built around N, S, and Cl — HNO₃, H₂SO₄, HClO₃, HClO₄. Chlorine plays both roles, so its cell is two-toned: HCl is a strong binary acid, and Cl is the central atom of HClO₃/HClO₄."
    },
    memorize: {
      title: "The complete strong-acid list — memorize all 7",
      chunks: [
        { heading: "Oxyacids of N & S", items: [
          { formula: "HNO₃", name: "nitric acid" },
          { formula: "H₂SO₄", name: "sulfuric acid" }
        ] },
        { heading: "Chlorine oxyacids", items: [
          { formula: "HClO₃", name: "chloric acid" },
          { formula: "HClO₄", name: "perchloric acid" }
        ] },
        { heading: "Binary halogen acids", items: [
          { formula: "HCl", name: "hydrochloric acid" },
          { formula: "HBr", name: "hydrobromic acid" },
          { formula: "HI", name: "hydroiodic acid" }
        ] }
      ]
    },
    naming: "Naming note: HCN is hydrocyanic acid — named like a binary acid (hydro-…-ic) and grouped as “binary” even though it has three elements (it's built on the cyanide ion, CN⁻). Here “binary” means “no oxygen,” not “only two elements.” HCN is a weak acid, so it's not on the strong list above.",
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
    { id: "h2c2o4",formula: "H₂C₂O₄", name: "oxalic acid",       answers: { strength: "weak", protons: "poly", type: "oxy" } },
    // more weak acids drawn from the CHEM 1415 Exam 3 Ka table
    { id: "hcooh", formula: "HCOOH",    name: "formic acid",       answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "phcooh",formula: "C₆H₅COOH", name: "benzoic acid",      answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "lactic",formula: "HC₃H₅O₃",  name: "lactic acid",       answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "clace", formula: "CH₂ClCOOH",name: "chloroacetic acid", answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "hoi",   formula: "HOI",      name: "hypoiodous acid",   answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "hio3",  formula: "HIO₃",     name: "iodic acid",        answers: { strength: "weak", protons: "mono", type: "oxy" } },
    { id: "h3po3", formula: "H₃PO₃",    name: "phosphorous acid",  answers: { strength: "weak", protons: "poly", type: "oxy" } }
  ]
};

const bases = {
  id: "bases",
  label: "Bases",
  intro: {
    blurb: "Two reads and a periodic-table trick before the stack. The strong-base list is short — and it's sitting right there in the table.",
    order: ["strength", "pt", "memorize", "form", "ohcount", "molecular"],
    concepts: [
      { id: "strength", title: "Strong vs Weak",
        text: "A strong base dissociates completely, releasing all of its OH⁻. The strong bases are a short list: the group 1 hydroxides plus the heavy group 2 hydroxides (Ca, Sr, Ba). Ammonia and most other bases are weak.",
        examples: [
          { label: "Strong — all 8, memorize", items: ["LiOH", "NaOH", "KOH", "RbOH", "CsOH", "Ca(OH)₂", "Sr(OH)₂", "Ba(OH)₂"] },
          { label: "Weak (everything else)", items: ["NH₃", "Al(OH)₃"] }
        ] },
      { id: "form", title: "Metal hydroxide vs Molecular",
        text: "Most bases are metal hydroxides — a metal cation joined to OH⁻. Molecular bases have no OH in the formula; they pull an H⁺ off water instead. The quick test: look for OH.",
        examples: [
          { label: "Metal hydroxide", items: ["NaOH", "Ca(OH)₂"] },
          { label: "Molecular", items: ["NH₃", "CH₃NH₂"] }
        ] },
      { id: "ohcount", title: "Monoacidic vs Polyacidic",
        text: "This counts how many OH⁻ a base provides (or H⁺ it can neutralize). One makes it monoacidic; two or more, polyacidic. It's the base's mirror of mono/polyprotic for acids.",
        examples: [
          { label: "Monoacidic", items: ["NaOH", "NH₃"] },
          { label: "Polyacidic", items: ["Ca(OH)₂", "Al(OH)₃"] }
        ] }
    ],
    pt: {
      title: "Strong bases sit in two columns",
      highlight: {
        Li: "strong", Na: "strong", K: "strong", Rb: "strong", Cs: "strong",
        Ca: "strong", Sr: "strong", Ba: "strong",
        Fr: "rare",
        Be: "light", Mg: "light"
      },
      palette: {
        strong: { fill: "var(--success-vivid-soft)", stroke: "var(--success-vivid)", text: "var(--success)" },
        rare: { fill: "var(--success-soft)", stroke: "var(--success-line)", text: "var(--success)" },
        light: { fill: "var(--danger-soft)", stroke: "var(--danger-line)", text: "var(--danger)" }
      },
      legend: [
        { cat: "strong", label: "Group 1 + Ca/Sr/Ba — the 8 strong bases to memorize" },
        { cat: "rare", label: "Fr — strong in theory, but radioactive (footnote only)" },
        { cat: "light", label: "Be, Mg — not strong (Mg(OH)₂ is weak)" }
      ],
      note: "Every group 1 metal forms a strong base hydroxide (LiOH … CsOH). In group 2, only the heavy three — Ca, Sr, Ba — do; Be and Mg don't. That's the whole memorize list. (Francium fits the group 1 pattern too, but it's a radioactive footnote — see below.)"
    },
    memorize: {
      title: "The complete strong-base list — memorize all 8",
      chunks: [
        { heading: "Group 1 hydroxides", items: [
          { formula: "LiOH", name: "lithium hydroxide" },
          { formula: "NaOH", name: "sodium hydroxide" },
          { formula: "KOH", name: "potassium hydroxide" },
          { formula: "RbOH", name: "rubidium hydroxide" },
          { formula: "CsOH", name: "cesium hydroxide" }
        ] },
        { heading: "Group 2 hydroxides", items: [
          { formula: "Ca(OH)₂", name: "calcium hydroxide" },
          { formula: "Sr(OH)₂", name: "strontium hydroxide" },
          { formula: "Ba(OH)₂", name: "barium hydroxide" }
        ] }
      ],
      footnote: "FrOH (francium hydroxide) is also a group 1 hydroxide — in theory the strongest base of all — but francium is intensely radioactive and decays almost as fast as it forms, so it's vanishingly rare and FrOH is never studied. It's a footnote, not a memorize item."
    },
    molecular: {
      text: "Not every base is a metal hydroxide. Molecular bases like ammonia and the amines have no OH at all — they accept an H⁺ using a lone pair of electrons (the two dots on N). Count the lone pairs: one means it takes one proton (monoacidic), but hydrazine has a nitrogen on each end — two lone pairs — so it can take two (polyacidic).",
      examples: [
        { name: "ammonia", formula: "NH₃", structure: "ammonia", lonePairs: 1 },
        { name: "methylamine", formula: "CH₃NH₂", structure: "methylamine", lonePairs: 1 },
        { name: "hydrazine", formula: "N₂H₄", structure: "hydrazine", lonePairs: 2 }
      ]
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
    // ── weak: molecular (amines/N bases — accept 1 H⁺ via a lone pair) ──
    { id: "nh3",    formula: "NH₃",      name: "ammonia",             answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "ch3nh2", formula: "CH₃NH₂",   name: "methylamine",         answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "c2h5nh2",formula: "C₂H₅NH₂",  name: "ethylamine",          answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "me2nh",  formula: "(CH₃)₂NH", name: "dimethylamine",       answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "pyridine",formula: "C₅H₅N",   name: "pyridine",            answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "me3n",   formula: "(CH₃)₃N",  name: "trimethylamine",      answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "prnh2",  formula: "C₃H₇NH₂",  name: "propylamine",         answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "piperidine",formula: "C₅H₁₁N",name: "piperidine",          answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    { id: "n2h4",   formula: "N₂H₄",    name: "hydrazine",           answers: { strength: "weak", form: "molecular", ohcount: "poly" } }, // di-acidic: a lone pair on each N
    { id: "aniline",formula: "C₆H₅NH₂",  name: "aniline",             answers: { strength: "weak", form: "molecular", ohcount: "mono" } },
    // ── weak: metal hydroxides (insoluble / sparingly soluble) ──
    { id: "aloh3", formula: "Al(OH)₃",  name: "aluminum hydroxide",  answers: { strength: "weak", form: "hydroxide", ohcount: "poly" } },
    { id: "feoh3", formula: "Fe(OH)₃",  name: "iron(III) hydroxide", answers: { strength: "weak", form: "hydroxide", ohcount: "poly" } },
    { id: "feoh2", formula: "Fe(OH)₂",  name: "iron(II) hydroxide",  answers: { strength: "weak", form: "hydroxide", ohcount: "poly" } },
    { id: "znoh2", formula: "Zn(OH)₂",  name: "zinc hydroxide",      answers: { strength: "weak", form: "hydroxide", ohcount: "poly" } },
    { id: "cuoh2", formula: "Cu(OH)₂",  name: "copper(II) hydroxide",answers: { strength: "weak", form: "hydroxide", ohcount: "poly" } }
  ]
};

// Mix mode: acids and bases together, just two calls per card — acid/base and strong/weak.
// Cards are derived from both decks (so it can never drift), with ids prefixed to stay unique.
const mix = {
  id: "mix",
  label: "Mix",
  roundSize: 10,
  intro: {
    blurb: "Acids and bases together. For each formula make just two calls: is it an acid or a base, and is it strong or weak? It draws from every species in both decks — including some less-common ones, so expect a few you haven't seen.",
    concepts: [
      { title: "Acid or base?",
        text: "Acids donate H⁺ — they start with H, or carry an ionizable H like the –COOH on a carboxylic acid. Bases accept H⁺ — metal hydroxides (an OH group) or molecular bases like ammonia and the amines.",
        examples: [
          { label: "Acids", items: ["HCl", "HNO₃", "CH₃COOH"] },
          { label: "Bases", items: ["NaOH", "NH₃", "Ca(OH)₂"] }
        ] },
      { title: "Strong or weak?",
        text: "Strong = ionizes or dissociates completely: the 7 strong acids and the group 1 + heavy group 2 hydroxides. Everything else is weak. The Acids and Bases intros have the full memorize lists and the periodic-table tricks.",
        examples: [
          { label: "Strong (a few)", items: ["HCl", "H₂SO₄", "KOH", "Ba(OH)₂"] },
          { label: "Weak (a few)", items: ["HF", "CH₃COOH", "NH₃"] }
        ] }
    ]
  },
  axes: [
    { id: "kind", label: "Acid or base?",
      options: [{ id: "acid", label: "Acid" }, { id: "base", label: "Base" }] },
    { id: "strength", label: "Strength",
      options: [{ id: "strong", label: "Strong" }, { id: "weak", label: "Weak" }] }
  ],
  cards: [
    ...acids.cards.map((c) => ({ id: "a-" + c.id, formula: c.formula, name: c.name, answers: { kind: "acid", strength: c.answers.strength } })),
    ...bases.cards.map((c) => ({ id: "b-" + c.id, formula: c.formula, name: c.name, answers: { kind: "base", strength: c.answers.strength } }))
  ]
};

export const DECKS = [acids, bases, mix];
