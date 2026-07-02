// Oxidation-State Trainer — pure engine. No DOM, no globals. ESM for `node --test`.
//
// The skill: find the oxidation state of ONE highlighted atom in a formula. The method (not the
// criss-cross shortcut — see memory `charge-deduction-teaching`) is a single equation:
//
//     Σ (count × oxidation state) = the species' overall charge        (0 for a neutral molecule)
//
// Assign the oxidation states you can read by sight to every OTHER atom, then solve for the target.
// The content (content.js) is curated so every non-target atom is sight-assignable — peroxides,
// superoxides, OF2 and metal hydrides (the rule exceptions) are deliberately left out. Every item's
// answer is COMPUTED here and cross-checked against a hand-entered value in the tests (oracle pattern,
// like the nomenclature engine) so a content typo can't ship.

// ── element names (for the hint prose) — only what the content uses; keeps this game standalone ──
export const ELEMENT_NAMES = {
  H: "hydrogen", C: "carbon", N: "nitrogen", O: "oxygen", F: "fluorine", Na: "sodium",
  Mg: "magnesium", Al: "aluminum", P: "phosphorus", S: "sulfur", Cl: "chlorine", K: "potassium",
  Ca: "calcium", Cr: "chromium", Mn: "manganese", Fe: "iron", Cu: "copper", Zn: "zinc",
  Br: "bromine", I: "iodine"
};

// ── sight-assignable oxidation states (priority order) ───────────────────────────
// These are the states a NON-target atom takes "by sight." The target atom is the unknown we solve
// for, so it is never assigned here. Order matters: F wins over everything; O is −2 unless it's the
// target; a halogen is −1 only when it isn't the target (in an oxyanion the halogen IS the target).
const GROUP_1 = new Set(["Li", "Na", "K", "Rb", "Cs"]);
const GROUP_2 = new Set(["Be", "Mg", "Ca", "Sr", "Ba"]);
const HALOGEN = new Set(["Cl", "Br", "I"]);

export function knownOxidation(el) {
  if (el === "F") return -1;          // fluorine is always −1
  if (GROUP_1.has(el)) return 1;      // group 1 → +1
  if (GROUP_2.has(el)) return 2;      // group 2 → +2
  if (el === "H") return 1;           // hydrogen → +1 (not a metal hydride; those are excluded)
  if (el === "O") return -2;          // oxygen → −2 (not a peroxide/OF2; those are excluded)
  if (HALOGEN.has(el)) return -1;     // Cl/Br/I → −1 when bonded to a less electronegative partner
  return null;                        // anything else can't be assigned by sight → must be the target
}

// ── formula parsing ──────────────────────────────────────────────────────────────
// Parse a paren-free formula ("MnO4", "Cr2O7", "Cl2", "Na") → [{ el, count }] in written order.
// Paren-free is enough: every drilled species is a simple element / oxide / oxyanion. A formula it
// can't fully consume throws (so a malformed item fails loudly in the tests).
export function parseFormula(formula) {
  const parts = [];
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m;
  let consumed = 0;
  while ((m = re.exec(formula)) !== null) {
    if (m[0] === "") break;
    parts.push({ el: m[1], count: m[2] ? Number(m[2]) : 1 });
    consumed += m[0].length;
  }
  if (consumed !== formula.length || parts.length === 0) throw new Error(`can't parse formula "${formula}"`);
  return parts;
}

