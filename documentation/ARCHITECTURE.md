# Chem Games — Architecture Blueprint

Created: 2026-06-20. This is the durable technical-decisions doc the documentation index anticipated as `TECHNICAL_DECISIONS.md`. It records *how* Chem Games is built, so each new game starts from the same shape instead of reinventing one.

Scope note: this doc is a working blueprint, not a finished system. Sections marked **(planned)** describe agreed direction we have not yet implemented.

---

## 1. Principles (unchanged)

- Vanilla HTML / CSS / JavaScript while the learning loop is still being proven — no framework, build step, backend, or package manager. A framework can be adopted once the loop is proven; we choose which one then, not now.
- Chemistry logic stays separate from rendering.
- Content (reactions, scenarios, elements) stays separate from game logic.
- Small, readable files. Simple functions over clever abstractions.
- Prefer small reversible changes. Preserve working behavior.

---

## 2. The Standard Game Module Pattern

The Visual Equation Balancer is the reference implementation. Every new game should follow its shape:

```text
data/        content only (no logic)        e.g. reactions.js, elements.js
engine.js    pure logic, no DOM, no storage  e.g. balancingEngine.js
renderer.js  builds DOM from state           e.g. balancingRenderer.js
game.js      controller: wires user actions  e.g. balancingGame.js
storage.js   localStorage persistence        e.g. progressStorage.js
app.js       startup entry point
```

Rules of the pattern:

- The **engine** is a pure module: given state in, it returns new state/derived facts. It never touches the DOM or `localStorage`. This is what makes the chemistry testable.
- The **renderer** draws the state it is handed. It does not decide whether something is correct.
- The **controller** is the only place that knows about all three (engine, renderer, storage).
- Modules attach to the `window.ChemGames` namespace.

**Known exception to migrate:** `ratio-factory/` is currently a single 775-line `app.js` with inline data and no persistence. When we extend it into the Stoichiometry World it should be brought onto this pattern (data extracted, engine separated, progress persisted). See `STOICHIOMETRY_WORLD.md`.

---

## 3. The Light Shared Foundation (planned)

Decision (2026-06-20): build a *light* shared foundation now; defer the meta-game "shell" (world map, profile, cross-game XP) until at least three strong loops exist.

Proposed top-level home for shared assets:

```text
shared/
  data/        consolidated chemistry content (see §4)
  css/
    tokens.css design tokens: colors, spacing, element colors/shapes, pills, buttons
  js/
    scoring.js base-score-minus-hints (today duplicated in both games)
    progress.js localStorage helper with a shared key convention
```

This adopts the "dedicated shared `data/` folder" that `PROJECT_RULES.md` left open as a future option. When we create it, update `PROJECT_RULES.md` §Folder Rules and §Database Rules to point shared chemistry data at `shared/data/`.

### 3a. Visual identity & design tokens

**Design direction (2026-06-20):** Chem Games should have its own visual identity and must *not* look like a generic AI-generated web app — specifically, avoid the default Claude Code aesthetic (the ubiquitous Inter/system font, blue-teal SaaS gradient, soft-shadow card grid). Division of labor: the project owner drives **layout** and approves direction by taste; **design execution and detailed aesthetics** (type, color, texture, component styling) are delegated to the assistant. The current Codex design is an acceptable baseline and is open to redesign.

**Locked palette (2026-06-20): "True Autumn"** — the owner's personal color-analysis palette (warm, deep, muted) is the brand. Chosen after reviewing three concepts ("Lab Notebook," "Blueprint," "Bright Periodic"); Bright Periodic's layout/type won, recolored to True Autumn.

- **Primary — deep warm teal** `#1e7268` (dark `#134f48`): the brand center — coefficient controls, progress bar, active level, links.
- **Secondary accent — muted amethyst/plum** `#835f7d` / `#6b4d68`: section eyebrow, points, topic chips, and the dusty-plum alkali-metal atoms. Bright/electric purple is explicitly rejected.
- **Ground** warm beige `#f4eee2`; warm-white cards; espresso ink `#2d2a23`; taupe muted `#897f6d`.
- **States** hunter/pine green for balanced/solved, with a **vivid emerald** `#1f9d5a` reward pop (soft glow + entrance animation) so wins feel rewarding; mustard for medium; terracotta/dusty-rose for review/hard.
- **Element atoms** double as a multi-color accent set (brick oxygen, mustard sulfur, charcoal carbon, denim nitrogen, dusty-plum alkali metals), surfaced as the four-segment accent bar under headers.
- **Type** Outfit (display) + Lexend (body) — deliberately not the default Inter.

These tokens live in `imat-chem-stoichiometry/css/styles.css` `:root` today and lift verbatim into `shared/css/tokens.css`. Honest caveat noted during review: this is a personal/aesthetic palette that leans calm/earthy, so engagement should be validated with real students and the reward states kept vivid.

Today there are three separate stylesheets plus inline tokens in the hub. Pull the shared vocabulary into `shared/css/tokens.css`:

- color palette (surfaces, ink, on-theme accents — not the default blue/teal)
- typography (a deliberate, non-default pairing)
- spacing scale and radius
- **element colors + shapes** (currently encoded in `imat-chem-stoichiometry/data/elements.js` + CSS — reusable across every reaction game, and they double as the brand palette)
- shared components: difficulty pills, topic pills, primary/secondary buttons

