const scenarios = [
  {
    id: "cheese-sandwich-factory",
    title: "Cheese Sandwich Factory",
    menuLabel: "Cheese Sandwich",
    ariaLabel: "Two bread slices plus one cheese slice make one cheese sandwich",
    productCommonSingular: "sandwich",
    productCommonPlural: "sandwiches",
    productSingular: "cheese sandwich",
    productPlural: "cheese sandwiches",
    parts: [
      {
        id: "bread",
        name: "bread",
        displayName: "Bread",
        perProduct: 2,
        available: 11,
        recipeUnitSingular: "slice of bread",
        recipeUnitPlural: "slices of bread",
        inventoryUnitSingular: "bread slice",
        inventoryUnitPlural: "bread slices",
        graphic: "bread",
        randomMinimum: 4,
        randomMaximum: 24
      },
      {
        id: "cheese",
        name: "cheese",
        displayName: "Cheese",
        perProduct: 1,
        available: 4,
        recipeUnitSingular: "slice of cheese",
        recipeUnitPlural: "slices of cheese",
        inventoryUnitSingular: "cheese slice",
        inventoryUnitPlural: "cheese slices",
        graphic: "cheese",
        randomMinimum: 2,
        randomMaximum: 12
      }
    ],
    productGraphic: "sandwich"
  },
  {
    id: "apple-pie-factory",
    title: "Apple Pie Factory",
    menuLabel: "Apple Pie",
    ariaLabel: "Five apples plus one pie crust make one apple pie",
    productCommonSingular: "pie",
    productCommonPlural: "pies",
    productSingular: "apple pie",
    productPlural: "apple pies",
    parts: [
      {
        id: "apples",
        name: "apples",
        displayName: "Apples",
        perProduct: 5,
        available: 17,
        recipeUnitSingular: "apple",
        recipeUnitPlural: "apples",
        inventoryUnitSingular: "apple",
        inventoryUnitPlural: "apples",
        graphic: "apples",
        randomMinimum: 10,
        randomMaximum: 40
      },
      {
        id: "crust",
        name: "pie crust",
        displayName: "Pie crust",
        perProduct: 1,
        available: 4,
        recipeUnitSingular: "pie crust",
        recipeUnitPlural: "pie crusts",
        inventoryUnitSingular: "pie crust",
        inventoryUnitPlural: "pie crusts",
        graphic: "pie-crust",
        randomMinimum: 2,
        randomMaximum: 9
      }
    ],
    productGraphic: "apple-pie"
  },

  // Mole lens (Rung 2): chemical reactions run on the SAME engine, with "mol" units
  // and coefficients from a balanced equation. Coefficients/solutions hand-verified
  // against the balancer's reaction set. TODO: lift recipe data into data/recipes.js.
  {
    id: "water-synthesis",
    kind: "reaction",
    title: "Water Synthesis",
    menuLabel: "Water",
    ariaLabel: "Two moles of hydrogen plus one mole of oxygen make two moles of water",
    productCommonSingular: "mol H₂O",
    productCommonPlural: "mol H₂O",
    productSingular: "mol H₂O",
    productPlural: "mol H₂O",
    productFormula: "H₂O",
    productPerProduct: 2,
    batchNounSingular: "reaction",
    batchNounPlural: "reactions",
    parts: [
      {
        id: "h2",
        name: "H₂",
        displayName: "H₂",
        perProduct: 2,
        available: 8,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 4,
        randomMaximum: 18
      },
      {
        id: "o2",
        name: "O₂",
        displayName: "O₂",
        perProduct: 1,
        available: 3,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 2,
        randomMaximum: 12
      }
    ]
  },
  {
    id: "ammonia-synthesis",
    kind: "reaction",
    title: "Ammonia Synthesis",
    menuLabel: "Ammonia",
    ariaLabel: "One mole of nitrogen plus three moles of hydrogen make two moles of ammonia",
    productCommonSingular: "mol NH₃",
    productCommonPlural: "mol NH₃",
    productSingular: "mol NH₃",
    productPlural: "mol NH₃",
    productFormula: "NH₃",
    productPerProduct: 2,
    batchNounSingular: "reaction",
    batchNounPlural: "reactions",
    parts: [
      {
        id: "n2",
        name: "N₂",
        displayName: "N₂",
        perProduct: 1,
        available: 5,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 3,
        randomMaximum: 12
      },
      {
        id: "h2",
        name: "H₂",
        displayName: "H₂",
        perProduct: 3,
        available: 9,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 6,
        randomMaximum: 30
      }
    ]
  },
  {
    id: "hydrogen-chloride",
    kind: "reaction",
    title: "Hydrogen Chloride Synthesis",
    menuLabel: "HCl",
    ariaLabel: "One mole of hydrogen plus one mole of chlorine make two moles of hydrogen chloride",
    productCommonSingular: "mol HCl",
    productCommonPlural: "mol HCl",
    productSingular: "mol HCl",
    productPlural: "mol HCl",
    productFormula: "HCl",
    productPerProduct: 2,
    batchNounSingular: "reaction",
    batchNounPlural: "reactions",
    parts: [
      {
        id: "h2",
        name: "H₂",
        displayName: "H₂",
        perProduct: 1,
        available: 6,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 3,
        randomMaximum: 18
      },
      {
        id: "cl2",
        name: "Cl₂",
        displayName: "Cl₂",
        perProduct: 1,
        available: 4,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 2,
        randomMaximum: 14
      }
    ]
  },
  {
    id: "sulfur-dioxide",
    kind: "reaction",
    title: "Sulfur Dioxide Synthesis",
    menuLabel: "SO₂",
    ariaLabel: "One mole of sulfur plus one mole of oxygen make one mole of sulfur dioxide",
    productCommonSingular: "mol SO₂",
    productCommonPlural: "mol SO₂",
    productSingular: "mol SO₂",
    productPlural: "mol SO₂",
    productFormula: "SO₂",
    productPerProduct: 1,
    batchNounSingular: "reaction",
    batchNounPlural: "reactions",
    parts: [
      {
        id: "s",
        name: "S",
        displayName: "S",
        perProduct: 1,
        available: 7,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 3,
        randomMaximum: 16
      },
      {
        id: "o2",
        name: "O₂",
        displayName: "O₂",
        perProduct: 1,
        available: 5,
        recipeUnitSingular: "mol",
        recipeUnitPlural: "mol",
        inventoryUnitSingular: "mol",
        inventoryUnitPlural: "mol",
        randomMinimum: 2,
        randomMaximum: 12
      }
    ]
  }
];

