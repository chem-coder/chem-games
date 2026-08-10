# pH Lab

The quantitative acid–base game. First build of the IMAT course track — see
[documentation/imat-course/ph-lab-plan.md](../documentation/imat-course/ph-lab-plan.md)
for the full six-rung plan and the locked decisions behind it.

## Current Scope — Rungs 1–5 of 6

**Rung 1 — Powers of Ten.** The pH square: [H⁺] ↔ pH ↔ pOH ↔ [OH⁻], all conversions
via exponent reading (flip the sign; pH + pOH = 14; Kw exponents sum to −14).
No logs, no calculator.

**Rung 2 — Strong Stuff.** pH from concentration for the strong acids and bases
(fully dissociated, so the label concentration IS [H⁺]/[OH⁻]): direct reads,
the diprotic ×2 wrinkle (0.005 M H₂SO₄ → pH 2), and the mass chain
(g → mol ÷ Mr → M ÷ L → pH) with the Mr printed on the card, exam-style.
Multi-step cards get an ungraded scratch pad.

**Rung 3 — Dilution Bench.** Two phases. The Bench: scripted dilution sessions on
a pH-tinted CSS beaker (color tracks the spine gradient; water raises the level
immediately, but the color only changes when the meter reads — predict first).
The acid run walks pH 1 toward 7; its last step invites the formal answer (8) and
the meter reads ≈7 — the never-past-7 asymptote is discovered, not taught; the
base run meets the same wall from above. Then a 5-card stack in the exam's
framings: "made up to", "how much water to ADD" (99/90 mL — answering the total
is wrong, and the reveal shows total − existing = added), the factor question,
and the asymptote card. Bench steps grade but never requeue mid-session.

**Rung 4 — pH Ladder.** Ordering puzzles at equal concentration (always 0.1 M):
drag cards into slots — or tap a card, then tap a slot; both gestures share one
placement semantic — and Check only when every slot is filled. One rule:
diprotic strong acid < strong acid < weak acid < 7 < weak base < strong base <
diprotic base; neutral salts and pure water pin the middle. One late puzzle runs
DECREASING with a loud banner. The reveal marks each slot and shows the correct
sequence with class chips — the why is always the classification. The engine
throws on class ties, so ambiguous puzzles can't be authored. With Salt Court
live, two bonus mixed-ladder puzzles rotate in (5-of-7 sample per round): the
hydrolyzing salts rank between the weak species and 7 — milder still.

**Rung 5 — Salt Court.** Hydrolysis verdicts constructed, never memorized: the
salt splits into its ions on the card; the student picks each ion's parent from
3 candidates (wrong-identity and wrong-category distractors), toggles each
parent strong/weak, declares the verdict, and one Check grades the whole
five-part chain with per-part marks — a wrong parent fails its strength mark
too, so the broken link is always visible. The rule: THE STRONG PARENT WINS;
both strong is a draw at exactly 7. Weak+weak and amphiprotic curveballs
(NaHSO₄) are excluded by design; saltVerdict() throws on weak+weak.
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
