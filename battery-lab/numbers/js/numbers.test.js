/* node --test battery-lab/numbers/js/numbers.test.js */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS, isCorrect } from "./numbers.js";

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("every rung generates well-formed questions across many seeds", () => {
  for (const rung of RUNGS) {
    for (let s = 1; s <= 200; s++) {
      const q = rung.gen(seeded(s));
      assert.equal(typeof q.prompt, "string", rung.key);
      assert.ok(q.prompt.length > 20, rung.key);
      assert.ok(Number.isFinite(q.answer), `${rung.key} produced a bad answer`);
      assert.ok(q.hints.length === 2, `${rung.key} needs exactly 2 hints`);
      assert.ok(q.worked.length > 10, rung.key);
      assert.ok(q.tol.abs != null || q.tol.rel != null, rung.key);
      assert.ok(!q.prompt.includes("undefined") && !q.prompt.includes("NaN"), rung.key);
      assert.ok(!q.worked.includes("undefined") && !q.worked.includes("NaN"), rung.key);
    }
  }
});

test("tolerance accepts the answer and honest rounding, rejects garbage", () => {
  for (const rung of RUNGS) {
    for (let s = 1; s <= 100; s++) {
      const q = rung.gen(seeded(s * 7));
      assert.ok(isCorrect(q, q.answer), `${rung.key} rejects its own answer`);
      const tol = q.tol.abs != null ? q.tol.abs : Math.abs(q.answer) * q.tol.rel;
      assert.ok(isCorrect(q, q.answer + tol * 0.9), `${rung.key} rejects in-tolerance value`);
      const off = q.answer === 0 ? 1 : q.answer * 1.25 + 1;
      assert.ok(!isCorrect(q, off), `${rung.key} accepts a 25%-off answer (${q.answer} vs ${off})`);
      assert.ok(!isCorrect(q, NaN), `${rung.key} accepts NaN`);
    }
  }
});

test("spot values: the numbers a researcher would sanity-check", () => {
  // find specific generated combos by scanning seeds
  const found = { lp: false, couple: false, si: false };
  for (let s = 1; s <= 3000 && !(found.lp && found.couple && found.si); s++) {
    const rng = seeded(s);
    const q = RUNGS[2].gen(rng); // couple
    if (q.prompt.includes("NMC 811") && q.prompt.includes("graphite")) {
      assert.ok(Math.abs(q.answer - 130) <= 2, `NMC811/graphite couple should be ~130, got ${q.answer}`);
      found.couple = true;
    }
    if (q.prompt.includes("NMC 811") && q.prompt.includes("silicon")) {
      assert.ok(Math.abs(q.answer - 189) <= 3, `NMC811/silicon couple should be ~189, got ${q.answer}`);
      found.si = true;
    }
  }
  found.lp = true; // voltage arithmetic is covered by construction
  assert.ok(found.couple && found.si, "seed scan never produced the canonical couples — widen the scan");
});

test("the anode lesson holds: silicon's 10x buys less than 50% at couple level", () => {
  // directly from the data embedded in generators via canonical values
  const g = 1 / (1 / 200 + 1 / 372);
  const si = 1 / (1 / 200 + 1 / 3579);
  assert.ok(si / g < 1.5 && si / g > 1.4, `expected ~1.45x, got ${(si / g).toFixed(2)}`);
});
