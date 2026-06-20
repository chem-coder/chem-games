import { test } from "node:test";
import assert from "node:assert/strict";
import { orientFactor, checkAnswer } from "../../shared/js/conversion-engine.js";
import { PACKS } from "../data/problems.js";

// The orientation that puts the given unit in the denominator is the solving one.
const solvingFlip = (p) => p.factor.a.unit === p.given.unit;

test("every pack has problems and a stable id/label", () => {
  assert.ok(PACKS.length >= 2);
  for (const pk of PACKS) {
    assert.ok(pk.id && pk.label && pk.problems.length > 0, `pack ${pk.id} is well-formed`);
  }
});

for (const pk of PACKS) {
  for (const p of pk.problems) {
    test(`${pk.id}/${p.id}: solves with the intended orientation and matches its answer`, () => {
      const right = checkAnswer(p, [orientFactor(p.factor, solvingFlip(p))]);
      assert.equal(right.solved, true, "intended orientation should cancel and solve");
      assert.equal(right.result.unit, p.answer.unit, "result unit matches the stated answer");
      assert.equal(right.result.value, p.answer.value, "result value matches the stated answer");

      const wrong = checkAnswer(p, [orientFactor(p.factor, !solvingFlip(p))]);
      assert.equal(wrong.solved, false, "the other orientation must not cancel");

      // reaction problems should show a balanced equation
      if (p.kind === "reaction") {
        assert.match(p.equation, /→/, "reaction problems carry a balanced equation");
      }
    });
  }
}
