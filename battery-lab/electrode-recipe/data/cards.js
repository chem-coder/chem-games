/*
  Battery Lab — Electrode Recipe deck (content only, no logic).
  Scope ruling (see battery-lab/README.md): everything in the coated
  electrode that is NOT active material — binders, conductive carbons,
  current collectors, and the process solvent. This is where PVDF and
  nanotubes live; never in the electrolyte deck.
  Figures: polymers + NMP carry `mol` (shared/js/skeletal.js, repeat units
  in brackets); carbons and foils carry `fig` (local js/fig.js schematic).
*/

export const DECK = {
  categories: {
    binder: {
      label: "Binders",
      blurb: "Two or three percent of glue that holds every electrode together — through calendering, electrolyte soaking, and years of breathing. Each chemistry is married to its solvent and its electrode side.",
    },
    carbon: {
      label: "Conductive carbons",
      blurb: "Active-material grains are poor neighbors — someone must wire them to the foil. Beads make point contacts; wires make highways.",
    },
    support: {
      label: "Collectors & process",
      blurb: "The metal the electrode lives on and the solvent it was born in: chosen by the ladder (copper for 0 V, aluminum for 4 V) and by what dissolves PVDF.",
    },
    all: {
      label: "Full mix",
      blurb: "The whole passive skeleton — everything between the active material and the tab that carries no glory and all the current.",
    },
  },

  cards: [
    /* ------------------------------------------------------ binders ---- */
    {
      id: "pvdf",
      abbr: "PVDF",
      name: "Polyvinylidene fluoride",
      category: "binder",
      tagline: "The cathode's standard glue — and the only reason NMP exists in factories.",
      formulaHtml: "–[CH<sub>2</sub>–CF<sub>2</sub>]<sub>n</sub>–",
      aliases: ["polyvinylidene fluoride", "pvdf binder"],
      specs: ["cathode-side standard", "~2–3 wt% of the electrode", "dissolves only in NMP"],
      facts: [
        "The fluoropolymer that binds virtually every commercial cathode: electrochemically inert past 4.5 V, chemically indifferent to the electrolyte, and processable into tough films at 2–3 wt%.",
        "Its solubility is its politics: PVDF dissolves in almost nothing but NMP, so choosing PVDF chooses the factory's solvent, its recovery plant, and its drying ovens.",
        "Its dark side appears in abuse: against lithiated graphite or lithium metal at high temperature, PVDF defluorinates exothermically — one of the quiet contributors to thermal-runaway heat.",
      ],
      claims: [
        "Choosing this binder chooses the factory's solvent — it dissolves in almost nothing but NMP",
        "Inert to 4.5 V in service, but defluorinates exothermically against lithiated anodes when hot",
      ],
      mol: {
        atoms: [
          { x: -26, y: 22, label: "(", trim: 6 },
          { x: 0, y: 20 },
          { x: 29, y: 3 },
          { x: 12, y: -25, label: "F", trim: 9 },
          { x: 46, y: -25, label: "F", trim: 9 },
          { x: 57, y: 22, label: ")n", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1],
          [2, 3, 1], [2, 4, 1],
          [2, 5, 1],
        ],
      },
    },
    {
      id: "cmc",
      abbr: "CMC",
      name: "Carboxymethyl cellulose",
      category: "binder",
      tagline: "Cellulose with carboxylate arms — the water-based half of the anode's glue.",
      formulaHtml: "cellulose–OCH<sub>2</sub>COO<sup>−</sup>",
      aliases: ["carboxymethyl cellulose", "sodium cmc"],
      specs: ["anode-side standard (with SBR)", "water-processable", "stiff — needs a flexible partner"],
      facts: [
        "Cellulose whose hydroxyls carry carboxymethyl arms, making it water-soluble — the molecule that moved anode manufacturing from NMP to water.",
        "In the slurry it is as much a rheology agent as a glue: it thickens the water, disperses the graphite and carbon black, and dries into a stiff network.",
        "Stiff is the operative word — on its own it cracks, which is why graphite anodes pair it with a soft latex partner (SBR) in a two-binder system.",
      ],
      claims: [
        "The molecule that moved anode processing from NMP to water",
        "As much a slurry thickener and dispersant as a glue — and too stiff to work alone",
      ],
      mol: {
        atoms: [
          { x: 22, y: 0, label: "O", trim: 9 },
          { x: 11, y: 19 },
          { x: -11, y: 19 },
          { x: -22, y: 0 },
          { x: -11, y: -19 },
          { x: 11, y: -19 },
          { x: 38, y: -35, label: "O", trim: 9 },
          { x: 68, y: -21 },
          { x: 97, y: -38 },
          { x: 124, y: -22, label: "O", trim: 9 },
          { x: 97, y: -72, label: "O", charge: "-", trim: 9 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 0, 1],
          [5, 6, 1], [6, 7, 1], [7, 8, 1],
          [8, 9, 2, { style: "sym" }],
          [8, 10, 1],
        ],
      },
    },
    {
      id: "sbr",
      abbr: "SBR",
      name: "Styrene–butadiene rubber",
      category: "binder",
      tagline: "A drop of latex that lets the stiff anode flex.",
      formulaHtml: "–[CH<sub>2</sub>CH=CHCH<sub>2</sub>]–[CH<sub>2</sub>CH(C<sub>6</sub>H<sub>5</sub>)]–",
      aliases: ["styrene butadiene rubber", "sbr latex"],
      specs: ["waterborne latex", "~2 wt% dose", "the flexible partner of CMC"],
      facts: [
        "An elastomer delivered as a waterborne latex — sub-micron rubber spheres that migrate to particle contacts as the coating dries and weld them with flexible bridges.",
        "It is CMC's other half: CMC disperses and stiffens, SBR flexes and adheres. Together at a few percent they hold graphite through years of ten-percent breathing.",
        "The same latex logic (borrowed from paints and paper coating) is why the anode went water-based a decade before anyone dared touch the cathode's PVDF.",
      ],
      claims: [
        "Arrives as latex spheres that weld particle contacts as the water dries",
        "The flexible half of the anode's two-binder marriage",
      ],
      mol: {
        atoms: [
          { x: -26, y: 22, label: "(", trim: 6 },
          { x: 0, y: 20 },
          { x: 29, y: 3 },
          { x: 59, y: 20 },
          { x: 88, y: 3 },
          { x: 118, y: 20 },
          { x: 147, y: 3 },
          { x: 173, y: 5, label: ")n", trim: 9 },
          { x: 118, y: 40 },
          { x: 135, y: 50 },
          { x: 135, y: 70 },
          { x: 118, y: 80 },
          { x: 101, y: 70 },
          { x: 101, y: 50 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1],
          [2, 3, 2, { side: -1 }],
          [3, 4, 1], [4, 5, 1], [5, 6, 1], [6, 7, 1],
          [5, 8, 1],
          [8, 9, 2, { side: 1 }], [9, 10, 1], [10, 11, 2, { side: 1 }], [11, 12, 1], [12, 13, 2, { side: 1 }], [13, 8, 1],
        ],
      },
    },
    {
      id: "paa",
      abbr: "PAA",
      name: "Polyacrylic acid",
      category: "binder",
      tagline: "The silicon binder — carboxylic acids that hold on through 300 % swelling.",
      formulaHtml: "–[CH<sub>2</sub>–CH(COOH)]<sub>n</sub>–",
      aliases: ["polyacrylic acid", "lipaa", "li-paa"],
      specs: ["THE silicon binder", "bonds to SiOx surfaces", "often used as LiPAA"],
      facts: [
        "A carboxylic acid on every second carbon: PAA hydrogen-bonds and even condenses covalently to the SiOx skin of silicon particles — glue that grips the particle itself, not just its neighborhood.",
        "That grip is why it owns the silicon anode: PVDF's weak van-der-Waals hold shears off during silicon's ~300 % swelling, while PAA networks stretch, re-stick, and hold the electrode's wiring together.",
        "In practice it ships pre-lithiated as LiPAA — trading protons for lithium so the binder doesn't spend the cell's first lithium on neutralizing itself.",
      ],
      claims: [
        "Bonds to the SiOx skin itself — the grip that survives silicon's swelling",
        "Shipped pre-lithiated (LiPAA) so it doesn't spend first-cycle lithium neutralizing its own protons",
      ],
      mol: {
        atoms: [
          { x: -26, y: 22, label: "(", trim: 6 },
          { x: 0, y: 20 },
          { x: 29, y: 3 },
          { x: 57, y: 22, label: ")n", trim: 9 },
          { x: 29, y: -31 },
          { x: 2, y: -45, label: "O", trim: 9 },
          { x: 58, y: -45, label: "OH", trim: 13 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1],
          [2, 4, 1],
          [4, 5, 2, { style: "sym" }],
          [4, 6, 1],
        ],
      },
    },

    /* ---------------------------------------------- conductive carbons - */
    {
      id: "cb",
      abbr: "CB",
      name: "Carbon black (Super P)",
      category: "carbon",
      tagline: "Beads of soot that wire the electrode — the default at a few percent.",
      formulaHtml: "C (turbostratic, ~40 nm beads)",
      aliases: ["carbon black", "super p", "acetylene black"],
      specs: ["~1–3 wt% dose", "point-contact percolation", "surface area costs first-cycle Li"],
      facts: [
        "Chains of ~40 nm turbostratic carbon beads that fill the gaps between active grains and percolate electrons to the foil — the default conductive additive in nearly every electrode.",
        "Its contacts are points, so it takes a few percent to guarantee a connected network — and every gram displaces active material.",
        "Its huge surface area is electrolyte-facing: SEI forms on the carbon black too, quietly spending first-cycle lithium — one more reason formulators count every tenth of a percent.",
      ],
      claims: [
        "Beads making point contacts — needs a few percent to percolate",
        "Its surface grows SEI too, quietly taxing the first cycle's lithium",
        "The default conductive additive of nearly every commercial electrode",
      ],
      fig: { kind: "carbonblack" },
    },
    {
      id: "cnt",
      abbr: "CNT",
      name: "Carbon nanotubes",
      category: "carbon",
      tagline: "Wires instead of beads — percolation at a tenth of the dose.",
      formulaHtml: "C (tubes, μm long, nm wide)",
      aliases: ["carbon nanotubes", "nanotubes", "swcnt", "single-walled carbon nanotubes"],
      specs: ["percolates at ~0.1–1 wt%", "single-walled = premium grade", "dispersion is the hard part"],
      facts: [
        "A micrometers-long conductive wire percolates where a bead chain can't: nanotubes reach network connectivity at roughly a tenth of carbon black's dose, freeing that mass for active material.",
        "Single-walled CNTs are the premium enabler of silicon-rich anodes — a few tenths of a percent keeps pulverizing particles wired to the network between fractures.",
        "The engineering battle is dispersion: nanotubes arrive as felted bundles, and the value is captured by whoever can untangle them into the slurry — a market a handful of suppliers dominates.",
      ],
      claims: [
        "Wire-like percolation at a tenth the dose of carbon black",
        "A few tenths of a percent keeps fracturing silicon particles wired between breaks",
        "Arrives as felted bundles — the suppliers who can untangle them own the market",
      ],
      fig: { kind: "cnt" },
    },

    /* --------------------------------------------- collectors & process - */
    {
      id: "cufoil",
      abbr: "Cu foil",
      name: "Copper current collector",
      category: "support",
      tagline: "The anode's incorruptible floor — chosen by the ladder, taxed by the scale.",
      formulaHtml: "Cu, 6–10 μm",
      aliases: ["copper", "cu", "copper foil"],
      specs: ["anode side only", "no Li alloying at 0 V", "dissolves on overdischarge (~3.4 V)"],
      facts: [
        "Copper collects the anode because it is one of the few cheap metals with no lithium-alloy rung near 0 V — it sits at the bottom of the cell doing nothing, which is exactly the job.",
        "It is dense, so it is the heaviest inactive component per area — the drive from 10 μm to 6 μm foil (and toward copper-clad polymer films) is real energy-density engineering.",
        "Its one vice is overdischarge: drag the cell too low and the anode's potential climbs to ~3.4 V vs Li⁺/Li, where copper dissolves — and later re-plates as dendrites.",
      ],
      claims: [
        "Hired for what it refuses to do: alloy with lithium at 0 V",
        "The heaviest inactive layer per area — thinning it is real energy-density work",
      ],
      fig: { kind: "foil", variant: "cu" },
    },
    {
      id: "alfoil",
      abbr: "Al foil",
      name: "Aluminum current collector",
      category: "support",
      tagline: "Alive at 4 volts by armor alone.",
      formulaHtml: "Al, 10–15 μm",
      aliases: ["aluminum", "aluminium", "al", "aluminum foil"],
      specs: ["cathode side only", "survives 4 V by passivation", "alloys with Li at ~0.3 V"],
      facts: [
        "Aluminum collects the cathode: cheap, light, and endlessly rollable — but thermodynamically it should corrode at cathode potentials, and only its native Al₂O₃ plus AlF₃ from LiPF₆ keep it whole.",
        "It can never switch sides: at ~0.3 V vs Li⁺/Li aluminum alloys with lithium, so an aluminum anode collector would swell and crumble like an alloying electrode.",
        "Its armor has a known enemy: LiTFSI forms soluble Al complexes above ~3.7 V, re-opening the wound faster than it can seal — the cross-link between this deck and the salt cabinet.",
      ],
      claims: [
        "Survives the cathode's 4 volts by Al₂O₃/AlF₃ armor, not nobility",
        "Can never collect the anode — it alloys with lithium at ~0.3 V",
      ],
      fig: { kind: "foil", variant: "al" },
    },
    {
      id: "nmp",
      abbr: "NMP",
      name: "N-Methyl-2-pyrrolidone",
      category: "support",
      tagline: "The industry's least-loved solvent — hired by PVDF, hunted by everyone else.",
      formulaHtml: "C<sub>5</sub>H<sub>9</sub>NO",
      aliases: ["n-methylpyrrolidone", "n-methyl-2-pyrrolidone", "pyrrolidone"],
      specs: ["exists to dissolve PVDF", "reprotoxic — tightly regulated", "recovery ovens = major energy cost"],
      facts: [
        "NMP is in the factory for exactly one reason: it is the solvent that dissolves PVDF. The cathode slurry is born in it, and every trace must then be evaporated and recovered.",
        "It is a regulated reprotoxin, and its recovery loop — kilometers of drying oven plus solvent-capture plant — is one of the largest energy line-items in cell manufacturing.",
        "Its would-be assassins define the industry's process roadmap: water-based cathode binders and dry-electrode processing (the Maxwell technology Tesla bought) both exist chiefly to delete NMP.",
      ],
      claims: [
        "In the factory for exactly one reason: it is what dissolves PVDF",
        "Dry-electrode processing exists chiefly to delete this molecule from the flowsheet",
      ],
      mol: {
        atoms: [
          { x: 0, y: 32, label: "N", trim: 10 },
          { x: 30.4, y: 9.9 },
          { x: 18.8, y: -25.9 },
          { x: -18.8, y: -25.9 },
          { x: -30.4, y: 9.9 },
          { x: 63, y: 21, label: "O", trim: 9 },
          { x: 0, y: 66 },
        ],
        bonds: [
          [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1],
          [1, 5, 2, { style: "sym" }],
          [0, 6, 1],
        ],
      },
    },
  ],
};
