// Molecule model + IUPAC namer. Pure logic, no DOM. ESM for `node --test`.
//
// Why this exists (2026-08-03): every deck used to be a hand-written list of specs with
// hand-written names. That works for one concept per rung and breaks the moment concepts
// combine — a branch + an alcohol + a double bond has validity rules that depend on all
// three at once, and hand-verifying hundreds of names is where wrong chemistry ships.
//
// So instead: GENERATE structures and let this file name them. An illegal name is never
// produced, because the namer picks the correct parent chain itself. Dalia's branch rule
// (for a branch of length b on a parent of length n, valid attachment is b+1 ≤ p ≤ n−b)
// is not coded as a filter here — it FALLS OUT of longest-chain selection. `branchRange`
// below states it explicitly anyway, because it's the teaching rule students are given.
//
// Molecules are plain graphs, the same shape chem.js already grades:
//   { atoms: [{id, el}], bonds: [{a, b, order}] }
// Hydrogens stay implicit everywhere (derived from valence), exactly as on the lab canvas.

import { ROOTS, ALKANE_BY_N } from "./organic.js";

// ── graph helpers ───────────────────────────────────────────────────────────────
export function neighborsMap(mol) {
  const nb = new Map(mol.atoms.map((a) => [a.id, []]));
  for (const b of mol.bonds) {
    nb.get(b.a).push(b.b);
    nb.get(b.b).push(b.a);
  }
  return nb;
}

export function degree(id, mol) {
  return mol.bonds.reduce((s, b) => s + (b.a === id || b.b === id ? 1 : 0), 0);
}

// Unique path between two atoms in a tree (null if disconnected).
export function pathBetween(from, to, nb) {
  const prev = new Map([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) break;
    for (const next of nb.get(cur)) {
      if (!prev.has(next)) { prev.set(next, cur); queue.push(next); }
    }
  }
  if (!prev.has(to)) return null;
  const path = [];
  for (let cur = to; cur !== null; cur = prev.get(cur)) path.push(cur);
  return path.reverse();
}

// Every maximal-length carbon path. In a tree the longest chain is always leaf-to-leaf,
// so enumerating leaf pairs is complete (and molecules here are small).
export function longestChains(mol) {
  const carbons = mol.atoms.filter((a) => a.el === "C").map((a) => a.id);
  const carbonSet = new Set(carbons);
  const nb = neighborsMap(mol);
  const cnb = new Map(carbons.map((id) => [id, nb.get(id).filter((x) => carbonSet.has(x))]));
  const leaves = carbons.filter((id) => cnb.get(id).length <= 1);
  if (carbons.length === 1) return [[carbons[0]]];

  let best = 0;
  const found = [];
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const path = pathBetween(leaves[i], leaves[j], cnb);
      if (!path) continue;
      if (path.length > best) { best = path.length; found.length = 0; }
      if (path.length === best) found.push(path);
    }
  }
  return found;
}

// The branches hanging off a chosen chain: their attachment index (1-based along the
// chain as given) and the set of carbons in each branch.
export function substituentsOn(chain, mol) {
  const inChain = new Set(chain);
  const nb = neighborsMap(mol);
  const carbonSet = new Set(mol.atoms.filter((a) => a.el === "C").map((a) => a.id));
  const out = [];
  chain.forEach((id, i) => {
    for (const next of nb.get(id)) {
      if (inChain.has(next) || !carbonSet.has(next)) continue;
      // collect the whole branch subtree, never stepping back onto the chain
      const members = [];
      const stack = [next];
      const seen = new Set([next, id]);
      while (stack.length) {
        const cur = stack.pop();
        members.push(cur);
        for (const n2 of nb.get(cur)) {
          if (!seen.has(n2) && !inChain.has(n2) && carbonSet.has(n2)) { seen.add(n2); stack.push(n2); }
        }
      }
      out.push({ position: i + 1, root: next, members });
    }
  });
  return out;
}

// ── substituent names ───────────────────────────────────────────────────────────
const ALKYL = ["", "methyl", "ethyl", "propyl", "butyl", "pentyl", "hexyl", "heptyl", "octyl"];
const MULTIPLIER = ["", "", "di", "tri", "tetra", "penta", "hexa"];

// Linear branches only for now. A branched branch (isopropyl, tert-butyl…) returns null
// and the caller reports the molecule as unsupported rather than inventing a name.
export function alkylName(branch, mol) {
  const members = new Set(branch.members);
  const nb = neighborsMap(mol);
  // walk from the attachment root; every step must have exactly one unvisited member
  let cur = branch.root;
  const seen = new Set([cur]);
  let length = 1;
  for (;;) {
    const next = nb.get(cur).filter((x) => members.has(x) && !seen.has(x));
    if (next.length === 0) break;
    if (next.length > 1) return null;   // branched substituent — unsupported
    cur = next[0];
    seen.add(cur);
    length += 1;
  }
  if (length !== branch.members.length) return null;
  return ALKYL[length] || null;
}

// ── the branch rule, stated explicitly ──────────────────────────────────────────
// For a branch of length b on a parent chain of length n, the attachment position p must
// satisfy b + 1 ≤ p ≤ n − b. Walking out along the branch from the near end reaches
// p + b carbons, which must not beat n; the mirror condition gives the lower bound.
// NOTE the upper bound is ≤, not <: 3-ethylpentane (b=2, n=5) needs p = 3 = n − b exactly.
// The namer does not consult this — it's here because it's the rule students are taught,
// and because deck generators use it to enumerate candidates cheaply before naming.
export function branchRange(n, b) {
  const lo = b + 1;
  const hi = n - b;
  return lo > hi ? [] : Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}

