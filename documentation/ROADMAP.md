# Chem Games — Near-Term Roadmap

Created: 2026-06-20. A phased plan for the next few weeks, ordered to match the project owner's priorities: build out the connected Stoichiometry World for Malcolm and launch it, while treating the balancer as "good for now."

This is a living plan. Phases are sequenced by dependency, not locked dates. Companion docs: `STOICHIOMETRY_WORLD.md` (design), `ARCHITECTURE.md` (conventions).

> **Update 2026-06-21.** Shipped since this was written: shared tokens + engine (`shared/`),
> Conversion Conveyor, **Conversion Builder (Tier A)**, and the **GitHub Pages launch is DONE** —
> the hub is live at https://chem-coder.github.io/chem-games/ and Malcolm is using it (he asked
> for the Builder *as homework*). Phase 4's launch goal is met. Two new lanes opened the day
> Malcolm hit Acids & Bases — see "New lanes" below; they now lead the queue alongside the
> stoichiometry expansion.

---

## New lanes (2026-06-21) — ordered

> **Update 2026-06-25.** Lanes 1 & 2 are **shipped.** Acid/Base Sorter is live + polished. The
> Nomenclature lane became **Chemical Nomenclature** (`nomenclature/builder/`) — a full 5-rung,
> both-directions naming game (Type I/II, Polyatomic incl. ammonium, Acids, Covalent) plus the
> Polyatomic-Ion Trainer and the first **reference page** (`reference/oxidation-states/`). See the
> "Build status" section in `NOMENCLATURE_DESIGN.md`. Remaining queue lead: Conversion Builder
> expansion (below) and the stoichiometry rungs (Phases 1–3) for Malcolm/IMAT.

1. **Acid/Base Sorter** *(shipped)* — flashcard classification drill. Spec: `ACID_BASE_SORTER_DESIGN.md`.
2. **Nomenclature → Chemical Nomenclature** *(shipped, ladder complete)* — progressive naming game,
   both directions, 5 rungs + reference page. Spec + build status: `NOMENCLATURE_DESIGN.md`.
3. **Conversion Builder expansion** — everyday-objects deck first (DA with objects before
   compounds), then masses/molar masses by growing the grid a column. Spec:
   `CONVERSION_BUILDER_DESIGN.md` §8b.

---

## Next up (2026-06-25) — the four lanes Dalia picked, ordered

Dalia wants all four built. **#1 first** (quickest, and clears a recurring offer).

> **Update 2026-06-26.** Lanes **#1 and #2 are done.** The worksheet audit ran (WS8 KEY rendered from
> its handwritten overlays + diffed against the engine; discrepancies reported, Dalia fixed her
> sources). Two engine improvements fell out of it: **mercury(I) is now modeled as the diatomic Hg₂²⁺**
> (was generating HgCl instead of Hg₂Cl₂), and the **cache-busting was rebuilt as per-game import maps**
> (the scattered `?v=` tags had drifted and shipped stale modules — see `ARCHITECTURE.md` §6). Lane #2,
> the **Oxidation-State Trainer**, shipped at `oxidation-state-trainer/`: sum-to-charge method, now
> **four rungs** — elements & ions → molecules → polyatomic ions (Mn in MnO₄⁻ = +7) → **half-reactions**
> (electron bookkeeping, OIL RIG: count the electrons + classify oxidation/reduction — the real redox
> on-ramp Dalia asked for). Typed answers, progressive hint ladders, a sign-placement nudge, a
> scratch-pad, oracle-tested content (~52 tests). Remaining: **#3 tidy the library**, **#4 Stoichiometry
> World**.

