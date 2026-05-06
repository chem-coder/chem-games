# Project Review

Last reviewed: 2026-05-06

## Current Shape

Chem Games is currently a collection of vanilla HTML/CSS/JavaScript chemistry learning prototypes.

Top-level areas:

- `documentation/Chem_Games_Project_Brief.md` - project concept and first major product direction.
- `imat-chem-stoichiometry/` - active first Chem Games app, a visual equation-balancing trainer.
- `chem-nomenclature/` - chemical elements and compound nomenclature app versions.
- `chem-pH-calculator/` - pH calculator prototypes.
- `-Chemistry Game/` - early chemistry game prototype.
- `documentation/IDEA_BACKLOG.md` - older idea backlog migrated from `.docx` on 2026-05-06.

The folder is not currently a Git repository, so there is no local `origin` remote to pull from yet.

## Existing Product Direction

The existing project brief points toward an IMAT chemistry trainer with small interactive games. The first recommended polished module is a visual stoichiometry equation balancer.

The strongest current product principle is:

> Teach chemistry through interaction.

That should remain the north star for future apps.

## Chem Nomenclature App Review

The nomenclature app has four version folders:

- `v1` - element name/symbol lookup with data embedded directly in JavaScript.
- `v2` - adds autocomplete while still embedding element data.
- `v3` - fetches local element data from `chem-nomenclature/databases/`.
- `v4` - adds a mode selector, compound formula naming logic, and local database loading.

There is already a local database folder:

- `chem-nomenclature/databases/elements.json`
- `chem-nomenclature/databases/monoatomic-anions.json`
- `chem-nomenclature/databases/polyatomic-anions.json`
- `chem-nomenclature/databases/polyatomic-cations.json`

Current local data counts:

- `elements.json` - 118 entries.
- `monoatomic-anions.json` - 14 entries.
- `polyatomic-anions.json` - 31 entries.
- `polyatomic-cations.json` - 3 entries.

Resolved on 2026-05-06: `v3` and `v4` now fetch data from the local database folder instead of GitHub raw URLs. GitHub remains the upstream source for future refreshes, but local development now uses the project copy.

## GitHub Database Plan

The database upstream repository is:

```text
https://github.com/chem-coder/chemical-data
```

Raw upstream data URLs:

```text
https://raw.githubusercontent.com/chem-coder/chemical-data/main/elements.json
https://raw.githubusercontent.com/chem-coder/chemical-data/refs/heads/main/monoatomic-anions.json
https://raw.githubusercontent.com/chem-coder/chemical-data/refs/heads/main/polyatomic-anions.json
https://raw.githubusercontent.com/chem-coder/chemical-data/main/polyatomic-cations.json
```

Current local setup for the MVP:

1. Keep the app database inside `chem-nomenclature/databases/`.
2. Treat GitHub as the upstream source, not as the runtime dependency.
3. Copy or refresh the JSON files from GitHub into `chem-nomenclature/databases/`.
4. App fetch calls use relative local paths:

```js
fetch("../databases/elements.json")
fetch("../databases/monoatomic-anions.json")
fetch("../databases/polyatomic-anions.json")
fetch("../databases/polyatomic-cations.json")
```

5. Run the app through a local web server instead of opening the HTML file directly:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/chem-nomenclature/v4/
```

This avoids browser restrictions around fetching local JSON files from `file://`.

More advanced option: add the GitHub database as a Git submodule under `external/chemical-data/`. That is cleaner if the chemistry database will be maintained as a separate reusable project, but it adds workflow complexity. For now, a local snapshot in `chem-nomenclature/databases/` is simpler and better.

## Documentation Cleanup

Active documentation structure:

- `PROJECT_RULES.md` stays at root as the master rulebook.
- `documentation/README.md` is the documentation index.
- `documentation/PROJECT_REVIEW.md` is the current project inventory and workflow summary.
- `documentation/Chem_Games_Project_Brief.md` is the project-wide product brief.
- `documentation/IDEA_BACKLOG.md` is the organized idea backlog.
- App-specific READMEs stay beside their apps.
- `documentation/archive/` is available for old docs that should be preserved but no longer guide active work.

Migrated documentation:

- `Chem-Games-App-Ideas.docx` was migrated to `documentation/IDEA_BACKLOG.md` on 2026-05-06, then deleted after owner confirmation.
- `chem-pH-calculator/README.txt` was migrated to `chem-pH-calculator/README.md` on 2026-05-06, then deleted after Markdown migration.

Files that should be deleted only after owner confirmation:

- None currently.

Overlap notes:

- `documentation/Chem_Games_Project_Brief.md` and `documentation/IDEA_BACKLOG.md` both discuss product direction, but the brief is the active near-term stoichiometry direction while the backlog is a broader idea bank.
- Nomenclature version READMEs overlap because they document historical app versions. They should stay beside each version while those versions remain runnable.
- `documentation/PROJECT_REVIEW.md` should summarize documentation status, not duplicate full product specs or the full backlog.

Files that are okay to remain non-Markdown because they are source files or data:

- `.html`
- `.css`
- `.js`
- `.json`
- `.xlsx`, if it is being used as a calculator/data artifact rather than a project note.

## Goals

Short-term goals:

- Make project organization predictable.
- Make the local chemistry database the runtime source for the nomenclature app.
- Keep documentation small and useful.
- Decide which prototype is the current active app before doing major feature work.

Product goals:

- Build chemistry tools that feel interactive rather than worksheet-like.
- Use vanilla web technologies while the learning loop is still being proven.
- Prefer small polished modules over a huge unfinished platform.

Technical goals:

- Keep data separate from app logic.
- Use local JSON data for offline-friendly development.
- Preserve runnable versions only when they are useful.
- Add lightweight validation for chemistry data before relying on it in the UI.

## Working Process

Use this loop:

1. Define the current target app or problem.
2. Check existing files before adding anything new.
3. Update or create the smallest useful Markdown note.
4. Make a small code/data change.
5. Verify it in the browser or with a data check.
6. Record the outcome in the relevant Markdown file only if it affects future work.

Default decision rule: if a note is only useful today, keep it in the conversation summary. If it will guide future work, save it in Markdown.
