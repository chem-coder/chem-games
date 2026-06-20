# Conversion Builder — design spec

Created: 2026-06-21. The next-generation upgrade of the Conversion Conveyor. Where the
conveyor asks the learner to *pick* a ready-made factor's orientation, the **Builder** makes
them **construct the whole dimensional-analysis expression from tiles** — including the step
everyone skips. This is the real game; the conveyor is its gentle warm-up.

Source: Dalia's design notes (2026-06-21). Companion: `STOICHIOMETRY_WORLD.md` (the ladder),
`ARCHITECTURE.md` (conventions).

**Status (2026-06-21): Tier A built** — `conversion-builder/`. Tap-to-place tiles into a
2-column grid (given/1 × ratio), predict-then-Check, unit-cancel animation, derived
distractors, per-question diagnostics that never reveal the answer. Seeds: 2 H₂ + O₂ → 2 H₂O,
N₂ + 3 H₂ → 2 NH₃, H₂ + Cl₂ → 2 HCl, each with a reactant-given and a product-given round and
any→any questions. **Build step 1 done:** the conveyor's engine is promoted to
`shared/js/conversion-engine.js` (+ test); both games import it. Pure grid logic lives in
`conversion-builder/js/builder.js`, guarded by `builder.test.js` (in `tools/test-guard.mjs`).

---

## 1. Why the conveyor isn't enough

1. **It's a coin flip.** Two orientations → 50/50; a wrong guess is fixed by clicking the
   other tile. No skill, no effort, easy to cheat.
2. **It hides the crucial first step.** The conveyor hands the learner the ratio. But the
   heart of stoichiometry is realizing the *given* amount must enter the expression as its
   own term — `6 mol H₂ / 1` — and that **the 6 mol given is NOT the 2 mol in the ratio.**
   Malcolm specifically gets stuck here: he has no "first step" to start from.
3. **It under-sells the magic.** The thrilling truth — *given any one amount in a reaction,
   you can find every other amount* — never shows up when each problem is a single fixed
   conversion.

## 2. The core mechanic — build the grid

Show the balanced equation, a given amount, and a question (often several). The learner
**assembles** the dimensional-analysis grid by dropping tiles into numerator / denominator
slots:

```
 | 6 mol H₂ | 2 mol H₂O |
 |----------|-----------|  =  6 mol H₂O
 |    1     |  2 mol H₂ |
```

- The **given enters as a term over 1** — there is a literal `1` tile, and placing it is part
  of the puzzle. This is the step that teaches "given ≠ ratio."
- **No ready-made ratios.** Every numerator and every denominator is its own tile; the learner
  builds each fraction.
- **Predict, then Check** (see [[predict-before-reveal]]): nothing cancels or computes until
  Check. On Check: correct → units strike through and the answer falls out; wrong → a
  *diagnostic* ("the H₂ don't cancel — what's left on top/bottom?") **without revealing the
  answer.**

## 3. Any → any (the thrill, made playable)

One problem = one reaction + one given (species + amount) + several target questions, e.g. for
`2 H₂ + O₂ → 2 H₂O`, given 6 mol H₂:

- "How many mol H₂O are made?" → `6 × 2/2 = 6 mol H₂O`
- "How many mol O₂ are needed to react all the H₂?" → `6 × 1/2 = 3 mol O₂`

Other versions start from O₂, or from the **product** (given mol H₂O → find mol H₂ and mol O₂
that were required). Same reaction, many doors in and out. This is what makes it feel powerful.

## 4. Design philosophy (non-negotiable) — see [[design-challenge-discovery]]

- **The challenge is the fun.** An easy game is boring. Keep it hard enough that the learner
  has to *discover the trick* themselves.
- **Never reveal the algorithm up front.** Present the field and the goal — "here's where you
  are, here's the target, how will you get there?" — not a walkthrough. (The cat-doku ad
  spelled out the whole logic and the game died on arrival.)
- **Defeat guessing by construction.** Many tiles and slots mean only a genuinely correct,
  unit-cancelling arrangement reaches the target. There's nothing to brute-force.
- **Repetition must build skill**, not just repeat. New reactions, new givens, harder tiers.

## 5. Difficulty tiers (tile granularity)

- **Tier A — whole-piece tiles.** Tiles are complete quantities: `6 mol H₂`, `1`, `2 mol H₂O`,
  `2 mol H₂`, plus distractors. The learner arranges numerators and denominators. Already
  forces the given-over-1 insight and kills the coin flip. **Built** (`conversion-builder/`).
- **Tier B — atomic tokens.** Tiles are `6`, `mol`, `H₂`, `1`, `2`, `H₂O`, `g`, … and the
  learner builds *every* quantity from tokens. Much more effortful; deep structure. Later.

## 6. Distractors

Include plausible-but-wrong tiles — e.g. the *other* species' coefficient (`1 mol O₂`,
`3 mol`), or a flipped ratio — so the learner must read the equation correctly, not just place
"the only tiles available." Tune the count: enough to require thought, not so many it's tedious.

## 7. It reuses and grows

The grid is the same shape for every later rung — you just add columns:

- mole ratio: `given/1 × ratio` (2 columns)
- molar mass: add a `g/mol` column
- gram-to-gram: `g A/1 × (mol A / g A) × (mol B / mol A) × (g B / mol B)` (4 columns)

So the Builder is the engine for the whole conversion half of the ladder; it literally gets
bigger as grams and molar masses arrive. **Engine reuse:** the existing `runChain` (a start
quantity folded through oriented factors) already models a completed grid — the Builder is a
new tile-into-slot UI feeding the same pure engine, plus distractor generation and per-slot
validation.

## 8. Decisions (with recommendations)

- **Tier A first** (whole-piece tiles). Tier B later. ✅ rec
- **Grid sized to the problem's steps** — show the right number of columns; don't make them
  guess how many conversions. ✅ rec
- **Tap-to-place for v1** (tap a tile, tap a slot), drag-and-drop as polish — same call we made
  on the conveyor. ✅ rec
- **A few distractors**, drawn from the reaction's other species. ✅ rec
- **Keep the Conveyor** (orientation-pick) as the gentlest warm-up; the Builder is the main
  event. **Decided:** the Builder is a new game folder `conversion-builder/`. **Build step 1:**
  promote the conveyor's engine to `shared/js/conversion-engine.js` (+ its test) so both games
  share it; the conveyor then imports from there.

## 9. The competitive bar

Textbook publishers (Mastering, ALEKS, OWL…) have grid-style dimensional-analysis widgets — but
they're ugly, clunky, and joyless. We win on **beauty** (True Autumn, the cancellation
animation), **feel** (predict-then-Check, tactile tiles), and **discovery** (no tutorialized
trick). Extra fun/entertainment polish can come after the mechanic is right — that's fine.

## 10. Decisions (resolved 2026-06-21) + open

Resolved with the owner:

- **Multi-question = one grid, answered question-by-question** (re-place tiles for each target).
- **Distractors are derived** from the reaction's other species + a small set of wrong numbers
  (no hand-authoring, so content scales).
- **Builder is a separate game** (`conversion-builder/`); the Conveyor stays as the warm-up.
- **Molar masses are provided** on the tiles when grams arrive (from the rung-3 discussion —
  save the learner the lookup).

Still open (decide during the build):

- Should a correct build "lock in" as a referenceable worked example across the multi-question
  set? **Deferred** in the Tier A build: each question resets to a fresh empty grid (re-placing
  the given-over-1 every time is the reinforcement). Revisit if students want the prior worked
  example kept visible.
