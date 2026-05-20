# Codex Prompt — Chem Games Documentation Cleanup

## Task

Clean up and organize the Chem Games project documentation.

The goal is to create a clean, durable documentation structure so future AI coding agents can understand the project quickly without generating an overwhelming number of loose documents.

Please inspect the current non-code project documents before making changes.

---

## Current context

The project already has several documentation files, including:

- `PROJECT_RULES.md` — master rulebook for documentation, folders, database handling, and workflow.
- `documentation/README.md` — documentation index.
- `PROJECT_REVIEW.md` — current project shape, goals, nomenclature app review, database plan, and cleanup needs.
- `Chem_Games_Project_Brief.md` — IMAT Chemistry / stoichiometry game direction.
- `Chem-Games-App-Ideas.docx` — older app idea backlog that must be migrated to Markdown.

Use the existing rules as the source of truth.

Important existing rules:

- All project writing must be Markdown.
- Do not create `.docx` or `.txt` files for project writing.
- Before creating a new Markdown file, check whether an existing Markdown file can be updated instead.
- Internal documentation belongs in `documentation/`.
- Root-level Markdown should be reserved for project-wide files.
- Avoid loose notes and unnecessary document sprawl.
- App-specific notes belong beside the relevant app, usually in a local `README.md`.

---

## Requested work

### 1. Inspect current documentation

Read the current documentation files and summarize:

- What each file is for.
- Which documents overlap.
- Which documents should stay at root.
- Which documents should move into `documentation/`.
- Which documents should be archived.
- Which documents should be deleted only after safe migration.

Do not change app code.

---

### 2. Propose a documentation organization plan

Propose a clean documentation structure before implementing it.

A suggested structure is:

```text
documentation/
  README.md
  PROJECT_REVIEW.md
  IDEA_BACKLOG.md
  archive/
```

But inspect the actual project first and adjust if a better structure is warranted.

The structure should avoid creating too many files. Prefer updating existing files when possible.

---

### 3. Migrate the `.docx` idea backlog

`Chem-Games-App-Ideas.docx` must be converted or migrated into Markdown.

Preferred destination:

```text
documentation/IDEA_BACKLOG.md
```

The Markdown version should preserve the ideas, but organize them cleanly by topic.

Suggested sections:

- Scientific method
- Significant figures
- Measurements
- Unit conversions
- Matter and physical chemistry basics
- Memorization games
- Atomic structure
- Periodic table classification
- Ionic compounds and nomenclature
- Electromagnetic radiation
- Chemical bonding
- Stoichiometry
- Chemical reactions
- Electrochemistry
- Future / unsorted ideas

After the Markdown migration is complete, confirm whether the `.docx` can be safely deleted without loss of ideas.

Do not delete the `.docx` until the Markdown migration has been verified.

---

### 4. Add an archive folder

Create:

```text
documentation/archive/
```

Use this folder only for old documentation that should be preserved but no longer actively guides the project.

Do not archive active files such as:

- `PROJECT_RULES.md`
- `PROJECT_REVIEW.md`
- `Chem_Games_Project_Brief.md`
- `documentation/README.md`
- the new `documentation/IDEA_BACKLOG.md`

---

### 5. Update the documentation index

Update:

```text
documentation/README.md
```

It should clearly explain:

- What each active documentation file is for.
- Which files are active.
- What belongs in the archive.
- That new Markdown files should not be created unless necessary.
- That app-specific notes belong beside the relevant app as local `README.md` files.

---

### 6. Update project rules only if needed

If the cleanup introduces a new rule, update:

```text
PROJECT_RULES.md
```

Do not rewrite the whole file unnecessarily.

Make the smallest useful edit.

---

### 7. Final report

At the end, provide a concise report with:

- Files created.
- Files moved.
- Files updated.
- Files archived.
- Whether the `.docx` was fully migrated.
- Whether it is now safe to delete the `.docx`.
- Any remaining documentation cleanup tasks.

---

## Constraints

- Do not modify app code.
- Do not add frameworks.
- Do not create unnecessary new documents.
- Do not delete files unless explicitly safe and clearly stated.
- Prefer small, reversible changes.
- Keep documentation practical and usable by future AI agents.
- Preserve all meaningful ideas from the `.docx`.
- Keep the documentation system simple enough to maintain.

---

## Success criteria

This task is successful when:

- The project has a clear documentation structure.
- The `.docx` idea backlog has been migrated into Markdown.
- The documentation index explains where future notes should go.
- Active project guidance is easy to find.
- Old or inactive documentation has an archive destination.
- Future AI agents are less likely to create redundant planning files.