// ── naming ──────────────────────────────────────────────────────────────────────
// Score a numbering direction: the sorted locant list of its substituents.
function locantsFor(chain, mol) {
  return substituentsOn(chain, mol).map((s) => s.position).sort((x, y) => x - y);
}

function compareLocants(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

/**
 * Canonical IUPAC name for a branched alkane (acyclic, all single bonds, carbons only).
 * Returns { name, parent, substituents } or { unsupported: reason }.
 *
 * Chain selection follows the teaching order: longest → most substituents → lowest
 * locant set. Numbering then takes the direction with the lowest locant set, breaking
 * ties by giving the alphabetically-first substituent the lower number.
 */
export function nameAlkane(mol) {
  if (mol.atoms.some((a) => a.el !== "C")) return { unsupported: "non-carbon atom" };
  if (mol.bonds.some((b) => b.order !== 1)) return { unsupported: "multiple bond" };
  if (mol.bonds.length !== mol.atoms.length - 1) return { unsupported: "ring or fragment" };
  // the namer is the oracle — it must never bless an impossible molecule
  if (mol.atoms.some((a) => degree(a.id, mol) > 4)) return { unsupported: "valence violation" };

  const chains = longestChains(mol);
  if (chains.length === 0) return { unsupported: "no chain" };

  // consider each candidate chain in both directions
  const candidates = [];
  for (const chain of chains) {
    for (const dir of [chain, [...chain].reverse()]) {
      candidates.push({ chain: dir, subs: substituentsOn(dir, mol), locants: locantsFor(dir, mol) });
    }
  }

  const maxSubs = Math.max(...candidates.map((c) => c.subs.length));
  let pool = candidates.filter((c) => c.subs.length === maxSubs);
  pool.sort((a, b) => compareLocants(a.locants, b.locants));
  const bestLocants = pool[0].locants;
  pool = pool.filter((c) => compareLocants(c.locants, bestLocants) === 0);

  // name the substituents; alphabetical tie-break needs the names, so resolve them now
  const named = [];
  for (const cand of pool) {
    const parts = [];
    let ok = true;
    for (const s of cand.subs) {
      const nm = alkylName(s, mol);
      if (!nm) { ok = false; break; }
      parts.push({ position: s.position, name: nm });
    }
    if (ok) named.push({ ...cand, parts });
  }
  if (named.length === 0) return { unsupported: "branched substituent" };

  // tie-break: alphabetically-first substituent gets the lowest locant
  named.sort((a, b) => {
    const key = (c) => c.parts.slice().sort((x, y) =>
      x.name.localeCompare(y.name) || x.position - y.position
    ).map((p) => `${p.name}${p.position}`).join(",");
    return key(a).localeCompare(key(b));
  });
  const winner = named[0];

  const parent = ALKANE_BY_N[winner.chain.length];
  if (!parent) return { unsupported: `chain of ${winner.chain.length} carbons` };
  if (winner.parts.length === 0) return { name: parent.name, parent: parent.name, substituents: [] };

  // group identical substituent names, then order groups alphabetically by base name
  const groups = new Map();
  for (const p of winner.parts) {
    if (!groups.has(p.name)) groups.set(p.name, []);
    groups.get(p.name).push(p.position);
  }
  const chunks = [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([nm, positions]) => {
      const sorted = positions.sort((x, y) => x - y);
      return `${sorted.join(",")}-${MULTIPLIER[sorted.length]}${nm}`;
    });

  return {
    name: `${chunks.join("-")}${parent.name}`,
    parent: parent.name,
    substituents: winner.parts
  };
}

// ── structure building ──────────────────────────────────────────────────────────
/** Build a branched alkane: a parent chain of n carbons with branches [{at, length}]. */
export function buildBranchedAlkane(n, branches = []) {
  const atoms = [];
  const bonds = [];
  let id = 0;
  const chain = [];
  for (let i = 0; i < n; i++) {
    atoms.push({ id: ++id, el: "C" });
    chain.push(id);
    if (i > 0) bonds.push({ a: chain[i - 1], b: chain[i], order: 1 });
  }
  for (const br of branches) {
    let anchor = chain[br.at - 1];
    for (let k = 0; k < br.length; k++) {
      atoms.push({ id: ++id, el: "C" });
      bonds.push({ a: anchor, b: id, order: 1 });
      anchor = id;
    }
  }
  return { atoms, bonds };
}

/**
 * Enumerate every distinct branched alkane with the given parent length and branch sizes,
 * named canonically. Candidates whose canonical name disagrees with the requested parent
 * (i.e. a longer chain existed) are dropped automatically — validity is emergent, not
 * filtered by hand. Returns [{ name, spec, mol }] deduped by name.
 */
export function enumerateBranchedAlkanes(parentLength, branchSizes) {
  const results = new Map();
  const positionsFor = (b) => branchRange(parentLength, b);

  const recurse = (remaining, chosen) => {
    if (remaining.length === 0) {
      if (chosen.length === 0) return;
      const mol = buildBranchedAlkane(parentLength, chosen);
      const named = nameAlkane(mol);
      if (named.unsupported) return;   // includes valence violations — carbon holds 4
      // keep only molecules whose canonical parent matches what we asked for — otherwise
      // the "branch" was really part of a longer chain and the molecule belongs elsewhere
      if (named.parent !== ALKANE_BY_N[parentLength].name) return;
      if (!results.has(named.name)) {
        results.set(named.name, { name: named.name, spec: { n: parentLength, branches: chosen }, mol });
      }
      return;
    }
    const [size, ...rest] = remaining;
    for (const at of positionsFor(size)) {
      recurse(rest, [...chosen, { at, length: size }]);
    }
  };

  recurse(branchSizes, []);
  return [...results.values()].sort((a, b) => a.name.localeCompare(b.name));
}
