# Chem Games — Product Strategy

Created: 2026-07-27. **This is the current north-star doc.** It supersedes `ROADMAP.md` wherever the two disagree.

It records the decisions made when the project's goal changed from "a web learning library for one tutoring student" to "a commercial indie chemistry puzzle game." Companion docs: `ARCHITECTURE.md` (how it's built), `NOMENCLATURE_DESIGN.md` (the spine game), `idea-box/README.md` (the raw Steam context notes).

---

## 1. The shift

**Before:** an educational website of chemistry games, built primarily to help Malcolm (IMAT prep, stoichiometry).

**After:** a downloadable **indie chemistry puzzle game** sold on Steam, with a free mobile-friendly web version as the demo and marketing funnel.

The reframing that drove it, from the Steam conversation: *not an educator making a website, but an indie game developer making a chemistry game.* Educational rigor is unchanged — what changes is how the product is experienced, presented, and sold.

**Why now:** the tutoring lane went quiet (see §6), which removed the project's largest source of scope pressure. The stoichiometry track was the biggest and least-finished lane, and it was the priority only because of one student. Without it, the target is small enough to actually ship.

---

## 2. Product #1 — "Chem Games: Nomenclature" (a bundle)

**Decided 2026-07-27.** The first Steam product is a **bundle with Nomenclature as the spine**, not a single game and not a seven-game series.

| Module | Role | Status |
|---|---|---|
| **Chemical Nomenclature** (`nomenclature/builder/`) | **The spine.** 5 rungs, both directions. This is the game. | Built, oracle-tested |
| Periodic Table Memorizer (`periodic-table/`) | On-ramp + bonus/speed round | Built |
| Polyatomic-Ion Trainer (`nomenclature/`) | On-ramp — gated before the Polyatomic rung | Built |
| Oxidation-State Trainer (`oxidation-state-trainer/`) | On-ramp — supports Roman numerals | Built |

**Why a bundle rather than the spine alone** (this reverses the initial recommendation):

1. **Nomenclature does not work without the pre-reqs.** A player who never learned the polyatomic ions doesn't experience "a hard puzzle" when they meet Fe₂(SO₄)₃ — they experience an unfair game and refund it. The on-ramps are what make the spine playable. This is the failure mode that sinks most educational games.
2. **Pacing.** Hours of uninterrupted naming drills is monotonous, and monotony is the top review complaint for puzzle games. Interleaving a fast periodic-table round or an ion-match round is a real design tool.
3. **The modules already exist.** Including them is integration work, not new building.

**The cost to go in with eyes open:** the polish bar now applies to all four. Players judge a bundle by its *weakest* module — four modules at 80% feel worse than one at 95%. The work is *finishing*, plus wiring four things into one shell with one save file and one progression. Be willing to demote a module to "bonus, unscored" rather than let it drag the release down.

**One game, not a series.** Steam Direct is $100 *per product*, each store page needs its own marketing push, and reviews — the real currency on Steam — don't pool across products. One game that grows through free content updates accumulates reviews and gets re-surfaced by the algorithm on each update. Later chemistry topics become modules or DLC in *this* product, not new listings.

---

## 3. The real work is the shell, not the Electron wrap

**Correction to the idea-box notes: there is no Vue in this project.** No `package.json`, no bundler, no framework, no build step — ten self-contained games of plain HTML/CSS/JS. See §5 of `ARCHITECTURE.md`.

Two consequences:

- **Good:** Electron packaging is *easier* than the notes assume. Electron loads a folder of static files; there is no build pipeline to reconcile. This is days, not a rewrite.
- **The reframe:** the wrap is the easy part and is **not** the real work. What exists is ten separate web pages. A Steam game is **one application** with a title screen, save data, settings, audio, achievements, and transitions between modules. That shell is the largest piece of unbuilt work between here and a Steam release. `ARCHITECTURE.md` §3 deliberately parked it ("defer the meta-game shell") — it is now unparked and is the critical path.

**Wrapping ≠ shipping.** Budget accordingly.

---

## 4. Three shells, one codebase

Distribution targets, in priority order:

