# Chem Games — Project Brief

## 1. Project concept

Chem Games is a collection of interactive chemistry learning apps.

The first product direction is an **IMAT Chemistry trainer** for students preparing for the Italian medical school admission exam. The long-term idea is to build chemistry learning tools that feel like games, not like flashcards, worksheets, or static multiple-choice quizzes.

The first working app should focus on **stoichiometry**, because it is highly relevant to exam prep and easy to convert into interactive mini-games.

The goal is to build small, reusable learning games that train one chemistry skill at a time, then connect that skill to exam-style questions.

Core principle:

> Teach chemistry through interaction.

The student should not only read an explanation. The student should manipulate the system and see the chemistry rule become visible.

---

## 2. Target user

Initial target user:

- IMAT student
- Preparing for the chemistry portion of the exam
- Needs fast, structured practice
- May be weak in basic chemistry foundations
- Benefits from visual, interactive feedback
- Needs confidence and repetition before exam-style questions

The first real test user can be Malcolm, who is preparing for IMAT and working through stoichiometry.

---

## 3. Product direction

The app should be:

- web-first
- simple to run locally
- easy to share by link later
- visual
- interactive
- modular
- expandable
- not dependent on a backend at the MVP stage

The first version should use:

- HTML
- CSS
- JavaScript
- JSON-like data objects

Do not start with React, Vue, SwiftUI, TypeScript, database, authentication, payment system, or backend.

Those may be added later only after the game logic and learning loop are proven.

---

## 4. First app: IMAT Chemistry Stoichiometry Trainer

The first Chem Games app should be:

# IMAT Chemistry Stoichiometry Trainer

The first module should focus on reaction balancing.

The module should eventually include several stoichiometry mini-games, but the first MVP should include only one polished-enough game:

# Game 1: Visual Equation Balancer

---

## 5. Game 1: Visual Equation Balancer

### 5.1 Core idea

The student sees an unbalanced chemical equation at the top.

Example:

```text
CH₄ + O₂ → CO₂ + H₂O
```

Each molecule has coefficient controls.

Example:

```text
▲
1 CH₄
▼
```

The student changes coefficients using up/down controls.

Under the written equation, the app displays a visual representation of the atom balance.

Each element is represented by a distinct geometric shape or visual marker.

Example:

- Carbon: black circle
- Hydrogen: small light circle
- Oxygen: red circle
- Nitrogen: blue circle
- Chlorine: green square

For the example:

```text
CH₄ + O₂ → CO₂ + H₂O
```

Initial state with all coefficients at 1:

Left side:

- C = 1
- H = 4
- O = 2

Right side:

- C = 1
- H = 2
- O = 3

The app visually shows that:

- Carbon is balanced
- Hydrogen is not balanced
- Oxygen is not balanced

When the student changes coefficients, the visual atom counts update immediately.

Correct balanced state:

```text
CH₄ + 2O₂ → CO₂ + 2H₂O
```

Then:

- C: left 1 / right 1
- H: left 4 / right 4
- O: left 4 / right 4

When all elements are balanced:

- all element rows light up
- success message appears
- next level becomes available

---

## 6. Why this is a good first game

The equation balancer is a good first game because it is:

- visual
- intuitive
- directly educational
- easy to test with students
- easy to expand with more reactions
- technically feasible in vanilla JavaScript
- built around a reusable data model

It teaches conservation of atoms by making the counts visible.

The student is not just guessing coefficients. They are seeing how changing coefficients changes the atom totals.

---

## 7. MVP scope

The first MVP should include:

1. One page app.
2. A small set of reaction levels.
3. One active reaction at a time.
4. Coefficient controls for each molecule.
5. Visual atom counts for reactants and products.
6. Balanced/unbalanced status for each element.
7. Success state when all elements are balanced.
8. “Next reaction” button.
9. Basic progress saving in localStorage.
10. Reusable reaction data stored separately from logic.

The MVP should not include:

