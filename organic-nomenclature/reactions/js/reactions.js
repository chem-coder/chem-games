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

import { unsaturatedCondensed, unsaturatedName, alcoholName, alcoholCondensed, condensedFormula, ALKANE_BY_N, toSubHtml } from "../../js/organic.js";

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

// ── product naming helpers ──────────────────────────────────────────────────────
const HALO_PREFIX = { Cl: "chloro", Br: "bromo" };

// lowest-locant set, counting from whichever end wins
function canonLocants(n, ats) {
  const fwd = [...ats].sort((x, y) => x - y);
  const rev = ats.map((p) => n + 1 - p).sort((x, y) => x - y);
  for (let i = 0; i < fwd.length; i++) {
    if (fwd[i] !== rev[i]) return fwd[i] < rev[i] ? fwd : rev;
  }
  return fwd;
}

function haloName(n, el, ats) {
  const locs = canonLocants(n, ats);
  const multi = ats.length === 2 ? "di" : "";
  const needLocant = ats.length > 1 || n > 2;
  return `${needLocant ? `${locs.join(",")}-` : ""}${multi}${HALO_PREFIX[el]}${ALKANE_BY_N[n].name}`;
}

function haloCondensed(n, el, ats) {
  const locs = canonLocants(n, ats);
  const onC = Array(n + 1).fill(0);
  locs.forEach((p) => { onC[p] += 1; });
  let s = "";
  for (let c = 1; c <= n; c++) {
    const spent = (c > 1 ? 1 : 0) + (c < n ? 1 : 0) + onC[c];
    const h = 4 - spent;
    s += `C${h === 0 ? "" : h === 1 ? "H" : `H${h}`}${el.repeat(onC[c])}`;
  }
  return s;
}

// ── GENERATED addition deck: every alkene × every reagent ───────────────────────
// The alkene's two carbons keep their H counts; when they differ, Markovnikov calls
// the major (X/OH to the poorer carbon) and both regioisomers are accepted. When
// they tie on an internal bond (pent-2-ene), both products form with no preference —
// the card says so instead of pretending one wins.
const ALKENES = [
  ene(2, 1), ene(3, 1), ene(4, 1), ene(4, 2), ene(5, 1), ene(5, 2)
];
const REAGENTS = [
  { reagent: "H2", type: "hydrogenation", conditions: "catalyst" },
  { reagent: "Br2", type: "halogenation", conditions: null },
  { reagent: "Cl2", type: "halogenation", conditions: null },
  { reagent: "HBr", type: "hydrohalogenation", conditions: null },
  { reagent: "HCl", type: "hydrohalogenation", conditions: null },
  { reagent: "H2O", type: "hydration", conditions: "acid catalyst" }
];

// H on an alkene carbon = 4 − bonds: the double (2) plus a chain single per side it has
function eneCarbonH(spec, c) {
  let bondsSum = 2; // the double bond
  if (c > 1 && spec.slot !== c - 1) bondsSum += 1;
  if (c < spec.n && spec.slot !== c) bondsSum += 1;
  return 4 - bondsSum;
}

function additionTargets(spec, rg) {
  const { n, slot } = spec;
  const [cA, cB] = [slot, slot + 1];
  if (rg.type === "hydrogenation") {
    return [{ name: ALKANE_BY_N[n].name, condensed: condensedFormula(n), mol: chainWith(n) }];
  }
  if (rg.type === "halogenation") {
    const el = rg.reagent === "Br2" ? "Br" : "Cl";
    return [{
      name: haloName(n, el, [cA, cB]),
      condensed: haloCondensed(n, el, [cA, cB]),
      mol: chainWith(n, [{ el, at: cA }, { el, at: cB }])
    }];
  }
  // HX or H2O: X/OH lands on either double-bond carbon
  const el = rg.type === "hydration" ? "O" : rg.reagent === "HBr" ? "Br" : "Cl";
  const make = (at) => rg.type === "hydration"
    ? (() => { const oh = Math.min(at, n + 1 - at); return { name: alcoholName({ n, oh }), condensed: alcoholCondensed({ n, oh }), mol: chainWith(n, [{ el: "O", at }]) }; })()
    : { name: haloName(n, el, [at]), condensed: haloCondensed(n, el, [at]), mol: chainWith(n, [{ el, at }]) };
  const hA = eneCarbonH(spec, cA), hB = eneCarbonH(spec, cB);
  const [first, second] = hA === hB ? [cA, cB] : hA > hB ? [cB, cA] : [cA, cB];
  const targets = [make(first), make(second)].filter((t, i, arr) => arr.findIndex((x) => x.name === t.name) === i);
  if (targets.length > 1 && hA !== hB) targets[0].major = true;
  if (targets.length > 1 && hA === hB) targets.forEach((t) => { t.even = true; });
  return targets;
}

