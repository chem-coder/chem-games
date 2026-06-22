import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DECKS } from "../acid-base-sorter/data/decks.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const db = JSON.parse(readFileSync(join(root, "shared/data/acids-bases.json"), "utf8"));

const pkOf = (k) => (k === "strong" || k == null ? null : Number((-Math.log10(k)).toFixed(2)));

test("db has both groups with non-zero counts and a source note", () => {
  assert.ok(db.acids.length > 0 && db.bases.length > 0);
  assert.equal(db._meta.counts.acids, db.acids.length);
  assert.equal(db._meta.counts.bases, db.bases.length);
  assert.ok(db._meta.sources.length, "sources are cited");
});

test("acids: well-formed; Ka length matches proton count; pKa is the exact -log10", () => {
  const ids = new Set();
  for (const a of db.acids) {
    assert.ok(a.id && a.name, `${a.formula} has id + name`);
    assert.ok(!/[₀-₉]/.test(a.formulaPlain), `${a.formula} formulaPlain is ASCII`);
    assert.ok(["strong", "weak"].includes(a.strength));
    assert.ok(["binary", "oxyacid"].includes(a.type));
    assert.equal(a.Ka.length, a.protons, `${a.formula}: a Ka step per ionizable proton`);
    assert.equal(a.pKa.length, a.Ka.length);
    a.Ka.forEach((k, i) => assert.equal(a.pKa[i], pkOf(k), `${a.formula} pKa[${i}]`));
    assert.equal(a.strength === "strong", a.Ka[0] === "strong", `${a.formula} strength↔Ka1`);
    assert.equal(a.proticity, a.protons > 1 ? "polyprotic" : "monoprotic");
    assert.ok(!ids.has(a.id), `id ${a.id} is unique`);
    ids.add(a.id);
  }
});

test("bases: well-formed; pKb is the exact -log10; hydroxide vs molecular consistent", () => {
  const ids = new Set();
  for (const b of db.bases) {
    assert.ok(b.id && b.name, `${b.formula} has id + name`);
    assert.ok(!/[₀-₉]/.test(b.formulaPlain), `${b.formula} formulaPlain is ASCII`);
    assert.ok(["strong", "weak"].includes(b.strength));
    assert.ok(["hydroxide", "molecular"].includes(b.form));
    assert.equal(b.pKb.length, b.Kb.length);
    b.Kb.forEach((k, i) => assert.equal(b.pKb[i], pkOf(k), `${b.formula} pKb[${i}]`));
    assert.equal(b.strength === "strong", b.Kb[0] === "strong", `${b.formula} strength↔Kb1`);
    assert.equal(b.acidity, b.protonsAccepted > 1 ? "polyacidic" : "monoacidic");
    if (b.form === "molecular") assert.equal(b.hydroxides, null, `${b.formula} molecular → no OH count`);
    assert.ok(!ids.has(b.id), `id ${b.id} is unique`);
    ids.add(b.id);
  }
});

// The safety net: the shared DB must cover every species the Sorter ships, with matching
// strength — so the deck and the reference table can never silently drift apart.
test("db covers every Acid/Base Sorter species with matching strength", () => {
  const byFormula = (group) => new Map(group.map((x) => [x.formula, x]));
  const dbAcids = byFormula(db.acids);
  const dbBases = byFormula(db.bases);
  for (const deck of DECKS.filter((d) => d.id === "acids" || d.id === "bases")) {
    const table = deck.id === "acids" ? dbAcids : dbBases;
    for (const c of deck.cards) {
      const entry = table.get(c.formula);
      assert.ok(entry, `${deck.id}: "${c.formula}" is present in the shared db`);
      assert.equal(entry.strength, c.answers.strength, `${c.formula} strength matches the deck`);
    }
  }
});
