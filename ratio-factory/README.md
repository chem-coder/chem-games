# Ratio Factory

First fixed-ratio reasoning game for Chem Games.

## Current App

`index.html` is a standalone Ratio Factory prototype. Each recipe is defined as data
(its parts, how many of each part go into one product, and a starting inventory), and
one shared engine renders, randomizes, scores, and explains every recipe — so adding a
recipe means adding a data entry, not new game logic.

Current behavior:

- includes two everyday-object recipes (Cheese Sandwich, Apple Pie) and four chemistry recipes in moles (Water, Ammonia, HCl, SO₂)
- lets the player switch recipes with the buttons under the title
- shows the recipe `2 bread slices + 1 cheese slice -> 1 cheese sandwich`
- shows the recipe `5 apples + 1 pie crust -> 1 apple pie`
- starts Cheese Sandwich with `11 bread slices` and `4 cheese slices`
- starts Apple Pie with `17 apples` and `4 pie crusts`
- shows balanced-equation recipes such as `2 H₂ + 1 O₂ -> 2 H₂O`, with amounts in moles and the product's coefficient applied (maximum product = reaction runs × that coefficient)
- can generate a new random inventory for the selected recipe, always with a single
  limiting part so the answer is never ambiguous
- asks for maximum complete objects (or maximum moles of product, for a reaction), the limiting part/reactant, and leftover parts/moles
- checks each answer separately
- offers three progressive hints; each hint lowers the possible round score by 1 point
- awards up to 4 points for each solved inventory round (minimum 1 once hints are used); giving up earns 0 points
- explains the fixed-ratio reasoning with full-object counts and leftovers

## Teaching Goal

This game teaches the hidden structure behind limiting-reagent stoichiometry before adding chemical notation.

```text
complete object requires parts in a fixed ratio
possible products = number of full groups from available amount / required amount
the smallest possible-products value controls production
the part that controls production is the limiting part
leftover = available - maximum products * required amount
```

The everyday recipes intentionally avoid chemistry notation. The mole-ratio lens then reuses the identical engine with real formulas and balanced-equation coefficients, still in whole moles — grams and molar mass arrive in a later rung.

## Source Context

This prototype was planned from:

- `../documentation/idea-box/stoichiometry_game_ideas_summary.md`
- the stoichiometry direction in `../documentation/Chem_Games_Project_Brief.md`
- the broader game notebook in `../documentation/GAME_IDEAS_NOTEBOOK.md`

## Run Locally

From the project root:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/ratio-factory/
```

## Next Options

- **Done: the mole-ratio lens** — chemistry recipes now run on the same engine with
  balanced-equation coefficients and mole amounts (rung 2 of
  [`STOICHIOMETRY_WORLD.md`](../documentation/STOICHIOMETRY_WORLD.md)).
- **Next planned step: the mass lens (rung 3)** — let amounts be in grams, convert
  grams ⇄ moles via molar mass, and provide the molar masses so the learner doesn't have to look them up.
- Lift the recipe data out of `js/app.js` into `data/recipes.js` (the array is getting long).
- Add more non-chemical recipes such as deluxe sandwich, car factory, flower builder, or robot builder.
- Make the graphic and answer layout flexible for recipes with more than two input parts (today both grids assume two).
- Add a visual assembly animation that consumes parts into complete products.
- Later map `parts -> reactants`, `recipe -> balanced equation`, `limiting part -> limiting reagent`, and `leftovers -> excess reagent`.
