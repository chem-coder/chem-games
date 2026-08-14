# Anode deck — draft research notes

Shipped content lives in `data/cards.js`. All potentials vs Li⁺/Li unless
marked otherwise; practical numbers carry "~" where sources vary.

## Card list rationale

Six cards, three storage mechanisms — the deck teaches mechanism → property,
so every card carries its mechanism's signature trade-off:

- **Intercalation: graphite, hard carbon, LTO.** The commercial spine.
  Graphite carries the staging / plating-risk / SEI story (cross-link to the
  electrolytes deck's EC card). Hard carbon carries the disorder story and two
  history hooks: Sony's pre-graphite cells (PC tolerance) and today's
  sodium-ion default. LTO is the deliberate opposite corner: high potential
  buys zero SEI, zero plating, zero strain — and costs energy.
- **Alloying: silicon, tin.** Silicon is the present frontier (10× capacity,
  300 % swelling, 5–10 % blends, FEC dependence — second electrolytes-deck
  cross-link). Tin is the historical proof alloying can ship (Nexelion 2005).
- **Li metal: lithium metal.** One card, deliberately alone in its family:
  no host is the whole point. Carries the Moli Energy origin story of why
  "lithium-ion" exists, and the three revival routes.

Quiz `claims` were cross-checked pairwise — plating risk, near-0 V operation,
huge capacity, and big swelling are shared across cards, so every claim leans
on a genuinely unique hook (90 % market share, staging/gold, LiC₆
stoichiometry, 3000 °C, sodium-ion, PC tolerance, 1.55 V no-SEI, zero-strain,
SCiB, 10×/3579, 300 %, FEC blends, Nexelion, Li₄.₄Sn/990, 260 %, −3.04 V SHE,
Moli recall, no-host 3860).

## Flagged uncertainties (verify before shipping)

1. **Hard carbon capacity "~250–350 mAh/g (vs Li)"** — literature spans
   ~200–600 mAh/g depending on precursor and pyrolysis temperature; the chip
   states a common commercial-grade range. Sodium capacities (typically
   ~300 mAh/g) are a separate number the card deliberately does not quote.
2. **Hard carbon storage mechanism** — the card presents the mainstream
   two-mode picture (sloping = between fragments, low plateau = nanopore
   filling). The assignment of slope vs plateau is still debated
   ("adsorption–intercalation" vs "intercalation–pore-filling" models);
   the two-mode split itself is safe.
3. **Graphite ~90 % anode market share** — commonly cited (graphite incl.
   natural + synthetic); the number erodes slowly as Si blending grows.
   "Roughly 90 %" is honest for 2024–2026.
4. **Graphite average potential ~0.1 V** — the staging plateaus sit near
   0.22 / 0.12 / 0.09 V; ~0.1 V is the usual headline average.
5. **Graphite ~10 % volume change** — sources give 10–13 % for full
   lithiation to LiC₆; chip keeps "~10 %".
6. **Silicon 3579 mAh/g (Li₁₅Si₄)** — the room-temperature figure used
   throughout; the older 4200 mAh/g headline belongs to high-temperature
   Li₂₂Si₅ and is deliberately avoided. Average potential "~0.4 V" is a
   delithiation-weighted average; lithiation runs lower.
7. **Silicon ~300 % expansion** — sources give 280–400 % depending on end
   phase and measurement; ~300 % is the standard teaching number.
8. **Tin Li₄.₄Sn ~990 mAh/g** — 990–994 mAh/g depending on rounding
   (Li₂₂Sn₅ = Li₄.₄Sn); ~260 % expansion is variously reported 250–300 %.
9. **Moli Energy recall date** — the fires and recall are 1989 (NEC phones in
   Japan; Li-metal/MoS₂ cells); some accounts say "late 1980s" loosely. Card
   commits to 1989.
10. **LTO gassing** — real and cited (H₂/CO/CO₂ from surface reactions with
    electrolyte at elevated temperature); mechanism details vary by paper, so
    the fact names the problem without a mechanism.
11. **"Tens of thousands of cycles" for LTO** — Toshiba quotes 15,000–20,000+
    full cycles for SCiB; "tens of thousands" is the defensible phrasing.
12. **Li metal −3.04 V vs SHE** — standard-potential textbook value
    (−3.040 V); "most negative practical electrode" excludes exotic
    couples with no electrode use.

## What the mechanism figures must show

Five archetype drawings (`fig.kind`), same visual grammar as the cathode
lattices (one projection style, motion arrows, caption strip hidden in quiz):

- **layers (graphite):** long parallel graphene sheets, Li in the galleries,
  arrow entering from the edge — intercalation into an ordered host.
- **house (hard carbon):** short fragments at odd angles, Li both between
  fragments and clustered in nanopores — same mechanism, disordered host.
- **spinel (LTO):** TiO₆/Li checkerboard with three-direction arrows —
  a 3D host that barely moves (caption carries the 1.55 V cue).
- **alloy (Si, Sn):** before/after particle pair — pristine circle, "+ Li⁺"
  arrow, swollen cracked circle. Si swells more with more cracks; Sn swells
  slightly less and carries Co–C matrix dots (Nexelion).
- **metal (Li):** bare slab, Li⁺ plating arrows, dendrite spike growing
  toward a dashed separator line.

The intercalation / alloying / plating contrast across the archetypes is the
load-bearing visual idea — hosts stay rigid, alloys swell, metal has no host
at all.