- login
- backend
- payment
- subscriptions
- account system
- full IMAT syllabus
- mock exams
- analytics
- React/Vue
- native mobile app
- AI explanations
- user-generated questions

---

## 8. Suggested first reactions

Start with 5 simple balancing levels:

```text
H₂ + O₂ → H₂O
CH₄ + O₂ → CO₂ + H₂O
N₂ + H₂ → NH₃
Al + O₂ → Al₂O₃
Fe + O₂ → Fe₂O₃
```

Each reaction should be stored as data.

Adding a new reaction should not require writing new UI code.

---

## 9. Reusable data model

Reaction screens should not be hardcoded.

Each reaction should be represented as an object.

Example:

```js
const reactions = [
  {
    id: "methane_combustion",
    title: "Methane combustion",
    topic: "stoichiometry",
    subtopic: "balancing",
    difficulty: 1,

    reactants: [
      {
        formula: "CH4",
        displayFormula: "CH₄",
        atoms: { C: 1, H: 4 },
        coefficient: 1
      },
      {
        formula: "O2",
        displayFormula: "O₂",
        atoms: { O: 2 },
        coefficient: 1
      }
    ],

    products: [
      {
        formula: "CO2",
        displayFormula: "CO₂",
        atoms: { C: 1, O: 2 },
        coefficient: 1
      },
      {
        formula: "H2O",
        displayFormula: "H₂O",
        atoms: { H: 2, O: 1 },
        coefficient: 1
      }
    ],

    solution: {
      reactants: [1, 2],
      products: [1, 2]
    },

    hints: [
      "Carbon is already balanced.",
      "Hydrogen appears as 4 atoms on the left and 2 atoms in each water molecule.",
      "After hydrogen is balanced, check oxygen again."
    ]
  }
];
```

---

## 10. Element style data

Element styling should also be reusable and separate from reaction logic.

Example:

```js
const elements = {
  C: {
    name: "Carbon",
    colorClass: "element-carbon",
    shapeClass: "shape-circle"
  },
  H: {
    name: "Hydrogen",
    colorClass: "element-hydrogen",
    shapeClass: "shape-small-circle"
  },
  O: {
    name: "Oxygen",
    colorClass: "element-oxygen",
    shapeClass: "shape-circle"
  },
  N: {
    name: "Nitrogen",
    colorClass: "element-nitrogen",
    shapeClass: "shape-circle"
  },
  Cl: {
    name: "Chlorine",
    colorClass: "element-chlorine",
    shapeClass: "shape-square"
  }
};
```

The renderer should use this object to decide how atoms are displayed.

---

## 11. Suggested folder structure

```text
chem-games/
  README.md
  PROJECT_BRIEF.md

  imat-chem-stoichiometry/
    index.html

    css/
      styles.css

    js/
      app.js
      balancingEngine.js
      balancingRenderer.js
      balancingGame.js
      progressStorage.js

    data/
      reactions.js
      elements.js

    assets/
      icons/
      sounds/
```

---

## 12. Architecture

The architecture should be simple and modular.

```text
Reaction data
   ↓
Balancing engine
   ↓
Renderer
   ↓
Game controller
   ↓
User interaction
```

### Data files

These define the content.

- reactions
- element styles
- later: topic metadata, question banks, game levels

### Engine files

These contain pure chemistry/game logic.

They should calculate:

- atom totals
- balanced/unbalanced status
- completion state
- coefficient changes

### Renderer files

These draw the UI.

They should not contain chemistry logic.

### Game controller

This connects user actions to the engine and renderer.

---

## 13. Balancing engine requirements

The balancing engine should include pure functions such as:

```js
function getSideTotals(molecules) {}
function getAllElements(reaction) {}
function getReactionTotals(reaction) {}
function getElementBalanceStatus(reaction) {}
function isReactionBalanced(reaction) {}
function updateCoefficient(reaction, side, moleculeIndex, direction) {}
function resetReaction(reaction) {}
```

