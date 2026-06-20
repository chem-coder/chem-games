// Automated chemistry-data validation.
//
// For EVERY stored reaction this suite asserts that the hand-authored
// `solution` is correct: it length-matches the molecule arrays, it actually
// balances the equation (per the project's own BalancingEngine), and it is
// the minimal positive-integer coefficient set.
//
// The hand-authored solutions are the human-verified source of truth. This
// test NEVER edits data; if a reaction fails, the failure names the reaction
// id so a human can inspect it.

const test = require("node:test");
const assert = require("node:assert/strict");

// Greatest common divisor (Euclid). Inputs are positive integers here.
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

// GCD across a list of integers. Empty/[0...] guarded by callers, but be safe.
function gcdAll(numbers) {
  return numbers.reduce((acc, n) => gcd(acc, n), 0);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

// Build a reaction clone whose coefficients are the stored solution, then ask
// the engine whether it balances. Cloning keeps the shared data untouched.
function applySolution(BalancingEngine, reaction) {
  const candidate = BalancingEngine.cloneReaction(reaction);
  reaction.solution.reactants.forEach((coef, i) => {
    candidate.reactants[i].coefficient = coef;
  });
  reaction.solution.products.forEach((coef, i) => {
    candidate.products[i].coefficient = coef;
  });
  return candidate;
}

// `node:test` runs `require`d modules synchronously, so load the data via a
// top-level await wrapped in an async IIFE that registers the tests.
(async () => {
  const { loadChemData } = await import("./load-chem-data.mjs");
  const { reactions, elementStyles, BalancingEngine } = await loadChemData();

  // Sanity: the harness itself must have real data to test.
  test("data harness loaded", () => {
    assert.ok(
      Array.isArray(reactions) && reactions.length > 0,
      "reactions array failed to load"
    );
    assert.ok(
      elementStyles && typeof elementStyles === "object",
      "elementStyles failed to load"
    );
    assert.ok(
      BalancingEngine &&
        typeof BalancingEngine.isReactionBalanced === "function",
      "BalancingEngine failed to load"
    );
  });

  const missingStyleSymbols = new Set();

  for (const reaction of reactions) {
    test(reaction.id, () => {
      const { solution, reactants, products } = reaction;

      // 1. Solution arrays must line up 1:1 with the molecule arrays.
      assert.ok(
        solution && Array.isArray(solution.reactants),
        `${reaction.id}: solution.reactants missing`
      );
      assert.ok(
        solution && Array.isArray(solution.products),
        `${reaction.id}: solution.products missing`
      );
      assert.equal(
        solution.reactants.length,
        reactants.length,
        `${reaction.id}: solution.reactants length ${solution.reactants.length} != reactants length ${reactants.length}`
      );
      assert.equal(
        solution.products.length,
        products.length,
        `${reaction.id}: solution.products length ${solution.products.length} != products length ${products.length}`
      );

      // 2. Every solution coefficient must be a positive integer.
      const allCoefs = [...solution.reactants, ...solution.products];
      allCoefs.forEach((coef, i) => {
        assert.ok(
          isPositiveInteger(coef),
          `${reaction.id}: solution coefficient #${i} (${coef}) is not a positive integer`
        );
      });

      // 3. The minimal-set check: GCD of all coefficients must be 1.
      assert.equal(
        gcdAll(allCoefs),
        1,
        `${reaction.id}: solution is not minimal — GCD of coefficients [${allCoefs.join(
          ", "
        )}] is ${gcdAll(allCoefs)}, expected 1`
      );

      // 4. The solution must actually balance the equation.
      const balanced = applySolution(BalancingEngine, reaction);
      assert.ok(
        BalancingEngine.isReactionBalanced(balanced),
        `${reaction.id}: stored solution does not balance the equation. ` +
          `Element status: ${JSON.stringify(
            BalancingEngine.getElementBalanceStatus(balanced)
          )}`
      );

      // Collect (non-fatal) any element symbol lacking a style entry.
      [...reactants, ...products].forEach((molecule) => {
        Object.keys(molecule.atoms).forEach((symbol) => {
          if (!Object.prototype.hasOwnProperty.call(elementStyles, symbol)) {
            missingStyleSymbols.add(symbol);
          }
        });
      });
    });
  }

  // Non-fatal warning: element symbols used in atoms with no style entry.
  // The renderer falls back to a default style, so this never hard-fails.
  test("element style coverage (non-fatal warning)", () => {
    if (missingStyleSymbols.size > 0) {
      const list = [...missingStyleSymbols].sort().join(", ");
      console.warn(
        `\n[WARNING] ${missingStyleSymbols.size} element symbol(s) used in reaction atoms have no entry in elementStyles: ${list}\n` +
          "  -> Not a failure: the renderer uses a default style. Add entries to elements.js if you want custom styling.\n"
      );
    }
    // Always passes; this is a report, not an assertion.
    assert.ok(true);
  });
})();
