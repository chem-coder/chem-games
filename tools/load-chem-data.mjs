// Loads the three ChemGames IIFE data/engine files into one plain object,
// WITHOUT modifying the source files and WITHOUT a browser.
//
// Each source file is of the form:
//   (function (window) { window.ChemGames.X = ... })(window)
// i.e. it takes a `window` parameter and hangs things off `window.ChemGames`.
//
// We read each file as text and execute it with `new Function('window', code)`,
// passing a shared plain `windowObj`. That gives the IIFE the `window` it
// expects while keeping everything inside this process (no globals touched).

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const FILES = {
  elementStyles: resolve(
    repoRoot,
    "imat-chem-stoichiometry/data/elements.js"
  ),
  reactions: resolve(
    repoRoot,
    "imat-chem-stoichiometry/data/reactions.js"
  ),
  balancingEngine: resolve(
    repoRoot,
    "imat-chem-stoichiometry/js/balancingEngine.js"
  )
};

export async function loadChemData() {
  // One shared "window" stand-in. The IIFEs each do
  // `window.ChemGames = window.ChemGames || {}` then attach to it.
  const windowObj = {};

  // Order matters only in that all three attach to the same ChemGames object;
  // none of these files depend on another at load time, but loading them all
  // onto one window mirrors how the browser sees them.
  for (const path of [
    FILES.elementStyles,
    FILES.reactions,
    FILES.balancingEngine
  ]) {
    const code = await readFile(path, "utf8");
    // `new Function` compiles `code` with a single `window` parameter, then we
    // invoke it with our shared object. The trailing `(window)` inside each
    // file passes that same parameter through to the inner IIFE.
    const run = new Function("window", code);
    run(windowObj);
  }

  const chem = windowObj.ChemGames || {};

  return {
    reactions: chem.reactions,
    elementStyles: chem.elementStyles,
    BalancingEngine: chem.BalancingEngine
  };
}
