const scenarios = [
  {
    id: "cheese-sandwich-factory",
    title: "Cheese Sandwich Factory",
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
        inventoryUnitPlural: "bread slices"
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
        inventoryUnitPlural: "cheese slices"
      }
    ]
  }
];

const scenario = scenarios[0];
const BASE_ROUND_SCORE = 4;
let answer = getScenarioAnswer(scenario);
let totalScore = 0;
let hintsUsed = 0;
let roundFinished = false;

const scenarioTitle = document.querySelector("#scenarioTitle");
const textCards = document.querySelector("#textCards");
const toggleTextCardsButton = document.querySelector("#toggleTextCardsButton");
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

renderScenario();

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkAnswer();
});

giveUpButton.addEventListener("click", giveUp);
hintButton.addEventListener("click", showHint);
newInventoryButton.addEventListener("click", randomizeInventory);
toggleTextCardsButton.addEventListener("click", toggleTextCards);

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
  recipeList.innerHTML = "";
  inventoryList.innerHTML = "";
  leftoverFields.innerHTML = "";
  limitingPartInput.innerHTML = '<option value="">Choose a part</option>';

  scenario.parts.forEach((part) => {
    recipeList.appendChild(createPartRow(
      part.displayName,
      formatQuantity(part.perProduct, part.recipeUnitSingular, part.recipeUnitPlural)
    ));

    inventoryList.appendChild(createPartRow(
      part.displayName,
      formatQuantity(part.available, part.inventoryUnitSingular, part.inventoryUnitPlural)
    ));

    const graphicInventory = document.querySelector(`[data-graphic-inventory-for="${part.id}"]`);
    graphicInventory.textContent = formatQuantity(part.available, part.inventoryUnitSingular, part.inventoryUnitPlural);

    const option = document.createElement("option");
    option.value = part.id;
    option.textContent = part.displayName;
    limitingPartInput.appendChild(option);

    const slot = document.createElement("div");
    slot.className = `answer-slot part-answer-${part.id}`;

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

  recipeOutput.textContent = `Makes 1 ${scenario.productSingular}`;
  resetGameState();
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
  let breadAvailable = 0;
  let cheeseAvailable = 0;

  do {
    breadAvailable = randomInteger(4, 24);
    cheeseAvailable = randomInteger(2, 12);
  } while (Math.floor(breadAvailable / 2) === cheeseAvailable);

  setPartInventory("bread", breadAvailable);
  setPartInventory("cheese", cheeseAvailable);
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
  const bread = getPartById("bread");
  const cheese = getPartById("cheese");

  return [
    "Find how many full sandwiches each part could make on its own.",
    `${bread.displayName}: ${bread.available} \u00f7 ${bread.perProduct}. ${cheese.displayName}: ${cheese.available} \u00f7 ${cheese.perProduct}.`,
    "The limiting part is whichever part makes fewer full sandwiches. Use that number to calculate leftovers."
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

  addExplanationLine(`${formatPartDisplayNames(answer.limitingPartIds)} ${answer.limitingPartIds.length === 1 ? "makes" : "make"} fewer full ${getCommonProductPlural()}, so ${formatPartNames(answer.limitingPartIds)} ${answer.limitingPartIds.length === 1 ? "is" : "are"} limiting.`);
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
  let maxProducts = Infinity;

  currentScenario.parts.forEach((part) => {
    const possible = Math.floor(part.available / part.perProduct);
    possibleProducts[part.id] = possible;
    maxProducts = Math.min(maxProducts, possible);
  });

  const leftovers = {};
  const limitingPartIds = [];

  currentScenario.parts.forEach((part) => {
    leftovers[part.id] = part.available - (maxProducts * part.perProduct);

    if (possibleProducts[part.id] === maxProducts) {
      limitingPartIds.push(part.id);
    }
  });

  return {
    possibleProducts,
    maxProducts,
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

function formatInventoryUnit(part, amount) {
  return amount === 1 ? part.inventoryUnitSingular : part.inventoryUnitPlural;
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

function formatPartDisplayNames(partIds) {
  return formatPhraseList(partIds.map((id) => {
    const part = scenario.parts.find((candidate) => candidate.id === id);
    return part.displayName;
  }));
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
