// Trend Ladder — pure game logic (no DOM). Rounds store species in ASCENDING
// property order; the player builds either that order or its reverse.
import { TIERS } from "../data/rounds.js?v=20261015-ru2";

export { TIERS };

// The winning key order for a round, left slot to right slot.
export function expectedKeys(round) {
  const asc = round.species.map((s) => s.key);
  return round.direction === "inc" ? asc : [...asc].reverse();
}

// The slot-strip end labels, left and right. `fmt(kind, property)` renders one label
// (kind = "smallest" | "largest"); the default is English.
const defaultFmt = (kind, prop) => `${kind} ${prop}`;
export function endLabels(round, fmt = defaultFmt) {
  const prop = round.property;
  const small = fmt("smallest", prop), large = fmt("largest", prop);
  return round.direction === "inc" ? { left: small, right: large } : { left: large, right: small };
}

export function grade(round, placedKeys) {
  const want = expectedKeys(round);
  const perSlot = want.map((k, i) => placedKeys[i] === k);
  return { correct: perSlot.every(Boolean), perSlot };
}

// Fisher–Yates that never deals the tray already solved (or reverse-solved —
// a reverse deal hands the answer to anyone who spots the direction flip).
export function shuffledTray(round, rng = Math.random) {
  const keys = round.species.map((s) => s.key);
  const want = expectedKeys(round).join("|");
  const wantRev = [...expectedKeys(round)].reverse().join("|");
  let out = [...keys];
  do {
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
  } while (out.join("|") === want || out.join("|") === wantRev);
  return out;
}

export function speciesByKey(round, key) {
  return round.species.find((s) => s.key === key) || null;
}
