# Battery Lab

Lithium-ion battery technologies section — one trainer per part of the cell.
Hub page: `index.html` (live cards link to trainers; hatched cards are planned).

## Shipped

- **`electrolytes/`** — Electrolyte Components: 13 cards (6 salts, 5 solvents,
  2 additives) as literature-style skeletal-structure flashcards, plus a
  four-shape MCQ quiz (structure→name, name→structure, fact→component,
  component→fact). Misses requeue; distractors prefer the same category.
  - `data/cards.js` — content only: identity, tagline, 3 facts, 2–3 quiz
    claims (each must stay **uniquely true deck-wide** — the test enforces
    it), 3 spec chips, and `mol` drawing data.
  - `js/structures.js` — pure skeletal SVG renderer (zig-zag bonds, labeled
    heteroatoms, symmetric/ring double bonds, wedge & hash). First skeletal
    renderer in the repo; consider promoting to `shared/` if organic games
    want it.
  - `js/quiz.js` — pure question generator; `js/quiz.test.js` runs with
    `node --test` (deck integrity + option validity + renderer smoke test).
  - `js/app.js` — controller (study gallery → quiz → done), house navigation.

## Planned (placeholders on the hub)

- **Cathode Materials** — draft deck already written at
  `cathodes/data/cards.draft.js` (8 cards: LCO, NMC, NCA, Li-rich; LMO, LNMO;
  LFP, LMFP) with flagged uncertainties in `cathodes/RESEARCH.md`. Structures
  here are crystal lattices (layered / spinel / olivine), so the game needs a
  lattice illustration approach instead of the skeletal renderer.
- **Anode Materials** — graphite, silicon, hard carbon, LTO, Li metal.
- **Additives** — full additive cabinet beyond VC/FEC (SEI/CEI formers, flame
  retardants, overcharge protectors, wetting agents). Requested 2026-08-14.
- **Analytical Methods**, **Solvents Deep Dive** — idea cards.

## Conventions

Cache-busting `?v=` tags live only in each trainer's `index.html` (importmap +
link/script); bump on deploy. Facts/claims use unicode sub/superscripts in
plain text — `app.js` upgrades them to real `<sub>/<sup>` (house subscript
rule ≥50 % size).
