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
// Target: the straight-chain alkane CnH2n+2. The canvas must hold EXACTLY that
// molecule: n carbons, one connected piece, every bond single, no branches, no ring.
// (Connected + n−1 edges ⇒ a tree; a tree with every degree ≤ 2 is a path.)
// The reason string is for tests and future diagnostics — gameplay shows only right/wrong.
export function gradeAlkaneBuild(atoms, bonds, n) {
  if (atoms.length === 0) return { ok: false, reason: "empty" };
  if (atoms.some((a) => a.el !== "C")) return { ok: false, reason: "non-carbon" };
  if (atoms.length !== n) return { ok: false, reason: "carbon-count" };
  if (componentCount(atoms, bonds) > 1) return { ok: false, reason: "disconnected" };
  if (bonds.some((b) => b.order !== 1)) return { ok: false, reason: "multiple-bond" };
  if (bonds.length !== n - 1) return { ok: false, reason: "ring" };
  const degree = (id) => bonds.reduce((s, b) => s + (b.a === id || b.b === id ? 1 : 0), 0);
  if (atoms.some((a) => degree(a.id) > 2)) return { ok: false, reason: "branched" };
  return { ok: true };
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
