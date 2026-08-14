/*
  Quiz engine (pure — no DOM, no imports of data or renderer).
  Builds a round of multiple-choice questions from a set of cards, mixing
  four question shapes so structures and facts get cross-associated:

    structName — shown a structure, pick the component
    nameStruct — given the name, pick the structure (4 drawn options)
    claimWho   — given a claim, pick the component it describes
    whoClaim   — given a component, pick the claim that is true of it

  Question: { type, cardId, claim?, options: [{ cardId? , text?, correct }] }
  Distractors come from the same category first, then the rest of the pool.
  Apps pass the ACTIVE TAB's cards as the pool (house ruling: small-tab
  quizzes stay within-family), so card-based questions may carry fewer than
  4 options in a two-card family; claim-based questions round-robin extra
  claims from the same donors to fill all 4.
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
  const donors = shuffled(near, rng).concat(shuffled(far, rng));
  // one claim per donor first, then donors' second claims, until 3 distractors
  const lists = donors.map((d) => shuffled(d.claims, rng));
  const texts = [];
  for (let i = 0; texts.length < 3 && lists.some((l) => l[i] != null); i++) {
    for (const l of lists) {
      if (texts.length < 3 && l[i] != null) texts.push(l[i]);
    }
  }
  const opts = texts.map((text) => ({ text, correct: false }));
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
