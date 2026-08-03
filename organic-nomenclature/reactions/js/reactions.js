// Organic Reactions prototype — pure logic. No DOM. ESM for `node --test`.
//
// Act A of the reactions plan (IMAT lesson 5.48): ADDITION to alkenes. The mechanic is
// "reactant + reagent → BUILD the product" on the lab canvas, graded by structure
// (chem.js gradeIsomorphic) — the builder already knew how to do everything but ask.
//
// Prototype scope decisions (2026-08-03, built for Dalia's lesson with Malcolm):
// - Deck is hand-curated (the namer doesn't speak halogens yet — Phase A2 folds this in).
// - For unsymmetric alkenes with HX / H2O, BOTH regioisomers are accepted; the reveal
//   labels the Markovnikov product as major. The IMAT lesson lists the reactions without
//   regiochemistry, so we teach the preference without failing the honest alternative.

import { unsaturatedCondensed, toSubHtml } from "../../js/organic.js";

// small graph builder: a single-bonded carbon chain with substituents hung on it
let nextId = 0;
function chainWith(n, subs = []) {
  const atoms = [];
  const bonds = [];
  const chain = [];
  for (let i = 0; i < n; i++) {
    atoms.push({ id: ++nextId, el: "C" });
    chain.push(nextId);
    if (i > 0) bonds.push({ a: chain[i - 1], b: chain[i], order: 1 });
  }
  for (const s of subs) {
    atoms.push({ id: ++nextId, el: s.el });
    bonds.push({ a: chain[s.at - 1], b: nextId, order: 1 });
  }
  return { atoms, bonds };
}

const ene = (n, slot) => ({ n, slot, order: 2 });

// the alkene reactant as a graph — feeds the non-graded "Check my reactant" button
function eneGraph(n, slot) {
  const atoms = [];
  const bonds = [];
  const chain = [];
  for (let i = 0; i < n; i++) {
    atoms.push({ id: ++nextId, el: "C" });
    chain.push(nextId);
    if (i > 0) bonds.push({ a: chain[i - 1], b: chain[i], order: i === slot ? 2 : 1 });
  }
  return { atoms, bonds };
}

