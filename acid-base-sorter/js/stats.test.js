import { test } from "node:test";
import assert from "node:assert/strict";
import { recordResult, masteredCount, masteredIds, seenCount } from "./stats.js";

test("recordResult counts every appearance via seen (drives coverage rotation)", () => {
  let s = recordResult({}, "acids", "hf", false);
  assert.equal(seenCount(s, "acids", "hf"), 1);
  s = recordResult(s, "acids", "hf", true);
  assert.equal(seenCount(s, "acids", "hf"), 2);
  assert.equal(seenCount(s, "acids", "never"), 0);
});

test("recordResult marks a card mastered on a correct check and leaves misses alone", () => {
  let s = {};
  s = recordResult(s, "acids", "hcl", true);
  assert.equal(s.acids.hcl.mastered, true);
  assert.equal(s.acids.hcl.missed, 0);
});

test("recordResult counts a miss without marking mastered", () => {
  let s = recordResult({}, "acids", "hf", false);
  assert.equal(s.acids.hf.mastered, false);
  assert.equal(s.acids.hf.missed, 1);
  s = recordResult(s, "acids", "hf", false);
  assert.equal(s.acids.hf.missed, 2);
});

test("mastered is sticky — a later miss does not un-master a card", () => {
  let s = recordResult({}, "acids", "hcl", true);
  s = recordResult(s, "acids", "hcl", false);
  assert.equal(s.acids.hcl.mastered, true, "stays mastered");
  assert.equal(s.acids.hcl.missed, 1, "but the later miss is still tallied");
});

test("recordResult is immutable — it returns new state, never mutates the input", () => {
  const s0 = {};
  const s1 = recordResult(s0, "bases", "naoh", true);
  assert.deepEqual(s0, {}, "input untouched");
  assert.notEqual(s0, s1);
});

test("decks are tracked independently", () => {
  let s = recordResult({}, "acids", "hcl", true);
  s = recordResult(s, "bases", "naoh", true);
  assert.equal(masteredCount(s, "acids"), 1);
  assert.equal(masteredCount(s, "bases"), 1);
});

test("masteredCount / masteredIds reflect only mastered cards", () => {
  let s = recordResult({}, "acids", "hcl", true);
  s = recordResult(s, "acids", "hf", false); // missed, not mastered
  assert.equal(masteredCount(s, "acids"), 1);
  assert.deepEqual(masteredIds(s, "acids"), ["hcl"]);
  assert.equal(masteredCount(s, "missing-deck"), 0);
});
