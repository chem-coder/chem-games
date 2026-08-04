// Molecule Builder prototype — pure chemistry logic. No DOM, no canvas. ESM for `node --test`.
//
// The whole hydrogen mechanic reduces to one invariant: hydrogens are never stored,
// they are DERIVED. An atom's H count = valence − (sum of its bond orders). The canvas
// layer just animates the difference when that number changes (falling H's on bond
// formation, instant re-balance on bond-order cycling — Dalia's spec, 2026-07-29).

export const VALENCE = { C: 4, N: 3, O: 2, H: 1, Cl: 1, Br: 1 };

export function bondSum(atomId, bonds) {
  return bonds.reduce((s, b) => s + ((b.a === atomId || b.b === atomId) ? b.order : 0), 0);
}

export function hydrogenCount(atom, bonds) {
  return VALENCE[atom.el] - bondSum(atom.id, bonds);
}

// A new bond is always single: both atoms must have a hydrogen to give up.
export function canBond(a, b, bonds) {
  if (a.id === b.id) return false;
  if (bonds.some((x) => (x.a === a.id && x.b === b.id) || (x.a === b.id && x.b === a.id))) return false;
  return hydrogenCount(a, bonds) >= 1 && hydrogenCount(b, bonds) >= 1;
}

// What a pair of elements can share at most (Dalia's rule): C and N can go to
// triple, O tops out at double (C=O, O=O), and H or a halogen only ever single.
// The pair's cap is the weaker partner's cap.
export function maxOrder(elA, elB) {
  const cap = (el) => (el === "C" || el === "N" ? 3 : el === "O" ? 2 : 1);
  return Math.min(cap(elA), cap(elB));
}

// Clicking a bond cycles single → double → triple → gone, capped by what the element
// pair allows (C–O never offers triple; C–H goes straight from single to gone).
// A step is skipped when either endpoint can't afford it (e.g. the middle carbon of
// a chain already spending its valence). 0 (remove) is always affordable, so the
// cycle can never wedge. (Classic behavior — the naming builder. The reactions lab
// uses explicit tools instead; see setBondTool in lab.js.)
export const ORDER_CYCLE = [1, 2, 3, 0];

export function nextOrder(bond, atomsById, bonds) {
  const cap = maxOrder(atomsById[bond.a].el, atomsById[bond.b].el);
  const fits = (atomId, o) => bondSum(atomId, bonds) - bond.order + o <= VALENCE[atomsById[atomId].el];
  const start = ORDER_CYCLE.indexOf(bond.order);
  for (let i = 1; i <= ORDER_CYCLE.length; i++) {
    const o = ORDER_CYCLE[(start + i) % ORDER_CYCLE.length];
    if (o === 0 || (o <= cap && fits(bond.a, o) && fits(bond.b, o))) return o;
  }
  return 0;
}

// ── grading a built structure ───────────────────────────────────────────────────
// Target: a straight chain of n carbons — plain alkane, or with exactly one double/
// triple bond in a named slot (slot p = the bond between C-p and C-(p+1)). The canvas
// must hold EXACTLY that molecule: n carbons, one connected piece, no branches, no ring.
// (Connected + n−1 edges ⇒ a tree; a tree with every degree ≤ 2 is a path.)
// The chain has no inherent direction, so the slot matches from EITHER end — a student's
// but-1-ene built "backwards" is still but-1-ene.
// The reason string is for tests and future diagnostics — gameplay shows only right/wrong.
export function gradeChainBuild(atoms, bonds, { n, special = null }) {
  if (atoms.length === 0) return { ok: false, reason: "empty" };
  if (atoms.some((a) => a.el !== "C")) return { ok: false, reason: "non-carbon" };
  if (atoms.length !== n) return { ok: false, reason: "carbon-count" };
  if (componentCount(atoms, bonds) > 1) return { ok: false, reason: "disconnected" };
  if (bonds.length !== n - 1) return { ok: false, reason: "ring" };
  const degree = (id) => bonds.reduce((s, b) => s + (b.a === id || b.b === id ? 1 : 0), 0);
  if (atoms.some((a) => degree(a.id) > 2)) return { ok: false, reason: "branched" };

  const orders = chainOrders(atoms, bonds);
  if (!special) {
    return orders.every((o) => o === 1) ? { ok: true } : { ok: false, reason: "multiple-bond" };
  }
  const want = Array(n - 1).fill(1);
  want[special.slot - 1] = special.order;
  const matches = (w) => orders.every((o, i) => o === w[i]);
  return matches(want) || matches(want.slice().reverse())
    ? { ok: true }
    : { ok: false, reason: "bond-order-or-position" };
}