Each game keeps its own layout CSS but imports the tokens. This keeps the family visually coherent and makes new games faster to style.

### 3b. Shared scoring

Both games independently implement "base score, minus 1 per hint, floor of 1." Extract once:

```js
// shared/js/scoring.js
ChemGames.Scoring.potentialScore(baseScore, hintsUsed) // => max(1, base - hintsUsed)
```

### 3c. Shared progress + storage key convention

Use one namespaced key per game so a future shell can aggregate without a migration:

```text
chem-games:<game-id>          e.g. chem-games:stoichiometry-world
```

`shared/js/progress.js` wraps read/write/reset with the safe `try/catch` already used in `progressStorage.js`. Per-game progress shape stays game-specific; only the storage plumbing is shared.

---

## 4. Shared content spine (planned)

There are two chemistry data sources today, both buried inside one app each:

- `imat-chem-stoichiometry/data/reactions.js` — 74 reactions, documented as the backbone for future reaction games.
- `chem-nomenclature/databases/*.json` — 118 elements (**with `atomic mass`, `oxidation states`, `type`**), plus monoatomic/polyatomic ion lists.

Plan: consolidate these under `shared/data/` so game #3 does not import from inside game #1's folder.

### Reaction schema — design it before the pipeline grows

The reaction-mining pipeline will keep adding rows. Lock an *extensible* schema now so tagged content does not need re-migration later. Current fields stay; future fields are **optional** and added lazily:

```js
{
  id, title, difficulty, topics, hints,
  reactants: [{ formula, atoms, coefficient }],
  products:  [{ formula, atoms, coefficient }],
  solution:  { reactants: [...], products: [...] },

  // planned optional fields (from GAME_IDEAS_NOTEBOOK Reaction Studio):
  // primaryType, evidence, drivingForce,
  // states, spectatorIons, netIonicEquation, oxidationStates
}
```

Molar masses for the mass-stoichiometry rung come from `elements.json`'s `atomic mass` — no new data entry required.

---

## 5. Chemistry-correctness safety net (committed)

Highest-risk gap today: stored `solution` coefficients are hand-typed and nothing automatically verifies them. A wrong or non-minimal solution would ship silently and erode credibility. This is a committed fix, not optional.

**The hand-authored, human-verified solutions remain the source of truth.** The owner is right to distrust *AI* balancers — an LLM pattern-matching coefficients is exactly the failure mode the hardcoded file exists to prevent. Nothing below generates or overrides those solutions; it only checks them.

Two layers, smallest first:

1. **Validation script (primary, do this).** `tools/validate-reactions.mjs`, run with `node`. It needs no balancer at all — it only confirms the hand-entered answer is self-consistent. For every reaction it asserts:
   - the stored solution actually balances (reuse the engine's `isReactionBalanced`),
   - the solution is the **minimal** positive-integer set (gcd of coefficients is 1),
   - every element in `atoms` has a style entry.

   This alone catches typos and non-minimal coefficients in the data file, which is the real risk.

2. **Deterministic cross-check (optional, later).** A classic *algorithmic* balancer (Gaussian elimination over the atom matrix). This is exact arithmetic, **not AI/LLM** — it is the same provable method chemistry software uses, and it either returns the unique minimal integer solution or proves none exists. It would be used only as a second opinion: if its result disagrees with the hand-entered solution, flag that reaction for the owner to review. It is a referee, never the author. Procedural level generation is explicitly out of scope unless the owner asks for it.

These run outside the browser (Node) and gate new content. They are test infrastructure, not app code, so they do not violate the "no build step" principle for the shipped app.

---

## 6. Deploy (planned)

- **Target:** GitHub Pages from the existing `chem-coder/chem-games` repo. Static, free, no build. URL: `chem-coder.github.io/chem-games/`, with the root hub as the landing page.
- **Safe to publish:** `_teaching-materials/` is gitignored and untracked; nothing private is committed.
- **Sharing with Malcolm:** send the Pages URL; it works on phone, tablet, and laptop with no install.
- **Later, optional:** point a custom domain at Pages (~$12/yr) if a branded URL is wanted. Netlify/Vercel are alternatives if we ever want preview deploys, but Pages is the least-friction first step.
- **Cache-busting (current approach).** Each game's HTML carries an **import map** that remaps every local module to a `?v=<date-tag>` URL. The `.js` files keep clean, version-free relative imports; the version lives *only* in that one HTML file, so a single find-replace of the date-tag busts the whole module graph on deploy. Import-map keys are **document-relative** (`../js/chem.js`, not `/nomenclature/...`), so it works at any base path — localhost or Pages `/chem-games/`. This replaced scattered per-import `?v=` tags, which had drifted out of sync across files (`rev7` / `rev14` / `parents`) and silently shipped a stale `ions.js`/`chem.js` to `naming.js`. Adopted in `nomenclature/` (both games) and `oxidation-state-trainer/`; the older games still use inline `?v=` tags and can convert later.

---

## 7. Conventions quick reference

- Namespace: `window.ChemGames.*`.
- One game = one folder with the §2 module layout.
- Shared assets live under `shared/`, imported with relative paths.
- Storage keys: `chem-games:<game-id>`.
- Cache-busting: one **import map** per game HTML is the only place the `?v=` version lives; bump the date-tag there on deploy (§6).
- New chemistry content is validated by `tools/` checks before it ships.
- All project writing stays in Markdown (per `PROJECT_RULES.md`).
