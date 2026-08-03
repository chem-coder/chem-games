# IMAT Organic Chemistry — coverage audit & plan for Malcolm

Created: 2026-08-03, from Dalia's screenshots of the IMAT Buddy theory lessons in
`_teaching-materials/IMAT Organic Topics/` (18 screenshots, lessons **5.40 – 5.54**).

Companion docs: `ORGANIC_EXERCISE_LIST.md` (the naming-deck spec), `NOMENCLATURE_DESIGN.md`.

---

## Headline

**The Organic Nomenclature tile covers roughly a fifth of what Malcolm's exam asks for.**

The IMAT organic syllabus is 15 lessons. Only **two and a half** of them are about naming — which is
the part we built, and built well. **Seven of the remaining lessons are reactions** (5.46–5.52), and
the game has nothing for them at all.

That is not a criticism of what exists; naming is the foundation everything else stands on, and the
curriculum's naming conventions **match what we shipped, suffix for suffix**. But if the goal is
"Malcolm passes IMAT organic," the naming tile is the on-ramp, not the road.

---

## Coverage audit — every lesson, honestly scored

| Lesson | Topic | Game today |
|---|---|---|
| **5.40** Organic Chem 1 | Alkane prefixes C₁–C₁₀, alkenes (**+dienes, trienes**), alkynes, alkyl groups, **cyclo‑** | 🟡 alkanes ✓ alkenes ✓ alkynes ✓ · **dienes ✗ · cyclo ✗** · alkyl: methyl ✓, ethyl drafted |
| **5.41** Organic Chem 2 | The nine functional groups + **oxidation of 1°/2°/3° alcohols** | 🟡 **all nine named ✓** (arenes ✗) · **oxidation ✗ · 1°/2°/3° classification ✗** |
| **5.42** Organic Chem 3 | Structural / stereo / **functional isomers** | 🟡 functional isomers exist only as hidden traps; explicit rung drafted · **stereo ✗** |
| **5.43** Orbital hybridization | sp3 | ⚪ ✗ — *lesson itself says "not very important for the IMAT"* |
| **5.44** Aromatics 1 | Aliphatic vs aromatic, Hückel | ⚪ ✗ — *lesson says **"low yield… you can skip this lesson and the following"*** |
| **5.45** Aromatics 2 | Benzene, resonance, **OMP**, aryl groups | ⚪ ✗ — same low-yield note |
| **5.46** Saponification | Ester hydrolysis → glycerol + soap | 🔴 ✗ |
| **5.47** Biofuel | Transesterification | 🔴 ✗ |
| **5.48** Reactions 1 | **Alkene addition**: hydrogenation, halogenation, hydrohalogenation, hydration | 🔴 ✗ |
| **5.49** Reactions 2 | **Elimination**: dehydrogenation, dehydrohalogenation, **dehydration of alcohols** | 🔴 ✗ |
| **5.50** Reactions 3 | **Substitution**: halogenation of alkanes & alcohols, hydrolysis of haloalkanes | 🔴 ✗ |
| **5.51** Reactions 4 | Acid halides, acid anhydrides | 🔴 ✗ — *naming marked "optional"; the structures still appear* |
| **5.52** Reactions 5 | **Fischer esterification** | 🔴 ✗ |
| **5.53** Amines | 1°/2°/3°, IUPAC rules, **basicity** | 🟡 **primary only** · N‑substituted ✗ · basicity ✗ |
| **5.54** Amides | 1°/2°/3°, N‑prefixes, **lactams** | 🟡 **primary only** · N‑substituted ✗ · lactams ✗ |

**Score: ~2.5 lessons solid, 4 partial, 8.5 missing** — of which only 3 are marked low-priority by the
course itself (5.43, 5.44, 5.45). **The reaction block is the exam's centre of mass and our blank spot.**

---

## What the curriculum settled for us (good news)

**Open Question 1 in `ORGANIC_EXERCISE_LIST.md` is answered.** Lesson 5.41 lists the IUPAC patterns
explicitly, and they match what's shipped, one for one:

| Family | Curriculum says | Game builds |
|---|---|---|
| Alcohols | `-anol` | `propan-2-ol` ✓ |
| Aldehydes | `-anal` | `propanal` ✓ |
| Ketones | `-anone` | `propan-2-one` ✓ |
| Carboxylic acids | `-anoic acid` | `propanoic acid` ✓ |
| Esters | `alkyl + -anoate` | `methyl ethanoate` ✓ |
| Ethers | `alkyl + oxy + alkane` | `methoxyethane` ✓ |
| Amines | `-anamine` | `propan-1-amine` ✓ |
| Amides | `-anamide` | `propanamide` ✓ |

