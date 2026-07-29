import test from "node:test";
import assert from "node:assert/strict";
import {
  VALENCE, bondSum, hydrogenCount, canBond, nextOrder, componentFormulas,
  gradeAlkaneBuild, gradeChainBuild, gradeBranchedBuild, gradeAlcoholBuild,
  canonMolecule, gradeIsomorphic
} from "./chem.js";

const C = (id) => ({ id, el: "C" });

test("a lone carbon is methane: 4 derived hydrogens", () => {
  assert.equal(hydrogenCount(C(1), []), 4);
  assert.deepEqual(componentFormulas([C(1)], []), ["CH4"]);
});

test("single C–C bond: each carbon sheds one H → ethane", () => {
  const atoms = [C(1), C(2)];
  const bonds = [{ a: 1, b: 2, order: 1 }];
  assert.equal(hydrogenCount(atoms[0], bonds), 3);
  assert.deepEqual(componentFormulas(atoms, bonds), ["C2H6"]);
});

test("bond order cycling recounts hydrogens: ethane → ethene → ethyne", () => {
  const atoms = [C(1), C(2)];
  for (const [order, formula] of [[1, "C2H6"], [2, "C2H4"], [3, "C2H2"]]) {
    assert.deepEqual(componentFormulas(atoms, [{ a: 1, b: 2, order }]), [formula]);
  }
});

test("propane chain and separate fragments", () => {
  const atoms = [C(1), C(2), C(3), C(9)];
  const bonds = [{ a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }];
  assert.deepEqual(componentFormulas(atoms, bonds).sort(), ["C3H8", "CH4"]);
  assert.equal(bondSum(2, bonds), 2);
});

test("canBond: needs a spare H on both, no doubled-up bonds, no self-bond", () => {
  const a = C(1), b = C(2), c = C(3), d = C(4), e = C(5), f = C(6);
  assert.ok(canBond(a, b, []));
  assert.ok(!canBond(a, a, []));
  assert.ok(!canBond(a, b, [{ a: 1, b: 2, order: 1 }]));
  // a carbon with four single bonds has no H left to give
  const full = [{ a: 1, b: 2, order: 1 }, { a: 1, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 1, b: 5, order: 1 }];
  assert.equal(hydrogenCount(a, full), 0);
  assert.ok(!canBond(a, f, full));
});

test("nextOrder walks 1→2→3→0 and skips unaffordable steps", () => {
  const atomsById = { 1: C(1), 2: C(2), 3: C(3) };
  const lone = [{ a: 1, b: 2, order: 1 }];
  assert.equal(nextOrder(lone[0], atomsById, lone), 2);
  assert.equal(nextOrder({ a: 1, b: 2, order: 3 }, atomsById, [{ a: 1, b: 2, order: 3 }]), 0);
  // middle carbon already carries a triple to atom 3: raising 1–2 above single won't fit
  const bonds = [{ a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 3 }];
  assert.equal(nextOrder(bonds[0], atomsById, bonds), 0, "2 and 3 both overdraw atom 2 → straight to remove");
});

test("valences match chemistry", () => {
  assert.deepEqual(VALENCE, { C: 4, N: 3, O: 2, H: 1 });
});

// ── grading built structures against a straight-chain alkane target ──
const chain = (n) => ({
  atoms: Array.from({ length: n }, (_, i) => C(i + 1)),
  bonds: Array.from({ length: n - 1 }, (_, i) => ({ a: i + 1, b: i + 2, order: 1 }))
});

test("gradeAlkaneBuild accepts every straight chain, methane through decane", () => {
  for (let n = 1; n <= 10; n++) {
    const { atoms, bonds } = chain(n);
    assert.deepEqual(gradeAlkaneBuild(atoms, bonds, n), { ok: true }, `n=${n}`);
  }
});

test("gradeAlkaneBuild rejects wrong or sloppy structures with the right reason", () => {
  const r = (atoms, bonds, n) => gradeAlkaneBuild(atoms, bonds, n).reason;
  assert.equal(r([], [], 3), "empty");
  assert.equal(r(chain(3).atoms, chain(3).bonds, 4), "carbon-count");
  // right count, but a loose fragment instead of one chain
  assert.equal(r(chain(4).atoms, [{ a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }], 4), "disconnected");
  // an accidental double bond is not an alkane
  assert.equal(r(chain(2).atoms, [{ a: 1, b: 2, order: 2 }], 2), "multiple-bond");
  // cyclobutane: 4 carbons, 4 single bonds
  const ring = chain(4);
  assert.equal(r(ring.atoms, [...ring.bonds, { a: 4, b: 1, order: 1 }], 4), "ring");
  // isobutane: central carbon bonded to three others
  const iso = { atoms: chain(4).atoms, bonds: [1, 3, 4].map((x) => ({ a: 2, b: x, order: 1 })) };
  assert.equal(r(iso.atoms, iso.bonds, 4), "branched");
});

