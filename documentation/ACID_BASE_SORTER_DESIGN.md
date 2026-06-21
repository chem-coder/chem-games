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

**Bases** (two axes, the honest parallel — "binary vs oxy" has no meaning for bases):
- **Strength** — Strong vs Weak.
- **Form** — Metal hydroxide (contains OH) vs Molecular (ammonia / amines).

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

## 5. Later / open

- A "missed pile" review at the end; per-axis weak-spot stats (which axis trips him most).
- More cards once the mechanic proves out; possibly a third axis for bases (number of OH).
- Tie-in: the Sorter's revealed names are the hand-off into `NOMENCLATURE_DESIGN.md`.
