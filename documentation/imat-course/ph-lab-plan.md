# pH Lab — Build Plan

*The quantitative acid–base game. First build of the IMAT course track, chosen because acids–bases is the largest and fastest-growing IMAT topic (20/169 lifetime, 8/45 in 2022–24), and pH calculation is its center of mass.*

**Decisions locked (2026-08-10):** theory questions (Brønsted/Lewis/conjugates/weak-vs-strong ID) go to an **Acid/Base Sorter expansion**, not here — pH Lab stays purely quantitative. Titration ships at launch as rung 6. pH color scale is an **autumn-tuned gradient**: rust/terracotta (acid) → deep warm teal at 7 → olive/deep forest (base). No indicator rainbow.

## Scope guardrails (from the question bank)

- Everything is powers of ten — **no calculator, no log tables, no Ka/Kb calculations ever.** Weak acids appear only *qualitatively* (higher pH than a strong acid of equal concentration).
- Numbers stay IMAT-clean: concentrations 10⁻ⁿ M or one mass-to-moles step away; pH answers are integers.
- Oracle: the 20 tagged acids-bases questions in [imat-chem-question-bank.json](imat-chem-question-bank.json) are the private test set. Every rung must make its mapped oracle questions feel routine. (Ship original questions only.)

## The six rungs

| # | Rung | Skill | Mechanic | Oracle anchors |
|---|------|-------|----------|----------------|
| 1 | **Powers of Ten** | [H⁺] ↔ pH ↔ pOH ↔ [OH⁻] via Kw = 10⁻¹⁴ | typed recall | 2014 Q43, 2020 Q51 |
| 2 | **Strong Stuff** | pH from concentration, strong acids & bases; mass → mol → M → pH chain; H₂SO₄ ×2 wrinkle | typed recall | 2016 Q48, 2022 Q47, 2021 Q47 |
| 3 | **Dilution Bench** | pH after dilution; water-volume-to-reach-pH; the "never crosses 7" asymptote | predict → Check rig | 2017 Q44, 2024 Q46 |
| 4 | **pH Ladder** | order equal-concentration solutions by pH (strong/weak/salt/diprotic, qualitative) | drag onto ladder | 2023 Q35 |
| 5 | **Salt Court** | hydrolysis verdict by constructing parents (acid + base, each strong/weak) | construct + commit | 2015 Q52, 2016 Q41 |
| 6 | **Neutral Ground** | titration/neutralization mole math, incl. 2:1 ratios and g/L conversions | typed recall | 2020 Q52, 2019 Q49 |

### Mechanics notes (house rules applied)

- **Typed rungs (1, 2, 3, 6):** typed answers, never tiles ([[visual-intros-typed-recall]]). For concentrations, the input asks for the exponent n in 10⁻ⁿ (or the integer pH/volume), so typing stays trivial and the accepted-set answer model handles equivalents (e.g. "1e-5", "10^-5").
- **Predict before reveal everywhere:** in the Dilution Bench the student commits a pH prediction *before* the meter animates; nothing auto-reveals on first click.
- **Drag is for rung 4 only** — short items, spatial answer (drag = short tasks; no mixing drag and click-to-add within a quiz).
- **Salt Court constructs the answer:** for NaF, the student pulls parent acid (HF) and parent base (NaOH) from a tray, marks each strong or weak, *then* declares the verdict (acidic/basic/neutral) and hits Check. The verdict is derivable, never guessable from a memorized list — the trick is never revealed.
- **Hints:** balancer-style progressive ladder, green-circle numbered steps markup, per house pattern. Hint 1 is always the governing relationship (e.g. ① pH = −log₁₀[H⁺]), later hints narrow toward the specific value without stating it.
- **Decks:** 5 questions per deck; rungs unlock in order but stay replayable.

### Traps to build in deliberately (straight from real papers)

