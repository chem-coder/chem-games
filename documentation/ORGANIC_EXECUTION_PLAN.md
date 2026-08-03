# Organic — execution plan to IMAT (exam ≈ 2026-10-01, ~2 months)

Created 2026-08-03. Supersedes the sequencing sections of `IMAT_ORGANIC_PLAN.md` (which stays as the
curriculum audit) and `ORGANIC_EXERCISE_LIST.md` (which stays as the deck content spec).

Dalia's brief: algorithms for branched organics · multi-concept exercises (branch + alcohol + double
bond; three branches; diol + branch; cyclic; cyclic + ene + branch) · reverse direction from a
**figure** to a name · reactions are the priority · **polish the existing drawing exercises first**.

---

## The pivot: stop hand-listing molecules, start generating them

Today every deck is a hand-written spec list with a hand-written name
(`FAMILIES.ketone.name(s)` etc.). That worked for one concept per rung. It breaks the moment
concepts combine, for three reasons:

1. **Validity stops being local.** Dalia's branch rule — for a branch of length `b` on a parent of
   length `n`, valid attachment is `b + 1 ≤ p ≤ n − b` — is exactly right for a lone branch. Add a
   second branch, a double bond, and an –OH and the legal positions depend on all of them at once
   (the parent chain must contain the principal group and the unsaturation; the numbering is decided
   by priority, not by the branch).
2. **The combinatorics explode.** Three-concept molecules number in the hundreds. Hand-verifying each
   name is where wrong chemistry gets shipped — the methyl+ethyl names I drafted last session already
   hit longest-chain tie-breaking and I flagged three as unsafe.
3. **The reverse direction needs it anyway.** "Show a structure, name it" requires a program that can
   name an arbitrary structure. That program *is* the fix for 1 and 2.

**So: build a molecule model + IUPAC namer.** Decks become "generate every molecule matching these
constraints, name it, keep the ones we want." Validity is automatic — an illegal name is simply never
generated, because the namer picks the correct parent chain itself.

This one piece of infrastructure delivers four things at once:

| Need | How the namer serves it |
|---|---|
| Branch algorithms | Parent-chain selection *is* the branch rule, generalised |
| 3+ concept exercises | Generate structures, let the namer name them |
| Reverse direction (figure → name) | The namer is the answer key |
| Test oracle | Every deck entry verified by construction, not by hand |

---

## Phases

### Phase A — foundation (the enabler) 🔨 *starts now*

**A1. Molecule model + branched-alkane namer.** Graph model; longest-chain selection with IUPAC
tie-breaks (longest → most substituents → lowest locants); substituent naming with multiplicity
prefixes (di/tri) and alphabetical ordering; canonical name assembly. Round-trip tested: build a
structure, name it, and confirm the name regenerates the same structure.

**A2. Functional groups + unsaturation in the namer.** Principal-group priority
(acid > ester > amide > aldehyde > ketone > alcohol > amine), suffix vs prefix, lowest-locant rule
for the principal group, ene/yne locants, **dienes**, **diols**.

**A3. Rings.** `cyclo-` parents. This also forces the grader upgrade from *tree* canonization to true
**graph canonization** — the current grader literally rejects cycles (`reason: "ring"`). Doing it here
is far cheaper than retrofitting later.

**A4. Skeletal renderer.** Draw a molecule as the zigzag line figure the IMAT lessons use
(see lesson 5.40's alkane table). Needed for Phase C; also improves reveals everywhere.

### Phase B — polish the drawing exercises *(Dalia: this comes first among game work)*

**B1. Deck regeneration.** Every existing rung's deck comes from the generator instead of hand lists.
Invisible to the player; makes everything after it possible.

**B2. Multi-concept rungs** — the actual fix for "they're all boring":
- branch + alcohol · branch + double bond · **branch + alcohol + double bond**
- **three branches** (2,3,4-trimethylpentane and friends)
- **diol + branch**
- **cyclic** · **cyclic + double bond + branch**

**B3. Acts, mixing rungs, bosses, modes** — the structure from `ORGANIC_EXERCISE_LIST.md`
(3 acts, mini-bosses, final boss, hint-based difficulty modes).

**B4. Click-to-add mechanic** for the long-molecule rungs — separate quizzes from the drag rungs,
never mixed (Dalia's rule).

### Phase C — reverse direction: figure → name

Structure drawn as a **skeletal figure** (Phase A4), student types the name. Graded against the
namer. This is the direction the exam actually asks in, and it's the payoff for A1–A4.

### Phase D — reactions ⭐ *the exam's centre of mass*

"Reactant + reagent → build the product," graded by the existing isomorphism grader on the existing
canvas. Acts: addition (5.48) · elimination (5.49) · substitution (5.50) · carbonyl chemistry
(alcohol oxidation, esterification 5.52, saponification 5.46).

**Plus the reaction-map reference page** — one page, every interconversion arrow labelled with its
reagent. Cheap, high value, independent of everything else; can be slotted in any time.

---

## Sequencing against the clock

| Weeks | Work |
|---|---|
| 1–2 | **A1 + A2** (namer core), **B1** (decks regenerated behind the scenes) |
| 3 | **A3** rings + graph canonization · **B2** multi-concept rungs |
| 4 | **A4** skeletal renderer · **B3** acts/bosses/modes · **B4** click-to-add |
| 5 | **Phase C** figure → name |
| 6–8 | **Phase D** reactions + reaction map |

**Risk and its mitigation.** Phase A is the ambitious part and it sits in front of everything. If the
namer runs long, reactions get squeezed — and reactions matter most for the exam. Mitigation: the
**reaction-map reference page is independent of Phase A entirely**, so if the schedule slips, that
ships regardless and covers the highest-yield material with the least code. Build it early if the
namer looks like overrunning week 3.

---

## Scope boundaries (deliberate)

- **Aromatics stay out** — lessons 5.44/5.45 call themselves low yield and skippable.
- **Mechanisms stay out** unless Dalia says otherwise (curly arrows are optional-video material).
- **Stereochemistry (cis/trans) is last** — the namer and grader both need geometry, which graphs
  don't carry. Revisit after Phase D.
- **Ethyl+ branches** are handled by the namer, not by curated lists — which retires the three
  unsafe names flagged in `ORGANIC_EXERCISE_LIST.md`.
