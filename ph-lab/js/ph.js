// pH Lab — pure logic. No DOM here; app.js renders, content.js supplies the item pools.
// Rung 1 (Powers of Ten): every quantity is a clean power of ten, so every conversion is
// exponent arithmetic — flip a sign, or make two numbers meet 14. No logs, no calculator,
// exactly like the exam.

// The four corners of the pH square and the conversions between them.
// Every item is { kind, n } where n is the magnitude of the GIVEN exponent (or the given pH/pOH).
// n may be 0 (a 1 M strong acid → pH 0) through 14.
export const KINDS = {
  "h-to-ph":   { given: "H",   ask: "pH",  answerKind: "integer" },
  "ph-to-h":   { given: "pH",  ask: "H",   answerKind: "exponent" },
  "ph-to-poh": { given: "pH",  ask: "pOH", answerKind: "integer" },
  "poh-to-ph": { given: "pOH", ask: "pH",  answerKind: "integer" },
  "h-to-oh":   { given: "H",   ask: "OH",  answerKind: "exponent" },
  "oh-to-ph":  { given: "OH",  ask: "pH",  answerKind: "integer" }
};

// The single source of numeric truth: what is the answer for this item?
// Integer answers are pH/pOH values (always 0..14 here); exponent answers are the signed
// exponent of a concentration (always negative or zero... in fact always ≤ 0, usually < 0).
export function solve(item) {
  const n = item.n;
  switch (item.kind) {
    case "h-to-ph":   return n;            // [H+] = 10^-n  → pH = n
    case "ph-to-h":   return -n;           // pH = n        → [H+] = 10^-n
    case "ph-to-poh": return 14 - n;       // pH + pOH = 14
    case "poh-to-ph": return 14 - n;
    case "h-to-oh":   return -(14 - n);    // exponents sum to −14 (Kw)
    case "oh-to-ph":  return 14 - n;       // [OH-] = 10^-n → pOH = n → pH = 14 − n
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

// Where the solution sits on the 0–14 spine (for the reveal marker). Every problem resolves
// to a pH, even when the ASKED quantity is a concentration or a pOH.
export function solutionPh(item) {
  const n = item.n;
  switch (item.kind) {
    case "h-to-ph":   return n;
    case "ph-to-h":   return n;
    case "ph-to-poh": return n;
    case "poh-to-ph": return 14 - n;
    case "h-to-oh":   return n;
    case "oh-to-ph":  return 14 - n;
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

// ── hints: a progressive ladder per kind — rule first, method second, this-card last ──
export function buildHints(item) {
  const n = item.n;
  switch (item.kind) {
    case "h-to-ph": return [
      `<strong>pH = −log₁₀[H⁺]</strong>. When the concentration is a power of ten, the pH is just the exponent with its sign flipped.`,
      `[H⁺] = 10<sup>−n</sup> → pH = <strong>n</strong>. No calculating — read the exponent.`,
      `Here the exponent is <strong>−${n}</strong>. Flip its sign.`
    ];
    case "ph-to-h": return [
      `Run the definition backwards: <strong>[H⁺] = 10<sup>−pH</sup></strong>.`,
      `A pH of n means [H⁺] = 10<sup>−n</sup> — put the minus back on.`,
      `Here pH = <strong>${n}</strong>, so the exponent you type is its negative.`
    ];
    case "ph-to-poh": return [
      `<strong>pH + pOH = 14</strong> (at 25 °C). The two always share 14 between them.`,
      `Subtract the one you have from 14.`,
      `14 − <strong>${n}</strong>.`
    ];
    case "poh-to-ph": return [
      `<strong>pH + pOH = 14</strong> (at 25 °C). The two always share 14 between them.`,
      `Subtract the one you have from 14.`,
      `14 − <strong>${n}</strong>.`
    ];
    case "h-to-oh": return [
      `<strong>[H⁺] · [OH⁻] = K<sub>w</sub> = 10⁻¹⁴</strong> (at 25 °C).`,
      `Multiplying powers of ten means <strong>adding exponents</strong> — so the two exponents must add to −14.`,
      `−14 − (−${n}) = the exponent you need.`
    ];
    case "oh-to-ph": return [
      `Two steps: [OH⁻] first tells you the <strong>pOH</strong>, then <strong>pH + pOH = 14</strong> finishes it.`,
      `[OH⁻] = 10<sup>−${n}</sup> → pOH = ${n}.`,
      `pH = 14 − <strong>${n}</strong>.`
    ];
    default: throw new Error(`unknown kind: ${item.kind}`);
  }
}

export function buildProblem(item) {
  const meta = KINDS[item.kind];
  if (!meta) throw new Error(`unknown kind: ${item.kind}`);
  return { ...item, ...meta, answer: solve(item), ph: solutionPh(item), hints: buildHints(item) };
}

// ── grading ──────────────────────────────────────────────────────────────────
// Typed answers are bare integers ("12") for pH/pOH, signed exponents ("−3" / "-3") for
// concentrations. Normalize unicode minus and stray spaces; a leading "+" is fine.
export function parseTyped(text) {
  const cleaned = String(text).replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(/^\+/, "");
  if (!/^-?\d{1,2}$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

// Sign near-misses get a nudge and a retry, not a burned card (house pattern from the
// Oxidation-State Trainer). Everything else grades right/wrong.
export function grade(problem, typed) {
  const value = parseTyped(typed);
  if (Number.isNaN(value)) return { correct: false, value, nudge: null };
  if (value === problem.answer) return { correct: true, value, nudge: null };
  if (problem.answerKind === "exponent" && value === -problem.answer && problem.answer !== 0) {
    return { correct: false, value, nudge: "exponent-negative" };
  }
  if (problem.answerKind === "integer" && value === -problem.answer && problem.answer !== 0) {
    return { correct: false, value, nudge: "scale-positive" };
  }
  return { correct: false, value, nudge: null };
}

// Pretty-print an answer for the reveal: "pH 5", "pOH 9", or "10⁻³ M" with a real superscript.
const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const supNum = (x) => String(x).split("").map((c) => SUP[c] ?? c).join("");
export function formatAnswer(problem) {
  if (problem.answerKind === "exponent") return `10${supNum(problem.answer)} M`;
  return `${problem.ask} ${problem.answer}`;
}
