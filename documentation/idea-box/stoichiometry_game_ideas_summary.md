# Stoichiometry Game Ideas — Discussion Summary

## Context

Malcolm liked the existing chemistry games and specifically asked for a stoichiometry game. The main design challenge identified was that stoichiometry is difficult to make into a game if it is treated as a worksheet-style calculation exercise. The better approach is to turn stoichiometry into a **resource-conversion / fixed-ratio assembly puzzle**.

The central idea:

> Stoichiometry is about making complete products from available reactants in fixed ratios.  
> This can first be taught using ordinary objects before introducing chemistry.

The microphone may mishear “stoichiometry” as “story geometry,” “street geometry,” “state championship game,” or “trigonometry game.” In this project context, all of those should be interpreted as **stoichiometry game** unless clearly stated otherwise.

---

## Core Educational Idea

The hidden structure of stoichiometry is:

> A complete object requires parts in a fixed ratio.  
> Given available parts, determine:
>
> - the maximum number of complete objects that can be made
> - which part runs out first
> - how many parts are left over

This is the same logic as limiting reagent problems, but without chemical symbols at first.

In chemistry terms:

| Everyday-object game | Chemistry equivalent |
|---|---|
| parts | reactants |
| recipe / assembly rule | balanced equation |
| complete object | product |
| part that runs out first | limiting reagent |
| leftover parts | excess reagent |
| number of complete objects | amount of product formed |

The first game should not look chemical. It should teach the structure before introducing chemical notation.

---

## Original Broad Stoichiometry Game Ideas

Several possible stoichiometry game formats were discussed.

### 1. Chemical Kitchen / Reaction Recipe Game

Reactants are treated like ingredients. Balanced equations are recipes. Products are target dishes or products.

Example:

```text
2 H₂ + O₂ → 2 H₂O
```

Given:

```text
6 mol H₂
2 mol O₂
```

The player determines:

- whether the reaction can run
- which reactant limits production
- how much product can be made
- what is left over

This was identified as a natural chemistry version of the game, but probably not the first implementation.

---

### 2. Limiting Reagent Battle

Each reactant could be represented as a resource, card, creature, or token. To create a product, the player must spend reactants in the correct ratio.

Example:

```text
N₂ + 3 H₂ → 2 NH₃
```

If the player has:

```text
4 N₂
9 H₂
```

Then only 3 complete reaction batches can run, because hydrogen limits the reaction.

This idea is useful because the limiting reagent becomes visually obvious.

---

### 3. Mole-to-Mass Factory

This would be a later stage. The player receives grams rather than moles and must move through conversion stations:

```text
grams → moles → mole ratio → moles product → grams product
```

The interface could be designed as a factory line:

```text
Weighing Station → Mole Converter → Ratio Reactor → Product Scale
```

This game would teach dimensional analysis and stoichiometric conversions.

---

### 4. Dimensional-Analysis Bridge Game

The player arranges unit-conversion tiles to build a correct path from starting unit to target unit.

Example path:

```text
g Al → mol Al → mol Al₂O₃ → g Al₂O₃
```

Possible tiles:

- grams of A
- moles of A
- moles of B
- grams of B
- molar mass conversion
- mole-ratio conversion

This could become a separate game because students often struggle not with arithmetic, but with knowing which conversion path to build.

---

### 5. Stoichiometry Shop / Order Fulfillment

The player receives an order:

```text
Make 50 g of CO₂.
```

They must buy or select the right amount of reactants. Too little fails the order. Too much wastes resources.

This makes stoichiometry feel purposeful because the calculation is tied to fulfilling a production request efficiently.

---

### 6. Mistake Detective

The game shows a worked stoichiometry solution with one error. The player identifies the mistake.

Possible mistake types:

- wrong molar mass
- wrong coefficient ratio
- inverted conversion factor
- equation not balanced
- grams used directly in a mole ratio
- rounding too early
- wrong limiting reagent selected

This could be pedagogically powerful because stoichiometry mistakes are repetitive and recognizable.

---

### 7. Reaction Packing Puzzle

The player groups molecule-like pieces into valid reaction packets.

Example:

```text
2 H₂ + O₂ → 2 H₂O
```

Given:

```text
8 H₂
3 O₂
```

The player groups the pieces into full reaction sets and sees what is left over.

This is useful for the first limiting-reagent lesson, before formal calculations are introduced.

---

## Recommended Long-Term Game Progression

A full stoichiometry game series could progress through levels:

