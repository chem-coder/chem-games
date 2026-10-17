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
- 2026-10-17: Added Russian exam columns ОГЭ and ЕГЭ (Q, R), right of IB Chem, left of the grey sentinel; Coverage rows 12-13 added; all cells blank (not reviewed, no source read yet). Blank-on-purpose list is now MCAT, AP, A-level, GAMSAT, DAT, IB, ОГЭ, ЕГЭ.
- 2026-10-17: ЕГЭ column rule (hers): a row with no КОДИФ line stays blank, no prerequisite 1s. Ch 1 ЕГЭ (hers): atoms/molecules = 1, element/compound/mixture = 1, conservation of mass = 1, scientific method = 0; the other 12 rows blank (measurement, units, sig figs, states of matter, physical/chemical change, matter vs mass vs weight).
- 2026-10-17: Ch 2 ЕГЭ (hers, as proposed): 8 marks (conservation/Dalton row = 0, the rest 1); Thomson/Rutherford, composition-law quantities, atomic mass from abundances blank. Ch 3 ЕГЭ (hers): all 19 rows = 1, including the English naming-system rows (Greek prefixes, acid -ate/-ic, choosing a system): nomenclature is a valid ЕГЭ topic, so those rows get a Russian-convention version of the nomenclature trainer (per-language DATA, see localization rule).
- 2026-10-17: Ch 4 ЕГЭ (hers): all 11 rows = 1, including evidence of a reaction (her reason: everyone should be able to tell whether a reaction occurred; weak codifier line, req. 13 / 2.5 only).
- 2026-10-17: Ch 5 ЕГЭ (hers): 13 marks. Memorize solubility rules = 0 and molarity of each ion = 0 (СПЕЦ: solubility table and electrochemical series are provided on the exam); acid-base titration blank (not in КОДИФ); the other 11 rows = 1.
- 2026-10-17: Ch 6 ЕГЭ (hers): Avogadro's law, gas stoichiometry, molar volume at STP = 1; the other 10 rows blank (no КОДИФ line), including the ideal gas law rows.
- 2026-10-17: Ch 7 ЕГЭ (hers): exo/endothermic and enthalpy, thermochemical equations = 1; the other 10 rows blank, including Hess's law and enthalpy of formation (КОДИФ 5.2 names the calculation, not the method).
- 2026-10-17: Ch 8 ЕГЭ (hers): quantum-mechanical model/orbitals, orbital shapes (her call, IMAT has 0), orbital diagrams, configurations, ion configurations/Cr-Cu, valence/core electrons = 1; EM radiation, spectrum, Bohr, de Broglie, quantum numbers blank. Gap noted: no matrix row for ground vs excited state (КОДИФ 1.1, req. 5).
- 2026-10-17: Added matrix row 108 (ch 8, hers): "Distinguish the ground and excited states of an atom." Type Do, ЕГЭ = 1, other exam columns blank, Source "ЕГЭ КОДИФ 1.1; req. 5", Version gold. Matrix is now 242 rows (second added row: ch 14 "Describe crystal hydrates (for example CuSO4·5H2O) and do calculations with them.", Do, ЕГЭ = 1, Source "ЕГЭ КОДИФ 1.11", after the mass-percent row). Rows missing for ЕГЭ topics outside Tro are added the same way (insert inside the chapter, fix Count formulas, conditional-format ranges and filter).
- 2026-10-17: Ch 9 ЕГЭ (hers): 8 marks. 1 = valence electrons, radius trends, metallic character, ion charge from group, properties of the element families; 0 = ionization energy, electron affinity, isoelectronic sizes (her instruction: do not leave these blank; checked online, Решу ЕГЭ has atomic-radius ranking tasks and, per a search snippet not confirmed by fetching the page, one ionization-energy ranking task; no ЕГЭ task found on electron affinity or isoelectronic radii; ДЕМО/СПЕЦ show none of them). Effective nuclear charge row left blank (no line).
- 2026-10-17: ЕГЭ rule CHANGE (hers), from ch 10 on: a row with no КОДИФ line gets 0, not blank. Ch 1-9 keep their blanks as they are (not converted). Ch 10 ЕГЭ (hers): lattice energy/Born-Haber, resonance, formal charge, bond length/order/energy = 0; the other nine rows = 1.
- 2026-10-17: Ch 11 ЕГЭ (hers): hybridization and sigma/pi = 1; VSEPR shapes, bond angles, molecular polarity, MO theory = 0.
- 2026-10-17: Ch 12 ЕГЭ (hers): IMF identification, IMF vs properties, water/hydrogen bonding = 1; the other five rows = 0.
- 2026-10-17: Ch 13 ЕГЭ (hers): solid classification and ceramics/polymers/composites/nanomaterials = 1; crystalline vs amorphous, unit cells, density from unit cell, band theory = 0.
- 2026-10-17: Ch 14 ЕГЭ (hers): saturated/unsaturated/solubility and mass percent = 1; the other six = 0. Gap noted: no matrix row for crystal hydrates (КОДИФ 1.11).
- 2026-10-17: Ch 15 ЕГЭ (hers): rate definition, factors, catalyst/enzymes = 1; rate law from initial-rate data, integrated rate laws, Arrhenius, mechanisms, energy diagram = 0.
- 2026-10-17: Ch 16 ЕГЭ (hers): dynamic equilibrium, K with ICE tables (demo task 23 tests the table method without K), Le Chatelier (demo task 22) = 1; expressions, K from concentrations, Q, Kc/Kp = 0.
- 2026-10-17: Ch 17 ЕГЭ (hers): acids/bases and properties, strong vs weak, Kw, pH/pOH, neutralization and reactions with metals/oxides, pH of strong acids/bases, salt hydrolysis = 1; Arrhenius/Bronsted-Lowry pairs, Lewis, Ka/Kb and percent ionization, Ka x Kb = Kw, polyprotic = 0.
- 2026-10-17: Ch 18 ЕГЭ (hers): all eight rows = 0 (buffers, titration curves, Ksp, Kf; hydroxo complexes of Zn/Al are tested only as equations, not in a matrix row).
- 2026-10-17: Ch 19 ЕГЭ (hers): all six rows = 0 (entropy, Gibbs energy; КОДИФ 1.7 stops at heat effects).
- 2026-10-17: Ch 20 ЕГЭ (hers): redox balancing, galvanic cell (her call; codifier lists only electrolysis), electrolysis/Faraday = 1; cell notation, E-DeltaG-K, Nernst, batteries/fuel cells, corrosion = 0.
- 2026-10-17: Ch 21 ЕГЭ (hers): all five rows = 0 (nuclear chemistry not in КОДИФ).
- 2026-10-17: Ch 22 ЕГЭ (hers): all eight rows = 1 (organic basics; amides in the functional-group row and optical isomers in the isomer row are outside КОДИФ).
- 2026-10-17: Ch 23 ЕГЭ (hers): biomolecule classes, amino acids/proteins, saccharides, fats = 1; DNA/RNA and enzymes = 0.
- 2026-10-17: Ch 24 ЕГЭ (hers): all six rows = 1 (hydrogen and ozone are not named in КОДИФ 2.3 but are kept).
- 2026-10-17: Ch 25 ЕГЭ (hers): all four rows = 1 (alloys kept via КОДИФ 4.4 metallurgy).
- 2026-10-17: Ch 26 ЕГЭ (hers): transition-metal configurations, complex ions, naming/formulas of complexes (КОДИФ 7.3 names only Zn/Al hydroxo complexes) = 1; coordination isomerism, crystal field theory, metals in biology = 0. ЕГЭ column now covers all 26 chapters.

