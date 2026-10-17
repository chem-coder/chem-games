# Track Maps — business process, IMAT tree, MCAT tree

**Status:** drafts from discussion (2026-10-03); arrows are Claude's prerequisite guesses, awaiting Dalia's red pen.
**Relationship to `TOPIC_UNIVERSE_PLAN.md`:** that doc defines the 18-topic universe and its chapters. This doc draws *pathways over it*: the order in which a track walks the topics, and the business process that turns each topic into product.

Diagrams are Mermaid; GitHub renders them inline.

---

## 1 · The business process

Four steps: create the product → first dollar → more customers → expand. Everything in the loop at the top is step 1. "Ready" is drawn as a box on purpose: it gets a written definition *before* the build gets tedious, so a later anxious self can't move the line.

The three things built per unit of work are the same three things sold: game → Steam, PDF sheet → Etsy, question bank → own website.

```mermaid
flowchart TD
    U[One topic, one question<br/><i>the unit of work</i>]
    U --> G[Game<br/><i>builds the skill</i>]
    U --> P[PDF study sheet<br/><i>content now, Canva later</i>]
    U --> Q[Question bank entry<br/><i>answer, why, game link</i>]
    G --> T[Topic complete<br/><i>↻ next topic, until all 16</i>]
    P --> T
    Q --> T
    T --> B[Canva booklet<br/><i>sheets become a book</i>]
    T --> E[Gamification engine<br/><i>across all games</i>]
    T --> C[Bank CSS cleanup<br/><i>by topic, by year</i>]
    B --> R{Ready<br/><i>define it now, not later</i>}
    E --> R
    C --> R
    R --> S[Steam<br/><i>the game, ~$20</i>]
    R --> Y[Etsy / Amazon<br/><i>PDFs, maybe print</i>]
    R --> W[Own website<br/><i>the full package, up to ~$300</i>]
    S --> D[First dollar<br/><i>the real breaking point</i>]
    Y --> D
    W --> D
    D --> M[More customers<br/><i>Instagram 90-day ramp</i>]
    M --> X[Expand the line<br/><i>MCAT chem, then physics</i>]
```

Notes from the conversation that the boxes can't hold:
- Promotion (Instagram, website, Steam page) does not start until "Ready". Presale makes sense before the *product* is ready but not before *Dalia* is ready.
- Instagram ramp (from the YouTube-millionaire plan): month 1 one reel/week, month 2 two to three, month 3 four to five; slip → restart; after 90 clean days, post like a pro (one sales funnel, one connection piece, one carousel per day). "Comment the word" → automated DM with the website link.
- The website carries: Steam link, Etsy link, a PDF download that needs no Etsy account, the question bank, the package purchase, a little about Dalia.
- Etsy risk noted and accepted: anything sold separately can be bought and copied. Packaging (games + bank + booklet) is the moat, not the PDFs.

---

## 2 · The universe prerequisite graph

One graph, drawn once, for every topic the universe holds or will hold. An arrow means "you need the tail before the head makes sense." Tracks (section 3) do not get their own graphs; they are ordered subsets of this one.

Dashed = topic exists in the plan but is empty today (no topic screen, no games). Codes in italics are AAMC MCAT content categories, kept here because the MCAT is the only track with a published outline to cite.

```mermaid
flowchart TD
    MAT[Matter<br/><i>states, mixtures</i>]
    MAT --> MEAS[Measurement<br/><i>units, conversions</i>]
    MAT --> ATOM[Atomic structure<br/><i>electrons, quanta · 4E</i>]
    ATOM --> NUC[Nuclear decay<br/><i>half-life · 4E</i>]
    ATOM --> PT[Periodic system<br/><i>trends · 4E</i>]
    PT --> NOM[Inorganic naming & ions<br/><i>names, formulas · 5A</i>]
    PT --> BOND[Chemical bond<br/><i>Lewis, VSEPR · 5B</i>]
    BOND --> SHAPE[Shape, polarity & IMFs<br/><i>hybridization · 5B</i>]
    MEAS --> STOI[Stoichiometry<br/><i>the mole, yields · 4E</i>]
    NOM --> STOI
    NOM --> REDOX[Redox<br/><i>oxidation numbers · 4E</i>]
    REDOX --> ELEC[Electrochemistry<br/><i>cells, E° · 4C</i>]
    STOI --> GAS[Gas laws<br/><i>PV = nRT, KMT · 4B</i>]
    STOI --> SOL[Solutions<br/><i>concentration · 5A</i>]
    STOI --> THERMO[Thermochemistry<br/><i>ΔH, ΔS, ΔG · 5E</i>]
    SOL --> KIN[Kinetics<br/><i>rates, enzymes · 5E</i>]
    THERMO --> EQ[Equilibria<br/><i>K, Q, Le Chatelier · 5E</i>]
    KIN --> EQ
    GAS --> EQ
    SOL --> AB[Acids & bases<br/><i>pH, buffers, Ksp · 5A</i>]
    EQ --> AB
    SHAPE --> OSTR[Organic structure<br/><i>isomers, stereochem · 5B</i>]
    OSTR --> ONOM[Organic naming<br/><i>IUPAC</i>]
    OSTR --> ORXN[Organic reactions<br/><i>functional groups, carbonyls · 5D</i>]
    ORXN --> BIO[Biomolecules<br/><i>amino acids, sugars, lipids · 5D, 1A</i>]
    BIO --> LAB[Separations & spectra<br/><i>IR, NMR, chromatography · 5C, 4D</i>]
    style NUC stroke-dasharray: 5 5
    style ELEC stroke-dasharray: 5 5
    style THERMO stroke-dasharray: 5 5
    style BIO stroke-dasharray: 5 5
    style LAB stroke-dasharray: 5 5
```

