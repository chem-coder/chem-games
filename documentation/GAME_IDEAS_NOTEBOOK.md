# Chem Games Idea Notebook

Started: 2026-05-15

Purpose: keep a living notebook of possible Chem Games modules, mini-games, and lookup tools before committing them to formal app specs. This file is more exploratory than `IDEA_BACKLOG.md`; ideas can be messy here before they become build plans.

## Working Product Thought

The visual equation balancer is strong because it turns an invisible chemistry rule into something the learner can manipulate. Before wrapping it in a larger game environment, the project should collect a small family of similarly interactive modules.

The near-term target is not "one giant chemistry app." It is a set of small, polished learning loops that can later sit inside a shared game shell.

Good Chem Games should:

- teach one chemistry move at a time
- make the rule visible through interaction
- give immediate feedback
- stay replayable with fresh data
- avoid feeling like a worksheet with buttons
- reuse local data where possible
- support YouTube/explainer lessons later

## Existing Project Assets To Build From

- `imat-chem-stoichiometry/` has the first mature game loop: reaction data, coefficient controls, atom totals, hints, scoring, progress, and review mode.
- `imat-chem-stoichiometry/data/reactions.js` is becoming shared reaction content for future reaction games.
- `ratio-factory/` has a first fixed-ratio reasoning loop for limiting-reagent intuition before chemistry notation.
- `chem-nomenclature/databases/` has reusable element and ion JSON data.
- `chem-nomenclature/v4/` already has early element and compound lookup behavior.
- `chem-pH-calculator/` has strong/weak acid/base calculator prototypes that could become an interactive acid-base game.
- `_teaching-materials/` has exam and worksheet sources that can feed reaction, stoichiometry, and topic-practice content after review.
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/` has gas law worksheets, gas stoichiometry, a quiz, a chapter deck, and Henry's Law material that can feed a gas-laws learning component.
- `documentation/reaction-mining/` already defines a workflow for turning source material into approved reaction content.
- `documentation/idea-box/stoichiometry_game_ideas_summary.md` is the raw source note for Ratio Factory and the larger stoichiometry game progression.

## Shortlist: Best Next Game Candidates

These are the best candidates to sit beside the equation balancer before building a larger game environment.

### 1. Ion Charge Builder

Core loop: the learner combines cations and anions until total charge is zero, then writes or confirms the formula.

Why it fits: it uses the existing nomenclature ion databases and teaches the logic behind subscripts instead of only asking for memorized names.

Interaction sketch:

- show a cation tile and an anion tile with charges
- learner adjusts how many of each ion are present
- a charge meter shows positive and negative totals
- formula updates live as the ratio changes
- success triggers when the compound is neutral and reduced to the simplest whole-number ratio

Possible modes:

- build formula from ion names
- name compound from formula
- choose correct Roman numeral for type II metals
- polyatomic ion parentheses challenge

MVP data needs:

- common cations
- monoatomic anions
- polyatomic anions
- compound naming rules

Risk notes:

- Needs careful treatment of type II metals and polyatomic parentheses.
- A neutral formula can be correct mathematically but still need naming-context checks.

### 2. Dimensional Analysis Conveyor

Core loop: the learner builds a conversion path by placing conversion-factor tiles in the right order so units cancel.

Why it fits: it is broadly useful for general chemistry and IMAT prep, and it can be highly visual without needing much chemistry data.

Interaction sketch:

- show a starting quantity and a target unit
- learner drags conversion tiles onto a track
- units above and below the track cancel visually
- the app flags dead-end units before the final calculation
- final answer requires correct magnitude and significant figures

Possible modes:

- metric prefix conversions
- length, mass, volume, time
- density conversions
- moles, particles, and molar mass
- multi-step stoichiometry from balanced equations

MVP data needs:

- curated conversion-factor list
- problem generator templates
- answer checker with tolerance and sig-fig rules

Risk notes:

- A good unit-canceling renderer matters more than a fancy calculator.
- Sig figs should probably be added after the basic path builder feels good.

### 3. Reaction Type Sorter

Core loop: the learner sorts reaction cards into reaction families, then explains the clue.

Why it fits: it can reuse the existing reaction database and helps students see patterns beyond balancing.

Interaction sketch:

- present a balanced or unbalanced reaction
- learner chooses a reaction type
- optional second layer asks for evidence: precipitate, gas formation, oxidation-state change, acid-base neutralization, combustion pattern, etc.
- feedback highlights the part of the equation that gives the clue

Possible modes:

- synthesis, decomposition, single replacement, double replacement
- combustion, acid-base, precipitation, gas formation, redox
- "find all that apply" for reactions with overlapping labels

MVP data needs:

- reaction topic labels from `reactions.js`
- short explanation for each label
- maybe a `primaryType` field if multi-label reactions become confusing

Risk notes:

- Some reactions genuinely belong to multiple categories, so the UI needs to allow layered answers or clearly define the requested classification.

### 4. pH Color Bar Challenge

Core loop: the learner predicts or calculates pH, then places it on a visual acid-base scale.

Why it fits: the pH calculator already exists, and a pH bar with a moving pointer would turn the math into a visual intuition builder.

Interaction sketch:

- choose strong acid, strong base, weak acid, or weak base
- given concentration, and sometimes Ka or Kb
- learner predicts acidic/basic/neutral first
- learner calculates pH or moves a pointer on the pH scale
- feedback shows pH, pOH, H+, and OH- relationship

Possible modes:

- strong acid/base quick calculations
- weak acid/base ICE-table guided mode
- concentration ranking
- pH/pOH/H+/OH- conversion puzzle

MVP data needs:

- pH calculation utilities
- strong acid/base presets
- weak acid/base Ka/Kb presets

Risk notes:

- Weak acid/base calculations need guardrails so the app teaches approximations correctly instead of just returning an answer.

### 5. Empirical Formula Foundry

Core loop: the learner turns percent composition or combustion analysis data into an empirical or molecular formula.

Why it fits: it is a classic stoichiometry bridge and naturally becomes a stepwise game.

Interaction sketch:

- show percent composition or mass data
- learner converts grams to moles
- learner divides by the smallest mole value
- learner chooses the whole-number multiplier when needed
- final formula assembles from element tiles

Possible modes:

- percent composition to empirical formula
- mass composition to empirical formula
- empirical formula plus molar mass to molecular formula
- hydrate formula from mass-loss data

MVP data needs:

- element molar masses
- problem templates
- tolerance handling

Risk notes:

- Needs a friendly way to handle near-integer ratios like 1.5, 1.33, and 1.25.

## Active Prototype: Ratio Factory

Source note: `idea-box/stoichiometry_game_ideas_summary.md`

App folder: `../ratio-factory/`

Core idea: stoichiometry should first be taught as fixed-ratio production, not as chemistry notation. A complete product requires parts in a fixed ratio. Given available parts, the learner determines the maximum number of complete products, the limiting part, and leftovers.

Current V1: Cheese Sandwich Factory.

```text
2 bread slices + 1 cheese slice -> 1 cheese sandwich
available: 11 bread slices, 4 cheese slices
maximum sandwiches: 4
limiting part: cheese
leftover bread: 3
leftover cheese: 0
```

Why it matters: this is the mathematical heart of limiting-reagent stoichiometry, but it removes the intimidation layer of formulas, molar masses, equations, and units. The learner sees the structure first.

Chemistry bridge:

| Ratio Factory | Stoichiometry |
|---|---|
| parts | reactants |
| recipe / assembly rule | balanced equation |
| complete object | product |
| limiting part | limiting reagent |
| leftover parts | excess reagent |
| maximum complete objects | amount of product formed |

Recommended progression:

1. Fixed ratios with everyday objects.
2. Maximum complete products from inventory.
3. Limiting part.
4. Leftovers.
5. Multiple everyday scenarios.
6. Visual assembly animation.
7. Chemistry bridge using simple balanced reactions.
8. Mole-to-mole stoichiometry.
9. Mass and molar-mass conversions.
10. Limiting reagent, theoretical yield, and percent yield.

Near-term options:

- Add more non-chemical scenarios: deluxe sandwich, car factory, flower builder, robot builder.
- Randomize inventories for the same recipe.
- Show products being assembled from inventory parts after checking an answer.
- Add a "mistake detective" mode later for common stoichiometry errors.
- Defer molecule mode and chemistry symbols until the everyday-ratio loop is genuinely comfortable.

## More Game Ideas

### Measurement Lab

Read virtual instruments: rulers, graduated cylinders, burets, thermometers, balances, and maybe speedometers. The learner must report the value with the correct precision.

Best mechanic: zoomable instrument faces with draggable meniscus/needle variants and answer feedback around estimated digits.

### Significant Figures Repair Shop

Give the learner a messy calculated answer and ask them to repair it: correct number of sig figs, correct decimal places for addition/subtraction, or correct log/antilog precision.

Best mechanic: answer cards move through an inspection station; each station checks one rule.

### Periodic Table Pattern Map

The learner predicts periodic trends by navigating a periodic table heat map.

Possible challenges:

- larger atomic radius
- higher ionization energy
- higher electronegativity
- metal/nonmetal/metalloid classification
- group family identification

Best mechanic: two-element comparisons are probably better than full-table quizzes at first.

### Oxidation State Detective

The learner assigns oxidation numbers, identifies what changed, then marks the oxidized and reduced species.

Best mechanic: element badges inside a formula get oxidation-state labels; changed labels glow between reactants and products.

### Lewis Structure Builder

The learner spends valence electron tokens to build a Lewis structure, checks octets, formal charge, resonance, and geometry.

Best mechanic: constrain the first MVP to small molecules and ions, with a guided electron budget.

### Product Predictor

The learner predicts products from common reaction patterns.

Best mechanic: drag ions or molecule fragments into product slots, then balance the result. This could become a bridge between nomenclature and the equation balancer.

Risk note: needs strong chemistry guardrails and curated levels before attempting broad generation.

### Solubility Rules Snap

The learner decides whether a pair of aqueous ions makes a precipitate.

Best mechanic: mix two solution cards, reveal possible ion pairings, then choose precipitate/no precipitate. Could feed precipitation reactions into the reaction database.

### Gas Law Control Room

The learner manipulates pressure, volume, temperature, and moles with sliders to satisfy a target state.

Best mechanic: visual container animation plus numeric relationship feedback. Start with Charles' law or Boyle's law before combined gas law.

Early design note: this should not become a calculator in a costume. The topic is intimidating partly because students see many formulas at once. The game should start with particle behavior and only then connect the visual pattern to the symbolic law.

### Scientific Method Sequencer

The learner orders steps of the scientific method and classifies pieces of a short experiment scenario.

Best mechanic: scenario cards rather than abstract step memorization.

## Lookup Tool Ideas

These do not need to be full games immediately, but they can become support tools inside games.

### Chemical Data Explorer

One clean lookup surface for elements, ions, molar masses, charges, and common names.

Useful features:

- symbol/name search
- molar mass calculator
- common ion lookup
- oxidation-state hints
- local JSON source display for debugging

### Nomenclature Helper

An interactive naming assistant that explains why a formula gets a certain name.

Useful features:

- parse formula
- detect ionic vs covalent pattern where possible
- show ion names and charges
- explain parentheses and subscripts
- show Roman numeral reasoning

### Reaction Pattern Library

A searchable library of reaction examples grouped by type.

Useful features:

- reaction type filters
- before/after balancing display
- evidence tags
- short explanation of why a reaction belongs to a category

### Acid-Base Calculator Plus

Upgrade the pH calculator into a reference and practice hybrid.

Useful features:

- pH, pOH, H+, and OH- linked calculations
- strong acid/base presets
- weak acid/base Ka/Kb lookup
- visual pH bar
- generated practice mode

### Unit Conversion Reference

A compact unit-conversion lookup that doubles as the data source for the Dimensional Analysis Conveyor.

Useful features:

- exact vs approximate conversion labels
- metric prefix table
- unit category filters
- copyable conversion-factor cards for practice problems

## Possible Shared Game Shell Later

Hold off on this until there are at least three strong loops. Once the balancer plus two or three companion games feel good, a shared environment could include:

- module map by topic
- daily practice set
- streak or mastery status
- review queue for missed levels
- consistent scoring and hint behavior
- shared chemistry data explorer
- student-friendly progress storage

Likely first shell cluster:

1. Visual Equation Balancer
2. Ratio Factory
3. Balloon Temperature Lab
4. Ion Charge Builder
5. Dimensional Analysis Conveyor
6. Reaction Type Sorter

## Prioritization Notes

Best next prototype if the goal is speed:

- Ion Charge Builder, because data already exists and the concept pairs naturally with the nomenclature app.

Best next prototype if the goal is IMAT stoichiometry continuity:

- Ratio Factory, because it builds limiting-reagent intuition before the learner touches mole ratios, molar mass, or dimensional analysis.

Best next prototype if Ratio Factory V1 is the active focus:

- Add two or three everyday scenarios before adding chemistry. Good candidates are deluxe sandwich, car factory, and flower builder.

Best next prototype if the goal is reusing reaction data:

- Reaction Type Sorter, because the reaction pool is already being built and tagged.

Best next prototype if the goal is visual delight:

- pH Color Bar Challenge, because color, sliders, and the acid/base scale can feel immediate and satisfying.

## Notes To Add From Project Owner

Drop future notes here first, then sort them into idea cards later.

## Sense-Making Pass: 2026-05-15

The project owner's new notes point to a clear second product lane:

> Chem 101 Foundations, built from the material students struggle with before the "real" chemistry questions.

This lane is different from the current IMAT stoichiometry lane, but the two support each other. The equation balancer teaches conservation of atoms. The next foundational tools can teach the skills students need before balancing and stoichiometry feel natural: units, prefixes, measurements, significant figures, formulas, ions, and naming.

### Main Signal From The Notes

The strongest immediate theme is not another isolated quiz. It is a guided practice system for early-course fluency.

The highest-value cluster appears to be:

1. Unit abbreviations and SI prefixes.
2. Unit conversions with exact/approximate conversion factors.
3. Temperature, density, and volume conversions.
4. Measurements and significant figures.
5. Inorganic nomenclature and ionic compound construction.

The "less is more" note is important product guidance: do not build worksheets for everything. Build interactive tools where labs or normal homework do not already give enough practice.

### Chem 101 Foundations Track

Possible first collection:

1. Unit Symbol Sprint
2. Prefix Ladder
3. Conversion Path Builder
4. Measurement Precision Lab
5. Significant Figures Repair Shop
6. Ionic Formula Builder
7. Inorganic Nomenclature Trainer

This track could be framed as "foundation games" rather than a separate app family. Each one trains a small skill that students repeatedly need in chemistry labs and exams.

### Unit Symbol Sprint

Core loop: show a unit name, quantity type, or abbreviation, and ask the learner to match the correct counterpart.

Examples:

- length -> meter -> m
- mass -> kilogram -> kg
- time -> second -> s
- temperature -> kelvin -> K
- milliliter -> mL
- cubic centimeter -> cm3

Why it fits: this is the smallest useful practice loop for Lab 2 / Chapters 1-3. It is fast to build and can feed into conversion practice later.

MVP shape:

- multiple-choice or typed-answer mode
- SI base units first
- common lab units second
- instant correction with the quantity type shown

### Prefix Ladder

Core loop: learners arrange metric prefixes on a scale and convert between adjacent or non-adjacent prefixes.

Examples:

- kilo, base, centi, milli, micro, nano
- mg to g
- mL to L
- cm to m

Why it fits: prefix fluency is a prerequisite for unit conversions, density, solution concentration, and lab measurements.

Best mechanic: a vertical or horizontal ladder where moving left/right multiplies or divides by powers of ten.

MVP shape:

- prefix-to-power matching
- prefix ordering
- simple one-step metric conversions
- later: generated conversion questions

### Conversion Path Builder

This strengthens the existing Dimensional Analysis Conveyor idea.

Core loop: the learner chooses conversion-factor tiles and places them in order so units cancel and the quantity remains the same.

Important teaching rule from the notes:

- A conversion is not a rounding exercise.
- The final quantity should represent the same amount, expressed in different units.
- Rounding/sig figs can be checked after the conversion logic is correct.

MVP problem types:

- temperature conversions
- density conversions
- volume conversions
- length, mass, time
- metric prefixes

Content notes:

- curate the given conversion-factor list
- remove non-essential factors from early levels
- mark exact vs approximate conversion factors
- use more precise factors where useful
- include an answer key/export view later if this becomes worksheet-adjacent

### Measurement Precision Lab

Core loop: read a virtual lab instrument and report the measurement with appropriate precision.

Why it fits: this directly serves Chapters 1-2 and labs. It also makes "measurable quantities" concrete.

Possible instrument set:

- ruler
- graduated cylinder
- thermometer
- balance
- buret, later

Skill focus:

- measured quantity
- unit abbreviation
- instrument precision
- estimated digit
- significant figures

### Inorganic Nomenclature Trainer

This is not just a lookup tool; it can become one of the main Chem Games pillars.

Scope from the notes:

- ionic nomenclature
- covalent nomenclature
- acid nomenclature

Why it matters: there are many organic nomenclature apps, but fewer clean inorganic naming trainers. The existing nomenclature app and ion databases make this a natural continuation.

Possible game modes:

- formula -> name
- name -> formula
- ion charge matching
- Roman numeral selection
- acid naming pattern recognition
- covalent prefix practice

Build sequence:

1. Ionic formula builder from ions.
2. Formula-to-name inorganic trainer.
3. Name-to-formula inorganic trainer.
4. Acid and covalent modes after the ionic foundation feels reliable.

### Quantum Numbers Convention Mapper

The "nested arrays to ID quantum numbers by convention" note points to a lookup/game hybrid for electron configuration and quantum numbers.

Possible core loop: the learner identifies valid quantum number sets by navigating allowed values.

Interaction sketch:

- choose n
- app shows allowed l values
- choose l
- app shows allowed ml values
- choose ml
- choose ms
- app confirms whether the set is valid

Possible modes:

- valid/invalid quantum number set
- orbital name from quantum numbers
- quantum numbers from orbital notation
- electron capacity by shell/subshell/orbital

MVP risk: this should probably wait until after foundational units/nomenclature unless a specific course need makes it urgent.

### Revised Next-Build Recommendation

Based on these notes, the most strategic next prototype is probably one of these two:

1. Conversion Path Builder, if the goal is Chem 101 foundations and lab support.
2. Ionic Formula Builder, if the goal is to extend the existing nomenclature database into a more game-like tool.

If choosing by fastest useful win, build Unit Symbol Sprint or Prefix Ladder first. They are small, testable, and can become early levels inside the larger Conversion Path Builder.

If choosing by product identity, build Ionic Formula Builder first. It feels more distinctly "chemistry game" and pairs beautifully with the existing equation balancer.

## Sense-Making Pass: Lecture Map 2026-05-15

The newer lecture notes broaden the notebook from "next tiny game" into a full Chem 101 course map. They also strengthen one central product insight:

> Chemical reactions should become a major Chem Games pillar, not only one balancing game.

The visual equation balancer can be the first room in a larger Reaction Studio. That studio could eventually teach identifying reactions, writing equations, balancing equations, predicting products, applying solubility rules, writing molecular/complete ionic/net ionic equations, recognizing acid-base/gas evolution/redox/combustion patterns, and doing stoichiometry from the balanced equation.

### Course Map From The Notes

The notes cluster into six durable content bands:

1. Foundations: units, scientific notation, significant figures, matter classification, element names/symbols, atomic structure, ions, isotopes, and periodic table families.
2. Atomic and bonding models: electromagnetic radiation, periodic trends, electron configuration, quantum numbers, Pauli exclusion, Hund's rule, Lewis structures, formal charge, electron geometry, and molecular geometry.
3. Reactions: balancing, product prediction, solubility rules, precipitation, net ionic equations, acid-base reactions, gas evolution, redox, combustion, and reaction classification.
4. Quantitative chemistry: limiting reagent, theoretical yield, percent yield, empirical formula, molarity, molality, mass percent, dilutions, colligative properties, and solution stoichiometry.
5. Physical states and energy: phase changes, vapor pressure, surface tension, viscosity, heating/cooling curves, heat of fusion, heat of vaporization, specific heat, exothermic/endothermic reactions, and energy diagrams.
6. Equilibrium and solubility: forward/reverse reaction rates, equilibrium expressions, K magnitude, Le Chatelier's principle, Ksp expressions, and solubility calculations.

### Reaction Studio

This is the most important mid-term product concept from the new notes.

Possible modules:

1. Visual Equation Balancer: already underway.
2. Reaction Type Sorter: classify reactions and identify the evidence.
3. Product Predictor: choose likely products from reaction patterns.
4. Solubility Rules Snap: decide whether a precipitate forms.
5. Net Ionic Equation Builder: remove spectator ions and write the net ionic equation.
6. Acid-Base Equation Builder: identify neutralization patterns and write products.
7. Gas Evolution Detector: recognize when a reaction forms a gas.
8. Redox Detective: assign oxidation states and identify oxidation/reduction.
9. Combustion Pattern Trainer: recognize hydrocarbon combustion and balance products.
10. Stoichiometry Bridge: use a balanced equation for limiting reagent, theoretical yield, and percent yield.

Data implication: reaction records should eventually support more than coefficients. Useful future fields may include `primaryType`, `evidence`, `drivingForce`, `states`, `spectatorIons`, `netIonicEquation`, `oxidationStates`, and `productPredictionPattern`.

### Solutions And Solubility Lab

Core loop: learners manipulate a solution system and watch concentration, dissolved amount, precipitated amount, and saturation state update.

Game/tool ideas:

- Solvent Match: choose suitable solvents using "like dissolves like."
- Saturation Plot Reader: read solubility curves and classify dilute, saturated, or supersaturated solutions.
- Precipitate Amount Calculator: calculate how much dissolves and how much precipitates at a new temperature.
- Molarity Mixer: build a target molarity from moles and volume.
- Dilution Dock: use `c1V1 = c2V2` by dragging stock solution and water into a flask.
- Colligative Property Lab: connect molality, freezing point depression, boiling point elevation, and van't Hoff factor.
- Osmosis/Dialysis Concept Sorter: qualitative membrane transport scenarios.

Best early MVP: Dilution Dock or Molarity Mixer. They are visual, concrete, and connect to lab practice.

### Acid-Base Lab

The pH calculator should grow into an acid-base practice environment rather than stay only a calculator.

Possible modules:

- Indicator Sort: litmus/pH/taste/slipperiness clues, with careful safety framing for real-world tests.
- Acid-Base Theory Sorter: classify Arrhenius, Bronsted-Lowry, and Lewis acid/base examples.
- Conjugate Pair Matcher: pair acids with conjugate bases and bases with conjugate acids.
- Strong vs Weak Sort: separate dissociation strength from concentration.
- Neutralization Builder: combine strong acid and strong base amounts, identify leftover acid/base, and calculate final pH when appropriate.
- pH/pOH Converter: connect `[H+]`, `[OH-]`, pH, and pOH.
- Buffer Qualitative Challenge: predict what a buffer does when acid or base is added.

Best early MVP: pH/pOH Converter, because it can reuse the pH calculator and make the relationships visible.

### Equilibrium Shift Simulator

Core loop: learners adjust concentration, temperature, pressure, or volume and predict how the system shifts.

Possible modules:

- Forward/Reverse Rate Balance: show equilibrium as equal rates, not stopped reaction.
- K Expression Builder: drag species into numerator/denominator and omit solids/liquids when relevant.
- K Magnitude Interpreter: classify product-favored vs reactant-favored from large/small K.
- Le Chatelier Simulator: predict shift after a disturbance.
- Ksp Solubility Builder: write Ksp expressions and connect them to molar solubility.

Best early MVP: K Expression Builder or K Magnitude Interpreter, because they are smaller than a full dynamic simulator.

### Phase Change And Energy Lab

Core loop: learners move a substance through heating/cooling segments and choose the correct energy calculation.

Possible modules:

- Heating Curve Navigator: choose whether to use `q = mc Delta T`, `q = Delta Hfus * moles`, or `q = Delta Hvap * moles`.
- Phase Change Sorter: match evaporation/condensation, melting/freezing, and sublimation/deposition.
- Vapor Pressure Predictor: compare vapor pressure and rate of vaporization in qualitative scenarios.
- Heat Transfer Metal Lab: calculate specific heat or final temperature from heat transfer data.
- Energy Diagram Sorter: classify exothermic vs endothermic profiles.

Best early MVP: Heating Curve Navigator. It turns a common multi-step calculation into a visual path.

### Gas Laws Motion Lab

Context: a new teaching-materials folder exists at `_teaching-materials/CHEM 101 and 111 - Gas Laws/`. It includes pressure conversion problems, mixed gas law practice, gas stoichiometry, chapter practice problems, a gases deck, a quiz, and Henry's Law material.

Current tutoring context: Malcolm has recently worked through Boyle's law, Charles' law, Gay-Lussac's law, Avogadro's law, combined gas law, and ideal gas law. He is beginning to get it, but the topic feels intimidating. That points toward a visual concept component before a full calculation game.

Core product principle for gases:

> Show the gas behavior first, then attach the law and equation after the learner has seen the relationship.

Possible modules:

- Balloon Temperature Lab: change the outside temperature around a suspended transparent balloon and watch particle motion, balloon size, and seasonal cues change together.
- Boyle's Law Compression Lab: shrink the container at constant temperature and watch pressure rise as collisions with the walls become more frequent.
- Gay-Lussac Pressure Chamber: heat gas in a fixed-volume container and watch pressure rise instead of volume expanding.
- Avogadro Particle Pump: add particles at constant temperature and pressure and watch volume expand.
- Combined Gas Law Control Room: compare two states by changing P, V, and T, but only after the single-variable laws feel intuitive.
- Ideal Gas Law Builder: connect P, V, n, and T into one relationship and solve for one missing variable.
- Dalton Partial Pressure Mixer: combine gases and show total pressure as the sum of partial pressures.
- Gas Stoichiometry Bridge: connect balanced equations to gas volume, moles, and ideal gas law calculations.
- Henry's Law Visual: connect gas pressure above a liquid to dissolved gas concentration.

Best first MVP:

1. Build the Balloon Temperature Lab as a tiny visual component.
2. Use a red/pink transparent balloon, darker at the edges and clearer in the center, so particles remain visible.
3. Let the learner drag an outside-temperature slider in Celsius.
4. Show seasons as the temperature context: snow below `0 C`, summer at `25 C` or higher, spring when temperature rises through the middle range, and autumn when it falls.
5. Animate particles moving faster as temperature increases and slower as temperature decreases.
6. Change the balloon's size with temperature, but do not add pressure controls yet.
7. Show only a `T` marker with an up/down arrow for now.

Why this first: it directly addresses the "why does volume expand at high temperature?" concept without feeling like another worksheet or a standard piston demo. The first version should feel visual, memorable, and low-pressure.

Design cautions:

- Do not start with mixed gas law problems.
- Do not show every formula at once.
- Avoid making the particle animation scientifically over-precise; it only needs to communicate the correct relationship.
- Keep "temperature means average kinetic energy" visible in plain language.
- Keep units and Kelvin conversion as support, not the main event.

Later bridge to numbers:

- Once the sandbox works, add target challenges such as "double the Kelvin temperature" or "predict the new volume."
- Then add a calculation panel where the visual state becomes a two-state table.
- Finally connect gases to stoichiometry after students already trust the P/V/T/n relationships.

#### Source Review: Gas Laws Materials 2026-05-15

Reviewed sources:

- `_teaching-materials/CHEM 101 and 111 - Gas Laws/Ch 11 v6.pptx`
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/11-1 - Pressure_Conversion_Problems.pdf`
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/11-2 - Mixed-gas-laws-worksheet with KEY.pdf`
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/11-3 - Gas Stoichiometry.pdf`
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/Ch 11 - Gases  - Practice problems (101).pdf`
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/11-1 - Pressure_Conversion_Problems-KEY.doc`
- `_teaching-materials/CHEM 101 and 111 - Gas Laws/Chapter 11 Quiz (Gases).docx`

