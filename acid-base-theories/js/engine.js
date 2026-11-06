// Acid-Base Theories — pure logic. No DOM. ESM for `node --test`.

export const THEORIES = ["arrhenius", "bronsted", "lewis"];

// The theories lit by one pick. Arrhenius ⊂ Brønsted-Lowry ⊂ Lewis, so picking the narrow one
// lights every wider one: Arrhenius lights all three, Brønsted-Lowry lights itself and Lewis,
// Lewis lights itself alone.
export function litTheories(pick) {
  const i = THEORIES.indexOf(pick);
  return i < 0 ? [] : THEORIES.slice(i);
}

export const ROLES = ["acid", "base", "ca", "cb", "neither"];

// Does this species get the theory question? Only reactants (acid or base) do.
export function asksTheory(species) {
  return species.role === "acid" || species.role === "base";
}

// Grade one species. selection = { role, theory }. theory is null when not asked.
export function gradeSpecies(species, sel = {}) {
  const role = sel.role === species.role;
  const theory = asksTheory(species) ? sel.theory === species.theory : null;
  return { role, theory, ok: role && theory !== false };
}

// Check is allowed once every asked field is picked.
export function isComplete(species, sel = {}) {
  if (sel.role == null) return false;
  return !asksTheory(species) || sel.theory != null;
}

// After a reaction: every species right -> drop it; any miss -> rotate it to the back.
export function requeue(queue, allOk) {
  if (queue.length === 0) return queue;
  const [head, ...rest] = queue;
  return allOk ? rest : [...rest, head];
}

export const DEFAULT_ROUND = 8;

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Coverage-aware round: unmastered first, least-seen first, random tiebreak. stats = { id: { seen, mastered } }.
export function buildRound(reactions, stats = {}, size = DEFAULT_ROUND, rng = Math.random) {
  const decorated = reactions.map((r) => {
    const rec = stats[r.id] || {};
    return { r, tier: rec.mastered ? 1 : 0, seen: rec.seen || 0, k: rng() };
  });
  decorated.sort((a, b) => a.tier - b.tier || a.seen - b.seen || a.k - b.k);
  return shuffle(decorated.slice(0, Math.min(size, decorated.length)).map((x) => x.r.id), rng);
}

export function recordResult(stats, id, ok) {
  const rec = stats[id] || { seen: 0, mastered: false };
  return { ...stats, [id]: { seen: rec.seen + 1, mastered: rec.mastered || ok } };
}
