# Documentation Index

This folder is for internal project documentation: goals, decisions, implementation notes, process rules, technical reviews, and product ideas.

## Active Internal Docs

- `EDTECH_COURSE_PLAN.md` - **START HERE (2026-10-17).** Course first, Steam later: the decision and reasons, business model (course platform + Etsy PDFs), the five-step module template, the 19-chapter outline with existing assets placed, open questions, next steps.
- `slo-matrix/SLO_MATRIX.xlsx` (+ `SLO_MATRIX.csv`, `export_csv.py`) - **the course outline as an SLO matrix (2026-10-17).** One row per SLO, rows follow the 26 chapters of Tro, *Chemistry: A Molecular Approach* (5th ed.); one column per exam or course (1 = needed, 0 = judged not needed, blank = not reviewed). Filled so far: Tro Intro Chem, Gen Chem, HESI, IMAT. First draft, unreviewed.
- `slo-matrix/GAMSAT_CHEMISTRY_SYLLABUS.md` - compiled GAMSAT chemistry topic outline (2026-10-19), the source for the matrix's GAMSAT column. Not an ACER document: built from GradReady, gamsat.ie and Fraser's Medical, with per-topic source tags.
- `STEAM_CONCEPT_PARKED.md` - the Steam game concept and mechanics catalogue (identity triad, hidden tiles, apparatus collecting, fail states), kept for when the game is built.
- `PRODUCT_STRATEGY.md` - the 2026-07-27 Steam-first doc, superseded in part on 2026-10-17. The north-star doc (2026-07-27).** The shift from web learning library to a commercial indie chemistry puzzle game on Steam: first product scope (the Nomenclature bundle), the three-shells-one-codebase rule, free-vs-paid line, the mobile audit, go-to-market, and the current sequence. Supersedes `ROADMAP.md` wherever they disagree.
- `TOPIC_UNIVERSE_PLAN.md` - **the web library's organizing plan (2026-08-12).** Chapter → Topic → Ladder-tab hierarchy for the whole site, the 11 chapters with topics/games/ladders mapped to Dalia's course sections, tracks (IMAT first) as pathways over the universe, decisions log, and rollout order.
- `TRACK_MAPS.md` - **pathway maps (2026-10-03).** The business process (build loop → ready gate → channels → first dollar), the single universe prerequisite graph (all topics, MCAT additions dashed), and tracks as ordered subsets of it: IMAT, draft MCAT, and gen chem by textbook (books TBD). Mermaid, renders on GitHub. Tro Intro Chem track added 2026-10-17.
- `TRACK_MAPS.drawio` - editable draw.io version of the track maps: three tabs (IMAT, MCAT, Tro Intro Chem).
- `BONDING_GAME_DESIGN.md` - Shape Lab spec (2026-08-12): the Bonding & Structure game — Model Kit workspace (dot-drag bonds, Check→rotating 3D), formal charge → Lewis → geometries → build → polarity ladder, side-by-side Kit+quiz layout, resonance/octet rules, build order.
- `OU_MINING.md` - mining log for the OU CHEM 1315/1415 archives (advanced-band content, harder than IMAT/Heritage). COMPLETE: all of 1315 (E1-E4 + the four image-only SP13 papers) and all of 1415 (no exams exist - lectures + recitations), with topic-ladder feeds and a 45-mechanic quiz-pattern catalogue.
- `GLOSSARY_EN_RU.md` - EN→RU term glossary for Russian localization (draft for Dalia's red pen); single source for term choices, beginner topics first.
- `OU_SP13_TRANSCRIPTS.md` - full keyed transcriptions of the four image-only 1315 Spring-2013 papers (~140 items recovered by OCR), companion to the mining log.
- `PROJECT_REVIEW.md` - current project inventory, goals, documentation status, database plan, and working process.
- `Chem_Games_Project_Brief.md` - high-level product brief for the IMAT chemistry / stoichiometry trainer direction.
- `ARCHITECTURE.md` - durable technical-decisions blueprint: standard game module pattern, light shared foundation, shared content spine, chemistry-correctness safety net, and deploy. Fills the slot earlier reserved for `TECHNICAL_DECISIONS.md`.
- `STOICHIOMETRY_WORLD.md` - product and engine design for connecting Ratio Factory + the balancer into one stoichiometry track (everyday ratios → mole ratios → mass → limiting reagent → percent yield).
- `ROADMAP.md` - phased plan for building and launching the Stoichiometry World. **Superseded 2026-07-27** by `PRODUCT_STRATEGY.md`; its stoichiometry phases are demoted (not deleted). Kept as the historical record of how the shipped games came to be.
- `CONVERSION_BUILDER_DESIGN.md` - spec for the next-gen "build the dimensional-analysis grid from tiles" game that upgrades the Conversion Conveyor (teaches the given-over-1 step learners miss; challenge-and-discovery design).
- `IDEA_BACKLOG.md` - organized product and learning-game ideas migrated from the old `.docx` backlog.
- `GAME_IDEAS_NOTEBOOK.md` - active brainstorming notebook for new game concepts and lookup tools before they become formal specs.
- `idea-box/README.md` - landing zone for raw idea docs and summaries before they are processed into the notebook.
- `idea-box/steam-and-edtech-plan-gemini-2026-10.txt` - raw Gemini transcript (Oct 2026) behind the course-first decision and the Steam concept.
- `idea-box/stoichiometry_game_ideas_summary.md` - raw source summary for the Ratio Factory / stoichiometry game direction.
- `idea-box/handoff-periodic-table-touch.md` - ready-to-paste prompt for a fresh session: make Periodic Table fill mode playable on a phone (confirmed diagnosis + the traps that sink the fix).
- `idea-box/competitive-research-notes.md` - worksheet to fill in while playing the reference titles (`while True: learn()`, `Turing Complete`) and reviewing chemistry visualizations, so research yields decisions.
- `reaction-mining/README.md` - workflow for extracting reaction candidates from teaching materials.
- `reaction-mining/TODO.md` - editable checklist for the reaction mining project.
- `reaction-mining/SOURCE_INVENTORY.md` - source priority and extraction status.
- `reaction-mining/CANDIDATE_REACTIONS.md` - approval queue for reactions before they are added to the game.

## Active Root-Level Docs

- `../PROJECT_RULES.md` - master rules for documentation, folders, database handling, and workflow.

## App-Specific Docs

App-specific notes belong beside the relevant app as local Markdown files, usually `README.md`.

Current examples:

- `../imat-chem-stoichiometry/README.md`
- `../chem-nomenclature/v1/README.md`
- `../chem-nomenclature/v2/README-v2.md`
- `../chem-nomenclature/v3/README-v3.md`
- `../chem-nomenclature/databases/readme.md`
- `../chem-pH-calculator/README.md`
- `../chem-gas-laws/README.md`
- `../ratio-factory/README.md`

## Archive

Use `archive/` only for old documentation that should be preserved but should no longer guide active work.

Do not archive active files:

- `../PROJECT_RULES.md`
- `PROJECT_REVIEW.md`
- `Chem_Games_Project_Brief.md`
- `README.md`
- `IDEA_BACKLOG.md`

## Documentation Policy

Use Markdown for all project writing. Before adding a new Markdown file, ask whether the note belongs in:

- `PROJECT_REVIEW.md`
- `IDEA_BACKLOG.md`
- an app-local `README.md`
- `../PROJECT_RULES.md`

New Markdown files should not be created unless they have a durable purpose and are linked from this index or from the relevant app README.

Suggested future Markdown files, only when they become necessary:

- `CLIENT_COMMUNICATION.md` - external-facing summaries, demos, or update notes.
- `TECHNICAL_DECISIONS.md` - only if implementation decisions outgrow the project review.
- [ATOMIC_HISTORY_STORYLINE.md](ATOMIC_HISTORY_STORYLINE.md) — the discovery of atomic structure told as one story, the narrative spine for the beginner units (Dalia's text).
