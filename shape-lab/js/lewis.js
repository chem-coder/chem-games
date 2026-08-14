// Shape Lab — Lewis structures & formal charge content.
// Dalia's six steps (from "How to Draw Lewis Structures", Heritage Ch 10), the
// worked walkthroughs, and the formal-charge drill bank. Scenes are tiny
// declarative drawings rendered to SVG — atoms, bonds, dots, labels, brackets.

// ── scene renderer ──
const EL_FILL = {
  C: "#322e27", O: "#c0492f", H: "#e6dac2", N: "#436074", S: "#ce9b22",
  P: "#b4502f", F: "#7a9a52", Cl: "#7a9a52", Br: "#8a5a3a", I: "#835f7d",
  B: "#c9a06a", Be: "#a8b8a0", Xe: "#6b8f9c",
  As: "#9c7a4a", Sb: "#7f7668", Se: "#c07a35",
};
const LIGHT_INK = new Set(["C", "N", "P", "I", "O", "Br", "Xe", "As", "Sb", "Se"]);
const COMPASS = [-90, 0, 90, 180];
const rad = (d) => (d * Math.PI) / 180;

const angDist = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

// Distribute an atom's lone electrons into compass slots that stay clear of bonds.
function loneSlots(atom, scene) {
  const dirs = (scene.bonds || [])
    .filter((b) => b.a === atom.i || b.b === atom.i)
    .map((b) => {
      const o = scene.atoms[b.a === atom.i ? b.b : b.a];
      return (Math.atan2(o.y - atom.y, o.x - atom.x) * 180) / Math.PI;
    });
  let slots = COMPASS
    .map((s) => ({ s, d: dirs.length ? Math.min(...dirs.map((x) => angDist(s, x))) : 999 }))
    .filter((x) => x.d > 30).sort((a, b) => b.d - a.d).map((x) => x.s);
  if (!slots.length) slots.push(...COMPASS);
  const counts = slots.map(() => 0);
  // Dalia's rules: FREE atoms spread singles-first (showing valence) — and when
  // the scene says which way the future bond lies (atom.face, degrees), the
  // unpaired electrons turn to FACE that connection while the pairs sit away
  // from it. BONDED atoms draw their remaining electrons as lone pairs on the
  // freest sides — textbook Lewis convention.
  if (dirs.length) {
    // Bonded atoms may carry more pairs than the compass has free sides
    // (XeF2's center holds three) — diagonals join the candidate list, ranked
    // by distance from the bonds, and pairs fill the clearest sides first.
    slots = [...COMPASS, -45, 45, 135, -135]
      .map((s2) => ({ s: s2, d: Math.min(...dirs.map((x) => angDist(s2, x))) }))
      .sort((a, b) => b.d - a.d)
      .map((x) => x.s);
    counts.length = slots.length; counts.fill(0);
    let rem = atom.lone || 0;
    for (let i = 0; i < slots.length && rem > 0; i++) { const take = Math.min(2, rem); counts[i] = take; rem -= take; }
  } else if (atom.face !== undefined) {
    slots = COMPASS.slice().sort((a, b) => angDist(a, atom.face) - angDist(b, atom.face)); // nearest first
    const n = atom.lone || 0;
    const pairs = Math.max(0, n - 4);
    const singles = n - 2 * pairs;
    counts.length = slots.length; counts.fill(0);
    for (let i = 0; i < singles; i++) counts[i] = 1;                       // singles face the connection
    for (let j = 0; j < pairs; j++) counts[slots.length - 1 - j] = 2;     // pairs turn away from it
  } else {
    for (let i = 0; i < (atom.lone || 0); i++) counts[i % slots.length] < 2 ? counts[i % slots.length]++ : counts[(i + 1) % slots.length]++;
  }
  const out = [];
  slots.forEach((s, i) => {
    if (counts[i] === 1) out.push(s);
    else if (counts[i] === 2) out.push(s - 12, s + 12);
  });
  return out;
}

export function sceneSvg(scene, w = 340, h = 230) {
  const R = scene.atomR || 17;
  const parts = [];
  scene.atoms.forEach((a, i) => { a.i = i; });
  (scene.bonds || []).forEach((b) => {
    const A = scene.atoms[b.a], B = scene.atoms[b.b];
    const ang = Math.atan2(B.y - A.y, B.x - A.x);
    for (let k = 0; k < (b.order || 1); k++) {
      const off = (k - ((b.order || 1) - 1) / 2) * 6;
      const px = Math.cos(ang + Math.PI / 2) * off, py = Math.sin(ang + Math.PI / 2) * off;
      const rA = A.ghost ? 2 : R, rB = B.ghost ? 2 : R;
      parts.push(`<line x1="${A.x + Math.cos(ang) * rA + px}" y1="${A.y + Math.sin(ang) * rA + py}" x2="${B.x - Math.cos(ang) * rB + px}" y2="${B.y - Math.sin(ang) * rB + py}" stroke="#897f6d" stroke-width="2.4" stroke-linecap="round"/>`);
    }
  });
  scene.atoms.forEach((a) => {
    if (a.ghost) return;
    const fill = EL_FILL[a.el] || "#d8c9a8";
    parts.push(`<circle cx="${a.x}" cy="${a.y}" r="${R}" fill="${fill}" stroke="rgba(45,42,35,0.4)" stroke-width="1.2"/>`);
    parts.push(`<text x="${a.x}" y="${a.y + 1}" text-anchor="middle" dominant-baseline="middle" font-family="Lexend,sans-serif" font-weight="700" font-size="${a.el.length > 1 ? 12 : 14}" fill="${LIGHT_INK.has(a.el) ? "#fffdf8" : "#2d2a23"}">${a.el}</text>`);
    const dotAngles = loneSlots(a, scene);
    for (const s of dotAngles) {
      const x = a.x + Math.cos(rad(s)) * (R + 8), y = a.y + Math.sin(rad(s)) * (R + 8);
      parts.push(`<circle cx="${x}" cy="${y}" r="2.8" fill="#134f48"/>`);
    }
    if (a.fc !== undefined) {
      // The label takes the emptiest corner: farthest from every bond and dot.
      const bondAngles = (scene.bonds || [])
        .filter((b) => b.a === a.i || b.b === a.i)
        .map((b) => {
          const o = scene.atoms[b.a === a.i ? b.b : b.a];
          return (Math.atan2(o.y - a.y, o.x - a.x) * 180) / Math.PI;
        });
      const occupied = [...bondAngles, ...dotAngles];
      const corner = [-45, -135, 45, 135]
        .map((c) => ({ c, d: occupied.length ? Math.min(...occupied.map((o) => angDist(c, o))) : 90 }))
        .sort((x, y) => y.d - x.d)[0].c;
      const fx = a.x + Math.cos(rad(corner)) * (R + 15), fy = a.y + Math.sin(rad(corner)) * (R + 15);
      parts.push(`<text x="${fx}" y="${fy + 4}" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="700" font-size="12" fill="${a.fc.startsWith("−") ? "#b4502f" : a.fc === "0" ? "#897f6d" : "#835f7d"}">${a.fc}</text>`);
    }
  });
  (scene.labels || []).forEach((l) => {
    parts.push(`<text x="${l.x}" y="${l.y}" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="${l.bold ? 700 : 500}" font-size="${l.size || 13}" fill="${l.color || "#2d2a23"}">${l.t}</text>`);
  });
  if (scene.bracket) {
    const { x0, y0, x1, y1, q } = scene.bracket;
    parts.push(`<path d="M ${x0 + 10} ${y0} H ${x0} V ${y1} H ${x0 + 10}" fill="none" stroke="#835f7d" stroke-width="2.2"/>`);
    parts.push(`<path d="M ${x1 - 10} ${y0} H ${x1} V ${y1} H ${x1 - 10}" fill="none" stroke="#835f7d" stroke-width="2.2"/>`);
    parts.push(`<text x="${x1 + 6}" y="${y0 + 2}" font-family="Lexend,sans-serif" font-weight="700" font-size="17" fill="#835f7d">${q}</text>`);
  }
  return `<svg viewBox="${-w / 2} ${-h / 2} ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${parts.join("")}</svg>`;
}


