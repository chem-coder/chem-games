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

## Build order

1. Rung 1 + shared engine (typed-answer accepted-set checker, hint ladder, deck runner, gradient spine) — this is the template all rungs reuse.
2. Rungs 2–3 (same engine, new generators; Dilution Bench adds the predict-rig interaction).
3. Rung 4 (drag ladder — reuse Sorter's drag patterns where possible).
4. Rung 5 (construct mechanic — the only novel UI).
5. Rung 6 (engine reuse + mole-ratio hint ladders).
6. Polish pass, then the Sorter theory expansion as a separate follow-up build.

Standalone directory `ph-lab/`, directly accessible, no hub dependency ([[library-first-then-organize]]). Vanilla JS, no frameworks (Steam-track house rule).