1. **Worksheet audit** *(do first · audit-only · do NOT edit the worksheets)* — run the CHEM 101
   Nomenclature worksheet KEYs (`_teaching-materials/CHEM 101 Nomenclature/`: **WS 8 KEY** ~120
   formula↔name pairs, the **Basics-100** assignment + key, **WS 6 Making Compounds** KEY) through the
   shipped engine (`nomenclature/js/naming.js` `assemble()` + the builder's `build*` fns) and report
   **every** mismatch/typo so **Dalia** fixes the source herself. The engine + reference PT + IUPAC
   rules are the rigorous source; the worksheet KEY is a *reference, not gospel*. Known issues already
   found: `(NH₄)₂Cr₂O₇` typo, the yttrium-chlorate item, CN⁻ mislabelled "cyanate" (→ cyanide),
   "nickel sulfide" shorthand (→ nickel(II)). Read the PDFs with poppler (`pdftotext -layout`).
2. **Oxidation-state trainer** — standalone redox on-ramp: find the oxidation state of an atom inside
   a polyatomic (Mn = +7 in MnO₄⁻). Reuses the polyatomic ions already drilled. **Skill B — NOT a
   nomenclature rung.** Memory: `oxidation-state-trainer`, `charge-deduction-teaching`.
3. **Tidy the library** — group the home-page cards into flat sections (Nomenclature / Stoichiometry /
   Reference / …). No gating, no hub — library-first.
4. **Stoichiometry World (Malcolm / IMAT)** — Dalia's standing *primary* goal: Phases 1–3 below
   (mole ratios → mass stoichiometry → limiting reagent + yield). The biggest lane; pick up after the
   quick wins. Spec: `STOICHIOMETRY_WORLD.md`.

Order after #1 is flexible.

---

## Guiding decisions (2026-06-20)

- **Focus:** connect Ratio Factory + balancer into one Stoichiometry World (Option 3), then extend it. The balancer itself is good to go for now; its polish + gamification come *after* the world is launched.
- **Launch:** GitHub Pages → share the URL with Malcolm. No domain or build step required to start.
- **Foundation:** build the *light* shared foundation now; defer the meta-game shell.

---

## Phase 0 — Light foundation (do alongside Phase 1, low risk)

Goal: stop duplicating scoring/storage/styling before a third game lands.

- [ ] Create `shared/` (`css/tokens.css`, `js/scoring.js`, `js/progress.js`, `data/`).
- [ ] Extract shared design tokens (palette, spacing, element colors/shapes, pills, buttons).
- [ ] Extract `Scoring.potentialScore(base, hints)`; point both games at it.
- [ ] Adopt storage-key convention `chem-games:<game-id>`.
- [ ] Promote the reaction database toward `shared/data/`; keep relative-path loading.
- [ ] Update `PROJECT_RULES.md` folder/database rules to name `shared/data/`.

Definition of done: both existing games still behave identically, now drawing scoring + tokens from `shared/`.

## Phase 0.5 — Chemistry safety net

Goal: never ship a wrong stored solution.

- [ ] `tools/validate-reactions.mjs`: assert every solution balances, is minimal (gcd = 1), and every element has a style entry. (No balancer needed — just checks the human-verified solutions.)
- [ ] (Optional, later) deterministic algorithmic balancer (atom matrix, **not AI**) used only as a cross-check that flags any hand-entered solution it disagrees with for owner review — never as the source of truth.

Definition of done: `node tools/validate-reactions.mjs` passes on all 74 reactions; failures block new content.

## Phase 1 — Stoichiometry World + Rung 2 (mole ratios)  ← immediate Malcolm need

Goal: the same Ratio Factory reasoning, now with real chemical formulas.

Decision (2026-06-20): built **in place inside `ratio-factory/`** rather than standing up a separate `stoichiometry-world/` app — its engine is already the generic ratio math, so a parallel app would mean porting for no near-term gain. Revisit the shell split when rungs 3–5 make the single file unwieldy.

- [x] Rung 2: chemical recipes on the same engine — molecule glyphs (Unicode subscripts), `perProduct` = balanced-equation coefficients, product-coefficient support (runs × coeff), reaction-aware hints + reasoning; amounts stay in whole moles. Committed `aeee484`.
- [x] Seeded 4 hand-verified reactions (water, ammonia, HCl, SO₂) in moles.
- [ ] (Optional) Balancer → rung-2 handoff ("you balanced it — now make product with it").
- [ ] (Cleanup) Lift recipe data from `ratio-factory/js/app.js` into `data/recipes.js`.

Definition of done: Malcolm can do limiting-reagent reasoning on `2 H₂ + O₂ → 2 H₂O`-style problems with the same UI he already likes.

## Phase 2 — Rung 3 (mass stoichiometry)

Goal: introduce molar mass as the grams ⇄ moles bridge.

- [ ] Molar-mass lens: `grams → moles` before the engine, `moles → grams` after.
- [ ] Pull `atomic mass` from `elements.json`; compute compound molar masses.
- [ ] Show the conversion explicitly; defer significant figures to a later pass.

Definition of done: a problem can start in grams, solve through moles, and report leftovers/products in grams.

## Phase 3 — Rungs 4–5 (limiting reagent named, theoretical & percent yield)

- [ ] Name the limiting/excess reagent explicitly (engine already computes it).
- [ ] Theoretical yield = `maxProducts × productMolarMass`.
- [ ] Percent yield = `actual / theoretical`, framed as a lab result.

Definition of done: the five-rung progression is continuously playable end to end.

## Phase 4 — Launch to Malcolm

- [ ] Enable GitHub Pages on `chem-coder/chem-games` (root hub as landing).
- [ ] Add the Stoichiometry World card to the hub.
- [ ] Confirm it loads on a phone; send Malcolm the URL.
- [ ] Capture his friction points (validation questions in the brief §22).

Definition of done: Malcolm is using it from a link without help.

## Later — Balancer polish + gamification (non-blocking)

The balancer is "good for now," so this trails the world build. Candidate improvements (from its README + your notes): more satisfying set-completion state, keyboard navigation, reaction ordering by playtest friction, and deeper gamification once the shared progress library exists.

## Parked (after 3 strong loops)

Shared world-map shell, cross-game XP/streaks/mastery, and the broader Reaction Studio / Foundations / Gas Laws lanes captured in `GAME_IDEAS_NOTEBOOK.md`.
