// Shared dimensional-analysis engine (Conversion Conveyor + Conversion Builder).
// No DOM, no globals. ESM so it can be exercised directly with `node --test`.
//
// A "factor" relates two quantities, e.g. { a: {value:4, unit:"wheel"}, b: {value:1, unit:"car"} }.
// Oriented for use, it becomes a fraction with a numerator and a denominator.
// A unit cancels when the denominator's unit matches the running quantity's unit.

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// Orient a factor into { num, den }. flipped=false keeps a/b; flipped=true gives b/a.
export function orientFactor(factor, flipped) {
  return flipped
    ? { num: factor.b, den: factor.a }
    : { num: factor.a, den: factor.b };
}

// Apply one oriented factor to the running quantity. The denominator unit must equal
// the current unit so it cancels; the result carries the numerator's unit.
export function applyStep(current, oriented) {
  if (oriented.den.unit !== current.unit) {
    return {
      ok: false,
      reason: `"${oriented.den.unit}" is not on the bottom, so "${current.unit}" cannot cancel`,
      current
    };
  }
  return {
    ok: true,
    cancelled: current.unit,
    value: (current.value * oriented.num.value) / oriented.den.value,
    unit: oriented.num.unit
  };
}

// Fold a chain of oriented factors over the given quantity. Stops at the first step
// whose units do not cancel.
export function runChain(given, orientedFactors) {
  let current = { value: given.value, unit: given.unit };
  const steps = [];
  for (const oriented of orientedFactors) {
    const result = applyStep(current, oriented);
    steps.push(result);
    if (!result.ok) {
      return { ok: false, steps, result: current };
    }
    current = { value: result.value, unit: result.unit };
  }
  return { ok: true, steps, result: current };
}

// A problem is solved when the built chain runs cleanly AND lands on the target unit.
export function checkAnswer(problem, orientedFactors) {
  const run = runChain(problem.given, orientedFactors);
  const reachedTarget = run.ok && run.result.unit === problem.targetUnit && orientedFactors.length > 0;
  const valueMatches = reachedTarget && approxEqual(run.result.value, problem.answer.value);
  return {
    solved: reachedTarget && valueMatches,
    reachedTarget,
    valueMatches,
    result: run.result,
    steps: run.steps,
    expected: problem.answer
  };
}

// Float-safe equality for displayed quantities (avoids 0.1+0.2 artifacts).
export function approxEqual(a, b, epsilon = 1e-9) {
  return Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(a), Math.abs(b));
}
