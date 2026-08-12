# Shape Lab — the Bonding & Structure game

**Status:** design locked with Dalia 2026-08-12; building started same day. First version target: before Malcolm's IMAT (~Sept 21) — but "start building, we will adjust as we go along."
**Home in the universe:** Chapter 5 · Bonding & Structure (see `TOPIC_UNIVERSE_PLAN.md`). Covers the Molecular Shape & Polarity card, reaching into Ionic & Covalent territory via formal charge and Lewis structures.
**Names:** game working title **Shape Lab** (directory `shape-lab/`); the build workspace is the **Model Kit** (the digital ball-and-stick kit — Dalia delegated, Claude decided, veto open).

## Why this game

IMAT's heaviest topic (21/169 tagged questions), zero games. The tested reasoning chain is **shape → polarity → IMF → boiling point**; this game owns the first two links (IMFs live in the sibling topic). Dalia: figuring out the shape is the hardest thing to gamify but the most important — "once it is done, we're home free."

## The ladder (Dalia's order)

1. **Formal Charge** — small concept tab: intro + click-through examples + practice quiz. FC = valence e⁻ − (dots + sticks). Preferred: 0 and ±1; negative FC on the more electronegative atom; ±2/±3 "not allowed" in covalent species. The skill recurs in organic and inorganic — worth its own rung.
2. **Lewis Structures** — intro page + **clickable table of examples**, each walking the student step-by-step through building that molecule. Click-through cards for Dalia's 6 steps (from "How to Draw Lewis Structures," Heritage Ch 10 — reword only for wit/clarity/brevity). Ions get [brackets] and the charge — always taught, always displayed.
3. **Geometries** — a visual TABLE of all geometries (source: her Ch 10 reference handouts). Click a cell → popup: large slowly rotating 3D molecule, name, bond angle(s), key facts (equal bond lengths?, axial vs equatorial occupancy, polarity implications). ✕ returns to the table.
4. **Build molecules** — Model Kit practice: given a formula, build it, Check, watch it become 3D.
5. **Polarity** — clickable table of examples (H₂O, CO₂, NH₃, …) → rotating 3D structure wrapped in semitransparent electron clouds with a red→blue gradient showing the negative/positive ends.

Every rung: tabs on every screen, done screens with next/revisit/home (house navigation rules).

## The Model Kit (the engine)

- **Adding atoms:** pick from a periodic table (preferred; "way cooler") or type. Central atom + peripheral inputs (enter adds another, up to ~6–8).
- **The charge question:** for ions, the student *answers* "what's the charge?" on a horizontal −3…+3 picker. Non-zero → the drawing gains [brackets] and the charge, and the electron count adjusts (+1 e⁻ per negative, −1 per positive) per Lewis step 1.
- **Electrons as dots:** each element carries its valence electrons visually. They *live* at the compass positions (N/W/S/E, 1–2 per side) and settle there when that's the easiest thing in the world — but under strain (e.g. a triple bond) they slide **like beads on a ring** around the atom, with the compass points as preferred rest positions.
- **Bonding gesture:** drag dot → dot forms a bond line. Double-click a bond → back into two dots. Single/double/triple emerge naturally. Smooth glide animation like the organic gamespace.
- **Check → 3D:** explicit Check/Build button (predict-before-reveal). Correct → the molecule snaps into its true 3D arrangement and rotates slowly about its axis. Incorrect → hint / try again / clear.
- **Octet enforcement:** row 3+ may exceed 8 (expanded octets); B and Be may hold fewer; **N may never exceed 8** — nitrate is Dalia's FAVORITE teaching ion precisely because it forces this rule + formal charges + resonance in one molecule. Mine it hard.
- **Resonance:** Check accepts *any* valid resonance form. After success, show the sibling structures connected with double-headed arrows, and teach: the real bonds are in between (1⅓ for nitrate, 1½ for carboxylate/benzene); dashes can't carry formal charges or electron counts, which is why we draw every resonance form.

## Quiz + Model Kit layout

**Model Kit docked LEFT, quiz on the RIGHT** (Dalia's call). The Kit is an optional, beautiful scratchpad: a student who sees the answer in their head answers directly and skips the drag-and-drop commotion; the student who doesn't builds their way to it. This *separation of workspace from question* is a candidate house pattern — if it works, organic gets a parallel version later. **Do not overwrite organic's auto-detect-reactants feature** — parallel build; retire later whatever loses.

**Quiz format:** multiple choice with deliberately cruel distractor sets — options drawn from the same/adjacent electron-region counts so nothing is obviously wrong (tetrahedral / trigonal pyramidal / see-saw / square pyramidal / trigonal bipyramidal). An octahedral molecule being "obviously not linear" is exactly what the distractor set must prevent.

## Content sets

**Lewis walkthrough examples** (difficulty order, final list Dalia's): NO₃⁻ (THE favorite), CO₃²⁻, SO₃, XeO₂F₂ *(corrected from SO₂F₂)*, SF₄ (see-saw), H₂O, CO₂, BBr₃ + BeF₂ (octet rebels).

**Geometry table rows:** linear · trigonal planar · bent(3) · tetrahedral · trigonal pyramidal · bent(4) · trigonal bipyramidal · see-saw · T-shape · octahedral · square pyramidal · square planar (+ linear(5) as a note). Electron geometries: 2 linear, 3 trig planar, 4 tetrahedral, 5 trig bipyr, 6 octahedral; lone pairs take equatorial (5-region) / opposite (6-region) positions; molecular geometry = what the atoms trace.

**Polarity examples:** H₂O, CO₂, NH₃, + cases where symmetry cancels strong bond dipoles (CCl₄) vs. breaks (CH₂Cl₂ — a real IMAT question).

## Engine tech

Vanilla JS + canvas, no libraries. Reuse the organic lab's atom/animation machinery where it fits. 3D is real math done cheaply: stored unit-vector coordinates per geometry, rotation matrix per frame, perspective projection onto canvas; depth-scaled atom sizes, back-to-front draw order. Lone pairs render as ghost lobes (teaches the electron-geometry lineage). Polarity clouds: canvas radial gradients riding the same rotation. Shared tokens (True Autumn palette), subscript rendering ≥50%, numbered green-circle steps for hints — all house rules apply.

**Build order** (engineering, ≠ ladder order): 1) 3D renderer proven in the simplest context — the Geometries table + rotating popups; 2) shape quiz with hard distractors; 3) Model Kit (2D build → Check → 3D); 4) Lewis walkthroughs + formal charge rung; 5) polarity clouds. Rationale: everything downstream reuses the renderer; the geometry table proves it with zero interaction complexity.

## Open items

- Game title "Shape Lab" — Dalia may rename.
- Exact facts text per geometry popup (mine her reference handouts; her diagrams over invented ones).
- MC option count and whether any rung also takes typed answers.
- How much of the formal-charge quiz reuses Ox-State Trainer patterns (typed integers, nudges).
