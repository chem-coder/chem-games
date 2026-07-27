# Handoff prompt — make the Periodic Table Memorizer playable on a phone

Written 2026-07-27 for a **fresh chat**. Copy everything below the line into a new session. Diagnosis is already done and verified — the prompt exists so the next session doesn't rediscover it, and so it doesn't fall into the traps in §4, which are where this task actually goes wrong.

---

## Context

You're working on **Chem Games** (`/Users/Dalia/Developer/JS-Chem_Games`), a collection of chemistry learning games by Dalia, a chemist. Stack: **vanilla HTML/CSS/JS. No framework, no build step, no npm, no bundler.** Tests run with Node's built-in runner (`node --test`). ES modules load directly in the browser.

The project is being aimed at a **Steam release** (an indie chemistry puzzle game) with a **free mobile-friendly web version as the demo and marketing funnel**. Read `documentation/PRODUCT_STRATEGY.md` first — §7 is the mobile audit this task comes from. Many of Dalia's students do all their work on a phone and own no computer, so mobile is a primary platform for the web build, not an afterthought.

**Work style she wants:** discuss before large changes; plain language over jargon; she is a domain expert in chemistry and an amateur-but-capable developer. Small reversible changes. Don't refactor beyond the task.

## 1. The job

**Fill-the-table mode in `periodic-table/` cannot be played on a phone at all.** Fix that, and make the board usable by touch. This is the highest-value mobile repair in the repo — it's the most shareable game and it's currently a dead end for phone users.

## 2. The diagnosis (already confirmed — don't re-derive)

**Root cause: there is no focusable text input anywhere in fill mode.**

- Typing is captured by a **document-level `keydown` listener** — `periodic-table/js/app.js:94`.
- Cells are rendered as plain **non-focusable `<div>`s** with no `tabindex` — `app.js:157`.
- The "typing" indicator is a **fake caret** — a `<span>` plus an `<i class="caret">`, not a real field — `app.js:156`.
- Tapping a cell only sets state; it focuses nothing — `activate()` at `app.js:23`.

Consequence on iOS/Android: nothing is focusable, so the soft keyboard never opens and `keydown` never fires. The player taps a square, sees it highlight, and then has **no way to enter a symbol**.

**Quiz mode is fine** — it uses a real `<input id="quizInput">` (`app.js:215`) with `autocomplete="off"`, `autocapitalize`, `.focus()` at `:241`, and a font-size large enough that iOS doesn't zoom. **Use it as the reference implementation.**

Secondary problem — the board itself:
- `periodic-table/css/styles.css:114` — `.ptgrid { min-width: 760px }` with `grid-template-columns: repeat(18, 1fr)` (`:112`), inside `.ptwrap { overflow-x: auto }` (`:109`). On a ~390px phone that's **~2.2 screens of horizontal scrolling** and **~39px cells** — below the 44px minimum touch target.
- The only media query (`:166`) is cosmetic — it shrinks `.cell .sym` font-size and never touches `min-width`.
- `.cell:hover` (`:132`) does nothing on touch.
- On-screen copy assumes a keyboard: `app.js:173` *"type the symbol, then Enter or an arrow key. (Esc to cancel.)"* and `:176` *"Click a square (or press an arrow key to start)…"*

## 3. Files in scope

```
periodic-table/index.html          # loads js/app.js?v=20260702-pt7 ; #game is the render root
periodic-table/js/app.js           # DOM layer for BOTH modes — the file to change
periodic-table/css/styles.css      # grid + cell styling
```

**Do not touch** `periodic-table/js/game.js` or `quiz.js` — those are the pure, tested logic modules and the bug is not in them.

## 4. Traps — read before writing code

These are the specific ways this task fails. They're why the prompt is this long.

**① `render()` destroys the whole UI on every keystroke.** `app.js:235` is `root.innerHTML = modeTabs() + scopeTabs() + …`, and it's called after *every* buffer change. If you put the new input **inside `#game`**, every letter typed will destroy and recreate it — focus is lost, and on a phone **the keyboard closes after each character**. It will look like it works on desktop and be unusable on a phone.

**→ Strong recommendation: put the persistent input OUTSIDE the `#game` root** (a sibling element in `index.html`), so `render()` can't destroy it. That's far simpler and safer than refactoring `render()` to do surgical DOM updates. If you take a different approach, you must explicitly solve focus survival across re-renders.

**② iOS will not open the keyboard for a hidden input.** `display:none`, `visibility:hidden`, and zero-size elements are not focusable. Use a real, focusable input that is visually unobtrusive — e.g. positioned over/near the active cell, or clipped with opacity — but genuinely present and focusable.

**③ iOS zooms the page when a focused input has `font-size < 16px`.** Set at least 16px on the input. (Quiz mode already handles this — `styles.css:66`.)

**④ `.focus()` must happen inside the user-gesture call stack.** Focusing later — in a `setTimeout`, after an `await`, or in a callback detached from the tap — is blocked by mobile Safari and the keyboard silently never appears. Call it synchronously in the tap-handling path.