PowerPoint teaching sequence:

1. Gas properties and kinetic molecular theory: low density, compressibility, empty space, negligible attractions, constant particle motion, and temperature as particle speed/kinetic energy.
2. Pressure: force per area, collisions with container walls, pressure units, barometer units, and pressure conversion factors.
3. Gas state variables: pressure, volume, temperature, and amount of gas.
4. Simple laws: Boyle's law, Charles' law, Avogadro's law, with examples and solution maps.
5. Combined and ideal gas laws: combine P/V/T/n relationships, use `PV = nRT`, and enforce R-compatible units.
6. Ideal vs non-ideal gases: ideal behavior is favored by lower pressure and higher temperature.
7. Dalton's law and partial pressures: gas mixtures, mole fraction, atmospheric composition, hypoxia, oxygen toxicity, nitrogen narcosis, Heliox, and gas collection over water.
8. Gas stoichiometry: convert P/V/T gas data to moles, use reaction coefficients, and use STP molar volume when appropriate.
9. Applied context: air pollution and environmental chemistry.

PDF practice emphasis:

- Pressure conversions are a standalone skill using atm, kPa, Pa, mm Hg, torr, psi, and in Hg.
- Mixed gas law practice asks students to identify which variables are changing, convert Celsius to Kelvin, choose the correct relationship, and solve for P/V/T/n.
- Gas stoichiometry requires balancing equations first, then moving between mass, moles, gas volume, STP, and ideal-gas-law conditions.
- Exam-style questions combine gas laws with molecules, partial pressure, density/molar mass, barometer readings, stoichiometry, mole fraction, and stored-gas pressure.