// Each card: reactant (alkene, displayed condensed), reagent chip, conditions note,
// accepted target structures (first = major, shown in the reveal), tray elements.
export const REACTIONS = [
  // ── hydrogenation: +H2 (catalyst) → alkane ──
  {
    id: "h2-ethene", type: "hydrogenation",
    reactant: { name: "ethene", condensed: unsaturatedCondensed(ene(2, 1)), mol: eneGraph(2, 1) },
    reagent: "H2", conditions: "catalyst",
    elements: ["C", "H"], explicitH: 2,
    targets: [{ name: "ethane", condensed: "CH3CH3", mol: chainWith(2) }]
  },
  {
    id: "h2-propene", type: "hydrogenation",
    reactant: { name: "propene", condensed: unsaturatedCondensed(ene(3, 1)), mol: eneGraph(3, 1) },
    reagent: "H2", conditions: "catalyst",
    elements: ["C", "H"], explicitH: 2,
    targets: [{ name: "propane", condensed: "CH3CH2CH3", mol: chainWith(3) }]
  },
  {
    id: "h2-but2ene", type: "hydrogenation",
    reactant: { name: "but-2-ene", condensed: unsaturatedCondensed(ene(4, 2)), mol: eneGraph(4, 2) },
    reagent: "H2", conditions: "catalyst",
    elements: ["C", "H"], explicitH: 2,
    targets: [{ name: "butane", condensed: "CH3CH2CH2CH3", mol: chainWith(4) }]
  },
  {
    id: "h2-but1ene", type: "hydrogenation",
    reactant: { name: "but-1-ene", condensed: unsaturatedCondensed(ene(4, 1)), mol: eneGraph(4, 1) },
    reagent: "H2", conditions: "catalyst",
    elements: ["C", "H"], explicitH: 2,
    targets: [{ name: "butane", condensed: "CH3CH2CH2CH3", mol: chainWith(4) }]
  },

  // ── halogenation: +X2 → vicinal dihaloalkane (X on BOTH alkene carbons) ──
  {
    id: "br2-ethene", type: "halogenation",
    reactant: { name: "ethene", condensed: unsaturatedCondensed(ene(2, 1)), mol: eneGraph(2, 1) },
    reagent: "Br2", conditions: null,
    elements: ["C", "Br"], explicitH: 0,
    targets: [{ name: "1,2-dibromoethane", condensed: "CH2BrCH2Br",
      mol: chainWith(2, [{ el: "Br", at: 1 }, { el: "Br", at: 2 }]) }]
  },
  {
    id: "cl2-propene", type: "halogenation",
    reactant: { name: "propene", condensed: unsaturatedCondensed(ene(3, 1)), mol: eneGraph(3, 1) },
    reagent: "Cl2", conditions: null,
    elements: ["C", "Cl"], explicitH: 0,
    targets: [{ name: "1,2-dichloropropane", condensed: "CH2ClCHClCH3",
      mol: chainWith(3, [{ el: "Cl", at: 1 }, { el: "Cl", at: 2 }]) }]
  },
  {
    id: "br2-but2ene", type: "halogenation",
    reactant: { name: "but-2-ene", condensed: unsaturatedCondensed(ene(4, 2)), mol: eneGraph(4, 2) },
    reagent: "Br2", conditions: null,
    elements: ["C", "Br"], explicitH: 0,
    targets: [{ name: "2,3-dibromobutane", condensed: "CH3CHBrCHBrCH3",
      mol: chainWith(4, [{ el: "Br", at: 2 }, { el: "Br", at: 3 }]) }]
  },

  // ── hydrohalogenation: +HX → haloalkane (H on one alkene carbon, X on the other) ──
  {
    id: "hcl-ethene", type: "hydrohalogenation",
    reactant: { name: "ethene", condensed: unsaturatedCondensed(ene(2, 1)), mol: eneGraph(2, 1) },
    reagent: "HCl", conditions: null,
    elements: ["C", "H", "Cl"], explicitH: 1,
    targets: [{ name: "chloroethane", condensed: "CH3CH2Cl", mol: chainWith(2, [{ el: "Cl", at: 1 }]) }]
  },
  {
    id: "hbr-propene", type: "hydrohalogenation",
    reactant: { name: "propene", condensed: unsaturatedCondensed(ene(3, 1)), mol: eneGraph(3, 1) },
    reagent: "HBr", conditions: null,
    elements: ["C", "H", "Br"], explicitH: 1,
    targets: [
      { name: "2-bromopropane", condensed: "CH3CHBrCH3", major: true,
        mol: chainWith(3, [{ el: "Br", at: 2 }]) },
      { name: "1-bromopropane", condensed: "CH2BrCH2CH3",
        mol: chainWith(3, [{ el: "Br", at: 1 }]) }
    ]
  },
  {
    id: "hbr-but2ene", type: "hydrohalogenation",
    reactant: { name: "but-2-ene", condensed: unsaturatedCondensed(ene(4, 2)), mol: eneGraph(4, 2) },
    reagent: "HBr", conditions: null,
    elements: ["C", "H", "Br"], explicitH: 1,
    targets: [{ name: "2-bromobutane", condensed: "CH3CHBrCH2CH3", mol: chainWith(4, [{ el: "Br", at: 2 }]) }]
  },

  // ── hydration: +H2O (acid catalyst) → alcohol ──
  {
    id: "h2o-ethene", type: "hydration",
    reactant: { name: "ethene", condensed: unsaturatedCondensed(ene(2, 1)), mol: eneGraph(2, 1) },
    reagent: "H2O", conditions: "acid catalyst",
    elements: ["C", "H", "O"], explicitH: 1,
    targets: [{ name: "ethanol", condensed: "CH3CH2OH", mol: chainWith(2, [{ el: "O", at: 1 }]) }]
  },
  {
    id: "h2o-propene", type: "hydration",
    reactant: { name: "propene", condensed: unsaturatedCondensed(ene(3, 1)), mol: eneGraph(3, 1) },
    reagent: "H2O", conditions: "acid catalyst",
    elements: ["C", "H", "O"], explicitH: 1,
    targets: [
      { name: "propan-2-ol", condensed: "CH3CH(OH)CH3", major: true,
        mol: chainWith(3, [{ el: "O", at: 2 }]) },
      { name: "propan-1-ol", condensed: "CH3CH2CH2OH",
        mol: chainWith(3, [{ el: "O", at: 1 }]) }
    ]
  },
  {
    id: "h2o-but2ene", type: "hydration",
    reactant: { name: "but-2-ene", condensed: unsaturatedCondensed(ene(4, 2)), mol: eneGraph(4, 2) },
    reagent: "H2O", conditions: "acid catalyst",
    elements: ["C", "H", "O"], explicitH: 1,
    targets: [{ name: "butan-2-ol", condensed: "CH3CH(OH)CH2CH3", mol: chainWith(4, [{ el: "O", at: 2 }]) }]
  }
];

