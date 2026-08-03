import test from "node:test";
import assert from "node:assert/strict";
import { REACTIONS, REACTION_INFO, hintsFor, makeReactionDealer, MK_CARDS, makeMarkovnikovDealer } from "./reactions.js";
import { componentFormulas, gradeIsomorphic, stripExplicitH, VALENCE } from "../../js/chem.js";

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

test("every card carries a reactant graph with exactly one double bond", () => {
  for (const card of REACTIONS) {
    const m = card.reactant.mol;
    assert.ok(m, card.id);
    assert.equal(componentFormulas(m.atoms, m.bonds).length, 1, card.id);
    assert.equal(m.bonds.filter((b) => b.order === 2).length, 1, `${card.id}: one C=C`);
    const reactantC = (card.reactant.condensed.match(/C/g) || []).length;
    assert.equal(m.atoms.length, reactantC, `${card.id}: reactant carbon count`);
  }
});

test("explicit-H counts match what each reagent delivers, and H is in the tray when needed", () => {
  const want = { hydrogenation: 2, halogenation: 0, hydrohalogenation: 1, hydration: 1 };
  for (const card of REACTIONS) {
    assert.equal(card.explicitH, want[card.type], card.id);
    assert.equal(card.elements.includes("H"), card.explicitH > 0, `${card.id}: tray H iff H is delivered`);
  }
});

test("stripExplicitH folds placed hydrogens back into the implicit count", () => {
  // ethane with both delivered H's placed explicitly = plain ethane after the fold
  const atoms = [{ id: 1, el: "C" }, { id: 2, el: "C" }, { id: 3, el: "H" }, { id: 4, el: "H" }];
  const bonds = [{ a: 1, b: 2, order: 1 }, { a: 1, b: 3, order: 1 }, { a: 2, b: 4, order: 1 }];
  const s = stripExplicitH(atoms, bonds);
  assert.equal(s.atoms.length, 2);
  assert.deepEqual(componentFormulas(s.atoms, s.bonds), ["C2H6"]);
  const ethane = REACTIONS.find((c) => c.id === "h2-ethene").targets[0].mol;
  assert.ok(gradeIsomorphic(s.atoms, s.bonds, ethane, ["C"]).ok);
});

test("markovnikov quiz cards: two distinct options, exactly one major, a why for each", () => {
  assert.ok(MK_CARDS.length >= 5);
  for (const card of MK_CARDS) {
    assert.equal(card.options.length, 2, card.id);
    assert.equal(card.options.filter((o) => o.major).length, 1, `${card.id}: exactly one major`);
    assert.notEqual(card.options[0].name, card.options[1].name, card.id);
    assert.ok(card.why.length > 20, `${card.id}: explanation present`);
    // spot-check the chemistry: the major is never the 1-substituted product
    const major = card.options.find((o) => o.major);
    assert.ok(!/^1-/.test(major.name), `${card.id}: Markovnikov never puts X/OH on C-1 here`);
  }
});

test("markovnikov dealer: 5 cards, no duplicates", () => {
  const deal = makeMarkovnikovDealer();
  for (let r = 0; r < 8; r++) {
    const cards = deal();
    assert.equal(cards.length, 5);
    assert.equal(new Set(cards.map((c) => c.id)).size, 5);
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
