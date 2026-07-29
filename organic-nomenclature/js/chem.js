// Molecule Builder prototype — pure chemistry logic. No DOM, no canvas. ESM for `node --test`.
//
// The whole hydrogen mechanic reduces to one invariant: hydrogens are never stored,
// they are DERIVED. An atom's H count = valence − (sum of its bond orders). The canvas
// layer just animates the difference when that number changes (falling H's on bond
// formation, instant re-balance on bond-order cycling — Dalia's spec, 2026-07-29).

export const VALENCE = { C: 4, N: 3, O: 2, H: 1 };

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

// Clicking a bond cycles single → double → triple → gone. A step is skipped when either
// endpoint can't afford it (e.g. the middle carbon of a chain already spending its valence).
// 0 (remove) is always affordable, so the cycle can never wedge.
export const ORDER_CYCLE = [1, 2, 3, 0];

export function nextOrder(bond, atomsById, bonds) {
  const fits = (atomId, o) => bondSum(atomId, bonds) - bond.order + o <= VALENCE[atomsById[atomId].el];
  const start = ORDER_CYCLE.indexOf(bond.order);
  for (let i = 1; i <= ORDER_CYCLE.length; i++) {
    const o = ORDER_CYCLE[(start + i) % ORDER_CYCLE.length];
    if (o === 0 || (fits(bond.a, o) && fits(bond.b, o))) return o;
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
    out.push(`${nC ? `C${nC > 1 ? nC : ""}` : ""}${nH ? `H${nH > 1 ? nH : ""}` : ""}`);
  }
  return out;
}