// ── chains with one double/triple bond in a named slot ──
const chainWith = (n, orders) => ({
  atoms: chain(n).atoms,
  bonds: orders.map((o, i) => ({ a: i + 1, b: i + 2, order: o }))
});

test("gradeChainBuild: the special bond must sit in the named slot", () => {
  const target = (n, slot, order) => ({ n, special: { slot, order } });
  // but-2-ene: double bond in the middle
  assert.ok(gradeChainBuild(chain(4).atoms, chainWith(4, [1, 2, 1]).bonds, target(4, 2, 2)).ok);
  // but-1-ene built "backwards" — bond at the far end — is still but-1-ene
  assert.ok(gradeChainBuild(chain(4).atoms, chainWith(4, [2, 1, 1]).bonds, target(4, 1, 2)).ok);
  assert.ok(gradeChainBuild(chain(4).atoms, chainWith(4, [1, 1, 2]).bonds, target(4, 1, 2)).ok);
  // wrong slot: middle bond when but-1-ene was asked
  assert.equal(gradeChainBuild(chain(4).atoms, chainWith(4, [1, 2, 1]).bonds, target(4, 1, 2)).reason, "bond-order-or-position");
  // right slot, wrong order: triple where a double was named
  assert.equal(gradeChainBuild(chain(4).atoms, chainWith(4, [3, 1, 1]).bonds, target(4, 1, 2)).reason, "bond-order-or-position");
  // two double bonds is a diene, not an -ene
  assert.equal(gradeChainBuild(chain(4).atoms, chainWith(4, [2, 2, 1]).bonds, target(4, 1, 2)).reason, "bond-order-or-position");
  // a plain alkane chain fails an -ene target
  assert.equal(gradeChainBuild(chain(4).atoms, chain(4).bonds, target(4, 1, 2)).reason, "bond-order-or-position");
  // ethyne: the two-carbon chain leaves one slot
  assert.ok(gradeChainBuild(chain(2).atoms, chainWith(2, [3]).bonds, target(2, 1, 3)).ok);
});

// ── rung 4: branched skeletons via tree isomorphism ──
const tree = (n, edges) => ({
  atoms: Array.from({ length: n }, (_, i) => C(i + 1)),
  bonds: edges.map(([a, b]) => ({ a, b, order: 1 }))
});

test("gradeBranchedBuild: shape matters, drawing order does not", () => {
  // 2-methylbutane built "forwards": chain 1-2-3-4, methyl 5 on carbon 2
  const fwd = tree(5, [[1, 2], [2, 3], [3, 4], [2, 5]]);
  assert.ok(gradeBranchedBuild(fwd.atoms, fwd.bonds, { m: 4, methyls: [2] }).ok);
  // same molecule built mirrored (methyl on THEIR carbon 3) and in scrambled id order
  const mirrored = tree(5, [[4, 1], [1, 3], [3, 5], [3, 2]]);
  assert.ok(gradeBranchedBuild(mirrored.atoms, mirrored.bonds, { m: 4, methyls: [2] }).ok);
  // straight pentane is the wrong isomer for 2-methylbutane
  const straight = tree(5, [[1, 2], [2, 3], [3, 4], [4, 5]]);
  assert.equal(gradeBranchedBuild(straight.atoms, straight.bonds, { m: 4, methyls: [2] }).reason, "wrong-skeleton");
  // neopentane (2,2-dimethylpropane) vs 2-methylbutane: same C5H12, different tree
  const neo = tree(5, [[1, 2], [2, 3], [2, 4], [2, 5]]);
  assert.equal(gradeBranchedBuild(neo.atoms, neo.bonds, { m: 4, methyls: [2] }).reason, "wrong-skeleton");
  assert.ok(gradeBranchedBuild(neo.atoms, neo.bonds, { m: 3, methyls: [2, 2] }).ok);
  // 2,3-dimethylbutane
  const dm = tree(6, [[1, 2], [2, 3], [3, 4], [2, 5], [3, 6]]);
  assert.ok(gradeBranchedBuild(dm.atoms, dm.bonds, { m: 4, methyls: [2, 3] }).ok);
  assert.equal(gradeBranchedBuild(dm.atoms, dm.bonds, { m: 4, methyls: [2, 2] }).reason, "wrong-skeleton");
});

// ── rung 5: alcohols ──
const withO = (n, edges, oTo) => {
  const atoms = [...Array.from({ length: n }, (_, i) => C(i + 1)), { id: 99, el: "O" }];
  return { atoms, bonds: [...edges.map(([a, b]) => ({ a, b, order: 1 })), { a: oTo, b: 99, order: 1 }] };
};

