# Ratio Factory

First fixed-ratio reasoning game for Chem Games.

## Current App

`index.html` is a standalone Ratio Factory prototype. Each recipe is defined as data
(its parts, how many of each part go into one product, and a starting inventory), and
one shared engine renders, randomizes, scores, and explains every recipe — so adding a
recipe means adding a data entry, not new game logic.

Current behavior:

- includes two everyday-object recipes: Cheese Sandwich Factory and Apple Pie Factory
- lets the player switch recipes with the buttons under the title
- shows the recipe `2 bread slices + 1 cheese slice -> 1 cheese sandwich`
- shows the recipe `5 apples + 1 pie crust -> 1 apple pie`
- starts Cheese Sandwich with `11 bread slices` and `4 cheese slices`
- starts Apple Pie with `17 apples` and `4 pie crusts`
- can generate a new random inventory for the selected recipe, always with a single
  limiting part so the answer is never ambiguous
- asks for maximum complete objects, the limiting part, and leftover parts
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

The first version intentionally avoids molecules, equations, molar mass, grams, and chemistry symbols.

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

- **Next planned step: the mole-ratio lens** — reuse this same engine to show a real
  balanced equation (e.g. `4 Na + O₂ -> 2 Na₂O`) with mole amounts instead of food parts,
  per [`STOICHIOMETRY_WORLD.md`](../documentation/STOICHIOMETRY_WORLD.md) rung 2.
- Add more non-chemical recipes such as deluxe sandwich, car factory, flower builder, or robot builder.
- Make the graphic and answer layout flexible for recipes with more than two input parts (today both grids assume two).
- Add a visual assembly animation that consumes parts into complete products.
- Later map `parts -> reactants`, `recipe -> balanced equation`, `limiting part -> limiting reagent`, and `leftovers -> excess reagent`.
