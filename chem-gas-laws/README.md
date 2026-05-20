# Chem Gas Laws

First gas-laws prototype for Chem Games.

## Current App

`index.html` is a standalone balloon temperature prototype for Charles' law.

Current V1 behavior:

- shows a red/pink transparent balloon suspended in an outdoor scene
- shows gas molecules inside the balloon
- changes the outside environment by temperature
- shows snow when the outside temperature is below 0 C
- shows summer when the outside temperature is 25 C or higher
- uses spring/autumn states for middle temperatures depending on whether temperature is moving up or down
- shows a `T` temperature marker with an up/down arrow
- changes the balloon size and particle speed as temperature changes

## Teaching Goal

The first gas-laws component should make the particle-level relationship visible before adding pressure, formula work, or calculation practice.

For Charles' law:

```text
temperature increases -> gas particles move faster -> balloon volume increases
temperature decreases -> gas particles move slower -> balloon volume decreases
```

## Run Locally

From the project root:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/chem-gas-laws/
```

The page can also be opened directly from `index.html`.

## Source Context

This prototype was planned from:

- `_teaching-materials/CHEM 101 and 111 - Gas Laws/Ch 11 v6.pptx`
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/Chapter 11 Quiz (Gases).docx`
- the gas-laws source review in `../documentation/GAME_IDEAS_NOTEBOOK.md`

## Next Options

- Tune the balloon art and seasonal environment after project-owner review.
- Add the pressure representation the project owner specifies next.
- Decide how/when to reveal the Charles' law formula.
- Add a simple challenge mode only after the visual model feels right.
