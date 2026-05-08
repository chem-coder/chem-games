# Reaction Mining Workflow

Purpose: extract useful chemical reactions from the private teaching materials, review them with the project owner, and add only approved reactions to the stoichiometry game.

This folder is active process documentation. It should stay compact. Do not create one note per PDF unless a source is too large to review in the shared candidate queue.

## Scope

The task covers:

- finding chemical reactions in `_teaching-materials/`
- writing each reaction as a balanced equation
- assigning difficulty: `easy`, `medium`, or `hard`
- assigning one or more topic labels
- writing a short note about source/context when useful
- getting project owner approval before editing app data
- adding approved reactions to `imat-chem-stoichiometry/data/reactions.js`
- writing or revising hints only after the reaction itself is approved

The task does not include:

- adding unapproved reactions directly to the app
- committing private teaching materials
- creating new non-Markdown project notes
- turning every source file into a separate documentation file
- building auth, history tracking, or randomization before the reaction pool is stronger

## Working Files

- `TODO.md` - editable checklist and current task status.
- `SOURCE_INVENTORY.md` - source list, priority, and extraction status.
- `CANDIDATE_REACTIONS.md` - candidate reactions awaiting approval, revision, or rejection.

## Approval Statuses

Use these exact statuses in candidate lists:

- `pending` - extracted, not yet reviewed by project owner.
- `approved` - accepted for implementation.
- `revise` - scientifically useful, but wording/equation/topic/difficulty needs correction.
- `rejected` - do not add to the game.
- `implemented` - added to the app after approval.

## Chunk Workflow

1. Select one chunk from `SOURCE_INVENTORY.md`.
2. Extract candidate reactions from that chunk only.
3. Add candidates to `CANDIDATE_REACTIONS.md` with status `pending`.
4. Project owner reviews the list and marks each item `approved`, `revise`, or `rejected`.
5. Codex implements only `approved` reactions.
6. Codex updates statuses to `implemented` after app data and checks are complete.
7. Move to the next chunk.

## Candidate Format

Each candidate should include:

```md
### RXN-000

- Status: pending
- Source:
- Unbalanced/source equation:
- Balanced equation:
- Difficulty:
- Topics:
- Notes:
```

## Topic Labels

Use existing labels when possible:

- `acid-base`
- `acid-metal`
- `combustion`
- `decomposition`
- `double-displacement`
- `formal-equation`
- `gas-formation`
- `hydrocarbon`
- `metal-oxidation`
- `neutralization`
- `nonmetal-oxidation`
- `oxide-reduction`
- `precipitation`
- `redox`
- `single-replacement`
- `synthesis`

Add new labels only when the existing vocabulary is not enough.

Use `formal-equation` for equations that are useful balancing practice but should not be presented as a chemically driven reaction under ordinary aqueous conditions.

## End-of-Process Cleanup

Do not delete source teaching materials.

Delete after project owner approval:

- temporary extraction text files, OCR dumps, or scratch exports if any are created
- duplicate candidate scratch files if a source temporarily needs one
- empty or obsolete per-chunk notes if they were created during extraction

Archive rather than delete if the file contains decisions worth preserving:

- completed `TODO.md`
- completed `CANDIDATE_REACTIONS.md`
- completed `SOURCE_INVENTORY.md`

Keep:

- app data in `imat-chem-stoichiometry/data/reactions.js`
- app documentation in `imat-chem-stoichiometry/README.md`
- this workflow README if reaction mining will continue later

## Recommendation

Start with `WS_Balancing Equations with answers.pdf`. It is the cleanest fit for the current game because it is directly about balancing equations and likely has answer keys.