1. Fixed ratios with everyday objects
2. Identifying maximum products from available parts
3. Identifying the limiting part
4. Calculating leftovers
5. Translating the same logic into molecules
6. Simple chemical reactions
7. Balanced equations
8. Mole-to-mole conversions
9. Gram-to-mole and mole-to-gram conversions
10. Limiting reagent in chemical reactions
11. Excess reagent left over
12. Percent yield
13. Purity / real-world reagent quality
14. Solution stoichiometry
15. Gas stoichiometry

The important design insight:

> Stoichiometry is not one mechanic. It is a chain of mechanics.  
> The game should teach one link at a time, then combine them.

---

## First Actual Game: Ratio Factory

The first game should be a non-chemical fixed-ratio assembly game.

Possible names discussed:

- Ratio Factory
- Recipe Ratios
- Part Factory
- Build-a-Batch
- Assembly Line
- Maximum Makes
- Limiting Parts

The strongest name was:

> **Ratio Factory**

This name works for sandwiches, cars, flowers, robots, and later chemistry.

---

## Core Gameplay Loop

The game shows a recipe or assembly rule.

Example:

```text
1 car = 1 body + 4 wheels + 6 glass panels + 1 steering wheel
```

The player receives an inventory.

Example:

```text
500 bodies
1732 wheels
5043 glass panels
600 steering wheels
```

The player must answer:

1. Maximum number of complete objects that can be made.
2. Which part is limiting.
3. How many of each part are left over.

The game checks the answer and explains the reasoning.

---

## First Simple Scenario: Cheese Sandwich Factory

The first implementation should use exactly one scenario.

### Recipe

```text
2 slices of bread + 1 slice of cheese → 1 cheese sandwich
```

### Example Inventory

```text
11 bread slices
4 cheese slices
```

### Correct Reasoning

Bread allows:

```text
floor(11 / 2) = 5 sandwiches
```

Cheese allows:

```text
floor(4 / 1) = 4 sandwiches
```

The smaller number controls production, so cheese is the limiting part.

### Correct Result

```text
Maximum sandwiches: 4
Limiting part: cheese
Bread used: 4 × 2 = 8
Bread left over: 11 - 8 = 3
Cheese used: 4 × 1 = 4
Cheese left over: 4 - 4 = 0
```

This first scenario is better than the ultra-simple 1 bread + 1 cheese version because it immediately introduces the important logic:

```text
possible products = floor(available amount / required amount)
```

---

## More Sandwich Examples

### Simple Cheese Sandwich

```text
1 bread + 1 cheese → 1 sandwich
```

Available:

```text
8 bread
5 cheese
```

Result:

```text
Maximum sandwiches: 5
Limiting part: cheese
Leftover bread: 3
Leftover cheese: 0
```

This is very beginner-friendly but does not show the division/floor logic as clearly.

---

### Deluxe Sandwich

```text
2 bread + 2 cheese + 1 tomato + 1 ham → 1 sandwich
```

Available:

```text
20 bread
17 cheese
12 tomato
6 ham
```

Possible sandwiches:

```text
bread: floor(20 / 2) = 10
cheese: floor(17 / 2) = 8
tomato: floor(12 / 1) = 12
ham: floor(6 / 1) = 6
```

The limiting part is ham.

Result:

```text
Maximum sandwiches: 6
Leftover bread: 8
Leftover cheese: 5
Leftover tomato: 6
Leftover ham: 0
```

This is a good second or third scenario.

---

## Vehicle Scenario: Car Factory

The car example is especially good because it feels like real manufacturing.

### Recipe

```text
1 car = 1 body/salon + 4 wheels + 6 glass panels + 1 steering wheel
```

### Example Inventory

```text
500 bodies
1732 wheels
5043 glass panels
600 steering wheels
```

### Reasoning

```text
bodies: floor(500 / 1) = 500 cars
wheels: floor(1732 / 4) = 433 cars
glass panels: floor(5043 / 6) = 840 cars
steering wheels: floor(600 / 1) = 600 cars
```

The limiting part is wheels.

### Result

```text
Maximum cars: 433
Leftover bodies: 67
Leftover wheels: 0
Leftover glass panels: 2445
Leftover steering wheels: 167
```

This scenario is strong because the excess glass is very large, making the leftover concept visually obvious.

---

## Flower / Plant Scenario

The flower idea should be framed as an assembly game, not a balancing game.

### Simple Flower

```text
1 flower = 1 flower head + 4 leaves
```

If available:

```text
5 flower heads
10 leaves
```

Then:

```text
flower heads allow 5 flowers
leaves allow floor(10 / 4) = 2 flowers
```

Result:

```text
Maximum flowers: 2
Limiting part: leaves
Leftover flower heads: 3
Leftover leaves: 2
```