// Bond orders walked end to end along the path (empty for a lone atom).
function chainOrders(atoms, bonds) {
  if (atoms.length < 2) return [];
  const adj = new Map(atoms.map((a) => [a.id, []]));
  for (const b of bonds) {
    adj.get(b.a).push({ to: b.b, order: b.order });
    adj.get(b.b).push({ to: b.a, order: b.order });
  }
  let cur = atoms.find((a) => adj.get(a.id).length === 1).id;
  let prev = null;
  const orders = [];
  while (orders.length < bonds.length) {
    const step = adj.get(cur).find((e) => e.to !== prev);
    orders.push(step.order);
    prev = cur;
    cur = step.to;
  }
  return orders;
}

// Rung-1/2 alias — the alkane is just the chain with no special bond.
export function gradeAlkaneBuild(atoms, bonds, n) {
  return gradeChainBuild(atoms, bonds, { n });
}

// ── rung 4: branched alkanes ────────────────────────────────────────────────────
// A branched target is a TREE SHAPE, not a numbered chain — the student may build it
// mirrored, rotated, or drawn any way at all. So we compare canonical forms (AHU tree
// canonization) instead of trying to re-derive IUPAC numbering from the drawing.
function canonTree(ids, neighborsOf) {
  // strip leaves until 1–2 centers remain
  let alive = new Set(ids);
  let degree = new Map(ids.map((id) => [id, neighborsOf(id).length]));
  while (alive.size > 2) {
    const leaves = [...alive].filter((id) => degree.get(id) <= 1);
    for (const leaf of leaves) {
      alive.delete(leaf);
      for (const nb of neighborsOf(leaf)) {
        if (alive.has(nb)) degree.set(nb, degree.get(nb) - 1);
      }
    }
  }
  const canon = (v, parent) => {
    const kids = neighborsOf(v).filter((c) => c !== parent).map((c) => canon(c, v)).sort();
    return `(${kids.join("")})`;
  };
  const centers = [...alive];
  return centers.map((c) => canon(c, centers.length === 2 ? centers[(centers.indexOf(c) + 1) % 2] : null))
    .sort()
    .join("|");
}

function neighborsFromBonds(bonds) {
  const adj = new Map();
  const add = (a, b) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b); };
  for (const b of bonds) { add(b.a, b.b); add(b.b, b.a); }
  return (id) => adj.get(id) || [];
}

// target: {m: parent-chain length, methyls: [locants]} — e.g. 2-methylbutane = {m:4, methyls:[2]}
export function gradeBranchedBuild(atoms, bonds, target) {
  const n = target.m + target.methyls.length;
  if (atoms.length === 0) return { ok: false, reason: "empty" };
  if (atoms.some((a) => a.el !== "C")) return { ok: false, reason: "non-carbon" };
  if (atoms.length !== n) return { ok: false, reason: "carbon-count" };
  if (componentCount(atoms, bonds) > 1) return { ok: false, reason: "disconnected" };
  if (bonds.length !== n - 1) return { ok: false, reason: "ring" };
  if (bonds.some((b) => b.order !== 1)) return { ok: false, reason: "multiple-bond" };

  // build the target tree: chain 1..m, then a methyl node hung on each locant
  const tBonds = [];
  for (let i = 1; i < target.m; i++) tBonds.push({ a: i, b: i + 1 });
  target.methyls.forEach((p, i) => tBonds.push({ a: p, b: target.m + 1 + i }));
  const tIds = Array.from({ length: n }, (_, i) => i + 1);

  const same = canonTree(atoms.map((a) => a.id), neighborsFromBonds(bonds))
    === canonTree(tIds, neighborsFromBonds(tBonds));
  return same ? { ok: true } : { ok: false, reason: "wrong-skeleton" };
}