export const REACTIONS = [];
for (const spec of ALKENES) {
  const eneName = unsaturatedName(spec);
  for (const rg of REAGENTS) {
    REACTIONS.push({
      id: `${rg.reagent.toLowerCase()}-${eneName}`,
      type: rg.type,
      reactant: { name: eneName, condensed: unsaturatedCondensed(spec), mol: eneGraph(spec.n, spec.slot) },
      reagent: rg.reagent,
      conditions: rg.conditions,
      elements: rg.type === "hydrogenation" ? ["C", "H"]
        : rg.type === "halogenation" ? ["C", rg.reagent === "Br2" ? "Br" : "Cl"]
        : rg.type === "hydration" ? ["C", "H", "O"]
        : ["C", "H", rg.reagent === "HBr" ? "Br" : "Cl"],
      explicitH: rg.type === "hydrogenation" ? 2 : rg.type === "halogenation" ? 0 : 1,
      targets: additionTargets(spec, rg)
    });
  }
}

// ── Act B: ELIMINATION (IMAT 5.49) — addition run backwards ─────────────────────
// The reactant carries the leaving group; the student builds the ALKENE. Where the
// double bond can form on either side, Zaitsev calls the major: the more substituted
// (internal) alkene wins. Both honest alkenes are accepted.
function eliminationTargets(n, at) {
  const slots = [];
  if (at > 1) slots.push(at - 1);
  if (at < n) slots.push(at);
  const canonical = [...new Set(slots.map((s) => Math.min(s, n - s)))];
  const targets = canonical.map((slot) => ({
    name: unsaturatedName(ene(n, slot)),
    condensed: unsaturatedCondensed(ene(n, slot)),
    mol: eneGraph(n, slot),
    internal: slot > 1 && slot < n - 1
  }));
  if (targets.length > 1) {
    targets.sort((a, b) => Number(b.internal) - Number(a.internal)); // Zaitsev first
    targets[0].major = true;
  }
  return targets.map(({ internal, ...t }) => t);
}

const DEHYDRATION_SPECS = [
  { n: 2, at: 1 }, { n: 3, at: 1 }, { n: 3, at: 2 }, { n: 4, at: 1 },
  { n: 4, at: 2 }, { n: 5, at: 1 }, { n: 5, at: 2 }, { n: 5, at: 3 }
];
const DEHYDROHALOGENATION_SPECS = [
  { n: 2, at: 1, el: "Br" }, { n: 3, at: 2, el: "Br" }, { n: 4, at: 2, el: "Br" },
  { n: 4, at: 1, el: "Cl" }, { n: 5, at: 2, el: "Cl" }, { n: 5, at: 3, el: "Br" }
];

export const ELIMINATIONS = [
  ...DEHYDRATION_SPECS.map(({ n, at }) => {
    const oh = Math.min(at, n + 1 - at);
    return {
      id: `dehyd-${alcoholName({ n, oh })}`,
      type: "dehydration",
      reactant: { name: alcoholName({ n, oh }), condensed: alcoholCondensed({ n, oh }), mol: chainWith(n, [{ el: "O", at }]) },
      reagent: "H2SO4", conditions: "conc. · heat",
      // O rides in the tray so the student can BUILD the alcohol, then eliminate:
      // drop the OH back on the tray and click the freed bond double
      elements: ["C", "O"], explicitH: 0,
      targets: eliminationTargets(n, at)
    };
  }),
  ...DEHYDROHALOGENATION_SPECS.map(({ n, at, el }) => ({
    id: `dhx-${haloName(n, el, [at])}`,
    type: "dehydrohalogenation",
    reactant: { name: haloName(n, el, [at]), condensed: haloCondensed(n, el, [at]), mol: chainWith(n, [{ el, at }]) },
    reagent: "KOH", conditions: "conc. · heat",
    elements: ["C", el], explicitH: 0,
    targets: eliminationTargets(n, at)
  }))
];

