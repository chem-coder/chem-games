# EdTech Course Plan — course first, Steam later

**Status:** decision made 2026-10-17 (Dalia, after discussion with a game-industry friend and a Gemini session; raw transcript: `idea-box/steam-and-edtech-plan-gemini-2026-10.txt`). This supersedes `PRODUCT_STRATEGY.md` §1 (Steam as product #1). The Steam concept is parked, not dropped: `STEAM_CONCEPT_PARKED.md`.

## 1. The decision and why

Build an **interactive exam-prep course** (IMAT first), sold per course on a course platform, with **PDF chapter guides** as a second product line. The Steam game comes later, built from the same code and content.

Reasons recorded:
- Comfort and speed: 20 years of teaching, existing lectures and question banks, one paying IMAT student already. The course is closer to real than the game.
- Urgency: stop tutoring by the hour; replace it with something students can be sent to. Target: first thousands, then $20k–$50k; $200k would be excellent.
- Expansion path: IMAT → MCAT → AP Chemistry / UCAT / GAMSAT / DAT → general chemistry and high school. Same content, different packaging.
- Financial shape: a course has a high floor per sale (hundreds per student); Steam has a high ceiling but ~90% of indie titles don't recoup. Course first funds the game.
- No video lectures. Text, diagrams, interactive modules, PDFs.

## 2. Business model (as discussed; prices are placeholders)

| Channel | Product | Price idea | Notes |
|---|---|---|---|
| Course platform (Teachable or similar) | Full interactive course | one-time payment, ~$150 basic / ~$350 full / ~$600 with personal review | One-time, not subscription (exam-date buyers would subscribe for one month and leave). Payment plans raise conversion. Platform handles accounts, payments, VAT, progress. |
| Etsy | PDF guide per chapter; compilation of all chapters | ~$10–15 per chapter, ~$30–50 compilation | Lead magnet: each PDF links to the course with a discount code. Same PDF listed under several exam names (IMAT / MCAT / AP) for search. |
| Later | Steam game | $15–25 | Built from the same modules once the course is earning. |

Platform fees noted: Teachable Starter ≈ $39/mo + 7.5%; Builder ≈ $89/mo + 0% (only card fees). Steam takes 30%.

**Hosting consequence:** the course embeds the games as iframes. The repo is now private, so GitHub Pages is off. The games need a public-URL host that builds from the private repo (Cloudflare Pages) before any embedding can be tested.

## 3. Module template (every chapter, same five steps)

1. **Map and goals** — where this chapter sits on the skills map, what it unlocks, which exam questions it covers. 2–3 min.
2. **Simulator** — the chapter's interactive module(s), played before the theory. 5–10 min.
3. **Theory + PDF guide** — short text with the exceptions and exam traps; the downloadable guide (same file sold on Etsy). 15–20 min.
4. **Exam traps** — how the exam phrases this topic to trip students; from her tutoring experience. 5–7 min.
5. **Practice bank** — exam-format questions; passing marks the chapter done on the map. 15–30 min.

Platform settings: step 5 locked until step 2 is opened; milestone messages at block boundaries.

## 4. The outline she asked for

Her requirement (verbatim intent): a complete syllabus-like map defining the project's boundaries — every chapter, each with what the student must **understand**, **be able to do**, and **memorize**; roughly **7 sub-levels per chapter**, 19 chapters ≈ 140 units; grouped into **three blocks (fundamentals / quantitative / advanced)**; and from it, identify the **spine** — the single mechanic that runs through everything. Purpose: purposeful development, no more rebuilding mini-games with incompatible mechanics; her storyboards are kept, not redone.

**Sequence basis:** Tro, *Introductory Chemistry*, 19 chapters — this is the "gen chem by book" track from `TRACK_MAPS.md` §3, rendered as the course order. The 18-topic universe (`TOPIC_UNIVERSE_PLAN.md`) is unchanged; the course walks it in Tro's order.

**Spine (her statement):** chemistry is the interaction of positively and negatively charged particles. Every module is this interaction at a different scale: electrons on a nucleus → atoms sharing or transferring electrons → polar molecules → ions in water → proton transfer → electron transfer → partial charges holding large molecules together.

### Block 1 — Fundamentals (the micro world)

| Tro ch. | Topic | Existing assets | Sub-level sketch |
|---|---|---|---|
| 1 | The chemical world | storyboards (+/− particles), map at `map/` | charge storyboard · scales of matter · observation vs law · scientific method · exam traps · test |
| 2 | Measurement and problem solving | Conversion Builder, Conversion Conveyor | scales · significant figures · unit conversion · measurement with error · blitz · traps · test |
| 3 | Matter and energy | — | mixture vs compound sorter · phase changes · exo/endo · calorimetry · crucible/oven/balance lab (gravimetry) · traps · test |
| 4 | Atoms and elements | `atomic-structure/` renderer prototype; design in memory | subatomic storyboard · build an atom · isotopes · build an ion · identify from structure · traps · test |
| 9 | Electrons in atoms and the periodic table | Periodic System screen, PT Memorizer, Trend Ladder | shells · orbital filling · configurations · trends · (hidden quest) · traps · test |
| 10 | Chemical bonding | Shape Lab; bonding game design (memory) | Lewis builder · polarity · VSEPR · nomenclature link · traps · test |

### Block 2 — Quantitative (moles and stoichiometry)

| Tro ch. | Topic | Existing assets | Sub-level sketch |
|---|---|---|---|
| 5 | Molecules and compounds | Name Builder (5 rungs), Polyatomic Ion Trainer, Oxidation-State Trainer | naming algorithm · binary · acids · polyatomic ions · speed round · traps · test |
| 6 | Chemical composition | Conversion Builder | mass–mole–particles · mass percent · empirical formula · molecular formula · traps · test |
| 7 | Chemical reactions | Visual Equation Balancer | balancer · solubility table · net ionic · reaction classifier · precipitation lab · traps · test |
| 8 | Quantities in reactions | Ratio Factory | ratios · limiting reagent · excess · percent yield · traps · test |
| 13 | Solutions | — (pH Lab dilution rung) | dissolution at micro scale · molarity · dilution · solution stoichiometry · traps · test |

### Block 3 — Advanced (behavior of matter)

| Tro ch. | Topic | Existing assets | Sub-level sketch |
|---|---|---|---|
| 11 | Gases | Gas Laws (Charles) | piston · PV=nRT · Dalton · gas stoichiometry · Kipp apparatus · traps · test |
| 12 | Liquids, solids, IMFs | — (Shape Lab polarity) | IMF sorter · hydrogen bonding · phase vs heat · phase diagram · traps · test |
| 14 | Acids and bases | pH Lab (6 rungs), Acid/Base Sorter | pH scale · conjugate pairs · strong vs weak · titration (timing game) · titration math · traps · test |
| 15 | Equilibrium | — (OU mining: ICE builder, Le Châtelier panel) | dynamic equilibrium · K expression · Le Châtelier · K calculations · chromate lab · traps · test |
| 16 | Oxidation and reduction | Oxidation-State Trainer, Battery Lab | oxidation numbers · oxidant/reductant · half-reactions · galvanic cell · electrolysis · traps · test |
| 17 | Radioactivity and nuclear chemistry | — (OU mining: nuclear balancer) | radiation types · nuclear balancer · half-life · dating · reactor (hidden) · traps · test |
| 18 | Organic chemistry | Organic Nomenclature (9 rungs), Molecule Builder, Reactions Lab | chain builder · isomers · functional groups · IUPAC · Soxhlet lab · traps · test |
| 19 | Biochemistry | — | amino acids · protein folding · DNA pairing · ATP · final · traps · final exam |

The sub-level sketches are Gemini's draft plus the repo's existing assets; they are not approved. Slots 6 and 7 ("exam traps", "test") are fixed in every chapter. Hidden-level / apparatus-collecting items belong to the Steam layer and are listed only as placeholders.

## 5. Open questions for Dalia

1. Confirm Tro's 19 chapters as the course sequence (vs the IMAT track order in `TRACK_MAPS.md`).
2. Per chapter: the understand / be able to / memorize lists — hers to write or dictate; the table above only places assets.
3. Platform choice (Teachable vs Thinkific vs Kajabi) and whether the first paid access is one module for the current student.
4. Hosting for embedded games now that the repo is private.

## 6. Next steps (in order)

1. Ratify the outline: go chapter by chapter, fix the seven sub-levels and the three lists per chapter. This is the task she named as the one that unblocks everything else.
2. Set up public hosting from the private repo (Cloudflare Pages) so modules can be embedded.
3. Module 1 (Tro ch. 4, atomic structure) end to end on the five-step template, using the existing renderer prototype; pilot with the current IMAT student.
4. First PDF guide (same chapter) on Etsy.
5. Repeat per chapter in block order.
