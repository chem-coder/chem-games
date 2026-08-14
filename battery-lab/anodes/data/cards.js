/*
  Battery Lab — Anode Materials deck (content only, no logic).
  Same shape as the cathodes deck; `fig` replaces `lattice` and is consumed
  by js/fig.js (five schematic archetypes — layers / house / spinel /
  alloy / metal — the intercalation vs alloying vs plating contrast is the
  load-bearing visual idea).
  All potentials vs Li⁺/Li unless marked otherwise.
  Draft research notes and flagged uncertainties: ../RESEARCH.md.
*/

export const DECK = {
  categories: {
    intercalation: {
      label: "Intercalation",
      blurb: "Lithium slips into a host that barely changes shape — graphite's layers, hard carbon's disordered fragments, LTO's spinel frame. Small volume change buys long life; capacity is capped by how many sites the host offers.",
    },
    alloying: {
      label: "Alloying",
      blurb: "Lithium reacts with the electrode metal itself and forms lithium-rich alloys — several lithium per host atom. Capacities are enormous, and so is the volume change that comes with them.",
    },
    metal: {
      label: "Li metal",
      blurb: "No host at all: lithium plates and strips as the metal itself. The original anode, the highest capacity possible, and the hardest to keep alive.",
    },
    all: {
      label: "Full mix",
      blurb: "All three mechanisms shuffled — intercalation hosts, alloying metals, and the bare metal — the way a materials exam deals them.",
    },
  },

  cards: [
    /* ---------------------------------------------- intercalation ------ */
    {
      id: "graphite",
      abbr: "Gr",
      name: "Graphite",
      category: "intercalation",
      tagline: "The incumbent — LiC₆ staging has run the anode side since 1991.",
      formulaHtml: "C &rarr; LiC<sub>6</sub>",
      specs: ["~0.1 V avg vs Li⁺/Li", "372 mAh/g theoretical (LiC₆)", "~10 % volume change"],
      facts: [
        "Lithium intercalates between the graphene sheets up to one Li per six carbons — LiC₆ — which fixes the theoretical capacity at 372 mAh/g. Filling proceeds by staging: stage 4 → 3 → 2 → 1, and fully lithiated stage-1 LiC₆ is gold-colored.",
        "It works at ~0.1 V vs Li⁺/Li, which maximizes cell voltage but sits dangerously close to 0 V: during fast charging the surface can polarize below 0 V and plate lithium metal instead of intercalating it.",
        "It operates below the stability window of every carbonate electrolyte, so it survives only behind an SEI built from decomposed electrolyte on the first cycles — the EC story from the electrolytes deck. Even so, it still supplies roughly 90 % of the world's anode market.",
      ],
      claims: [
        "It still supplies roughly 90 % of the world's anode market.",
        "Its lithiation proceeds by staging — stage 4 → 3 → 2 → 1 — and it turns gold when full.",
        "Its 372 mAh/g limit is set by the stoichiometry LiC₆: one lithium per six carbons.",
      ],
      fig: {
        kind: "layers",
        note: "Long parallel graphene sheets; Li⁺ enters from the edge and fills the galleries in stages — 2D diffusion between the sheets.",
      },
    },
    {
      id: "hardcarbon",
      abbr: "HC",
      name: "Hard carbon",
      category: "intercalation",
      tagline: "Disordered on purpose — the carbon that cannot graphitize, now sodium's default anode.",
      formulaHtml: "C (disordered)",
      specs: ["Sloping profile + low plateau vs Li⁺/Li", "~250–350 mAh/g (vs Li)", "Non-graphitizable carbon"],
      facts: [
        "It is a 'house of cards' of short, twisted graphene fragments with nanopores between them. Cross-links lock the disorder in place, so it cannot be converted to graphite even at 3000 °C.",
        "Lithium is stored two ways: between the fragments, giving a sloping voltage profile, and by filling the nanopores, giving a low plateau near 0 V. It tolerates propylene carbonate, which exfoliates graphite — the reason Sony's early-1990s cells used disordered carbon before graphite took over.",
        "Today it is the default anode of sodium-ion batteries: sodium barely intercalates into graphite, but fits between hard carbon's fragments and in its pores.",
      ],
      claims: [
        "It cannot be graphitized even at 3000 °C.",
        "It is the default anode of today's sodium-ion batteries.",
        "It tolerates propylene carbonate, which exfoliates graphite — why Sony's earliest cells used a disordered carbon.",
      ],
      fig: {
        kind: "house",
        note: "Short graphene fragments at odd angles — the 'house of cards' — with Li between fragments and clustered in nanopores.",
      },
    },
    {
      id: "lto",
      abbr: "LTO",
      name: "Lithium titanate (spinel)",
      category: "intercalation",
      tagline: "The 1.55 V spinel — zero strain, no SEI, no plating, and an energy bill to pay for it.",
      formulaHtml: "Li<sub>4</sub>Ti<sub>5</sub>O<sub>12</sub>",
      specs: ["1.55 V flat plateau vs Li⁺/Li", "175 mAh/g theoretical", "Spinel · <0.2 % volume change"],
      facts: [
        "Spinel Li₄Ti₅O₁₂ takes up lithium at 1.55 V vs Li⁺/Li with less than 0.2 % volume change — 'zero-strain'. Cells built on it run for tens of thousands of cycles.",
        "At 1.55 V the electrolyte is not reduced, so no SEI is needed, and lithium plating is impossible at that potential — which is why LTO cells fast-charge safely, even in the cold.",
        "The price is energy: capacity is only 175 mAh/g, and the high anode potential cuts more than a volt off the cell voltage. Add a gassing problem at elevated temperature, and LTO ends up in buses and grid storage — Toshiba's SCiB — not in phones.",
      ],
      claims: [
        "Its 1.55 V working potential means no SEI forms and lithium plating is impossible.",
        "Lithiation changes its volume by less than 0.2 % — 'zero-strain'.",
        "It is the chemistry of Toshiba's SCiB cells in buses and grid storage.",
      ],
      fig: {
        kind: "spinel",
        note: "Spinel frame of TiO₆ octahedra with Li in a 3D channel network; the frame barely moves on lithiation (1.55 V, <0.2 % strain).",
      },
    },

    /* --------------------------------------------------- alloying ------ */
    {
      id: "si",
      abbr: "Si",
      name: "Silicon",
      category: "alloying",
      tagline: "Ten times graphite's capacity, three hundred percent more volume — handled in small doses.",
      formulaHtml: "Si &rarr; Li<sub>15</sub>Si<sub>4</sub>",
      specs: ["~0.4 V avg vs Li⁺/Li", "~3579 mAh/g (Li₁₅Si₄)", "~300 % volume expansion"],
      facts: [
        "Silicon alloys with lithium instead of intercalating it: at room temperature the end phase is Li₁₅Si₄, ~3579 mAh/g — roughly ten times graphite.",
        "Full lithiation swells the particle about 300 %. Repeated swelling pulverizes particles and cracks the SEI open every cycle, so it re-forms and consumes lithium — draining the full cell's lithium inventory.",
        "Commercial cells therefore use it sparingly: 5–10 % silicon or SiOx blended into graphite, with FEC in the electrolyte (electrolytes deck) to keep the SEI elastic and repairable.",
      ],
      claims: [
        "Its theoretical capacity — ~3579 mAh/g as Li₁₅Si₄ — is roughly ten times graphite's.",
        "It expands about 300 % on full lithiation.",
        "Commercial cells blend 5–10 % of it into graphite and rely on FEC to keep its SEI repairable.",
      ],
      fig: {
        kind: "alloy",
        note: "Before/after particle: alloying to Li₁₅Si₄ swells it ~300 % — the particle and its SEI crack.",
      },
    },
    {
      id: "sn",
      abbr: "Sn",
      name: "Tin",
      category: "alloying",
      tagline: "Silicon's gentler sibling — and the first alloying anode ever shipped (Nexelion, 2005).",
      formulaHtml: "Sn &rarr; Li<sub>4.4</sub>Sn",
      specs: ["~0.5 V avg vs Li⁺/Li", "~990 mAh/g (Li₄.₄Sn)", "~260 % volume expansion"],
      facts: [
        "Tin alloys like silicon: up to Li₄.₄Sn, ~990 mAh/g, with about 260 % volume expansion — the same huge-capacity, huge-swelling trade at slightly gentler numbers.",
        "Sony's Nexelion (2005) was the first mass-market cell with an alloying anode: amorphous Sn-Co-C, in which the inactive cobalt–carbon matrix cushions the tin's expansion.",
        "It is niche today, but Nexelion proved an alloying anode can survive commercial cycling — the precedent every silicon program builds on.",
      ],
      claims: [
        "Sony's 2005 Nexelion — amorphous Sn-Co-C — made it the first alloying anode in a mass-market cell.",
        "It alloys to Li₄.₄Sn, storing about 990 mAh/g.",
        "It swells about 260 % when fully lithiated — severe, but less than silicon.",
      ],
      fig: {
        kind: "alloy",
        note: "Before/after particle: alloying to Li₄.₄Sn swells it ~260 %; in Nexelion an inactive Co–C matrix (dots) cushions the tin.",
      },
    },

    /* --------------------------------------------------- Li metal ------ */
    {
      id: "limetal",
      abbr: "Li",
      name: "Lithium metal",
      category: "metal",
      tagline: "The original anode — 3860 mAh/g, recalled in 1989, chased ever since.",
      formulaHtml: "Li",
      specs: ["0 V vs Li⁺/Li by definition", "3860 mAh/g", "−3.04 V vs SHE"],
      facts: [
        "Lithium metal is the anode with no host: 3860 mAh/g, and at −3.04 V vs SHE the most negative practical electrode potential. It was the anode of the first rechargeable lithium cells.",
        "Plating and stripping grow dendrites — needles that can pierce the separator — and strand 'dead lithium' each cycle; with no host lattice, the relative volume change on plating is unbounded. Moli Energy's 1989 recall after cell fires ended commercial Li-metal rechargeables and pushed the industry to intercalation: 'lithium-ion'.",
        "Its revival rides on three routes: solid-state electrolytes that block dendrites mechanically, LiFSI-rich liquid electrolytes that plate lithium densely, and anode-free cells that skip the lithium foil entirely.",
      ],
      claims: [
        "At −3.04 V vs SHE, it is the most negative practical electrode.",
        "Moli Energy's 1989 recall of cells built on it pushed the whole industry to intercalation anodes.",
        "It needs no host at all — 3860 mAh/g, plated and stripped directly.",
      ],
      fig: {
        kind: "metal",
        note: "A bare lithium slab: Li⁺ plates straight onto it, and a dendrite grows toward the separator line above.",
      },
    },
  ],
};
