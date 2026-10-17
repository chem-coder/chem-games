For Claude. Dalia does not need to read this.

## Rules that never change
- Shorter answers. No cutesy lingo. Plain, factual commit messages and copy ("those commit messages ... were infuriatingly hopelessly repulsive").
- Discuss designs with her before coding new screens. Silence is not approval.
- Commit explicit paths only, never `git add -A`. She pushes.
- Particles (atoms, nuclides, electrons) are bubbles, not granite balls — for the entire atomic game.
- Chemistry content is per-language DATA, not translated UI strings. One language toggle, on the home page only.
- Official exam questions are private teaching material only; never in a shipped/paid product.
- SLO matrix: edit the xlsx in place and refresh the CSV with `python3 documentation/slo-matrix/export_csv.py`; never regenerate the xlsx from a script (it would overwrite her edits).
- SLO matrix marks: 1 = essential, 0 = optional (still counts toward gold), blank = not reviewed (the map treats blank as 0). Never fill a mark without a source; leave it blank. Review one chapter at a time, one question at a time.

## Decisions
- 2026-10-15: Repo is private. Cursor GitHub App uninstalled. Live GitHub Pages site is therefore down.
- 2026-10-15: Russian localization: toggle + shared glossary (`documentation/GLOSSARY_EN_RU.md`); Russian brand «Химигра».
- 2026-10-17: Course first, Steam later. Interactive IMAT course on a course platform + PDF chapter guides on Etsy; no video. Plan: `documentation/EDTECH_COURSE_PLAN.md`. Steam ideas kept in `documentation/STEAM_CONCEPT_PARKED.md`.
- 2026-10-17: Course spine = Tro, Chemistry: A Molecular Approach, 5th ed. (Pearson 2019), 26 chapters (supersedes Introductory Chemistry, 19 chapters). Gemini's five-block summary is not the book. Three blocks fundamentals / quantitative / advanced stay hers; chapter blocks are provisional (B1: ch 1,2,8,9,10,11; B2: 3,4,5,7; B3: the rest). Per SLO: understand / do / memorize. Spine of ideas = + and − charges at growing scale.
- 2026-10-17: The outline IS a flat SLO matrix: `documentation/slo-matrix/SLO_MATRIX.xlsx` (+ CSV, `export_csv.py`). One row per SLO, one column per exam/course; new market = insert a column left of the grey sentinel column. Filled from her sources: Tro Intro (CHEM 101 plan), Gen Chem (CHEM 110-111), HESI, IMAT. Blank on purpose: MCAT, AP, A-level, GAMSAT, DAT, IB (each needs its official outline read).
- 2026-10-17: Map design: skill tile tiers ≈ SLOs; 1s = essential to move on, 0s = still available, needed for the gold badge. Gold = everything currently available, one section at a time (first section first). Content versions are supersets, each with its own color (gold, then toxic teal, then toxic lavender); students keep their badge and pass only the delta. Versions only add rows. Version column added, all rows gold. Essential-tile gating reverses the 2026-08-11 no-gating rule: soft vs hard still undecided.
- 2026-10-17: IMAT column rulings: 1 = syllabus, bank, or prerequisite skill. Ch 1 measurement and conservation/physical-chemical rows = 1 (prerequisite). Atomic history, Bohr, orbitals, orbital shapes, effective nuclear charge, resonance = 0. Hybridization = 1 (bank 2025 Q43). Block 1 reviewed with her.
- 2026-10-17: Start the course at the beginning (atomic structure, periodic table), not electrochemistry. IMAT first (one customer).
- 2026-10-17: Track maps now include the Tro track; editable copy `documentation/TRACK_MAPS.drawio` (tabs IMAT, MCAT, Tro).
- 2026-10-17: Ch 3 IMAT ruling (hers, against my suggestion of 0 on combustion): all four composition rows = 1 (percent composition, empirical formula, molecular formula, combustion analysis). Bank evidence: 2 "formula from composition" (2015, 2019), 1 "empirical formula" (2021), no combustion analysis question.
- 2026-10-17: Ch 4 IMAT ruling (hers): evidence of a reaction = 1, combustion equations = 1, thermal energy from amounts of reactants = 0 (matches ch 7 thermochemical equations). HESI = 1 on the five reaction types (hers; PocketPrep list).
- 2026-10-17: Ch 5 IMAT ruling (hers): solution stoichiometry = 1, acid-base titration = 1, precipitation/net ionic = 1, electrolytes = 1, gas-evolution = 1, molarity of each ion = 1, redox products/activity series = 0. Ch 7 IMAT (hers): temperature vs heat = 1.