## Where we left off
Done: SLO matrix (242 rows, 26 Tro chapters) has no blank IMAT cell; all rulings are in Decisions. Committed cf463dd (block 3) on top of 38a910b. Added empty columns ОГЭ (Q) and ЕГЭ (R) with Coverage rows 12-13; CSV checked identical apart from the two new columns. Her ЕГЭ 2026 files are in `_teaching-materials/ФИПИ_Химия_hi_11_2026/` (gitignored): `ХИ-11 ЕГЭ 2026 КОДИФ.pdf` (codifier), `СПЕЦ.pdf` (specification), `ДЕМО.pdf` (demo paper). No ОГЭ file yet.
ЕГЭ column: ch 1-26 done (all chapters). Blanks remain only in ch 1-9 (no-line rows before the 0 rule: ch 1 x12, ch 2 x3, ch 5 x1, ch 6 x10, ch 7 x10, ch 8 x5, ch 9 x1). Not yet decided: convert those blanks to 0; add ЕГЭ rows for topics outside Tro (organic reactions by class, descriptive metal/nonmetal chemistry, qualitative reactions, genetic links); ОГЭ column.
Open: fill the ЕГЭ column. Unresolved: ОГЭ source file, platform, public hosting from the private repo, soft vs hard gating, sub-levels per chapter (hers to write).
Next action: read the КОДИФ with `pdftotext -layout` (poppler), then ch 1 first: show its rows, propose a ЕГЭ mark with the codifier line as evidence, she rules. One chapter at a time, one question at a time; no codifier line = blank. Then ОГЭ, which is mostly a subset of ЕГЭ.
Branch: `claude/changes`, not pushed. Uncommitted: SLO_MATRIX.xlsx, SLO_MATRIX.csv (new ОГЭ/ЕГЭ columns) and _for-claude/system.md; untracked CLAUDE.md.
