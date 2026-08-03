import test from "node:test";
import assert from "node:assert/strict";
import { REACTIONS, REACTION_INFO, hintsFor, makeReactionDealer } from "./reactions.js";
import { componentFormulas, gradeIsomorphic, VALENCE } from "../../js/chem.js";

test("halogens exist in the valence table", () => {
  assert.equal(VALENCE.Cl, 1);
  assert.equal(VALENCE.Br, 1);
});

test("every target is a valid single molecule with sane valences", () => {
  for (const card of REACTIONS) {
    for (const t of card.targets) {
      const formulas = componentFormulas(t.mol.atoms, t.mol.bonds);
      assert.equal(formulas.length, 1, `${card.id}: ${t.name} must be one connected molecule`);
      const deg = (id) => t.mol.bonds.reduce((s, b) => s + (b.a === id || b.b === id ? b.order : 0), 0);
      for (const a of t.mol.atoms) {
        assert.ok(deg(a.id) <= VALENCE[a.el], `${card.id}: ${t.name} atom ${a.el} over valence`);
      }
    }
  }
});

test("addition conserves the carbon count, reactant to product", () => {
  for (const card of REACTIONS) {
    const reactantC = (card.reactant.condensed.match(/C/g) || []).length;
    for (const t of card.targets) {
      const productC = t.mol.atoms.filter((a) => a.el === "C").length;
      assert.equal(productC, reactantC, `${card.id}: skeleton must not change`);
    }
  }
});

test("product chemistry per reaction type", () => {
  for (const card of REACTIONS) {
    for (const t of card.targets) {
      const els = t.mol.atoms.map((a) => a.el);
      const halogens = els.filter((e) => e === "Cl" || e === "Br").length;
      const oxygens = els.filter((e) => e === "O").length;
      if (card.type === "hydrogenation") assert.equal(halogens + oxygens, 0, card.id);
      if (card.type === "halogenation") assert.equal(halogens, 2, card.id);
      if (card.type === "hydrohalogenation") assert.equal(halogens, 1, card.id);
      if (card.type === "hydration") assert.equal(oxygens, 1, card.id);
      // every target passes its own grading (sanity of the accepted set)
      assert.ok(gradeIsomorphic(t.mol.atoms, t.mol.bonds, t.mol, card.elements.concat("O", "Cl", "Br", "N")).ok);
    }
  }
});

test("markovnikov cards accept both regioisomers and label the major", () => {
  const hbr = REACTIONS.find((c) => c.id === "hbr-propene");
  assert.equal(hbr.targets.length, 2);
  assert.ok(hbr.targets[0].major, "first target is the major product");
  assert.equal(hbr.targets[0].name, "2-bromopropane");
  // the two regioisomers are genuinely different structures
  assert.ok(!gradeIsomorphic(hbr.targets[0].mol.atoms, hbr.targets[0].mol.bonds, hbr.targets[1].mol, ["C", "Br"]).ok);
  const h2o = REACTIONS.find((c) => c.id === "h2o-propene");
  assert.equal(h2o.targets[0].name, "propan-2-ol");
});

test("hints: three rungs, reaction-specific middle, product last", () => {
  for (const card of REACTIONS) {
    const hints = hintsFor(card);
    assert.equal(hints.length, 3);
    assert.match(hints[0], /double bond OPENS/);
    assert.equal(hints[1], REACTION_INFO[card.type].hint);
    assert.ok(hints[2].includes(card.targets[0].name));
  }
});

test("dealer: 5 cards, all four reaction types present, no duplicate cards", () => {
  const deal = makeReactionDealer();
  for (let r = 0; r < 12; r++) {
    const cards = deal();
    assert.equal(cards.length, 5);
    assert.equal(new Set(cards.map((c) => c.id)).size, 5, "no repeats");
    const types = new Set(cards.map((c) => c.type));
    assert.equal(types.size, 4, "every reaction type appears each round");
  }
});
