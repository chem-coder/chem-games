/* node --test shared/js/typed-recall.test.js */
import test from "node:test";
import assert from "node:assert/strict";
import { normalize, acceptedSet, matches, buildRecallRound, makeQuestion } from "./typed-recall.js";
import { DECK as ELECTROLYTES } from "../../battery-lab/electrolytes/data/cards.js";
import { DECK as CATHODES } from "../../battery-lab/cathodes/data/cards.js";
import { DECK as ANODES } from "../../battery-lab/anodes/data/cards.js";

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DECKS = [
  ["electrolytes", ELECTROLYTES],
  ["cathodes", CATHODES],
  ["anodes", ANODES],
];

test("normalize: case, separators, and unicode scripts all collapse", () => {
  assert.equal(normalize("LiPF₆"), "lipf6");
  assert.equal(normalize("LiPF6"), "lipf6");
  assert.equal(normalize("li pf-6"), "lipf6");
  assert.equal(normalize("NMC 811"), "nmc811");
  assert.equal(normalize("Li₄Ti₅O₁₂"), "li4ti5o12");
  assert.equal(normalize("Lithium titanate (spinel)"), "lithiumtitanatespinel");
  assert.equal(normalize("  Li⁺  "), "li+");
});

test("abbreviation, name, and aliases all match; garbage does not", () => {
  for (const [, deck] of DECKS) {
    for (const card of deck.cards) {
      assert.ok(matches(card, card.abbr), `${card.id} rejects its own abbr`);
      assert.ok(matches(card, card.abbr.toLowerCase()), `${card.id} rejects lowercase abbr`);
      assert.ok(matches(card, card.name), `${card.id} rejects its own name`);
      for (const a of card.aliases || []) assert.ok(matches(card, a), `${card.id} rejects alias ${a}`);
      assert.ok(!matches(card, ""), `${card.id} accepts empty`);
      assert.ok(!matches(card, "definitely not a component"), card.id);
    }
  }
});

test("no accepted string names two cards within one deck", () => {
  for (const [deckName, deck] of DECKS) {
    const owner = new Map();
    for (const card of deck.cards) {
      for (const s of acceptedSet(card)) {
        assert.ok(!owner.has(s), `${deckName}: '${s}' names both ${owner.get(s)} and ${card.id}`);
        owner.set(s, card.id);
      }
    }
  }
});

test("typed niceties: the forms a person would actually type", () => {
  const byId = (deck, id) => deck.cards.find((c) => c.id === id);
  assert.ok(matches(byId(ELECTROLYTES, "lipf6"), "LiPF₆"));
  assert.ok(matches(byId(CATHODES, "nmc"), "nmc811"));
  assert.ok(matches(byId(CATHODES, "lmr"), "Li-rich"));
  assert.ok(matches(byId(ANODES, "graphite"), "graphite"));
  assert.ok(matches(byId(ANODES, "limetal"), "li"));
  assert.ok(matches(byId(ANODES, "limetal"), "lithium metal"));
});

test("rounds: one question per card up to cap, valid types, claim payloads", () => {
  const rng = seeded(5);
  for (const [deckName, deck] of DECKS) {
    for (let r = 0; r < 20; r++) {
      const round = buildRecallRound(deck.cards, rng, 8);
      assert.ok(round.length === Math.min(8, deck.cards.length), deckName);
      const ids = new Set(round.map((q) => q.card.id));
      assert.equal(ids.size, round.length, `${deckName}: duplicate cards in a round`);
      for (const q of round) {
        assert.ok(q.type === "figure" || q.type === "claim");
        if (q.type === "claim") assert.ok(q.card.claims.includes(q.claim));
      }
    }
  }
});

test("requeued retries flip the question type when they can", () => {
  const rng = seeded(9);
  const card = CATHODES.cards[0];
  const q1 = makeQuestion(card, rng, "figure");
  assert.equal(q1.type, "claim");
  const q2 = makeQuestion(card, rng, "claim");
  assert.equal(q2.type, "figure");
});
