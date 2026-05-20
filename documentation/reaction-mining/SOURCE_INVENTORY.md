# Reaction Source Inventory

Private source materials live in `_teaching-materials/`, which is ignored by git. This inventory tracks extraction priority and status.

## Status Key

- `not started`
- `extracting`
- `candidate review`
- `implemented`
- `skipped`

## High Priority

| Source | Status | Why It Matters | Notes |
|---|---:|---|---|
| `_teaching-materials/WS_Balancing Equations with answers.pdf` | implemented | Directly matches the current balancing game. | Added 30 non-duplicate worksheet reactions after removing the aluminum carbonate reaction during chemistry cleanup; 6 worksheet items parked as duplicates or already in app. |
| `_teaching-materials/CHEM 1315 Previous Exams/` Exam 1 files | implemented | Likely beginner/general chemistry level. | Added 25 non-duplicate reactions after removing the aluminum carbonate formal equation during chemistry cleanup. |
| `_teaching-materials/CHEM 1315 Previous Exams/` Exam 2 files | not started | Likely contains more reaction and stoichiometry content. | Good second 1315 pass. |
| `_teaching-materials/CHEM 1315 Previous Exams/` Exam 3 files | not started | May add broader reaction contexts. | Use after Exam 1 and 2. |
| `_teaching-materials/CHEM 1315 Previous Exams/` Exam 4 files | not started | May include harder cumulative material. | Review for hard pools. |

## IMAT Priority

| Source | Status | Why It Matters | Notes |
|---|---:|---|---|
| `_teaching-materials/Malcolm_IMAT-Chem_2025/IMAT_Chemistry_Topics_with_Questions.csv` | not started | Structured text may be easy to scan. | Good for IMAT relevance tags. |
| `_teaching-materials/Malcolm_IMAT-Chem_2025/IMAT_Chemistry_Study_Topics.csv` | not started | Structured topic map. | More likely useful for labels than equations. |
| `_teaching-materials/Malcolm_IMAT-Chem_2025/IMAT_Chemistry_Study_Topics.pdf` | not started | Topic context. | Use only if CSV is insufficient. |
| `_teaching-materials/Malcolm_IMAT-Chem_2025/IMAT_chem_syllabus.pdf` | not started | Syllabus alignment. | Use for topic coverage. |
| `_teaching-materials/Malcolm_IMAT-Chem_2025/chimica.pdf` | not started | Potential broad chemistry source. | Use after easier structured files. |
| `_teaching-materials/IMAT-CHEMISTRY-EXAM_2025.pdf` | not started | Recent IMAT-style exam source. | Extract only reactions relevant to balancing practice. |
| `_teaching-materials/IMAT-2014.pdf` | not started | Older IMAT-style exam source. | Extract only reactions relevant to balancing practice. |

## Later / Advanced

| Source | Status | Why It Matters | Notes |
|---|---:|---|---|
| `_teaching-materials/CHEM 1415 Previous Exams/Exam 1/` | not started | More advanced general chemistry. | Use for hard/advanced pools after 1315. |
| `_teaching-materials/CHEM 1415 Previous Exams/Exam 2/` | not started | Acid-base and equilibrium may appear. | Extract only balanceable reaction practice for now. |
| `_teaching-materials/CHEM 1415 Previous Exams/Exam 3/` | not started | More advanced reaction contexts. | Likely later. |
| `_teaching-materials/CHEM 1415 Previous Exams/Exam 4/` | not started | Advanced/cumulative. | Likely later. |
| `_teaching-materials/CHEM 1415 Previous Exams/Title pages etc/` | not started | Topic/unit metadata. | Probably labels, not reactions. |

## Current App Reactions To Deduplicate Against

Use `imat-chem-stoichiometry/data/reactions.js` as the source of truth for deduplication.

Current shared reaction data after worksheet, CHEM 1315 Exam 1 mining, and chemistry cleanup additions: 74 reactions.

Current balancing-practice pool after excluding reactions already balanced as written: 69 reactions.
