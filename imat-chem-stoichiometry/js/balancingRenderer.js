(function (window) {
  window.ChemGames = window.ChemGames || {};

  const SUBSCRIPT_DIGITS = {
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9"
  };

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function formatFormula(formula) {
    return formula.replace(/\d/g, (digit) => `<sub>${SUBSCRIPT_DIGITS[digit]}</sub>`);
  }

  function coefficientText(coefficient) {
    return coefficient > 1 ? String(coefficient) : "";
  }

  function getDifficultyLabel(difficulty) {
    if (difficulty === 1) return "Easy";
    if (difficulty === 2) return "Medium";
    return "Harder";
  }

  function renderLevelHeading(reaction) {
    const heading = createElement("div", "level-heading");
    heading.appendChild(createElement("h2", "", reaction.title));
    heading.appendChild(
      createElement(
        "span",
        `difficulty-pill difficulty-pill--${reaction.difficulty}`,
        getDifficultyLabel(reaction.difficulty)
      )
    );
    return heading;
  }

  function renderProgress(state) {
    const progress = createElement("section", "top-panel");
    const levelText = createElement(
      "p",
      "level-label",
      `Level ${state.currentIndex + 1} of ${state.totalLevels}`
    );

    const meter = createElement("div", "progress-meter");
    const bar = createElement("div", "progress-meter__bar");
    bar.style.width = `${Math.round((state.attemptedCount / state.totalLevels) * 100)}%`;
    meter.appendChild(bar);

    const score = createElement("div", "score-panel");
    score.appendChild(createElement("p", "score-label", "Points"));
    score.appendChild(createElement("p", "score-value", `${state.totalScore}/${state.maxScore}`));

    const resetButton = createElement("button", "text-button", "Reset");
    resetButton.type = "button";
    resetButton.addEventListener("click", state.onResetAll);

    const meta = createElement("div", "progress-meta");
    meta.appendChild(levelText);
    meta.appendChild(createElement("p", "completed-label", `${state.attemptedCount} attempted`));

    progress.appendChild(meta);
    progress.appendChild(meter);
    progress.appendChild(score);
    progress.appendChild(resetButton);
    return progress;
  }

  function renderLevelGrid(state) {
    const nav = createElement("nav", "level-grid-panel");
    nav.setAttribute("aria-label", "Choose reaction level");

    const grid = createElement("div", "level-grid");
    state.reactions.forEach((reaction, index) => {
      const record = state.levelRecords[reaction.id] || {};
      const status = record.status || "pending";
      const button = createElement(
        "button",
        `level-tile level-tile--${status}${index === state.currentIndex ? " is-current" : ""}`,
        String(index + 1)
      );
      button.type = "button";
      button.setAttribute("aria-label", `Go to level ${index + 1}: ${reaction.title}`);
      button.addEventListener("click", () => state.onSelectLevel(index));
      grid.appendChild(button);
    });

    const legend = createElement("div", "level-grid-legend");
    legend.appendChild(createElement("span", "legend-item legend-item--pending", "Not tried"));
    legend.appendChild(createElement("span", "legend-item legend-item--completed", "Solved"));
    legend.appendChild(createElement("span", "legend-item legend-item--review", "Review"));

    nav.appendChild(grid);
    nav.appendChild(legend);
    return nav;
  }

  function renderMolecule(molecule, side, index, onCoefficientChange) {
    const card = createElement("div", "molecule-card");

    const upButton = createElement("button", "icon-button triangle-button triangle-button--up");
    upButton.type = "button";
    upButton.setAttribute("aria-label", `Increase ${molecule.formula} coefficient`);
    upButton.addEventListener("click", () => onCoefficientChange(side, index, "up"));

    const downButton = createElement("button", "icon-button triangle-button triangle-button--down");
    downButton.type = "button";
    downButton.setAttribute("aria-label", `Decrease ${molecule.formula} coefficient`);
    downButton.addEventListener("click", () => onCoefficientChange(side, index, "down"));

    const formula = createElement("div", "molecule-formula");
    const coefficient = coefficientText(molecule.coefficient);
    const formulaClass = `formula-text${molecule.formula.length + coefficient.length > 5 ? " formula-text--long" : ""}`;
    formula.innerHTML = `<span class="${formulaClass}">${coefficient ? `<span class="coefficient">${coefficient}</span>` : ""}${formatFormula(molecule.formula)}</span>`;

    card.appendChild(upButton);
    card.appendChild(formula);
    card.appendChild(downButton);
    return card;
  }

  function renderSide(molecules, side, onCoefficientChange) {
    const group = createElement("div", "equation-side");
    molecules.forEach((molecule, index) => {
      if (index > 0) {
        group.appendChild(createElement("span", "equation-plus", "+"));
      }
      group.appendChild(renderMolecule(molecule, side, index, onCoefficientChange));
    });
    return group;
  }

  function renderEquation(reaction, onCoefficientChange) {
    const equation = createElement("section", "equation-panel");
    equation.appendChild(renderSide(reaction.reactants, "reactants", onCoefficientChange));
    equation.appendChild(createElement("span", "reaction-arrow", "→"));
    equation.appendChild(renderSide(reaction.products, "products", onCoefficientChange));
    return equation;
  }

  function renderHints(state) {
    const hints = state.reaction.hints || [];
    if (!hints || hints.length === 0) return document.createDocumentFragment();

    const panel = createElement("section", "hint-panel");
    const header = createElement("div", "hint-header");
    const title = createElement(
      "p",
      "hint-title",
      `Hints used: ${state.hintsUsed}/${hints.length}`
    );
    const showHint = createElement(
      "button",
      "secondary-button hint-button",
      state.hintsUsed >= hints.length ? "No more hints" : "Show hint"
    );
    showHint.type = "button";
    showHint.disabled = state.hintsUsed >= hints.length || state.isReview || state.isBalanced;
    showHint.addEventListener("click", state.onShowHint);

    const list = createElement("ol", "hint-list");
    hints.slice(0, state.hintsUsed).forEach((hint) => {
      list.appendChild(createElement("li", "", hint));
    });

    const note = createElement(
      "p",
      "hint-note",
      state.hintsUsed === 0
        ? `This level is currently worth ${state.potentialScore} points.`
        : `Current possible score: ${state.potentialScore} points.`
    );

    const showSolution = createElement("button", "text-button solution-button", "Show solution");
    showSolution.type = "button";
    showSolution.disabled = state.isReview || state.isBalanced;
    showSolution.addEventListener("click", state.onShowSolution);

    header.appendChild(title);
    header.appendChild(showHint);
    panel.appendChild(header);
    if (state.hintsUsed > 0) {
      panel.appendChild(list);
    }
    panel.appendChild(note);
    panel.appendChild(showSolution);

    return panel;
  }

  function renderAtom(symbol, elementStyles) {
    const style = elementStyles[symbol] || {};
    const atom = createElement(
      "span",
      `atom ${style.colorClass || "element-default"} ${style.shapeClass || "shape-circle"}`
    );
    atom.setAttribute("title", style.name || symbol);
    return atom;
  }

  function renderAtomStack(symbol, count, elementStyles) {
    const stack = createElement("div", "atom-stack");
    const visibleAtoms = Math.min(count, 14);

    for (let i = 0; i < visibleAtoms; i += 1) {
      stack.appendChild(renderAtom(symbol, elementStyles));
    }

    if (count > visibleAtoms) {
      stack.appendChild(createElement("span", "atom-more", `+${count - visibleAtoms}`));
    }

    return stack;
  }

  function renderElementRow(symbol, status, elementStyles) {
    const row = createElement("article", `element-row ${status.balanced ? "is-balanced" : ""}`);
    const style = elementStyles[symbol] || { name: symbol };

    const label = createElement("div", "element-label");
    label.appendChild(renderAtom(symbol, elementStyles));
    label.appendChild(createElement("span", "", style.name || symbol));

    const left = createElement("div", "atom-side");
    left.appendChild(createElement("strong", "atom-count", String(status.left)));
    left.appendChild(renderAtomStack(symbol, status.left, elementStyles));

    const right = createElement("div", "atom-side");
    right.appendChild(createElement("strong", "atom-count", String(status.right)));
    right.appendChild(renderAtomStack(symbol, status.right, elementStyles));

    const state = createElement("div", "row-state", status.balanced ? "Balanced" : "Not yet");

    row.appendChild(label);
    row.appendChild(left);
    row.appendChild(right);
    row.appendChild(state);
    return row;
  }

  function renderBalanceBoard(balanceStatus, elementStyles) {
    const board = createElement("section", "balance-board");

    const header = createElement("div", "balance-header");
    header.appendChild(createElement("span", "", "Element"));
    header.appendChild(createElement("span", "", "Reactants"));
    header.appendChild(createElement("span", "", "Products"));
    header.appendChild(createElement("span", "", "Status"));
    board.appendChild(header);

    Object.entries(balanceStatus).forEach(([symbol, status]) => {
      board.appendChild(renderElementRow(symbol, status, elementStyles));
    });

    return board;
  }

  function renderStatus(state) {
    const panel = createElement(
      "section",
      `status-panel ${state.isBalanced ? "is-balanced" : ""} ${state.isReview ? "is-review" : ""}`
    );
    const message = createElement(
      "p",
      "status-message",
      state.isReview
        ? "Solution shown. Marked for review."
        : state.isBalanced
          ? `Balanced. Earn ${state.potentialScore} points.`
          : `Keep balancing. Worth up to ${state.potentialScore} points.`
    );

    const actions = createElement("div", "status-actions");
    const resetLevel = createElement("button", "secondary-button", "Reset level");
    resetLevel.type = "button";
    resetLevel.addEventListener("click", state.onResetLevel);

    const next = createElement(
      "button",
      "primary-button",
      state.willCompleteSet ? "Finish" : "Next"
    );
    next.type = "button";
    next.disabled = !state.isBalanced;
    next.addEventListener("click", state.onNextLevel);

    actions.appendChild(resetLevel);
    actions.appendChild(next);
    panel.appendChild(message);
    panel.appendChild(actions);
    return panel;
  }

  function renderCompleteState(root, state) {
    root.innerHTML = "";
    const shell = createElement("div", "app-shell");
    const complete = createElement("section", "complete-panel");
    complete.appendChild(createElement("p", "eyebrow", "Stoichiometry"));
    complete.appendChild(createElement("h1", "", "All levels attempted"));
    complete.appendChild(createElement("p", "complete-copy", `Score: ${state.totalScore}/${state.maxScore} points.`));

    const restart = createElement("button", "primary-button", "Restart");
    restart.type = "button";
    restart.addEventListener("click", state.onRestart);
    complete.appendChild(restart);

    shell.appendChild(complete);
    root.appendChild(shell);
  }

  function render(root, state) {
    if (state.isComplete) {
      renderCompleteState(root, state);
      return;
    }

    root.innerHTML = "";

    const shell = createElement("div", "app-shell");
    const header = createElement("header", "app-header");
    header.appendChild(createElement("p", "eyebrow", "Stoichiometry"));
    header.appendChild(createElement("h1", "", "Visual Equation Balancer"));

    const gamePanel = createElement("section", "game-panel");
    gamePanel.appendChild(renderLevelHeading(state.reaction));
    gamePanel.appendChild(renderEquation(state.reaction, state.onCoefficientChange));
    gamePanel.appendChild(renderHints(state));
    gamePanel.appendChild(renderBalanceBoard(state.balanceStatus, state.elementStyles));
    gamePanel.appendChild(renderStatus(state));

    shell.appendChild(header);
    shell.appendChild(renderProgress(state));
    shell.appendChild(renderLevelGrid(state));
    shell.appendChild(gamePanel);
    root.appendChild(shell);
  }

  window.ChemGames.BalancingRenderer = {
    render,
    formatFormula
  };
})(window);
