# Cathode deck — draft research notes

Draft content lives in `data/cards.draft.js` (`window.LIB_CATHODES_DRAFT`), schema-matched to the electrolytes deck.

## Card list rationale

Eight cards, three structural families — the deck teaches structure → property, so every card carries its diffusion dimensionality:

- **Layered (2D): LCO, NMC, NCA, LMR.** The historical spine (LCO 1980) through the commercial present (NMC/NCA) to the research frontier (LMR anion redox). NMC is one family card — the 111→532→622→811 progression is itself the lesson (cobalt cost/ethics driving nickel-rich), and separate cards per grade would create claim collisions.
- **Spinel (3D): LMO, LNMO.** LMO carries the Jahn–Teller / Mn-dissolution story; LNMO carries the high-voltage / electrolyte-stability tension — a natural cross-link to the electrolytes deck.
- **Olivine (1D): LFP, LMFP.** LFP is the richest card (two-phase flat plateau, carbon-coating rescue, safety, Blade/market story); LMFP is the current industrial move.

Conventions: all voltages **vs Li⁺/Li** (chips say so). Spec chips carry **practical** capacities; facts contrast theoretical where it teaches (LCO 274, LFP 170 implied by "~160 practical"). Quiz `claims` were cross-checked pairwise — cobalt-free, Ni-rich, Mn-containing, and carbon-coated traits are shared across cards, so every claim leans on a genuinely unique hook (Sony 1991, ratio naming, Al dopant, activation plateau, Mn-only couple, 4.7 V, flat single plateau, dual staircase).

## Flagged uncertainties (verify before shipping)

1. **Thermal-runaway onsets** vary strongly with state of charge, format, and measurement method. LFP ~270 °C and Ni-rich ~200 °C are commonly cited mid-range values; some sources give LCO onset as low as ~150 °C and NMC811 lower than 200 °C. Ranking (LFP most benign) is solid; exact numbers are "~".
2. **LFP global market share ~40%** — true by GWh around 2023–2024 (well above 60% within China); the number moves fast. "Roughly half of new EVs" in the tagline is looser still — soften if she red-pens it.
3. **Carbon-coating attribution** — credited to Ravet, Armand et al. (1999, Hydro-Québec/Université de Montréal); Nazar's conductive-phosphate report and Goodenough's group also figure in the history, and priority was litigated. The card keeps it to Ravet/Armand as the standard citation.
4. **CATL M3P** — CATL describes it as a phosphate of "M3" metals (reported Mg/Zn/Al doping), i.e., LMFP-adjacent rather than strictly LiMn₁₋ₓFeₓPO₄. Card says "LMFP-type phosphate", which is defensible.
5. **Nissan Leaf (2011) pack** — LMO-based blended with a layered oxide (AESC); exact blend partner is variously reported (NCA or NMC). Card says "blended with layered oxide" to stay safe.
6. **LCO doped high-voltage grades** — modern 4.45–4.5 V LCO at ~165–185 mAh/g is real (smartphone cells) but numbers vary by supplier.
7. **LMR practical capacity 250–300 mAh/g** — the high end is lab-condition; 250 is the honest headline. Average voltage ~3.6 V is a sloping-curve average, not a plateau.
8. **NCA composition** — classic 0.8/0.15/0.05 shown in formulaHtml; current Tesla/Panasonic cells run higher Ni and less Co. The formula is the textbook one.
9. **Subscript typography** — plain-text facts use unicode subscripts for integer stoichiometry (LiFePO₄) but decimal compositions (Ni₀.₅Mn₁.₅) have no unicode subscript period; I wrote e.g. "LiNi0.5..." only inside formulaHtml where `<sub>` handles it, and avoided decimal formulas in plain text where possible. House subscript-size rule applies when rendering.

## What the structure illustrations must show

Three archetype drawings, one per `lattice.kind`, plus a small per-card overlay:

- **Layered (O3, R-3m):** stacked slabs of edge-sharing MO₆ octahedra with flat Li planes between; diffusion arrows confined to the 2D plane. Overlays: LCO = clean Co slab; NMC = three-tone slab + one Ni sitting in the Li plane (cation mixing); NCA = mostly-Ni slab with one highlighted Al octahedron ("pin"); LMR = plan view of a slab showing the honeycomb LiMn₆ ordering (C2/m domain).
- **Spinel (Fd-3m):** Mn₂O₄ framework (16d octahedra) with Li on tetrahedral 8a sites; 3D interconnected 8a–16c–8a channels — arrows in three directions, deliberately contrasting the layered 2D picture. Overlay for LNMO: one in four octahedra recolored Ni (optionally the ordered P4₃32 pattern).
- **Olivine (Pnma):** FeO₆ octahedra braced by PO₄ tetrahedra, Li in 1D channels along [010]; single-direction arrows. Overlays: LFP = an Fe antisite defect plugging a channel; LMFP = two-tone Mn/Fe octahedra.

The 2D / 3D / 1D arrow contrast across the three drawings is the load-bearing visual idea — keep the three archetypes in the same projection style so the dimensionality difference reads at a glance.
