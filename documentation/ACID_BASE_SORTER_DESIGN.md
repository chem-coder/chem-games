# Acid / Base Sorter — design spec

Created: 2026-06-21. Dalia's idea, captured the day Malcolm started Acids & Bases. A
flashcard-style **classification drill**: show a formula, the student classifies it along a few
axes, then Checks. Built first because it's timely and it quietly previews nomenclature.

Companions: `ARCHITECTURE.md` (module pattern, shared tokens, tests), `NOMENCLATURE_DESIGN.md`
(the next build this feeds into), project memory [[design-challenge-discovery]],
[[predict-before-reveal]].

---

## 1. The mechanic

- A deck (~20 acids; a parallel ~10-card base deck) is a **stack**. One card shows at a time,
  **formula only** (e.g. `H₂SO₄`). The name is hidden — it's the answer side of the flashcard.
- The student sets a selection on each **classification axis** (buttons, single-select per axis),
  then taps **Check** (predict-then-Check — nothing is graded until Check).
- On Check: each axis is marked right/wrong, the correct option is highlighted on any miss, and
  the **name is revealed** ("H₂SO₄ — sulfuric acid"). This is the deliberate nomenclature
  exposure: the student meets acid names *before* the nomenclature unit, without being drilled on
  spelling.
- **Spaced-repetition-lite:** a fully-correct card leaves the stack (mastered); any miss sends the
  card to the **back of the stack** to come around again. Done when the stack is empty.
- Progress: "Mastered X of N", plus how many remain in the stack.

## 2. The axes

**Acids** (three axes):
- **Strength** — Strong vs Weak. (Strength was the first thing Malcolm learned.)
- **Protons** — Monoprotic vs Polyprotic (number of *ionizable* H — note acetic `HC₂H₃O₂` is
  monoprotic despite 4 H).
- **Type** — Binary (H + nonmetal, no O) vs Oxyacid (contains O).

**Bases** (three axes, the honest parallel — "binary vs oxy" has no meaning for bases):
- **Strength** — Strong vs Weak. Strong = the memorize set: soluble group-I hydroxides
  (LiOH, NaOH, KOH, RbOH, CsOH) + heavy group-II hydroxides (Ca(OH)₂, Sr(OH)₂, Ba(OH)₂).
- **Form** — Metal hydroxide (contains OH) vs Molecular (ammonia / amines).
- **OH⁻ given** — Monoacidic (one OH⁻ / accepts one H⁺) vs Polyacidic (two+). The base parallel
  to the acids' mono/polyprotic. Excludes solubility as an axis (it overlaps strength and the
  Mg(OH)₂ "dissociates-but-insoluble" trap muddies it).

Axes are **data-driven** (`deck.axes`), so adding a deck or an axis is just content.

## 3. Content + correctness (the safety net matters here)

Chemistry must be right — this is a memorization tool, so a wrong card teaches a wrong fact.
`sorter.test.js` guards what's derivable, mirroring `validate-reactions`:

- **Strength** ⟺ membership in the canonical taught sets. Strong acids = the 7:
  `HCl, HBr, HI, HNO₃, HClO₄, H₂SO₄, HClO₃`. Strong bases = group I + heavy group II hydroxides:
  `LiOH, NaOH, KOH, Ca(OH)₂, Sr(OH)₂, Ba(OH)₂`. The test asserts a card is "strong" **iff** it's
  in the set.
- **Type/Form** is auto-checkable from the formula: oxyacid ⟺ formula contains `O`; metal
  hydroxide ⟺ formula contains `OH`.
- **Protons**: polyprotic ⟹ formula starts `H₂`/`H₃` (sanity guard; the exact count stays
  hand-authored because ionizable-H ≠ total-H).
- Every card carries an answer for every axis of its deck, plus a name.

Deliberately excluded for v1 to avoid genuine ambiguity: `Mg(OH)₂` (solubility-vs-strength
debate), boric/phosphorous acids (atypical proticity), borderline-strength oxyacids like `HIO₃`.

## 4. Build shape (follows the standard pattern)

`acid-base-sorter/`
- `data/decks.js` — content only: acids deck, bases deck (axes + cards). No logic.
- `js/sorter.js` — pure: `gradeCard(axes, card, selections)` → per-axis correctness + allCorrect;
  `requeue(queue, allCorrect)` → drop on master, move-to-back on miss. No DOM.
- `js/sorter.test.js` — engine behavior + the correctness guards above. Added to
  `tools/test-guard.mjs` SUITES.
- `js/app.js` — controller/renderer (deck tabs, card, axis buttons, Check→reveal→Next).
- `index.html`, `css/styles.css` — True Autumn tokens, the family look.
- Hub card; deploys with the rest on Pages.

## 4b. Intro / explainer screen (added 2026-06-21)

Each deck opens on an **Introduction** before the stack (not straight into cards):
- A one-line blurb, then a ~3-line explainer per concept with **example chips** (Strong: HCl,
  HNO₃ … / Weak: HF, …) so each axis is shown, not just told.
- A **highlighted periodic table** — the mnemonic Dalia uses at the board. Bases: group 1 +
  Ca/Sr/Ba glow (strong), Be/Mg flagged (not strong) — the whole strong-base list read off the
  table. Acids: the halogens below F (HCl/HBr/HI) glow, HF flagged as the weak exception.
- "Start the … stack →" begins play; an "↩ Intro" link returns any time.