// ── Act C: SUBSTITUTION (IMAT 5.50) — one piece swaps for another ───────────────
// No bond orders change; the skeleton stays. Three flavors:
//   alkane + X2 (UV)      → H swapped for X — ANY position is an honest product
//   alcohol + HX          → the OH swapped for X, same carbon
//   haloalkane + KOH(aq)  → the X swapped for OH — same reagent as elimination,
//                           DIFFERENT conditions: aqueous substitutes, conc.+heat
//                           eliminates. Conditions are part of the answer.
const SUB_HALOGENATION_SPECS = [
  { n: 1, x: "Cl" }, { n: 2, x: "Br" }, { n: 3, x: "Cl" },
  { n: 4, x: "Br" }, { n: 4, x: "Cl" }, { n: 5, x: "Cl" }
];
const SUB_ALCOHOL_SPECS = [
  { n: 2, oh: 1, x: "Cl" }, { n: 3, oh: 1, x: "Br" }, { n: 3, oh: 2, x: "Cl" },
  { n: 4, oh: 1, x: "Br" }, { n: 4, oh: 2, x: "Cl" }, { n: 5, oh: 2, x: "Br" }
];
const HYDROLYSIS_SPECS = [
  { n: 2, at: 1, el: "Cl" }, { n: 3, at: 1, el: "Br" }, { n: 3, at: 2, el: "Cl" },
  { n: 4, at: 2, el: "Br" }, { n: 4, at: 1, el: "Cl" }, { n: 5, at: 3, el: "Br" }
];

export const SUBSTITUTIONS = [
  ...SUB_HALOGENATION_SPECS.map(({ n, x }) => {
    const positions = Array.from({ length: Math.ceil(n / 2) }, (_, i) => i + 1);
    const targets = positions.map((p) => ({
      name: haloName(n, x, [p]),
      condensed: haloCondensed(n, x, [p]),
      mol: chainWith(n, [{ el: x, at: p }]),
      even: positions.length > 1 || undefined
    }));
    return {
      id: `subx-${x.toLowerCase()}2-${ALKANE_BY_N[n].name}`,
      type: "subHalogenation",
      reactant: { name: ALKANE_BY_N[n].name, condensed: condensedFormula(n), mol: chainWith(n) },
      reagent: `${x}2`, conditions: "UV light",
      elements: ["C", x], explicitH: 0,
      targets
    };
  }),
  ...SUB_ALCOHOL_SPECS.map(({ n, oh, x }) => ({
    id: `suboh-${alcoholName({ n, oh })}-h${x.toLowerCase()}`,
    type: "subAlcohol",
    reactant: { name: alcoholName({ n, oh }), condensed: alcoholCondensed({ n, oh }), mol: chainWith(n, [{ el: "O", at: oh }]) },
    reagent: `H${x}`, conditions: null,
    elements: ["C", "O", x], explicitH: 0,
    targets: [{ name: haloName(n, x, [oh]), condensed: haloCondensed(n, x, [oh]), mol: chainWith(n, [{ el: x, at: oh }]) }]
  })),
  ...HYDROLYSIS_SPECS.map(({ n, at, el }) => {
    const oh = Math.min(at, n + 1 - at);
    return {
      id: `hydrol-${haloName(n, el, [at])}`,
      type: "hydrolysis",
      reactant: { name: haloName(n, el, [at]), condensed: haloCondensed(n, el, [at]), mol: chainWith(n, [{ el, at }]) },
      reagent: "KOH", conditions: "aqueous",
      elements: ["C", "O", el], explicitH: 0,
      targets: [{ name: alcoholName({ n, oh }), condensed: alcoholCondensed({ n, oh }), mol: chainWith(n, [{ el: "O", at }]) }]
    };
  })
];

// Round of 5: 2 alkane halogenations + 1 alcohol→halide + 2 hydrolyses.
export function makeSubstitutionDealer() {
  const groups = {
    halog: SUBSTITUTIONS.filter((c) => c.type === "subHalogenation"),
    suboh: SUBSTITUTIONS.filter((c) => c.type === "subAlcohol"),
    hydrol: SUBSTITUTIONS.filter((c) => c.type === "hydrolysis")
  };
  const piles = { halog: [], suboh: [], hydrol: [] };
  const draw = (key, rng) => {
    if (piles[key].length === 0) piles[key] = [...groups[key]].sort(() => rng() - 0.5);
    return piles[key].pop();
  };
  return function deal(rng = Math.random) {
    const cards = [
      draw("halog", rng), draw("halog", rng),
      draw("suboh", rng),
      draw("hydrol", rng), draw("hydrol", rng)
    ];
    return cards.sort(() => rng() - 0.5);
  };
}

