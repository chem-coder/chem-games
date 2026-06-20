import { test } from "node:test";
import assert from "node:assert/strict";
import {
  gcd,
  orientFactor,
  applyStep,
  runChain,
  checkAnswer,
  approxEqual
} from "./conversion-engine.js";

const WHEELS_PER_CAR = { a: { value: 4, unit: "wheel" }, b: { value: 1, unit: "car" } };

test("gcd reduces correctly and never returns 0", () => {
  assert.equal(gcd(12, 8), 4);
  assert.equal(gcd(7, 3), 1);
  assert.equal(gcd(0, 0), 1);
});

test("orientFactor keeps a/b unflipped and swaps to b/a when flipped", () => {
  const straight = orientFactor(WHEELS_PER_CAR, false);
  assert.equal(straight.num.unit, "wheel");
  assert.equal(straight.den.unit, "car");

  const flipped = orientFactor(WHEELS_PER_CAR, true);
  assert.equal(flipped.num.unit, "car");
  assert.equal(flipped.den.unit, "wheel");
});

test("applyStep cancels a matching denominator unit and computes the value", () => {
  const oriented = orientFactor(WHEELS_PER_CAR, true); // 1 car / 4 wheel
  const result = applyStep({ value: 12, unit: "wheel" }, oriented);
  assert.equal(result.ok, true);
  assert.equal(result.cancelled, "wheel");
  assert.equal(result.unit, "car");
  assert.equal(result.value, 3);
});

test("applyStep refuses when the denominator unit does not match", () => {
  const oriented = orientFactor(WHEELS_PER_CAR, false); // 4 wheel / 1 car
  const result = applyStep({ value: 12, unit: "wheel" }, oriented);
  assert.equal(result.ok, false);
  assert.match(result.reason, /cannot cancel/);
});

test("runChain folds a two-step chain and cancels the intermediate unit", () => {
  // 30 eggs -> cartons (12 eggs/carton) -> dollars (3 $/carton)
  const eggsPerCarton = { a: { value: 12, unit: "egg" }, b: { value: 1, unit: "carton" } };
  const dollarsPerCarton = { a: { value: 3, unit: "dollar" }, b: { value: 1, unit: "carton" } };
  const chain = [orientFactor(eggsPerCarton, true), orientFactor(dollarsPerCarton, false)];
  const run = runChain({ value: 24, unit: "egg" }, chain);
  assert.equal(run.ok, true);
  assert.equal(run.result.unit, "dollar");
  assert.equal(run.result.value, 6); // 24/12 = 2 cartons; 2*3 = 6 dollars
});

test("runChain stops at the first non-cancelling step", () => {
  const chain = [orientFactor(WHEELS_PER_CAR, false)]; // wrong orientation
  const run = runChain({ value: 12, unit: "wheel" }, chain);
  assert.equal(run.ok, false);
  assert.equal(run.result.unit, "wheel"); // unchanged
});

const WHEELS_PROBLEM = {
  given: { value: 12, unit: "wheel" },
  targetUnit: "car",
  answer: { value: 3, unit: "car" }
};

test("checkAnswer marks the correctly-oriented chain solved", () => {
  const out = checkAnswer(WHEELS_PROBLEM, [orientFactor(WHEELS_PER_CAR, true)]);
  assert.equal(out.solved, true);
  assert.equal(out.reachedTarget, true);
  assert.equal(out.result.value, 3);
});

test("checkAnswer rejects the wrong orientation (units never reach the target)", () => {
  const out = checkAnswer(WHEELS_PROBLEM, [orientFactor(WHEELS_PER_CAR, false)]);
  assert.equal(out.solved, false);
  assert.equal(out.reachedTarget, false);
});

test("checkAnswer rejects an empty chain", () => {
  const out = checkAnswer(WHEELS_PROBLEM, []);
  assert.equal(out.solved, false);
});

test("approxEqual tolerates float dust", () => {
  assert.equal(approxEqual(0.1 + 0.2, 0.3), true);
  assert.equal(approxEqual(3, 3.5), false);
});