// Generate a ready-made 2D Lewis structure from a quiz molecule's st data —
// what the geometry quiz shows so the student reads structure, not formula.
const PERIPH_ANGLES = {
  1: [0], 2: [0, 180], 3: [-90, 30, 150], 4: [-45, 45, 135, -135],
  5: [-90, -18, 54, 126, 198], 6: [-90, -30, 30, 90, 150, 210],
};
export function genScene(m) {
  const atoms = [{ el: m.center, x: 0, y: 0, lone: m.st.cl || 0 }];
  const bonds = [];
  const list = [];
  m.st.parts.forEach(([el, order, lone, count]) => { for (let i = 0; i < count; i++) list.push({ el, order, lone }); });
  const angles = PERIPH_ANGLES[list.length];
  const RADIUS = 76;
  list.forEach((pp, i) => {
    const a = rad(angles[i]);
    atoms.push({ el: pp.el, x: Math.round(Math.cos(a) * RADIUS), y: Math.round(Math.sin(a) * RADIUS), lone: pp.lone });
    bonds.push({ a: 0, b: i + 1, order: pp.order });
  });
  const scene = { atoms, bonds };
  if (m.charge) {
    const q = Math.abs(m.charge) === 1 ? "" : String(Math.abs(m.charge));
    scene.bracket = { x0: -122, y0: -112, x1: 122, y1: 108, q: q + (m.charge > 0 ? "+" : "\u2212") };
  }
  return scene;
}

// A lone atom with n bond stubs and its dots — the formal-charge sketch.
export function fcScene(item) {
  const atoms = [{ el: item.el, x: 0, y: 0, lone: item.lp * 2 }];
  const bonds = [];
  const start = item.lp ? 90 : -90; // stubs lean away from where dots want to sit
  for (let i = 0; i < item.bonds; i++) {
    const a = rad(start + (i * 360) / Math.max(item.bonds, 2) + (item.bonds === 1 ? 0 : 20));
    atoms.push({ el: "", ghost: true, x: Math.cos(a) * 62, y: Math.sin(a) * 62 });
    bonds.push({ a: 0, b: atoms.length - 1 });
  }
  return { atoms, bonds };
}

// ── formal charge ──
export const FC_RULES = [
  "Zero and ±1 are acceptable. Bigger charges (±2, ±3) mark an unstable arrangement: redraw it.",
  "Negative formal charges belong on the atoms of GREATER electronegativity.",
  "The formal charges must add up to the ion's total charge (zero for a neutral molecule).",
];

// The three illustrated cases on the intro page: negative, neutral, positive.
export const FC_EXAMPLES = [
  {
    title: "Negative: a single-bonded O in nitrate",
    item: { el: "O", v: 6, bonds: 1, lp: 3 },
    calc: "FC = 6 − 6 − 1 = <strong>−1</strong>",
    text: "6 valence electrons, 6 dots kept, 1 stick held.",
  },
  {
    title: "Neutral: the O in water",
    item: { el: "O", v: 6, bonds: 2, lp: 2 },
    calc: "FC = 6 − 4 − 2 = <strong>0</strong>",
    text: "6 valence electrons, 4 dots kept, 2 sticks held.",
  },
  {
    title: "Positive: the N in ammonium",
    item: { el: "N", v: 5, bonds: 4, lp: 0 },
    calc: "FC = 5 − 0 − 4 = <strong>+1</strong>",
    text: "5 valence electrons, no dots kept, 4 sticks held.",
  },
];