---

### More Detailed Flower

```text
1 flower = 1 stem + 1 center + 6 petals + 4 leaves
```

Available:

```text
9 stems
10 centers
48 petals
25 leaves
```

Possible flowers:

```text
stems: floor(9 / 1) = 9
centers: floor(10 / 1) = 10
petals: floor(48 / 6) = 8
leaves: floor(25 / 4) = 6
```

The limiting part is leaves.

Result:

```text
Maximum flowers: 6
Leftover stems: 3
Leftover centers: 4
Leftover petals: 12
Leftover leaves: 1
```

This is a good visual scenario because the flower itself can be shown on the right while inventory parts are shown on the left.

---

## Other Strict-Ratio Object Ideas

The best object categories are:

- food
- vehicles
- nature/plants
- objects/furniture
- kits/orders
- robots/toys

### Food

```text
Burger = 2 buns + 1 patty + 1 cheese + 2 pickles + 1 lettuce
```

```text
BLT sandwich = 2 bread + bacon + lettuce + tomato
```

```text
S’more = 2 crackers + 1 marshmallow + 1 chocolate
```

```text
Hot dog = 1 bun + 1 sausage + 1 mustard packet
```

```text
Pizza order = 1 pizza + 1 box + 8 napkins + 2 sauce packets
```

Food is approachable and intuitive.

---

### Vehicles

```text
Bicycle = 1 frame + 2 wheels + 1 handlebar + 1 seat + 2 pedals
```

```text
Tricycle = 1 frame + 3 wheels + 1 handlebar + 1 seat + 2 pedals
```

```text
Skateboard = 1 board + 4 wheels + 2 trucks + 8 bearings
```

```text
Toy train = 1 engine + 3 wagons + 12 wheels + 4 connector pieces
```

Vehicles are good because they have strict mechanical ratios.

---

### Nature / Plants / Animals

```text
Flower = 1 stem + 1 center + 6 petals + 4 leaves
```

```text
Tree = 1 trunk + 1 crown + 8 apples + 12 leaves
```

```text
Ladybug = 1 body + 1 head + 6 legs + 2 antennae + 8 spots
```

```text
Butterfly = 1 body + 2 wings + 2 antennae + 6 legs
```

Plants and insects can be visually appealing and flexible.

---

### Objects and Furniture

```text
Chair = 1 seat + 4 legs + 1 back
```

```text
House = 4 walls + 1 roof + 1 door + 6 windows
```

```text
Table setting = 1 plate + 1 fork + 1 knife + 1 spoon + 1 glass + 1 napkin
```

```text
Dining set = 1 table + 4 chairs + 4 plates + 4 cups
```

These are good for everyday-ratio logic.

---

### Robots and Toys

```text
Robot = 1 head + 1 torso + 2 arms + 2 legs + 2 eyes + 1 battery
```

```text
Snowman = 3 snowballs + 2 eyes + 1 carrot + 2 stick arms + 3 buttons
```

```text
Doll = 1 head + 1 body + 2 arms + 2 legs + 2 shoes
```

Robots are especially good because they are playful and modular.

---

### Kits / Orders

```text
School kit = 1 pencil + 1 eraser + 1 sharpener + 1 notebook
```

```text
Birthday party kit = 1 cake + 8 plates + 8 forks + 8 cups + 8 candles
```

```text
First-aid kit = 1 box + 4 bandages + 2 wipes + 1 gauze roll + 1 tape roll
```

Kits are useful because they naturally involve “complete sets.”

---

## Chemistry Bridge

After the everyday-object game is working, the same mechanics can be transferred into chemistry.

Example everyday-object pattern:

```text
2 bread + 1 cheese → 1 sandwich
```

Chemistry pattern:

```text
4 Na + O₂ → 2 Na₂O
```

The same questions apply:

- How many complete reaction batches can be made?
- Which reactant runs out first?
- How much product is formed?
- What reactants are left over?

The bridge should be introduced after the player understands the fixed-ratio logic.

---

## Proposed First Chemistry Version

The first chemistry version could use simple reactions such as sodium oxide formation.

Example:

```text
4 Na + O₂ → 2 Na₂O
```

This should not be implemented before Ratio Factory is working.

The chemistry version would reuse the same logic:

```text
available amount / required coefficient
```

But the names change:

```text
parts → reactants
recipe → balanced equation
complete object → product
limiting part → limiting reagent
leftovers → excess reagent
```

---

## Implementation Strategy

The best implementation approach is incremental.

Do not ask Codex to build the whole stoichiometry system at once.

First implementation:

