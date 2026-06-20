# Stoichiometry World — Product & Engine Design

Created: 2026-06-20. The near-term product direction: connect the existing Ratio Factory and Visual Equation Balancer into one continuous stoichiometry learning track, then extend it through mass, limiting reagent, and percent yield.

Origin: the project owner's plan — Malcolm enjoyed Ratio Factory but struggles with stoichiometry. Next he needs the *same* reasoning with real chemical formulas, then masses, then yields. This doc turns that into an architecture.

Related: `ARCHITECTURE.md` (how we build), `ROADMAP.md` (when), `GAME_IDEAS_NOTEBOOK.md` (Ratio Factory source), `Chem_Games_Project_Brief.md` §18 (stoichiometry skill path).

---

## 1. Core insight: one engine, changing lenses

Fixed-ratio production, mole ratios, and mass stoichiometry are the **same math**. A recipe is:

```text
inputs (each needed in a fixed amount per product)  ->  product(s)
```

Ratio Factory's `getScenarioAnswer` already computes the whole thing generically:

```text
possibleProducts[part] = floor(available[part] / perProduct[part])
maxProducts            = min over parts of possibleProducts
limitingPart           = the part(s) achieving that min
leftover[part]         = available[part] - maxProducts * perProduct[part]
```

That is limiting-reagent stoichiometry. The everyday objects are a costume over it. So each new rung is **a config + a unit lens**, not new logic.

| Rung | `perProduct` from | `available` measured in | New piece to build |
|---|---|---|---|
| 1. Fixed ratios (today) | recipe (2 bread : 1 cheese) | counts | — already exists |
| 2. Mole ratios | **balanced-equation coefficients** | moles (whole molecules) | swap food tiles → formula tiles |
| 3. Mass stoichiometry | same coefficients | grams ⇄ moles via molar mass | a molar-mass conversion lens |
| 4. Limiting reagent | same | moles or grams | surface the already-computed limiting part |
| 5. Theoretical & % yield | same | grams | `theoretical = maxProducts × productMolarMass`; `% = actual/theoretical` |

---

## 2. How the balancer plugs in

The Visual Equation Balancer produces a *balanced equation*. Rung 2 *consumes* coefficients from a balanced equation. So:

```text
Balancer (balance it)  ->  Mole-ratio rung (now use those coefficients)
```

This is the in-world answer to "why do I have to balance this?" Balancing stops being a chore and becomes step one of making a product. The two existing apps become the first two rooms of one world.

---

## 3. The unifying "recipe" data model (planned)

One shape serves both food scenarios and chemical reactions. The engine never needs to know which it is looking at:

```js
// everyday recipe (Ratio Factory today)
{ id, kind: "everyday", inputs: [{ id:"bread", perProduct:2 }, { id:"cheese", perProduct:1 }],
  product: { id:"sandwich", perBatch:1 } }

// chemical recipe (derived from a balanced reaction)
{ id, kind: "reaction", reactionId: "methane_combustion",
  inputs: [{ species:"CH4", perProduct:1 }, { species:"O2", perProduct:2 }],
  products:[{ species:"CO2", perProduct:1 }, { species:"H2O", perProduct:2 }] }
```

A chemical recipe can be generated directly from a balanced reaction record's `solution` coefficients, so the reaction database doubles as the recipe source. Molar masses for rungs 3–5 come from `elements.json` (`atomic mass`).

---

## 4. The representation (unit) lens

The engine math is identical across rungs; only the *displayed unit* and any pre/post conversion change. Keep this in a thin lens layer so the engine stays pure:

- **counts** (rung 1): show "11 bread slices".
- **moles** (rung 2): show "3 mol O₂"; reasoning is still whole groups.
- **grams** (rung 3+): convert `grams → moles` (`÷ molar mass`) before the engine, and `moles → grams` (`× molar mass`) after, for leftovers / yield.

Teaching rule (from the notebook): a conversion is not a rounding exercise. Keep the ratio logic correct first; layer significant figures on afterward.

---

## 5. Pedagogical spine: concrete → abstract

Each rung removes one layer of scaffolding, never two at once:

1. **Everyday objects** — no chemistry symbols. (Ratio Factory: comfortable.)
2. **Formulas, still counted** — same reasoning, now `H₂ + O₂`. The *only* new thing is notation.
3. **Masses** — introduce molar mass as the bridge from grams to "how many groups."
4. **Limiting reagent named** — the part that runs out now has its chemistry name (limiting reagent / excess reagent).
5. **Yield** — theoretical vs actual, the first place a number is "less than perfect."

Malcolm-first: rung 2 is the immediate build, because it is the smallest step from what he already enjoys.

---

## 6. What stays out (for now)

- No mole↔particle (Avogadro) detour inside this track yet; it can be a sibling game.
- No gas stoichiometry here — that belongs with the Gas Laws lane (notebook open question).
- No shared world-map shell yet; the rungs can ship as a single multi-stage game first.

---

## 7. Open design questions

- Should the five rungs live as **stages inside one game** (`stoichiometry-world`) or as separate linked pages? Leaning: one game, staged, with a shared engine — it is the whole point of §1.
- For rung 2, do we hand-author chemical recipes or auto-derive them from existing balanced reactions? Auto-derive is cleaner once the validation script (`ARCHITECTURE.md` §5) guarantees the solutions are correct. (Here "auto-derive" only means reading coefficients from the human-verified `solution` — deterministic copying, not AI balancing.)
- How much assembly animation (parts consumed into products) is worth building before rung 3?
- Where does the balancer handoff live — a "now use it" button at the end of a balance, or a separate rung-2 entry that references a pre-balanced reaction?
