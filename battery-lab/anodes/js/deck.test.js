/* node --test battery-lab/anodes/js/deck.test.js */
import test from "node:test";
import assert from "node:assert/strict";
import { buildRound, buildQuestion, QUESTION_TYPES } from "../../../shared/js/mcq-quiz.js";
import { DECK } from "../data/cards.js";
import { figSvg } from "./fig.js";

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pool = DECK.cards;
const byCat = (k) => pool.filter((c) => c.category === k);

test("deck integrity: ids unique, claims unique deck-wide, shapes right", () => {
  const ids = new Set(pool.map((c) => c.id));
  assert.equal(ids.size, pool.length);

  const claims = pool.flatMap((c) => c.claims);
  assert.equal(new Set(claims).size, claims.length, "every claim must be unique deck-wide");

  for (const c of pool) {
    assert.ok(c.claims.length >= 2, `${c.id} needs >=2 claims`);
    assert.equal(c.facts.length, 3, `${c.id} needs exactly 3 facts`);
    assert.equal(c.specs.length, 3, `${c.id} needs exactly 3 spec chips`);
    assert.ok(["layers", "house", "spinel", "alloy", "metal"].includes(c.fig.kind), c.id);
    assert.ok(DECK.categories[c.category], c.id);
  }
});

/* Pools mirror the app: the active tab's cards are BOTH the round and the
   distractor pool (house ruling: small-tab quizzes stay within-family), so
   card-based questions carry min(4, pool) options and claim-based ones
   min(4, 1 + the other pool cards' claims). */
test("every question fits its within-family pool: option count, one correct, all unique", () => {
  const rng = seeded(19);
  for (let round = 0; round < 30; round++) {
    for (const cat of ["intercalation", "alloying", "metal", "all"]) {
      const cards = cat === "all" ? pool : byCat(cat);
      for (const q of buildRound(cards, cards, rng)) {
        if (q.type === "whoClaim") {
          const donorClaims = cards
            .filter((c) => c.id !== q.cardId)
            .reduce((n, c) => n + c.claims.length, 0);
          assert.equal(q.options.length, Math.min(4, 1 + donorClaims), `${cat} ${q.type} ${q.cardId}`);
        } else {
          assert.equal(q.options.length, Math.min(4, cards.length), `${cat} ${q.type} ${q.cardId}`);
        }
        assert.equal(q.options.filter((o) => o.correct).length, 1);
        const keys = q.options.map((o) => o.cardId ?? o.text);
        assert.equal(new Set(keys).size, q.options.length, `duplicate options in ${q.type} for ${q.cardId}`);
      }
    }
  }
});

test("correct option matches the asked card (or its claim)", () => {
  const rng = seeded(23);
  for (const card of pool) {
    for (const type of QUESTION_TYPES) {
      const q = buildQuestion(card, pool, type, rng);
      const right = q.options.find((o) => o.correct);
      if (type === "whoClaim") assert.ok(card.claims.includes(right.text));
      else assert.equal(right.cardId, card.id);
    }
  }
});

test("figure renderer produces valid-looking distinct svg for every card", () => {
  const seen = new Set();
  for (const c of pool) {
    const svg = figSvg(c, { aria: c.name });
    assert.ok(svg.startsWith("<svg"), c.id);
    assert.ok(!svg.includes("NaN"), `NaN coordinates in ${c.id}`);
    assert.ok(!svg.includes("undefined"), `undefined leaked into ${c.id}`);
    assert.ok(!seen.has(svg), `${c.id} renders identically to another card — overlay missing`);
    seen.add(svg);
  }
});
