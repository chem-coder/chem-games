// Atomic Structure — judging a built atom or ion against its target. Pure, no DOM.
// A build is { p, n, shells: [e1..e7] }. The verdict names what is off without giving
// the right number away: the hints carry the rules, the student finds the number.
import { shellOccupancy, neutronCount, electronCount } from "./model.js";

export function targetBuild(species) {
  return { p: species.z, n: neutronCount(species), shells: shellOccupancy(species) };
}

// Returns { ok, problems } where problems is a list of
//   { part: "protons" | "neutrons" | "electrons" | "shell", shell?, dir: "more" | "fewer" }
export function judge(build, species) {
  const t = targetBuild(species);
  const problems = [];
  if (build.p !== t.p) problems.push({ part: "protons", dir: build.p > t.p ? "more" : "fewer" });
  if (build.n !== t.n) problems.push({ part: "neutrons", dir: build.n > t.n ? "more" : "fewer" });
  const have = build.shells.reduce((a, b) => a + b, 0);
  const want = electronCount(species);
  if (have !== want) {
    problems.push({ part: "electrons", dir: have > want ? "more" : "fewer" });
  } else {
    for (let i = 0; i < t.shells.length; i++) {
      if (build.shells[i] !== t.shells[i]) {
        problems.push({ part: "shell", shell: i + 1, dir: build.shells[i] > t.shells[i] ? "more" : "fewer" });
        break;
      }
    }
  }
  return { ok: problems.length === 0, problems };
}

// Deal a deck: `count` distinct species from the pool, shuffled.
export function deal(pool, count, random = Math.random) {
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, count);
}