// ── the solver ───────────────────────────────────────────────────────────────────
// Solve the oxidation state of `target` in `formula` (overall `charge`, 0 for a molecule). Returns
// the answer plus the full reasoning the hint ladder reads back: the assigned atoms, their running
// total, and the target's count. Throws if a non-target atom isn't sight-assignable or the answer
// isn't a whole number — both mean the item is malformed, which the tests catch.
export function oxidationStateOf({ formula, charge = 0, target }) {
  const parts = parseFormula(formula);
  const targetCount = parts.filter((p) => p.el === target).reduce((s, p) => s + p.count, 0);
  if (targetCount === 0) throw new Error(`target ${target} not in ${formula}`);

  const assigned = [];
  let knownTotal = 0;
  for (const p of parts) {
    if (p.el === target) continue;
    const ox = knownOxidation(p.el);
    if (ox == null) throw new Error(`can't assign a known oxidation state to ${p.el} in ${formula}`);
    assigned.push({ el: p.el, count: p.count, ox, subtotal: ox * p.count });
    knownTotal += ox * p.count;
  }
  const numerator = charge - knownTotal;
  if (numerator % targetCount !== 0) throw new Error(`${target} in ${formula} (charge ${charge}) isn't a whole oxidation state`);
  return { target, targetOx: numerator / targetCount, targetCount, parts, assigned, knownTotal, charge, formula };
}

// ── formatting + grading ───────────────────────────────────────────────────────────
// Oxidation states are written sign-FIRST (+7, −2, 0) — unlike an ionic charge, which is sign-LAST
// (2−). That distinction is a teaching point, so the canonical reveal always uses this form.
export function signedOx(n) {
  return n === 0 ? "0" : (n > 0 ? "+" : "−") + Math.abs(n);
}

// Parse a typed oxidation state. Forgiving: "+7" and "7" both read as +7 (a bare number is positive);
// a negative MUST carry its sign ("−2"/"-2"), so typing "2" for −2 is wrong — exactly the error we
// want to catch. Accepts the unicode minus. Returns NaN for anything that isn't a plain signed int.
export function parseSigned(s) {
  const t = String(s).trim().replace(/−/g, "-").replace(/\s+/g, "");
  return /^[+-]?\d+$/.test(t) ? parseInt(t, 10) : NaN;
}

// A sign-LAST charge a student might type out of habit ("2−", "3+") — the wrong order for an
// oxidation state. Used only to offer a "write it sign-first" nudge, never to accept the answer.
export function parseChargeStyle(s) {
  const m = /^(\d+)\s*([+-])$/.exec(String(s).trim().replace(/−/g, "-"));
  return m ? (m[2] === "+" ? 1 : -1) * parseInt(m[1], 10) : NaN;
}

export function gradeOx(targetOx, typed) {
  const value = parseSigned(typed);
  if (value === targetOx) return { correct: true, value, nudge: null };
  // Formatting near-miss: written charge-style (sign-last) but the right magnitude + sign. The
  // chemistry is right, only the notation order is off → nudge and let them retry (house pattern).
  const cs = parseChargeStyle(typed);
  if (Number.isNaN(value) && cs === targetOx) return { correct: false, value: cs, nudge: "signfirst" };
  return { correct: false, value: Number.isNaN(value) ? cs : value, nudge: null };
}

// ── hint ladder ─────────────────────────────────────────────────────────────────
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const name = (el) => ELEMENT_NAMES[el] || el;

// One assigned element's contribution, as prose: "Oxygen is −2, and there are 4 oxygens → 4 × (−2) = −8".
function assignmentClause(a) {
  const each = signedOx(a.ox);
  if (a.count === 1) return `${cap(name(a.el))} is <strong>${each}</strong>`;
  return `${cap(name(a.el))} is <strong>${each}</strong>, and there are <strong>${a.count}</strong> ${name(a.el)}s → ${a.count} × (${each}) = <strong>${signedOx(a.subtotal)}</strong>`;
}