let scenario = scenarios[0];
const BASE_ROUND_SCORE = 4;
let answer = getScenarioAnswer(scenario);
let totalScore = 0;
let hintsUsed = 0;
let roundFinished = false;

const scenarioTitle = document.querySelector("#scenarioTitle");
const scenarioSwitcher = document.querySelector("#scenarioSwitcher");
const textCards = document.querySelector("#textCards");
const toggleTextCardsButton = document.querySelector("#toggleTextCardsButton");
const ratioGraphicPanel = document.querySelector("#ratioGraphicPanel");
const ratioEquation = document.querySelector("#ratioEquation");
const recipeList = document.querySelector("#recipeList");
const recipeOutput = document.querySelector("#recipeOutput");
const inventoryList = document.querySelector("#inventoryList");
const limitingPartInput = document.querySelector("#limitingPartInput");
const leftoverFields = document.querySelector("#leftoverFields");
const answerForm = document.querySelector("#answerForm");
const checkAnswerButton = document.querySelector("#checkAnswerButton");
const hintButton = document.querySelector("#hintButton");
const giveUpButton = document.querySelector("#giveUpButton");
const newInventoryButton = document.querySelector("#newInventoryButton");
const maxObjectsInput = document.querySelector("#maxObjectsInput");
const maxObjectsLabel = document.querySelector("#maxObjectsLabel");
const maxObjectsFeedback = document.querySelector("#maxObjectsFeedback");
const totalScoreReadout = document.querySelector("#totalScoreReadout");
const roundScoreReadout = document.querySelector("#roundScoreReadout");
const hintCountReadout = document.querySelector("#hintCountReadout");
const hintPanel = document.querySelector("#hintPanel");
const hintList = document.querySelector("#hintList");
const resultsPanel = document.querySelector("#resultsPanel");
const explanationBox = document.querySelector("#explanationBox");
const explanationList = document.querySelector("#explanationList");
const limitingPartFeedback = document.querySelector("#limitingPartFeedback");

renderScenarioSwitcher();
renderScenario();

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkAnswer();
});

giveUpButton.addEventListener("click", giveUp);
hintButton.addEventListener("click", showHint);
newInventoryButton.addEventListener("click", randomizeInventory);
toggleTextCardsButton.addEventListener("click", toggleTextCards);
scenarioSwitcher.addEventListener("click", switchScenario);