Lesson 5.53 also confirms the amine numbering rule we implemented ("number the chain so the carbon
attached to –NH₂ has the lowest number"). **No renaming work needed.**

**And lesson 5.42 independently validates the keystone mixing rung I drafted.** It names functional
isomers as a distinct examinable category, with exactly these three pairs:

> Alcohols with ethers · Aldehydes with ketones · Carboxylic acids with esters

Those are precisely the three discrimination pairs in draft rung III.3. That rung is now
curriculum-mandated rather than my invention — build it.

---

## The plan

### Phase 0 — finish the naming tile (small, mostly already drafted)

The act/mixing/boss rework from `ORGANIC_EXERCISE_LIST.md`, **plus four curriculum-driven additions
that are cheap because the grader already supports them:**

1. **Secondary & tertiary amines and amides** (5.53, 5.54) — `N-methylethanamide`,
   `N,N-dimethylethanamide`, secondary amines. The graph grader handles these *today*; only the
   N‑prefix naming is new. Currently the game teaches "amine = NH₂" which the exam will contradict.
2. **1°/2°/3° alcohol classification** (5.41) — a short "classify this alcohol" rung. Cheap, and it is
   the **prerequisite for the oxidation reactions**, so it does double duty.
3. **Dienes** (5.40) — two double bonds, `buta-1,3-diene`. Small change to the ene/yne deck.
4. **Haloalkanes** (5.50) — `chloroethane`, `2-bromopropane`. Needs Cl/Br in the tray (one valence
   entry + one colour each) — and they're **required for the whole reaction block anyway**, so this
   is really Phase 1 groundwork done early.

### Phase 1 — the Organic Reactions game ⭐ the big one

**The insight that makes this tractable: the molecule builder is already 80% of a reaction game.**

A reaction question is *"here is a reactant and a reagent — build the product,"* and building a
product graded by structure is exactly what `gradeIsomorphic` already does. No new grading engine.

- **Act A — Addition to alkenes** (5.48): hydrogenation (+H₂ → alkane) · halogenation (+Br₂ →
  dihaloalkane) · hydrohalogenation (+HBr → haloalkane) · hydration (+H₂O → alcohol)
- **Act B — Elimination** (5.49): dehydration of alcohols (→ alkene) · dehydrohalogenation ·
  dehydrogenation. *Act B is Act A run backwards — a lovely structure for a game.*
- **Act C — Substitution** (5.50): halogenation of alkanes and alcohols · hydrolysis of haloalkanes
- **Act D — Carbonyl chemistry**: alcohol oxidation (5.41: 1°→aldehyde→acid, 2°→ketone, 3°→no
  reaction) · Fischer esterification (5.52) · saponification (5.46) · transesterification/biofuel (5.47)

Suggested prompt shapes, all buildable on the existing canvas:
- **build-the-product** — "but-2-ene + H₂ (catalyst) → ?"
- **build-the-reactant** — "? + H₂O → propan-2-ol" (harder, and it's how exams test Markovnikov)
- **name-the-reaction** — show reactant and product, pick/type the reaction type

### Phase 2 — rings (only if the weighting justifies it)

`cyclo-` compounds (5.40) and lactams (5.54) need rings. **This is the one genuinely expensive
change:** the grader's canonical form is a *tree* canonization, and it explicitly rejects cycles
(`reason: "ring"`). Rings need a true graph canonical form. Benzene/aromatics are *self-declared low
yield*, so the only real driver is cycloalkanes — worth doing after Phase 1, not before.

### Phase 3 — stereochemistry

Cis‑trans (5.42) — the grader compares graphs, and graphs have no geometry, so cis- and
trans-but-2-ene are identical to it today. Real design work; lowest priority of the three.

---

## The cheapest high-value thing: a reaction-map reference page

Separate from all of the above, and probably **the single best hours-to-benefit item on this list.**

Malcolm's hardest problem with 5.46–5.52 isn't any one reaction — it's holding the *network* in his
head: which reagent turns an alkene into an alcohol, which turns it back, what oxidises to what. A
**one-page organic reaction map** — alkane ⇄ alkene ⇄ alcohol ⇄ haloalkane ⇄ aldehyde → acid → ester,
every arrow labelled with its reagent and conditions — is static, buildable in an afternoon, and is
the thing he'd actually keep open while studying.

Precedent: the oxidation-states periodic table (`reference/oxidation-states/`) is exactly this
pattern — a reference page rather than a game, feeding a skill the games then drill.

**Recommended order:** reaction map (afternoon) → Phase 0 (naming tile finished properly) →
Phase 1 (reactions game, the real build).

---

## Open questions for Dalia

1. **Is Malcolm's timeline tight?** If the exam is close, the reaction map + a reactions game beats
   polishing the naming ladder. If there's runway, Phase 0 first is the sounder build.
2. **Locant placement** — `propan-2-ol` vs `2-propanol`. The screenshots confirm the *suffixes* but
   not this. What does his practice material use?
3. **Cycloalkanes** — how heavily do IMAT questions lean on them? Drives whether Phase 2 is worth
   the grader rewrite.
4. **Reaction conditions** — should the game demand the reagent *and* conditions (heat, UV, catalyst,
   conc. acid), or just the product? The lessons state conditions for every reaction, which suggests
   the exam asks for them.
5. **Mechanisms** — the optional YouTube embeds show curly-arrow mechanisms for halogenation and
   hydrolysis. In scope, or product-only?