// Round of 5: 3 dehydrations + 2 dehydrohalogenations.
export function makeEliminationDealer() {
  const dehyd = ELIMINATIONS.filter((c) => c.type === "dehydration");
  const dhx = ELIMINATIONS.filter((c) => c.type === "dehydrohalogenation");
  const piles = { dehyd: [], dhx: [] };
  const draw = (key, source, rng) => {
    if (piles[key].length === 0) piles[key] = [...source].sort(() => rng() - 0.5);
    return piles[key].pop();
  };
  return function deal(rng = Math.random) {
    const cards = [
      draw("dehyd", dehyd, rng), draw("dehyd", dehyd, rng), draw("dehyd", dehyd, rng),
      draw("dhx", dhx, rng), draw("dhx", dhx, rng)
    ];
    return cards.sort(() => rng() - 0.5);
  };
}

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
  },
  dehydration: {
    label: "Dehydration", elimination: true,
    adds: "loses H and OH",
    result: "an alkene",
    hint: "The OH leaves its carbon; an H leaves a NEIGHBOR carbon; the two freed valences become the C=C. Which neighbor? Zaitsev: the more substituted (internal) alkene is the major — either honest alkene is accepted."
  },
  dehydrohalogenation: {
    label: "Dehydrohalogenation", elimination: true,
    adds: "loses H and X",
    result: "an alkene",
    hint: "The halogen leaves its carbon; an H leaves a NEIGHBOR; the double bond forms between them. Zaitsev again: internal beats terminal — but both honest alkenes count."
  },
  subHalogenation: {
    label: "Halogenation of an alkane", substitution: true,
    adds: "swaps one H for X",
    result: "a haloalkane",
    hint: "UV light lets the halogen pluck ONE hydrogen off the alkane and take its seat. Any carbon's H can be the one — every position is an honest product."
  },
  subAlcohol: {
    label: "Halogenation of an alcohol", substitution: true,
    adds: "swaps the OH for X",
    result: "a haloalkane",
    hint: "The whole –OH group leaves and the halogen takes its exact seat — same carbon, no wandering."
  },
  hydrolysis: {
    label: "Hydrolysis of a haloalkane", substitution: true,
    adds: "swaps the X for OH",
    result: "an alcohol",
    hint: "The halogen leaves and –OH takes its exact seat. Note the conditions: KOH AQUEOUS substitutes; KOH concentrated + heat would eliminate instead."
  }
};

export function hintsFor(card) {
  const info = REACTION_INFO[card.type];
  const major = card.targets[0];
  const partnerNote = card.targets.length > 1
    ? (major.even ? " (either forms — both accepted)" : " (the major product; its partner is accepted too)")
    : "";
  return [
    info.elimination
      ? "Elimination: two NEIGHBOR carbons each lose a piece, and the freed valences become a C=C double bond. The skeleton never changes — build the chain, then click the right bond double."
      : info.substitution
      ? "Substitution: one piece SWAPS for another on the same carbon. No bond orders change, the skeleton stays — only the passenger is different."
      : "Addition: the C=C double bond OPENS, and each of its two carbons picks up one new piece. Count the reactant's carbons — the skeleton never changes.",
    info.hint,
    `Build ${toSubHtml(major.condensed)} — ${major.name}${partnerNote}.`
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
  },
  // ── Zaitsev calls: elimination's major/minor, same 50/50 shape ──
  {
    id: "mk-zaitsev-butan-2-ol",
    reactant: { name: "butan-2-ol", condensed: "CH3CH(OH)CH2CH3" },
    reagent: "H2SO4",
    options: [
      { name: "but-2-ene", condensed: "CH3CH=CHCH3", major: true },
      { name: "but-1-ene", condensed: "CH2=CHCH2CH3" }
    ],
    why: "The OH leaves C-2; the H can leave C-1 or C-3. Zaitsev: the more substituted double bond — the INTERNAL one — is the major."
  },
  {
    id: "mk-zaitsev-2-bromobutane",
    reactant: { name: "2-bromobutane", condensed: "CH3CHBrCH2CH3" },
    reagent: "KOH",
    options: [
      { name: "but-2-ene", condensed: "CH3CH=CHCH3", major: true },
      { name: "but-1-ene", condensed: "CH2=CHCH2CH3" }
    ],
    why: "Same call as dehydration: Br leaves C-2, the H leaves a neighbor, and Zaitsev picks the internal alkene as major."
  },
  {
    id: "mk-zaitsev-pentan-2-ol",
    reactant: { name: "pentan-2-ol", condensed: "CH3CH(OH)CH2CH2CH3" },
    reagent: "H2SO4",
    options: [
      { name: "pent-2-ene", condensed: "CH3CH=CHCH2CH3", major: true },
      { name: "pent-1-ene", condensed: "CH2=CHCH2CH2CH3" }
    ],
    why: "H from C-1 gives the terminal alkene; H from C-3 gives the internal one. Internal wins — Zaitsev."
  },
  {
    id: "mk-zaitsev-2-chloropentane",
    reactant: { name: "2-chloropentane", condensed: "CH3CHClCH2CH2CH3" },
    reagent: "KOH",
    options: [
      { name: "pent-2-ene", condensed: "CH3CH=CHCH2CH3", major: true },
      { name: "pent-1-ene", condensed: "CH2=CHCH2CH2CH3" }
    ],
    why: "The Cl leaves C-2. Count substitution on the two possible double bonds: pent-2-ene's carries more carbon neighbors — major."
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
