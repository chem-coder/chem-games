# Battery Lab

Lithium-ion battery technologies section — one trainer per part of the cell.
Hub page: `index.html` (live cards link to trainers; hatched cards are planned).

## Shipped

All three trainers share one flow (study gallery → four-shape MCQ quiz → done) and
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
- **`anodes/`** — Anode Materials: 6 cards (graphite, hard carbon, LTO; Si,
  Sn; Li metal) drawn as **five schematic mechanism archetypes** in the
  cathodes' visual grammar — graphene layers / house-of-cards fragments /
  spinel checkerboard / before-after swelling particle / slab-with-dendrite —
  so intercalation vs alloying vs plating reads at a glance (hosts stay
  rigid, alloys swell, metal has no host). Figure captions teach on study
  cards and are CSS-hidden in quiz figures.
  - `js/fig.js` — pure archetype renderer; `RESEARCH.md` — sources and
    flagged numbers (hard-carbon capacity range, Si/Sn expansion figures,
    Moli recall date).
  - `js/deck.test.js` — deck integrity + within-family option counts
    (the one-card Li-metal tab makes min(4, pool) load-bearing) + per-card
    figure distinctness.

## Planned (placeholders on the hub)

- **Electrolyte Additives** — the additive cabinet by *function* (SEI/CEI
  formers, flame retardants, overcharge shuttles, wetting agents, HF
  scavengers). Scoped 2026-08-14: "additive" here means dissolved in the
  electrolyte before filling — dose ≲5 wt%, job = interface chemistry.
  Requested 2026-08-14.
- **Electrode Recipe** — the electrode-side "additives" that are NOT
  electrolyte components: binders (PVDF/NMP for cathodes, CMC/SBR for
  graphite, PAA for silicon), conductive carbons (Super P, CNTs), current
  collectors (Cu/Al). Added 2026-08-14 after the taxonomy discussion:
  PVDF and nanotubes live here, never in the electrolyte deck.
- **Analytical Methods**, **Solvents Deep Dive** — idea cards.

## Taxonomy ruling (2026-08-14)

The electrolytes deck's third tab is **"Film-formers"** (named by function),
not "Additives" (named by dose-role): VC is a true 1–2 wt% additive, FEC
straddles additive and co-solvent (10–30 % in Si/Li-metal cells), CEC is the
historical proto-additive. All three hold dual membership and also deal into
the Solvents tab wearing a Film-former chip.

## Conventions

Cache-busting `?v=` tags live only in each trainer's `index.html` (importmap +
link/script); bump on deploy. Facts/claims use unicode sub/superscripts in
plain text — `app.js` upgrades them to real `<sub>/<sup>` (house subscript
rule ≥50 % size).