1. **Web (free)** — the demo and marketing funnel. Must be **mobile-first**; see §7.
2. **Steam / Electron (paid)** — the commercial product.
3. **Native iOS/Android — deferred.** Not now.

**The discipline that makes this survivable: one responsive codebase, three shells, no target-specific forks.** The absence of a framework or build step is what makes this realistic — static files load identically in a browser and in Electron. It has to be a conscious rule from here on, not a retrofit.

### Free vs paid — where the line falls

The web version is a **genuinely generous demo, not the whole game**: roughly the first two nomenclature rungs plus the Periodic Table Memorizer. Free forever, no account, excellent on a phone. Steam gets the complete ladder, progression, save/achievements, music, and polish.

Rationale: the free-web audience (friends, former colleagues, Heritage students) was never going to buy on Steam anyway — that isn't a lost sale, it's word of mouth that feeds the YouTube channel.

### Why native apps are deferred

| Target | Cost | Gets you |
|---|---|---|
| Mobile web | ~free (same codebase; CSS + the input fix) | Works on every phone; instant link sharing |
| **PWA** (manifest + icon) | ~a day | "Add to Home Screen" — real icon, fullscreen launch, offline. Feels like an app. |
| Native app stores | **$99/yr** Apple + $25 Google, app review, per-device screenshots, privacy policy, OS-update maintenance, a third build target | A download button in a store |

For a puzzle game needing no camera, push notifications, or in-app payments, the **PWA delivers ~90% of the native experience for ~5% of the cost**. Revisit native only on evidence of demand — actual people asking "is this in the App Store?"

---

## 5. Two audiences

- **Steam buyer:** an adult who enjoys systems, patterns, and structured puzzles. Sold as a *game*.
- **Web user:** a student who needs to pass chemistry. Phone-first.

Same content, different framing and different marketing voice. Not a problem — but do not write one store page trying to address both.

**Field evidence driving the mobile priority:** many students at Heritage do not own a computer and do everything on a phone. For the learner audience, phone-first is the primary platform, not a concession.

---

## 6. Stoichiometry — demoted, not deleted

The tutoring relationship that motivated the stoichiometry track went quiet (~2 weeks of silence, 6 lessons unpaid as of 2026-07-27). It is no longer a project driver.

**All of that work stays in the repo and stays on the web:** Conversion Conveyor, Conversion Builder, Ratio Factory, and the IMAT stoichiometry app. It becomes a **future module / DLC** — "Chem Games: Stoichiometry" — inside product #1, not the current priority. `ROADMAP.md` Phases 1–3 are demoted accordingly.

This is a demotion, not a deletion. Nothing gets removed.

---

## 7. Mobile — audited 2026-07-27

Every page already has the correct viewport meta tag, so this is CSS plus one real input element, not a rewrite. Ranked by severity:

1. **Periodic Table fill mode is unplayable on touch.** Typing is captured by a document-level `keydown` (`periodic-table/js/app.js:94`) and cells are non-focusable `<div>`s (`:157`) — there is **no `<input>` in fill mode at all**. A phone has nothing to focus, so the soft keyboard never opens and `keydown` never fires. Tapping a cell highlights it and then nothing can be entered. (Quiz mode is fine — it uses a real input.)
2. **`.ptgrid { min-width: 760px }`** (`periodic-table/css/styles.css:114`) on a ~390px screen: ~2.2 screens of horizontal scroll, 39px cells (below the 44px touch-target minimum). Its only breakpoint is cosmetic.
3. **Four games have no width breakpoints at all** — `acid-base-sorter` and `nomenclature` have zero `@media` width queries; both conversion games have motion-only ones. Desktop proportions and type on a phone. This is the "looks kinda dumb" complaint.
4. **`reference/oxidation-states/css/styles.css:27` `min-width: 940px`** — the worst overflow ratio in the repo.
5. **No shared responsive foundation** — `shared/css/tokens.css` has no media queries or fluid type scale, so every game invents its own breakpoint (480/560/600/620/760/850) or skips it.

**Scope rule:** fix mobile on the *funnel* games (the four bundle modules + the hub) first. The rest can follow.