Example behavior:

Input:

```js
[
  { atoms: { C: 1, H: 4 }, coefficient: 1 },
  { atoms: { O: 2 }, coefficient: 2 }
]
```

Output:

```js
{
  C: 1,
  H: 4,
  O: 4
}
```

Element balance output example:

```js
{
  C: { left: 1, right: 1, balanced: true },
  H: { left: 4, right: 4, balanced: true },
  O: { left: 4, right: 4, balanced: true }
}
```

---

## 14. Renderer requirements

The renderer should display:

1. Reaction title.
2. Equation.
3. Molecule coefficient controls.
4. Atom balance visualization.
5. Element-by-element status.
6. Success message.
7. Next reaction button.
8. Progress indicator.

Suggested renderer functions:

```js
function renderBalancingGame(reaction) {}
function renderEquation(reaction) {}
function renderMolecule(molecule, side, index) {}
function renderAtomBalance(reaction) {}
function renderElementRow(elementSymbol, status) {}
function renderSuccessState(isBalanced) {}
function renderProgress(progress) {}
```

---

## 15. UI behavior

When the student clicks the up coefficient button:

- the molecule coefficient increases by 1
- the equation updates
- atom totals update
- element balance status updates
- full reaction balance is checked

When the student clicks the down coefficient button:

- the molecule coefficient decreases by 1
- coefficient cannot go below 1
- atom totals update
- element balance status updates
- full reaction balance is checked

When the reaction is fully balanced:

- success message appears
- all balanced rows are visually highlighted
- next reaction button is enabled
- reaction may be marked complete in localStorage

---

## 16. Visual design principles

The app should feel:

- clean
- bright
- focused
- friendly
- not childish
- not cluttered
- usable on phone, tablet, and laptop

Important design principles:

- Big tappable controls
- Immediate feedback
- No harsh error states
- Unbalanced should feel like “unfinished puzzle,” not “wrong”
- Balanced elements should be visually satisfying
- Text should support the game, not dominate it

---

## 17. Gamification plan

Gamification should support learning, not distract from it.

Initial gamification:

- levels
- progress bar
- completion state
- success animation/message
- unlock next reaction
- “Level 1 of 5 complete”
- local progress saved

Later gamification:

- XP
- streaks
- mastery stars
- topic map
- skill tree
- badges for repeated correct solving
- speed challenge mode
- timed exam challenge
- review queue for weak reactions/topics

Do not overbuild gamification in the MVP.

First priority:

> Make the chemistry interaction satisfying.

---

## 18. Topic progression plan

The first world/module is Stoichiometry.

Possible stoichiometry skill path:

1. Equation balancing
2. Moles and molar mass
3. Mole ratio bridge
4. Grams-to-moles conversion
5. Grams-to-grams stoichiometry
6. Limiting reagent
7. Theoretical yield
8. Percent yield
9. Mixed IMAT-style challenge

Each skill can become one game.

---

## 19. Future game ideas

### Mole Converter Game

Student is given a mass and compound.

Example:

```text
18 g H₂O
```

Student builds the conversion:

```text
grams → molar mass → moles
```

The game checks whether the correct conversion path and answer were built.

---

### Molar Mass Builder

Student is given a compound.

Example:

```text
Ca(OH)₂
```

Student breaks it into atoms and counts:

```text
Ca = 1
O = 2
H = 2
```

Then calculates molar mass.

---

### Mole Ratio Bridge

Student is given a balanced equation.

Example:

```text
2H₂ + O₂ → 2H₂O
```

Student connects molecule relationships:

```text
1 mol O₂ → 2 mol H₂O
2 mol H₂ → 2 mol H₂O
```

---

### Grams-to-Grams Factory

Student sends one reactant through a “factory”:

```text
grams reactant → moles reactant → moles product → grams product
```

The game shows each conversion step visually.

---

### Limiting Reagent Duel

Two reactants compete.

The student determines which reactant runs out first.

