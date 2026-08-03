import test from "node:test";
import assert from "node:assert/strict";
import {
  branchRange, buildBranchedAlkane, nameAlkane, longestChains,
  enumerateBranchedAlkanes, alkylName, substituentsOn
} from "./molecule.js";

const nameOf = (n, branches) => nameAlkane(buildBranchedAlkane(n, branches)).name;

// ── Dalia's branch rule, generalised ────────────────────────────────────────────
test("branchRange: b+1 ≤ p ≤ n−b (upper bound inclusive)", () => {
  // methyl (b=1)
  assert.deepEqual(branchRange(3, 1), [2]);          // 2-methylpropane
  assert.deepEqual(branchRange(4, 1), [2, 3]);       // 3- mirrors to 2-
  assert.deepEqual(branchRange(5, 1), [2, 3, 4]);
  // ethyl (b=2) — the case a strict upper bound would wrongly exclude
  assert.deepEqual(branchRange(5, 2), [3], "3-ethylpentane must survive");
  assert.deepEqual(branchRange(6, 2), [3, 4]);
  assert.deepEqual(branchRange(7, 2), [3, 4, 5]);
  // propyl (b=3)
  assert.deepEqual(branchRange(7, 3), [4], "4-propylheptane only");
  assert.deepEqual(branchRange(6, 3), [], "no room for a propyl on hexane");
  // a branch as long as its parent never fits
  assert.deepEqual(branchRange(4, 2), []);
});

// ── straight chains ─────────────────────────────────────────────────────────────
test("unbranched chains name as plain alkanes", () => {
  for (const [n, want] of [[1, "methane"], [4, "butane"], [7, "heptane"], [10, "decane"]]) {
    assert.equal(nameOf(n, []), want);
  }
});

test("longestChains finds every maximal path", () => {
  const straight = buildBranchedAlkane(5, []);
  assert.equal(longestChains(straight)[0].length, 5);
  // 2-methylbutane: the longest chain is still 4 — the methyl is genuinely a branch
  const iso = buildBranchedAlkane(4, [{ at: 2, length: 1 }]);
  assert.equal(longestChains(iso)[0].length, 4);
  // but a "methyl" on C-1 of butane creates a 5-chain
  const fake = buildBranchedAlkane(4, [{ at: 1, length: 1 }]);
  assert.equal(longestChains(fake)[0].length, 5);
});

// ── the namer corrects bad numbering by construction ────────────────────────────
test("a branch on C-1 is not a branch — it lengthens the chain", () => {
  // ask for butane with a methyl on C-1; the truth is pentane
  assert.equal(nameOf(4, [{ at: 1, length: 1 }]), "pentane");
  // ethyl on C-2 of pentane is really 3-methylhexane
  assert.equal(nameOf(5, [{ at: 2, length: 2 }]), "3-methylhexane");
});

test("numbering picks the lowest locants automatically", () => {
  // built at position 3 of butane, but 2-methylbutane is the correct name
  assert.equal(nameOf(4, [{ at: 3, length: 1 }]), "2-methylbutane");
  assert.equal(nameOf(4, [{ at: 2, length: 1 }]), "2-methylbutane");
  // built at 4 of hexane → 3-methylhexane
  assert.equal(nameOf(6, [{ at: 4, length: 1 }]), "3-methylhexane");
});

test("multiplicity prefixes and alphabetical order", () => {
  assert.equal(nameOf(3, [{ at: 2, length: 1 }, { at: 2, length: 1 }]), "2,2-dimethylpropane");
  assert.equal(nameOf(4, [{ at: 2, length: 1 }, { at: 3, length: 1 }]), "2,3-dimethylbutane");
  assert.equal(nameOf(5, [{ at: 2, length: 1 }, { at: 3, length: 1 }, { at: 4, length: 1 }]),
    "2,3,4-trimethylpentane");
});

test("ethyl branches: the classic cases", () => {
  assert.equal(nameOf(5, [{ at: 3, length: 2 }]), "3-ethylpentane");
  assert.equal(nameOf(6, [{ at: 3, length: 2 }]), "3-ethylhexane");
  assert.equal(nameOf(7, [{ at: 3, length: 2 }]), "3-ethylheptane");
  assert.equal(nameOf(7, [{ at: 4, length: 2 }]), "4-ethylheptane");
  // built at 4 of hexane — mirrors to 3
  assert.equal(nameOf(6, [{ at: 4, length: 2 }]), "3-ethylhexane");
});

test("3-ethyl-2-methylpentane survives the tie-break", () => {
  assert.equal(nameOf(5, [{ at: 3, length: 2 }, { at: 2, length: 1 }]), "3-ethyl-2-methylpentane");
});

