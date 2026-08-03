# Organic Nomenclature — exercise list (DRAFT for Dalia to correct)

Created: 2026-08-03. **This is a draft written by Claude for Dalia to edit.** Everything here is a
proposal, not a decision. Strike molecules, add molecules, reorder rungs, overrule the structure.

**Why this document exists.** The inorganic tile had WS 8's answer key as its oracle — the worksheet
*was* the spec. Organic has no equivalent in `_teaching-materials/` (checked 2026-08-03: CHEM 101
Nomenclature is the inorganic Ch 05 set; CHEM 1415 is gen-chem II, not organic). So every content
decision so far was guessed from general chemistry rather than from what students are actually asked.
This list is the missing spec. Once corrected, it becomes three things at once:

1. **the content spec** — exactly which molecules each deck deals,
2. **the sequencing spec** — which rung, in what order, mixing what,
3. **the test oracle** — the generated names get checked against this file, so the chemistry is
   verified against Dalia, not against Claude.

> **UPDATE 2026-08-03, later the same day:** Dalia added
> `_teaching-materials/IMAT Organic Topics/` — 18 screenshots of the IMAT Buddy theory lessons
> **5.40–5.54**. That is now the real source. See **`IMAT_ORGANIC_PLAN.md`** for the full coverage
> audit. Two things it settled for this document:
> - **Open Question 1 (naming style) is ANSWERED** — lesson 5.41 lists the suffixes and they match
>   what's shipped exactly (`-anol`, `-anal`, `-anone`, `-anoic acid`, `alkyl -anoate`,
>   `alkyl+oxy+alkane`, `-anamine`, `-anamide`). No renaming needed. Only locant *placement*
>   (`propan-2-ol` vs `2-propanol`) is still unconfirmed.
> - **Rung III.3 is curriculum-mandated, not my invention** — lesson 5.42 names "functional isomers"
>   as an examinable category with exactly the three pairs I'd drafted: alcohols/ethers,
>   aldehydes/ketones, acids/esters.
>
> It also revealed **four gaps this list doesn't cover** (added as III.5–III.6 and Act 0 below):
> secondary/tertiary amines & amides, 1°/2°/3° alcohol classification, dienes, and haloalkanes.

**The pre-existing source** was one line in `_teaching-materials/Malcolm_IMAT-Chem_2025/
IMAT_Chemistry_Study_Topics.csv`:

> Organic Chemistry — Functional groups (alkanes, alkenes, alkynes, alcohols, aldehydes, ketones,
> carboxylic acids, esters, amines, amides), isomerism (structural, cis-trans), reactions
> (hydrogenation, halogenation, oxidation, esterification)

Note what it names that the game has nothing for: **isomerism as an explicit skill**, and
**reactions**. The mixing rungs below are largely an answer to the first.

---

## The problem this fixes

Dalia's playtest verdict on the shipped 9-rung ladder: *"they are all boring, there is no mixing of
concepts."* Correct. Every rung drills exactly one idea in isolation and then stops. A student can
finish all nine and never once have to decide **which family a name belongs to**, or build a molecule
that is branched *and* unsaturated, or a branched alcohol.

The fix is structural, not cosmetic:

- **Three acts**, each ending in a boss. Nine flat tabs become a shaped climb.
- **Every act ends with a mixing rung** before its boss — concepts crossed, not queued.
- **Isomer-discrimination is its own skill**, drilled explicitly (same formula, different family).

---

## Structure at a glance

| Act | Rungs | Mixing rung | Boss |
|---|---|---|---|
| **I — Hydrocarbons** | alkane spellings (typed), build straight chains, enes/ynes, branching I, branching II (ethyl + multi) | branched unsaturated | **Mini-boss I** — 10 Q |
| **II — Oxygen** | alcohols, aldehydes/ketones, ethers, acids/esters | branched + functional group | **Mini-boss II** — 10 Q |
| **III — Nitrogen & everything** | amines/amides | full cross-family + isomer discrimination | **FINAL BOSS** — 20 Q |

---

# ACT I — HYDROCARBONS

### I.0 Dienes `[NEW — from IMAT 5.40]`
Lesson 5.40: *"add the suffix 'ene' if there is a double bond, 'diene' if there are two, 'triene' if
there are three."* The shipped ene/yne rung allows exactly one multiple bond. Fold these into I.4:
buta-1,3-diene · penta-1,3-diene · penta-1,4-diene · hexa-1,5-diene · buta-1,2-diene (allene, optional)

