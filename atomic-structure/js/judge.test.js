import { test } from "node:test";
import assert from "node:assert/strict";
import { judge, targetBuild, deal } from "./judge.js";

const Mg = { z: 12, mass: 24, charge: 0 };

test("target build for Mg-24", () => {
  assert.deepEqual(targetBuild(Mg), { p: 12, n: 12, shells: [2, 8, 2, 0, 0, 0, 0] });
});

test("correct build passes", () => {
  assert.deepEqual(judge({ p: 12, n: 12, shells: [2, 8, 2, 0, 0, 0, 0] }, Mg), { ok: true, problems: [] });
});

test("wrong counts are named with a direction, never the right number", () => {
  const v = judge({ p: 11, n: 14, shells: [2, 8, 2, 0, 0, 0, 0] }, Mg);
  assert.equal(v.ok, false);
  assert.deepEqual(v.problems, [{ part: "protons", dir: "fewer" }, { part: "neutrons", dir: "more" }]);
});

test("right electron total but wrong shell names the first shell that differs", () => {
  const v = judge({ p: 12, n: 12, shells: [3, 8, 1, 0, 0, 0, 0] }, Mg);
  assert.deepEqual(v.problems, [{ part: "shell", shell: 1, dir: "more" }]);
});

test("wrong electron total is reported as a total, not per shell", () => {
  const v = judge({ p: 12, n: 12, shells: [2, 8, 0, 0, 0, 0, 0] }, Mg);
  assert.deepEqual(v.problems, [{ part: "electrons", dir: "fewer" }]);
});

test("ion target removes electrons from the outer shell", () => {
  assert.deepEqual(targetBuild({ z: 12, mass: 24, charge: 2 }).shells, [2, 8, 0, 0, 0, 0, 0]);
});

test("deal gives distinct species", () => {
  const pool = [1, 2, 3, 4, 5, 6];
  const d = deal(pool, 5, () => 0.5);
  assert.equal(d.length, 5);
  assert.equal(new Set(d).size, 5);
});
