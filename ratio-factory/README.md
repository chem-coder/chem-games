# Ratio Factory

First fixed-ratio reasoning game for Chem Games.

## Current App

`index.html` is a standalone Ratio Factory prototype.

Current V1 behavior:

- uses one everyday-object scenario: Cheese Sandwich Factory
- shows the recipe `2 bread slices + 1 cheese slice -> 1 cheese sandwich`
- starts with available inventory: `11 bread slices` and `4 cheese slices`
- can generate a new random bread/cheese inventory for the same recipe
- asks for maximum complete sandwiches, limiting part, and leftover parts
- checks each answer separately
- offers three progressive hints; each hint lowers the possible round score by 1 point
- awards up to 4 points for each solved inventory round; giving up earns 0 points
- explains the fixed-ratio reasoning with full-sandwich counts and leftovers

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

- Add more non-chemical scenarios such as deluxe sandwich, car factory, flower builder, or robot builder.
- Add a visual assembly animation that consumes parts into complete products.
- Add a chemistry bridge only after the everyday-ratio version feels natural.
- Later map `parts -> reactants`, `recipe -> balanced equation`, `limiting part -> limiting reagent`, and `leftovers -> excess reagent`.
