// Grading for the Nomenclature engine. Pure, no DOM. ESM for node --test.
//
// Grading is membership in an accepted set, never a regex. `assemble()` produced every spelling the
// course accepts; here we normalise the student's input the same way and check whether it lands in
// that set. On a hit we also report the *other* accepted names so the UI can teach the equivalent
// ("✓ bicarbonate — also written hydrogen carbonate").

import { fromUnicodeSub } from "./chem.js";

// Names: case-insensitive; collapse whitespace; tidy the Roman-numeral parens so "iron (III)" and
// "iron(iii)" both match "iron(III)". Also forgive stray punctuation a student might fat-finger
// (a trailing "\", ".", ",", "/") — only at the ends, so it never alters the chemistry.
export function normalizeName(s, { tidyParens = true } = {}) {
  let out = String(s)
    .toLowerCase()
    .trim()
    .replace(/^[^a-z(]+/, "")   // strip leading junk (must start with a letter or "(")
    .replace(/[^a-z)]+$/, "");  // strip trailing junk (must end with a letter or ")")
  // tidyParens collapses spaces around the Roman-numeral parens (iron (II) → iron(II)). The grader
  // forgives that by default; pass tidyParens:false to KEEP the space, so we can detect the slip
  // and teach the tight IUPAC form (see gradeName's spaceOnly).
  if (tidyParens) out = out.replace(/\s*\(\s*/g, "(").replace(/\s*\)/g, ")");
  return out.replace(/\s+/g, " ").trim();
}

// Formulas: subscripts may be typed as plain digits or unicode — fold to plain digits. Strip spaces.
// Case is meaningful in a formula (Co ≠ CO), so it is preserved. The charge has its own field, but
// students naturally write it into the formula too (NH4+, NO3⁻), so drop a trailing charge sign —
// only the sign characters, never a digit (NO3- must stay NO3, not collapse to NO).
export function normalizeFormula(s) {
  return fromUnicodeSub(String(s))
    .replace(/\s+/g, "")
    // Strip a trailing charge run: superscript digits (²³ live outside the ⁰-⁹ block), superscript
    // signs, and ASCII +/-/−. ASCII digits are deliberately excluded so NO3- → NO3, not NO.
    .replace(/[²³¹⁰⁴-⁹⁺⁻+\-−]+$/, "");
}

// Shared core: does `input` match any accepted form (under `normalize`)? Report the equivalents.
function grade(accepted, input, normalize) {
  const want = normalize(input);
  const matchedIndex = accepted.findIndex((form) => normalize(form) === want);
  const correct = matchedIndex !== -1;
  // "Also accepted" = the other forms that differ once normalised (skip pure case/spacing twins).
  const seen = new Set([want]);
  const alsoAccepted = [];
  accepted.forEach((form, i) => {
    if (i === matchedIndex) return;
    const n = normalize(form);
    if (seen.has(n)) return;
    seen.add(n);
    alsoAccepted.push(form);
  });
  return { correct, matched: correct ? accepted[matchedIndex] : null, alsoAccepted };
}

// Grade a typed NAME against an assembled compound (or any { name: { canonical, accepted } }).
export function gradeName(target, input) {
  const { correct, matched, alsoAccepted } = grade(target.name.accepted, input, normalizeName);
  // spaceOnly: the answer matches ONLY because we forgave a space around the Roman-numeral parens
  // (iron (II) vs iron(II)). The UI uses it to nudge the tight IUPAC form instead of just accepting.
  const spaceOnly = correct && !grade(target.name.accepted, input, (s) => normalizeName(s, { tidyParens: false })).correct;
  return { correct, matched, canonical: target.name.canonical, alsoAccepted, spaceOnly };
}

// Grade a typed FORMULA against an assembled compound.
//
// Two contexts:
//  - ION grading (default): a free-standing ion may legitimately carry its charge (NH₄⁺), so a
//    trailing charge is stripped, and all whitespace is collapsed (as before).
//  - NEUTRAL COMPOUND grading ({ neutral: true }, the Name Builder): a compound has NO net charge,
//    so a trailing +/− is a real error, surfaced as `chargeOnly` (the UI nudges "drop the charge")
//    rather than being silently accepted. Only leading/trailing spaces are trimmed (internal spaces
//    are wrong); trailing fat-finger junk (/ . , \) is forgiven; case stays meaningful.
//
// Near-miss flags let the UI nudge instead of failing: `caseOnly` (right but wrong caps) and, in
// neutral mode, `chargeOnly` (right but for a stray charge). Either lets the student retry.
export function gradeFormula(target, input, { neutral = false } = {}) {
  const accepted = target.formula.accepted;
  const canonical = target.formula.canonical;
  if (!neutral) {
    const { correct, matched, alsoAccepted } = grade(accepted, input, normalizeFormula);
    const caseOnly = !correct && grade(accepted, input, (s) => normalizeFormula(s).toLowerCase()).correct;
    return { correct, matched, canonical, alsoAccepted, caseOnly, chargeOnly: false };
  }
  // neutral compound: trim ENDS only (internal spaces fail), forgive trailing junk, keep case + charge.
  const base = (s) => fromUnicodeSub(String(s)).trim().replace(/[/.,\\]+$/, "");
  const noCharge = (s) => base(s).replace(/[²³¹⁰⁴-⁹⁺⁻+\-−]+$/, "");
  const { correct, matched, alsoAccepted } = grade(accepted, input, base);
  const caseOnly = !correct && grade(accepted, input, (s) => base(s).toLowerCase()).correct;
  const chargeOnly = !correct && !caseOnly && grade(accepted, input, noCharge).correct;
  return { correct, matched, canonical, alsoAccepted, caseOnly, chargeOnly };
}