Word document emphasis:

- The pressure-conversion key confirms the pressure-conversion worksheet answers and reinforces that pressure units are an early, separate warm-up skill rather than the conceptual heart of the chapter.
- The short quiz has three focused assessment moves: Charles' law with constant pressure, STP molar volume, and ideal gas law after converting gas mass to moles.
- The quiz sequence is a useful minimum viable assessment path: visual relationship -> standard molar-volume shortcut -> `PV = nRT`.

Teaching/design implications:

- Students are likely intimidated because the chapter stacks many formulas quickly. The app should separate relationship intuition from equation manipulation.
- The first interactive piece should focus on one relationship and one controlled-variable story.
- Every gas-law activity should show which variables are changing and which are being held constant.
- Kelvin conversion is essential, but it should appear as a support check after the learner understands why temperature matters.
- Pressure-unit conversion is useful, but it is probably a warm-up tool rather than the first playful game.
- Gas stoichiometry should come after the learner understands `P`, `V`, `T`, and `n`; it belongs as a bridge between Gas Laws Motion Lab and Reaction Studio.
- A small quiz mode could be built later from three problem families: constant-pressure V/T change, STP volume from moles, and ideal-gas-law pressure from mass.

Best first component after source review: Balloon Temperature Lab.

Why:

- It directly matches Malcolm's conceptual friction: why heating gas can cause expansion.
- It supports a clear KMT explanation: higher temperature means faster particles; faster particles hit the balloon more forcefully/more often; the balloon expands visually.
- It can be built without making the first gas-laws experience feel like a worksheet.