### I.8 Haloalkanes `[NEW — from IMAT 5.50; also Phase-1 groundwork]`
Needed for the whole reactions block (halogenation, dehydrohalogenation, hydrolysis), so the tray
gains Cl and Br here rather than later:
chloromethane · chloroethane · 1-chloropropane · 2-chloropropane · bromoethane · 2-bromopropane ·
1-bromobutane · 2-bromobutane · 1,2-dibromoethane (the halogenation product) · dichloromethane

### I.1 Alkane names — molecular formula → name (typed) `[SHIPPED, keep]`
C₁–C₁₀ straight chains. `CH₄ → methane` … `C₁₀H₂₂ → decane`.

### I.2 Condensed formula → name (typed) `[SHIPPED, keep]`
Same ten, condensed spelling. `CH₃CH₂CH₂CH₃ → butane`.

### I.3 Build straight chains — name → structure `[SHIPPED, keep]`
Boss-card recipe already applied: four short (C₁–C₆) + one long (C₇–C₁₀) per round.

### I.4 Alkenes & alkynes — build `[SHIPPED, keep]`
Round: 1 alkane + 2 alkenes + 2 alkynes. Locant graded from either end.

### I.5 Branching I — one methyl `[SHIPPED, keep]`
2-methylpropane · 2-methylbutane · 2-methylpentane · 3-methylpentane · 2-methylhexane ·
3-methylhexane · 2-methylheptane · 3-methylheptane · 4-methylheptane

### I.6 Branching II — multi-branch and ethyl `[NEW]`

**Two methyls** (already partly in the shipped deck, promoted here):
2,2-dimethylpropane · 2,2-dimethylbutane · 2,3-dimethylbutane · 2,2-dimethylpentane ·
2,3-dimethylpentane · 2,4-dimethylpentane · 3,3-dimethylpentane · 2,3-dimethylhexane ·
2,4-dimethylhexane · 2,5-dimethylhexane · 3,4-dimethylhexane

**Ethyl branches** — per Dalia's rule: parent chain ≥ 5 carbons, branch position `p` with
`3 ≤ p ≤ n−2` (this is exactly the validity rule — an ethyl on C-2 would make a longer parent chain):

| Molecule | Parent | Position | Total C |
|---|---|---|---|
| 3-ethylpentane | 5 | 3 | 7 |
| 3-ethylhexane | 6 | 3 | 8 |
| 3-ethylheptane | 7 | 3 | 9 |
| 4-ethylheptane | 7 | 4 | 9 |
| 3-ethyloctane | 8 | 3 | 10 ⚠️ |
| 4-ethyloctane | 8 | 4 | 10 ⚠️ |

⚠️ **Open question 2 (below):** the 10-carbon ones are big drags. Cap the deck at heptane parents?

**Methyl + ethyl together** (the real payoff — two branch types, alphabetical order in the name, and
the numbering rule bites): **3-ethyl-2-methylpentane** ✓ verified.

⚠️ **These need your eye specifically.** Once an ethyl and the parent chain are the same length, you
land in longest-chain **tie-breaking** (tie → chain with more substituents → then lowest locants),
which is the rule I deliberately deferred when building the branching rung. 3-ethyl-2-methylpentane
is safe (its 5-carbon alternatives carry only one substituent, so the named chain wins cleanly).
Candidates I do **not** want to ship unverified: 3-ethyl-4-methylhexane, 4-ethyl-2-methylhexane,
3-ethyl-2-methylhexane — each has a genuine chain tie. **Please confirm or replace them**, or say the
word and I'll work each one through the tie rules explicitly before they go in a deck.

> Teaching beat this rung earns: **branches are listed alphabetically** (ethyl before methyl),
> but **numbered by lowest-locant-set**, not by the alphabet. That distinction is a classic exam trap.

### I.7 MIXING — branched unsaturated `[NEW]`
Branch *and* multiple bond in one molecule. The parent chain must contain the double/triple bond,
which is the rule students most often break.

2-methylprop-1-ene · 2-methylbut-1-ene · 3-methylbut-1-ene · 2-methylbut-2-ene ·
2-methylpent-1-ene · 4-methylpent-1-ene · 4-methylpent-2-ene · 2,3-dimethylbut-2-ene ·
3-methylpent-1-yne · 4-methylpent-1-yne · 4-methylpent-2-yne · 3,3-dimethylbut-1-yne

### 🏆 MINI-BOSS I — Hydrocarbons · 10 questions
Drawn across I.3–I.7. No new content; the test is whether the concepts survive being shuffled.

---

# ACT II — OXYGEN

### II.1 Alcohols `[SHIPPED, keep]`
methanol · ethanol · propan-1-ol · propan-2-ol · butan-1-ol · butan-2-ol · pentan-1-ol ·
pentan-2-ol · pentan-3-ol · hexan-1-ol · hexan-2-ol · hexan-3-ol

