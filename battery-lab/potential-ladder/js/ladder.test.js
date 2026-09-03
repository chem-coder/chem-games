/* node --test battery-lab/potential-ladder/js/ladder.test.js */
import test from "node:test";
import assert from "node:assert/strict";
import { LADDER } from "../data/ladder.js";
import { matches, acceptedSet } from "../../../shared/js/typed-recall.js";

test("species: unique ids, strictly increasing distinct voltages, notes present", () => {
  const ids = new Set(LADDER.species.map((s) => s.id));
  assert.equal(ids.size, LADDER.species.length);
  const vs = LADDER.species.map((s) => s.v).sort((a, b) => a - b);
  for (let i = 1; i < vs.length; i++) assert.ok(vs[i] > vs[i - 1], "voltages must be distinct so every rung is a unique slot");
  for (const s of LADDER.species) {
    assert.ok(s.label.length > 5 && s.note.length > 10, s.id);
    assert.ok(s.v >= 0 && s.v <= 5, s.id);
  }
});

test("anchor voltages a researcher would check", () => {
  const v = (id) => LADDER.species.find((s) => s.id === id).v;
  assert.equal(v("limetal"), 0);
  assert.equal(v("lto"), 1.55);
  assert.equal(v("lnmo"), 4.7);
  assert.ok(v("cu") < v("lfp"), "the copper cliff sits just below LFP — the deliberate near-miss pair");
});

test("mcq bank: 4 unique options, exactly one correct, why present", () => {
  const banks = [LADDER.halfBank, LADDER.collectorBank];
  for (const bank of banks) {
    for (const q of bank.filter((q) => q.type === "mcq")) {
      assert.equal(q.options.length, 4, q.prompt);
      assert.equal(q.options.filter((o) => o.correct).length, 1, q.prompt);
      assert.equal(new Set(q.options.map((o) => o.text)).size, 4, q.prompt);
      assert.ok(q.why.length > 20, q.prompt);
    }
  }
});

test("typed bank: answers accept symbol, name, and aliases; reject garbage", () => {
  const banks = [LADDER.halfBank, LADDER.collectorBank];
  for (const bank of banks) {
    for (const q of bank.filter((q) => q.type === "typed")) {
      assert.ok(acceptedSet(q.answer).size >= 2, q.prompt);
      assert.ok(matches(q.answer, q.answer.abbr), q.prompt);
      assert.ok(matches(q.answer, q.answer.name), q.prompt);
      assert.ok(!matches(q.answer, "unobtainium"), q.prompt);
      assert.ok(q.why.length > 20, q.prompt);
    }
  }
});

test("typed answers are unambiguous within each bank", () => {
  for (const bank of [LADDER.halfBank, LADDER.collectorBank]) {
    const owner = new Map();
    for (const q of bank.filter((q) => q.type === "typed")) {
      for (const s of acceptedSet(q.answer)) {
        // the same answer may repeat across prompts only if it IS the same element
        if (owner.has(s)) assert.equal(owner.get(s), q.answer.abbr, `'${s}' points at two different answers`);
        owner.set(s, q.answer.abbr);
      }
    }
  }
});

test("corrosion sequence: exactly four steps in mechanism order", () => {
  assert.equal(LADDER.corrosionSteps.length, 4);
  assert.ok(LADDER.corrosionSteps[0].includes("Al₂O₃"), "step 1 is the oxide breaking");
  assert.ok(LADDER.corrosionSteps[1].includes("Al →"), "step 2 is bare metal oxidizing");
  assert.ok(LADDER.corrosionSteps[3].includes("(sol)"), "step 4 is dissolution");
});

test("no NaN/undefined leaks into any string", () => {
  const all = JSON.stringify(LADDER);
  assert.ok(!all.includes("undefined") && !all.includes("NaN"));
});
