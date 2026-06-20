import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SLOTS,
  ONE_UNIT,
  factorFor,
  correctGrid,
  checkGrid,
  buildTileBank
} from "./builder.js";
import { ROUNDS } from "../data/problems.js";

test("every round is well-formed: equation, given, species, questions", () => {
  assert.ok(ROUNDS.length >= 3, "at least the three seed reactions");
  for (const r of ROUNDS) {
    assert.ok(r.id && r.name, `round ${r.id} has id + name`);
    assert.match(r.equation, /→/, `round ${r.id} carries a balanced equation`);
    assert.ok(r.given && r.given.unit, `round ${r.id} has a given`);
    assert.ok(r.species.length >= 2, `round ${r.id} lists its coefficient tiles`);
    assert.ok(r.questions.length >= 1, `round ${r.id} has questions`);
    // the given's species must be readable off the equation (it's the factor denominator)
    assert.ok(
      r.species.some((s) => s.unit === r.given.unit),
      `round ${r.id}: given unit ${r.given.unit} appears in species`
    );
  }
});

for (const round of ROUNDS) {
  for (const q of round.questions) {
    test(`${round.id}/${q.id}: intended grid cancels and matches the hand-verified answer`, () => {
      const grid = correctGrid(round, q);

      // the answer key fills every slot
      for (const slot of SLOTS) assert.ok(grid[slot], `slot ${slot} is filled`);

      const out = checkGrid(round, q, grid);
      assert.equal(out.solved, true, "intended grid should solve");
      assert.equal(out.result.unit, q.answer.unit, "lands on the target unit");
      assert.equal(out.result.value, q.answer.value, "value matches the stated answer");
      assert.equal(out.diagnostic, null, "a solved grid carries no diagnostic");

      // the factor column is the target coefficient over the given's coefficient
      const factor = factorFor(round, q);
      assert.equal(factor.num.unit, q.targetUnit, "factor numerator is the target species");
      assert.equal(factor.den.unit, round.given.unit, "factor denominator is the given species");
    });

    test(`${round.id}/${q.id}: the given-over-1 step is required (flipping it stops cancelling)`, () => {
      const grid = correctGrid(round, q);
      // swap the given column: 1 on top, the given underneath — the classic skipped step
      const flipped = { ...grid, givenNum: grid.givenDen, givenDen: grid.givenNum };
      const out = checkGrid(round, q, flipped);
      assert.equal(out.solved, false, "without the given over 1, nothing cancels to the target");
      assert.ok(out.diagnostic, "a wrong grid explains what failed without giving the answer");
      assert.ok(
        !out.diagnostic.includes(String(q.answer.value)),
        "the diagnostic never reveals the numeric answer"
      );
    });

    test(`${round.id}/${q.id}: flipping the ratio column does not reach the answer`, () => {
      const grid = correctGrid(round, q);
      const flipped = { ...grid, factorNum: grid.factorDen, factorDen: grid.factorNum };
      const out = checkGrid(round, q, flipped);
      assert.equal(out.solved, false, "an upside-down ratio must not solve");
    });

    test(`${round.id}/${q.id}: the "relabel the given" trap tile is offered but never solves`, () => {
      const bank = buildTileBank(round, q);
      const trap = bank.find((t) => t.unit === q.targetUnit && t.value === round.given.value);
      // the trap only exists when the given number differs from the target's coefficient
      if (trap) {
        const grid = correctGrid(round, q);
        // drop the trap straight into the result-bearing numerator slot
        const trapped = { ...grid, factorNum: { value: trap.value, unit: trap.unit } };
        const out = checkGrid(round, q, trapped);
        assert.equal(out.solved, false, "relabelling the given must not be accepted");
      }
    });

    test(`${round.id}/${q.id}: tile bank holds the four correct tiles plus distractors, no dupes`, () => {
      const bank = buildTileBank(round, q);
      const grid = correctGrid(round, q);
      for (const slot of SLOTS) {
        assert.ok(
          bank.some((t) => t.value === grid[slot].value && t.unit === grid[slot].unit),
          `bank contains the tile for ${slot} (${grid[slot].value} ${grid[slot].unit})`
        );
      }
      assert.ok(bank.length > SLOTS.length, "bank includes at least one distractor");
      const keys = bank.map((t) => `${t.value}|${t.unit}`);
      assert.equal(new Set(keys).size, keys.length, "no duplicate tiles");
      assert.ok(bank.some((t) => t.unit === ONE_UNIT), "the literal 1 tile is offered");
    });
  }
}

test("an incomplete grid is reported as not-ready, not wrong", () => {
  const round = ROUNDS[0];
  const q = round.questions[0];
  const partial = { ...correctGrid(round, q), factorDen: null };
  const out = checkGrid(round, q, partial);
  assert.equal(out.ready, false);
});
