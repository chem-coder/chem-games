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

// Any build-direction spec → its problem. Alkane specs are {n}; unsaturated add {slot, order}.
export function buildAnyStructure(spec) {
  return spec.order ? buildProblemUnsaturated(spec) : buildProblemStructure(spec);
}

// The rung-3 round recipe is fixed: 1 alkane + 2 alkenes + 2 alkynes, shuffled.
// Each category cycles its own shuffle-bag so the whole family gets seen over time.
function makeBag(items) {
  let pile = [];
  return function drawFrom(k, rng = Math.random) {
    const out = [];
    for (let i = 0; i < k; i++) {
      if (pile.length === 0) pile = shuffle(items, rng);
      out.push({ ...pile.pop() });
    }
    return out;
  };
}

export function makeUnsaturatedDealer() {
  const anes = makeBag(ALKANES.map((a) => ({ n: a.n })));
  const enes = makeBag(ENE_SPECS);
  const ynes = makeBag(YNE_SPECS);
  return (rng = Math.random) => shuffle([...anes(1, rng), ...enes(2, rng), ...ynes(2, rng)], rng);
}

// The ladder. Rungs 1–2 share the alkane deck — what changes is the spelling the
// student reads. Rung 3 is build-only (see the ruling above).
export const LEVELS = [
  { id: "molecular", label: "Molecular formulas", build: buildProblem },
  { id: "condensed", label: "Condensed formulas", build: buildProblemCondensed },
  { id: "unsaturated", label: "Alkenes & alkynes", buildOnly: true }
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