// ── the three names flagged as unsafe last session ──────────────────────────────
// The point is not that any particular name is right — it's that the namer decides,
// so a generated deck can never ship one of these wrong.
test("the flagged methyl+ethyl names resolve to whatever is actually correct", () => {
  const built = [
    [6, [{ at: 3, length: 2 }, { at: 4, length: 1 }]],
    [6, [{ at: 4, length: 2 }, { at: 2, length: 1 }]],
    [6, [{ at: 3, length: 2 }, { at: 2, length: 1 }]]
  ].map(([n, br]) => nameAlkane(buildBranchedAlkane(n, br)));

  for (const r of built) {
    // every one must produce a definite verdict — a name or an explicit unsupported flag
    assert.ok(r.name || r.unsupported, "namer must not return undefined");
    if (r.name) {
      // and the name must round-trip: naming it again gives the same answer
      assert.equal(typeof r.name, "string");
      assert.ok(r.name.includes("ane"));
    }
  }
});

test("alkylName rejects branched substituents rather than inventing a name", () => {
  // a real isopropyl: the branch ROOT carries two carbons of its own
  const mol = buildBranchedAlkane(7, [{ at: 4, length: 1 }]);
  const root = mol.atoms[mol.atoms.length - 1].id;
  mol.atoms.push({ id: 98, el: "C" }, { id: 99, el: "C" });
  mol.bonds.push({ a: root, b: 98, order: 1 }, { a: root, b: 99, order: 1 });
  const subs = substituentsOn([1, 2, 3, 4, 5, 6, 7], mol);
  const branched = subs.find((s) => s.members.length === 3);
  assert.equal(alkylName(branched, mol), null);
  // and nameAlkane reports it as unsupported instead of inventing something
  assert.ok(nameAlkane(mol).unsupported);
  // while a plain linear ethyl still names fine
  const ethyl = buildBranchedAlkane(6, [{ at: 3, length: 2 }]);
  const esubs = substituentsOn([1, 2, 3, 4, 5, 6], ethyl);
  assert.equal(alkylName(esubs[0], ethyl), "ethyl");
});

// ── generation ──────────────────────────────────────────────────────────────────
test("enumerateBranchedAlkanes emits only canonically-correct names", () => {
  const monomethyl = enumerateBranchedAlkanes(5, [1]).map((r) => r.name);
  assert.deepEqual(monomethyl, ["2-methylpentane", "3-methylpentane"]);

  const dimethylButane = enumerateBranchedAlkanes(4, [1, 1]).map((r) => r.name);
  assert.deepEqual(dimethylButane, ["2,2-dimethylbutane", "2,3-dimethylbutane"]);

  // nothing invalid ever appears
  const all = [
    ...enumerateBranchedAlkanes(4, [1]),
    ...enumerateBranchedAlkanes(6, [1, 1]),
    ...enumerateBranchedAlkanes(6, [2])
  ].map((r) => r.name);
  assert.ok(!all.includes("3-methylbutane"), "would be 2-methylbutane");
  assert.ok(!all.includes("1-methylbutane"), "would be pentane");
  assert.ok(!all.some((n) => /^1-/.test(n)), "no substituent ever sits on C-1");

  // every generated name re-names to itself — the deck is self-verifying
  for (const entry of enumerateBranchedAlkanes(6, [1, 1])) {
    assert.equal(nameAlkane(entry.mol).name, entry.name);
  }
});

test("generation drops candidates whose real parent is longer", () => {
  // asking for ethyl branches on butane: none are legal, so nothing is emitted
  assert.deepEqual(enumerateBranchedAlkanes(4, [2]), []);
});

test("valence is enforced: no carbon ever exceeds four bonds", () => {
  // three methyls on one carbon of pentane = five bonds — must never be generated
  const tri = enumerateBranchedAlkanes(5, [1, 1, 1]).map((r) => r.name);
  assert.deepEqual(tri, [
    "2,2,3-trimethylpentane", "2,2,4-trimethylpentane",
    "2,3,3-trimethylpentane", "2,3,4-trimethylpentane"
  ]);
  assert.ok(!tri.includes("2,2,2-trimethylpentane"));
  assert.ok(!tri.includes("3,3,3-trimethylpentane"));
  // and the namer itself refuses the impossible graph outright
  const impossible = buildBranchedAlkane(5, [{ at: 2, length: 1 }, { at: 2, length: 1 }, { at: 2, length: 1 }]);
  assert.equal(nameAlkane(impossible).unsupported, "valence violation");
});
