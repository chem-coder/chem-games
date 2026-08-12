# The Chem Games Universe — Chapters, Topics, and Tracks

**Status:** draft approved in discussion (2026-08-12); implementation not started.
**Owner:** Dalia (content, game ideas, final word) · Claude (architecture, drafts, code).
**Relationship to `PRODUCT_STRATEGY.md`:** this doc organizes the *web library*. The Steam product remains a separately packaged bundle per the strategy doc; the universe is the substrate both draw from.

## The idea in one paragraph

One track-agnostic **universe** of chemistry content, three levels deep: **Chapters** (sections on the main page) contain **Topics** (cards; each opens its own topic screen) which contain **Ladder tabs** (a progressive walk through the topic — each tab shows an explanation card built from Dalia's own diagrams, with buttons to that tab's games/quizzes at the bottom). **Tracks** (IMAT, MCAT, Gen Chem 110–111, CHEM 101/Tro, Organic basics) are guided pathways over the same universe — each walks the chapters in its own order and emphasis. Nothing is ever dropped or de-emphasized because one exam ignores it.

## Decisions log

| Date | Decision |
|---|---|
| 2026-08-11 | Universe + tracks architecture; IMAT track first (Malcolm = student **and** proof of concept; exam ~**Sept 21, 2026**) |
| 2026-08-11 | No gating, ever — navigation structure only (see `library-first-then-organize` reasoning) |
| 2026-08-11 | URLs are not load-bearing; only the home-page link matters to users |
| 2026-08-12 | 18 topics = IMAT syllabus-13 + organic split in three + Thermochemistry + Electrochemistry + Measurement & Units |
| 2026-08-12 | Hierarchy: Chapter → Topic → Ladder tabs |
| 2026-08-12 | "Chemical bond" splits into **three** topic cards (bonds / shape & polarity / IMFs) |
| 2026-08-12 | Mole & % composition are *quantitative* → live in Stoichiometry chapter, not Compounds (Dalia's call) |
| 2026-08-12 | Main page organized by content **chapters**; learning-type (memorize / solve / understand) becomes a card **badge**, later a filter |
| 2026-08-12 | Name: **CHEM GAMES** *&Quizzes* — see Branding below |
| 2026-08-12 | IMAT track order approved as drafted ("OK for now") |
| 2026-08-12 | **Bonding & Structure game: build a first version before Malcolm's exam.** Dalia: "It will be easier for me to edit it once it exists, so we should try." |
| 2026-08-12 | Atoms & the Periodic Table rolls out **early** — PT Memorizer already splits the table into element sets; Atomic Structure remains its own separate card |
| 2026-08-12 | OU/CHEM1315–1415 materials get mined, starting with 1315 Exam 1; content is markedly **harder** than IMAT/Heritage → feeds the *advanced bands*, never the entry rungs |

**Mechanism:** one shared, data-driven topic-screen template (JS + CSS in `shared/`), fed by a per-topic data file (label, tabs, card content, game links). The Gas Laws landing (`chem-gas-laws/index.html`) is the prototype and first migration target. Done screens everywhere already link back to intro + home (navigation retrofit, merged 2026-08-12).

## The chapters

Sections numbered for reference only — the main page shows names, not numbers. *(games in italics; § = Dalia's CHEM 110 section numbers, her materials in `_teaching-materials/`)*

### 1 · Matter & Measurement
- **Matter** — states & classification (§1.1–1.2) · matter and energy (§1.3)
- **Measurement & Units** — SI units & temperature (§1.5) · significant digits (§1.6) · dimensional analysis (§1.7) · density (§1.8) — *Conversion Conveyor, Conversion Builder*

### 2 · Atoms & the Periodic Table
- **Atomic Structure** — symbols & atomic history (§2.1–2.3) · subatomic particles, isotopes, ions (§2.4) · atomic masses (§2.5) · electrons: Bohr → orbitals → configurations (§8.1–8.7, advanced band)
- **The Periodic System** — reading the table (§2.6) · valence electrons (§9.1) · periodic trends (§9.2–9.3) — *Periodic Table Memorizer; oxidation-states reference page*

### 3 · Compounds & Naming
- **Formulas & Ions** — chemical formulas (§3.1) · ionic formulas & criss-cross-as-verification (§3.3)
- **Inorganic Nomenclature** — binary (§3.2) · ionic (§3.4) · acids (§3.5) · review (§3.6); the existing 5-level Name Builder ladder maps 1:1 — *Ion Trainer, Name Builder*

### 4 · Reactions & Stoichiometry
- **The Mole & Composition** — the mole (§3.7) · molar mass (§3.8) · percent composition (§3.9) · empirical & molecular formulas (§3.10–3.11)
- **Equations & Reaction Types** — balancing (§4.1) · reaction types (§4.2) · aqueous reactions & net ionic (§4.3–4.5) — *Visual Equation Balancer*
- **Stoichiometry** — mole ratios (§5.1) · mass calculations (§5.2) · limiting reagents (§5.3) · percent yield (§5.4) · molarity & titration (§5.5–5.8, cross-links Solutions) — *Ratio Factory*

### 5 · Bonding & Structure
- **Ionic & Covalent Bonds** — ionic bonding & lattice (§9.4–9.5) · covalent bonds (§10.1) · electronegativity & the bonding continuum (§10.5)
- **Molecular Shape & Polarity** — Lewis structures (§10.2; "How to Draw Lewis Structures" handout) · resonance & octet exceptions (§10.3–10.4, advanced) · VSEPR shapes (§11.1; "Molecular Geometry" worksheets + KEY) · molecular polarity (§11.2)
- **Intermolecular Forces** — the forces & hydrogen bonding (§12.1; Intermolecular Bonds worksheet, H-bond.jpeg) · IMFs → boiling points (§12.2–12.4) · liquids & solids (§12.5–12.7, advanced)

*IMAT note: this chapter is the heaviest exam topic (21/169 tagged questions) with zero games. The tested reasoning chain is shape → polarity → IMF → boiling point. First game candidate after the reorganization.*

### 6 · Gases & Solutions
- **Gas Laws** — pressure (§7.1) · Boyle (§7.2) · **Charles (§7.3 — game live)** · combined & Avogadro (§7.4–7.5) · ideal gas law (§7.6) · partial pressures & KMT (§7.7, §7.10, advanced) — landing page already built
- **Solutions** — the solution process & saturation (§13.1–13.2) · concentration units (§13.3) · dilutions · colligative properties (§13.4–13.5, advanced)

### 7 · Energy & Change
- **Thermochemistry & Thermodynamics** — energy, heat, work (§6.1–6.3) · enthalpy (§6.4, 6.7) · specific heat & calorimetry (§6.5–6.6) · ΔH°f (§6.8) · entropy & Gibbs (Ch 18, advanced band)
- **Kinetics** — rates & collision theory · rate laws · integrated rate laws (Ch 14 worksheets + keys)
- **Equilibrium** — the concept · K expressions · Le Châtelier (Ch 15 worksheets + keys)

### 8 · Acids & Bases
- **Acid/Base Concepts** — definitions · strong vs weak · neutralization ("4 Acids and Bases in Water" + ANSWERS) — *Acid/Base Sorter*
- **pH & the K_w-Box** — pH Lab's six rungs are the ladder, as shipped — *pH Lab* (K_Boxes.pdf, K_Box1/2.png = canonical visuals)
- **Aqueous Equilibria** — salts & hydrolysis · buffers · titrations (Titration-ICF diagrams) · K_sp (Ch 17 materials, Ka/Kb/Ksp data tables)

### 9 · Redox & Electrochemistry
- **Oxidation States & Redox** — the Ox-State Trainer's four tiers are the ladder (elements & ions / molecules / polyatomic ions / half-reactions) + predicting redox products (§4.6–4.7) — *Oxidation-State Trainer*
- **Electrochemistry** — galvanic cells (Blank_Electrochemical_Cell.png/pptx) · potentials (data tables) · electrolysis — empty; not on the IMAT track

### 10 · Organic Chemistry
- **Structure & Isomerism** — carbon bonding · molecular/condensed/skeletal formulas · isomerism — *Builder sandbox*
- **Organic Nomenclature** — the nine shipped rungs are the ladder — *Organic Nomenclature*
- **Organic Reactions** — addition · elimination · substitution · carbonyls · Markovnikov — *Reactions Lab* (IMAT: essentially dead post-2014, lowest priority)

### 11 · Beyond the Core *(placeholder — no cards yet)*
Nuclear (Ch 20) · Coordination chemistry (Ch 22) · Spectroscopy 101 (someday)

## Tracks

**IMAT (priority — Malcolm, exam ~Sept 21, 2026).** Triage order over existing games; chapters 1–10 skipping thermo/electrochem/nuclear: matter → atomic structure → periodic system → **bonding & structure (no game — gap)** → inorganic nomenclature → measurement/units → stoichiometry → solutions → gas laws → equilibria → **acids & bases** → kinetics (skim) → redox (ox numbers only) → organic structure → organic nomenclature → organic reactions (optional). Time-short cut: Big Three (bond, stoichiometry, acids-bases) + atomic/periodic + redox ≈ 85% of the tagged bank.

**CHEM 110–111** = Dalia's unit order nearly verbatim. **CHEM 101 (Tro)** = same arc, lighter tab depth (HU Course Plan in Notes/). **MCAT** = everything incl. thermo & electrochem. **Organic basics** = chapter 10 expanded. All future; tracks are thin data (an ordered list of topic ids + emphasis), built after the universe screens exist.

## Branding

Main name: **CHEM GAMES** (also acceptable as chem-games / Chem-Games / ChemGames), with ***&Quizzes*** as a deliberate "afterthought" — much smaller font, italic **and** bold, placed to the lower right of GAMES, may slightly overlap. Logo is vertically stacked: CHEM on top, GAMES underneath — or "Chem" on top fitting inside the "ames" of "Games" below. Track modules get their own cover treatment: the track name in HUGE block letters (IMAT, MCAT, AP — possibly APChem with "AP" nested inside the "hem" of "Chem") with the ChemGames logo small in the corner. *(Dalia's design, 2026-08-12 — treat as the spec for the main-page masthead and future track pages.)*

## Rollout

1. Topic-screen template + data format in `shared/`; migrate Gas Laws onto it.
2. **Atoms & the Periodic Table** — early, per Dalia: the PT Memorizer already splits the table into element sets; add a card/tabs for practicing properties of the elements. Atomic Structure (protons/neutrons/electrons, isotopes, ions, electron configurations, orbital diagrams) is its own separate card and can come later.
3. Richest chapters next: Acids & Bases, Reactions & Stoichiometry, Compounds & Naming.
4. **Bonding & Structure** — screens *and* the new game (see decisions log: first version before Malcolm's exam, Dalia edits from there).
5. Redox, Organic, remaining thin/empty topics; then rewire the main page into chapter sections with the CHEM GAMES *&Quizzes* masthead and learning-type badges.
6. Tracks as data overlays; IMAT first.

## OU materials mining plan (CHEM 1315/1415)

Each course: 8 **units** (not textbook chapters — confirmed from the course's own exam index), 4 exams with rolling coverage — E1: units 1–2 · E2: units 1–4 · E3: units 3–6 · E4: units 5–8. **E1 mined 2026-08-12 → see `OU_MINING.md`**: ~200 keyed items (plus ~200 more in the E2 papers' unit-1/2 halves), spanning universe chapters 1–4 + Solutions; an OU question bank with stable item IDs already exists behind the papers. **Caveat from Dalia: this material is a lot harder than anything from the IMAT or Heritage** — it feeds the advanced bands of the ladders (and eventually the MCAT track), never the entry rungs.

## Open items

- Bonding & Structure game design — needs Dalia's game idea + materials session before the first version is built (her content, my scaffolding; build window is before ~Sept 21).
- Logo/masthead implementation — CSS realization of the Branding spec, for Dalia's visual approval.
- OU mining — begin with 1315 E1 per the plan above.
