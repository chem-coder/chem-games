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

  function renderProgress(state) {
    const progress = createElement("section", "top-panel");
    const completed = state.completedIds.length;
    const levelText = createElement(
      "p",
      "level-label",
      `Level ${state.currentIndex + 1} of ${state.totalLevels}`
    );

    const meter = createElement("div", "progress-meter");
    const bar = createElement("div", "progress-meter__bar");
    bar.style.width = `${Math.round((completed / state.totalLevels) * 100)}%`;
    meter.appendChild(bar);

    const resetButton = createElement("button", "text-button", "Reset");
    resetButton.type = "button";
    resetButton.addEventListener("click", state.onResetAll);

    const meta = createElement("div", "progress-meta");
    meta.appendChild(levelText);
    meta.appendChild(createElement("p", "completed-label", `${completed} complete`));

    progress.appendChild(meta);
    progress.appendChild(meter);
    progress.appendChild(resetButton);
    return progress;
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
    formula.innerHTML = `<span class="formula-text">${coefficient ? `<span class="coefficient">${coefficient}</span>` : ""}${formatFormula(molecule.formula)}</span>`;

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
    const panel = createElement("section", `status-panel ${state.isBalanced ? "is-balanced" : ""}`);
    const message = createElement(
      "p",
      "status-message",
      state.isBalanced ? "Balanced" : "Keep balancing"
    );

    const actions = createElement("div", "status-actions");
    const resetLevel = createElement("button", "secondary-button", "Reset level");
    resetLevel.type = "button";
    resetLevel.addEventListener("click", state.onResetLevel);

    const next = createElement(
      "button",
      "primary-button",
      state.isLastLevel ? "Finish" : "Next"
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
    complete.appendChild(createElement("h1", "", "All levels balanced"));
    complete.appendChild(createElement("p", "complete-copy", "The first reaction set is complete."));

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
    gamePanel.appendChild(createElement("h2", "", state.reaction.title));
    gamePanel.appendChild(renderEquation(state.reaction, state.onCoefficientChange));
    gamePanel.appendChild(renderBalanceBoard(state.balanceStatus, state.elementStyles));
    gamePanel.appendChild(renderStatus(state));

    shell.appendChild(header);
    shell.appendChild(renderProgress(state));
    shell.appendChild(gamePanel);
    root.appendChild(shell);
  }

  window.ChemGames.BalancingRenderer = {
    render,
    formatFormula
  };
})(window);