### II.2 Aldehydes & ketones `[SHIPPED, keep]`
Round: 2 aldehydes + 3 ketones. methanal … hexanal; propan-2-one, butan-2-one, pentan-2-one,
pentan-3-one, hexan-2-one, hexan-3-one.

### II.3 Ethers `[SHIPPED, keep]`
methoxymethane · methoxyethane · ethoxyethane · 1-methoxypropane · 2-methoxypropane ·
1-ethoxypropane. Reveals carry the trivial names (dimethyl ether, diethyl ether).

### II.4 Acids & esters `[SHIPPED, keep]`
Round: 2 acids + 3 esters. methanoic → hexanoic acid; methyl/ethyl/propyl × methanoate/ethanoate/
propanoate.

### II.1b Classify the alcohol — 1° / 2° / 3° `[NEW — from IMAT 5.41]`
Not a build rung — a **classify** rung (show the structure, pick primary / secondary / tertiary,
counting how many carbons the OH-carbon touches). Short, cheap, and it is the **prerequisite for
alcohol oxidation** in the reactions game (1° → aldehyde → acid, 2° → ketone, 3° → no reaction), so
it earns its place twice.

Primary: methanol · ethanol · propan-1-ol · butan-1-ol · 2-methylpropan-1-ol · 2,2-dimethylpropan-1-ol
Secondary: propan-2-ol · butan-2-ol · pentan-3-ol · 3-methylbutan-2-ol
Tertiary: 2-methylpropan-2-ol · 2-methylbutan-2-ol

### II.5 MIXING — branched + functional group `[NEW]`
The functional group now has to share a molecule with a branch, and the numbering rule changes:
**the functional group outranks the branch** for lowest locant. This is the single most valuable
mixing rung in the whole ladder.

**Branched alcohols:**
2-methylpropan-1-ol · 2-methylpropan-2-ol · 3-methylbutan-1-ol · 2-methylbutan-1-ol ·
2-methylbutan-2-ol · 3-methylbutan-2-ol · 2,2-dimethylpropan-1-ol · 4-methylpentan-2-ol

**Branched carbonyls:**
2-methylpropanal · 2-methylbutanal · 3-methylbutanal · 3-methylbutan-2-one ·
4-methylpentan-2-one · 2-methylpentan-3-one · 3,3-dimethylbutan-2-one

**Branched acids & esters:**
2-methylpropanoic acid · 2-methylbutanoic acid · 3-methylbutanoic acid ·
2,2-dimethylpropanoic acid · methyl 2-methylpropanoate · ethyl 3-methylbutanoate

> Teaching beat: in **4-methylpentan-2-one** the chain is numbered so the C=O gets 2, not so the
> methyl gets 2. Students who learned branching first will reflexively number it backwards.

### 🏆 MINI-BOSS II — Oxygen families · 10 questions
Drawn across II.1–II.5, including at least two cards from Act I so hydrocarbons don't go stale.

---

# ACT III — NITROGEN & EVERYTHING

### III.1 Amines & amides `[SHIPPED, keep]`
Round: 3 amines + 2 amides. methanamine · ethanamine · propan-1-amine · propan-2-amine ·
butan-1-amine · butan-2-amine; methanamide · ethanamide · propanamide · butanamide.

### III.2 MIXING — branched nitrogen `[NEW]`
2-methylpropan-1-amine · 2-methylpropan-2-amine · 3-methylbutan-1-amine · 3-methylbutan-2-amine ·
2-methylpropanamide · 3-methylbutanamide

### III.3 MIXING — isomer discrimination `[NEW — the keystone rung]`
**Same molecular formula, different family.** The formula is shown, two-or-three names are the
possible answers, and the student must build the *named* one. This is the rung that makes the whole
"a formula can't name an organic molecule" thread pay off — and it's the IMAT syllabus's
*"isomerism (structural)"* line, drilled directly.

| Formula | Competing molecules | What's being tested |
|---|---|---|
| C₄H₁₀ | butane / 2-methylpropane | chain vs branch |
| C₅H₁₂ | pentane / 2-methylbutane / 2,2-dimethylpropane | three-way skeleton |
| C₄H₈ | but-1-ene / but-2-ene / 2-methylprop-1-ene | locant vs branch |
| C₂H₆O | ethanol / methoxymethane | alcohol vs ether |
| C₃H₈O | propan-1-ol / propan-2-ol / methoxyethane | locant vs family |
| C₃H₆O | propanal / propan-2-one | aldehyde vs ketone |
| C₄H₈O | butanal / butan-2-one / 2-methylpropanal | end vs inside vs branched |
| C₂H₄O₂ | ethanoic acid / methyl methanoate | acid vs ester |
| C₃H₆O₂ | propanoic acid / methyl ethanoate / ethyl methanoate | acid vs two esters |
| C₃H₉N | propan-1-amine / propan-2-amine | locant |

