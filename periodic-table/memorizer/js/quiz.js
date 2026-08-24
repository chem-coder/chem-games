// Periodic Table Memorizer — the symbol ↔ name quiz (second mode). Pure logic. ESM for node --test.
// Ask either direction: given a symbol, type the element name; or given the name, type the symbol.

import { ELEMENTS } from "../data/pt-data.js";
import { normalizeSymbol, isCorrectSymbol } from "./game.js";

// Accepted spelling variants — US primary (as in the data), plus the common British spelling.
const NAME_ALIASES = {
  aluminum: ["aluminium"],
  sulfur: ["sulphur"],
  cesium: ["caesium"]
};

export function normalizeName(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, " ");
}

export function acceptedNames(el) {
  const n = el.name.toLowerCase();
  return [n, ...(NAME_ALIASES[n] || [])];
}

export function isCorrectName(el, typed) {
  return acceptedNames(el).includes(normalizeName(typed));
}

// direction: "toName" (symbol shown → type name) | "toSymbol" (name shown → type symbol).
export function gradeQuiz(el, direction, typed) {
  return direction === "toSymbol" ? isCorrectSymbol(el, typed) : isCorrectName(el, typed);
}

export const QUIZ_SIZE = 10;

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A round is a sample of element atomic numbers (front = current question), drawn from `pool` —
// the in-scope elements (whole table or just the first few rows).
export function buildQuizRound(size = QUIZ_SIZE, rng = Math.random, pool = ELEMENTS) {
  return shuffle(pool, rng).slice(0, Math.min(size, pool.length)).map((e) => e.z);
}

export function requeue(queue, correct) {
  if (queue.length === 0) return queue;
  const [head, ...rest] = queue;
  return correct ? rest : [...rest, head];
}

export { normalizeSymbol, isCorrectSymbol };