// The drill bank. answer = valence − 2·lp − bonds.
export const FC_BANK = [
  { el: "O", v: 6, bonds: 2, lp: 2, ctx: "the O in water" },
  { el: "O", v: 6, bonds: 1, lp: 3, ctx: "a single-bonded O in nitrate" },
  { el: "O", v: 6, bonds: 2, lp: 2, ctx: "the double-bonded O in nitrate" },
  { el: "N", v: 5, bonds: 4, lp: 0, ctx: "the N in ammonium" },
  { el: "N", v: 5, bonds: 3, lp: 1, ctx: "the N in ammonia" },
  { el: "C", v: 4, bonds: 4, lp: 0, ctx: "the C in methane" },
  { el: "C", v: 4, bonds: 3, lp: 1, ctx: "the C in carbon monoxide" },
  { el: "O", v: 6, bonds: 3, lp: 1, ctx: "the O in hydronium" },
  { el: "B", v: 3, bonds: 4, lp: 0, ctx: "the B in BF₄⁻" },
  { el: "Cl", v: 7, bonds: 1, lp: 3, ctx: "the Cl in HCl" },
  { el: "S", v: 6, bonds: 6, lp: 0, ctx: "the S in SF₆" },
  { el: "N", v: 5, bonds: 2, lp: 2, ctx: "the N in an (incorrectly drawn) nitrite — spot the problem" },
];
export const fcAnswer = (i) => i.v - 2 * i.lp - i.bonds;

// Visual examples for the three guidelines (Dalia's spec, 2026-08-12).
// Guideline 1: the same oxygen drawn wrong (+2) and right (0), side by side.
export const FC_RULE1_FIG = [
  {
    item: { el: "O", v: 6, bonds: 2, lp: 1 },
    calc: "FC = 6 − 2 − 2 = <strong>+2</strong>",
    caption: "One lone pair and two sticks: +2 is too big. Unstable — redraw it.",
    good: false,
  },
  {
    item: { el: "O", v: 6, bonds: 2, lp: 2 },
    calc: "FC = 6 − 4 − 2 = <strong>0</strong>",
    caption: "Two lone pairs and two sticks: zero. Stable.",
    good: true,
  },
];

// Guidelines 2 & 3: the cyanide ion [CN]⁻, wrong on the left, correct on the
// right. Dalia's counterexample: FC 0 on C and −1 on N puts the negative on the
// more electronegative atom (guideline 2 approves!) — but it forces unpaired
// electrons on both atoms and breaks both octets. Chemistry vetoes nice charges.
const CN_BRACKET = { x0: -100, y0: -52, x1: 100, y1: 46, q: "−" };
export const FC_CYANIDE_FIG = [
  {
    scene: { atoms: [{ el: "C", x: -45, y: 0, lone: 1, fc: "0" }, { el: "N", x: 45, y: 0, lone: 3, fc: "−1" }], bonds: [{ a: 0, b: 1, order: 3 }], bracket: CN_BRACKET },
    caption: "FC 0 on C and −1 on N: the negative sits on the more electronegative atom, just as guideline 2 asks. But both atoms now carry unpaired electrons, and the octets are broken (7 around C, 9 around N). Unfavorable chemistry.",
    good: false,
  },
  {
    scene: { atoms: [{ el: "C", x: -45, y: 0, lone: 2, fc: "−1" }, { el: "N", x: 45, y: 0, lone: 2, fc: "0" }], bonds: [{ a: 0, b: 1, order: 3 }], bracket: CN_BRACKET },
    caption: "A lone pair on each element: complete octets (8 and 8), paired electrons, and −1 + 0 = −1, exactly the ion's charge.",
    good: true,
  },
];

// ── Dalia's six steps, lightly polished ──
export const LEWIS_STEPS = [
  { title: "1 · Count: the valence electrons",
    body: "Add up every atom's valence electrons. Then the charge: <strong>add</strong> one electron per negative charge, <strong>remove</strong> one per positive. This number is the law — the final drawing must contain exactly this many." },
  { title: "2 · Sketch: the skeletal structure",
    body: "Pick the central atom: the one that <strong>needs the most bonds</strong> to be stable, with the <strong>lower electronegativity</strong> as the tiebreak (never H). Arrange the others symmetrically around it and connect with single bonds — each line is one shared pair. Ions get [square brackets] and their charge." },
  { title: "3 · Fill: octets, as dots",
    body: "Give every atom its octet as dots — except H and He, who follow the <strong>duet rule</strong> and are full at 2. Don't count the total yet; this is the trial structure." },
  { title: "4 · Compare: the drawing to the count",
    body: "Count the electrons in the trial drawing.<br>• <strong>Equal</strong> to the step-1 total → done, go verify.<br>• <strong>Too many</strong> → erase two lone pairs, draw one more bond (that's how doubles and triples are born).<br>• <strong>Too few</strong> → add lone pairs to the central atom — but a row-2 center can never exceed 8." },
  { title: "5 · Minimize: the formal charge",
    body: "FC = valence − dots − sticks, for every atom. Keep everything at 0 or ±1, put the negatives on the more electronegative atoms, and if you see ±2 — the structure is wrong, go back a step." },
  { title: "6 · Verify: the five checks",
    body: "Duets on every H. Octets on every row-2 atom (Be and B may hold less; radicals excepted). The <strong>exact</strong> electron count from step 1. Small formal charges, negatives on the electronegative atoms. All five true? You have a Lewis structure." },
];

