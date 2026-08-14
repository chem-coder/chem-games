/*
  Full-Cell Builder — bench data (content only, no logic).
  Self-contained roster: the builder deliberately does NOT import the three
  card decks (games stay standalone); attributes here are the same numbers
  those decks teach. All potentials are electrode averages vs Li⁺/Li.

  kinds: cathode | anode | salt | cyclic | linear | film
  tags feed the brief checks (energyVol, energyGrav, power, safety, cycle).
*/

export const BENCH = {
  kinds: {
    cathode: { label: "Cathode", slot: "Cathode" },
    anode: { label: "Anode", slot: "Anode" },
    salt: { label: "Salt", slot: "Salt" },
    cyclic: { label: "Cyclic carbonate", slot: "Cyclic" },
    linear: { label: "Linear carbonate", slot: "Linear" },
    film: { label: "Film-former", slot: "Film-former (optional)" },
  },

  components: [
    /* cathodes — v = average discharge potential vs Li⁺/Li */
    { id: "lco", abbr: "LCO", name: "Lithium cobalt oxide", kind: "cathode", v: 3.9, tags: ["energyVol"] },
    { id: "nmc811", abbr: "NMC 811", name: "Nickel-rich NMC", kind: "cathode", v: 3.8, tags: ["energyGrav"] },
    { id: "nca", abbr: "NCA", name: "Nickel cobalt aluminum oxide", kind: "cathode", v: 3.8, tags: ["energyGrav"] },
    { id: "lmo", abbr: "LMO", name: "Manganese spinel", kind: "cathode", v: 4.05, tags: ["power"] },
    { id: "lnmo", abbr: "LNMO", name: "High-voltage spinel", kind: "cathode", v: 4.7, tags: ["power"] },
    { id: "lfp", abbr: "LFP", name: "Lithium iron phosphate", kind: "cathode", v: 3.4, tags: ["safety", "cycle", "power"] },

    /* anodes */
    { id: "graphite", abbr: "Gr", name: "Graphite", kind: "anode", v: 0.1, tags: ["energyVol", "energyGrav"] },
    { id: "si", abbr: "Si", name: "Silicon-dominant", kind: "anode", v: 0.4, tags: ["energyGrav"] },
    { id: "lto", abbr: "LTO", name: "Lithium titanate", kind: "anode", v: 1.55, tags: ["safety", "cycle", "power"] },
    { id: "limetal", abbr: "Li", name: "Lithium metal", kind: "anode", v: 0.0, tags: ["energyGrav"] },

    /* salts */
    { id: "lipf6", abbr: "LiPF6", name: "Lithium hexafluorophosphate", kind: "salt", tags: [] },
    { id: "lifsi", abbr: "LiFSI", name: "Lithium bis(fluorosulfonyl)imide", kind: "salt", tags: ["cold"] },
    { id: "litfsi", abbr: "LiTFSI", name: "Lithium bis(trifluoromethanesulfonyl)imide", kind: "salt", tags: [] },
    { id: "libf4", abbr: "LiBF4", name: "Lithium tetrafluoroborate", kind: "salt", tags: ["cold"] },
    { id: "libob", abbr: "LiBOB", name: "Lithium bis(oxalato)borate", kind: "salt", tags: [] },
    { id: "liclo4", abbr: "LiClO4", name: "Lithium perchlorate", kind: "salt", tags: [] },

    /* cyclic carbonates */
    { id: "ec", abbr: "EC", name: "Ethylene carbonate", kind: "cyclic", tags: [] },
    { id: "pc", abbr: "PC", name: "Propylene carbonate", kind: "cyclic", tags: ["cold"] },

    /* linear carbonates */
    { id: "dmc", abbr: "DMC", name: "Dimethyl carbonate", kind: "linear", tags: [] },
    { id: "dec", abbr: "DEC", name: "Diethyl carbonate", kind: "linear", tags: ["cold"] },
    { id: "emc", abbr: "EMC", name: "Ethyl methyl carbonate", kind: "linear", tags: ["cold"] },

    /* film-formers */
    { id: "vc", abbr: "VC", name: "Vinylene carbonate", kind: "film", tags: [] },
    { id: "fec", abbr: "FEC", name: "Fluoroethylene carbonate", kind: "film", tags: [] },
  ],

  /* ------------------------------------------------ briefs (rung 2) ----- */
  briefs: [
    {
      id: "phone",
      title: "The phone cell",
      ask: "A flagship phone: the battery lives in a millimeters-thin gap, so every milliliter must carry maximum energy. Standard indoor life.",
      needs: [
        { type: "cathodeTag", tag: "energyVol", text: "Cathode chosen for volumetric energy density (dense crystal, high voltage)" },
        { type: "anodeIn", ids: ["graphite", "si"], text: "A high-capacity low-potential anode — graphite or a silicon blend" },
        { type: "minV", v: 3.4, text: "Cell voltage of at least 3.4 V" },
      ],
    },
    {
      id: "ev",
      title: "The long-range EV",
      ask: "A 700-km sedan: gravimetric energy is king — every kilogram of cell mass is range lost. Cobalt-light preferred, but energy first.",
      needs: [
        { type: "cathodeTag", tag: "energyGrav", text: "Nickel-rich cathode for gravimetric energy (NMC 811 / NCA class)" },
        { type: "anodeIn", ids: ["graphite", "si"], text: "Graphite or silicon-blend anode" },
        { type: "minV", v: 3.3, text: "Cell voltage of at least 3.3 V" },
      ],
    },
    {
      id: "powertool",
      title: "The power tool",
      ask: "A circular saw: brutal current spikes, hundreds of charges, cost matters more than weight. It must never die mid-cut.",
      needs: [
        { type: "cathodeTag", tag: "power", text: "A high-rate cathode (spinel channels or nano-olivine)" },
        { type: "anodeIn", ids: ["graphite", "lto"], text: "An anode that takes abuse — graphite or LTO" },
      ],
    },
    {
      id: "home",
      title: "The home battery",
      ask: "A garage wall unit: it sits next to the family car for fifteen years. Safety and cycle life outrank energy — nobody weighs a wall.",
      needs: [
        { type: "cathodeIn", ids: ["lfp"], text: "The safety-benchmark cathode: phosphate-locked oxygen (LFP)" },
        { type: "anodeIn", ids: ["graphite", "lto"], text: "A long-life anode — graphite or zero-strain LTO" },
      ],
    },
    {
      id: "arctic",
      title: "The arctic fleet",
      ask: "Utility drones stationed above the Arctic Circle: −30 °C mornings are routine. The electrolyte must stay liquid and keep conducting.",
      needs: [
        { type: "forbidSolvent", id: "dmc", text: "No DMC — it freezes at 4.6 °C" },
        { type: "saltIn", ids: ["libf4", "lifsi"], text: "A salt that keeps working in the cold (LiBF₄ or LiFSI)" },
        { type: "minV", v: 3.0, text: "Cell voltage of at least 3.0 V" },
      ],
    },
    {
      id: "limetal",
      title: "The lab pouch cell",
      ask: "A research prototype chasing 400 Wh/kg: lithium-metal anode, nickel-rich cathode. Make the chemistry survive itself.",
      needs: [
        { type: "anodeIn", ids: ["limetal"], text: "The lithium-metal anode itself — this is the whole experiment" },
        { type: "cathodeTag", tag: "energyGrav", text: "A nickel-rich cathode to earn the energy target" },
        { type: "requiresFilm", text: "A film-former in the recipe — bare interfaces don't survive research cycling" },
      ],
    },
  ],

  /* ---------------------------------------- diagnose cases (rung 1) ----- */
  /* verdicts are re-derived by the engine in tests — `expectWorks` states
     the teaching intent and the test fails if the engine ever disagrees. */
  cases: [
    {
      id: "lp57", expectWorks: true,
      build: { cathode: "nmc811", anode: "graphite", salt: "lipf6", cyclic: "ec", linear: "emc", film: "vc" },
      hook: "The textbook commercial cell — LP57 with a whisper of VC.",
    },
    {
      id: "tfsi-nca", expectWorks: false,
      build: { cathode: "nca", anode: "graphite", salt: "litfsi", cyclic: "ec", linear: "dmc", film: null },
      hook: "A thermally bulletproof salt in a 3.8 V cell. What could go wrong?",
    },
    {
      id: "tfsi-lfp", expectWorks: true,
      build: { cathode: "lfp", anode: "graphite", salt: "litfsi", cyclic: "ec", linear: "emc", film: null },
      hook: "The same salt that failed at 3.8 V — but look at the cathode.",
    },
    {
      id: "pc-naked", expectWorks: false,
      build: { cathode: "lco", anode: "graphite", salt: "lipf6", cyclic: "pc", linear: "dec", film: null },
      hook: "The 1970s recipe, resurrected: PC on graphite, nothing in the way.",
    },
    {
      id: "pc-saved", expectWorks: true,
      build: { cathode: "lco", anode: "graphite", salt: "libob", cyclic: "pc", linear: "dec", film: null },
      hook: "PC on graphite again — but this time the salt gets there first.",
    },
    {
      id: "si-naked", expectWorks: false,
      build: { cathode: "nca", anode: "si", salt: "lipf6", cyclic: "ec", linear: "emc", film: "vc" },
      hook: "A silicon anode with the classic graphite additive. Close enough?",
    },
    {
      id: "si-fec", expectWorks: true,
      build: { cathode: "nca", anode: "si", salt: "lipf6", cyclic: "ec", linear: "emc", film: "fec" },
      hook: "Same silicon cell, one letter different in the additive.",
    },
    {
      id: "lnmo-dream", expectWorks: false,
      build: { cathode: "lnmo", anode: "graphite", salt: "lipf6", cyclic: "ec", linear: "emc", film: "vc" },
      hook: "Cobalt-free, 4.7 V, huge energy on paper. Ship it?",
    },
    {
      id: "moli", expectWorks: false,
      build: { cathode: "nmc811", anode: "limetal", salt: "lipf6", cyclic: "ec", linear: "emc", film: null },
      hook: "Maximum anode capacity: pure lithium metal in a standard electrolyte.",
    },
    {
      id: "limetal-modern", expectWorks: true,
      build: { cathode: "nmc811", anode: "limetal", salt: "lifsi", cyclic: "ec", linear: "dmc", film: "fec" },
      hook: "Lithium metal again — but with the modern research recipe.",
    },
    {
      id: "perchlorate", expectWorks: false,
      build: { cathode: "lco", anode: "graphite", salt: "liclo4", cyclic: "ec", linear: "dmc", film: null },
      hook: "The favorite salt of a thousand papers, headed for a product.",
    },
    {
      id: "lto-pc", expectWorks: true,
      build: { cathode: "lfp", anode: "lto", salt: "lipf6", cyclic: "pc", linear: "emc", film: null },
      hook: "PC in the recipe and nobody flinches. Why does this one get away with it?",
    },
  ],
};
