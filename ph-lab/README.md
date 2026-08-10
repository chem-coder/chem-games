# pH Lab

The quantitative acid–base game. First build of the IMAT course track — see
[documentation/imat-course/ph-lab-plan.md](../documentation/imat-course/ph-lab-plan.md)
for the full six-rung plan and the locked decisions behind it.

## Current Scope — Rungs 1–2 of 6

**Rung 1 — Powers of Ten.** The pH square: [H⁺] ↔ pH ↔ pOH ↔ [OH⁻], all conversions
via exponent reading (flip the sign; pH + pOH = 14; Kw exponents sum to −14).
No logs, no calculator.

**Rung 2 — Strong Stuff.** pH from concentration for the strong acids and bases
(fully dissociated, so the label concentration IS [H⁺]/[OH⁻]): direct reads,
the diprotic ×2 wrinkle (0.005 M H₂SO₄ → pH 2), and the mass chain
(g → mol ÷ Mr → M ÷ L → pH) with the Mr printed on the card, exam-style.
Multi-step cards get an ungraded scratch pad.
- Typed answers: plain integers for pH/pOH; for concentrations the input box IS the
  superscript slot of 10^▢, so the student types a signed exponent.
- Sign near-misses (dropped minus on an exponent, spurious minus on a pH) get a
  nudge and a retry — the card isn't burned.
- Progressive hint ladder per card: rule → method → this card.
- 5-card rounds drawn from an 18-item pool; missed cards requeue, and the round
  report offers a redrill of the misses.
- The autumn spine: 0–14 gradient (rust → beige → teal at 7 → forest). No marker
  until after Check — predict first, always.

## Structure

- `js/ph.js` — pure logic: solve/grade/hints/formatting. No DOM.
- `js/content.js` — item pools per rung; every item carries a hand-entered
  `expected` that the tests cross-check against the engine.
- `js/app.js` — DOM layer, same skeleton as the Oxidation-State Trainer.
- `js/ph.test.js` — run with `node --test ph-lab/js/ph.test.js`.

## Coming Rungs (planned)

2. Strong Stuff — pH from concentration, mass → mol → M → pH, the H₂SO₄ ×2 wrinkle.
3. Dilution Bench — predict-then-Check dilution rig, never-crosses-7 asymptote.
4. pH Ladder — drag equal-concentration solutions into pH order.
5. Salt Court — hydrolysis verdicts by constructing the salt's parents.
6. Neutral Ground — titration/neutralization mole math.
