# Nomenclature — design notes (idea capture)

Created: 2026-06-21. Dalia's next build after the Acid/Base Sorter. Captured now so the plan is
ready; **not yet started as a game.** The whole point is a *progressive* concept ladder, mirroring
a real 100-question worksheet Dalia uses.

Companions: `ARCHITECTURE.md`, `ACID_BASE_SORTER_DESIGN.md` (feeds name exposure into this),
existing prototypes in `chem-nomenclature/` (v1–v4, hand-started by Dalia), element/ion databases
in `chem-nomenclature/databases/*.json`.

---

## Build status — 2026-06-25: SHIPPED (ladder complete)

The "not yet started" framing above is historical. The game is **built and live** at
`nomenclature/builder/`, titled **Chemical Nomenclature** (renamed from "Ionic Name Builder" once it
grew past ionic). It's the standard-module clean build — imports the shared ion data; did NOT extend
`chem-nomenclature/v4`.

**All 5 rungs shipped, both directions** (formula→name AND name→formula, two buttons per tab):
Type I (fixed-charge metals) · Type II (variable → Roman numeral, deduced by charge balance) ·
Polyatomic (metal **or ammonium** + a polyatomic ion) · Acids (H⁺ + anion, named off the ending:
–ide→hydro-…-ic / –ate→…-ic / –ite→…-ous) · Covalent (two nonmetals, Greek prefixes, vowel elision).
Plus a separate first **reference page**: `reference/oxidation-states/` — full PT of every element's
oxidation states shaded by commonness (data: `shared/data/periodic-elements.json`).

**Key decisions this build:**
- **Grading: "formatting → nudge, chemistry → wrong."** Caps / spacing / stray-charge-on-a-neutral-
  compound / extra-symbols are retry *nudges* (don't burn the card, teach the fix); wrong symbols /
  subscripts / counts / parentheses / spelling are marked *wrong*. Accepted-set membership, never regex.
- **Roman-numeral RULE:** any metal with >1 oxidation state in the reference PT gets a numeral
  (so nickel → **nickel(II)**). Two guard tests enforce it: no orphan cations + fixed ⇔ single state.
- The engine (`naming.js` assemble*, `matching.js`) already named acids & covalent (oracle-tested),
  so each rung was mostly builder + UI. **LEVELS-driven** — tabs / dealer / done-screen auto-pick up
  any new rung. ~346 tests green (`nomenclature/builder/js/builder.test.js` + engine suites).
- The worksheets are human-made and contain real typos/mislabels — treat the engine + reference PT +
  IUPAC rules as the rigorous source; the worksheet KEY is a reference, not gospel.

**Possible next:** an **oxidation-state trainer** (Skill B — find Mn = +7 in MnO₄⁻; reuses the
polyatomic ions already drilled; the on-ramp to redox) — a SEPARATE game, NOT a nomenclature rung.

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

---

## 5. Locked decisions (2026-06-22, with Dalia)

- **Fresh `nomenclature/` build** on the standard module pattern (not extending v4). Salvaged the
  ion lists into a new accepted-set data file.
- **Mechanic:** type-tag (I/M/A) → charge bridge for variable-charge metals (the student balances
  to neutral; the Roman numeral is *derived*, not picked) → build the name from morpheme tiles →
  predict-then-Check. Later additions Dalia asked for: a **typed-name quiz** (formula → type the
  full name, the ultimate goal) and a **reverse mode** (name → type the formula with plain digits
  like `(NH4)2Cr2O7`; subscripts format on Check).
- **Ladder reorder:** a **polyatomic-ion triad trainer** (formula+charge ⇄ name ⇄ charge) is a
  prerequisite and slots in *before* "ionic with polyatomics". It can reuse the Acid/Base Sorter's
  flashcard loop.
- **Subscripts** render as real `<sub>` at ≥50% of normal size (house rule across all games).

### 5a. The answer model — accepted-sets, not regex

The thing that blocked the earlier attempt (acetate as `C₂H₃O₂` vs `CH₃COO`) is solved by
*enumerating* every accepted spelling rather than deriving them. Each ion record lists all accepted
`names` and `formulas`; grading normalises the student's input and tests set membership; whole
formulas are matched against the cartesian product of each ion's accepted renderings. Equivalent
names (bicarbonate / hydrogen carbonate) are interchangeable and the alternate is revealed on a
correct answer. Vowel elision: `pentoxide` is canonical/preferred, `pentaoxide` also accepted.

### 5b. Foundation engine — shipped & tested (no UI yet)

- `nomenclature/data/ions.js` — accepted-set ion + element tables. Variable-charge cation list and
  charges follow Dalia's CHEM-101 keys (e.g. **nickel is fixed Ni²⁺**, no Roman numeral).
- `nomenclature/js/chem.js` — pure primitives: Roman numerals, Greek prefixes (mono-drop + elision),
  criss-cross and reverse criss-cross, subscript conversions.
- `nomenclature/js/naming.js` — `assemble(spec)` derives formula + canonical name + all accepted
  spellings for ionic / covalent / acid specs.
- `nomenclature/js/matching.js` — `gradeName` / `gradeFormula` (normalise + accepted-set membership).
- `nomenclature/js/naming.test.js` — 72 tests: primitives, a 60-item worksheet oracle (formula ⇄
  name double-entry), and the acetate/bicarbonate/elision matching cases. Wired into
  `tools/test-guard.mjs`.

### 5d. Polyatomic-Ion Trainer — shipped (first playable)

`nomenclature/` is now a runnable game (linked from the home hub). The trainer drills the three
facets per ion — formula, name, charge — as a short flashcard stack (5–10 ions; longer was brutal):

- `js/triad.js` (+ `triad.test.js`) — pure stack/grading: `buildRound`, `requeue`, `isComplete`,
  `gradeTriad`. Two directions: **recall** (name → type formula + pick charge) and **recognize**
  (formula → type name + pick charge); charge is always asked.
- `data/ion-decks.js` — six themed decks (common 6, less common 5, -ate vs -ite, chlorine
  oxyanions, bromine & iodine oxyanions, hydrogen/bi- ions).
- `js/app.js`, `index.html`, `css/styles.css`, `js/storage.js` — DOM layer, study screen, the card
  (typed input + charge picker, auto-subscripting on Check), missed-pile review, saved mastery.
- Verified in-browser: both directions grade correctly; acetate accepts C₂H₃O₂/CH₃COO/CH₃CO₂ and
  bicarbonate ⇄ hydrogen carbonate, each revealing the equivalent. Subscripts/superscripts render at
  the house size. 82 nomenclature tests green; whole repo green.

**Next:** the type I/II ionic naming builder (type-tag → charge bridge → tiles).

### 5c. Worksheet errors found (need a ruling before that item ships)

- **Item 37 `(NH4)Cr2O7`** → should be `(NH₄)₂Cr₂O₇` (ammonium dichromate). Dalia: corrected.
- **Item 35 `YClO3`** is not charge-neutral (Y³⁺ + one ClO₃⁻). Chemically correct is `Y(ClO₃)₃`.
  The engine assembles the correct formula; the worksheet subscript looks like a transcription
  slip. Confirm whether to fix it or keep verbatim.
- **Common Ions PDF** mislabels CN⁻ as "cyanate"; it's **cyanide** (used correctly elsewhere).
