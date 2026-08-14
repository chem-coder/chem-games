/*
  Battery Lab — Electrolyte Components deck (content only, no logic).
  Each card: identity, tagline, specs (chip strip), facts (card back),
  claims (quiz statements uniquely true of this component), and mol
  (skeletal-structure drawing data consumed by js/structures.js).

  Drawing frame: y grows downward, any local coordinates — the renderer
  auto-fits. Bond length ~34 px. Unlabeled atoms are skeletal carbons.
  Atom fields: x, y, label?, charge? ('-'/'+'), trim? (label clearance px).
  Bond fields: [a, b, order, opts?] — opts.style 'sym' for symmetric doubles,
  opts.side ±1 picks the offset side of ring doubles, opts.kind 'wedge'|'hash'.
  Facts/claims use unicode sub/superscripts; app.js upgrades them to real
  <sub>/<sup> markup (house subscript rule) before display.
*/

export const DECK = {
  categories: {
    salt:     { label: "Salts",     blurb: "The lithium salt supplies the Li⁺ that carries every ampere. One anion rules industry; the challengers each fix one of its flaws — and pay somewhere else." },
    solvent:  { label: "Solvents",  blurb: "Carbonate solvents dissolve the salt and set viscosity, conductivity, and the temperature window. The art is the blend: one cyclic carbonate for dissociation, one linear for fluidity — and the film-forming cyclic carbonates (VC, FEC, CEC) moonlight here too: additives at heart, co-solvents in practice." },
    additive: { label: "Additives", blurb: "A few percent of the recipe that decides the cell's lifetime. Additives sacrifice themselves on the first charge to build a better SEI than the solvent ever would — FEC's chlorinated ancestor CEC shows where the idea began." },
    all:      { label: "Full mix",  blurb: "The whole cabinet — salts, solvents, and additives shuffled together, the way a real electrolyte recipe (and a real exam) mixes them." },
  },

  cards: [
    /* ------------------------------------------------ salts ------------ */
    {
      id: "lipf6",
      abbr: "LiPF6",
      name: "Lithium hexafluorophosphate",
      category: "salt",
      tagline: "The industry-standard salt — in virtually every commercial cell.",
      formulaHtml: "LiPF<sub>6</sub>",
      specs: ["σ ≈ 10 mS/cm (1 M, EC/DMC)", "unstable above ~70 °C", "M = 151.9 g/mol"],
      facts: [
        "The salt of essentially every commercial lithium-ion cell since the first Sony cell in 1991, used at roughly 1 mol/L in carbonate solvent blends.",
        "It wins by compromise, not excellence: no single property is best-in-class, but it combines good conductivity with a wide voltage window — and, crucially, it passivates the aluminum current collector of the cathode.",
        "Its weakness is fragility: it decomposes to LiF and PF₅ on mild heating, and traces of water hydrolyze it to HF, which attacks both cathode and SEI. This is why electrolytes are made in ppm-level dry rooms.",
      ],
      claims: [
        "The salt found in virtually every commercial lithium-ion cell",
        "Reacts with trace water to form corrosive HF",
        "Chosen not for any best-in-class property but for its balance — including passivating the aluminum current collector",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "P", charge: "-", trim: 11 },
          { x: 0, y: -38, label: "F", trim: 9 },
          { x: 0, y: 38, label: "F", trim: 9 },
          { x: -33, y: 19, label: "F", trim: 10 },
          { x: 33, y: 19, label: "F", trim: 10 },
          { x: -33, y: -19, label: "F", trim: 10 },
          { x: 33, y: -19, label: "F", trim: 10 },
        ],
        bonds: [
          [0, 1, 1], [0, 2, 1],
          [0, 3, 1, { kind: "wedge" }], [0, 4, 1, { kind: "wedge" }],
          [0, 5, 1, { kind: "hash" }], [0, 6, 1, { kind: "hash" }],
        ],
        counterion: "Li+",
      },
    },
    {
      id: "litfsi",
      abbr: "LiTFSI",
      name: "Lithium bis(trifluoromethanesulfonyl)imide",
      category: "salt",
      tagline: "Superbly stable anion — but it eats aluminum above 3.7 V.",
      formulaHtml: "LiN(SO<sub>2</sub>CF<sub>3</sub>)<sub>2</sub>",
      specs: ["thermally stable to ~360 °C", "no HF from moisture", "Al corrosion above ~3.7 V"],
      facts: [
        "A large anion with the negative charge smeared across the whole N(SO₂CF₃)₂ frame, so the salt dissociates superbly. It is thermally stable to about 360 °C and, unlike LiPF₆, does not release HF with moisture.",
        "Its fatal flaw in conventional cells: above about 3.7 V vs Li⁺/Li it pits and corrodes the aluminum current collector, which rules it out as the main salt of standard 4-volt cells.",
        "So it lives elsewhere: it is the favorite salt of solid polymer (PEO) electrolytes, lithium–sulfur cells, and ionic liquids — and at very high concentration the aluminum corrosion is suppressed.",
      ],
      claims: [
        "Corrodes the aluminum current collector above ~3.7 V, ruling it out of standard 4-volt cells",
        "The favorite salt of solid polymer (PEO) electrolytes and lithium–sulfur cells",
        "Thermally stable to ~360 °C and releases no HF with moisture",
      ],
      mol: {
        atoms: [
          { x: 0, y: 26, label: "N", charge: "-", trim: 10 },
          { x: -36, y: 26, label: "S", trim: 10 },
          { x: 36, y: 26, label: "S", trim: 10 },
          { x: -36, y: -10, label: "O", trim: 9 },
          { x: -36, y: 62, label: "O", trim: 9 },
          { x: 36, y: -10, label: "O", trim: 9 },
          { x: 36, y: 62, label: "O", trim: 9 },
          { x: -76, y: 26, label: "F3C", trim: 17 },
          { x: 76, y: 26, label: "CF3", trim: 17 },
        ],
        bonds: [
          [0, 1, 1], [0, 2, 1],
          [1, 3, 2, { style: "sym" }], [1, 4, 2, { style: "sym" }],
          [2, 5, 2, { style: "sym" }], [2, 6, 2, { style: "sym" }],
          [1, 7, 1], [2, 8, 1],
        ],
        counterion: "Li+",
      },
    },
    {
      id: "lifsi",
      abbr: "LiFSI",
      name: "Lithium bis(fluorosulfonyl)imide",
      category: "salt",
      tagline: "TFSI's compact sibling — the star salt of lithium-metal research.",
      formulaHtml: "LiN(SO<sub>2</sub>F)<sub>2</sub>",
      specs: ["conducts better than LiPF6", "LiF-rich SEI", "strong at low temperature"],
      facts: [
        "The compact sibling of TFSI: fluorine sits directly on sulfur. In carbonate solvents it conducts better than LiPF₆ and keeps working at low temperatures where LiPF₆ cells fade.",
        "The star salt of lithium-metal and fast-charging research: its reduction leaves a tough, LiF-rich SEI, and it is the salt of choice in high-concentration and localized-high-concentration electrolytes.",
        "Its manufacturing story matters: early batches carried chloride impurities from synthesis that corroded aluminum, delaying adoption. High-purity LiFSI is now entering commercial cells as a co-salt.",
      ],
      claims: [
        "The go-to salt of lithium-metal and high-concentration electrolyte research",
        "Conducts better than LiPF₆ in carbonates and keeps working in the cold",
        "Early batches were held back by chloride impurities that corroded aluminum",
      ],
      mol: {
        atoms: [
          { x: 0, y: 26, label: "N", charge: "-", trim: 10 },
          { x: -36, y: 26, label: "S", trim: 10 },
          { x: 36, y: 26, label: "S", trim: 10 },
          { x: -36, y: -10, label: "O", trim: 9 },
          { x: -36, y: 62, label: "O", trim: 9 },
          { x: 36, y: -10, label: "O", trim: 9 },
          { x: 36, y: 62, label: "O", trim: 9 },
          { x: -72, y: 26, label: "F", trim: 9 },
          { x: 72, y: 26, label: "F", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [0, 2, 1],
          [1, 3, 2, { style: "sym" }], [1, 4, 2, { style: "sym" }],
          [2, 5, 2, { style: "sym" }], [2, 6, 2, { style: "sym" }],
          [1, 7, 1], [2, 8, 1],
        ],
        counterion: "Li+",
      },
    },
    {
      id: "libob",
      abbr: "LiBOB",
      name: "Lithium bis(oxalato)borate",
      category: "salt",
      tagline: "The fluorine-free salt whose SEI is so good it rescues PC.",
      formulaHtml: "LiB(C<sub>2</sub>O<sub>4</sub>)<sub>2</sub>",
      specs: ["fluorine-free", "limited solubility in carbonates", "usually a 1–2 wt% additive"],
      facts: [
        "A fluorine-free salt: a borate center chelated by two oxalate ligands, giving two five-membered rings that share the boron atom.",
        "Its claim to fame is the SEI it builds: LiBOB reduces sacrificially on graphite and forms a borate-rich protective layer so robust that even propylene carbonate — the notorious graphite-killer — becomes usable. It also stabilizes the aluminum collector.",
        "As a main salt it struggles — limited solubility in carbonates, modest conductivity, sluggish kinetics in the cold — so in commercial practice it usually appears as a 1–2 wt% additive instead.",
      ],
      claims: [
        "Fluorine-free salt whose SEI is robust enough to make propylene carbonate usable with graphite",
        "A borate center chelated by two oxalate ligands",
        "Too poorly soluble to serve as the main salt, so it works as a 1–2 wt% additive",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "B", charge: "-", trim: 10 },
          { x: -26, y: -26, label: "O", trim: 9 },
          { x: -26, y: 26, label: "O", trim: 9 },
          { x: 26, y: -26, label: "O", trim: 9 },
          { x: 26, y: 26, label: "O", trim: 9 },
          { x: -62, y: -15 },
          { x: -62, y: 15 },
          { x: 62, y: -15 },
          { x: 62, y: 15 },
          { x: -93, y: -30, label: "O", trim: 9 },
          { x: -93, y: 30, label: "O", trim: 9 },
          { x: 93, y: -30, label: "O", trim: 9 },
          { x: 93, y: 30, label: "O", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1],
          [1, 5, 1], [2, 6, 1], [5, 6, 1],
          [3, 7, 1], [4, 8, 1], [7, 8, 1],
          [5, 9, 2, { style: "sym" }], [6, 10, 2, { style: "sym" }],
          [7, 11, 2, { style: "sym" }], [8, 12, 2, { style: "sym" }],
        ],
        counterion: "Li+",
      },
    },
    {
      id: "libf4",
      abbr: "LiBF4",
      name: "Lithium tetrafluoroborate",
      category: "salt",
      tagline: "The temperature-extremes specialist, held back by weak dissociation.",
      formulaHtml: "LiBF<sub>4</sub>",
      specs: ["beats LiPF6 at −30 °C and >50 °C", "lower σ at room temperature", "less moisture-sensitive"],
      facts: [
        "The small-anion salt: it outperforms LiPF₆ at both temperature extremes — down around −30 °C and above 50 °C — and is noticeably less sensitive to hydrolysis.",
        "Its handicap shows at room temperature: the compact BF₄⁻ anion pairs strongly with Li⁺, so the salt dissociates poorly and conductivity falls well short of LiPF₆.",
        "That combination makes it a niche player: high-temperature cells, wide-temperature formats, and service as a co-salt or additive alongside LiPF₆.",
      ],
      claims: [
        "Beats LiPF₆ at both temperature extremes but pairs too strongly with Li⁺ to conduct well at room temperature",
        "A compact-anion niche salt for wide-temperature cells and co-salt duty",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "B", charge: "-", trim: 10 },
          { x: 0, y: -38, label: "F", trim: 9 },
          { x: 0, y: 38, label: "F", trim: 9 },
          { x: -38, y: 0, label: "F", trim: 9 },
          { x: 38, y: 0, label: "F", trim: 9 },
        ],
        bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
        counterion: "Li+",
      },
    },
    {
      id: "liclo4",
      abbr: "LiClO4",
      name: "Lithium perchlorate",
      category: "salt",
      tagline: "The beloved lab salt that never ships — it can explode.",
      formulaHtml: "LiClO<sub>4</sub>",
      specs: ["σ ≈ 9 mS/cm (1 M, EC/DMC)", "moisture-tolerant", "strong oxidant — lab only"],
      facts: [
        "The classic academic salt: cheap, easy to dry, insensitive to moisture (no HF chemistry), and nearly as conductive as LiPF₆ — which is why countless research papers use it.",
        "It has never reached commercial cells: perchlorate is a strong oxidant, and combined with organic solvents at high temperature or high current it can react violently — an explosion hazard.",
        "It makes the perfect cautionary card: good electrochemical numbers alone don't ship a material; safety and manufacturability decide.",
      ],
      claims: [
        "The classic lab salt — moisture-tolerant and conductive — kept out of real cells as an explosion hazard",
        "A strong-oxidant anion that can react violently with hot organic solvents",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "Cl", trim: 12 },
          { x: 0, y: -38, label: "O", charge: "-", trim: 9 },
          { x: -34, y: 12, label: "O", trim: 9 },
          { x: 34, y: 12, label: "O", trim: 9 },
          { x: 0, y: 40, label: "O", trim: 9 },
        ],
        bonds: [
          [0, 1, 1],
          [0, 2, 2, { style: "sym" }],
          [0, 3, 2, { style: "sym" }],
          [0, 4, 2, { style: "sym" }],
        ],
        counterion: "Li+",
      },
    },

    /* ---------------------------------------------- solvents ----------- */
    {
      id: "ec",
      abbr: "EC",
      name: "Ethylene carbonate",
      category: "solvent",
      tagline: "The indispensable solvent — its SEI made the graphite anode possible.",
      formulaHtml: "C<sub>3</sub>H<sub>4</sub>O<sub>3</sub>",
      specs: ["ε ≈ 90", "mp ≈ 36 °C — solid at room T!", "bp ≈ 248 °C"],
      facts: [
        "The cyclic carbonate at the heart of nearly every electrolyte: a dielectric constant around 90 — higher than water's 78 — lets it pull LiPF₆ apart into free ions.",
        "Its second job made modern batteries possible: EC reduces at about 0.8 V vs Li⁺/Li on the first charge and builds the passivating SEI film on graphite. The early-1990s discovery that EC protects graphite is what unlocked the graphite anode.",
        "The catch: it is a solid at room temperature (melting point ≈ 36 °C), so it is always blended with thin linear carbonates like DMC or EMC.",
      ],
      claims: [
        "Dielectric constant near 90 — higher than water — for pulling the salt apart into free ions",
        "Its reduction at ~0.8 V builds the graphite SEI that unlocked the modern lithium-ion anode",
        "A solid at room temperature, so it always works in a blend",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32 },
          { x: 30.4, y: 9.9, label: "O", trim: 9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9, label: "O", trim: 9 },
          { x: 0, y: 68, label: "O", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1],
          [0, 5, 2, { style: "sym" }],
        ],
      },
    },
    {
      id: "pc",
      abbr: "PC",
      name: "Propylene carbonate",
      category: "solvent",
      tagline: "One methyl away from EC — and infamous for flaking graphite apart.",
      formulaHtml: "C<sub>4</sub>H<sub>6</sub>O<sub>3</sub>",
      specs: ["ε ≈ 65", "liquid from −49 to 242 °C", "graphite exfoliation!"],
      facts: [
        "EC's methylated cousin and the original 1970s lithium-battery solvent: liquid from −49 °C to 242 °C with a high dielectric constant, so on paper it looks ideal.",
        "Its infamy: PC co-intercalates with Li⁺ between graphite layers and exfoliates the electrode — flakes it apart — instead of forming an SEI. This single failure kept graphite anodes on the shelf until EC replaced it.",
        "It has been partly rehabilitated: hard-carbon anodes tolerate it, and SEI-building salts and additives (LiBOB, VC, FEC) can protect graphite first, letting PC contribute its excellent low-temperature behavior.",
      ],
      claims: [
        "Co-intercalates into graphite and exfoliates it — the failure that delayed the graphite anode",
        "The original 1970s lithium-battery solvent, liquid from −49 to 242 °C",
        "Rehabilitated by hard-carbon anodes and SEI-forming additives",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32 },
          { x: 30.4, y: 9.9, label: "O", trim: 9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9, label: "O", trim: 9 },
          { x: 0, y: 68, label: "O", trim: 9 },
          { x: 38.8, y: -53.4 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1],
          [0, 5, 2, { style: "sym" }],
          [2, 6, 1],
        ],
      },
    },
    {
      id: "dmc",
      abbr: "DMC",
      name: "Dimethyl carbonate",
      category: "solvent",
      tagline: "The thinner: half of the textbook LP30 electrolyte.",
      formulaHtml: "C<sub>3</sub>H<sub>6</sub>O<sub>3</sub>",
      specs: ["η ≈ 0.59 mPa·s", "mp ≈ 4.6 °C", "bp ≈ 90 °C"],
      facts: [
        "The simplest linear carbonate and the classic viscosity thinner: at about 0.59 mPa·s it dilutes syrupy EC so ions can actually move — the EC/DMC pair conducts better than either solvent alone.",
        "Half of the textbook recipe LP30 — 1 M LiPF₆ in EC:DMC 1:1 — the standard electrolyte of research papers for three decades.",
        "Its costs: a dielectric constant of only ~3 (useless alone), a low boiling point of 90 °C that drives flammability, and a melting point of 4.6 °C — it freezes on a cold day, which is why low-temperature blends prefer EMC or DEC.",
      ],
      claims: [
        "The low-viscosity thinner in the textbook LP30 recipe (1 M LiPF₆ in EC:DMC)",
        "Freezes at 4.6 °C — a poor choice for cold-climate blends",
      ],
      mol: {
        atoms: [
          { x: 0, y: 20 },
          { x: 29, y: 3, label: "O", trim: 9 },
          { x: 59, y: 20 },
          { x: 59, y: 56, label: "O", trim: 9 },
          { x: 88, y: 3, label: "O", trim: 9 },
          { x: 118, y: 20 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1],
          [2, 3, 2, { style: "sym" }],
          [2, 4, 1], [4, 5, 1],
        ],
      },
    },
    {
      id: "dec",
      abbr: "DEC",
      name: "Diethyl carbonate",
      category: "solvent",
      tagline: "The cold-weather linear carbonate — ethyl arms, mp −74 °C.",
      formulaHtml: "C<sub>5</sub>H<sub>10</sub>O<sub>3</sub>",
      specs: ["mp ≈ −74 °C", "bp ≈ 126 °C", "more viscous than DMC"],
      facts: [
        "DMC's bigger sibling with ethyl groups on both sides: melting point −74 °C, so blends built on it stay liquid deep into winter where DMC-based ones freeze.",
        "The trade-off runs the other way from DMC: bulkier alkyls mean higher viscosity and somewhat lower conductivity — the classic size-versus-fluidity compromise of the linear carbonates.",
        "Found in the standard recipe LP40 (1 M LiPF₆ in EC:DEC 1:1) and in many low-temperature commercial blends.",
      ],
      claims: [
        "Melting point −74 °C makes it the linear carbonate for cold-weather blends, at the price of viscosity",
        "The ethyl–ethyl half of the standard LP40 recipe",
      ],
      mol: {
        atoms: [
          { x: -29, y: 3 },
          { x: 0, y: 20 },
          { x: 29, y: 3, label: "O", trim: 9 },
          { x: 59, y: 20 },
          { x: 59, y: 56, label: "O", trim: 9 },
          { x: 88, y: 3, label: "O", trim: 9 },
          { x: 118, y: 20 },
          { x: 147, y: 3 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1],
          [3, 4, 2, { style: "sym" }],
          [3, 5, 1], [5, 6, 1], [6, 7, 1],
        ],
      },
    },
    {
      id: "emc",
      abbr: "EMC",
      name: "Ethyl methyl carbonate",
      category: "solvent",
      tagline: "The asymmetric workhorse of modern commercial electrolytes.",
      formulaHtml: "C<sub>4</sub>H<sub>8</sub>O<sub>3</sub>",
      specs: ["mp ≈ −53 °C", "bp ≈ 110 °C", "the linear carbonate of LP57"],
      facts: [
        "The asymmetric linear carbonate — methyl on one side, ethyl on the other. The lopsided shape frustrates crystal packing, so it stays liquid to about −53 °C while remaining thin and fluid.",
        "That balance made it the workhorse of modern commercial electrolytes: today's standard base recipe LP57 is 1 M LiPF₆ in EC:EMC 3:7.",
        "A chemist's quirk: inside a working cell EMC can transesterify — scrambling into its symmetric relatives DMC and DEC, which show up in aged-cell analyses.",
      ],
      claims: [
        "The asymmetric linear carbonate that dominates modern commercial blends (LP57, EC:EMC 3:7)",
        "Can transesterify inside the cell into DMC and DEC",
      ],
      mol: {
        atoms: [
          { x: 0, y: 20 },
          { x: 29, y: 3, label: "O", trim: 9 },
          { x: 59, y: 20 },
          { x: 59, y: 56, label: "O", trim: 9 },
          { x: 88, y: 3, label: "O", trim: 9 },
          { x: 118, y: 20 },
          { x: 147, y: 3 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1],
          [2, 3, 2, { style: "sym" }],
          [2, 4, 1], [4, 5, 1], [5, 6, 1],
        ],
      },
    },

    /* --------------------------------------------- additives ----------- */
    {
      id: "vc",
      abbr: "VC",
      name: "Vinylene carbonate",
      category: "additive",
      also: ["solvent"],
      tagline: "The archetypal SEI additive — 1–2 % that decides the cell's lifetime.",
      formulaHtml: "C<sub>3</sub>H<sub>2</sub>O<sub>3</sub>",
      specs: ["dose 1–2 wt%", "reduces before EC", "polymerizes into the SEI"],
      facts: [
        "EC with a C=C double bond in the ring — and the archetypal SEI-forming additive, dosed at just 1–2 wt% of the electrolyte.",
        "It works by sacrifice: VC reduces at a higher potential than EC, so it reacts first on the fresh graphite surface and polymerizes into a flexible poly(VC)-rich SEI — less first-cycle capacity loss, markedly longer cycle life.",
        "Dose is everything: too much VC thickens the SEI into a resistive blanket and hurts power. Neat VC is so eager to polymerize that it is stored with a stabilizer.",
      ],
      claims: [
        "The classic 1–2 wt% additive that polymerizes into a flexible SEI on graphite",
        "Reduces at a higher potential than EC, sacrificing itself first on the fresh anode",
        "Overdosing it thickens the SEI and hurts power",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32 },
          { x: 30.4, y: 9.9, label: "O", trim: 9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9, label: "O", trim: 9 },
          { x: 0, y: 68, label: "O", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1],
          [2, 3, 2, { side: -1 }],
          [3, 4, 1], [4, 0, 1],
          [0, 5, 2, { style: "sym" }],
        ],
      },
    },
    {
      id: "fec",
      abbr: "FEC",
      name: "Fluoroethylene carbonate",
      category: "additive",
      also: ["solvent"],
      tagline: "One fluorine on EC — the additive that lets silicon anodes survive.",
      formulaHtml: "C<sub>3</sub>H<sub>3</sub>FO<sub>3</sub>",
      specs: ["LiF-rich SEI", "essential for Si anodes", "gases (HF, CO2) when hot"],
      facts: [
        "EC carrying a single fluorine. On reduction it sheds that fluorine as LiF, seeding a thin, tough, LiF-rich SEI.",
        "It is the essential additive for silicon anodes: silicon swells about 300 % on lithiation and shatters ordinary SEI films, but the FEC-derived layer keeps healing — without FEC, silicon cells fade within dozens of cycles. It is also a favorite for lithium-metal work.",
        "Its dark side appears when hot: at elevated temperature FEC decomposes, generating HF and CO₂ — gassing and accelerated aging in FEC-rich cells.",
      ],
      claims: [
        "Sheds its fluorine as LiF to build the tough SEI that lets silicon anodes survive ~300 % swelling",
        "Decomposes when hot, generating HF and CO₂ gas",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32 },
          { x: 30.4, y: 9.9, label: "O", trim: 9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9, label: "O", trim: 9 },
          { x: 0, y: 68, label: "O", trim: 9 },
          { x: 38.8, y: -53.4, label: "F", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1],
          [0, 5, 2, { style: "sym" }],
          [2, 6, 1],
        ],
      },
    },
    {
      id: "cec",
      abbr: "CEC",
      name: "Chloroethylene carbonate",
      category: "additive",
      also: ["solvent"],
      tagline: "FEC's chlorinated ancestor — the 1990s film-former that fluorine retired.",
      formulaHtml: "C<sub>3</sub>H<sub>3</sub>ClO<sub>3</sub>",
      specs: ["Cl on the EC ring", "1990s SEI former", "superseded by FEC"],
      facts: [
        "EC carrying a single chlorine — the halogenated cyclic carbonate that came before FEC. Like its successor, it reduces ahead of the solvent and seeds a halide-rich SEI on graphite.",
        "In the mid-1990s it showed that a small dose of a sacrificial film-former could make graphite cycle even in PC-rich electrolytes — an early proof of concept behind the whole modern additive strategy.",
        "Fluorine retired it: reducing the C–Cl bond leaves chloride and other corrosive byproducts and costs more first-cycle capacity, so once FEC matured, CEC moved to the history section of the review papers.",
      ],
      claims: [
        "EC's chlorinated sibling — the 1990s proof that a sacrificial film-former can protect graphite in PC",
        "Retired because its reduction leaves corrosive chloride byproducts — fluorine does the same job cleaner",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32 },
          { x: 30.4, y: 9.9, label: "O", trim: 9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9, label: "O", trim: 9 },
          { x: 0, y: 68, label: "O", trim: 9 },
          { x: 38.8, y: -53.4, label: "Cl", trim: 11 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1],
          [0, 5, 2, { style: "sym" }],
          [2, 6, 1],
        ],
      },
    },
  ],
};
