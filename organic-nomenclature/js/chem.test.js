import test from "node:test";
import assert from "node:assert/strict";
import { VALENCE, bondSum, hydrogenCount, canBond, nextOrder, componentFormulas, gradeAlkaneBuild, gradeChainBuild } from "./chem.js";

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