function switchScenario(event) {
  const button = event.target.closest("[data-scenario-id]");
  if (!button || button.dataset.scenarioId === scenario.id) return;

  const nextScenario = scenarios.find((candidate) => candidate.id === button.dataset.scenarioId);
  if (!nextScenario) return;

  scenario = nextScenario;
  renderScenarioSwitcher();
  renderScenario();
}

function renderScenarioSwitcher() {
  scenarioSwitcher.innerHTML = "";

  scenarios.forEach((candidate) => {
    const button = document.createElement("button");
    button.className = `scenario-choice${candidate.id === scenario.id ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.scenarioId = candidate.id;
    button.textContent = candidate.menuLabel || candidate.title;
    button.setAttribute("aria-pressed", String(candidate.id === scenario.id));
    scenarioSwitcher.appendChild(button);
  });
}

function toggleTextCards() {
  const isExpanded = toggleTextCardsButton.getAttribute("aria-expanded") === "true";
  setTextCardsExpanded(!isExpanded);
}

function setTextCardsExpanded(isExpanded) {
  textCards.hidden = !isExpanded;
  toggleTextCardsButton.setAttribute("aria-expanded", String(isExpanded));
  toggleTextCardsButton.querySelector(".toggle-chevron").textContent = isExpanded ? "\u25be" : "\u25b8";
  toggleTextCardsButton.setAttribute(
    "aria-label",
    isExpanded ? "Collapse text recipe and inventory cards" : "Expand text recipe and inventory cards"
  );
  toggleTextCardsButton.title = toggleTextCardsButton.getAttribute("aria-label");
}

function renderScenario() {
  answer = getScenarioAnswer(scenario);
  scenarioTitle.textContent = scenario.title;
  ratioGraphicPanel.setAttribute("aria-label", scenario.ariaLabel);
  maxObjectsLabel.textContent = `Maximum ${getCommonProductPlural()}`;
  recipeList.innerHTML = "";
  inventoryList.innerHTML = "";
  leftoverFields.innerHTML = "";
  limitingPartInput.innerHTML = '<option value="">Choose a part</option>';

  scenario.parts.forEach((part, index) => {
    recipeList.appendChild(createPartRow(
      part.displayName,
      formatQuantity(part.perProduct, part.recipeUnitSingular, part.recipeUnitPlural)
    ));

    inventoryList.appendChild(createPartRow(
      part.displayName,
      formatQuantity(part.available, part.inventoryUnitSingular, part.inventoryUnitPlural)
    ));

    const option = document.createElement("option");
    option.value = part.id;
    option.textContent = part.displayName;
    limitingPartInput.appendChild(option);

    const slot = document.createElement("div");
    slot.className = `answer-slot part-answer part-answer-${part.id}`;
    slot.style.setProperty("--answer-column", String(index + 1));

    const label = document.createElement("label");
    label.className = "answer-field";
    label.htmlFor = `${part.id}LeftoverInput`;
    label.textContent = `${part.displayName} left over`;

    const input = document.createElement("input");
    input.id = `${part.id}LeftoverInput`;
    input.name = `${part.id}Leftover`;
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.dataset.partId = part.id;

    const feedback = document.createElement("p");
    feedback.className = "field-feedback";
    feedback.hidden = true;
    feedback.setAttribute("aria-live", "polite");
    feedback.dataset.feedbackFor = part.id;

    label.appendChild(input);
    slot.append(label, feedback);
    leftoverFields.appendChild(slot);
  });

  recipeOutput.textContent = `Makes ${answer.productPerBatch} ${scenario.productSingular}`;
  renderRatioGraphic();
  resetGameState();
}

function renderRatioGraphic() {
  ratioEquation.innerHTML = "";

  const question = document.createElement("p");
  question.className = "graphic-question";
  question.textContent = `How many ${scenario.productPlural} can be made with the available inventory?`;
  ratioEquation.appendChild(question);

  const isReaction = scenario.kind === "reaction";

  scenario.parts.forEach((part, index) => {
    const reactantVisual = isReaction
      ? getTokenVisual(`${part.perProduct > 1 ? part.perProduct + " " : ""}${part.displayName}`, true)
      : getTokenVisual(part.graphic, false);

    ratioEquation.appendChild(createRatioToken(
      reactantVisual,
      isReaction ? "mol" : formatQuantity(part.perProduct, part.recipeUnitSingular, part.recipeUnitPlural)
    ));

    if (index < scenario.parts.length - 1) {
      ratioEquation.appendChild(createEquationSymbol("+", "equation-mark"));
    }
  });

  ratioEquation.appendChild(createEquationSymbol("\u2192", "equation-arrow"));

  const productVisual = isReaction
    ? getTokenVisual(`${answer.productPerBatch > 1 ? answer.productPerBatch + " " : ""}${scenario.productFormula}`, true)
    : getTokenVisual(scenario.productGraphic, false);

  ratioEquation.appendChild(createRatioToken(
    productVisual,
    isReaction ? "mol" : `1 ${scenario.productSingular}`,
    true
  ));

  const inventoryLabel = document.createElement("p");
  inventoryLabel.className = "graphic-inventory-label";
  inventoryLabel.textContent = "Available inventory:";
  ratioEquation.appendChild(inventoryLabel);

  scenario.parts.forEach((part, index) => {
    const count = document.createElement("p");
    count.className = "graphic-inventory-count";
    count.dataset.graphicInventoryFor = part.id;
    count.textContent = formatQuantity(part.available, part.inventoryUnitSingular, part.inventoryUnitPlural);
    ratioEquation.appendChild(count);

    if (index < scenario.parts.length - 1) {
      ratioEquation.appendChild(createGraphicSpacer());
    }
  });

  ratioEquation.appendChild(createGraphicSpacer());

  const productCount = document.createElement("p");
  productCount.id = "productInventoryGraphic";
  productCount.className = "graphic-inventory-count product-count";
  productCount.textContent = `? ${getCommonProductPlural()}`;
  ratioEquation.appendChild(productCount);

  // Personal scratch space, one box under each compound. These are recreated on every
  // render, so they clear on a new recipe or new inventory (and on reload). They are
  // never read by the game and never saved.
  const scratchLabel = document.createElement("p");
  scratchLabel.className = "graphic-inventory-label scratch-label";
  scratchLabel.textContent = "Scratch space (not saved):";
  ratioEquation.appendChild(scratchLabel);

  scenario.parts.forEach((part, index) => {
    ratioEquation.appendChild(createScratchBox(part.displayName));

    if (index < scenario.parts.length - 1) {
      ratioEquation.appendChild(createGraphicSpacer());
    }
  });

  ratioEquation.appendChild(createGraphicSpacer());
  ratioEquation.appendChild(createScratchBox(isReaction ? scenario.productFormula : scenario.productSingular));
}

function createRatioToken(svgMarkup, captionText, isProduct = false) {
  const token = document.createElement("figure");
  token.className = `ratio-token${isProduct ? " product-token" : ""}`;

  const art = document.createElement("div");
  art.className = "food-art";
  art.setAttribute("aria-hidden", "true");
  art.innerHTML = svgMarkup;

  const caption = document.createElement("figcaption");
  caption.textContent = captionText;

  token.append(art, caption);
  return token;
}

function createEquationSymbol(symbol, className) {
  const element = document.createElement("span");
  element.className = className;
  element.setAttribute("aria-hidden", "true");
  element.textContent = symbol;
  return element;
}

function createGraphicSpacer() {
  const spacer = document.createElement("span");
  spacer.className = "graphic-spacer";
  spacer.setAttribute("aria-hidden", "true");
  return spacer;
}

function createScratchBox(forLabel) {
  const box = document.createElement("textarea");
  box.className = "scratch-pad";
  box.rows = 2;
  box.autocomplete = "off";
  box.spellcheck = false;
  box.setAttribute("aria-label", `Scratch space for ${forLabel}, not saved`);
  return box;
}

function getTokenVisual(value, isReaction) {
  if (isReaction) {
    return `<span class="molecule-glyph">${value}</span>`;
  }
  return getGraphicSvg(value);
}

function getGraphicSvg(graphicName) {
  const graphics = {
    bread: `
      <svg viewBox="0 0 120 96" role="img">
        <path d="M20 42c0-18 16-30 40-30s40 12 40 30v24c0 7-5 12-12 12H32c-7 0-12-5-12-12V42Z" fill="#f6d79a" stroke="#9d6d2e" stroke-width="4"/>
        <path d="M30 44c0-11 12-20 30-20s30 9 30 20v20H30V44Z" fill="#fff0c8"/>
        <path d="M20 50c0-18 16-30 40-30s40 12 40 30v24c0 7-5 12-12 12H32c-7 0-12-5-12-12V50Z" fill="#e9b765" stroke="#9d6d2e" stroke-width="4"/>
        <path d="M31 51c0-11 11-20 29-20s29 9 29 20v19H31V51Z" fill="#ffe0a8"/>
        <circle cx="46" cy="44" r="3" fill="#b77b2e"/>
        <circle cx="65" cy="39" r="3" fill="#b77b2e"/>
        <circle cx="76" cy="51" r="3" fill="#b77b2e"/>
      </svg>
    `,
    cheese: `
      <svg viewBox="0 0 120 96" role="img">
        <path d="M18 28h84v44H18V28Z" fill="#ffd75d" stroke="#bf8d19" stroke-width="4" transform="rotate(-8 60 50)"/>
        <circle cx="38" cy="42" r="6" fill="#f4b83f"/>
        <circle cx="62" cy="56" r="7" fill="#f4b83f"/>
        <circle cx="82" cy="40" r="5" fill="#f4b83f"/>
        <path d="M98 30l-18 9 20 9Z" fill="#f6c74d" stroke="#bf8d19" stroke-width="4" stroke-linejoin="round"/>
      </svg>
    `,
    sandwich: `
      <svg viewBox="0 0 132 96" role="img">
        <path d="M18 39c0-17 19-29 48-29s48 12 48 29v10H18V39Z" fill="#f4ca82" stroke="#9d6d2e" stroke-width="4"/>
        <path d="M25 49h82L96 64H36L25 49Z" fill="#f6d94d" stroke="#bf8d19" stroke-width="4" stroke-linejoin="round"/>
        <path d="M20 63h92v14c0 6-5 11-11 11H31c-6 0-11-5-11-11V63Z" fill="#e8ad58" stroke="#9d6d2e" stroke-width="4"/>
        <circle cx="50" cy="27" r="3" fill="#b77b2e"/>
        <circle cx="68" cy="22" r="3" fill="#b77b2e"/>
        <circle cx="83" cy="31" r="3" fill="#b77b2e"/>
      </svg>
    `,
    apples: `
      <svg viewBox="0 0 132 96" role="img">
        <g stroke="#8c2c2c" stroke-width="4">
          <circle cx="42" cy="58" r="20" fill="#d9433f"/>
          <circle cx="66" cy="50" r="20" fill="#e64b45"/>
          <circle cx="88" cy="62" r="20" fill="#c83737"/>
        </g>
        <path d="M63 27c5-11 15-14 25-9-5 10-14 14-25 9Z" fill="#3e8f55" stroke="#28683c" stroke-width="3"/>
        <path d="M66 33c-1-8 1-14 6-20" fill="none" stroke="#73441f" stroke-width="4" stroke-linecap="round"/>
        <path d="M40 38c-1-7 1-12 6-17M88 42c-1-7 1-12 6-17" fill="none" stroke="#73441f" stroke-width="4" stroke-linecap="round"/>
        <path d="M30 57c5 4 13 4 20 0M55 48c6 4 14 4 21 0M77 61c6 4 14 4 21 0" fill="none" stroke="#f08c85" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `,
    "pie-crust": `
      <svg viewBox="0 0 132 96" role="img">
        <ellipse cx="66" cy="61" rx="48" ry="23" fill="#d99a55" stroke="#8f5d2f" stroke-width="4"/>
        <ellipse cx="66" cy="56" rx="41" ry="17" fill="#f6d39b" stroke="#8f5d2f" stroke-width="4"/>
        <path d="M27 48c7-9 16-9 23 0 7-9 16-9 23 0 7-9 16-9 23 0 5-6 11-8 18-4" fill="none" stroke="#8f5d2f" stroke-width="4" stroke-linecap="round"/>
        <path d="M39 58c15 7 39 7 54 0" fill="none" stroke="#e8b573" stroke-width="5" stroke-linecap="round"/>
      </svg>
    `,
    "apple-pie": `
      <svg viewBox="0 0 132 96" role="img">
        <ellipse cx="66" cy="62" rx="50" ry="24" fill="#c98645" stroke="#8f5d2f" stroke-width="4"/>
        <ellipse cx="66" cy="55" rx="42" ry="18" fill="#bb3a35" stroke="#8f5d2f" stroke-width="4"/>
        <path d="M34 48l57 24M48 38l58 25M27 62l28-24M48 74l47-35M75 74l30-23" fill="none" stroke="#f4d29b" stroke-width="5" stroke-linecap="round"/>
        <path d="M26 47c7-9 16-9 23 0 7-9 16-9 23 0 7-9 16-9 23 0 6-7 12-8 19-3" fill="none" stroke="#8f5d2f" stroke-width="4" stroke-linecap="round"/>
        <circle cx="50" cy="55" r="3" fill="#8c2c2c"/>
        <circle cx="75" cy="50" r="3" fill="#8c2c2c"/>
        <circle cx="89" cy="61" r="3" fill="#8c2c2c"/>
      </svg>
    `
  };

  return graphics[graphicName] || "";
}

function createPartRow(name, amountText) {
  const row = document.createElement("div");
  row.className = "part-row";

  const nameEl = document.createElement("span");
  nameEl.className = "part-name";
  nameEl.textContent = name;

  const amountEl = document.createElement("span");
  amountEl.className = "part-amount";
  amountEl.textContent = amountText;

  row.append(nameEl, amountEl);
  return row;
}

function checkAnswer() {
  const result = getAnswerResult();
  renderFieldFeedback(result);

  if (result.allCorrect) {
    finishRound(getPotentialScore());
    revealAnswerKey();
    endGame();
    return;
  }

  hideAnswerKey();
}

function giveUp() {
  fillCorrectAnswers();
  const result = getAnswerResult();
  renderFieldFeedback(result);
  finishRound(0);
  revealAnswerKey();
  endGame();
}

function showHint() {
  const hints = getHints();
  if (hintsUsed >= hints.length || roundFinished) return;

  hintsUsed += 1;
  renderHints();
  updateScorePanel();
}

function randomizeInventory() {
  const inventory = getRandomInventory();

  Object.entries(inventory).forEach(([partId, available]) => {
    setPartInventory(partId, available);
  });

  renderScenario();
}

function getPotentialScore() {
  return Math.max(1, BASE_ROUND_SCORE - hintsUsed);
}

function finishRound(pointsEarned) {
  if (roundFinished) return;

  roundFinished = true;
  totalScore += pointsEarned;
  roundScoreReadout.textContent = `${pointsEarned} ${pointsEarned === 1 ? "pt" : "pts"} earned`;
  updateScorePanel();
}

function updateScorePanel() {
  const hints = getHints();

  totalScoreReadout.textContent = String(totalScore);
  hintCountReadout.textContent = `${hintsUsed}/${hints.length}`;

  if (!roundFinished) {
    const potentialScore = getPotentialScore();
    roundScoreReadout.textContent = `${potentialScore} ${potentialScore === 1 ? "pt" : "pts"}`;
  }

  hintButton.disabled = roundFinished || hintsUsed >= hints.length;
  hintButton.textContent = hintsUsed >= hints.length ? "No More Hints" : "Show Hint";
}

function renderHints() {
  const hints = getHints();

  hintPanel.hidden = hintsUsed === 0;
  hintList.innerHTML = "";

  hints.slice(0, hintsUsed).forEach((hint) => {
    const item = document.createElement("li");
    item.textContent = hint;
    hintList.appendChild(item);
  });
}

function getHints() {
  if (scenario.kind === "reaction") {
    const runsHint = scenario.parts.map((part) => {
      return `${part.displayName}: ${part.available} \u00f7 ${part.perProduct}`;
    }).join(";  ");

    return [
      "Work out how many times the reaction can run from each reactant on its own (mol \u00f7 coefficient).",
      `${runsHint}.`,
      "The limiting reactant gives the fewest runs. Multiply runs by the product's coefficient for the amount of product, then subtract what each reactant uses to get the leftovers."
    ];
  }

  const divisionHint = scenario.parts.map((part) => {
    return `${part.displayName}: ${part.available} \u00f7 ${part.perProduct}.`;
  }).join(" ");

  return [
    `Find how many full ${getCommonProductPlural()} each part could make on its own.`,
    divisionHint,
    `The limiting part is whichever part makes fewer full ${getCommonProductPlural()}. Use that number to calculate leftovers.`
  ];
}

function getAnswerResult() {
  const leftoverInputs = Array.from(leftoverFields.querySelectorAll("input"));

  const maxIsCorrect = parseWholeNumber(maxObjectsInput.value) === answer.maxProducts;
  const limitingIsCorrect = answer.limitingPartIds.includes(limitingPartInput.value);
  const leftoverResults = leftoverInputs.map((input) => {
    const part = scenario.parts.find((candidate) => candidate.id === input.dataset.partId);
    const expected = answer.leftovers[part.id];
    const actual = parseWholeNumber(input.value);

    return {
      part,
      expected,
      isCorrect: actual === expected
    };
  });

  return {
    maxIsCorrect,
    limitingIsCorrect,
    leftoverResults,
    allCorrect: maxIsCorrect && limitingIsCorrect && leftoverResults.every(({ isCorrect }) => isCorrect)
  };
}

function renderFieldFeedback({ maxIsCorrect, limitingIsCorrect, leftoverResults }) {
  setFieldFeedback(maxObjectsFeedback, maxIsCorrect);
  setFieldFeedback(limitingPartFeedback, limitingIsCorrect);

  leftoverResults.forEach(({ part, isCorrect }) => {
    const feedback = leftoverFields.querySelector(`[data-feedback-for="${part.id}"]`);
    setFieldFeedback(feedback, isCorrect);
  });
}

function setFieldFeedback(feedback, isCorrect) {
  feedback.hidden = false;
  feedback.className = `field-feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedback.textContent = isCorrect ? "Correct" : "Incorrect";
}

function renderExplanation() {
  const divide = "\u00f7";
  const times = "\u00d7";
  explanationList.innerHTML = "";

  if (scenario.kind === "reaction") {
    renderReactionExplanation(divide, times);
    return;
  }

  scenario.parts.forEach((part) => {
    const possibleProducts = answer.possibleProducts[part.id];
    const extraParts = part.available - (possibleProducts * part.perProduct);
    const extraText = extraParts > 0
      ? ` + ${extraParts} extra ${formatRecipeUnit(part, extraParts)}`
      : "";

    addExplanationLine(
      `${part.displayName}: ${part.available} ${divide} ${part.perProduct} = ${formatCommonProductCount(possibleProducts, "full")}${extraText}.`
    );
  });

  addExplanationLine(`The limiting ${answer.limitingPartIds.length === 1 ? "part is" : "parts are"} ${formatPartNames(answer.limitingPartIds)} because ${answer.limitingPartIds.length === 1 ? "that part makes" : "those parts make"} fewer full ${getCommonProductPlural()}.`);
  addExplanationLine(`Maximum ${getCommonProductPlural()}: ${answer.maxProducts}.`, true);

  const requiredParts = scenario.parts.map((part) => {
    const used = answer.maxProducts * part.perProduct;

    return `${answer.maxProducts} ${times} ${part.perProduct} = ${used} ${formatRecipeUnit(part, used)}`;
  });

  addExplanationLine(`${formatCommonProductCount(answer.maxProducts)} ${answer.maxProducts === 1 ? "requires" : "require"} ${formatPhraseList(requiredParts)}.`);

  scenario.parts.forEach((part) => {
    const leftover = answer.leftovers[part.id];

    addExplanationLine(
      `Leftover ${part.name}: ${part.available} - (${answer.maxProducts} ${times} ${part.perProduct}) = ${leftover} ${formatRecipeUnit(part, leftover)}.`
    );
  });
}

function renderReactionExplanation(divide, times) {
  const minus = "\u2212";

  scenario.parts.forEach((part) => {
    const runs = answer.possibleProducts[part.id];
    addExplanationLine(
      `${part.displayName}: ${part.available} mol ${divide} ${part.perProduct} = ${formatBatches(runs)}.`
    );
  });

  const limitNames = formatPartNames(answer.limitingPartIds);
  const single = answer.limitingPartIds.length === 1;
  addExplanationLine(
    `${limitNames} ${single ? "is" : "are"} limiting \u2014 ${single ? "it runs" : "they run"} out first, so only ${formatBatches(answer.batches)} can run.`
  );
  addExplanationLine(
    `Product: ${answer.batches} ${times} ${answer.productPerBatch} = ${answer.maxProducts} ${scenario.productCommonPlural}.`,
    true
  );

  scenario.parts.forEach((part) => {
    const leftover = answer.leftovers[part.id];
    addExplanationLine(
      `Leftover ${part.displayName}: ${part.available} ${minus} (${answer.batches} ${times} ${part.perProduct}) = ${leftover} mol.`
    );
  });
}

function formatBatches(count) {
  const singular = scenario.batchNounSingular || "reaction";
  const plural = scenario.batchNounPlural || "reactions";
  return `${count} ${count === 1 ? singular : plural}`;
}

function hideAnswerKey() {
  explanationBox.hidden = true;
  explanationList.innerHTML = "";
  resultsPanel.hidden = true;
}

function revealAnswerKey() {
  renderExplanation();
  explanationBox.hidden = false;
  resultsPanel.hidden = false;
}

function endGame() {
  answerForm.querySelectorAll("input, select").forEach((control) => {
    control.disabled = true;
  });
  checkAnswerButton.disabled = true;
  hintButton.disabled = true;
  giveUpButton.disabled = true;
}

function fillCorrectAnswers() {
  maxObjectsInput.value = answer.maxProducts;
  limitingPartInput.value = answer.limitingPartIds[0];

  Object.entries(answer.leftovers).forEach(([partId, leftover]) => {
    const input = leftoverFields.querySelector(`[data-part-id="${partId}"]`);
    input.value = leftover;
  });
}

function resetGameState() {
  hintsUsed = 0;
  roundFinished = false;
  answerForm.reset();
  answerForm.querySelectorAll("input, select").forEach((control) => {
    control.disabled = false;
  });
  checkAnswerButton.disabled = false;
  hintButton.disabled = false;
  giveUpButton.disabled = false;
  hideFieldFeedback();
  hideAnswerKey();
  renderHints();
  updateScorePanel();
}

function hideFieldFeedback() {
  answerForm.querySelectorAll(".field-feedback").forEach((feedback) => {
    feedback.hidden = true;
    feedback.className = "field-feedback";
    feedback.textContent = "";
  });
}

function addExplanationLine(text, hasBreak = false) {
  const item = document.createElement("li");
  item.className = hasBreak ? "explanation-break" : "";
  item.textContent = text;
  explanationList.appendChild(item);
}

function getScenarioAnswer(currentScenario) {
  const possibleProducts = {};
  let batches = Infinity;

  currentScenario.parts.forEach((part) => {
    const possible = Math.floor(part.available / part.perProduct);
    possibleProducts[part.id] = possible;
    batches = Math.min(batches, possible);
  });

  const productPerBatch = currentScenario.productPerProduct || 1;
  const leftovers = {};
  const limitingPartIds = [];

  currentScenario.parts.forEach((part) => {
    leftovers[part.id] = part.available - (batches * part.perProduct);

    if (possibleProducts[part.id] === batches) {
      limitingPartIds.push(part.id);
    }
  });

  // `batches` = complete reaction runs (limits leftover math). `maxProducts` = the
  // amount of product the learner answers for: runs x the product's coefficient.
  // Everyday recipes have productPerProduct undefined => 1, so maxProducts === batches.
  return {
    possibleProducts,
    batches,
    productPerBatch,
    maxProducts: batches * productPerBatch,
    limitingPartIds,
    leftovers
  };
}

function setPartInventory(partId, available) {
  const part = getPartById(partId);
  part.available = available;
}

function getPartById(partId) {
  return scenario.parts.find((candidate) => candidate.id === partId);
}

function getRandomInventory() {
  let inventory = {};
  let attempts = 0;

  do {
    inventory = {};

    scenario.parts.forEach((part) => {
      const minimum = part.randomMinimum || part.perProduct;
      const maximum = part.randomMaximum || Math.max(part.available * 2, minimum);
      inventory[part.id] = randomInteger(minimum, maximum);
    });

    attempts += 1;
  } while (hasTiedLimitingParts(inventory) && attempts < 100);

  return inventory;
}

function hasTiedLimitingParts(inventory) {
  const possibleProducts = scenario.parts.map((part) => {
    return Math.floor(inventory[part.id] / part.perProduct);
  });
  const fewestProducts = Math.min(...possibleProducts);

  return possibleProducts.filter((possible) => possible === fewestProducts).length > 1;
}

function randomInteger(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function parseWholeNumber(value) {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return null;
  }

  const parsed = Number(trimmedValue);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function formatQuantity(amount, singular, plural) {
  return `${amount} ${amount === 1 ? singular : plural}`;
}

function formatRecipeUnit(part, amount) {
  return amount === 1 ? part.recipeUnitSingular : part.recipeUnitPlural;
}

function formatCommonProductCount(amount, modifier = "") {
  const product = amount === 1 ? getCommonProductSingular() : getCommonProductPlural();
  const modifierText = modifier ? `${modifier} ` : "";

  return `${amount} ${modifierText}${product}`;
}

function getCommonProductSingular() {
  return scenario.productCommonSingular || scenario.productSingular;
}

function getCommonProductPlural() {
  return scenario.productCommonPlural || scenario.productPlural;
}

function formatPartNames(partIds) {
  return formatPhraseList(partIds.map((id) => {
    const part = scenario.parts.find((candidate) => candidate.id === id);
    return part.name;
  }));
}

function formatPhraseList(items) {
  if (items.length <= 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
