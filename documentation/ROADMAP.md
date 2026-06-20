# Chem Games — Near-Term Roadmap

Created: 2026-06-20. A phased plan for the next few weeks, ordered to match the project owner's priorities: build out the connected Stoichiometry World for Malcolm and launch it, while treating the balancer as "good for now."

This is a living plan. Phases are sequenced by dependency, not locked dates. Companion docs: `STOICHIOMETRY_WORLD.md` (design), `ARCHITECTURE.md` (conventions).

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

- [ ] Stand up `stoichiometry-world/` on the standard module pattern (engine extracted from Ratio Factory's generic ratio math).
- [ ] Rung 1 (everyday ratios) runs inside the new shell — port the existing scenarios.
- [ ] Rung 2: formula tiles instead of food; `perProduct` = balanced-equation coefficients; reasoning stays in whole moles.
- [ ] Derive chemical recipes from existing balanced reactions (gated by Phase 0.5).
- [ ] Balancer → rung-2 handoff ("you balanced it — now make product with it").

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
