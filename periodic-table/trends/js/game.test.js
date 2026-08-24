import { test } from "node:test";
import assert from "node:assert/strict";
import { TIERS, expectedKeys, endLabels, grade, shuffledTray, speciesByKey } from "./game.js";

test("every tier has an id, label, intro, and rounds", () => {
  assert.ok(TIERS.length >= 4);
  for (const tier of TIERS) {
    assert.ok(tier.id && tier.label && tier.introTitle, tier.id);
    assert.ok(Array.isArray(tier.introSteps) && tier.introSteps.length >= 2, tier.id);
    assert.ok(tier.rounds.length >= 3, tier.id);
  }
});

test("rounds are well-formed: 4+ unique species, direction, hints, why, chips", () => {
  const roundIds = new Set();
  for (const tier of TIERS) {
    for (const r of tier.rounds) {
      assert.ok(!roundIds.has(r.id), `duplicate round id ${r.id}`);
      roundIds.add(r.id);
      assert.ok(r.species.length >= 4, r.id);
      assert.ok(["inc", "dec"].includes(r.direction), r.id);
      assert.ok(r.hints.length >= 2, r.id);
      assert.ok(r.why && r.property, r.id);
      const keys = r.species.map((s) => s.key);
      assert.equal(new Set(keys).size, keys.length, `${r.id} keys unique`);
      for (const s of r.species) assert.ok(s.label && s.chip, `${r.id}/${s.key}`);
    }
  }
});

test("both directions appear across the deck (the OU rotation signature)", () => {
  const dirs = new Set(TIERS.flatMap((t) => t.rounds.map((r) => r.direction)));
  assert.deepEqual([...dirs].sort(), ["dec", "inc"]);
});

test("expectedKeys: inc is data order, dec is its reverse", () => {
  for (const tier of TIERS) {
    for (const r of tier.rounds) {
      const asc = r.species.map((s) => s.key);
      const want = expectedKeys(r);
      if (r.direction === "inc") assert.deepEqual(want, asc, r.id);
      else assert.deepEqual(want, [...asc].reverse(), r.id);
    }
  }
});

test("endLabels flip with direction and name the property", () => {
  const inc = TIERS[0].rounds.find((r) => r.direction === "inc");
  const li = endLabels(inc);
  assert.ok(li.left.startsWith("smallest") && li.right.startsWith("largest"));
  assert.ok(li.left.includes(inc.property));
  const dec = TIERS[0].rounds.find((r) => r.direction === "dec");
  const ld = endLabels(dec);
  assert.ok(ld.left.startsWith("largest") && ld.right.startsWith("smallest"));
});

test("grade: perfect order is correct, per-slot marks a single swap", () => {
  for (const tier of TIERS) {
    for (const r of tier.rounds) {
      const want = expectedKeys(r);
      assert.equal(grade(r, want).correct, true, r.id);
      const swapped = [...want];
      [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
      const g = grade(r, swapped);
      assert.equal(g.correct, false, r.id);
      assert.equal(g.perSlot[0], false, r.id);
      assert.equal(g.perSlot[1], false, r.id);
      assert.ok(g.perSlot.slice(2).every(Boolean), r.id);
    }
  }
});

test("shuffledTray deals a permutation that is never the answer nor its reverse", () => {
  for (const tier of TIERS) {
    for (const r of tier.rounds) {
      for (let n = 0; n < 25; n += 1) {
        const tray = shuffledTray(r);
        assert.deepEqual([...tray].sort(), r.species.map((s) => s.key).sort(), r.id);
        assert.notDeepEqual(tray, expectedKeys(r), r.id);
        assert.notDeepEqual(tray, [...expectedKeys(r)].reverse(), r.id);
      }
    }
  }
});

test("speciesByKey finds every species and misses gracefully", () => {
  const r = TIERS[0].rounds[0];
  for (const s of r.species) assert.equal(speciesByKey(r, s.key), s);
  assert.equal(speciesByKey(r, "Xx"), null);
});

test("the dip round teaches the exception: N above O in ionization energy", () => {
  const dip = TIERS.find((t) => t.id === "exam").rounds.find((r) => r.id === "x-dip");
  const order = dip.species.map((s) => s.key);
  assert.ok(order.indexOf("O") < order.indexOf("N"), "O must rank below N");
  assert.ok(dip.hints.length >= 3, "the dip earns an extra hint");
});

test("isoelectronic rounds keep the proton count in every chip", () => {
  const iso = TIERS.find((t) => t.id === "iso");
  for (const r of iso.rounds) {
    for (const s of r.species) assert.match(s.chip, /p⁺/, `${r.id}/${s.key}`);
  }
});
