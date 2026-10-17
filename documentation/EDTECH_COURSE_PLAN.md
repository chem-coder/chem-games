# EdTech Course Plan — course first, Steam later

**Status:** decided 2026-10-17 by Dalia, after discussion with a game-industry friend and a Gemini session (raw transcript: `idea-box/steam-and-edtech-plan-gemini-2026-10.txt`). This supersedes `PRODUCT_STRATEGY.md` §1 (Steam as product #1). The Steam concept is parked, not dropped: `STEAM_CONCEPT_PARKED.md`.

Only Dalia's decisions and requirements are recorded here. Prices, platform fees, and market numbers from the transcript are unverified and deliberately left out.

## 1. The decision

Build an **interactive exam-prep course** first — IMAT first, because one paying student already exists — and the Steam game later, from the same modules.

Reasons, in her words or close to them:
- 20 years of teaching; lectures, practice questions, and the understanding of what students struggle with already exist. The course is closer to real than the game.
- The goal is to stop tutoring by the hour and have something students can be sent to — closer to passive income.
- Same content extends to MCAT and other exams (AP Chemistry, UCAT, GAMSAT, DAT), to general chemistry and high-school students.
- No video lectures. Text, diagrams, interactive modules, PDF guides.
- Her first sale target is modest (a few thousand dollars); $20k–$50k would be excellent.

## 2. Product lines

- **The course** on a hosted course platform (Teachable was discussed; not chosen), sold per course with a one-time payment. Chosen so that accounts, payments, and progress are handled by the platform — the reason Steam was attractive, without Steam's cut.
- **PDF chapter guides** — one per chapter, plus a compilation — sold on Etsy and included in the course. Her idea.
- **Steam game** later, built from the finished modules.

**Hosting consequence:** course lessons embed the games. The repo is private, so there is no public URL to embed from until the games are hosted from the private repo (e.g. Cloudflare Pages). Unresolved.

## 3. The outline — her next step

Her requirement: a complete syllabus-like map that defines the project's boundaries, so development is purposeful and nothing gets rebuilt. Specifically:

- Sequence: Tro, *Introductory Chemistry*, 19 chapters (the "gen chem by book" track from `TRACK_MAPS.md`; the 18-topic universe is unchanged).
  - **Changed 2026-10-17:** the row spine is now Tro, *Chemistry: A Molecular Approach*, 5th ed. (Pearson, 2019), 26 chapters, because it is the superset and every exam or course becomes a column of it. Built as `slo-matrix/SLO_MATRIX.xlsx`. The chapter-slot table below still uses Introductory Chemistry numbering and is kept as the record of existing assets; the matrix carries the same placements in its Game / asset column.
- Three blocks: **fundamentals / quantitative / advanced**.
- Per chapter: what the student must **understand**, **be able to do**, and **memorize** (the format she used in earlier course development).
- Roughly **7 sub-levels per chapter** → about 140 units.
- From the whole: identify the **spine**.

**Spine (hers):** chemistry is the interaction of positively and negatively charged particles. Each chapter is that interaction at a larger scale — electrons on a nucleus, atoms sharing or transferring electrons, polar molecules, ions in water, proton transfer, electron transfer, partial charges holding large molecules together. Her first storyboard (a plus and a minus) opens the course and is kept.

Order of work: start at the beginning (atomic structure, periodic table), not at electrochemistry.

### Chapter slots and existing assets

Sub-levels and the three lists are hers to write; this table only places what already exists.

| Block | Tro ch. | Topic | Existing assets |
|---|---|---|---|
| 1 | 1 | The chemical world | +/− storyboards; skills map at `map/` |
| 1 | 2 | Measurement and problem solving | Conversion Builder, Conversion Conveyor |
| 1 | 3 | Matter and energy | — |
| 1 | 4 | Atoms and elements | `atomic-structure/` renderer prototype; design brief in memory |
| 1 | 9 | Electrons in atoms and the periodic table | Periodic System screen, PT Memorizer, Trend Ladder |
| 1 | 10 | Chemical bonding | Shape Lab; bonding game design |
| 2 | 5 | Molecules and compounds | Name Builder, Polyatomic Ion Trainer, Oxidation-State Trainer |
| 2 | 6 | Chemical composition | Conversion Builder |
| 2 | 7 | Chemical reactions | Visual Equation Balancer |
| 2 | 8 | Quantities in chemical reactions | Ratio Factory |
| 2 | 13 | Solutions | pH Lab dilution rung |
| 3 | 11 | Gases | Gas Laws (Charles) |
| 3 | 12 | Liquids, solids, intermolecular forces | — (Shape Lab polarity) |
| 3 | 14 | Acids and bases | pH Lab, Acid/Base Sorter |
| 3 | 15 | Chemical equilibrium | — (OU mining notes) |
| 3 | 16 | Oxidation and reduction | Oxidation-State Trainer, Battery Lab |
| 3 | 17 | Radioactivity and nuclear chemistry | — (OU mining notes) |
| 3 | 18 | Organic chemistry | Organic Nomenclature, Molecule Builder, Reactions Lab |
| 3 | 19 | Biochemistry | — |

Block membership is provisional (Tro's own order interleaves; the block split is hers to confirm).

## 4. Open decisions

1. ~~Confirm Tro's 19 chapters as the course sequence.~~ Decided 2026-10-17: Molecular Approach 5th ed., 26 chapters, as the SLO matrix spine.
2. Lesson shape inside a chapter — not decided. The one idea discussed: the interactive module comes before the theory text.
3. Platform choice.
4. Public hosting for the games from the private repo.

## 5. Next steps

1. Review the SLO matrix chapter by chapter with Dalia, block 1 first (rows marked Source = Draft need her SLOs; Block and Type are provisional); then add the sub-levels. Fill the MCAT, AP, A-level, GAMSAT, DAT, and IB columns once each official outline is read.
2. Resolve hosting.
3. Build module 1 (Tro ch. 4) and pilot it with the current student.
4. First PDF guide for the same chapter.
