// Atomic Structure — pure species logic (no DOM). A species is an atom or a monoatomic
// ion: { z, mass, charge }. Electrons are placed on the 7 shells (n = 1..7) by the
// aufbau order, collapsed to shells: beginners see 2-8-8-2 for Z <= 20, which is
// exactly what the aufbau order gives. Ions: cations lose electrons from the highest
// occupied shell first, anions fill by aufbau.
export const SHELLS = 7;
export const SHELL_CAPACITY = [2, 8, 18, 32, 32, 18, 8]; // Bohr capacities per ring (2n², trimmed)

// Aufbau order as [n, capacity] pairs: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p
const AUFBAU = [
  [1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6], [5, 2], [4, 10], [5, 6],
  [6, 2], [4, 14], [5, 10], [6, 6], [7, 2], [5, 14], [6, 10], [7, 6]
];

export function electronCount({ z, charge = 0 }) {
  return z - charge;
}

export function neutronCount({ z, mass }) {
  return mass - z;
}

// Electrons per shell, index 0 = n=1. Length is always 7.
export function shellOccupancy(species) {
  const shells = new Array(SHELLS).fill(0);
  let left = electronCount(species);
  if (left < 0) throw new Error("negative electron count");
  // Neutral-atom aufbau fill for the species' own electron count works for anions and
  // for neutral atoms. For cations, remove from the neutral atom's highest shell first.
  const fill = (count) => {
    const s = new Array(SHELLS).fill(0);
    let n = count;
    for (const [shell, cap] of AUFBAU) {
      if (n <= 0) break;
      const take = Math.min(cap, n);
      s[shell - 1] += take;
      n -= take;
    }
    return s;
  };
  if (species.charge > 0) {
    const neutral = fill(species.z);
    let remove = species.charge;
    for (let i = SHELLS - 1; i >= 0 && remove > 0; i--) {
      const take = Math.min(neutral[i], remove);
      neutral[i] -= take;
      remove -= take;
    }
    return neutral;
  }
  return fill(left);
}

export function isIon(species) {
  return (species.charge || 0) !== 0;
}

// "Mg", "Mg2+", "Cl-" style label pieces for the symbol box with the charge in its corner.
export function chargeLabel(charge) {
  if (!charge) return "";
  const n = Math.abs(charge);
  return (n === 1 ? "" : String(n)) + (charge > 0 ? "+" : "−");
}

// Nuclide/ion notation pieces: { symbol, mass, z, charge } → for rendering ⁴⁰Ca²⁺ etc.
export function speciesKey({ z, mass, charge = 0 }) {
  return `${z}-${mass}-${charge}`;
}
