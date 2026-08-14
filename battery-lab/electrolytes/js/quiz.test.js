/* node --test battery-lab/electrolytes/js/quiz.test.js */
import test from "node:test";
import assert from "node:assert/strict";
import { buildRound, buildQuestion, QUESTION_TYPES } from "./quiz.js";
import { DECK } from "../data/cards.js";
import { molSvg } from "./structures.js";

// deterministic rng (mulberry32) so failures reproduce
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

test("deck integrity: ids unique, claims unique across deck, mol data sane", () => {
  const ids = new Set(pool.map((c) => c.id));
  assert.equal(ids.size, pool.length);

  const claims = pool.flatMap((c) => c.claims);
  assert.equal(new Set(claims).size, claims.length, "every claim must be unique deck-wide");

  for (const c of pool) {
    assert.ok(c.claims.length >= 2, `${c.id} needs >=2 claims`);
    assert.equal(c.facts.length, 3, `${c.id} needs exactly 3 facts`);
    assert.equal(c.specs.length, 3, `${c.id} needs exactly 3 spec chips`);
    for (const [a, b] of c.mol.bonds) {
      assert.ok(c.mol.atoms[a] && c.mol.atoms[b], `${c.id} bond points at a missing atom`);
    }
  }
});

test("every question has 4 unique options with exactly one correct", () => {
  const rng = seeded(7);
  for (let round = 0; round < 30; round++) {
    for (const cat of ["salt", "solvent", "additive"]) {
      for (const q of buildRound(byCat(cat), pool, rng)) {
        assert.equal(q.options.length, 4);
        assert.equal(q.options.filter((o) => o.correct).length, 1);
        const keys = q.options.map((o) => o.cardId ?? o.text);
        assert.equal(new Set(keys).size, 4, `duplicate options in ${q.type} for ${q.cardId}`);
      }
    }
  }
});

test("correct option matches the asked card (or its claim)", () => {
  const rng = seeded(11);
  for (const card of pool) {
    for (const type of QUESTION_TYPES) {
      const q = buildQuestion(card, pool, type, rng);
      const right = q.options.find((o) => o.correct);
      if (type === "whoClaim") {
        assert.ok(card.claims.includes(right.text));
      } else {
        assert.equal(right.cardId, card.id);
        if (type === "claimWho") assert.ok(card.claims.includes(q.claim));
      }
    }
  }
});

test("round respects the cap and covers distinct cards", () => {
  const rng = seeded(3);
  const salts = byCat("salt");
  const round = buildRound(salts, pool, rng, 10);
  assert.ok(round.length <= 10);
  assert.ok(new Set(round.map((q) => q.cardId)).size >= Math.min(salts.length, 5));

  const additives = byCat("additive");
  const small = buildRound(additives, pool, rng, 10);
  assert.equal(small.length, additives.length * 2);
});

test("renderer produces valid-looking svg for every card", () => {
  for (const c of pool) {
    const svg = molSvg(c.mol, { aria: c.name });
    assert.ok(svg.startsWith("<svg"), c.id);
    assert.ok(svg.includes("viewBox="), c.id);
    assert.ok(!svg.includes("NaN"), `NaN coordinates in ${c.id}`);
    assert.ok(!svg.includes("undefined"), `undefined leaked into ${c.id}`);
  }
});