// What each reaction type teaches — feeds the hint ladder and the intro table.
export const REACTION_INFO = {
  hydrogenation: {
    label: "Hydrogenation",
    adds: "H and H",
    result: "an alkane",
    hint: "H2 adds one H to EACH carbon of the double bond — the skeleton stays, the bond opens."
  },
  halogenation: {
    label: "Halogenation",
    adds: "X and X",
    result: "a dihaloalkane",
    hint: "The halogen splits across the double bond: one X on EACH of the two alkene carbons — neighbors, always."
  },
  hydrohalogenation: {
    label: "Hydrohalogenation",
    adds: "H and X",
    result: "a haloalkane",
    hint: "H goes to one alkene carbon, X to the other. The X prefers the carbon with FEWER hydrogens (Markovnikov) — but either neighbor is a real product here."
  },
  hydration: {
    label: "Hydration",
    adds: "H and OH",
    result: "an alcohol",
    hint: "Water splits: H to one alkene carbon, OH to the other. The OH prefers the carbon with fewer hydrogens (Markovnikov) — either neighbor is accepted here."
  }
};

export function hintsFor(card) {
  const info = REACTION_INFO[card.type];
  const major = card.targets[0];
  return [
    "Addition: the C=C double bond OPENS, and each of its two carbons picks up one new piece. Count the reactant's carbons — the skeleton never changes.",
    info.hint,
    `Build ${toSubHtml(major.condensed)} — ${major.name}${card.targets.length > 1 ? " (the major product; its partner is accepted too)" : ""}.`
  ];
}