- add one new home-screen card
- create one game page
- implement one playable scenario
- keep the data structure simple
- make future expansion possible, but do not implement future scenarios yet

The first playable game should be:

> **Ratio Factory — Cheese Sandwich Factory**

This keeps scope controlled.

---

## Codex Kickoff Prompt

```md
# Task: Add One New Game — Ratio Factory

Please inspect the existing project structure first, then implement a small, complete first version of a new game called **Ratio Factory**.

This is the first step toward a future stoichiometry game, but this version must NOT include chemistry, molecules, reactions, balancing equations, or molar mass. It should only teach fixed component ratios using everyday objects.

## Goal

Add a new card/link on the home screen for:

**Ratio Factory**

The game should teach this idea:

> A complete object requires parts in a fixed ratio. Given available parts, the player must determine the maximum number of complete objects that can be made, the limiting part, and the leftover parts.

## First scenario only

Implement exactly one playable scenario:

### Cheese Sandwich Factory

Recipe:

- 2 slices of bread
- 1 slice of cheese

Makes:

- 1 cheese sandwich

Example inventory:

- 11 bread slices
- 4 cheese slices

Correct result:

- Maximum sandwiches: 4
- Limiting part: cheese
- Leftover bread: 3
- Leftover cheese: 0

## Required gameplay

The game page should show:

1. The recipe.
2. The available inventory.
3. Input field for maximum number of sandwiches.
4. Input/select field for limiting part.
5. Input fields for leftovers:
   - bread left over
   - cheese left over
6. A “Check Answer” button.
7. Feedback after checking:
   - correct/incorrect maximum sandwiches
   - correct/incorrect limiting part
   - correct/incorrect leftovers
8. A simple explanation after checking.

## Explanation logic

The explanation should show the reasoning clearly:

- Bread allows `floor(11 / 2) = 5` sandwiches.
- Cheese allows `floor(4 / 1) = 4` sandwiches.
- The smaller number controls production.
- Therefore cheese is limiting.
- 4 sandwiches can be made.
- Bread used: `4 × 2 = 8`; bread left: `11 - 8 = 3`.
- Cheese used: `4 × 1 = 4`; cheese left: `4 - 4 = 0`.

## Important constraints

- Keep the implementation minimal and clean.
- Do not build a large framework yet.
- Do not add chemistry yet.
- Do not add molecules yet.
- Do not add balancing equations yet.
- Do not add multiple scenarios yet unless the existing architecture makes this trivial.
- Do not break the existing games.
- Match the existing visual style and file organization as much as possible.
- Reuse existing patterns from the current games/home screen.
- Prefer simple data-driven structure so future scenarios can be added later.

## Future expansion to keep in mind, but NOT implement now

The game should later support other recipes such as:

- Deluxe sandwich: 2 bread, 2 cheese, 1 tomato, 1 ham
- Car: 1 body, 4 wheels, 6 glass panels, 1 steering wheel
- Flower: 1 stem, 1 center, 6 petals, 4 leaves
- Robot: 1 head, 1 torso, 2 arms, 2 legs, 2 eyes, 1 battery

Eventually, this will bridge into chemistry stoichiometry:

- parts → reactants
- recipe → balanced equation
- complete object → product
- limiting part → limiting reagent
- leftovers → excess reagent

But again: do not implement the chemistry bridge yet.

## Deliverable

Please implement the new Ratio Factory game and summarize:

1. Files changed.
2. How to run/test it.
3. Any assumptions made.
4. Any future extension points added.
```

---

## Development Notes

The first Codex task should be deliberately narrow:

```text
Exactly one first Ratio Factory game.
Exactly one first scenario.
No chemistry yet.
No molecule mode yet.
No balancing mode yet.
```

This protects the project from becoming too large too early.

The ideal first deliverable is a working vertical slice:

```text
Home screen card → Ratio Factory page → Cheese Sandwich scenario → answer checking → explanation
```

Once this works, the game can be expanded into:

1. multiple object scenarios
2. randomized inventories
3. visual assembly animation
4. chemistry bridge mode
5. molecule mode
6. full limiting-reagent stoichiometry
7. mole/mass conversions
8. percent yield

---

## Main Design Decision

The first stoichiometry game should not be a chemistry game.

It should be a **ratio reasoning game**.

That allows the learner to understand limiting reagents before chemistry notation is introduced.

The core skill is:

```text
For each required part:
possible products = floor(available amount / required amount)

The maximum number of complete products is the smallest of those values.
The part with the smallest value is the limiting part.
Leftover = available amount - maximum products × required amount.
```

This is the mathematical heart of limiting-reagent stoichiometry.