// Build the progressive hint ladder from a solved problem. Tier 1 (no atoms to assign) gets a single
// rule; molecules and ions get the three-rung method → assign → solve walk.
export function buildHints(solved) {
  const { target, targetOx, targetCount, assigned, knownTotal, charge } = solved;
  const tName = cap(name(target));

  if (assigned.length === 0) {
    return charge === 0
      ? [`This is a <strong>free element</strong> — uncombined, bonded only to itself. Rule: a free element's oxidation state is always <strong>0</strong>.`]
      : [`This is a <strong>monatomic ion</strong> (a single atom). Rule: its oxidation state is exactly its <strong>charge</strong> — read it straight off the formula.`];
  }

  const sumTo = charge === 0
    ? `<strong>0</strong> for a neutral molecule`
    : `the ion's overall charge, <strong>${signedOx(charge)}</strong>`;
  const method = `Each atom's oxidation state × how many of that atom adds up to ${sumTo}. Assign the atoms you know, then solve for <strong>${tName}</strong>.`;
  const assignLine = assigned.map(assignmentClause).join("; ") + ".";
  const solve = targetCount === 1
    ? `Let <strong>x</strong> = ${tName}'s oxidation state:  x + (${signedOx(knownTotal)}) = ${signedOx(charge)}  →  <strong>x = ${signedOx(targetOx)}</strong>.`
    : `Let <strong>x</strong> = each ${tName}'s oxidation state:  ${targetCount}·x + (${signedOx(knownTotal)}) = ${signedOx(charge)}  →  ${targetCount}x = ${signedOx(charge - knownTotal)}  →  <strong>x = ${signedOx(targetOx)}</strong>.`;
  return [method, assignLine, solve];
}

// One built problem: the solved answer + its hint ladder + the canonical signed reveal. The DOM layer
// (app.js) renders the highlighted formula from `parts`/`target`; everything graded lives here.
export function buildProblem(item) {
  const solved = oxidationStateOf(item);
  return { ...item, ...solved, hints: buildHints(solved), answer: signedOx(solved.targetOx) };
}

// ── half-reactions: element ⇄ monatomic ion (the redox on-ramp) ──────────────────
// When an element becomes its ion it transfers electrons. Count = atoms × |charge|; a → POSITIVE ion
// LOSES them (oxidation), a → NEGATIVE ion GAINS them (reduction). OIL RIG. Content lists the element
// (its real elemental form — diatomic stays diatomic), the ion, its charge, and how many ions form.
export function halfReactionOf({ element, ion, ionCharge, ionCount = 1 }) {
  return {
    element, ion, ionCharge, ionCount,
    electrons: ionCount * Math.abs(ionCharge),       // total electrons moved
    perAtom: Math.abs(ionCharge),                    // per-atom oxidation-state change
    direction: ionCharge > 0 ? "oxidation" : "reduction"
  };
}

function halfHints(h) {
  const el = cap(name(h.ion));
  const n = h.electrons === 1 ? "1 electron" : `${h.electrons} electrons`;
  return [
    `An element becomes an ion by moving electrons. A <strong>positive</strong> ion means electrons were <strong>lost</strong> (oxidation); a <strong>negative</strong> ion means electrons were <strong>gained</strong> (reduction). <em>OIL RIG.</em>`,
    `Each ${el} goes from 0 to <strong>${signedOx(h.ionCharge)}</strong> — a change of <strong>${h.perAtom}</strong>${h.ionCount > 1 ? `, and there are <strong>${h.ionCount}</strong> ${name(h.ion)}s → <strong>${h.electrons}</strong> electrons total` : ` → <strong>${n}</strong>`}.`,
    `${h.ionCharge > 0 ? "Positive ion → electrons lost → <strong>oxidation</strong>" : "Negative ion → electrons gained → <strong>reduction</strong>"}. So <strong>${n}</strong>, <strong>${h.direction}</strong>.`
  ];
}

export function buildHalfReaction(item) {
  const h = halfReactionOf(item);
  return { ...item, ...h, hints: halfHints(h) };
}

// Grade the two facets: the electron count (typed) and the direction (picked).
export function gradeHalf(half, typedElectrons, pickedDirection) {
  const value = parseSigned(typedElectrons);
  const countOk = value === half.electrons;
  const dirOk = pickedDirection === half.direction;
  return { correct: countOk && dirOk, countOk, dirOk, value };
}