Implementation note: V1 exists at `../chem-gas-laws/index.html` as the Balloon Temperature Lab. This replaces the earlier piston/exerciser concept.

Suggested interaction:

- Show one suspended balloon with animated particles inside.
- Keep the middle of the balloon transparent and make the red/pink edge more visible with a gradient.
- Let the learner drag an outside-temperature slider in Celsius.
- Switch the environment by temperature and direction: winter below `0 C`, summer at `25 C` or higher, spring while warming through the middle, autumn while cooling through the middle.
- Keep snow/leaves outside the balloon.
- Increase particle speed as `T` rises.
- Show a large `T` with an up/down arrow on the right side of the environment.
- Defer pressure, formulas, Kelvin conversion, and numeric challenges until the visual language feels right.

Good second component: Boyle's Law Compression Lab.

Why:

- It pairs naturally with the first Charles' law concept, but it probably needs a different visual treatment instead of assuming the old chamber/piston setup.
- It teaches inverse relationships with a simple motion: smaller volume means more frequent wall collisions and higher pressure.
- It could reuse the same particle engine and qualitative temperature/pressure language, but the interface should be reconsidered after the balloon lab settles.

Possible shared gas-laws UI pattern:

- One gas chamber.
- Four variable badges.
- Lock icons for constants.
- A slider or handle for the manipulated variable.
- A live qualitative relationship statement.
- An optional numeric challenge after the visual relationship is understood.

