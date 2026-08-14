/*
  Typed recall (pure — no DOM). Shared by the Battery Lab card games.
  House answer model: accepted SET of normalized strings per card (never
  regex) — the abbreviation, the full name, and any per-card aliases all
  count; case, spaces, hyphens, dots, and unicode sub/superscripts don't.

  Round questions: { card, type: 'figure' | 'claim', claim? } — the app
  renders 'figure' with its own renderer (structure / lattice / mechanism
  figure) and 'claim' as a quoted fact; the player types who it is.
*/

const SUB_MAP = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
const SUP_MAP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-" };

/** lowercase, plain digits, no separators — the comparison form */
export function normalize(s) {
  return String(s)
    .replace(/[₀-₉]/g, (ch) => SUB_MAP[ch])
    .replace(/[⁰-⁹⁺⁻]/g, (ch) => SUP_MAP[ch])
    .toLowerCase()
    .replace(/[\s\-–—._·]/g, "")
    .replace(/[()]/g, "");
}

/** every normalized string that counts as naming this card */
export function acceptedSet(card) {
  const set = new Set([normalize(card.abbr)]);
  // names often carry a parenthetical qualifier — accept with and without it
  const name = card.name.replace(/\s*\(.*\)\s*$/, "");
  set.add(normalize(card.name));
  set.add(normalize(name));
  for (const a of card.aliases || []) set.add(normalize(a));
  return set;
}

export function matches(card, input) {
  const n = normalize(input);
  return n.length > 0 && acceptedSet(card).has(n);
}

function shuffled(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * One question per card (shuffled, capped): half figure-prompts, half
 * claim-prompts, assigned randomly per card.
 */
export function buildRecallRound(cards, rng = Math.random, cap = 8) {
  return shuffled(cards, rng)
    .slice(0, cap)
    .map((card) => makeQuestion(card, rng));
}

/** a single question for `card`; pass avoidType to vary a requeued retry */
export function makeQuestion(card, rng = Math.random, avoidType = null) {
  const canClaim = (card.claims || []).length > 0;
  let type = canClaim && rng() < 0.5 ? "claim" : "figure";
  if (avoidType && canClaim) type = avoidType === "figure" ? "claim" : "figure";
  const q = { card, type };
  if (type === "claim") {
    q.claim = card.claims[Math.floor(rng() * card.claims.length)];
  }
  return q;
}