- 2026-10-17: Ch 6 IMAT ruling (hers): pressure units = 1 (2024 Q43), Dalton = 1 (2024 Q33), kinetic molecular theory = 1 (2018 Q50), gas stoichiometry = 1 (prerequisite), molar volume at STP = 1, real gases = 1. Molar mass/density = 0, speed/diffusion/effusion = 0. Boyle through ideal gas law were already 1.
- 2026-10-17: Ch 12 IMAT ruling (hers): evaporation/condensation/dynamic equilibrium/vapor pressure = 1 (2021 Q43); surface tension, viscosity, capillary action = 0. IMF identification, IMF vs properties, water's properties were already 1.
- 2026-10-17: Ch 13 IMAT ruling (hers): crystalline vs amorphous = 1 (no bank question). The other five ch 13 rows stay 0.
- 2026-10-17: Ch 14 IMAT ruling (hers): freezing point depression/boiling point elevation = 1 (2019 Q41, 2021 Q43, qualitative), molality/mole fraction/ppm = 1 (HESI), Henry's law = 1, osmosis = 0. Mass percent, like dissolves like, saturation were already 1; van't Hoff 0.
- 2026-10-17: Ch 15 IMAT ruling (hers): reaction energy diagram = 1 (2025 Q42, 2026 Q47).
- 2026-10-17: Ch 16 IMAT ruling (hers): K from equilibrium concentrations = 1 (2019 Q43), interpret K and use Q = 1 (2020 Q47, 2023 Q39), ICE tables = 0. Dynamic equilibrium, expressions, Le Chatelier were already 1; Kc/Kp 0.
- 2026-10-17: Ch 17 IMAT ruling (hers): Lewis acids and bases = 1 (2024 Q39), neutralization and acid reactions with metals/metal oxides = 1 (2019 Q49, 2020 Q52).
- 2026-10-17: Ch 21 IMAT ruling (hers): fission/fusion/binding energy = 0, biological effects and medical uses of radiation = 0 (no bank question; the other nuclear rows were already 0). Ch 18, 19, 20 had no IMAT blanks.
- 2026-10-17: Ch 23 IMAT ruling (hers): fats and fatty acids, DNA/RNA and base pairing, enzymes = 1 (consistent with the other biomolecule rows; no bank question on these three). Ch 22 had no blanks.
- 2026-10-17: Ch 26 IMAT ruling (hers): all five blank rows = 0 (ligands, naming coordination compounds, isomerism, crystal field theory, transition metals in biology); no bank question. Ch 24 and 25 had no blanks.
- 2026-10-17: Ch 15 rate law and reaction order from initial-rate data changed 0 to 1 (hers; 2026 Q35).

## Where we left off
Done: SLO matrix built (63f9a2a, branch claude/changes): 240 rows over 26 chapters, Version column, Read me and Coverage sheets, CSV export. Blocks 1 and 2 reviewed with her: ch 1, 2, 8, 9, 10, 11 (block 1) and ch 3, 4, 5, 7 (block 2). No blank IMAT cells left in those chapters. Rulings are in Decisions above. Blanks left on purpose where there is no source (ch 3 HESI composition and naming rows; ch 7 110 on temperature vs heat; ch 7 HESI on KE/PE, system/surroundings, calorimetry, Hess, formation enthalpies).
Block 3 IMAT review COMPLETE: ch 6, 12-17, 21, 23, 26 reviewed with her; ch 18-20, 22, 24, 25 had no IMAT blanks. The IMAT column has no blank cell in any of the 240 rows. Rulings are in Decisions above. Ch 15 rate-law-from-data row changed 0 to 1 (hers; 2026 Q35). Unresolved: platform, public hosting from the private repo, soft vs hard gating, sub-levels per chapter (hers to write).
Next action: ask her what is next (other exam columns stay blank on purpose; MCAT, AP, A-level, GAMSAT, DAT, IB each need the official outline read).
Branch: `claude/changes`, not pushed. Last commit 38a910b (ch 6). Uncommitted: SLO_MATRIX.xlsx, SLO_MATRIX.csv and _for-claude/system.md (ch 12-26 rulings); untracked CLAUDE.md.
