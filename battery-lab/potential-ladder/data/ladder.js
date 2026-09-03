/*
  Potential Ladder — content (no logic).
  All potentials vs Li⁺/Li (battery convention; add −3.04 V to convert to
  SHE). Unicode sub/superscripts in strings; the app upgrades markup.
  Three rungs: the ladder (placement), half-reactions & who moves (MCQ +
  typed), collectors & corrosion (ordering + MCQ + typed — the four-step
  Al-corrosion mechanism is the owner's own figure, kept verbatim in spirit).
*/

export const LADDER = {
  intros: {
    ladder: {
      lede: "Every species in a cell sits somewhere on one voltage axis. Learn the axis and most battery behavior stops being mysterious — a cell is just two rungs held apart.",
      steps: [
        "Every electrode couple has a potential measured against the same yardstick. Batteries use Li⁺/Li as zero; add −3.04 V to convert to the aqueous SHE scale — lithium is the most reducing practical metal, which is why it's here at all.",
        "A cell is two rungs of the ladder held apart: cell voltage = the gap. NMC (3.8 V) over graphite (0.1 V) = 3.7 V.",
        "The electrolyte draws cliffs on the ladder: below ~0.8 V carbonates reduce (that's the SEI forming), above ~4.5 V they oxidize. Everything either lives between the cliffs or survives outside them by armor.",
      ],
      example: "Water's whole stability window is 1.23 V. A 3.7 V cell simply cannot exist in water — that single number is why the field went to organic carbonates.",
    },
    half: {
      lede: "Every electrode reaction is a half-reaction, and the bookkeeping never lies: mass balances, charge balances, and somebody's oxidation state moves.",
      steps: [
        "In every intercalation electrode, lithium is ALWAYS Li⁺ — the shuttle, never the worker. The electron's real partner is the transition metal (or, in Li-rich cathodes, the lattice oxygen itself).",
        "On charge the cathode is oxidized (Li⁺ leaves, the metal's oxidation state climbs) and the anode is reduced. On discharge everything runs backward.",
        "Electrons must balance: one Li⁺ out means exactly one e⁻ out. If an option's electrons don't match its lithiums, it's wrong — no chemistry needed.",
      ],
      example: "LiFePO₄ ⇌ FePO₄ + Li⁺ + e⁻ at 3.45 V. Iron does the work: Fe²⁺ → Fe³⁺. Phosphorus stays +5, oxygen stays −2 — the phosphate is scaffolding.",
    },
    corrosion: {
      lede: "Two metals carry all the current and do no chemistry — until conditions push them off their perch. Copper collects the anode, aluminum the cathode, and each survives at exactly one end.",
      steps: [
        "Copper at the anode: Cu won't alloy with lithium at 0 V, so it just sits there — but drain the cell too deep and the anode potential climbs to ~3.4 V, where copper dissolves and later re-plates as dendrites.",
        "Aluminum at the cathode: bare Al would oxidize at ~1.4 V, yet it survives 4.4 V — armor only. Native Al₂O₃ plus AlF₃ (a gift from LiPF₆'s fluoride) seal the surface.",
        "When the armor fails, corrosion runs in four steps — oxide breakdown, metal oxidation, complex formation, dissolution. LiTFSI's sin is step four: its Al complexes are SOLUBLE, so the wound never seals.",
      ],
      example: "① Al₂O₃ → 2 Al³⁺(ad) + 3/2 O₂ + 6 e⁻  ② Al → Al³⁺(ad) + 3 e⁻  ③ Al³⁺(ad) + anion/solvent → Al-complexes(ad)  ④ Al-complexes(ad) → Al-complexes(sol)",
    },
  },

  /* ---------------- rung 1: the ladder (placement) ---------------- */
  species: [
    { id: "limetal", label: "Li plating — Li⁺/Li", v: 0.0, note: "The zero of the battery world (−3.04 V vs SHE). Below this, metal grows." },
    { id: "graphite", label: "Lithiated graphite — LiC₆", v: 0.1, note: "So close to plating that fast charging flirts with disaster." },
    { id: "lial", label: "Al–Li alloying — LiAl/Al", v: 0.3, note: "Why aluminum can never collect the anode: at the anode's potential it stops being a spectator." },
    { id: "si", label: "Silicon — Li₁₅Si₄/Si", v: 0.4, note: "The alloying anode's average perch." },
    { id: "lto", label: "Titanate — Li₇Ti₅O₁₂/Li₄Ti₅O₁₂", v: 1.55, note: "Ti⁴⁺/Ti³⁺. Too high to plate lithium or form SEI — safety bought with voltage." },
    { id: "cu", label: "Copper dissolution — Cu²⁺/Cu", v: 3.4, note: "The overdischarge cliff: drain a cell too far and the anode's copper foil dissolves." },
    { id: "lfp", label: "LFP — Fe³⁺/Fe²⁺ in phosphate", v: 3.45, note: "The dead-flat plateau. A whisker above the copper cliff." },
    { id: "nmc", label: "NMC — Ni⁴⁺/Ni²⁺ (average)", v: 3.8, note: "Nickel earns the energy; manganese holds the frame." },
    { id: "lmo", label: "LMO spinel — Mn⁴⁺/Mn³⁺", v: 4.05, note: "The 4-volt manganese couple." },
    { id: "lnmo", label: "LNMO — Ni⁴⁺/Ni²⁺ at full stretch", v: 4.7, note: "Above the carbonate cliff — the couple that's still waiting for its electrolyte." },
  ],
  zones: [
    { from: 0.0, to: 0.8, label: "carbonates reduce here → SEI", side: "low" },
    { from: 4.5, to: 5.0, label: "carbonates oxidize here", side: "high" },
  ],

  /* -------- rung 2: half-reactions & who moves (hand-authored bank) ------ */
  halfBank: [
    {
      type: "mcq",
      prompt: "Graphite's half-reaction (charged form on the left):",
      options: [
        { text: "LiC₆ ⇌ 6 C + Li⁺ + e⁻   (~0.1 V)", correct: true },
        { text: "LiC₆ ⇌ 6 C + Li³⁺ + 3 e⁻", correct: false },
        { text: "LiC₆ + e⁻ ⇌ 6 C + Li⁺", correct: false },
        { text: "2 LiC₆ ⇌ 12 C + Li₂ + 2 e⁻", correct: false },
      ],
      why: "One lithium leaves as Li⁺, so exactly one electron leaves with it. Li³⁺ doesn't exist in a cell, and Li₂ molecules certainly don't.",
    },
    {
      type: "mcq",
      prompt: "LFP's half-reaction:",
      options: [
        { text: "LiFePO₄ ⇌ FePO₄ + Li⁺ + e⁻   (3.45 V)", correct: true },
        { text: "LiFePO₄ ⇌ FePO₄ + Li⁺ + 2 e⁻", correct: false },
        { text: "LiFePO₄ ⇌ Fe + PO₄³⁻ + Li⁺ + e⁻", correct: false },
        { text: "FePO₄ ⇌ LiFePO₄ + Li⁺ + e⁻", correct: false },
      ],
      why: "One Li⁺ out, one e⁻ out, and the olivine frame stays intact — Fe²⁺ becomes Fe³⁺ inside the same lattice. Anything that frees Fe or PO₄³⁻ describes destruction, not cycling.",
    },
    {
      type: "mcq",
      prompt: "LTO's half-reaction on discharge (lithiation):",
      options: [
        { text: "Li₄Ti₅O₁₂ + 3 Li⁺ + 3 e⁻ ⇌ Li₇Ti₅O₁₂   (1.55 V)", correct: true },
        { text: "Li₄Ti₅O₁₂ + 5 Li⁺ + 5 e⁻ ⇌ Li₉Ti₅O₁₂", correct: false },
        { text: "Li₄Ti₅O₁₂ ⇌ 5 TiO₂ + 4 Li⁺ + 4 e⁻ + O₂", correct: false },
        { text: "Li₄Ti₅O₁₂ + 3 Li⁺ ⇌ Li₇Ti₅O₁₂ + 3 e⁻", correct: false },
      ],
      why: "Three lithiums in, three electrons in — three of the five Ti⁴⁺ become Ti³⁺. The spinel neither releases oxygen nor swaps charge for free.",
    },
    {
      type: "mcq",
      prompt: "Lithium metal itself:",
      options: [
        { text: "Li ⇌ Li⁺ + e⁻   (0 V by definition; −3.04 V vs SHE)", correct: true },
        { text: "Li ⇌ Li⁺ + e⁻   (+3.04 V vs SHE)", correct: false },
        { text: "2 Li ⇌ Li₂²⁺ + 2 e⁻", correct: false },
        { text: "Li + e⁻ ⇌ Li⁻", correct: false },
      ],
      why: "The reference itself. On the aqueous SHE scale it sits at −3.04 V — the bottom of the electrochemical series, the most reducing practical metal.",
    },
    {
      type: "mcq",
      prompt: "The manganese spinel LMO:",
      options: [
        { text: "LiMn₂O₄ ⇌ Mn₂O₄ + Li⁺ + e⁻   (~4.05 V)", correct: true },
        { text: "LiMn₂O₄ ⇌ 2 MnO₂ + Li⁺ + e⁻ + O₂", correct: false },
        { text: "LiMn₂O₄ ⇌ Mn₂O₄ + Li⁺ + 2 e⁻", correct: false },
        { text: "LiMn₂O₄ + Li⁺ + e⁻ ⇌ Mn₂O₄ + 2 Li", correct: false },
      ],
      why: "One Li⁺, one e⁻, framework intact: the average manganese state climbs from +3.5 to +4 as lithium leaves the spinel.",
    },
    {
      type: "mcq",
      prompt: "The generic layered cathode (NMC/NCA family):",
      options: [
        { text: "LiMO₂ ⇌ Li₁₋ₓMO₂ + x Li⁺ + x e⁻   (~3.8 V avg)", correct: true },
        { text: "LiMO₂ ⇌ MO₂ + Li + e⁻", correct: false },
        { text: "LiMO₂ + x Li⁺ ⇌ Li₁₊ₓMO₂ + x e⁻ (on charge)", correct: false },
        { text: "LiMO₂ ⇌ M + Li⁺ + O₂ + e⁻", correct: false },
      ],
      why: "x lithium ions out, x electrons out, layered frame intact. Lithium leaves as an ion — never as neutral metal — and the oxide only loses O₂ when things go very wrong.",
    },
    { type: "typed", prompt: "LFP charges and Fe²⁺ becomes Fe³⁺. Which ELEMENT did the redox? (symbol or name)", answer: { abbr: "Fe", name: "Iron", aliases: ["fe2+/fe3+"] }, why: "Iron alone. Phosphorus stays +5 and oxygen stays −2 — the phosphate is scaffolding, which is exactly why LFP is so safe." },
    { type: "typed", prompt: "In NMC, one metal stays +4 from empty to full — pure structural scaffolding. Which one?", answer: { abbr: "Mn", name: "Manganese", aliases: [] }, why: "Manganese sits inert as Mn⁴⁺ while nickel does the lifting — the division of labor that defines NMC." },
    { type: "typed", prompt: "In LTO, which element actually takes the electrons?", answer: { abbr: "Ti", name: "Titanium", aliases: [] }, why: "Ti⁴⁺ → Ti³⁺, three of the five per formula unit. Lithium, as always, just rides." },
    { type: "typed", prompt: "One element appears in every intercalation electrode and NEVER changes oxidation state — it is only the shuttle. Which?", answer: { abbr: "Li", name: "Lithium", aliases: [] }, why: "The name 'lithium-ion' is the answer: Li is +1 at the cathode, +1 in the electrolyte, +1 in graphite. Only a lithium-METAL anode ever holds Li⁰." },
    { type: "typed", prompt: "LNMO's whole capacity rides on a two-electron couple of one metal. Which metal?", answer: { abbr: "Ni", name: "Nickel", aliases: [] }, why: "Ni²⁺ ⇌ Ni⁴⁺ at ~4.7 V — two electrons per nickel while Mn⁴⁺ holds the spinel frame." },
    { type: "typed", prompt: "In LiCoO₂ on charge, who gets oxidized?", answer: { abbr: "Co", name: "Cobalt", aliases: [] }, why: "Co³⁺ → Co⁴⁺ as lithium leaves — the original 1980 couple." },
    { type: "typed", prompt: "Li-rich (LMR) cathodes squeeze out extra capacity by oxidizing the lattice itself. Which element?", answer: { abbr: "O", name: "Oxygen", aliases: ["anion", "oxide"] }, why: "Anion redox: the lattice O²⁻ gives up electrons above ~4.5 V. Record capacity — and the voltage fade that has kept LMR out of production." },
  ],

  /* -------- rung 3: collectors & corrosion ---------------------------- */
  corrosionSteps: [
    "The armor breaks: Al₂O₃ → 2 Al³⁺(ad) + 3/2 O₂ + 6 e⁻",
    "Bare metal oxidizes: Al → Al³⁺(ad) + 3 e⁻",
    "The wound is dressed — or not: Al³⁺(ad) + anion/solvent → Al-complexes(ad)",
    "The complexes dissolve away: Al-complexes(ad) → Al-complexes(sol)",
  ],
  collectorBank: [
    { type: "typed", prompt: "Which metal foil collects the ANODE? (symbol or name)", answer: { abbr: "Cu", name: "Copper", aliases: ["copper foil"] }, why: "Copper — because it refuses to alloy with lithium at 0 V. Heavy, but incorruptible at the bottom of the ladder." },
    { type: "typed", prompt: "Which metal foil collects the CATHODE?", answer: { abbr: "Al", name: "Aluminum", aliases: ["aluminium", "aluminum foil"] }, why: "Aluminum — cheap, light, and alive at 4 V only because of its oxide-and-fluoride armor." },
    {
      type: "mcq",
      prompt: "Why can't aluminum collect the anode?",
      options: [
        { text: "At ~0.3 V vs Li⁺/Li, aluminum alloys with lithium — the foil itself becomes an electrode and crumbles", correct: true },
        { text: "Aluminum is too expensive for the anode side", correct: false },
        { text: "Aluminum dissolves in the electrolyte at low potentials", correct: false },
        { text: "Aluminum is too heavy to coat with graphite", correct: false },
      ],
      why: "The LiAl rung sits at ~0.3 V — right where the anode lives. Copper has no such rung near 0 V, which is the entire reason it gets the job.",
    },
    {
      type: "mcq",
      prompt: "Bare aluminum should oxidize at ~1.4 V vs Li⁺/Li. Why does the cathode's Al foil survive 4.4 V?",
      options: [
        { text: "Passivation: native Al₂O₃ plus AlF₃ formed from LiPF₆'s fluoride seal the surface — armor, not nobility", correct: true },
        { text: "Aluminum is a noble metal like gold", correct: false },
        { text: "The current collector never touches the electrolyte", correct: false },
        { text: "The binder insulates the foil from the cathode potential", correct: false },
      ],
      why: "Thermodynamically the foil should corrode; kinetically the sealed surface never lets it start. Every 4-volt cell rides on that armor.",
    },
    {
      type: "mcq",
      prompt: "With LiTFSI the armor fails above ~3.7 V. What exactly goes wrong?",
      options: [
        { text: "The Al–TFSI complexes are SOLUBLE — step ④ carries them away, so the protective layer never rebuilds and the pit keeps growing", correct: true },
        { text: "TFSI reduces Al³⁺ back to metal, short-circuiting the cell", correct: false },
        { text: "TFSI is a strong acid that dissolves Al₂O₃ directly", correct: false },
        { text: "TFSI attacks the copper foil, and the aluminum follows", correct: false },
      ],
      why: "PF₆⁻ also lets steps ①–③ happen — but its product AlF₃ is insoluble and reseals the wound. TFSI's soluble complexes make corrosion continuous. The difference between the salts is step ④.",
    },
    {
      type: "mcq",
      prompt: "A cell is over-discharged far past 0 %. The classic kill mechanism:",
      options: [
        { text: "The anode's potential climbs to ~3.4 V vs Li⁺/Li, copper dissolves, and on recharge it re-plates as metallic dendrites", correct: true },
        { text: "The aluminum foil melts from over-current", correct: false },
        { text: "Graphite converts to diamond under stress", correct: false },
        { text: "LFP releases oxygen gas below 2 V", correct: false },
      ],
      why: "Deep discharge drags the emptied anode UP the ladder until it crosses the Cu²⁺/Cu rung at ~3.4 V. This is why battery-management systems guard the bottom of the window as jealously as the top.",
    },
    { type: "typed", prompt: "LiPF₆'s corrosion-stopping gift: aluminum reacts with its fluoride to form an insoluble sealant. Formula?", answer: { abbr: "AlF3", name: "Aluminum fluoride", aliases: ["alf₃", "aluminium fluoride"] }, why: "AlF₃ — insoluble, tough, and self-healing. One more quiet job LiPF₆ does that its challengers must match." },
    {
      type: "mcq",
      prompt: "Which cell components carry current every second and do redox never (when all goes well)?",
      options: [
        { text: "The Cu and Al foils, the conductive carbon, and the binder — the whole passive skeleton", correct: true },
        { text: "The cathode and the anode", correct: false },
        { text: "The electrolyte salt", correct: false },
        { text: "Nothing — everything in a cell does redox", correct: false },
      ],
      why: "A working cell keeps its redox in exactly two places. Every failure story in this rung is a passive component being dragged into chemistry it was never meant to do.",
    },
  ],
};
