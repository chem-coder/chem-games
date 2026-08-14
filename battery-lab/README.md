# Battery Lab

Lithium-ion battery technologies section — one trainer per part of the cell.
Hub page: `index.html` (live cards link to trainers; hatched cards are planned).

## Shipped

Both trainers share one flow (study gallery → four-shape MCQ quiz → done) and
one pure question generator, `shared/js/mcq-quiz.js` (structure→name,
name→structure, fact→component, component→fact; misses requeue with fresh
options; distractors prefer the same category). Quiz `claims` in any deck must
stay **uniquely true deck-wide** — the tests enforce it.

- **`electrolytes/`** — Electrolyte Components: 13 cards (6 salts, 5 solvents,
  2 additives) as literature-style skeletal-structure flashcards.
  - `data/cards.js` — content: identity, tagline, 3 facts, 2–3 claims,
    3 spec chips, `mol` drawing data.
  - `js/structures.js` — pure skeletal SVG renderer (zig-zag bonds, labeled
    heteroatoms, symmetric/ring double bonds, wedge & hash). First skeletal
    renderer in the repo; consider promoting to `shared/` if organic games
    want it.
  - `js/quiz.test.js` — `node --test`: deck integrity + engine + renderer.
- **`cathodes/`** — Cathode Materials: 8 cards (LCO, NMC, NCA, LMR; LMO,
  LNMO; LFP, LMFP) drawn as **three schematic lattice archetypes** in one
  projection style — layered slabs / spinel checkerboard / olivine tunnels —
  whose diffusion arrows carry the 2D / 3D / 1D contrast, with per-card
  overlays (NMC cation mixing, NCA Al pin, LMR excess Li, LNMO 1-in-4 Ni,
  LFP antisite block, LMFP two-tone). Lattice captions teach on study cards
  and are CSS-hidden in quiz figures so they can't give answers away.
  - `js/lattice.js` — pure archetype renderer; `RESEARCH.md` — sources and
    flagged numbers (market-share and LMR-capacity flags now fixed in data).
  - `js/deck.test.js` — deck integrity + per-card overlay distinctness.

## Planned (placeholders on the hub)

- **Anode Materials** — graphite, silicon, hard carbon, LTO, Li metal.
- **Additives** — full additive cabinet beyond VC/FEC (SEI/CEI formers, flame
  retardants, overcharge protectors, wetting agents). Requested 2026-08-14.
- **Analytical Methods**, **Solvents Deep Dive** — idea cards.

## Conventions

Cache-busting `?v=` tags live only in each trainer's `index.html` (importmap +
link/script); bump on deploy. Facts/claims use unicode sub/superscripts in
plain text — `app.js` upgrades them to real `<sub>/<sup>` (house subscript
rule ≥50 % size).
