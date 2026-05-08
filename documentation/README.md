# Documentation Index

This folder is for internal project documentation: goals, decisions, implementation notes, process rules, technical reviews, and product ideas.

## Active Internal Docs

- `PROJECT_REVIEW.md` - current project inventory, goals, documentation status, database plan, and working process.
- `Chem_Games_Project_Brief.md` - high-level product brief for the IMAT chemistry / stoichiometry trainer direction.
- `IDEA_BACKLOG.md` - organized product and learning-game ideas migrated from the old `.docx` backlog.
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
