# Nomenclature — design notes (idea capture)

Created: 2026-06-21. Dalia's next build after the Acid/Base Sorter. Captured now so the plan is
ready; **not yet started as a game.** The whole point is a *progressive* concept ladder, mirroring
a real 100-question worksheet Dalia uses.

Companions: `ARCHITECTURE.md`, `ACID_BASE_SORTER_DESIGN.md` (feeds name exposure into this),
existing prototypes in `chem-nomenclature/` (v1–v4, hand-started by Dalia), element/ion databases
in `chem-nomenclature/databases/*.json`.

---

## 1. Source material

- Dalia added the source worksheets to `_teaching-materials/CHEM 101 Nomenclature/` (gitignored,
  local only): a 100-question "Nomenclature Basics" assignment + answer key, an Advanced
  assignment, and a rules/practice sheet. **These are the spec** — the game should follow the
  worksheet's ordering.
- A nomenclature engine was started by hand across `chem-nomenclature/v1`–`v4`; **v4** is the
  current hub link. Decide whether to extend v4 onto the standard module pattern or start a clean
  `nomenclature/` game that imports the shared `databases/` JSON (118 elements + ion lists).

## 2. The progressive ladder (from Dalia's worksheet — preserve this exact order)

Each rung adds exactly one new idea on top of the last:

1. **Ionic, non-variable (type I) metals** — e.g. sodium chloride. Fixed-charge cations.
2. **Ionic, variable-charge (type II) metals** — e.g. copper(II) nitrate. Roman-numeral charge.
3. **Polyatomic ions** — memorize names + charges (the database already has these).
4. **Ionic with polyatomics** — combine, while still tracking type I vs type II metal.
5. **Oxyanion families (one O apart)** — `NaClO, NaClO₂, NaClO₃, NaClO₄` → hypochlorite /
   chlorite / chlorate / perchlorate; the hypo-/-ite/-ate/per- pattern. (Same pattern the Acid/
   Base Sorter previews with `HClO`–`HClO₄`.)
6. **Acids — binary** — `HCl` → hydrochloric acid (hydro-…-ic).
7. **Acids — oxyacids** — `-ate` → -ic, `-ite` → -ous (nitric/nitrous, sulfuric/sulfurous).
8. **Covalent (molecular) compounds** — Greek prefixes, e.g. `P₄O₁₀` (tetraphosphorus
   decoxide), `ICl` / `ClI`-type.

## 3. Likely mechanic (to decide during the build)

- Same predict-then-Check spine. Candidate forms: build-the-name from morpheme tiles
  (prefix / root / suffix / Roman numeral) so the *structure* of the name is constructed, not
  typed — consistent with [[design-challenge-discovery]] (construct, don't guess); OR a
  type-the-name with smart checking. Tiles fit the family better and auto-grade cleanly.
- Memory rung (polyatomic ions) could reuse the **Acid/Base Sorter** flashcard engine — same
  "show one, recall, re-queue misses" loop. Worth factoring the sorter's stack engine to share.
- Strictly gate rungs in worksheet order; a rung unlocks the next. Generate distractors/items
  from the ion databases, not hand-authored, so content scales.

## 4. Open

- Extend `chem-nomenclature/v4` vs fresh `nomenclature/` on the module pattern. (Lean: fresh, but
  read v4 first to salvage logic.)
- How much to auto-generate vs transcribe from the 100-question key (transcribing the key gives a
  guaranteed-correct answer set to test against — the safety-net move).