// ── worked walkthroughs ──
const wH = (x, y) => ({ el: "H", x, y });
export const WALKTHROUGHS = [
  {
    id: "no3", f: "NO3-", name: "Nitrate — the favorite", ready: true,
    steps: [
      { t: "Count: N brings 5, each O brings 6, and the −1 charge donates one more electron: 5 + 18 + 1 = <strong>24 electrons</strong>. The brackets and the charge go up now — they're part of the drawing.",
        scene: { atoms: [{ el: "N", x: 0, y: 6, lone: 5 }, { el: "O", x: 0, y: -80, lone: 6, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "−" }, labels: [{ x: 0, y: 116, t: "5 + 6·3 + 1 = 24 e⁻", bold: true }] } },
      { t: "Skeleton: N is the central atom — it needs the most bonds and is less electronegative than O. Three single bonds, arranged symmetrically.",
        scene: { atoms: [{ el: "N", x: 0, y: 6 }, { el: "O", x: 0, y: -80 }, { el: "O", x: -82, y: 58 }, { el: "O", x: 82, y: 58 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "−" }, labels: [{ x: 0, y: 116, t: "3 bonds = 6 e⁻ used" }] } },
      { t: "Octets everywhere: three lone pairs on each O, and N takes a pair to reach 8 too. This is the trial structure.",
        scene: { atoms: [{ el: "N", x: 0, y: 6, lone: 2 }, { el: "O", x: 0, y: -80, lone: 6, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "−" }, labels: [{ x: 0, y: 116, t: "trial: 6 + 18 + 2 = 26 e⁻ — two too many!", bold: true, color: "#b4502f" }] } },
      { t: "26 &gt; 24, so erase two lone pairs and draw one more bond: one N–O becomes N=O. Count again: 8 in bonds + 16 in dots = <strong>24</strong>. ✓",
        scene: { atoms: [{ el: "N", x: 0, y: 6 }, { el: "O", x: 0, y: -80, lone: 4, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "−" }, labels: [{ x: 0, y: 116, t: "8 + 16 = 24 ✓", bold: true, color: "#356b45" }] } },
      { t: "Formal charges: N is 5−0−4 = <strong>+1</strong>; each single-bonded O is 6−6−1 = <strong>−1</strong>; the double-bonded O is 6−4−2 = <strong>0</strong>. Net: +1 −1 −1 = <strong>−1</strong> — exactly the ion's charge, with the negatives sitting on oxygen, the more electronegative atom. This is as small as the charges can get.",
        scene: { atoms: [{ el: "N", x: 0, y: 6, fc: "+1" }, { el: "O", x: 0, y: -80, lone: 4, fc: "0" }, { el: "O", x: -82, y: 58, lone: 6, fc: "−1" }, { el: "O", x: 82, y: 58, lone: 6, fc: "−1" }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "−" } } },
      { t: "One more thing — <strong>which</strong> O gets the double bond? Any of them. Three equally valid drawings, connected with double-headed arrows. The truth is in between: every N–O bond is really <strong>1⅓</strong>. We can't draw thirds of a bond without losing track of formal charges and electron counts — so we draw all three. And notice: N ends with exactly 8. Row 2 never expands — that's why nitrogen is such a good teacher.",
        scene: { atomR: 9, atoms: [
          { el: "N", x: -110, y: 10 }, { el: "O", x: -110, y: -38 }, { el: "O", x: -148, y: 40 }, { el: "O", x: -72, y: 40 },
          { el: "N", x: 0, y: 10 }, { el: "O", x: 0, y: -38 }, { el: "O", x: -38, y: 40 }, { el: "O", x: 38, y: 40 },
          { el: "N", x: 110, y: 10 }, { el: "O", x: 110, y: -38 }, { el: "O", x: 72, y: 40 }, { el: "O", x: 148, y: 40 },
        ], bonds: [
          { a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 },
          { a: 4, b: 5 }, { a: 4, b: 6, order: 2 }, { a: 4, b: 7 },
          { a: 8, b: 9 }, { a: 8, b: 10 }, { a: 8, b: 11, order: 2 },
        ], labels: [{ x: -55, y: 10, t: "⟷", size: 18 }, { x: 55, y: 10, t: "⟷", size: 18 }, { x: 0, y: 85, t: "three drawings, one ion — each bond is really 1⅓", size: 12, color: "#897f6d" }] } },
    ],
  },
  {
    id: "h2o", f: "H2O", name: "Water — the gentle start", ready: true,
    steps: [
      { t: "Count: O brings 6, each H brings 1: 6 + 1 + 1 = <strong>8 electrons</strong>.",
        scene: { atoms: [{ el: "O", x: 0, y: -14, lone: 6, face: 90 }, { el: "H", x: -84, y: 48, lone: 1, face: -36 }, { el: "H", x: 84, y: 48, lone: 1, face: -144 }], labels: [{ x: 0, y: 95, t: "6 + 1 + 1 = 8 e⁻", bold: true }], } },
      { t: "Skeleton: H can never be central (one electron, one bond, that's its whole story) — so O takes the middle. Two single bonds.",
        scene: { atoms: [{ el: "O", x: 0, y: -8 }, wH(-76, 46), wH(76, 46)], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 92, t: "2 bonds = 4 e⁻ used, 4 left" }] } },
      { t: "Octets: both H are already full — the duet rule, 2 each from their bonds. O has 4 from bonds and takes the remaining 4 electrons as two lone pairs.",
        scene: { atoms: [{ el: "O", x: 0, y: -8, lone: 4 }, wH(-76, 46), wH(76, 46)], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 92, t: "O: 4 + 4 = 8 ✓" }] } },
      { t: "Count and compare: 4 in bonds + 4 in dots = <strong>8 = 8</strong>. Done — no multiple bonds needed today.",
        scene: { atoms: [{ el: "O", x: 0, y: -8, lone: 4 }, wH(-76, 46), wH(76, 46)], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 92, t: "4 + 4 = 8 ✓", bold: true, color: "#356b45" }] } },
      { t: "Formal charges: O is 6−4−2 = 0, each H is 1−0−1 = 0. Nothing to minimize.",
        scene: { atoms: [{ el: "O", x: 0, y: -8, lone: 4, fc: "0" }, { el: "H", x: -76, y: 46, fc: "0" }, { el: "H", x: 76, y: 46, fc: "0" }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }] } },
      { t: "Verify: duets on both H ✓, octet on O ✓, exactly 8 electrons ✓, all formal charges zero ✓. This bent little drawing is why rung 3 will call water <em>bent</em> — two lone pairs already waiting to squeeze.",
        scene: { atoms: [{ el: "O", x: 0, y: -8, lone: 4 }, wH(-76, 46), wH(76, 46)], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 92, t: "✓ ✓ ✓", bold: true, color: "#356b45" }] } },
    ],
  },
  {
    id: "co2", f: "CO2", name: "Carbon dioxide — doubles are born", ready: true,
    steps: [
      { t: "Count: C brings 4, each O brings 6: 4 + 6 + 6 = <strong>16 electrons</strong>.",
        scene: { atoms: [{ el: "C", x: 0, y: 0, lone: 4 }, { el: "O", x: -96, y: 0, lone: 6, face: 0 }, { el: "O", x: 96, y: 0, lone: 6, face: 180 }], labels: [{ x: 0, y: 85, t: "4 + 6 + 6 = 16 e⁻", bold: true }] } },
      { t: "Skeleton: C is central (needs 4 bonds, less electronegative). Two singles to start.",
        scene: { atoms: [{ el: "C", x: 0, y: 0 }, { el: "O", x: -96, y: 0 }, { el: "O", x: 96, y: 0 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 85, t: "2 bonds = 4 e⁻ used" }] } },
      { t: "Octets for everyone: three pairs on each O, two pairs on C. The trial structure.",
        scene: { atoms: [{ el: "C", x: 0, y: 0, lone: 4 }, { el: "O", x: -96, y: 0, lone: 6, face: 0 }, { el: "O", x: 96, y: 0, lone: 6, face: 180 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 85, t: "trial: 4 + 12 + 4 = 20 e⁻ — four too many!", bold: true, color: "#b4502f" }] } },
      { t: "20 &gt; 16 by four — so erase two pairs and draw a bond, <strong>twice</strong>. Both singles become doubles: O=C=O. Count: 8 in bonds + 8 in dots = <strong>16</strong>. ✓",
        scene: { atoms: [{ el: "C", x: 0, y: 0 }, { el: "O", x: -96, y: 0, lone: 4, face: 0 }, { el: "O", x: 96, y: 0, lone: 4, face: 180 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }], labels: [{ x: 0, y: 85, t: "8 + 8 = 16 ✓", bold: true, color: "#356b45" }] } },
      { t: "Formal charges: C is 4−0−4 = 0, each O is 6−4−2 = 0. Perfect bookkeeping.",
        scene: { atoms: [{ el: "C", x: 0, y: 0, fc: "0" }, { el: "O", x: -96, y: 0, lone: 4, fc: "0" }, { el: "O", x: 96, y: 0, lone: 4, fc: "0" }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }] } },
      { t: "Verify: octets all round ✓, exactly 16 ✓, charges zero ✓. Two double bonds, no lone pairs on C — which is why CO₂ stands perfectly straight at 180°, and why its two polar bonds cancel to a nonpolar molecule.",
        scene: { atoms: [{ el: "C", x: 0, y: 0 }, { el: "O", x: -96, y: 0, lone: 4, face: 0 }, { el: "O", x: 96, y: 0, lone: 4, face: 180 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }], labels: [{ x: 0, y: 85, t: "✓ ✓ ✓", bold: true, color: "#356b45" }] } },
    ],
  },
  {
    id: "bef2", f: "BeF2", name: "Beryllium fluoride — the rebel", ready: true,
    steps: [
      { t: "Count: Be brings 2, each F brings 7: 2 + 7 + 7 = <strong>16 electrons</strong>.",
        scene: { atoms: [{ el: "Be", x: 0, y: 0, lone: 2 }, { el: "F", x: -96, y: 0, lone: 7, face: 0 }, { el: "F", x: 96, y: 0, lone: 7, face: 180 }], labels: [{ x: 0, y: 85, t: "2 + 7 + 7 = 16 e⁻", bold: true }] } },
      { t: "Skeleton: Be central (lower electronegativity — F is the most electronegative element there is). Two singles.",
        scene: { atoms: [{ el: "Be", x: 0, y: 0 }, { el: "F", x: -96, y: 0 }, { el: "F", x: 96, y: 0 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 85, t: "2 bonds = 4 e⁻ used, 12 left" }] } },
      { t: "Octets: the twelve remaining electrons complete both fluorines — three pairs each. Nothing is left for Be.",
        scene: { atoms: [{ el: "Be", x: 0, y: 0 }, { el: "F", x: -96, y: 0, lone: 6, face: 0 }, { el: "F", x: 96, y: 0, lone: 6, face: 180 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 85, t: "4 + 12 = 16 — every electron placed" }] } },
      { t: "Count and compare: 4 + 12 = <strong>16 = 16</strong>, exactly. The arithmetic says we're done — even though Be is sitting there with only 4 electrons.",
        scene: { atoms: [{ el: "Be", x: 0, y: 0 }, { el: "F", x: -96, y: 0, lone: 6, face: 0 }, { el: "F", x: 96, y: 0, lone: 6, face: 180 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 85, t: "16 = 16 ✓ — trust the count", bold: true, color: "#356b45" }] } },
      { t: "Formal charges: Be is 2−0−2 = 0, each F is 7−6−1 = 0. All zero — don't be tempted to force doubles onto Be to \"fix\" its octet; that would put a −1 on Be and +1 on F, the wrong way around entirely.",
        scene: { atoms: [{ el: "Be", x: 0, y: 0, fc: "0" }, { el: "F", x: -96, y: 0, lone: 6, fc: "0" }, { el: "F", x: 96, y: 0, lone: 6, fc: "0" }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }] } },
      { t: "Verify: exact count ✓, charges zero ✓, octets — <strong>Be waives the rule</strong>. Be is content with 4 (as B is with 6). The octet rule is a rule, not a law, and Be signs the waiver.",
        scene: { atoms: [{ el: "Be", x: 0, y: 0 }, { el: "F", x: -96, y: 0, lone: 6, face: 0 }, { el: "F", x: 96, y: 0, lone: 6, face: 180 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }], labels: [{ x: 0, y: 85, t: "the rebel rests ✓", bold: true, color: "#356b45" }] } },
    ],
  },
  {
    id: "co3", f: "CO3^2-", name: "Carbonate — nitrate's cousin", ready: true,
    steps: [
      { t: "Count: C brings 4, each O brings 6, and the 2− charge donates <strong>two</strong> extra electrons: 4 + 18 + 2 = <strong>24 electrons</strong>. Brackets and charge up front.",
        scene: { atoms: [{ el: "C", x: 0, y: 6, lone: 4 }, { el: "O", x: 0, y: -80, lone: 6, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "2−" }, labels: [{ x: 0, y: 116, t: "4 + 6·3 + 2 = 24 e⁻", bold: true }] } },
      { t: "Skeleton: C central — needs the most bonds, less electronegative than O. Three singles, symmetric.",
        scene: { atoms: [{ el: "C", x: 0, y: 6 }, { el: "O", x: 0, y: -80 }, { el: "O", x: -82, y: 58 }, { el: "O", x: 82, y: 58 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "2−" }, labels: [{ x: 0, y: 116, t: "3 bonds = 6 e⁻ used" }] } },
      { t: "Octets: three pairs on each O, one pair on C. The trial structure.",
        scene: { atoms: [{ el: "C", x: 0, y: 6, lone: 2 }, { el: "O", x: 0, y: -80, lone: 6, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "2−" }, labels: [{ x: 0, y: 116, t: "trial: 6 + 18 + 2 = 26 e⁻ — two too many!", bold: true, color: "#b4502f" }] } },
      { t: "26 &gt; 24: erase two pairs, draw one bond — one C–O becomes C=O. Count: 8 + 16 = <strong>24</strong>. ✓ (Recognize the move? Nitrate, exactly.)",
        scene: { atoms: [{ el: "C", x: 0, y: 6 }, { el: "O", x: 0, y: -80, lone: 4, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "2−" }, labels: [{ x: 0, y: 116, t: "8 + 16 = 24 ✓", bold: true, color: "#356b45" }] } },
      { t: "Formal charges: C is 4−0−4 = <strong>0</strong> — kinder than nitrate's nitrogen. The double-bonded O is 0; each single-bonded O is 6−6−1 = <strong>−1</strong>. Net −2 ✓, both minuses on oxygen where they belong.",
        scene: { atoms: [{ el: "C", x: 0, y: 6, fc: "0" }, { el: "O", x: 0, y: -80, lone: 4, fc: "0" }, { el: "O", x: -82, y: 58, lone: 6, fc: "−1" }, { el: "O", x: 82, y: 58, lone: 6, fc: "−1" }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 }], bracket: { x0: -128, y0: -108, x1: 128, y1: 100, q: "2−" } } },
      { t: "And again — <strong>which</strong> O takes the double? Any. Three resonance structures, double-headed arrows, every C–O bond really <strong>1⅓</strong>. Carbonate and nitrate are the same story with different casting.",
        scene: { atomR: 9, atoms: [
          { el: "C", x: -110, y: 10 }, { el: "O", x: -110, y: -38 }, { el: "O", x: -148, y: 40 }, { el: "O", x: -72, y: 40 },
          { el: "C", x: 0, y: 10 }, { el: "O", x: 0, y: -38 }, { el: "O", x: -38, y: 40 }, { el: "O", x: 38, y: 40 },
          { el: "C", x: 110, y: 10 }, { el: "O", x: 110, y: -38 }, { el: "O", x: 72, y: 40 }, { el: "O", x: 148, y: 40 },
        ], bonds: [
          { a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 },
          { a: 4, b: 5 }, { a: 4, b: 6, order: 2 }, { a: 4, b: 7 },
          { a: 8, b: 9 }, { a: 8, b: 10 }, { a: 8, b: 11, order: 2 },
        ], labels: [{ x: -55, y: 10, t: "⟷", size: 18 }, { x: 55, y: 10, t: "⟷", size: 18 }, { x: 0, y: 85, t: "three drawings, one ion — each bond is really 1⅓", size: 12, color: "#897f6d" }] } },
    ],
  },
  {
    id: "so3", f: "SO3", name: "Sulfur trioxide — the expansion", ready: true,
    steps: [
      { t: "Count: S brings 6, each O brings 6: 6 + 18 = <strong>24 electrons</strong>. Neutral — no brackets today.",
        scene: { atoms: [{ el: "S", x: 0, y: 6, lone: 6 }, { el: "O", x: 0, y: -80, lone: 6, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], labels: [{ x: 0, y: 116, t: "6 + 6·3 = 24 e⁻", bold: true }] } },
      { t: "Skeleton: S central, three singles.",
        scene: { atoms: [{ el: "S", x: 0, y: 6 }, { el: "O", x: 0, y: -80 }, { el: "O", x: -82, y: 58 }, { el: "O", x: 82, y: 58 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], labels: [{ x: 0, y: 116, t: "3 bonds = 6 e⁻ used" }] } },
      { word: "Fill + Compare", t: "Octets: three pairs per O, one pair on S. Trial: 6 + 18 + 2 = 26 — two too many, so erase two pairs, draw a bond: one S=O. Count: 8 + 16 = <strong>24</strong> ✓.",
        scene: { atoms: [{ el: "S", x: 0, y: 6 }, { el: "O", x: 0, y: -80, lone: 4, face: 90 }, { el: "O", x: -82, y: 58, lone: 6, face: -32 }, { el: "O", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 }], labels: [{ x: 0, y: 116, t: "8 + 16 = 24 ✓ … but wait", bold: true }] } },
      { word: "Minimize", t: "The count closes — but check the books: S is 6−0−4 = <strong>+2</strong>. Not allowed. A +2 means the drawing is lying, and step 5 exists precisely for this moment.",
        scene: { atoms: [{ el: "S", x: 0, y: 6, fc: "+2" }, { el: "O", x: 0, y: -80, lone: 4, fc: "0" }, { el: "O", x: -82, y: 58, lone: 6, fc: "−1" }, { el: "O", x: 82, y: 58, lone: 6, fc: "−1" }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 }], labels: [{ x: 0, y: 116, t: "net 0 ✓, but +2 on S — fix it", bold: true, color: "#b4502f" }] } },
      { word: "Minimize", t: "S is <strong>row 3</strong> — it may hold more than 8. Trade a lone pair from each remaining O for a bond: three S=O doubles. Now S is 6−0−6 = 0 and every O is 6−4−2 = 0. All zero.",
        scene: { atoms: [{ el: "S", x: 0, y: 6, fc: "0" }, { el: "O", x: 0, y: -80, lone: 4, fc: "0" }, { el: "O", x: -82, y: 58, lone: 4, fc: "0" }, { el: "O", x: 82, y: 58, lone: 4, fc: "0" }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }, { a: 0, b: 3, order: 2 }], labels: [{ x: 0, y: 116, t: "12 + 12 = 24 ✓ — S holds 12", bold: true, color: "#356b45" }] } },
      { t: "Verify: exact count ✓, all formal charges zero ✓, S carries 12 electrons — an <strong>expanded octet</strong>, the row-3 privilege nitrogen will never have. Three identical doubles at 120°: trigonal planar, and perfectly nonpolar despite three ferociously polar bonds.",
        scene: { atoms: [{ el: "S", x: 0, y: 6 }, { el: "O", x: 0, y: -80, lone: 4, face: 90 }, { el: "O", x: -82, y: 58, lone: 4, face: -32 }, { el: "O", x: 82, y: 58, lone: 4, face: -148 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }, { a: 0, b: 3, order: 2 }], labels: [{ x: 0, y: 116, t: "the expansion ✓", bold: true, color: "#356b45" }] } },
    ],
  },
  {
    id: "sf4", f: "SF4", name: "Sulfur tetrafluoride — leftovers to the center", ready: true,
    steps: [
      { t: "Count: S brings 6, each F brings 7: 6 + 28 = <strong>34 electrons</strong>.",
        scene: { atoms: [{ el: "S", x: 0, y: 0, lone: 6 }, { el: "F", x: -75, y: -62, lone: 7, face: 40 }, { el: "F", x: 75, y: -62, lone: 7, face: 140 }, { el: "F", x: -75, y: 66, lone: 7, face: -41 }, { el: "F", x: 75, y: 66, lone: 7, face: -139 }], labels: [{ x: 0, y: 116, t: "6 + 7·4 = 34 e⁻", bold: true }] } },
      { t: "Skeleton: S central, four singles: 8 electrons used, 26 to place.",
        scene: { atoms: [{ el: "S", x: 0, y: 0 }, { el: "F", x: -75, y: -62 }, { el: "F", x: 75, y: -62 }, { el: "F", x: -75, y: 66 }, { el: "F", x: 75, y: 66 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "4 bonds = 8 e⁻ used" }] } },
      { t: "Octets: three pairs on every F takes 24 of the 26. <strong>Two electrons remain.</strong>",
        scene: { atoms: [{ el: "S", x: 0, y: 0 }, { el: "F", x: -75, y: -62, lone: 6, face: 40 }, { el: "F", x: 75, y: -62, lone: 6, face: 140 }, { el: "F", x: -75, y: 66, lone: 6, face: -41 }, { el: "F", x: 75, y: 66, lone: 6, face: -139 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "8 + 24 = 32 — two electrons left over", bold: true, color: "#b4502f" }] } },
      { t: "Leftover electrons go to the <strong>central atom</strong> — S is row 3 and may hold extra. One lone pair on S: 8 + 24 + 2 = <strong>34</strong> ✓.",
        scene: { atoms: [{ el: "S", x: 0, y: 0, lone: 2 }, { el: "F", x: -75, y: -62, lone: 6, face: 40 }, { el: "F", x: 75, y: -62, lone: 6, face: 140 }, { el: "F", x: -75, y: 66, lone: 6, face: -41 }, { el: "F", x: 75, y: 66, lone: 6, face: -139 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "34 = 34 ✓", bold: true, color: "#356b45" }] } },
      { t: "Formal charges: S is 6−2−4 = 0, every F is 7−6−1 = 0. Nothing to minimize — no doubles needed, and F <strong>never</strong> takes a double bond anyway (the most electronegative element shares nothing twice).",
        scene: { atoms: [{ el: "S", x: 0, y: 0, lone: 2, fc: "0" }, { el: "F", x: -75, y: -62, lone: 6, fc: "0" }, { el: "F", x: 75, y: -62, lone: 6, fc: "0" }, { el: "F", x: -75, y: 66, lone: 6, fc: "0" }, { el: "F", x: 75, y: 66, lone: 6, fc: "0" }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }] } },
      { t: "Verify: exact count ✓, charges zero ✓, S holds <strong>10</strong> — expanded, legal in row 3. Four atoms + one lone pair = five regions: the <strong>see-saw</strong> from the Geometries rung, lone pair in its roomy equatorial seat.",
        scene: { atoms: [{ el: "S", x: 0, y: 0, lone: 2 }, { el: "F", x: -75, y: -62, lone: 6, face: 40 }, { el: "F", x: 75, y: -62, lone: 6, face: 140 }, { el: "F", x: -75, y: 66, lone: 6, face: -41 }, { el: "F", x: 75, y: 66, lone: 6, face: -139 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "10 on S · 5 regions · see-saw ✓", bold: true, color: "#356b45" }] } },
    ],
  },
  {
    id: "xeo2f2", f: "XeO2F2", name: "Xenon dioxydifluoride — the boss fight", ready: true,
    steps: [
      { t: "Count: Xe brings 8, each O brings 6, each F brings 7: 8 + 12 + 14 = <strong>34 electrons</strong>. Yes, xenon bonds — the noble gas with paperwork.",
        scene: { atoms: [{ el: "Xe", x: 0, y: 0, lone: 8 }, { el: "O", x: -75, y: -62, lone: 6, face: 40 }, { el: "O", x: 75, y: -62, lone: 6, face: 140 }, { el: "F", x: -75, y: 66, lone: 7, face: -41 }, { el: "F", x: 75, y: 66, lone: 7, face: -139 }], labels: [{ x: 0, y: 116, t: "8 + 6·2 + 7·2 = 34 e⁻", bold: true }] } },
      { t: "Skeleton: Xe central, four singles: 8 used, 26 to place.",
        scene: { atoms: [{ el: "Xe", x: 0, y: 0 }, { el: "O", x: -75, y: -62 }, { el: "O", x: 75, y: -62 }, { el: "F", x: -75, y: 66 }, { el: "F", x: 75, y: 66 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "4 bonds = 8 e⁻ used" }] } },
      { word: "Fill + Compare", t: "Octets on the outside take 24; the last two electrons land on Xe as a lone pair: 34 ✓.",
        scene: { atoms: [{ el: "Xe", x: 0, y: 0, lone: 2 }, { el: "O", x: -75, y: -62, lone: 6, face: 40 }, { el: "O", x: 75, y: -62, lone: 6, face: 140 }, { el: "F", x: -75, y: 66, lone: 6, face: -41 }, { el: "F", x: 75, y: 66, lone: 6, face: -139 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "8 + 24 + 2 = 34 ✓ … now check the books", bold: true }] } },
      { word: "Minimize", t: "Formal charges: Xe is 8−2−4 = <strong>+2</strong>, each O is −1. Net zero, but +2 is not allowed — minimize.",
        scene: { atoms: [{ el: "Xe", x: 0, y: 0, lone: 2, fc: "+2" }, { el: "O", x: -75, y: -62, lone: 6, fc: "−1" }, { el: "O", x: 75, y: -62, lone: 6, fc: "−1" }, { el: "F", x: -75, y: 66, lone: 6, fc: "0" }, { el: "F", x: 75, y: 66, lone: 6, fc: "0" }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "+2 on Xe — fix it", bold: true, color: "#b4502f" }] } },
      { word: "Minimize", t: "Xe is row 5 — expansion is cheap. Each O trades a lone pair for a double bond: Xe becomes 8−2−6 = 0, both O drop to 0. The doubles go to <strong>O, never F</strong>.",
        scene: { atoms: [{ el: "Xe", x: 0, y: 0, lone: 2, fc: "0" }, { el: "O", x: -75, y: -62, lone: 4, fc: "0" }, { el: "O", x: 75, y: -62, lone: 4, fc: "0" }, { el: "F", x: -75, y: 66, lone: 6, fc: "0" }, { el: "F", x: 75, y: 66, lone: 6, fc: "0" }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "all zeros ✓ — Xe holds 14", bold: true, color: "#356b45" }] } },
      { t: "Verify: 34 exactly ✓, charges zero ✓, Xe carries 14 electrons. Four atoms + one lone pair = five regions → <strong>see-saw</strong>, the same shape the quiz asked you about. Boss fight cleared — every rung of this game just met in one molecule.",
        scene: { atoms: [{ el: "Xe", x: 0, y: 0, lone: 2 }, { el: "O", x: -75, y: -62, lone: 4, face: 40 }, { el: "O", x: 75, y: -62, lone: 4, face: 140 }, { el: "F", x: -75, y: 66, lone: 6, face: -41 }, { el: "F", x: 75, y: 66, lone: 6, face: -139 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }], labels: [{ x: 0, y: 116, t: "see-saw, cleared ✓", bold: true, color: "#356b45" }] } },
    ],
  },
  {
    id: "bbr3", f: "BBr3", name: "Boron tribromide — the other rebel", ready: true,
    steps: [
      { t: "Count: B brings 3, each Br brings 7: 3 + 21 = <strong>24 electrons</strong>.",
        scene: { atoms: [{ el: "B", x: 0, y: 6, lone: 3 }, { el: "Br", x: 0, y: -80, lone: 7, face: 90 }, { el: "Br", x: -82, y: 58, lone: 7, face: -32 }, { el: "Br", x: 82, y: 58, lone: 7, face: -148 }], labels: [{ x: 0, y: 116, t: "3 + 7·3 = 24 e⁻", bold: true }] } },
      { t: "Skeleton: B central (lower electronegativity), three singles: 6 used, 18 left.",
        scene: { atoms: [{ el: "B", x: 0, y: 6 }, { el: "Br", x: 0, y: -80 }, { el: "Br", x: -82, y: 58 }, { el: "Br", x: 82, y: 58 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], labels: [{ x: 0, y: 116, t: "3 bonds = 6 e⁻ used" }] } },
      { t: "Octets: the 18 remaining electrons complete all three bromines exactly. Nothing left for B — it sits at 6.",
        scene: { atoms: [{ el: "B", x: 0, y: 6 }, { el: "Br", x: 0, y: -80, lone: 6, face: 90 }, { el: "Br", x: -82, y: 58, lone: 6, face: -32 }, { el: "Br", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], labels: [{ x: 0, y: 116, t: "6 + 18 = 24 — every electron placed" }] } },
      { t: "Count and compare: 24 = <strong>24</strong>, exactly. The arithmetic says done — trust the count over the itch to \"fix\" boron.",
        scene: { atoms: [{ el: "B", x: 0, y: 6 }, { el: "Br", x: 0, y: -80, lone: 6, face: 90 }, { el: "Br", x: -82, y: 58, lone: 6, face: -32 }, { el: "Br", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], labels: [{ x: 0, y: 116, t: "24 = 24 ✓ — trust the count", bold: true, color: "#356b45" }] } },
      { t: "Formal charges: all zero. Forcing a B=Br double would give B a −1 and Br a +1 — <strong>backwards</strong>, since Br is the more electronegative. Never trade good formal charges for an octet on B.",
        scene: { atoms: [{ el: "B", x: 0, y: 6, fc: "0" }, { el: "Br", x: 0, y: -80, lone: 6, fc: "0" }, { el: "Br", x: -82, y: 58, lone: 6, fc: "0" }, { el: "Br", x: 82, y: 58, lone: 6, fc: "0" }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }] } },
      { t: "Verify: exact count ✓, charges zero ✓, octets — <strong>B signs the waiver</strong> at 6, just like Be at 4. Family trait. Flat, 120°, trigonal planar — and nonpolar by symmetry.",
        scene: { atoms: [{ el: "B", x: 0, y: 6 }, { el: "Br", x: 0, y: -80, lone: 6, face: 90 }, { el: "Br", x: -82, y: 58, lone: 6, face: -32 }, { el: "Br", x: 82, y: 58, lone: 6, face: -148 }], bonds: [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }], labels: [{ x: 0, y: 116, t: "the other rebel rests ✓", bold: true, color: "#356b45" }] } },
    ],
  },
]

// Teaching order: increasing complexity (Dalia's ruling — water first, the
// rebels early, doubles before the ions that need them, the boss fight last).
const WALK_ORDER = ["h2o", "bef2", "bbr3", "co2", "no3", "co3", "so3", "sf4", "xeo2f2"];
WALKTHROUGHS.sort((a, b) => WALK_ORDER.indexOf(a.id) - WALK_ORDER.indexOf(b.id));