// ── rungs 6+: functional groups via labeled-graph isomorphism ───────────────────
// Aldehydes, ketones, ethers, esters, acids, amines, amides are all "build this
// exact molecule". One canonical form settles them all: AHU tree canonization with
// ELEMENTS on the nodes and BOND ORDERS on the edges. Any drawing of the right
// molecule matches; any isomer (ethanol vs methoxymethane!) does not.
export function canonMolecule(atoms, bonds) {
  const el = Object.fromEntries(atoms.map((a) => [a.id, a.el]));
  const nbs = new Map(atoms.map((a) => [a.id, []]));
  for (const b of bonds) {
    nbs.get(b.a).push({ to: b.b, order: b.order });
    nbs.get(b.b).push({ to: b.a, order: b.order });
  }
  let alive = new Set(atoms.map((a) => a.id));
  const deg = new Map(atoms.map((a) => [a.id, nbs.get(a.id).length]));
  while (alive.size > 2) {
    const leaves = [...alive].filter((id) => deg.get(id) <= 1);
    for (const leaf of leaves) {
      alive.delete(leaf);
      for (const e of nbs.get(leaf)) if (alive.has(e.to)) deg.set(e.to, deg.get(e.to) - 1);
    }
  }
  const canon = (v, parent) => {
    const kids = nbs.get(v).filter((e) => e.to !== parent).map((e) => `${e.order}${canon(e.to, v)}`).sort();
    return `${el[v]}(${kids.join("")})`;
  };
  const centers = [...alive];
  if (centers.length === 1) return canon(centers[0], null);
  const [a, b] = centers;
  const mid = bonds.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  return `${mid.order}:${[canon(a, b), canon(b, a)].sort().join("|")}`;
}

// Split a canvas into its connected molecules — so a check can recognise "the right
// molecule, plus leftover pieces" and nudge instead of failing (a student who undoes
// and rebuilds often leaves spares floating; that is housekeeping, not chemistry).
export function splitComponents(atoms, bonds) {
  const seen = new Set();
  const out = [];
  for (const atom of atoms) {
    if (seen.has(atom.id)) continue;
    const ids = new Set([atom.id]);
    const stack = [atom.id];
    while (stack.length) {
      const cur = stack.pop();
      for (const b of bonds) {
        const other = b.a === cur ? b.b : b.b === cur ? b.a : null;
        if (other !== null && !ids.has(other)) { ids.add(other); stack.push(other); }
      }
    }
    ids.forEach((id) => seen.add(id));
    out.push({
      atoms: atoms.filter((a) => ids.has(a.id)),
      bonds: bonds.filter((b) => ids.has(b.a) && ids.has(b.b))
    });
  }
  return out;
}

// Explicit H atoms (the reactions game's placeable hydrogen tokens) fold back into the
// implicit count before grading: delete the H nodes, and the valence slot each one held
// is re-derived as an implicit H. A single-bonded explicit H is therefore structurally
// identical to an implicit one — which is the whole point of the token.
export function stripExplicitH(atoms, bonds) {
  const hIds = new Set(atoms.filter((a) => a.el === "H").map((a) => a.id));
  return {
    atoms: atoms.filter((a) => !hIds.has(a.id)),
    bonds: bonds.filter((b) => !hIds.has(b.a) && !hIds.has(b.b))
  };
}

export function gradeIsomorphic(atoms, bonds, target, allowed) {
  if (atoms.length === 0) return { ok: false, reason: "empty" };
  if (atoms.some((a) => !allowed.includes(a.el))) return { ok: false, reason: "wrong-element" };
  for (const el of new Set([...atoms, ...target.atoms].map((a) => a.el))) {
    if (atoms.filter((a) => a.el === el).length !== target.atoms.filter((a) => a.el === el).length) {
      return { ok: false, reason: "atom-count" };
    }
  }
  if (componentCount(atoms, bonds) > 1) return { ok: false, reason: "disconnected" };
  if (bonds.length !== atoms.length - 1) return { ok: false, reason: "ring" };
  return canonMolecule(atoms, bonds) === canonMolecule(target.atoms, target.bonds)
    ? { ok: true }
    : { ok: false, reason: "wrong-structure" };
}