---

## 8. Go-to-market

**Settled route: Steam first, then YouTube to teach and promote.** One correction to the ordering, and it matters:

> **YouTube and a Steam "Coming Soon" page should start *before* launch, not after.**

Steam's launch-day visibility is driven almost entirely by **wishlists accumulated pre-release**; a launch with no wishlist base is buried within a day. YouTube audiences also take months to build. Same total work, dramatically different outcome.

**The moat is correctness, not polish.** This repo has 407 passing tests, an oracle-checked audit against real worksheet keys, mercury(I) correctly modeled as the diatomic Hg₂²⁺, and a Roman-numeral rule with guard tests. No edutainment game on Steam has that. *"Chemistry that is actually right, built by an analytical chemist"* is simultaneously the positioning and the YouTube content.

**Honest expectations:** most indie games earn very little. A well-executed niche puzzle game with a real hook plausibly lands in 4 figures, sometimes 5. The 4–5 figure target is realistic *with good execution*; larger numbers, if they ever come, come from the channel plus institutional/educational licensing — a slower path with a much higher ceiling. No income pressure from the day job is a genuine competitive advantage: it buys the time to build the good version.

**Standing flag:** check the employment **IP-assignment agreement** before selling anything; build on personal time and personal equipment.

### Reference titles

- [`while True: learn()`](https://store.steampowered.com/app/619150/while_True_learn/) — steal the **framing**: a silly premise (understanding your cat) wrapped around real ML content. "Personality without a plot," executed. Note its meta-layer (contracts, money, upgrades) *and* its criticism — reviewers found the puzzles repetitive and the content shallow once novelty faded. The content-depth gap is exploitable here.
- [`Turing Complete`](https://store.steampowered.com/app/1444480/Turing_Complete/) — steal the **structure**: (a) *the verification harness is the game* — you build, it runs test cases, pass/fail, never guessing; (b) *earlier work becomes later tools* — components you build get reused in later levels, which is where its sense of progression comes from. The chemistry analog is direct: mastered ions become tiles wielded in later naming levels, and that is what turns four modules into one game. Also: it is visually plain and sells well — **clarity beats art budget.**

Note that the Conversion Builder and Nomenclature builder already implement the construct-then-verify mechanic, backed by real tests. That shape was arrived at independently and it is the right one.

---

## 9. Working rhythm

- **Cadence:** daily commitment, evenings and weekends.
- **Minimum viable day:** 20 minutes, or one small thing, or playing one level of a reference game and writing two sentences. Research counts. Consistency beats intensity for a project this size; protect the streak by keeping the bar low enough to clear on a bad day.
- **Vacation (~9 days from early Aug 2026):** gardening is the point of the time off. Vacation is for **input** work — playing reference games, watching visualizations, making decisions — which is low-focus and high-value. Heavy building resumes after.

---

## 10. Deliberately not planned yet

**Future chapters/topics beyond nomenclature are intentionally unplanned.** The best ideas here come from reviewing real exam questions and the specific ways students get them wrong — that is evidence-based idea generation, and it is a genuine competitive advantage over a speculative roadmap written in the abstract. Topics get designed **one chapter at a time, when we get there**, after mining the relevant exam material.

Do not replace this with a speculative multi-topic plan.

---

## 11. Current sequence

1. ~~Converge the repo to one clean point~~ — **done** 2026-07-27 (0 unpushed, clean tree, 407 tests green).
2. This document.
3. **Research phase** (vacation-friendly): play the two reference titles, review Marina's chemistry visualization, capture findings in `idea-box/competitive-research-notes.md`.
4. **Fix the Periodic Table touch input** (§7.1) — a real bug, small fix, highest-value mobile repair.
5. **Responsive pass** on the four funnel modules + hub (§7.3–7.5).
6. **Define the shell** (§3) — title screen, save model, settings, progression across four modules.
7. **Vertical slice in Electron** — title → tutorial → a few levels → save/resume → completion screen. Produces the first real screenshots.
8. **Coming Soon page + start YouTube** (§8) — before launch, not after.
