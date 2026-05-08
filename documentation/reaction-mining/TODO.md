# Reaction Mining Todo

This is the editable task list for extracting reaction candidates from teaching materials. Codex may update statuses during work. The project owner approves scientific content before reactions are added to the app.

## Current Status

- Current phase: CHEM 1315 Exam 1 implemented
- Current chunk: `CHEM 1315 Previous Exams` - Exam 1 files
- Next recommended chunk after approval: `CHEM 1315 Previous Exams` - Exam 2 files
- Implementation gate: no new reactions go into the app until approved in `CANDIDATE_REACTIONS.md`

## Setup

- [x] Create reaction mining documentation folder.
- [x] Create workflow and approval rules.
- [x] Create source inventory.
- [x] Create candidate approval queue.
- [x] Project owner chooses first extraction chunk.

## Extraction Pipeline

- [x] Extract reactions from selected chunk.
- [x] Normalize formulas and equations.
- [x] Balance each equation independently.
- [x] Remove duplicate reactions already present in the game.
- [x] Assign initial difficulty.
- [x] Assign topic labels.
- [x] Add candidates to `CANDIDATE_REACTIONS.md`.
- [x] Wait for project owner approval.
- [x] Revise candidates marked `revise`.
- [x] Add approved reactions to `imat-chem-stoichiometry/data/reactions.js`.
- [x] Add hints for approved reactions.
- [x] Run app/data checks.
- [x] Update candidate statuses to `implemented`.
- [x] Update source inventory status.

## Suggested Chunk Order

- [x] `WS_Balancing Equations with answers.pdf`
- [x] `CHEM 1315 Previous Exams` - Exam 1 files
- [ ] `CHEM 1315 Previous Exams` - Exam 2 files
- [ ] `CHEM 1315 Previous Exams` - Exam 3 files
- [ ] `CHEM 1315 Previous Exams` - Exam 4 files
- [ ] `Malcolm_IMAT-Chem_2025` files
- [ ] `IMAT-CHEMISTRY-EXAM_2025.pdf`
- [ ] `IMAT-2014.pdf`
- [ ] `CHEM 1415 Previous Exams` - use later for advanced pools

## Cleanup Todo

- [ ] Delete temporary extraction files if created.
- [ ] Remove duplicate scratch notes if created.
- [ ] Decide whether to archive or delete completed process docs.
- [ ] Update `imat-chem-stoichiometry/README.md` with final pool structure.
