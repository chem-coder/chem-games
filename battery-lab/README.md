# Battery Lab

Lithium-ion battery technologies section — one trainer per part of the cell.
Hub page: `index.html` (live cards link to trainers; hatched cards are planned).

## Roadmap (approved 2026-08-14)

1. **Full-Cell Builder** — SHIPPED (see below)
2. **Cell Numbers** — SHIPPED (`numbers/`: six typed-answer rungs of cell
   arithmetic, pH-Lab pattern — intro steps → drill with escalating hints)
3. **Typed recall** — SHIPPED: every card game now has a "Typed recall →"
   mode beside its quiz. Shared logic in `shared/js/typed-recall.js`
   (accepted-SET matching, house rule: abbr/name/aliases, never regex;
   normalize collapses case, separators, unicode sub/superscripts; the test
   proves no accepted string names two cards in one deck). Hint ladder:
   family → full name → Show-me (reveals, costs the clean, requeues the card
   flipped to the other question shape). Works on one-card tabs — typing
   needs no distractors.
4. **Electrolyte Additives** and **Electrode Recipe** decks — SHIPPED
   (`additives/`: 11 cards by function — SEI formers incl. PS/DTD/LiNO₃,
   CEI & high-voltage incl. LiDFOB/LiPO₂F₂/ADN, safety incl. TMP/biphenyl;
   `electrode-recipe/`: 9 cards — binders/carbons/collectors+NMP, mixed
   skeletal + schematic figures). Both reuse the full card-game shell:
   shared skeletal renderer, MCQ quiz, typed recall.
5. **Voltage curves**, **degradation chains**, **history timeline** — next

Also shipped outside the numbered lanes (owner request 2026-08-14):
**`potential-ladder/`** — the electrochemistry game. Three rungs: place all
ten species on one V-vs-Li⁺/Li axis (with the carbonate-window cliffs
tinted); half-reactions with corrupted-bookkeeping MCQ decoys + typed
who-does-the-redox questions (Li is only ever the shuttle; Mn⁴⁺ scaffolds
NMC; LMR oxidizes lattice O); collectors & corrosion — Cu-vs-Al duty,
overdischarge Cu dissolution, and the owner's four-step Al-corrosion
mechanism (oxide breakdown → Al oxidation → complex formation →
dissolution) as a step-ordering puzzle. PF₆⁻ reseals with AlF₃; TFSI's
soluble complexes don't — the step-④ story.

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

- **`cell-builder/`** — Full-Cell Builder, the capstone. Two rungs:
  **Diagnose** (12 curated cases, predict works/fails before the reveal) and
  **Build to order** (six customer briefs; open bench with cathode / anode /
  salt / cyclic / linear / optional film-former slots). `js/rules.js` is a
  pure compatibility engine — every rule is a fact the decks teach (LiTFSI+Al
  above 3.7 V, PC vs graphite unless protected, Si needs FEC specifically,
  Li metal needs LiFSI, LNMO fails all carbonates, LiClO₄ vetoed) — so any
  chemically sound build passes: engine-judged, never answer-matched.
  `data/bench.js` is a self-contained roster (no cross-game imports; games
  stay standalone). `js/rules.test.js` brute-forces all 4,320 builds to prove
  every brief has multiple solutions and none is trivial, and re-derives every
  Diagnose verdict from the engine so cards and rules can never disagree.

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