**⑤ Don't double-handle keystrokes on desktop.** The document `keydown` at `app.js:94` currently appends letters to `buffer`. Once a real input is focused, its own events fire *and* bubble to `document` — you'd get every letter twice. Reconcile deliberately: make the input the single source of truth for text (via its `input` event), and keep the document handler only for what it must still do (e.g. pressing an arrow when no cell is active — see `arrow()` at `app.js:39`).

**⑥ Desktop behavior must not regress.** It currently works well and Dalia uses it. Preserve: click a cell → type → **Enter** submits; **arrow keys** move (and commit a correct answer in passing — `app.js:42`); **Backspace** edits; **Escape** cancels; arrow-with-nothing-active starts at the first unfilled cell.

**⑦ Bump the cache-busting tag when you change JS.** This game uses inline `?v=` query tags, not an import map: `index.html:25` loads `js/app.js?v=20260702-pt7`, and `app.js:3–5` import `pt-data.js` / `game.js` / `quiz.js` with the same tag. ES module imports are **not** busted by the script tag — stale modules have silently shipped before (see `documentation/ARCHITECTURE.md` §6). Update the tag consistently.

## 5. The board-size judgment call — discuss before deciding

An 18-column periodic table genuinely does not fit a 390px screen. There's no free lunch; pick deliberately and say why:

- Keep horizontal scrolling but enlarge cells to ≥44px (better taps, **more** scrolling).
- Auto-**`scrollIntoView`** the active cell so the player never hunts for it. *(Worth doing regardless of the option chosen — likely the single biggest UX win here.)*
- A mobile-specific layout — e.g. scoped/period views that show fewer columns at a time. Note the game already has scopes (`SCOPES`, `poolForScope` in `game.js`), so a narrow scope may already fit.
- Pinch-zoom.

**Constraint that decides it: fill mode must be genuinely *completable* on a phone**, not merely technically operable.

Also update the desktop-only instruction copy (`app.js:173`, `:176`) so it makes sense to a touch user.

## 6. Constraints

- **407 tests currently pass** (`node --test $(find . -name '*.test.js' -not -path './.git/*')`). They must still pass. **But note they do not cover `app.js`** — it's the untested DOM layer — so tests passing is *not* evidence your fix works. Verify in a real mobile viewport.
- Match the surrounding code style: terse, comment-light but with a real comment where the *why* isn't obvious, `const`/arrow helpers, no new dependencies.
- **Do not** add a framework, build step, or npm package.
- **Do not** refactor `render()`'s architecture beyond what the fix needs.
- House rules: subscripts in formulas render ≥50% of normal size (not the tiny default); "predict, then explicitly Check" — never auto-reveal an answer on first interaction.
- Git: this repo sometimes has parallel sessions on one branch — **commit explicit paths, never `git add -A`.** End commit messages with `Co-Authored-By: <your model> <noreply@anthropic.com>`.

## 7. Definition of done

1. On a **390px-wide viewport**, tapping an empty cell opens the soft keyboard and typing a symbol enters it, visibly, in that cell.
2. Enter (or the keyboard's Go/Done) submits; a correct answer fills the cell and advances; a wrong answer shakes and clears.
3. The keyboard **stays open** across consecutive letters and across cells — it must not flicker or close per keystroke (this is trap ①).
4. The active cell is **visible** without manual horizontal scrolling.
5. Touch targets are **≥44px**, or the chosen layout makes the tap comfortable another way.
6. **Desktop is unchanged** — verify every interaction in trap ⑥ by hand.
7. Instruction copy makes sense on touch.
8. Full suite still green; `?v=` tag bumped.

## 8. How to verify (do this — don't ask Dalia to check manually)

Use the **Browser preview tools**, not Bash, to run the server. There's a `.claude/launch.json` with a `chem-games` config (`python3 -m http.server 8123`) — `preview_start` with `{name: "chem-games"}`, then navigate to `/periodic-table/`.

- `resize_window` to **375×812** (iPhone) to test touch layout, and back to desktop to check for regressions.
- `read_page` to confirm a real focusable `<input>` exists in fill mode.
- `computer` click/type to drive the interaction; `read_console_messages` for errors.
- Take a screenshot at mobile width as proof.

**Caveat:** a desktop browser at a narrow viewport does **not** reproduce iOS soft-keyboard behavior. The preview can prove the input exists, is focusable, and survives re-renders — it cannot prove the keyboard opens. So reason carefully about traps ②–④ from the code, and flag clearly for Dalia that final confirmation needs a real phone against the deployed GitHub Pages site.

## 9. Start by

Reading `periodic-table/js/app.js` in full (248 lines — read all of it; the two modes share state and the render loop), then `periodic-table/css/styles.css:108–169`, then `PRODUCT_STRATEGY.md` §7. Then **tell Dalia your plan for the input mechanism and the board-size choice (§5) before you write code** — she prefers to discuss approach first, and §5 is a genuine product decision, not a technical detail.
