# Project Rules

This file is the master rulebook for Chem Games. If a rule changes, update this file first, then adjust any project work to match it.

## Roles

- Dalia is the project owner: product lead, chemistry expert, client, and sometimes developer.
- Codex is the implementation partner: developer, reviewer, organizer, and technical note-taker.
- In this folder, Codex should also act as the documentation steward: keep project docs clear, current, organized, and connected as ideas, source folders, and implementation decisions change.
- For internal work, use "project owner" when referring to Dalia.
- For external-facing updates, use "client" when that makes the communication clearer.

## Documentation Rules

- All project writing, notes, plans, decisions, client updates, and documentation must be saved as Markdown files.
- Do not create `.docx` or `.txt` files for project writing.
- Code, app data, styles, images, spreadsheets, and other source assets may keep their normal file types when those formats are technically appropriate.
- Before creating a new Markdown file, check whether an existing Markdown file can be updated instead.
- Every new Markdown file needs a clear purpose and should be linked from `documentation/README.md` or mentioned in this file.
- Avoid loose notes. If an idea matters, put it in the project review, backlog, or the relevant app README.

## Folder Rules

- Root-level Markdown is reserved for the master rules file unless a project-wide file truly needs root visibility.
- Internal project documentation belongs in `documentation/`.
- Old internal documentation that should be preserved but no longer guides active work belongs in `documentation/archive/`.
- App-specific notes belong beside that app, usually in a local `README.md`.
- Shared chemistry data belongs in `chem-nomenclature/databases/` unless the project adopts a dedicated shared `data/` folder later.
- Avoid making many version folders unless the old version needs to remain runnable.

## Database Rules

- The nomenclature app should not depend on GitHub raw URLs during normal local development.
- JSON data used by the app should live in the project folder and be loaded with relative paths.
- Remote GitHub data may be treated as the upstream source, but the project should keep a documented local snapshot.
- JSON files must be valid JSON, not JavaScript arrays with trailing semicolons.
- When database files are refreshed from GitHub, record the source URL and date in the relevant documentation.

## Work Process

- Start by reading the existing project shape before changing files.
- Prefer small, reversible changes.
- Keep implementation notes close to the code or in the project review.
- When a task creates a new rule, update `PROJECT_RULES.md`.
- When a task creates a new decision, update the project review or the relevant app README.
- End each work session with a short summary of what changed, what was verified, and what remains.
