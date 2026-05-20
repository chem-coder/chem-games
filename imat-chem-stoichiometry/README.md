# IMAT Chemistry Stoichiometry Trainer

First Chem Games vertical slice: a visual equation-balancing game for IMAT chemistry practice.

## Current Scope

- Seventy-four shared reaction records in the current data stack.
- Sixty-nine reactions currently eligible for the equation-balancing practice pool.
- Start menu for choosing difficulty, topic, and practice length.
- Practice sets default to 5 reactions or the matching pool size, whichever is smaller.
- Easy, medium, and hard difficulty labels.
- Topic labels for each reaction.
- Progressive hint data for each reaction.
- Quiet points system based on difficulty and hint use.
- Numbered level grid for jumping between reactions.
- Review Mode for retrying red levels after a solution is shown.
- Coefficient controls for every reactant and product.
- Live atom totals for both sides of the equation.
- Per-element balanced/unbalanced feedback.
- Success state and next-level flow.
- Progress and the currently selected practice set saved in `localStorage`.

## Run Locally

Open `index.html` directly in a browser, or serve the project folder:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/imat-chem-stoichiometry/
```

## File Structure

- `index.html` - app shell and script loading.
- `css/styles.css` - visual design and responsive layout.
- `data/reactions.js` - shared reaction records used by this and future chemistry games.
- `data/elements.js` - visual style metadata for elements.
- `js/balancingEngine.js` - pure balancing logic.
- `js/balancingRenderer.js` - DOM rendering.
- `js/balancingGame.js` - game state and user interactions.
- `js/progressStorage.js` - local progress persistence.
- `js/app.js` - startup entry point.

## Technical Shape

The app is intentionally vanilla HTML/CSS/JavaScript. There is no build step, framework, backend, package manager, or database dependency.

The main flow is:

```text
reaction data
  -> exclude already-balanced-as-written records
  -> selected difficulty/topic filter
  -> active practice set
  -> balancing engine
  -> game state controller
  -> renderer
  -> user interaction
```

The balancing engine is pure logic. It does not read from the DOM or write to storage. That keeps the chemistry rules easier to test and reuse.

The renderer owns DOM creation. It does not decide whether a reaction is balanced; it only displays the state it receives.

The game controller connects user actions to the engine, renderer, and progress storage.

## Reaction Data Model

Each reaction stores:

- `id` - stable identifier for progress tracking.
- `title` - display label for the level.
- `difficulty` - numeric level used for scoring and grouping (`1` easy, `2` medium, `3` hard).
- `topics` - one or more topic labels for pools and filters, such as `combustion`, `acid-base`, `double-displacement`, `formal-equation`, or `redox`.

`formal-equation` marks equations that are useful for coefficient-balancing practice but should not be taught as having a clear net ionic driving force under ordinary aqueous conditions.
- `reactants` - molecules on the left side.
- `products` - molecules on the right side.
- `solution` - expected balanced coefficients.

Reactions whose full solution is `1:1` or `1:1:1:1` style all-one coefficients stay in `data/reactions.js`, but the balancing game excludes them from its menu and practice sets. They are still useful for future games about reaction classification, products, solubility, or equation interpretation.

Each molecule stores:

- `formula` - plain-text chemical formula, such as `H2O`.
- `atoms` - element counts inside one molecule, such as `{ H: 2, O: 1 }`.
- `coefficient` - starting coefficient, usually `1`.

The renderer converts formula digits into HTML `<sub>` elements for display.

## Progress

Progress is saved in `localStorage` under:

```text
chem-games:imat-stoichiometry-balancer
```

Saved state includes:

- current level index
- active practice set filters, question count, and reaction IDs
- whether the intro has been seen
- per-level status
- per-level best score
- hints used on the current/recent attempt

The reset button clears this local progress and returns to the set menu.

## Scoring

Base score by difficulty:

- Easy: 4 points
- Medium: 5 points
- Hard: 6 points

Each revealed hint subtracts 1 point from the current attempt. A solved level always earns at least 1 point unless the learner reveals the solution.

If the learner reveals the solution, the level is marked for review and earns 0 points for that attempt. Resetting that level allows a fresh retry.

## Review Mode

Red levels are levels where the solution was shown before the learner solved the equation independently.

Review Mode focuses only on those red levels. Starting Review Mode resets hint use for the review attempt, keeps the level marked red while the learner works, and turns the level green when it is solved. Review attempts can still use hints, and those hints reduce the score in the normal way.

## Hint Style

Hints should teach a balancing strategy, not just state an atom count. Good hints name where to start, what mismatch to notice, and which species to leave for last because changing its coefficient affects only one element.

The third hint may give one anchor coefficient for one compound, but it must not reveal the full balanced equation.

## Verification

Current manual checks:

- Each JavaScript file passes `node --check`.
- Each stored solution balances correctly through `BalancingEngine.isReactionBalanced`.
- Reactions already balanced as written remain in the shared data stack but are excluded from balancing practice.
- The menu can filter by difficulty and topic.
- The game operates on the selected active set instead of the full reaction pool.

Useful commands:

```sh
node --check imat-chem-stoichiometry/js/balancingEngine.js
node --check imat-chem-stoichiometry/js/balancingRenderer.js
```

## Next Options

Recommended next step: playtest the enlarged pool and then mine the CHEM 1315 Exam 2 files.

Good near-term improvements:

- Add more reactions from CHEM 1315 Exam 2 files and tag them by difficulty/topic.
- Adjust reaction ordering inside pools based on playtest friction.
- Add a more satisfying completion state after each set.
- Add optional keyboard shortcuts for level navigation.
- Tune Review Mode language after playtesting.

Avoid for now:

- user accounts
- backend
- React or other frameworks
- a large platform shell
- complex gamification before more levels exist
