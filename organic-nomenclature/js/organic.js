// Organic Nomenclature — pure logic. No DOM, no globals. ESM for `node --test`.
//
// The straight-chain alkanes, C1–C10, in two spellings. The skill is pure recall of the ten
// roots (meth-, eth-, prop-, but-, pent-, hex-, hept-, oct-, non-, dec-) + the -ane suffix.
//   Rung 1 (molecular): read CₙH₂ₙ₊₂ — count the C subscript.
//   Rung 2 (condensed): read CH₃CH₂…CH₃ — count the carbon GROUPS. The condensed spelling
//   also SHOWS the structure (one unbranched chain), which the molecular formula doesn't.
// Dalia's ruling (2026-07-29): formula → name only works while the formula determines a
// single structure. That's alkanes and little else — alkenes/alkynes need the bond LOCATION,
// so later rungs must prompt with structure (condensed/skeletal/built), never bare CₙHₘ.
// The name → formula direction is a striped placeholder until the drag-and-drop discussion.

// Self-contained by design: games must not import from inside another game's folder
// (documentation/ARCHITECTURE.md §shared). These few helpers are duplicated knowingly.

// ── subscript rendering (house rule: real <sub>, sized by CSS at ≥50%) ──────────
export function toSubHtml(s) {
  return String(s).replace(/\d+/g, (run) => `<sub>${run}</sub>`);
}

// Long condensed chains must wrap on phones — but only BETWEEN carbon groups, never
// between a symbol and its subscript. <wbr> marks the legal break points.
export function toChainHtml(s) {
  return toSubHtml(s).replace(/<\/sub>(?!$)/g, "</sub><wbr>");
}