test("gradeAlcoholBuild: one O on the named carbon, either end counts", () => {
  // propan-1-ol: O on an end carbon
  const p1 = withO(3, [[1, 2], [2, 3]], 1);
  assert.ok(gradeAlcoholBuild(p1.atoms, p1.bonds, { n: 3, oh: 1 }).ok);
  // ...and the same build read from the other end
  const p1b = withO(3, [[1, 2], [2, 3]], 3);
  assert.ok(gradeAlcoholBuild(p1b.atoms, p1b.bonds, { n: 3, oh: 1 }).ok);
  // propan-2-ol: O on the middle carbon
  const p2 = withO(3, [[1, 2], [2, 3]], 2);
  assert.ok(gradeAlcoholBuild(p2.atoms, p2.bonds, { n: 3, oh: 2 }).ok);
  assert.equal(gradeAlcoholBuild(p2.atoms, p2.bonds, { n: 3, oh: 1 }).reason, "oh-position");
  // methanol
  const m = withO(1, [], 1);
  assert.ok(gradeAlcoholBuild(m.atoms, m.bonds, { n: 1, oh: 1 }).ok);
  // dimethyl ether: O spliced INTO the chain is not an alcohol
  const ether = { atoms: [C(1), C(2), { id: 99, el: "O" }], bonds: [{ a: 1, b: 99, order: 1 }, { a: 99, b: 2, order: 1 }] };
  assert.equal(gradeAlcoholBuild(ether.atoms, ether.bonds, { n: 2, oh: 1 }).reason, "ether");
  // C=O is a carbonyl, not a hydroxyl
  const carbonyl = { atoms: [C(1), { id: 99, el: "O" }], bonds: [{ a: 1, b: 99, order: 2 }] };
  assert.equal(gradeAlcoholBuild(carbonyl.atoms, carbonyl.bonds, { n: 1, oh: 1 }).reason, "multiple-bond");
  // no oxygen at all
  assert.equal(gradeAlcoholBuild(chain(3).atoms, chain(3).bonds, { n: 3, oh: 1 }).reason, "oxygen-count");
});

// ── labeled-graph isomorphism for the functional-group rungs ──
test("gradeIsomorphic separates constitutional isomers", () => {
  // ethanol and methoxymethane are both C2H6O — structure must decide
  const ethanol = { atoms: [C(1), C(2), { id: 3, el: "O" }], bonds: [{ a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 1 }] };
  const ether = { atoms: [C(1), C(2), { id: 3, el: "O" }], bonds: [{ a: 1, b: 3, order: 1 }, { a: 3, b: 2, order: 1 }] };
  assert.equal(gradeIsomorphic(ethanol.atoms, ethanol.bonds, ether, ["C", "O"]).reason, "wrong-structure");
  assert.ok(gradeIsomorphic(ether.atoms, ether.bonds, ether, ["C", "O"]).ok);
  // same molecule drawn with scrambled ids still matches
  const etherScrambled = { atoms: [{ id: 7, el: "O" }, C(9), C(4)], bonds: [{ a: 9, b: 7, order: 1 }, { a: 7, b: 4, order: 1 }] };
  assert.ok(gradeIsomorphic(etherScrambled.atoms, etherScrambled.bonds, ether, ["C", "O"]).ok);
  // ethanoic acid and methyl methanoate are both C2H4O2
  const acid = { atoms: [C(1), C(2), { id: 3, el: "O" }, { id: 4, el: "O" }], bonds: [{ a: 1, b: 2, order: 1 }, { a: 1, b: 3, order: 2 }, { a: 1, b: 4, order: 1 }] };
  const ester = { atoms: [C(1), C(2), { id: 3, el: "O" }, { id: 4, el: "O" }], bonds: [{ a: 1, b: 3, order: 2 }, { a: 1, b: 4, order: 1 }, { a: 4, b: 2, order: 1 }] };
  assert.equal(canonMolecule(acid.atoms, acid.bonds) === canonMolecule(ester.atoms, ester.bonds), false);
  assert.equal(gradeIsomorphic(ester.atoms, ester.bonds, acid, ["C", "O"]).reason, "wrong-structure");
  // bond order is part of identity: single C–O is not the carbonyl C=O
  const single = { atoms: [C(1), { id: 2, el: "O" }], bonds: [{ a: 1, b: 2, order: 1 }] };
  const dbl = { atoms: [C(1), { id: 2, el: "O" }], bonds: [{ a: 1, b: 2, order: 2 }] };
  assert.equal(gradeIsomorphic(single.atoms, single.bonds, dbl, ["C", "O"]).reason, "wrong-structure");
  // wrong element and wrong count fail before structure
  const amine = { atoms: [C(1), { id: 2, el: "N" }], bonds: [{ a: 1, b: 2, order: 1 }] };
  assert.equal(gradeIsomorphic(amine.atoms, amine.bonds, dbl, ["C", "O"]).reason, "wrong-element");
  assert.equal(gradeIsomorphic([C(1)], [], dbl, ["C", "O"]).reason, "atom-count");
});

test("componentFormulas counts oxygen (and a lone O reads as water)", () => {
  const p2 = withO(3, [[1, 2], [2, 3]], 2);
  assert.deepEqual(componentFormulas(p2.atoms, p2.bonds), ["C3H8O"]);
  assert.deepEqual(componentFormulas([{ id: 1, el: "O" }], []), ["H2O"]);
});