Three lanes, read top to bottom: **quantitative** (Measurement → Stoichiometry → Gas laws / Solutions / Thermo → Kinetics / Equilibria → Acids & bases), **atoms and naming** (Atomic → Periodic → Naming → Redox → Electrochem), **structure and organic** (Bond → Shape & IMFs → Organic structure → naming / reactions → Biomolecules → Lab). The lanes are independent enough to build in any order; Stoichiometry is the one merge point everything quantitative waits on.

Where the graph differs from `TOPIC_UNIVERSE_PLAN.md`: the plan's "Beyond" chapter (nuclear, coordination, spectroscopy) appears here as Nuclear decay and Separations & spectra, and Biomolecules is a new node the plan does not have. Both are MCAT-driven; the plan should absorb them when the MCAT track is actually built.

**Arrows are drafts.** They are Claude's prerequisite guesses awaiting Dalia's red pen. The games themselves do not depend on them: a game belongs to a topic, a topic is a node, and the arrows only decide suggested order.

---

## 3 · Tracks are ordered subsets

A track is a list of topic IDs in a stated order, plus a short note on emphasis. Nothing else. It is never a second graph, and a student on one track never sees the other track's extra nodes.

### IMAT

Order approved 2026-08-12 ("OK for now"):

matter → atomic structure → periodic system → chemical bond (+ shape & IMFs) → inorganic naming → measurement → stoichiometry → solutions → gas laws → equilibria → acids & bases → kinetics → redox (oxidation numbers only) → organic structure → organic naming → organic reactions.

- Off the track: nuclear, electrochemistry, thermochemistry, biomolecules, separations & spectra.
- Time-short cut line (from the 184-question bank): acids & bases, stoichiometry, equilibria, atomic/periodic, redox ≈ 85% of what is asked.
- Chemical bond is the most-tagged topic with the fewest games.
- Organic reactions are dead since 2014; lowest priority.

### MCAT (draft, unverified)

Source caveat: the AAMC content-outline pages block automated readers; this comes from UWorld's summary plus the outline's known structure. Verify against the official "What's on the MCAT Exam?" PDF before building.

Suggested order (follows the graph; the quantitative lane first because it carries ~30% of Chem/Phys):

atomic structure → nuclear decay → periodic system → inorganic naming & ions → stoichiometry → redox → electrochemistry → gas laws → solutions → thermochemistry → kinetics → equilibria → acids & bases → chemical bond → shape & IMFs → organic structure → organic reactions (functional groups) → biomolecules → separations & spectra.

- Chem/Phys section: 59 questions, 95 min; gen chem ≈30%, organic ≈15%, biochem ≈25%, physics ≈25%, biology ≈5%. Gen chem is also ≈5% of Bio/Biochem.
- Passage-based and reasoning-heavy; recall alone scores little. Game design for this track should lean on the "construct the answer" rule more than on recall decks.
- Organic naming is minor on the MCAT; organic is functional-group chemistry (carbonyls, alcohols, acids and derivatives) plus stereochemistry.
- New work relative to IMAT = exactly the five dashed nodes in the graph. Everything else is shared.

### Tro, *Introductory Chemistry* (19 chapters) — the course sequence (added 2026-10-17)

The first "gen chem by book" track, and the sequence of the EdTech course (`EDTECH_COURSE_PLAN.md`). Chapter order is the book's; each chapter maps to one or more universe topics.

