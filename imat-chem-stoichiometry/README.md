# IMAT Chemistry Stoichiometry Trainer

First Chem Games vertical slice: a visual equation-balancing game for IMAT chemistry practice.

## Current Scope

- Five reaction-balancing levels.
- Coefficient controls for every reactant and product.
- Live atom totals for both sides of the equation.
- Per-element balanced/unbalanced feedback.
- Success state and next-level flow.
- Progress saved in `localStorage`.

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
- `data/reactions.js` - balancing level data.
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
- `difficulty` - lightweight sorting/grouping metadata.
- `reactants` - molecules on the left side.
- `products` - molecules on the right side.
- `solution` - expected balanced coefficients.

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
- completed reaction IDs

The reset button clears this local progress and starts again from level 1.

## Verification

Current manual checks:

- Each JavaScript file passes `node --check`.
- Each stored solution balances correctly through `BalancingEngine.isReactionBalanced`.
- The app, CSS, and JavaScript files load from the local dev server.
- The five starter levels can be played in the browser.

Useful commands:

```sh
node --check imat-chem-stoichiometry/js/balancingEngine.js
node --check imat-chem-stoichiometry/js/balancingRenderer.js
```

## Next Options

Recommended next step: add more reactions before building a larger gamification system.

Good near-term improvements:

- Add 10-20 more reaction levels.
- Group levels by difficulty.
- Add hints for each reaction.
- Add a simple level-select view.
- Add a more satisfying completion state after the final level.

Avoid for now:

- user accounts
- backend
- React or other frameworks
- a large platform shell
- complex gamification before more levels exist