### Intermolecular Forces And Materials Sorter

Core loop: learners classify particles and predict macroscopic properties from bonding/interactions.

Possible modules:

- IMF Matcher: identify London dispersion, dipole-dipole, hydrogen bonding, and ion-dipole interactions.
- Property Predictor: rank surface tension, viscosity, vapor pressure, or boiling point based on IMFs.
- Solid Type Sorter: distinguish ionic, molecular, metallic, and maybe network covalent solids.
- Conductivity Challenge: predict whether a substance conducts as a solid, liquid, or aqueous solution.

Best early MVP: IMF Matcher, because it is conceptually compact and sets up later property-prediction games.

### Atomic And Bonding Builder

This expands the earlier quantum-number note into a broader atomic/bonding lane.

Possible modules:

- Periodic Trend Map: compare atomic radius, reactivity, and electronegativity.
- Electron Configuration Builder: build long-form and shorthand configurations.
- Ion Electron Configuration Challenge: adjust configurations for cations and anions.
- Quantum Number Mapper: navigate valid `n`, `l`, `ml`, and `ms` values.
- Lewis Structure Builder: spend valence-electron tokens, satisfy octets, and calculate formal charges.
- Geometry Builder: connect electron-density geometry to molecular geometry.

Best early MVP: Electron Configuration Builder or Lewis Structure Builder, depending on which topic is most painful for students.