The app visually shows:

- available reactant A
- available reactant B
- required mole ratio
- limiting reagent
- excess reagent left over

---

### Percent Yield Lab

Student compares:

```text
theoretical yield
actual yield
percent yield
```

The app presents it as a lab result analysis.

---

## 20. Exam-style question layer

Games should train the skill first.

After a topic is mastered, the app should provide exam-style questions.

Example flow:

1. Student plays balancing game.
2. Student completes several levels.
3. Student unlocks 10 balancing questions.
4. Student answers IMAT-style questions.
5. App reports:
   - score
   - weak points
   - topics to repeat

This keeps the game connected to the exam goal.

---

## 21. Monetization concept

Initial product model may be freemium.

Free version could include:

- first topic
- limited number of levels
- limited daily practice
- basic progress tracking

Paid version could include:

- all stoichiometry levels
- all chemistry topics
- unlimited practice
- mock exam mode
- weak-topic review
- progress analytics

Possible pricing:

- low monthly subscription
- one-time unlock
- exam-season access pass

This should not be implemented in the MVP.

First priority is proving that students actually use and like the game.

---

## 22. Validation plan

The first validation user is Malcolm.

Validation questions:

- Does the student understand the concept better after using the game?
- Does the student want to keep playing?
- Does the student use it without being forced?
- Does the visual feedback help?
- Does the game make solving exam questions easier afterward?
- Which part is confusing?
- Which part is satisfying?

Early success does not require many users.

A useful early signal is:

- 1 real student uses it repeatedly
- then 5–10 students try it
- then 3–5 return without prompting

---

## 23. Expansion plan

Do not expand too early.

The correct order is:

1. Build equation balancer.
2. Test with Malcolm.
3. Improve equation balancer.
4. Add a small set of reactions.
5. Add progress.
6. Add one more stoichiometry game.
7. Add exam-style questions.
8. Test with more IMAT students.
9. Only then consider accounts, payments, and broader syllabus.

Possible later expansion:

- full IMAT chemistry
- other IMAT sections
- general chemistry course trainer
- AP Chemistry
- MCAT chemistry
- university chemistry modules
- mobile app version

But those are future directions, not MVP tasks.

---

## 24. AI coding instructions

When AI is used to help code this project, it should follow these rules:

- Keep the project small.
- Do not add frameworks unless explicitly requested.
- Do not add backend unless explicitly requested.
- Do not add authentication unless explicitly requested.
- Do not add payment unless explicitly requested.
- Do not rewrite the whole app unnecessarily.
- Keep chemistry logic separate from rendering.
- Keep reaction data separate from game logic.
- Make small, readable files.
- Prefer simple functions over clever abstractions.
- Explain where files should be created or changed.
- Preserve existing working behavior.
- Do not invent unnecessary features.

---

## 25. First implementation task

Build the first MVP of the Visual Equation Balancer.

Files to create:

```text
imat-chem-stoichiometry/
  index.html

  css/
    styles.css

  js/
    app.js
    balancingEngine.js
    balancingRenderer.js
    balancingGame.js
    progressStorage.js

  data/
    reactions.js
    elements.js
```

The app should:

1. Load the first reaction.
2. Render the written equation.
3. Render coefficient controls.
4. Render visual atom counts.
5. Show balanced/unbalanced state for each element.
6. Update immediately when coefficients change.
7. Detect full reaction balance.
8. Show success state.
9. Allow moving to the next reaction.
10. Save basic progress in localStorage.

Definition of done:

- At least 5 reactions work.
- Coefficients can be changed.
- Atom totals update correctly.
- Balanced elements are clearly marked.
- Full reaction balance is detected correctly.
- New reactions can be added only by editing `data/reactions.js`.
- App runs locally as a static web page.

---

## 26. Product principle

This project should remain playful, useful, and chemically correct.

The goal is not to make “educational content with game decorations.”

The goal is to make small interactive systems where chemistry itself becomes the game.
