# Documentation Index

This folder is for internal project documentation: goals, decisions, implementation notes, process rules, technical reviews, and product ideas.

## Active Internal Docs

- `PRODUCT_STRATEGY.md` - **START HERE. The north-star doc (2026-07-27).** The shift from web learning library to a commercial indie chemistry puzzle game on Steam: first product scope (the Nomenclature bundle), the three-shells-one-codebase rule, free-vs-paid line, the mobile audit, go-to-market, and the current sequence. Supersedes `ROADMAP.md` wherever they disagree.
- `TOPIC_UNIVERSE_PLAN.md` - **the web library's organizing plan (2026-08-12).** Chapter → Topic → Ladder-tab hierarchy for the whole site, the 11 chapters with topics/games/ladders mapped to Dalia's course sections, tracks (IMAT first) as pathways over the universe, decisions log, and rollout order.
- `PROJECT_REVIEW.md` - current project inventory, goals, documentation status, database plan, and working process.
- `Chem_Games_Project_Brief.md` - high-level product brief for the IMAT chemistry / stoichiometry trainer direction.
- `ARCHITECTURE.md` - durable technical-decisions blueprint: standard game module pattern, light shared foundation, shared content spine, chemistry-correctness safety net, and deploy. Fills the slot earlier reserved for `TECHNICAL_DECISIONS.md`.
- `STOICHIOMETRY_WORLD.md` - product and engine design for connecting Ratio Factory + the balancer into one stoichiometry track (everyday ratios → mole ratios → mass → limiting reagent → percent yield).
- `ROADMAP.md` - phased plan for building and launching the Stoichiometry World. **Superseded 2026-07-27** by `PRODUCT_STRATEGY.md`; its stoichiometry phases are demoted (not deleted). Kept as the historical record of how the shipped games came to be.
- `CONVERSION_BUILDER_DESIGN.md` - spec for the next-gen "build the dimensional-analysis grid from tiles" game that upgrades the Conversion Conveyor (teaches the given-over-1 step learners miss; challenge-and-discovery design).
- `IDEA_BACKLOG.md` - organized product and learning-game ideas migrated from the old `.docx` backlog.
- `GAME_IDEAS_NOTEBOOK.md` - active brainstorming notebook for new game concepts and lookup tools before they become formal specs.
- `idea-box/README.md` - landing zone for raw idea docs and summaries before they are processed into the notebook.
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
