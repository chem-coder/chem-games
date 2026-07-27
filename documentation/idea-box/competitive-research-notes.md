# Competitive Research Notes

Started 2026-07-27. A worksheet to fill in **while playing**, so the research phase produces decisions instead of impressions. Rough is fine — this is idea-box material. Durable conclusions graduate to `../PRODUCT_STRATEGY.md` or `../GAME_IDEAS_NOTEBOOK.md`.

**How to use:** play for 30–60 minutes, then answer the questions below in a few lines each. Don't try to finish these games. The goal is to steal structure, not to complete them.

The single most useful habit: **whenever you feel something — bored, stuck, delighted, cheated — write down what caused it.** That reaction is the data. Mechanics can be copied; knowing *why* a moment worked is the hard part.

---

## `while True: learn()`

https://store.steampowered.com/app/619150/while_True_learn/

**What to look for:** the *framing*. It wraps genuinely real machine-learning content in a silly premise (a programmer trying to understand their cat). That's "personality without a plot" — the distinction in the Steam notes, actually executed. Also watch its meta-layer: contracts, money, upgrades wrapped around the puzzles. And watch for its known weakness — reviewers found the puzzles repetitive and the content shallow once the novelty wore off.

- **First 10 minutes — what made you want to keep going?**
- **The framing device:** does the cat premise actually help, or is it decoration you'd skip? Would a chemistry equivalent (mascot / guide / lab-assistant character) earn its keep, or be noise?
- **The meta-layer** (money, contracts, upgrades): does it add motivation, or is it busywork between puzzles?
- **Where did it get repetitive?** How many levels in? What exactly stopped changing?
- **Did you learn any real ML?** If not — why not, mechanically? *(This is the gap we're exploiting: our content is not shallow.)*
- **Tutorial:** how did it teach a new mechanic without a wall of text?
- **Steal / avoid:**

---

## `Turing Complete`

https://store.steampowered.com/app/1444480/Turing_Complete/

**What to look for:** the *structure*. Two specific things:

1. **The verification harness IS the game.** You build a circuit; the game runs test cases against it and reports pass/fail. You're never guessing — you construct, and you get checked. Note how close this already is to the Conversion Builder and Nomenclature builder, which have 407 real tests behind them.
2. **Earlier work becomes later tools.** Components you build get reused as parts in later levels. That's where its sense of progression comes from. The chemistry analog is direct: mastered ions become tiles you wield in later naming levels — **this may be what turns four separate modules into one game.**

- **The build→verify loop:** how does failure feel? Punishing, or informative? What exactly does it show you when a test fails?
- **How does it show you *which* case failed** — and does that teach you anything, or just tell you you're wrong?
- **Reused components:** when you first used something you'd built earlier, how did that land? Is the feeling worth designing for?
- **Progression:** how does it decide what to unlock next? Linear, or a tree you choose from?
- **It's visually plain and sells well.** Does the plainness ever actually hurt the experience? *(If not: clarity beats art budget, which is a relief — we have no art pipeline.)*
- **Where did you get stuck,** and what would have unstuck you? *(This is our hint-ladder design question.)*
- **Steal / avoid:**

---

## Marina's chemistry visualization (Instagram)

Link / handle:

- **What is it, and what does it actually visualize?**
- **What makes it good** — the chemistry, the motion, the color, the clarity?
- **Is it a teaching tool or an aesthetic object?** Both?
- **Could it live inside a puzzle** (an interactive), or is it a *reward* — the thing you see after solving?
- **Steal / avoid:**

---

## Cross-cutting questions

Answer these once, after all three. These are the ones that change what gets built.

- **What does "one game" feel like** — what tied those products together into a single experience rather than a menu of activities? This is the shell question (`PRODUCT_STRATEGY.md` §3), and it's the biggest piece of unbuilt work.
- **What's the equivalent of "you built a NAND gate, now build an adder"** for chemistry naming? Name the specific chain.
- **What made you want to play one more level?** Be precise — that mechanism is what we need to copy.
- **What would a chemistry player brag about** having done? Achievements should point at that.
- **What's the strongest single screenshot** in each game, and why? *(Store pages live and die on screenshots.)*
- **Anything that made you think "we already do this better"?** Write it down — it's marketing copy.

---

## Running steal list

Ideas worth acting on, as they come up. Add freely; prune later.

| Idea | From | Where it'd go | Effort guess |
|---|---|---|---|
| | | | |