1. Dilution volume: taking 1 mL from pH 2 to pH 4 needs **99 mL** of water, not 100 (2024 Q46).
2. Dilution asymptote: pH 6 diluted 1000× → ≈7, **never 9**.
3. pH 2 vs pH 4 = **100×** the H⁺, not 2× (2020 Q51).
4. H₂SO₄ at 0.005 M → [H⁺] = 0.01 → pH 2 (two protons; 2021 Q47).
5. Same pH ≠ same concentration once weak acids enter the ladder (2023 Q35).
6. Kw is temperature-dependent — pure water is always neutral but not always pH 7 (2015 Q43). Candidate for a late deck in rung 1.

## Visual identity

- Autumn pH gradient as the game's spine: rust → terracotta → warm beige (≈6) → **deep warm teal at 7** → sage/olive → deep forest (14). Muted throughout, no neon.
- Subscripts/superscripts at house size rule (≥50%, slightly lowered) — this game is formula-dense (H₃O⁺, 10⁻¹⁴).
- Rung intros: two-block template (visual diagram + worked example), diagrams in the style of her slide decks. **Open item:** does an acids/bases slide deck exist to mine, like the Ch 05 nomenclature deck? If yes, map slides → rungs before building intros.

## Rung 3 spec — Dilution Bench (locked 2026-08-11)

Decisions (Dalia): scripted sequences; asymptote as engineered discovery; the 99-mL
trap grades as honestly wrong with a teaching reveal; pH-tinted beaker built now.

**Phase 1 — The Bench.** A CSS beaker whose liquid color tracks the spine gradient at its
current pH. Two scripted sessions on one continuing beaker each; every step announces a
dilution ("water is added until ×10") and the student types the predicted pH BEFORE the
meter reads. Steps grade like cards but never requeue mid-session (the chain must stay
coherent); misses are collected for the round report.

- *Acid session* (5 predictions): start 10 mL of 0.1 M HCl, pH 1 → ×10 (2) → ×100 (4) →
  ×10 (5) → ×10 (6) → **×100 (the discovery: predicted 8, meter reads ≈7)**. The intro
  never mentions the asymptote — the misprediction is the lesson, and the reveal explains:
  water itself supplies H⁺; dilution approaches 7 and never passes it.
- *Base session* (4 predictions): start 0.1 M NaOH, pH 13 → ×10 (12) → ×100 (10) →
  ×100 (8) → ×10 (**≈7 again** — reinforcement from the other side; bases dilute *down*).
- Near-7 answers: display "≈7", accept a typed 7.

**Phase 2 — the card stack** (5 cards, requeue as normal), the exam's framings:
1. "Made up to" (2017 Q44 shape): e.g. 50 mL of 0.1 M HNO₃ made up to 5 L → pH 3.
2. "How much water to add" (2024 Q46 shape): 1 mL at pH 3 → pH 5 needs 100× total →
   **99 mL added**. Answering 100 is *wrong* — the reveal shows total − existing = added.
3. Same trap at a different scale: 10 mL at pH 2 → pH 3 → add **90 mL**.
4. Factor question: what dilution factor takes pH 1 to pH 4 → ×1000.
5. Asymptote card: pH 6 diluted 1000× → ≈7 (not 9).
Volume cards fix the unit on the card ("___ mL"); the student types the number only.

**Logic:** `dilute(ph, factorExp, side)` in ph.js — formal pH shifts by the factor's
exponent toward the far end, but the *actual* answer clamps at ≈7 (acid side: min(ph+k, 7);
base side: max(ph−k, 7)), with an `approx` flag when the clamp engaged (drives the "≈7"
display and the discovery reveal). All arithmetic stays integer; tests cross-check every
scripted step and card.

## Rung 4 spec — pH Ladder (locked 2026-08-11)

Decisions (Dalia): drag with tap-tap fallback (two equivalent gestures, one meaning);
mostly increasing order with one prominently-labeled decreasing puzzle; hydrolyzing
salts deferred — they join as a bonus mixed-ladder deck AFTER Salt Court teaches them.