// ── rung 5: alcohols ────────────────────────────────────────────────────────────
// target: {n: chain carbons, oh: locant} — a straight C-chain, all single bonds, with
// ONE oxygen hanging off carbon `oh` (counted from either end). The oxygen keeps a
// hydrogen by valence — that's the hydroxyl, and the canvas does it automatically.
export function gradeAlcoholBuild(atoms, bonds, target) {
  const { n, oh } = target;
  if (atoms.length === 0) return { ok: false, reason: "empty" };
  if (atoms.some((a) => a.el !== "C" && a.el !== "O")) return { ok: false, reason: "wrong-element" };
  const os = atoms.filter((a) => a.el === "O");
  const cs = atoms.filter((a) => a.el === "C");
  if (os.length !== 1) return { ok: false, reason: "oxygen-count" };
  if (cs.length !== n) return { ok: false, reason: "carbon-count" };
  if (componentCount(atoms, bonds) > 1) return { ok: false, reason: "disconnected" };
  if (bonds.length !== n) return { ok: false, reason: "ring" };  // n+1 atoms, tree
  if (bonds.some((b) => b.order !== 1)) return { ok: false, reason: "multiple-bond" };

  const o = os[0];
  const neighbors = neighborsFromBonds(bonds);
  const oNbs = neighbors(o.id);
  if (oNbs.length !== 1) return { ok: false, reason: "ether" };  // O inside the chain

  // the carbons alone must form a straight chain
  const cBonds = bonds.filter((b) => b.a !== o.id && b.b !== o.id);
  const chain = gradeChainBuild(cs, cBonds, { n });
  if (!chain.ok) return chain;

  // walk the chain to find which position holds the O — either end may count
  if (n === 1) return oh === 1 ? { ok: true } : { ok: false, reason: "oh-position" };
  const cNbs = neighborsFromBonds(cBonds);
  let cur = cs.find((a) => cNbs(a.id).length === 1).id;
  let prev = null;
  for (let pos = 1; pos <= n; pos++) {
    if (cur === oNbs[0] && (pos === oh || pos === n + 1 - oh)) return { ok: true };
    const nxt = cNbs(cur).find((x) => x !== prev);
    prev = cur;
    cur = nxt;
  }
  return { ok: false, reason: "oh-position" };
}

function componentCount(atoms, bonds) {
  const seen = new Set();
  let comps = 0;
  for (const atom of atoms) {
    if (seen.has(atom.id)) continue;
    comps += 1;
    const stack = [atom.id];
    seen.add(atom.id);
    while (stack.length) {
      const cur = stack.pop();
      for (const b of bonds) {
        const other = b.a === cur ? b.b : b.b === cur ? b.a : null;
        if (other !== null && !seen.has(other)) { seen.add(other); stack.push(other); }
      }
    }
  }
  return comps;
}

// One formula string ("C2H6") per connected component, heavy atoms + derived H's.
export function componentFormulas(atoms, bonds) {
  const seen = new Set();
  const out = [];
  for (const atom of atoms) {
    if (seen.has(atom.id)) continue;
    const comp = [];
    const stack = [atom];
    seen.add(atom.id);
    while (stack.length) {
      const cur = stack.pop();
      comp.push(cur);
      for (const b of bonds) {
        const otherId = b.a === cur.id ? b.b : b.b === cur.id ? b.a : null;
        if (otherId !== null && !seen.has(otherId)) {
          seen.add(otherId);
          stack.push(atoms.find((x) => x.id === otherId));
        }
      }
    }
    const nC = comp.filter((x) => x.el === "C").length;
    const nH = comp.reduce((s, x) => s + hydrogenCount(x, bonds), 0);
    // Hill order: C, then H, then everything else alphabetically (a lone O reads "H2O")
    const rest = [...new Set(comp.map((x) => x.el).filter((el) => el !== "C"))].sort()
      .map((el) => { const k = comp.filter((x) => x.el === el).length; return `${el}${k > 1 ? k : ""}`; })
      .join("");
    out.push(`${nC ? `C${nC > 1 ? nC : ""}` : ""}${nH ? `H${nH > 1 ? nH : ""}` : ""}${rest}`);
  }
  return out;
}
