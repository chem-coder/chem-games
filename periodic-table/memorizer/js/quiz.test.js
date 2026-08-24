import { test } from "node:test";
import assert from "node:assert/strict";

import { BY_SYMBOL } from "./game.js";
import { normalizeName, isCorrectName, gradeQuiz, buildQuizRound, requeue, QUIZ_SIZE } from "./quiz.js";

test("isCorrectName is case/space-forgiving and accepts US + British spellings", () => {
  assert.equal(isCorrectName(BY_SYMBOL.Fe, "Iron"), true);
  assert.equal(isCorrectName(BY_SYMBOL.Fe, "  iron "), true);
  assert.equal(isCorrectName(BY_SYMBOL.Al, "aluminum"), true);
  assert.equal(isCorrectName(BY_SYMBOL.Al, "aluminium"), true); // British
  assert.equal(isCorrectName(BY_SYMBOL.S, "sulphur"), true);
  assert.equal(isCorrectName(BY_SYMBOL.Cs, "caesium"), true);
  assert.equal(isCorrectName(BY_SYMBOL.Fe, "gold"), false);
});

test("gradeQuiz checks the right field per direction", () => {
  assert.equal(gradeQuiz(BY_SYMBOL.Na, "toName", "sodium"), true);
  assert.equal(gradeQuiz(BY_SYMBOL.Na, "toName", "Na"), false); // wrong field
  assert.equal(gradeQuiz(BY_SYMBOL.Na, "toSymbol", "na"), true);
  assert.equal(gradeQuiz(BY_SYMBOL.Na, "toSymbol", "sodium"), false);
});

test("buildQuizRound samples the requested size from the 118", () => {
  const seq = [0.1, 0.7, 0.3, 0.9, 0.5];
  let i = 0;
  const rng = () => seq[i++ % seq.length];
  assert.equal(buildQuizRound(QUIZ_SIZE, rng).length, 10);
  assert.equal(buildQuizRound(5, rng).length, 5);
  const round = buildQuizRound(QUIZ_SIZE, rng);
  assert.equal(new Set(round).size, round.length, "no repeats within a round");
});

test("requeue drops a correct item and rotates a missed one", () => {
  assert.deepEqual(requeue([1, 2, 3], true), [2, 3]);
  assert.deepEqual(requeue([1, 2, 3], false), [2, 3, 1]);
  assert.deepEqual(requeue([], true), []);
});

test("normalizeName collapses whitespace and case", () => {
  assert.equal(normalizeName("  Sodium  "), "sodium");
});