| Ch. | Title | Universe topics |
|---|---|---|
| 1 | The Chemical World | matter (intro) |
| 2 | Measurement and Problem Solving | measurement |
| 3 | Matter and Energy | matter; thermochemistry (heat, specific heat) |
| 4 | Atoms and Elements | atomic structure (particles, isotopes, ions) |
| 5 | Molecules and Compounds | inorganic naming & ions |
| 6 | Chemical Composition | stoichiometry (mole, composition, formulas) |
| 7 | Chemical Reactions | stoichiometry (equations, reaction types, net ionic) |
| 8 | Quantities in Chemical Reactions | stoichiometry (ratios, limiting, yield) |
| 9 | Electrons in Atoms and the Periodic Table | atomic structure (configurations); periodic system |
| 10 | Chemical Bonding | chemical bond; shape & polarity |
| 11 | Gases | gas laws |
| 12 | Liquids, Solids, and Intermolecular Forces | shape, polarity & IMFs |
| 13 | Solutions | solutions |
| 14 | Acids and Bases | acids & bases |
| 15 | Chemical Equilibrium | kinetics (rates); equilibria |
| 16 | Oxidation and Reduction | redox; electrochemistry |
| 17 | Radioactivity and Nuclear Chemistry | nuclear decay |
| 18 | Organic Chemistry | organic structure, naming, reactions |
| 19 | Biochemistry | biomolecules |

```mermaid
flowchart LR
    c1[1 Chemical world] --> c2[2 Measurement] --> c3[3 Matter & energy] --> c4[4 Atoms] --> c5[5 Compounds & naming] --> c6[6 Composition] --> c7[7 Reactions] --> c8[8 Quantities] --> c9[9 Electrons & PT] --> c10[10 Bonding]
    c10 --> c11[11 Gases] --> c12[12 Liquids, solids, IMFs] --> c13[13 Solutions] --> c14[14 Acids & bases] --> c15[15 Equilibrium] --> c16[16 Redox] --> c17[17 Nuclear] --> c18[18 Organic] --> c19[19 Biochemistry]
```

- Where Tro differs from IMAT: reactions and stoichiometry (6–8) come **before** electrons, periodic trends, and bonding (9–10); thermochemistry basics sit in ch. 3; kinetics is folded into the equilibrium chapter; nuclear is a full chapter.
- Provisional blocks for the course (Dalia to confirm): fundamentals = 1, 2, 3, 4, 9, 10 · quantitative = 5, 6, 7, 8, 13 · advanced = 11, 12, 14–19.
- Lane check against the universe graph: the book honors every prerequisite arrow except that it teaches stoichiometry (ch. 6–8) before the periodic system (ch. 9); the graph has periodic system → naming → stoichiometry. Tro gets away with it because ch. 4 already covers Z and ions.

**Editable copy:** `TRACK_MAPS.drawio` — three tabs (IMAT, MCAT, Tro), one map per tab, laid out in the three universe lanes with prerequisite arrows. Open in diagrams.net or the VS Code draw.io extension; regenerate from the Mermaid graph if the universe changes.

### Gen chem, by book

Same universe, same games, a different order per textbook. Every intro text covers the same topics; they differ in sequence (atoms-first vs reactions-first, where the mole lands, when gases appear). So a "Gen chem" track is really a family of tracks, one per book, each just an ordered list of topic IDs mapped from that book's chapter order.

Student flow: pick a track (IMAT / MCAT / Gen chem course) → if Gen chem, pick the book → the games are suggested in that book's chapter order.

Books are not specified yet. Candidates already in `_teaching-materials/` (Tro's Intro Chem for CHEM 101, the Reactions-First text for CHEM 110–111, OU's 1315/1415 sequence) are obvious first entries, since Dalia's own course plans for them exist, but the list is deliberately left open. Adding a book is a data entry (one ordered list), not a build.

---

## What this means for the code

- A topic has an ID, a screen, games. (Exists: `shared/js/topic-screen.js`.)
- The prerequisite graph is one data file: `{ topicId: [prerequisiteIds] }`. Optional; it only drives suggestions.
- A track is one data file: `{ id, name, order: [topicIds], notes }`. Gen chem books are tracks with a `book` field.
- Track selection is a home-page filter and ordering, not gating (decision 2026-08-11: no gating, ever).

Sources: [UWorld MCAT general chemistry overview](https://gradschool.uworld.com/mcat/sections-subjects/general-chemistry/) · AAMC "What's on the MCAT Exam?" (students-residents.aamc.org, not machine-readable; read manually).