**The rule the rung teaches** (equal concentration, qualitative only, no Ka ever):
diprotic strong acid < strong acid < weak acid < 7 < weak base < strong base < diprotic
strong base. Neutral salts and pure water sit at 7.

**Mechanic.** Each round item is one ordering PUZZLE: 3–5 solution cards (every puzzle
states "all 0.1 M"), a row of empty slots labeled lowest → highest pH (or the reverse,
labeled loudly, on the one decreasing puzzle), the spine gradient beneath for ambient
orientation. Placement: pointer-drag or tap-card-then-tap-slot; cards rearrange freely;
Check enables only when all slots are filled; one commit per puzzle, binary grade,
requeue on miss. No per-card feedback before Check (predict-before-reveal).

**Reveal teaches classification:** each placed card marks right/wrong in place; the
correct sequence appears with a class chip under each card ("strong acid · 2 H⁺",
"weak acid", "neutral salt · pH 7"). Hints: ① classify each species ② the ordering
rule ③ the diprotic/count detail.

**Content.** Species pool with classes: HCl, HNO3 (strong acid); H2SO4 (diprotic);
CH3COOH, HCOOH, HF (weak acid); NaCl, KNO3, KCl (neutral salt); pure water; NH3 (weak
base); NaOH, KOH (strong base); Ba(OH)2, Ca(OH)2 (diprotic base). Five puzzles climbing:
3-item warm-up → +weak acid → the 2023 skill with our own species mix (never the exam's
exact five) → +weak base → water-anchored 5-item (one of the later ones decreasing).
Engine refuses puzzles with class ties (ambiguous order = authoring error, thrown).

## Rung 5 spec — Salt Court (locked 2026-08-11)

Decisions (Dalia): parents picked from 3 candidates per ion (right one + wrong-identity
+ wrong-category); ONE Check grading the whole five-part chain with per-part ✓/✗ marks;
weak+weak salts and NaHSO₄-style amphiprotic curveballs excluded entirely.

**The rule:** every salt has an acid parent and a base parent. In water, **the strong
parent wins**; two strong parents is a draw at 7. Fully derivable — no salt lists.

**Card flow (all click, one commit):** the salt appears split into its ions (the split
itself is the insight). Under each ion: pick its parent from 3 candidates, toggle the
chosen parent strong/weak (rung-2 chip knowledge pays off here), then declare the
verdict — acidic / basic / neutral. Check grades parents (2) + strengths (2) + verdict
(1) with per-part marks; any miss requeues the card. Hints: ① split into ions ② each
ion came from an acid or a base — which one? ③ the strong parent wins; both strong → 7.
Light courtroom flavor in reveal copy ("Verdict: basic — the strong parent wins").

**Content:** ~8 salts, 5/round — neutral: NaCl, KNO₃ · basic: NaF, CH₃COONa, Na₂CO₃,
KNO₂ · acidic: NH₄Cl, NH₄NO₃. Engine validates every salt derives its verdict from its
parents (hand-entered expected cross-checked, house pattern).

**Follow-on in the same build:** rung 4's bonus **mixed-ladder deck** — hydrolyzing
salts enter ordering puzzles with ranks *closer to 7* than weak acids/bases (acidic
salt between weak acid and 7; basic salt between 7 and weak base — qualitatively safe).

## Build order

1. Rung 1 + shared engine (typed-answer accepted-set checker, hint ladder, deck runner, gradient spine) — this is the template all rungs reuse.
2. Rungs 2–3 (same engine, new generators; Dilution Bench adds the predict-rig interaction).
3. Rung 4 (drag ladder — reuse Sorter's drag patterns where possible).
4. Rung 5 (construct mechanic — the only novel UI).
5. Rung 6 (engine reuse + mole-ratio hint ladders).
6. Polish pass, then the Sorter theory expansion as a separate follow-up build.

Standalone directory `ph-lab/`, directly accessible, no hub dependency ([[library-first-then-organize]]). Vanilla JS, no frameworks (Steam-track house rule).
