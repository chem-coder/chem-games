import { test } from "node:test";
import assert from "node:assert/strict";
import { litTheories, gradeSpecies, isComplete, requeue, buildRound, asksTheory, recordResult, ROLES, THEORIES } from "./engine.js";
import { REACTIONS } from "../data/reactions.js";

test("Arrhenius lights all three, Brønsted-Lowry two, Lewis one", () => {
  assert.deepEqual(litTheories("arrhenius"), ["arrhenius", "bronsted", "lewis"]);
  assert.deepEqual(litTheories("bronsted"), ["bronsted", "lewis"]);
  assert.deepEqual(litTheories("lewis"), ["lewis"]);
  assert.deepEqual(litTheories(null), []);
});

test("grading: role and theory for reactants, role only for products", () => {
  const hcl = REACTIONS[0].species[0];
  assert.deepEqual(gradeSpecies(hcl, { role: "acid", theory: "arrhenius" }), { role: true, theory: true, ok: true });
  assert.equal(gradeSpecies(hcl, { role: "acid", theory: "lewis" }).ok, false);
  const cl = REACTIONS[0].species[3];
  assert.deepEqual(gradeSpecies(cl, { role: "cb" }), { role: true, theory: null, ok: true });
  assert.equal(isComplete(hcl, { role: "acid" }), false);
  assert.equal(isComplete(hcl, { role: "acid", theory: "lewis" }), true);
  assert.equal(isComplete(cl, { role: "cb" }), true);
});

test("requeue drops a mastered reaction and rotates a missed one", () => {
  assert.deepEqual(requeue(["a", "b", "c"], true), ["b", "c"]);
  assert.deepEqual(requeue(["a", "b", "c"], false), ["b", "c", "a"]);
});

test("buildRound prefers unmastered, least-seen reactions", () => {
  const stats = { "hcl-water": { seen: 3, mastered: true } };
  const ids = buildRound(REACTIONS, stats, REACTIONS.length - 1, () => 0.5);
  assert.ok(!ids.includes("hcl-water"));
  assert.equal(ids.length, REACTIONS.length - 1);
  assert.equal(recordResult({}, "x", true).x.mastered, true);
});

test("data: every species has a legal role; reactants carry a theory, products none; each reaction has one acid and one base", () => {
  for (const r of REACTIONS) {
    let acids = 0, bases = 0;
    for (const s of r.species) {
      assert.ok(ROLES.includes(s.role), `${r.id}: role ${s.role}`);
      if (asksTheory(s)) assert.ok(THEORIES.includes(s.theory), `${r.id}: ${s.f} needs a theory`);
      else assert.equal(s.theory, undefined, `${r.id}: ${s.f} should carry no theory`);
      assert.ok(s.why && s.why.length > 10, `${r.id}: ${s.f} needs a why`);
      if (s.role === "acid") acids += 1;
      if (s.role === "base") bases += 1;
    }
    assert.equal(acids, 1, `${r.id}: one acid`);
    assert.equal(bases, 1, `${r.id}: one base`);
  }
});

test("data: a Lewis-only reaction has no proton transfer, so no conjugates", () => {
  for (const r of REACTIONS) {
    const lewisOnly = r.species.filter(asksTheory).every((s) => s.theory === "lewis");
    if (lewisOnly) assert.ok(r.species.every((s) => s.role !== "ca" && s.role !== "cb"), r.id);
  }
});