// ── the deck ────────────────────────────────────────────────────────────────────
export const ROOTS = ["meth", "eth", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"];

// An alkane with n carbons has 2n+2 hydrogens; subscript 1 is never written.
export function alkaneFormula(n) {
  const c = n === 1 ? "C" : `C${n}`;
  return `${c}H${2 * n + 2}`;
}

// Condensed spelling: CH₃ end caps around CH₂ links — every group holds exactly one carbon.
// Methane has no chain to cap, so it stays CH₄.
export function condensedFormula(n) {
  if (n === 1) return "CH4";
  return `CH3${"CH2".repeat(n - 2)}CH3`;
}

export const ALKANES = ROOTS.map((root, i) => {
  const n = i + 1;
  return { n, root, name: `${root}ane`, formula: alkaneFormula(n), condensed: condensedFormula(n) };
});
export const ALKANE_BY_N = Object.fromEntries(ALKANES.map((a) => [a.n, a]));

// ── building a problem ──────────────────────────────────────────────────────────
// Same uniform shape as the inorganic builder: { spec, mode, prompt, answer, accepted,
// formula, hints }. Only "name" mode exists for now; the builders throw on "formula"
// so a future wiring mistake fails loudly instead of dealing unplayable cards.
// From butane up, the straight chain is also correctly called n-butane etc. — accept it.
const acceptedFor = (a) => (a.n >= 4 ? [a.name, `n-${a.name}`] : [a.name]);

function refuseUnbuilt(direction) {
  if (direction !== "name") {
    throw new Error(`organic buildProblem: direction "${direction}" is not built yet`);
  }
}

export function buildProblem(spec, direction = "name") {
  refuseUnbuilt(direction);
  const a = ALKANE_BY_N[spec.n];
  const plural = a.n === 1 ? "carbon" : "carbons";
  return {
    spec,
    mode: "name",
    prompt: a.formula,
    answer: a.name,
    accepted: acceptedFor(a),
    formula: a.formula,
    hints: [
      "Count the carbons — the subscript on C. Each count has a root (meth‑ 1 … dec‑ 10); add –ane. The hydrogens come along free: an alkane always has 2n+2 of them.",
      `${a.n} ${plural} → the root is ${a.root}‑.`,
      `${a.root}‑ + –ane → ${a.name}.`
    ]
  };
}

// Rung 2: the prompt is the condensed spelling; the skill shifts from "read the subscript"
// to "count the carbon groups". The reveal keeps the condensed form so the round-end chips
// show what the student actually faced.
export function buildProblemCondensed(spec, direction = "name") {
  refuseUnbuilt(direction);
  const a = ALKANE_BY_N[spec.n];
  const ch3 = toSubHtml("CH3"), ch2 = toSubHtml("CH2");
  const groups = a.n === 1 ? `${toSubHtml("CH4")} is a single carbon group`
    : `${a.n} groups: ${ch3} ${a.n > 2 ? `+ ${a.n - 2} × ${ch2} ` : ""}+ ${ch3}`;
  return {
    spec,
    mode: "name",
    prompt: a.condensed,
    answer: a.name,
    accepted: acceptedFor(a),
    formula: a.condensed,
    hints: [
      `Every group — ${ch3} or ${ch2} — holds exactly one carbon. Count the groups and you've counted the carbons; then root (meth‑ 1 … dec‑ 10) + –ane.`,
      `${groups} → ${a.n} carbon${a.n === 1 ? "" : "s"} → the root is ${a.root}‑.`,
      `${a.root}‑ + –ane → ${a.name}.`
    ]
  };
}

// Build direction: the prompt is the NAME, the answer is a structure assembled on the
// lab canvas. Grading happens against the built graph (chem.js gradeAlkaneBuild), so
// there is no accepted-string set here — just the target n and the hint ladder.
export function buildProblemStructure(spec) {
  const a = ALKANE_BY_N[spec.n];
  return {
    spec,
    mode: "build",
    prompt: a.name,
    answer: a.name,
    n: a.n,
    formula: a.formula,
    condensed: a.condensed,
    hints: [
      "The name tells you everything: the root is the carbon count (meth‑ 1 … dec‑ 10), and –ane means every bond stays single.",
      `${a.root}‑ = ${a.n} carbon${a.n === 1 ? "" : "s"} → drag ${a.n === 1 ? "one carbon out — that's the whole molecule" : `${a.n} carbons out and chain them in a row`}.`,
      a.n === 1
        ? "One lone carbon — its four hydrogens are already riding along."
        : `${a.n} carbons, ${a.n - 1} single bonds, no branches — the hydrogens sort themselves out (${2 * a.n + 2} of them).`
    ]
  };
}

// ── rung 3: alkenes & alkynes — build-only ──────────────────────────────────────
// Dalia's ruling holds: CₙH₂ₙ can't say WHERE the double bond sits (but-1-ene and
// but-2-ene are both C4H8), so there is no formula → name direction here at all.
// The prompt is a name with a locant; the student builds the chain and sets the bond.
// A bond in "slot" p sits between C-p and C-(p+1). By symmetry only the low-numbered
// half are distinct names (pent-3-ene IS pent-2-ene counted from the other end).
export function distinctSlots(n) {
  return Math.ceil((n - 1) / 2);
}

export function unsaturatedName(spec) {
  const a = ALKANE_BY_N[spec.n];
  const suffix = spec.order === 2 ? "ene" : "yne";
  return distinctSlots(spec.n) > 1 ? `${a.root}-${spec.slot}-${suffix}` : `${a.root}${suffix}`;
}

// CnH2n for one double bond, CnH2n−2 for one triple.
export function unsaturatedFormula(spec) {
  return `C${spec.n}H${spec.order === 2 ? 2 * spec.n : 2 * spec.n - 2}`;
}

// Condensed spelling with the bond drawn in: CH2=CHCH2CH3, CH3C≡CCH3.
// Each carbon's H count is 4 minus what its chain bonds spend — same invariant as the canvas.
export function unsaturatedCondensed(spec) {
  const { n, slot, order } = spec;
  const orders = Array.from({ length: n - 1 }, (_, i) => (i + 1 === slot ? order : 1));
  let s = "";
  for (let c = 1; c <= n; c++) {
    const spent = (c > 1 ? orders[c - 2] : 0) + (c < n ? orders[c - 1] : 0);
    const h = 4 - spent;
    s += `C${h === 0 ? "" : h === 1 ? "H" : `H${h}`}`;
    if (c < n) s += orders[c - 1] === 1 ? "" : orders[c - 1] === 2 ? "=" : "≡";
  }
  return s;
}

export const ENE_SPECS = [];
export const YNE_SPECS = [];
for (let n = 2; n <= 10; n++) {
  for (let slot = 1; slot <= distinctSlots(n); slot++) {
    ENE_SPECS.push({ n, slot, order: 2 });
    YNE_SPECS.push({ n, slot, order: 3 });
  }
}

export function buildProblemUnsaturated(spec) {
  const a = ALKANE_BY_N[spec.n];
  const name = unsaturatedName(spec);
  const kind = spec.order === 2 ? "double" : "triple";
  const suffix = spec.order === 2 ? "ene" : "yne";
  const between = `between C‑${spec.slot} and C‑${spec.slot + 1}`;
  return {
    spec,
    mode: "build",
    prompt: name,
    answer: name,
    n: spec.n,
    formula: unsaturatedFormula(spec),
    condensed: unsaturatedCondensed(spec),
    hints: [
      `‑${suffix} means exactly one ${kind} bond. The root still counts the carbons (meth‑ 1 … dec‑ 10).`,
      distinctSlots(spec.n) > 1
        ? `${a.root}‑ = ${spec.n} carbons, and the ${spec.slot} says the ${kind} bond starts at carbon ${spec.slot} — ${between}.`
        : `${a.root}‑ = ${spec.n} carbons — this chain is short enough that the ${kind} bond has only one place to be: ${between}.`,
      `Build the straight ${spec.n}-chain first, then click the bond ${between} until it shows ${spec.order} lines.`
    ]
  };
}

// ── rung 4: branched alkanes — build-only, methyl branches ──────────────────────
// Specs are {m: parent length, methyls: [locants]}. Only names that are THE correct
// IUPAC name are dealt: branches never sit on chain ends (that would lengthen the
// parent), and locant sets already read lowest-from-the-correct-end. Methyl-only for
// now — ethyl branches drag in the longest-chain tie rules; a later rung's problem.
export const BRANCHED_SPECS = [];
for (let m = 3; m <= 7; m++) {
  for (let p = 2; p <= Math.floor((m + 1) / 2); p++) BRANCHED_SPECS.push({ m, methyls: [p] });
}
for (let m = 3; m <= 6; m++) {
  for (let p = 2; p <= m - 1; p++) {
    for (let q = p; q <= m - 1; q++) {
      const mirror = [m + 1 - q, m + 1 - p];
      if (p < mirror[0] || (p === mirror[0] && q <= mirror[1])) BRANCHED_SPECS.push({ m, methyls: [p, q] });
    }
  }
}

const MULTIPLIER = ["", "", "di", "tri"];

export function branchedName(spec) {
  return `${spec.methyls.join(",")}-${MULTIPLIER[spec.methyls.length]}methyl${ALKANE_BY_N[spec.m].name}`;
}

// C n H 2n+2 — branches don't change saturation.
export function branchedFormula(spec) {
  return alkaneFormula(spec.m + spec.methyls.length);
}

// CH3CH(CH3)CH2CH3 style: branches ride their chain carbon in parentheses.
export function branchedCondensed(spec) {
  const onCarbon = Array(spec.m + 1).fill(0);
  spec.methyls.forEach((p) => { onCarbon[p] += 1; });
  let s = "";
  for (let c = 1; c <= spec.m; c++) {
    const spent = (c > 1 ? 1 : 0) + (c < spec.m ? 1 : 0) + onCarbon[c];
    const h = 4 - spent;
    s += `C${h === 0 ? "" : h === 1 ? "H" : `H${h}`}`;
    if (onCarbon[c]) s += `(CH3)${onCarbon[c] > 1 ? onCarbon[c] : ""}`;
  }
  return s;
}

export function buildProblemBranched(spec) {
  const name = branchedName(spec);
  const parent = ALKANE_BY_N[spec.m];
  const k = spec.methyls.length;
  const where = k === 1
    ? `carbon ${spec.methyls[0]}`
    : spec.methyls[0] === spec.methyls[1]
      ? `carbon ${spec.methyls[0]} — both of them`
      : `carbons ${spec.methyls.join(" and ")}`;
  return {
    spec,
    mode: "build",
    prompt: name,
    answer: name,
    n: spec.m + k,
    formula: branchedFormula(spec),
    condensed: branchedCondensed(spec),
    hints: [
      `Read it back to front: the parent chain is named last — ${parent.name} means ${spec.m} in a row. methyl = a one-carbon branch${k > 1 ? `, and ${MULTIPLIER[k]}- means ${k} of them` : ""}.`,
      `Build the straight ${spec.m}-chain first, then hang ${k === 1 ? "a carbon" : "the extra carbons"} off ${where} (count from the end that keeps the numbers small).`,
      `${spec.m} in the chain + ${k} hanging off = ${spec.m + k} carbons total. The hydrogens re-balance as each branch attaches.`
    ]
  };
}

export function makeBranchedDealer() {
  const bag = makeBagDealer(BRANCHED_SPECS, (s) => branchedName(s));
  return (rng = Math.random) => bag(DEFAULT_ROUND, rng);
}

// ── rung 5: alcohols — build-only, oxygen joins the tray ────────────────────────
// Specs are {n: chain carbons, oh: locant}, straight chains only, one hydroxyl.
export const ALCOHOL_SPECS = [];
for (let n = 1; n <= 6; n++) {
  for (let oh = 1; oh <= Math.ceil(n / 2); oh++) ALCOHOL_SPECS.push({ n, oh });
}

export function alcoholName(spec) {
  const a = ALKANE_BY_N[spec.n];
  return spec.n <= 2 ? `${a.root}anol` : `${a.root}an-${spec.oh}-ol`;
}

export function alcoholFormula(spec) {
  return `C${spec.n > 1 ? spec.n : ""}H${2 * spec.n + 2}O`;
}

// OH written on its carbon: CH3CH2CH2OH, CH3CH(OH)CH3. The O is placed so a terminal
// hydroxyl lands at the right-hand end, the way the spelling is usually met.
export function alcoholCondensed(spec) {
  const ohAt = spec.n + 1 - spec.oh;
  let s = "";
  for (let c = 1; c <= spec.n; c++) {
    const spent = (c > 1 ? 1 : 0) + (c < spec.n ? 1 : 0) + (c === ohAt ? 1 : 0);
    const h = 4 - spent;
    const core = `C${h === 0 ? "" : h === 1 ? "H" : `H${h}`}`;
    s += c === ohAt ? (c === spec.n ? `${core}OH` : `${core}(OH)`) : core;
  }
  return s;
}

export function buildProblemAlcohol(spec) {
  const name = alcoholName(spec);
  const a = ALKANE_BY_N[spec.n];
  return {
    spec,
    mode: "build",
    prompt: name,
    answer: name,
    n: spec.n,
    formula: alcoholFormula(spec),
    condensed: alcoholCondensed(spec),
    hints: [
      `‑ol means an –OH (hydroxyl) group. The rest is an alkane you already know: ${a.root}‑ = ${spec.n} carbon${spec.n === 1 ? "" : "s"}, all single bonds.`,
      spec.n <= 2
        ? `With ${spec.n === 1 ? "one carbon" : "two carbons"} every position is the same — the OH needs no number.`
        : `The ${spec.oh} says the OH sits on carbon ${spec.oh} (count from the end that gives the small number).`,
      `Build the ${spec.n}-chain, then drag an oxygen from the tray onto carbon ${spec.oh}. Oxygen takes two bonds — one to the chain, and it keeps one hydrogen. That's the hydroxyl.`
    ]
  };
}

export function makeAlcoholDealer() {
  const bag = makeBagDealer(ALCOHOL_SPECS, (s) => alcoholName(s));
  return (rng = Math.random) => bag(DEFAULT_ROUND, rng);
}

// ── rungs 6–9: functional groups ────────────────────────────────────────────────
// Each spec carries an explicit `kind` and becomes a target GRAPH (elements + bond
// orders); grading is isomorphism against that graph (chem.js gradeIsomorphic).
// Chains stay modest (≤6 C) — the skill is the functional group, not endurance.

// tiny graph builder for targets
function makeGraph() {
  let id = 0;
  const atoms = [], bonds = [];
  return {
    add(el) { atoms.push({ id: ++id, el }); return id; },
    bond(a, b, order = 1) { bonds.push({ a, b, order }); },
    chain(n) { const ids = []; for (let i = 0; i < n; i++) { ids.push(this.add("C")); if (i) this.bond(ids[i - 1], ids[i]); } return ids; },
    out() { return { atoms, bonds }; }
  };
}

const fmtC = (c) => `C${c > 1 ? c : ""}`;
const chainStr = (n, tail) => (n === 1 ? `H${tail}` : `CH3${"CH2".repeat(n - 2)}${tail}`);
const alkylStr = (m) => (m === 1 ? "CH3" : `${"CH2".repeat(m - 1)}CH3`);

export const FAMILIES = {
  aldehyde: {
    name: (s) => `${ALKANE_BY_N[s.n].root}anal`,
    formula: (s) => `${fmtC(s.n)}H${2 * s.n}O`,
    condensed: (s) => chainStr(s.n, "CHO"),
    graph(s) { const g = makeGraph(); const c = g.chain(s.n); g.bond(c[0], g.add("O"), 2); return g.out(); },
    hints: (s) => [
      "‑al means a carbonyl (C=O) on an END carbon — that's what makes an aldehyde. No locant needed: it's always carbon 1.",
      `${ALKANE_BY_N[s.n].root}‑ = ${s.n} carbon${s.n === 1 ? "" : "s"}. Build the chain, then bond an O to an end carbon.`,
      "Click the C–O bond once to make it double. The carbonyl carbon keeps its H — that H is the aldehyde's signature."
    ]
  },
  ketone: {
    name: (s) => `${ALKANE_BY_N[s.n].root}an-${s.slot}-one`,
    formula: (s) => `${fmtC(s.n)}H${2 * s.n}O`,
    condensed: (s) => `CH3${"CH2".repeat(s.n - s.slot - 1)}CO${"CH2".repeat(s.slot - 2)}CH3`,
    graph(s) { const g = makeGraph(); const c = g.chain(s.n); g.bond(c[s.slot - 1], g.add("O"), 2); return g.out(); },
    hints: (s) => [
      "‑one is also a carbonyl (C=O) — but on an INSIDE carbon. That's the whole aldehyde/ketone difference: end vs middle.",
      `${ALKANE_BY_N[s.n].root}‑ = ${s.n} carbons, and the ${s.slot} parks the C=O on carbon ${s.slot}.`,
      `Build the ${s.n}-chain, bond an O to carbon ${s.slot}, click the bond to make it double. No H survives on a ketone's carbonyl carbon.`
    ]
  },
  ether: {
    name: (s) => `${s.n >= 3 ? `${s.at}-` : ""}${ALKANE_BY_N[s.alkoxy].root}oxy${ALKANE_BY_N[s.n].name}`,
    formula: (s) => `${fmtC(s.alkoxy + s.n)}H${2 * (s.alkoxy + s.n) + 2}O`,
    condensed: (s) => s.at === 1
      ? `${s.alkoxy === 1 ? "CH3" : "CH3CH2"}O${s.n === 1 ? "CH3" : `CH2${"CH2".repeat(s.n - 2)}CH3`}`
      : `CH3CH(O${s.alkoxy === 1 ? "CH3" : "CH2CH3"})CH3`,
    graph(s) {
      const g = makeGraph();
      const left = g.chain(s.alkoxy), o = g.add("O"), right = g.chain(s.n);
      g.bond(left[0], o); g.bond(o, right[s.at - 1]);
      return g.out();
    },
    hints: (s) => [
      "An ether is an oxygen BRIDGE: C–O–C, chains on both sides. The ‑oxy half is the shorter chain, named first.",
      `${ALKANE_BY_N[s.alkoxy].root}oxy = ${s.alkoxy} carbon${s.alkoxy === 1 ? "" : "s"} on one side of the O; ${ALKANE_BY_N[s.n].name} = ${s.n} on the other${s.n >= 3 ? `, with the O on carbon ${s.at}` : ""}.`,
      "Build both chains, then drop an O between them — it bonds to each side and the bridge closes. The O keeps no hydrogens: both its bonds are spent."
    ]
  },
  acid: {
    name: (s) => `${ALKANE_BY_N[s.n].root}anoic acid`,
    formula: (s) => `${fmtC(s.n)}H${2 * s.n}O2`,
    condensed: (s) => chainStr(s.n, "COOH"),
    graph(s) { const g = makeGraph(); const c = g.chain(s.n); g.bond(c[0], g.add("O"), 2); g.bond(c[0], g.add("O")); return g.out(); },
    hints: (s) => [
      "‑oic acid is a DOUBLE feature on one end carbon: a C=O and an –OH, together. That pair is the carboxyl group, COOH.",
      `${ALKANE_BY_N[s.n].root}‑ = ${s.n} carbon${s.n === 1 ? "" : "s"}. Build the chain, then give the end carbon TWO oxygens.`,
      "One O stays single-bonded (it keeps an H — the acid's OH); click the other C–O bond to make it double. End carbon: two O's, no H left on it" + (s.n === 1 ? " except methanoic acid's one" : "") + "."
    ]
  },
  ester: {
    name: (s) => `${["", "methyl", "ethyl", "propyl"][s.alkyl]} ${ALKANE_BY_N[s.acyl].root}anoate`,
    formula: (s) => `${fmtC(s.acyl + s.alkyl)}H${2 * (s.acyl + s.alkyl)}O2`,
    condensed: (s) => chainStr(s.acyl, "COO") + alkylStr(s.alkyl),
    graph(s) {
      const g = makeGraph();
      const acyl = g.chain(s.acyl);
      g.bond(acyl[0], g.add("O"), 2);
      const bridge = g.add("O");
      g.bond(acyl[0], bridge);
      const alkyl = g.chain(s.alkyl);
      g.bond(bridge, alkyl[0]);
      return g.out();
    },
    hints: (s) => [
      "An ester is an acid whose –OH hydrogen was replaced by a carbon chain: C(=O)–O–C. Named alkyl first, then the acid part as ‑oate.",
      `${["", "methyl", "ethyl", "propyl"][s.alkyl]} = ${s.alkyl} carbon${s.alkyl === 1 ? "" : "s"} on the far side of the bridge O; ${ALKANE_BY_N[s.acyl].root}anoate = the ${s.acyl}-carbon acid part, C=O included.`,
      "Build the acid part first (chain + double-bonded O + single-bonded O), then grow the alkyl chain off the single O. That O ends up with no H — both bonds spent."
    ]
  },
  amine: {
    name: (s) => (s.n <= 2 ? `${ALKANE_BY_N[s.n].root}anamine` : `${ALKANE_BY_N[s.n].root}an-${s.at}-amine`),
    formula: (s) => `${fmtC(s.n)}H${2 * s.n + 3}N`,
    condensed: (s) => {
      const at = s.n + 1 - s.at;
      let out = "";
      for (let c = 1; c <= s.n; c++) {
        const spent = (c > 1 ? 1 : 0) + (c < s.n ? 1 : 0) + (c === at ? 1 : 0);
        const h = 4 - spent;
        const core = `C${h === 0 ? "" : h === 1 ? "H" : `H${h}`}`;
        out += c === at ? (c === s.n ? `${core}NH2` : `${core}(NH2)`) : core;
      }
      return out;
    },
    graph(s) { const g = makeGraph(); const c = g.chain(s.n); g.bond(c[s.at - 1], g.add("N")); return g.out(); },
    hints: (s) => [
      "‑amine means a nitrogen hanging off the chain. Nitrogen takes THREE bonds: one to the chain, and it keeps two hydrogens — that's the –NH2 group.",
      s.n <= 2
        ? `${ALKANE_BY_N[s.n].root}‑ = ${s.n} carbon${s.n === 1 ? "" : "s"} — every position is the same, so no locant.`
        : `${ALKANE_BY_N[s.n].root}‑ = ${s.n} carbons, N on carbon ${s.at} (count from the end with the small number).`,
      `Build the chain, then drag an N from the tray onto carbon ${s.at}. Watch it settle to two hydrogens.`
    ]
  },
  amide: {
    name: (s) => `${ALKANE_BY_N[s.n].root}anamide`,
    formula: (s) => `${fmtC(s.n)}H${2 * s.n + 1}NO`,
    condensed: (s) => chainStr(s.n, "CONH2"),
    graph(s) { const g = makeGraph(); const c = g.chain(s.n); g.bond(c[0], g.add("O"), 2); g.bond(c[0], g.add("N")); return g.out(); },
    hints: (s) => [
      "‑amide is the acid's cousin: same end-carbon C=O, but the –OH is swapped for –NH2. Carbonyl plus nitrogen, same carbon.",
      `${ALKANE_BY_N[s.n].root}‑ = ${s.n} carbon${s.n === 1 ? "" : "s"}. End carbon gets an O (clicked to double) AND an N (left single).`,
      "The N keeps its two hydrogens; the double-bonded O keeps none. C=O + NH2 on one carbon — that's the amide group."
    ]
  }
};

export const ALDEHYDE_SPECS = Array.from({ length: 6 }, (_, i) => ({ kind: "aldehyde", n: i + 1 }));
export const KETONE_SPECS = [];
for (let n = 3; n <= 6; n++) for (let slot = 2; slot <= Math.ceil(n / 2); slot++) KETONE_SPECS.push({ kind: "ketone", n, slot });
export const ETHER_SPECS = [
  { kind: "ether", alkoxy: 1, n: 1, at: 1 }, { kind: "ether", alkoxy: 1, n: 2, at: 1 },
  { kind: "ether", alkoxy: 2, n: 2, at: 1 }, { kind: "ether", alkoxy: 1, n: 3, at: 1 },
  { kind: "ether", alkoxy: 1, n: 3, at: 2 }, { kind: "ether", alkoxy: 2, n: 3, at: 1 }
];
export const ACID_SPECS = Array.from({ length: 6 }, (_, i) => ({ kind: "acid", n: i + 1 }));
export const ESTER_SPECS = [];
for (let acyl = 1; acyl <= 3; acyl++) for (let alkyl = 1; alkyl <= 3; alkyl++) ESTER_SPECS.push({ kind: "ester", acyl, alkyl });
export const AMINE_SPECS = [];
for (let n = 1; n <= 4; n++) for (let at = 1; at <= Math.ceil(n / 2); at++) AMINE_SPECS.push({ kind: "amine", n, at });
export const AMIDE_SPECS = Array.from({ length: 4 }, (_, i) => ({ kind: "amide", n: i + 1 }));

// Ethers everyone meets under trivial names — shown alongside the reveal.
export const ETHER_COMMON = {
  methoxymethane: "dimethyl ether",
  methoxyethane: "ethyl methyl ether",
  ethoxyethane: "diethyl ether"
};

export function buildProblemFamily(spec) {
  const fam = FAMILIES[spec.kind];
  const name = fam.name(spec);
  return {
    spec,
    mode: "build",
    prompt: name,
    answer: ETHER_COMMON[name] ? `${name} (${ETHER_COMMON[name]})` : name,
    formula: fam.formula(spec),
    condensed: fam.condensed(spec),
    target: fam.graph(spec),
    allowed: spec.kind === "amine" ? ["C", "N"] : spec.kind === "amide" ? ["C", "N", "O"] : ["C", "O"],
    hints: fam.hints(spec)
  };
}

// Round recipes per functional-group tab.
export function makeCarbonylDealer() {
  const ald = makeBag(ALDEHYDE_SPECS), ket = makeBag(KETONE_SPECS);
  return (rng = Math.random) => shuffle([...ald(2, rng), ...ket(3, rng)], rng);
}
export function makeEtherDealer() {
  const bag = makeBagDealer(ETHER_SPECS, (s) => FAMILIES.ether.name(s));
  return (rng = Math.random) => bag(DEFAULT_ROUND, rng);
}
export function makeAcidEsterDealer() {
  const acid = makeBag(ACID_SPECS), ester = makeBag(ESTER_SPECS);
  return (rng = Math.random) => shuffle([...acid(2, rng), ...ester(3, rng)], rng);
}
export function makeNitrogenDealer() {
  const amine = makeBag(AMINE_SPECS), amide = makeBag(AMIDE_SPECS);
  return (rng = Math.random) => shuffle([...amine(3, rng), ...amide(2, rng)], rng);
}

// Any build-direction spec → its problem. Alkane specs are {n}; unsaturated add
// {slot, order}; branched are {m, methyls}; alcohols are {n, oh}; functional-group
// specs carry an explicit `kind`.
export function buildAnyStructure(spec) {
  if (spec.kind) return buildProblemFamily(spec);
  if (spec.methyls) return buildProblemBranched(spec);
  if (spec.order) return buildProblemUnsaturated(spec);
  if (spec.oh) return buildProblemAlcohol(spec);
  return buildProblemStructure(spec);
}

// The rung-3 round recipe is fixed: 1 alkane + 2 alkenes + 2 alkynes, shuffled.
// Each category cycles its own shuffle-bag so the whole family gets seen over time.
// A draw can straddle the pile's reshuffle boundary — dedupe within each call so a
// round never sees the same card twice.
function makeBag(items, keyFn = JSON.stringify) {
  let pile = [];
  return function drawFrom(k, rng = Math.random) {
    const out = [];
    const used = new Set();
    for (let i = 0; i < k; i++) {
      if (pile.length === 0) pile = shuffle(items, rng);
      let card = pile.pop();
      for (let g = 0; used.has(keyFn(card)) && g < items.length; g++) {
        if (pile.length === 0) pile = shuffle(items, rng);
        card = pile.pop();
      }
      used.add(keyFn(card));
      out.push({ ...card });
    }
    return out;
  };
}

// Dalia's playtest ruling (2026-07-31): dragging ten carbons is fine ONCE — a round
// that deals decane, heptane, decane is a slog. Build rounds use the "boss card"
// recipe: four short molecules (≤6 C) + exactly one long drag (7–10 C).
const LONG_FROM = 7;

export function makeAlkaneBuildDealer() {
  const short = makeBag(ALKANES.filter((a) => a.n < LONG_FROM).map((a) => ({ n: a.n })));
  const long = makeBag(ALKANES.filter((a) => a.n >= LONG_FROM).map((a) => ({ n: a.n })));
  return (n = DEFAULT_ROUND, rng = Math.random) => shuffle([...short(4, rng), ...long(1, rng)], rng);
}

export function makeUnsaturatedDealer() {
  const bags = {
    ane: [makeBag(ALKANES.filter((a) => a.n < LONG_FROM).map((a) => ({ n: a.n }))),
          makeBag(ALKANES.filter((a) => a.n >= LONG_FROM).map((a) => ({ n: a.n })))],
    ene: [makeBag(ENE_SPECS.filter((s) => s.n < LONG_FROM)), makeBag(ENE_SPECS.filter((s) => s.n >= LONG_FROM))],
    yne: [makeBag(YNE_SPECS.filter((s) => s.n < LONG_FROM)), makeBag(YNE_SPECS.filter((s) => s.n >= LONG_FROM))]
  };
  const counts = { ane: 1, ene: 2, yne: 2 };
  const bossPool = ["ane", "ene", "ene", "yne", "yne"]; // boss category, proportional to counts
  return (rng = Math.random) => {
    const boss = bossPool[Math.floor(rng() * bossPool.length)];
    const cards = [];
    for (const [cat, k] of Object.entries(counts)) {
      const nLong = cat === boss ? 1 : 0;
      cards.push(...bags[cat][1](nLong, rng), ...bags[cat][0](k - nLong, rng));
    }
    return shuffle(cards, rng);
  };
}

// Shuffle-bag dealer over arbitrary specs, deduped within a round by key.
function makeBagDealer(items, keyFn) {
  let pile = [];
  return function deal(k = DEFAULT_ROUND, rng = Math.random) {
    const cards = [];
    const used = new Set();
    for (let i = 0; i < k; i++) {
      if (pile.length === 0) pile = shuffle(items, rng);
      let card = pile.pop();
      for (let g = 0; used.has(keyFn(card)) && g < items.length; g++) {
        if (pile.length === 0) pile = shuffle(items, rng);
        card = pile.pop();
      }
      used.add(keyFn(card));
      cards.push({ ...card });
    }
    return cards;
  };
}

// The ladder. Rungs 1–2 share the alkane deck — what changes is the spelling the
// student reads. Rungs 3–5 are build-only (see the ruling above). The alcohols rung
// puts oxygen in the tray.
export const LEVELS = [
  { id: "molecular", label: "Molecular formulas", build: buildProblem },
  { id: "condensed", label: "Condensed formulas", build: buildProblemCondensed },
  { id: "unsaturated", label: "Alkenes & alkynes", buildOnly: true },
  { id: "branched", label: "Branching", buildOnly: true },
  { id: "alcohols", label: "Alcohols", buildOnly: true, trayElements: ["C", "O"] },
  { id: "carbonyls", label: "Aldehydes & ketones", buildOnly: true, trayElements: ["C", "O"] },
  { id: "ethers", label: "Ethers", buildOnly: true, trayElements: ["C", "O"] },
  { id: "acids", label: "Acids & esters", buildOnly: true, trayElements: ["C", "O"] },
  { id: "nitrogen", label: "Amines & amides", buildOnly: true, trayElements: ["C", "N", "O"] }
];

// ── grading ─────────────────────────────────────────────────────────────────────
// Names are single words: forgive case and stray spacing, nothing else. A wrong root or
// suffix is chemistry, not formatting — it's simply wrong and the card comes back around.
const normalize = (s) => String(s).toLowerCase().trim().replace(/\s+/g, " ");

export function gradeAnswer(problem, typed) {
  const t = normalize(typed);
  return { correct: problem.accepted.some((f) => normalize(f) === t) };
}

// ── dealing & the round queue (same rhythm as the inorganic builder) ────────────
export const DEFAULT_ROUND = 5;

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A bag deals without replacement, reshuffling only when empty — so every alkane appears
// before any repeats across rounds (two rounds cover the whole ladder).
export function makeDealer(items = ALKANES) {
  let pile = [];
  return function deal(n = DEFAULT_ROUND, rng = Math.random) {
    const cards = [];
    const used = new Set();
    for (let i = 0; i < n; i += 1) {
      if (pile.length === 0) pile = shuffle(items, rng);
      let card = pile.pop();
      // Round boundary can re-offer something already dealt this round — skip past it.
      for (let g = 0; used.has(card.n) && g < items.length; g += 1) {
        if (pile.length === 0) pile = shuffle(items, rng);
        card = pile.pop();
      }
      used.add(card.n);
      cards.push({ n: card.n });
    }
    return cards;
  };
}

// Advance the queue: mastered → drop; missed → rotate to the back for another pass.
export function requeue(queue, wasCorrect) {
  if (queue.length === 0) return queue;
  const [head, ...rest] = queue;
  return wasCorrect ? rest : [...rest, head];
}
