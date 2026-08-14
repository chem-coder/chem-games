/*
  Quiz engine (pure — no DOM, no imports of data or renderer).
  Builds a round of multiple-choice questions from a set of cards, mixing
  four question shapes so structures and facts get cross-associated:

    structName — shown a structure, pick the component
    nameStruct — given the name, pick the structure (4 drawn options)
    claimWho   — given a claim, pick the component it describes
    whoClaim   — given a component, pick the claim that is true of it

  Question: { type, cardId, claim?, options: [{ cardId? , text?, correct }] }
  Distractors come from the same category when possible, then the rest of
  the pool — for the two-card additive category the cyclic-carbonate
  solvents are chemically honest decoys.
*/

export const QUESTION_TYPES = ["structName", "nameStruct", "claimWho", "whoClaim"];

function shuffled(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 3 distractor cards: same category first, then the rest of the pool. */
function distractorCards(card, pool, rng) {
  const near = pool.filter((c) => c.id !== card.id && c.category === card.category);
  const far = pool.filter((c) => c.id !== card.id && c.category !== card.category);
  return shuffled(near, rng).concat(shuffled(far, rng)).slice(0, 3);
}

function cardOptions(card, pool, rng) {
  const opts = distractorCards(card, pool, rng).map((c) => ({ cardId: c.id, correct: false }));
  opts.push({ cardId: card.id, correct: true });
  return shuffled(opts, rng);
}

function claimOptions(card, pool, rng) {
  const claim = card.claims[Math.floor(rng() * card.claims.length)];
  const near = pool.filter((c) => c.id !== card.id && c.category === card.category);
  const far = pool.filter((c) => c.id !== card.id && c.category !== card.category);
  const donors = shuffled(near, rng).concat(shuffled(far, rng)).slice(0, 3);
  const opts = donors.map((c) => ({
    text: c.claims[Math.floor(rng() * c.claims.length)],
    correct: false,
  }));
  opts.push({ text: claim, correct: true });
  return shuffled(opts, rng);
}

/**
 * Build one question of the given type about `card`.
 * `pool` = all cards distractors may be drawn from (usually the whole deck).
 */
export function buildQuestion(card, pool, type, rng) {
  if (type === "whoClaim") {
    return { type, cardId: card.id, options: claimOptions(card, pool, rng) };
  }
  const q = { type, cardId: card.id, options: cardOptions(card, pool, rng) };
  if (type === "claimWho") {
    q.claim = card.claims[Math.floor(rng() * card.claims.length)];
  }
  return q;
}

/**
 * Build a round over `cards` (the active tab), with distractors from `pool`.
 * Aims for two questions per card of different types, shuffled, capped.
 */
export function buildRound(cards, pool, rng = Math.random, cap = 10) {
  const questions = [];
  for (const card of shuffled(cards, rng)) {
    const types = shuffled(QUESTION_TYPES, rng).slice(0, 2);
    for (const type of types) {
      questions.push(buildQuestion(card, pool, type, rng));
    }
  }
  // interleave so the same card's two questions don't sit adjacent
  return shuffled(questions, rng).slice(0, cap);
}