### III.3b Secondary & tertiary amines and amides `[NEW — from IMAT 5.53 / 5.54]`
The shipped game teaches "amine = –NH₂", which the exam will contradict: lessons 5.53 and 5.54 both
run 1° / 2° / 3°. **The graph grader already handles these today** — only the N‑prefix naming is new.

**Secondary amines** (N attached to two carbons): N-methylmethanamine · N-methylethanamine ·
N-ethylethanamine
**Tertiary amines:** N,N-dimethylmethanamine · N,N-dimethylethanamine
**Secondary amides** (from 5.51's table): N-methylethanamide · N-ethylpropanamide
**Tertiary amides:** N,N-dimethylethanamide

### III.4 MIXING — full cross-family `[NEW]`
Cards drawn from **every** family, unlabelled. Before building, the student must read the suffix and
decide what kind of molecule it even is. This is the real exam skill and the last stop before the boss.

### 🏆🏆 FINAL BOSS — 20 questions, everything
Every family, every act. Passing gates nothing further (it's the top) — it's the trophy.

---

## Modes

Difficulty rides on **hint availability first**, error threshold second. The hint ladder is what
actually makes a rung easy; the threshold just formalises it.

| Mode | Hints | Mini-boss (10 Q) | Final boss (20 Q) |
|---|---|---|---|
| **Easy** | on tap, free | ≤ 3 wrong | ≤ 5 wrong |
| **Medium** | available, but cost the "clean" credit | ≤ 2 wrong | ≤ 3 wrong |
| **Hard** | none | ≤ 1 wrong | ≤ 1 wrong |

**Is ≤1 of 20 too harsh?** No — for a *specific* reason. In the builder you can see your molecule and
rearrange it freely before pressing Check; there's no slip-of-the-pencil failure. A committed wrong
build is a real misunderstanding, not a typo. A 95% bar is fair when the work is inspectable —
**provided** the boss shows exactly which cards were missed and lets you retry immediately.

---

## Open questions — Dalia to answer

1. ~~**Naming style.**~~ **ANSWERED by IMAT 5.41** — the suffixes match what's shipped exactly.
   Only *locant placement* remains open: `propan-2-ol` vs `2-propanol`. The screenshots confirm the
   suffix but not the number's position. What does Malcolm's practice material show?
2. **Ethyl deck length cap.** 3-ethyloctane is a 10-carbon build. Cap ethyl parents at heptane
   (max 9 C), or keep the octanes as boss cards?
3. **Input mechanic for long molecules.** Your rule is one mechanic per quiz, never mixed. Do the
   long-molecule rungs (I.6 ethyl, and boss rounds) get **click-to-add** while the short rungs keep
   **drag-into-place**? That's the natural home for it — but it means different rungs of one tile use
   different mechanics. Acceptable, or should click-to-add be a wholly separate game?
4. **Diols / triols in scope?** ethane-1,2-diol (antifreeze), propane-1,2-diol,
   propane-1,2,3-triol (glycerol). Very IMAT-relevant, and they'd fit II.5.
5. **Trivial names.** Teach acetic acid / acetone / formaldehyde / isopropanol alongside the IUPAC
   ones (the way the ether rung already shows "dimethyl ether")? Students will meet both.
6. **Do mini-bosses gate the next act** (must pass to unlock Act II), or are they optional trophies
   in an always-open ladder?
7. **Cis-trans isomerism** is in your IMAT syllabus and the game cannot currently express it — the
   grader compares molecules as graphs, and graphs have no geometry, so cis- and trans-but-2-ene are
   identical to it. Fixable, but it's a real design conversation. Act IV, or drop it?
8. **Reactions** (hydrogenation, halogenation, oxidation, esterification) are the other half of that
   syllabus line. Separate game entirely, surely — but worth knowing if it's on the roadmap, because
   the builder canvas is most of what a reaction game would need.

---

## Notes for implementation (once the list is corrected)

- Each rung's deck becomes a spec array in `organic.js`; the names in this file are the expected
  `prompt` strings, so a test can assert generated-name == this-file for every entry.
- Grading for all the mixing rungs is already covered by `gradeIsomorphic` (labeled-graph
  isomorphism) — branched + unsaturated + functional needs no new grader, just target graphs.
- The one genuinely new grading need is **cis-trans** (Q7), which graphs can't express.
- Bosses need: a no-requeue round mode, a per-mode threshold, an end-of-round missed-card review,
  and instant retry. The existing round machinery requeues missed cards, which bosses must *not* do.