// ── Markovnikov quiz — Dalia's spec: reaction shown, BOTH products shown, pick the
// major. A 50/50, separate from the build rounds. The intro teaches the rule; this
// deck drills it. `major: true` marks the Markovnikov product; option order is
// shuffled at deal time so the major isn't always first.
export const MK_CARDS = [
  {
    id: "mk-hbr-propene",
    reactant: { name: "propene", condensed: unsaturatedCondensed(ene(3, 1)) },
    reagent: "HBr",
    options: [
      { name: "2-bromopropane", condensed: "CH3CHBrCH3", major: true },
      { name: "1-bromopropane", condensed: "CH2BrCH2CH3" }
    ],
    why: "C-1 of the double bond carries two H's, C-2 carries one. The new H joins C-1 (the rich get richer), so the Br takes C-2."
  },
  {
    id: "mk-h2o-propene",
    reactant: { name: "propene", condensed: unsaturatedCondensed(ene(3, 1)) },
    reagent: "H2O",
    options: [
      { name: "propan-2-ol", condensed: "CH3CH(OH)CH3", major: true },
      { name: "propan-1-ol", condensed: "CH3CH2CH2OH" }
    ],
    why: "Water's H joins the CH2 end (more H's already); the OH takes the middle carbon."
  },
  {
    id: "mk-hbr-but1ene",
    reactant: { name: "but-1-ene", condensed: unsaturatedCondensed(ene(4, 1)) },
    reagent: "HBr",
    options: [
      { name: "2-bromobutane", condensed: "CH3CHBrCH2CH3", major: true },
      { name: "1-bromobutane", condensed: "CH2BrCH2CH2CH3" }
    ],
    why: "The end carbon has two H's, its neighbor has one — H to the end, Br to C-2."
  },
  {
    id: "mk-h2o-but1ene",
    reactant: { name: "but-1-ene", condensed: unsaturatedCondensed(ene(4, 1)) },
    reagent: "H2O",
    options: [
      { name: "butan-2-ol", condensed: "CH3CH(OH)CH2CH3", major: true },
      { name: "butan-1-ol", condensed: "CH3CH2CH2CH2OH" }
    ],
    why: "H to the CH2 end, OH to C-2 — the carbon that started with fewer hydrogens."
  },
  {
    id: "mk-hbr-pent1ene",
    reactant: { name: "pent-1-ene", condensed: unsaturatedCondensed(ene(5, 1)) },
    reagent: "HBr",
    options: [
      { name: "2-bromopentane", condensed: "CH3CHBrCH2CH2CH3", major: true },
      { name: "1-bromopentane", condensed: "CH2BrCH2CH2CH2CH3" }
    ],
    why: "Same story at any length: H to the two-H end carbon, Br to its one-H neighbor."
  },
  {
    id: "mk-hbr-methylpropene",
    reactant: { name: "2-methylprop-1-ene", condensed: "CH2=C(CH3)CH3" },
    reagent: "HBr",
    options: [
      { name: "2-bromo-2-methylpropane", condensed: "CH3CBr(CH3)CH3", major: true },
      { name: "1-bromo-2-methylpropane", condensed: "CH2BrCH(CH3)CH3" }
    ],
    why: "The branched carbon of the double bond has NO H's at all — the strongest Markovnikov case. H to the CH2, Br to the branch point."
  }
];

export function makeMarkovnikovDealer() {
  let pile = [];
  return function deal(rng = Math.random) {
    const cards = [];
    const used = new Set();
    for (let i = 0; i < 5; i++) {
      if (pile.length === 0) pile = [...MK_CARDS].sort(() => rng() - 0.5);
      let card = pile.pop();
      for (let g = 0; used.has(card.id) && g < MK_CARDS.length; g++) {
        if (pile.length === 0) pile = [...MK_CARDS].sort(() => rng() - 0.5);
        card = pile.pop();
      }
      used.add(card.id);
      cards.push(card);
    }
    return cards;
  };
}

// Round of 5: one card per reaction type guaranteed, fifth from anywhere — every round
// shows the whole addition family. Shuffle-bag per type, dedupe by id.
export function makeReactionDealer() {
  const byType = {};
  for (const r of REACTIONS) (byType[r.type] ??= []).push(r);
  const piles = Object.fromEntries(Object.entries(byType).map(([t, cards]) => [t, []]));
  const draw = (type, rng) => {
    if (piles[type].length === 0) {
      piles[type] = [...byType[type]].sort(() => rng() - 0.5);
    }
    return piles[type].pop();
  };
  return function deal(rng = Math.random) {
    const types = Object.keys(byType);
    const cards = types.map((t) => draw(t, rng));
    const extraType = types[Math.floor(rng() * types.length)];
    let extra = draw(extraType, rng);
    for (let g = 0; cards.some((c) => c.id === extra.id) && g < 8; g++) extra = draw(extraType, rng);
    cards.push(extra);
    return cards.sort(() => rng() - 0.5);
  };
}