`js/periodic-table.js` is a **pure** SVG builder — `renderPeriodicTable(highlight, palette)` over
a full 118-element layout. Reusable; promote to `shared/` when the nomenclature game wants it.
Guarded by `periodic-table.test.js`: highlighted symbols must be real elements, legends must be
palette-backed (catches a typo'd `highlight` map).

## 4c. Memorize lists + richer intro (added 2026-06-22)

- **Complete "memorize these" lists**, chunked to mirror the periodic table — and **test-guarded
  to be the exact canonical set** (acids: the 7; bases: the 8), tied to the deck's strong cards so
  they can never silently drift to a partial subset. Acids chunk as N&S oxyacids / Cl oxyacids /
  binary halogen acids; bases as Group 1 / Group 2 columns. **FrOH is a footnote, not a memorize
  item** (radioactive, never studied).
- **Periodic table** now also marks **N and S** as oxyanion central atoms, and renders **Cl as a
  two-tone diagonal split** (it's both a strong binary acid *and* the central atom of HClO₃/HClO₄).
  `renderPeriodicTable` accepts an array of two categories per cell for this.
- **HCN naming note** (acids): explains "binary" means "no oxygen," not "two elements" — placed in
  the classification section, not the strong list (HCN is weak).
- **Molecular bases**: short lone-pair explainer + Lewis structures (NH₃, CH₃NH₂) drawn with the
  lone pair on N, in `js/structures.js`, as the visual clue for proton-accepting capacity.
- Flashcard tweaks: the name reveal is boxed + larger (a student couldn't miss it); the formula is
  ~5% smaller. Guarded by `intro.test.js` + the extended `periodic-table.test.js`.

## 4d. Coverage-aware rounds + Mix mode (revised 2026-06-22)

**Short, coverage-aware rounds.** Rounds are 8 cards (acids/bases) or 10 (Mix). The old "every
strong species every round" rule is **gone** — saved progress now guarantees coverage instead.
`buildStack(deck, stats, size, rng)` (pure, `js/sorter.js`) prefers cards **not yet mastered,
least-seen first**, topping up with mastered cards only if a round would be short. So rounds rotate
through the whole pool rather than repeating the same few. Needed a `seen` counter in `stats.js`.
Guarded by `sorter.test.js`: mastered cards are deprioritised, least-seen come first, a finished
pool still fills (review). Verified in-browser: 0 overlap across consecutive rounds; ~24/26 acids
covered in 3 rounds.

**Mix mode** (`mix` deck, derived from the acids+bases decks so it can't drift): two axes only —
**Acid or base?** and **Strong or weak?** — across all 49 species, 10 per round, its own saved
progress. Lighter intro (no periodic table / memorize list — `renderIntro` makes those optional).

**Carboxylic-acid card** on the acids intro: explains the –COOH "acidic H at the end" so the
carboxylic formulas (HCOOH, CH₃COOH, C₆H₅COOH, CH₂ClCOOH) don't confuse — especially in Mix, which
surfaces less-common species.

Cache note: `app.js` version-tags its whole import graph (`?v=`), so one release bump busts every
module — without it a returning visitor could load a stale engine against fresh data (blank page).

## 5. Future expansion (multistage — notes for next sessions)

The current build is "good enough for Malcolm to memorize his strong acids/bases and learn a few
things about the rest." Next stages, roughly in order:

1. **Per-user mastery tally (localStorage).** Persist which cards are mastered vs missed across
   sessions (`chem-games:acid-base-sorter` per ARCHITECTURE §3c). Then shorter ~10-card rounds can
   prioritise not-yet-mastered and recently-missed cards (spaced repetition with memory), instead
   of resampling blind each round. This is the main reason rounds are a separate concept from the
   deck.
2. **Per-axis weak-spot stats.** Track which axis trips the student most (strength? proticity?),
   surface it, and weight the sample toward weak spots.
3. **More content from the course.** PDF tooling is now installed (`poppler`; see
   [[pdf-reading-tooling]]). Done a first pass from the CHEM 1415 Exam 3 Ka/Kb tables: added weak
   acids (formic, benzoic, lactic, chloroacetic, hypoiodous, iodic, phosphorous) and weak bases
   (trimethylamine, propylamine, piperidine). Deliberately skipped guard-breaking species —
   hydrazine (di-acidic base), hydroxylamine (molecular but has "OH"), and organic *polyprotic*
   acids (citric/tartaric, which don't start H₂/H₃). Revisit by relaxing the OH-count / polyprotic
   guards if those are wanted. Every addition still passes the guards (strength ⟺ canonical set;
   type ⟺ O; form ⟺ OH; OH-count).
   - Formula subscripts now render as real `<sub>` markup (`formulaHtml()` in app.js, sized 0.72em
     in CSS) instead of tiny unicode glyphs, so long formulas like C₆H₅COOH read clearly.
4. **End-of-round review** of just the cards that were missed, and a "strong-only speed round."
5. **"Same acid, many spellings" mode (Dalia's idea, 2026-06-22).** A short stack where one acid is
   shown, and on Check it reveals the *other* accepted ways to write it — but presented as a
   **logical progression, one small change per row** (e.g. CH₃COOH → CH₃CO₂H [COOH→CO₂H] →
   HC₂H₃O₂ [H to front, acetate as C₂H₃O₂] → HCH₃COO / HCH₃CO₂ [acetate as CH₃COO/CH₃CO₂]), NOT a
   flat confusing list. Show each transformation in a column so the equivalence is obvious. Only
   real-world variants that actually appear in books/online. The accepted-set matching model in the
   nomenclature engine ([[nomenclature-plan]]) is the natural backbone — reuse it rather than
   re-deriving. A static disclaimer card ("Same acid, written many ways") already ships on the
   acids intro as the lightweight first step.

## 6. Later / open

- A "missed pile" review at the end; per-axis weak-spot stats (which axis trips him most).
- More cards once the mechanic proves out; possibly a third axis for bases (number of OH).
- Tie-in: the Sorter's revealed names are the hand-off into `NOMENCLATURE_DESIGN.md`.