### Updated Roadmap Thought

There are now three plausible product lanes:

1. Foundations Lane: units, prefixes, measurements, sig figs, ionic formulas, and inorganic nomenclature.
2. Reaction Studio Lane: balancing, classification, product prediction, solubility, net ionic equations, acid-base, gas evolution, redox, combustion, and stoichiometry.
3. Physical/Chemical Systems Lane: solutions, acids/bases, equilibrium, gas laws, phase changes, IMFs, and energy.

Recommended build logic:

1. Finish or playtest the equation balancer enough to understand what "good" feels like.
2. Build one small Foundations game, most likely Prefix Ladder or Conversion Path Builder.
3. Build one chemistry-native companion game, most likely Ionic Formula Builder or Reaction Type Sorter.
4. If supporting Malcolm's current work is the priority, continue the Balloon Temperature Lab as a focused gas-laws component.
5. Treat Reaction Studio as the first larger product bundle once there are two or three stable mini-games.
6. Keep solutions/acids/equilibrium/phase-change ideas in the notebook until the data and calculation utilities are ready.

## Open Questions

- Should the next game reinforce stoichiometry, or deliberately broaden the product beyond reaction balancing?
- Should lookup tools live as standalone pages, or be embedded inside each game as hints/reference panels?
- What is the desired first "collection" for students: IMAT-only, general chemistry basics, or a Chem 1315-style course sequence?
- How playful should the shared shell eventually become compared with the current clean trainer style?
- Which topics most urgently need video companion lessons?
- Should Reaction Studio become the first larger bundle after the balancer, or should Chem 101 Foundations come first?
- For acids/bases, should the next step be a pH calculator upgrade, a neutralization game, or acid-base reaction writing?
- Which lecture unit is currently the biggest student pain point: foundations, reactions, solutions, acids/bases, equilibrium, or thermochemistry?
- For gases, after the Balloon Temperature Lab, should the next build stay with Charles' law or move to Boyle's law?
- How much particle-level animation is enough before the interface becomes distracting?
- Should gas stoichiometry live inside the Gas Laws lane or inside Reaction Studio?
