/*
  Battery Lab — Electrolyte Additives deck (content only, no logic).
  Scope ruling (see battery-lab/README.md): "electrolyte additive" =
  dissolved into the liquid electrolyte before filling, dose ≲5 wt%,
  job = interface chemistry. Sorted BY FUNCTION: SEI formers (anode side),
  CEI & high-voltage (cathode side), Safety (flame + overcharge).
  Schema and mol drawing format identical to the electrolytes deck
  (renderer: shared/js/skeletal.js; format documented in
  electrolytes/data/cards.js).
*/

export const DECK = {
  categories: {
    sei: {
      label: "SEI formers",
      blurb: "The anode-side sacrifices: each reduces before the solvent does and leaves a better film than EC would build alone. A percent or two here decides the first cycle and the ten-thousandth.",
    },
    cei: {
      label: "CEI & high voltage",
      blurb: "The cathode-side counterparts: additives that quiet the oxidizing surface of a charged cathode — sealing it, coordinating to it, or scavenging the HF that attacks it.",
    },
    safety: {
      label: "Safety",
      blurb: "Insurance chemistry: molecules that do nothing all their lives until the one bad day — a flame to starve of radicals, or an overcharge to shut down for good.",
    },
    all: {
      label: "Full mix",
      blurb: "The whole cabinet — a real commercial electrolyte carries three to six of these at once, each hired for one job.",
    },
  },

  cards: [
    /* ------------------------------------------------ SEI formers ------ */
    {
      id: "vc",
      abbr: "VC",
      name: "Vinylene carbonate",
      category: "sei",
      tagline: "The archetype: the additive every other additive is measured against.",
      formulaHtml: "C<sub>3</sub>H<sub>2</sub>O<sub>3</sub>",
      specs: ["dose 1–2 wt%", "reduces before EC", "the reference SEI former"],
      facts: [
        "The C=C in the ring makes VC both easier to reduce than EC and eager to polymerize — so it reaches the fresh graphite surface first and knits a flexible poly(VC)-rich SEI.",
        "It is the benchmark: new SEI additives are published as 'better than VC' or they are not published. Its gains are measured in first-cycle efficiency and cycle life, its cost in impedance when overdosed.",
        "It ages badly on the shelf — neat VC self-polymerizes, so it ships with a radical-scavenger stabilizer (BHT) that battery makers must budget for.",
      ],
      claims: [
        "The benchmark SEI former — new additives are published as better-than-this or not at all",
        "Ships with a BHT stabilizer because it polymerizes in the bottle",
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
      category: "sei",
      tagline: "The fluorine route to the SEI — and silicon's life insurance.",
      formulaHtml: "C<sub>3</sub>H<sub>3</sub>FO<sub>3</sub>",
      specs: ["LiF-rich SEI", "the silicon enabler", "role set by dose (2–30 %)"],
      facts: [
        "Where VC builds a polymer film, FEC builds a mineral one: its reduction sheds fluoride as LiF, and LiF-rich interphases are stiff, thin, and self-healing.",
        "That healing is what silicon and lithium-metal anodes need — surfaces that crack every cycle get resealed. Without FEC, silicon-rich cells fade within dozens of cycles.",
        "Its dose sets its job title: 2–5 % in graphite cells is an additive; 10–30 % in silicon and Li-metal recipes makes it a co-solvent. The downside arrives hot: decomposition to HF and CO₂.",
      ],
      claims: [
        "Builds a mineral LiF film where VC builds a polymer one",
        "The one whose job title changes with dose — additive at 2 %, co-solvent at 30 %",
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
      id: "ps",
      abbr: "PS",
      name: "1,3-Propane sultone",
      category: "sei",
      tagline: "The classic sulfur SEI former — effective, high-temperature-proof, and on the regulators' list.",
      formulaHtml: "C<sub>3</sub>H<sub>6</sub>O<sub>3</sub>S",
      aliases: ["propane sultone", "sultone", "1,3-propane sultone"],
      specs: ["sulfur-based SEI", "strong at high temperature", "REACH-listed carcinogen concern"],
      facts: [
        "A strained five-membered sultone ring that opens on the anode and lays down a sulfonate-rich SEI — noticeably more robust at elevated temperature than carbonate-derived films.",
        "For years it was the standard high-temperature partner to VC in commercial electrolytes, especially in cells destined for hot climates.",
        "Its problem is not electrochemical: 1,3-propane sultone is a listed carcinogen (EU REACH candidate list), and the pressure to replace it is what promoted the cyclic sulfates like DTD.",
      ],
      claims: [
        "The high-temperature sulfur classic that regulation, not chemistry, is retiring",
        "A strained sultone ring that opens on the anode into a sulfonate-rich film",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32, label: "S", trim: 10 },
          { x: 30.4, y: 9.9, label: "O", trim: 9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9 },
          { x: -26, y: 62, label: "O", trim: 9 },
          { x: 26, y: 62, label: "O", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1],
          [0, 5, 2, { style: "sym" }],
          [0, 6, 2, { style: "sym" }],
        ],
      },
    },
    {
      id: "dtd",
      abbr: "DTD",
      name: "Ethylene sulfate",
      category: "sei",
      tagline: "The modern sulfur workhorse — PS's cleaner successor.",
      formulaHtml: "C<sub>2</sub>H<sub>4</sub>O<sub>4</sub>S",
      aliases: ["ethylene sulfate", "1,3,2-dioxathiolane 2,2-dioxide"],
      specs: ["cyclic sulfate", "lowers impedance with VC", "PS's successor"],
      facts: [
        "The cyclic sulfate of ethylene glycol (systematic name 1,3,2-dioxathiolane 2,2-dioxide — hence DTD): PS's chemistry without PS's toxicology file.",
        "Its signature trick is the pairing: VC alone makes a protective but resistive SEI; add DTD and the sulfate chemistry thins the film's impedance while keeping the protection.",
        "It became a fixture of the additive-combination literature — the systematic Dahn-group cell-matrix studies that turned electrolyte design from folklore into tables.",
      ],
      claims: [
        "The cyclic sulfate that inherited the sulfur job when PS hit the REACH list",
        "Famous as VC's partner — it thins the impedance of the film VC builds",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32, label: "S", trim: 10 },
          { x: 30.4, y: 9.9, label: "O", trim: 9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9, label: "O", trim: 9 },
          { x: -26, y: 62, label: "O", trim: 9 },
          { x: 26, y: 62, label: "O", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1],
          [0, 5, 2, { style: "sym" }],
          [0, 6, 2, { style: "sym" }],
        ],
      },
    },
    {
      id: "libob",
      abbr: "LiBOB",
      name: "Lithium bis(oxalato)borate",
      category: "sei",
      tagline: "A salt moonlighting as an additive — borate glue for the SEI, armor for the foil.",
      formulaHtml: "LiB(C<sub>2</sub>O<sub>4</sub>)<sub>2</sub>",
      specs: ["1–2 wt% as additive", "borate-rich SEI", "also passivates Al"],
      facts: [
        "Too poorly soluble to be the main salt, LiBOB found its calling at 1–2 %: it reduces sacrificially on graphite into a robust borate-rich SEI — strong enough to protect graphite even in PC.",
        "It works both jobs at once: on the anode it films, on the cathode side it helps passivate the aluminum collector.",
        "Its oxalate chemistry generates some gas on formation — the price cell makers weigh against its high-temperature cycling gains.",
      ],
      claims: [
        "A failed main salt that succeeded as a 1–2 % additive",
        "Works both ends at once: borate SEI on graphite, aluminum passivation at the cathode",
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
      id: "lino3",
      abbr: "LiNO3",
      name: "Lithium nitrate",
      category: "sei",
      tagline: "The lithium–sulfur battery's one indispensable additive.",
      formulaHtml: "LiNO<sub>3</sub>",
      aliases: ["lithium nitrate", "nitrate"],
      specs: ["Li–S essential", "passivates Li metal", "barely soluble in carbonates"],
      facts: [
        "In lithium–sulfur cells, dissolved polysulfides shuttle to the lithium anode and discharge themselves — LiNO₃ passivates the lithium surface with a nitrate-derived layer that shuts the shuttle down.",
        "The same surface chemistry made it a staple of lithium-metal electrolytes generally: nitrogen-containing interphases plate lithium smoother.",
        "Its limiter is mundane: LiNO₃ barely dissolves in carbonate solvents, so it lives mostly in the ether electrolytes of Li–S and Li-metal work, and researchers spend real effort smuggling it into carbonates.",
      ],
      claims: [
        "The additive that shut down the polysulfide shuttle",
        "Barely dissolves in carbonates — so it works mostly from ether electrolytes",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "N", charge: "+", trim: 10 },
          { x: 0, y: -38, label: "O", trim: 9 },
          { x: -33, y: 19, label: "O", charge: "-", trim: 9 },
          { x: 33, y: 19, label: "O", charge: "-", trim: 9 },
        ],
        bonds: [
          [0, 1, 2, { style: "sym" }],
          [0, 2, 1],
          [0, 3, 1],
        ],
        counterion: "Li+",
      },
    },

    /* ------------------------------------------ CEI & high voltage ----- */
    {
      id: "lidfob",
      abbr: "LiDFOB",
      name: "Lithium difluoro(oxalato)borate",
      category: "cei",
      tagline: "Half BOB, half BF₄ — the hybrid that works both electrodes.",
      formulaHtml: "LiBF<sub>2</sub>(C<sub>2</sub>O<sub>4</sub>)",
      specs: ["BOB × BF4 hybrid", "SEI + CEI in one", "good low-temperature behavior"],
      facts: [
        "Take LiBOB, swap one oxalate for two fluorines, and both parents' virtues survive: the oxalate films electrodes like BOB, the fluorines bring BF₄-like solubility and low-temperature manners.",
        "It is one of the few additives routinely credited on both electrodes at once — oxalate-borate chemistry in the SEI, a stabilizing fluoroborate presence in the CEI, plus aluminum passivation.",
        "That breadth made it a favorite co-salt for high-voltage and lithium-metal cells: a percent of LiDFOB shows up in a remarkable fraction of record-cycling papers.",
      ],
      claims: [
        "One oxalate and two fluorines — deliberately bred from two parent salts",
        "Routinely credited with filming BOTH electrodes plus the aluminum foil",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "B", charge: "-", trim: 10 },
          { x: -26, y: -26, label: "O", trim: 9 },
          { x: -26, y: 26, label: "O", trim: 9 },
          { x: -62, y: -15 },
          { x: -62, y: 15 },
          { x: -93, y: -30, label: "O", trim: 9 },
          { x: -93, y: 30, label: "O", trim: 9 },
          { x: 33, y: -19, label: "F", trim: 9 },
          { x: 33, y: 19, label: "F", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [0, 2, 1],
          [1, 3, 1], [2, 4, 1], [3, 4, 1],
          [3, 5, 2, { style: "sym" }], [4, 6, 2, { style: "sym" }],
          [0, 7, 1], [0, 8, 1],
        ],
        counterion: "Li+",
      },
    },
    {
      id: "lpo2f2",
      abbr: "LiPO2F2",
      name: "Lithium difluorophosphate",
      category: "cei",
      tagline: "The modern star: one percent that flattens impedance growth.",
      formulaHtml: "LiPO<sub>2</sub>F<sub>2</sub>",
      aliases: ["LFO", "difluorophosphate"],
      specs: ["dose ~1 wt%", "drops interfacial impedance", "in situ from LiPF6 + Li2CO3"],
      facts: [
        "The quiet star of the modern cabinet: around 1 % of LiPO₂F₂ builds thin phosphate-rich layers on BOTH electrodes that keep interfacial impedance from growing as the cell ages.",
        "It earned its reputation in nickel-rich cells, where impedance growth at the cathode is the dominant aging mode — LFO-treated cells hold their power noticeably longer.",
        "A chemist's detail: it forms in situ anyway — LiPF₆ reacting with trace Li₂CO₃ makes small amounts of LiPO₂F₂ — and deliberately dosing it just finishes what the cell was already trying to do.",
      ],
      claims: [
        "About one percent of it keeps impedance flat as nickel-rich cells age",
        "The cell makes small amounts of it by itself — dosing it finishes the job deliberately",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "P", trim: 11 },
          { x: 0, y: -38, label: "O", trim: 9 },
          { x: 0, y: 38, label: "O", charge: "-", trim: 9 },
          { x: -38, y: 0, label: "F", trim: 9 },
          { x: 38, y: 0, label: "F", trim: 9 },
        ],
        bonds: [
          [0, 1, 2, { style: "sym" }],
          [0, 2, 1],
          [0, 3, 1],
          [0, 4, 1],
        ],
        counterion: "Li+",
      },
    },
    {
      id: "adn",
      abbr: "ADN",
      name: "Adiponitrile",
      category: "cei",
      tagline: "Two nitrile ends that hold the cathode's hand at high voltage.",
      formulaHtml: "NC(CH<sub>2</sub>)<sub>4</sub>CN",
      aliases: ["adiponitrile", "dinitrile"],
      specs: ["nitrile chelator", "suppresses oxidation >4.3 V", "used in HV smartphone cells"],
      facts: [
        "Nitrile lone pairs coordinate to the transition-metal atoms exposed on a charged cathode surface — a molecular hand over the most oxidizing sites, so the carbonate solvent never touches them.",
        "With a nitrile at each end, adiponitrile can bridge and anchor, which is why dinitriles outperform mononitriles as high-voltage protectants.",
        "This chemistry is a working part of the 4.4–4.5 V doped-LCO cells in smartphones — one of the quiet reasons phone batteries crept up in voltage over a decade.",
      ],
      claims: [
        "Coordinates its nitrile lone pairs to exposed cathode metals so the solvent can't be oxidized there",
        "A two-ended molecule — bridging is why dinitriles beat mononitriles at this job",
      ],
      mol: {
        atoms: [
          { x: 0, y: 20, label: "N≡C", trim: 18 },
          { x: 29, y: 3 },
          { x: 59, y: 20 },
          { x: 88, y: 3 },
          { x: 118, y: 20 },
          { x: 147, y: 3, label: "C≡N", trim: 18 },
        ],
        bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1]],
      },
    },

    /* ------------------------------------------------------ safety ----- */
    {
      id: "tmp",
      abbr: "TMP",
      name: "Trimethyl phosphate",
      category: "safety",
      tagline: "A flame retardant in the tank — phosphorus that starves the fire.",
      formulaHtml: "(CH<sub>3</sub>O)<sub>3</sub>PO",
      aliases: ["trimethyl phosphate", "phosphate flame retardant"],
      specs: ["gas-phase radical scavenger", "trade-off: reduces on graphite", "rescued by high concentration"],
      facts: [
        "In a fire, phosphate vapors release P-radicals that scavenge the H· and OH· radicals a flame lives on — TMP makes the electrolyte itself the extinguisher.",
        "The classic trade-off: TMP co-intercalates and reduces on graphite, wrecking the anode — flame retardancy used to cost you the cell.",
        "Two modern escapes: pair it with strong SEI formers, or use it in (localized) high-concentration electrolytes where every solvent molecule is coordinated to Li⁺ and can't reach the anode — enabling genuinely nonflammable phosphate cells.",
      ],
      claims: [
        "Turns the electrolyte into its own fire extinguisher via gas-phase phosphorus radicals",
        "Classically wrecked graphite anodes until high-concentration recipes tamed it",
        "The centerpiece of nonflammable-electrolyte research — a phosphate doing a solvent's job",
      ],
      mol: {
        atoms: [
          { x: 0, y: 0, label: "P", trim: 11 },
          { x: 0, y: -38, label: "O", trim: 9 },
          { x: -33, y: 19, label: "O", trim: 9 },
          { x: -63, y: 3 },
          { x: 33, y: 19, label: "O", trim: 9 },
          { x: 63, y: 3 },
          { x: 0, y: 44, label: "O", trim: 9 },
          { x: 29, y: 62 },
        ],
        bonds: [
          [0, 1, 2, { style: "sym" }],
          [0, 2, 1], [2, 3, 1],
          [0, 4, 1], [4, 5, 1],
          [0, 6, 1], [6, 7, 1],
        ],
      },
    },
    {
      id: "bp",
      abbr: "BP",
      name: "Biphenyl",
      category: "safety",
      tagline: "The one-shot fuse: it polymerizes shut at overcharge and never comes back.",
      formulaHtml: "C<sub>12</sub>H<sub>10</sub>",
      aliases: ["biphenyl"],
      specs: ["overcharge protector", "polymerizes above ~4.5 V", "sacrificial one-shot"],
      facts: [
        "Biphenyl does nothing until the cell is overcharged past ~4.5 V — then it electro-polymerizes on the cathode into a resistive film and releases gas that can trip the cell's current-interrupt device.",
        "It is a fuse, not a regulator: once blown, the cell is deliberately dead. That is the point — dead is safer than thermal runaway.",
        "This 'shutdown additive' idea guarded consumer cells for years alongside cyclohexylbenzene; battery-management electronics have since taken most of the duty, but the chemistry remains the last line.",
      ],
      claims: [
        "Sits inert for the cell's whole life, then polymerizes it shut at overcharge",
        "A deliberate one-shot: once triggered, the cell is dead by design",
        "Guarded consumer cells alongside cyclohexylbenzene before management electronics took most of the duty",
      ],
      mol: {
        atoms: [
          { x: -12, y: 0 },
          { x: -22, y: 17.3 },
          { x: -42, y: 17.3 },
          { x: -52, y: 0 },
          { x: -42, y: -17.3 },
          { x: -22, y: -17.3 },
          { x: 12, y: 0 },
          { x: 22, y: -17.3 },
          { x: 42, y: -17.3 },
          { x: 52, y: 0 },
          { x: 42, y: 17.3 },
          { x: 22, y: 17.3 },
        ],
        bonds: [
          [0, 1, 2, { side: 1 }], [1, 2, 1], [2, 3, 2, { side: 1 }], [3, 4, 1], [4, 5, 2, { side: 1 }], [5, 0, 1],
          [6, 7, 2, { side: 1 }], [7, 8, 1], [8, 9, 2, { side: 1 }], [9, 10, 1], [10, 11, 2, { side: 1 }], [11, 6, 1],
          [0, 6, 1],
        ],
      },
    },
  ],
};
