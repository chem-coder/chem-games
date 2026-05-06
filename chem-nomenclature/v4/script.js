// Allocate space for the data
let elements = [];
let elementsLoaded = false;
let monoAnions = [];
let monoAnionsLoaded = false;
let polyAnions = [];
let polyAnionsLoaded = false;
let polyCations = [];
let polyCationsLoaded = false;

// ~~~~~~~~ CHOOSE PATH ~~~~~~~~
// First, the user chooses a path
const appSelect = document.getElementById("app-select");
const elementsSection = document.getElementById("element-naming-section");
const compoundsSection = document.getElementById("compound-naming-section");
const loadingEl = document.getElementById("loading");

appSelect.addEventListener("change", async function () {
	const selectedMode = this.value;
	if (selectedMode === "element") {
		if (!elementsLoaded) {
			elementsLoaded = await loadElements();
		}
		if (elementsLoaded) {
			loadingEl.style.display = "none";
			elementsSection.style.display = "block";
			compoundsSection.style.display = "none";
			startElementsApp();
		}
	} else if (selectedMode === "compound") {
		if (!elementsLoaded) {
			elementsLoaded = await loadElements();
		}
		if (!monoAnionsLoaded) {
			monoAnionsLoaded = await loadMonoAnions();
		}
		if (!polyAnionsLoaded) {
			polyAnionsLoaded = await loadPolyAnions();
		}
		if (!polyCationsLoaded) {
			polyCationsLoaded = await loadPolyCations();
		}
		if (elementsLoaded && monoAnionsLoaded && polyAnionsLoaded && polyCationsLoaded) {
			loadingEl.style.display = "none";
			elementsSection.style.display = "none";
			compoundsSection.style.display = "block";
			startCompoundsApp();
		}
	} else {
		// Hide all inputs
		elementsSection.style.display = "none";
		compoundsSection.style.display = "none";
	}
});

// Fetch the local elements JSON, parse into JSON format, pass to the elements array
async function loadElements() {
	loadingEl.style.display = "block";
	try {
		const response = await fetch("../databases/elements.json");
		if (!response.ok) throw new Error("Server said no.");
		// In case the previous line gets triggered, code skips to the catch (err) marker
		elements = await response.json();
		// The app won't start until the elements are loaded
		return true;
	} catch (err) {
		loadingEl.style.display = "none";
		console.log(err);
		alert("Failed to load elements data. Please try again later.");
		return false;
	}
};

// Fetch the local monoatomic anions JSON
async function loadMonoAnions() {
	try {
		const response = await fetch("../databases/monoatomic-anions.json");
		if (!response.ok) throw new Error("Server said no.");
		// In case the previous line gets triggered, code skips to the catch (err) marker
		monoAnions = await response.json();
		// The app won't start until the elements are loaded
		return true;
	} catch (err) {
		loadingEl.style.display = "none";
		console.log(err);
		alert("Failed to load monoatomic anions data. Please try again later.");
		return false;
	}
};

// Fetch the local polyatomic anions JSON
async function loadPolyAnions() {
	try {
		const response = await fetch("../databases/polyatomic-anions.json");
		if (!response.ok) throw new Error("Server said no.");
		// In case the previous line gets triggered, code skips to the catch (err) marker
		polyAnions = await response.json();
		// The app won't start until the elements are loaded
		return true;
	} catch (err) {
		loadingEl.style.display = "none";
		console.log(err);
		alert("Failed to load polyatomic anions data. Please try again later.");
		return false;
	}
};

// Fetch the local polyatomic cations JSON
async function loadPolyCations() {
	try {
		const response = await fetch("../databases/polyatomic-cations.json");
		if (!response.ok) throw new Error("Server said no.");
		// In case the previous line gets triggered, code skips to the catch (err) marker
		polyCations = await response.json();
		// The app won't start until the elements are loaded
		return true;
	} catch (err) {
		loadingEl.style.display = "none";
		console.log(err);
		alert("Failed to load polyatomic cations data. Please try again later.");
		return false;
	}
};


// ~~~~~~~~ ELEMENTS PATH ~~~~~~~~
function startElementsApp() {

	const inputEl = document.getElementById("element-input");
	let inputValue = "";
	const btn = document.getElementById("element-submit");
	const outputEl = document.getElementById("element-output");
	const suggestions = document.getElementById("element-suggestions");
	let activeSuggestionIndex = -1;

	const name = (cleanedInput) => {
		// Interrupt in case there are no letters
		if (!inputEl.value || !cleanedInput)
		{
			outputEl.innerText = `Please enter letters only.`;
			return;
		}

		// Capitalize the first letter, lowercase the rest
		const cappitalizedInput = sentenseCase(cleanedInput);

		// Find the element
		const matchedElement = elements.find(el => (el.symbol === cappitalizedInput) || (el.name === cleanedInput));
		// Output depends on whether a matching element was found
		if (!matchedElement) outputEl.innerText = `Element not found. Please, try again.`;
		else outputEl.innerText = `${matchedElement.name} - ${matchedElement.symbol}`;
	}

	btn.addEventListener("click", (e) => {
		e.preventDefault();
		if (activeSuggestionIndex !== -1) {
			const itemsList = document.querySelectorAll("li"); // listItems is a NodeList
			const activeItem = itemsList[activeSuggestionIndex];
			console.log(activeItem);
			activateEventListenerOnListItem(activeItem);
		} else {
			inputValue = cleanInput(inputEl.value);
			name(inputValue);		
		}
	});

	inputEl.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (activeSuggestionIndex !== -1) {
				const itemsList = document.querySelectorAll("li"); // listItems is a NodeList
				const activeItem = itemsList[activeSuggestionIndex];
				console.log(activeItem);
				activateEventListenerOnListItem(activeItem);
				deactivateList();
				suggestions.innerHTML = "";
			} else {
				inputValue = cleanInput(inputEl.value);
				name(inputValue);			
			}
		}
		else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			const itemsList = document.querySelectorAll("li"); // listItems is a NodeList
			deactivateList();
			if (e.key === "ArrowUp") activeSuggestionIndex > -1 ? activeSuggestionIndex -= 1 : activeSuggestionIndex;
			else if (e.key === "ArrowDown") activeSuggestionIndex < itemsList.length - 1 ? activeSuggestionIndex += 1 : activeSuggestionIndex;
			console.log(activeSuggestionIndex);
			if (activeSuggestionIndex === -1) {
				deactivateList();
				inputEl.focus();
			}
			else {
				const activeItem = itemsList[activeSuggestionIndex];
				activeItem.classList.add("active");		
				inputEl.value = activeItem.innerText;
				inputValue = activeItem.dataset.value;
				inputEl.focus();
				name(inputValue);	
			}
		}
	});

	// Listens for input in the input field
	// Generates suggestions as a "matchedArray"
	inputEl.addEventListener("input", () => {
		const cleanedInput = cleanInput(inputEl.value);
		if (cleanedInput) {
			const cappitalizedInput = sentenseCase(cleanedInput);
			const matchedArray = elements.filter(el => el.name.startsWith(cleanedInput) || el.symbol.startsWith(cappitalizedInput));
			renderSuggestions(matchedArray);
		}
	});

	// Remove non-letter characters
	function cleanInput(str) {
		return str?.trim().replace(/[^a-zA-Z]/g, "").toLowerCase();
	}

	// Capitalize the first letter of cleaned input
	function sentenseCase(str) {
		return str[0].toUpperCase() + str.slice(1);
	}

	// Takes the matchedArray of suggestions
	// Generates <li> list items
	// Adds an event listeners to each list item
	// Event listeners update the input field & add an "active" class to the <li> list item
	function renderSuggestions(arr) {
		suggestions.innerHTML = "";
		arr.map(el => suggestions.innerHTML += `<li data-value="${el.name}">${el.name} (${el.symbol})</li>`);
		const listItems = document.getElementsByTagName("li");
		console.log(listItems); // listItems is an HTML Collection
		for (let item of listItems) {
			item.addEventListener("click", () => {
				activateEventListenerOnListItem(item);
			});	
			item.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					activateEventListenerOnListItem(item);		
				}
			});	
		}
	}

	function deactivateList() {
		const listItemsNodeList = document.querySelectorAll("li"); // listItems is a NodeList
		listItemsNodeList.forEach(item => item.classList.remove("active"));
	}

	function activateEventListenerOnListItem(item) {
		activeSuggestionIndex = -1;
		deactivateList();
		inputEl.value = item.dataset.value;
		inputValue = item.dataset.value;
		item.classList.add("active");
		inputEl.focus();
		name(inputValue);
	}

	// Types of UI interactions:
	// - type in the input
	// - keydown "Enter"
	// - button "click"
	// - keydown "ArrowUp"
	// - keydown "ArrowDown"

	// Actions performed
	// - compare the input to element names
	// - compare the input to element symbols
	// - renderSuggestions

	// on input: render suggestions
	// on arrowUp & arrowDown: cycle through the suggestions
	// on enter & button click: check for matches in the elements array (name() function)

}

// ~~~~~~~~ COMPOUNDS PATH ~~~~~~~~
function startCompoundsApp() {
	const inputEl = document.getElementById("compound-input");
	let inputValue = "";
	const btn = document.getElementById("compound-submit");
	const outputEl = document.getElementById("compound-output");
	const suggestions = document.getElementById("compound-suggestions");

	// Accept input
	inputEl.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			parseInput();
		}
	});
	btn.addEventListener("click", (e) => {
		e.preventDefault();
		parseInput();		
	});

	// Parse input for information: front, front-coef, back, back-coef
	function parseInput() {
		inputValue = inputEl.value.trim();
		matched = regex1test(inputValue);
		if (!matched) matched = regex2test(inputValue);
		if (!matched) matched = regex3test(inputValue);
		if (!matched) matched = regex4test(inputValue);
		if (!matched) matched = regex5test(inputValue);
		if (!matched) matched = regex6test(inputValue);
		if (!matched) outputEl.innerText = "No match found. Please, try again."
		else console.log(matched);

		// // Validate
		// let [cation, caType] = validate(front);
		// if (!cation) {
		// 	// Adjust
		// 	const front = matched[2];
		// 	console.log("front: ", front);
		// 	const back = matched.slice(4, 13).join("");
		// 	console.log("back: ", back);
		// 	const frontCoef = matched[3];
		// 	const backCoef = matched[14];
		// 	console.log("Coefficients: ", frontCoef, " ", backCoef);

		// 	// Validate again
		// 	[cation, caType] = validate(front);
		// 	if (!cation) alert("No match. Please, try again.");
		// 	else {
		// 		console.log("Front match found: ", cation, " ", caType);
		// 		let [anion, anType] = validate(back);
		// 		if (!anion) alert("No match. Please, try again.");
		// 		else console.log("Back match found: ", anion, " ", anType);
		// 	}
		// }
		// else {
		// 	console.log("Front match found: ", cation, " ", caType);
		// 	let [anion, anType] = validate(back);
		// 	if (!anion) alert("No match. Please, try again.");
		// 	else console.log("Back match found: ", anion, " ", anType);
		// }

		
	}

	// Decide based on the values whether the compound is 
	// (A) covalent (B) acid (C) ionic
	// write the logic for naming each type

	function validate(chunk) {
		console.log("chunk: ", chunk);
		// Look for a match in the polyatomic-cations array
		let ion = polyCations.find(cat => cat.formula === chunk);
		if (ion) return [ion, "cation"]
		// Look for a match in the polyatomic-anions array
		if (!ion) ion = polyAnions.find(anion => anion.formula === chunk);
		if (ion) return [ion, "anion"];
		// Look for a match in the monoatomic-anions array
		if (!ion) ion = monoAnions.find(anion => anion.formula === chunk);
		if (ion) return [ion, "anion"];
		// Look for a match in the elements array
		if (!ion) ion = elements.find(el => el.symbol === chunk);
		if (ion) return [ion, "element"];
		return;
	}

	function regex1test(str) {
		// For elements
		const matched = str.match(/^[A-Z][a-z]?$/);
		console.log(matched);
		if (matched) {
			const element = elements.find(el => el.symbol === matched[0]);	
			outputEl.innerText = `${element.symbol} - ${element.name}`;
			return 1;
		} else {
			return;
		}
	}

	function regex2test(str) {
		// For diatomic compounds
		const matched = str.match(/^([A-Z][a-z]?)(\d*)?([A-Z][a-z]?)(\d*)?$/);
		console.log(matched);

		if (matched) {

			// GET the MATCHED components of the molecular formula
			const front = elements.find(el => el.symbol === matched[1]);
			console.log("front: ", matched[1]);
			
			let frontCoef = matched[2];
			if (!frontCoef) frontCoef = 1;
			else frontCoef = Number(matched[2]);
			
			const back = monoAnions.find(anion => anion.formula === matched[3]);
			console.log("back: ", matched[3]);
			
			let backCoef = matched[4];
			if (!backCoef) backCoef = 1;
			else backCoef = Number(matched[4]);

			// Add "covalent compounds" naming

			// CALCULATE the OXIDATION STATE from the molecular formula
			let oxState = (0 - back.charge * backCoef) / frontCoef;
			
			outputEl.innerHTML = "";
			let compoundName = "";

			// NAME the compound
			// Salts of Type I metals
			if (front["oxidation states"].length === 1) {
				compoundName = `${front.name} ${back.name}`;
			// Salts of Type II metals
			} else {
				// If ox state is a round number, convert to a Roman Numeral
				if ((oxState % Math.floor(oxState)) === 0 && oxState < 13) {
					const oxStateRoman = getRoman(oxState);
					compoundName = `${front.name} (${oxStateRoman}) ${back.name}`;
				// If ox state is a fraction, express as a decimal
				} else {
					compoundName = `${front.name} (${oxState.toFixed(2)}) ${back.name}`;
				}
			}

			// DISPLAY compound NAME on the screen
			outputEl.innerHTML += compoundName;

			// Alert if the calculated ox state is atypical or unlikely
			if (!front["oxidation states"].includes(oxState)) {
				let oxStateText = "";
				if (oxState !== 0) {
					oxState % 1 === 0 ? oxStateText = `${oxState}` : oxStateText = `${oxState.toFixed(2)}`;
					oxState > 0 ? oxStateText = "+" + oxStateText : oxStateText = "-" + oxStateText;					
				} else {
					oxStateText = "0";
				}
				outputEl.innerHTML += `<br><br><br>*Unusual oxidation state on ${front.symbol}: ${oxStateText}.<br><br>`;
				outputEl.innerHTML += `Typical oxidation states for ${front.symbol}: `;
				front["oxidation states"].map(s => {
					if (s > 0) outputEl.innerHTML += `<br>+${s}`;
					else outputEl.innerHTML += `<br>${s}`;
				});
			}

			return 1;
		} else {
			return;
		}
	}

	function getRoman(d) {
		const romans = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
		return romans[d];
	}

	function regex3test(str) {
		// For ionic with metal cation & polyatomic anion
		const matched = str.match(/^([A-Z][a-z]?)(\d*)?(\()?([A-Z][a-z]?)(\d*)?([A-Z][a-z]?)(\d*)?([A-Z][a-z]?)?(\d*)?([A-Z][a-z]?)?(\d*)?([A-Z][a-z]?)?(\d*)?(\))?(\d*)?$/);
		console.log(matched);

		if (matched) {

			// GET the MATCHED components of the molecular formula
			const front = elements.find(el => el.symbol === matched[1]);
			console.log("front: ", matched[1]);
			
			let frontCoef = matched[2];
			if (!frontCoef) frontCoef = 1;
			else frontCoef = Number(matched[2]);

			const back = polyAnions.find(anion => anion.formula === matched.slice(4, 14).join(""));
			console.log("back: ", matched.slice(4, 14).join(""));

			let backCoef = matched[15];
			if (!backCoef) backCoef = 1;
			else backCoef = Number(matched[15]);

			// CALCULATE the OXIDATION STATE from the molecular formula
			let oxState = (0 - back.charge * backCoef) / frontCoef;
			
			outputEl.innerHTML = "";
			let compoundName = "";

			// NAME the compound
			// Salts of Type I metals
			if (front["oxidation states"].length === 1) {
				compoundName = `${front.name} ${back.name}`;
			// Salts of Type II metals
			} else {
				// If ox state is a round number, convert to a Roman Numeral
				if ((oxState % Math.floor(oxState)) === 0 && oxState < 13) {
					const oxStateRoman = getRoman(oxState);
					compoundName = `${front.name} (${oxStateRoman}) ${back.name}`;
				// If ox state is a fraction, express as a decimal
				} else {
					compoundName = `${front.name} (${oxState.toFixed(2)}) ${back.name}`;
				}
			}

			// DISPLAY compound NAME on the screen
			outputEl.innerHTML += compoundName;

			// Alert if the calculated ox state is atypical or unlikely
			if (!front["oxidation states"].includes(oxState)) {
				let oxStateText = "";
				if (oxState !== 0) {
					oxState % 1 === 0 ? oxStateText = `${oxState}` : oxStateText = `${oxState.toFixed(2)}`;
					oxState > 0 ? oxStateText = "+" + oxStateText : oxStateText = "-" + oxStateText;					
				} else {
					oxStateText = "0";
				}
				outputEl.innerHTML += `<br><br><br>*Unusual oxidation state on ${front.symbol}: ${oxStateText}.<br><br>`;
				outputEl.innerHTML += `Typical oxidation states for ${front.symbol}: `;
				front["oxidation states"].map(s => {
					if (s > 0) outputEl.innerHTML += `<br>+${s}`;
					else outputEl.innerHTML += `<br>${s}`;
				});
			}

			return 1;
		} else {
			return;
		}
	}

	function regex4test(str) {
		// For ionic with polyatomic cation & simple anion
		const matched = str.match(/^(^\()?([A-Z][a-z]?)(\d*)?([A-Z][a-z]?)?(\d*)?(\))?(\d*)?([A-Z][a-z]?)(\d*)?$/);
		console.log(matched);

		if (matched) {

			// GET the MATCHED components of the molecular formula
			const front = polyCations.find(cat => cat.formula === matched.slice(2, 6).join(""));
			console.log("front: ", matched.slice(2, 6).join(""));
			
			let frontCoef = matched[7];
			if (!frontCoef) frontCoef = 1;
			else frontCoef = Number(matched[7]);
			
			const back = monoAnions.find(anion => anion.formula === matched[8]);
			console.log("back: ", matched[8]);
			
			let backCoef = matched[9];
			if (!backCoef) backCoef = 1;
			else backCoef = Number(matched[9]);

			// CALCULATE the OXIDATION STATE from the molecular formula
			let oxState = (0 - back.charge * backCoef) / frontCoef;
			
			outputEl.innerHTML = "";
			let compoundName = "";

			// NAME the compound
			compoundName = `${front.name} ${back.name}`;

			// DISPLAY compound NAME on the screen
			outputEl.innerHTML += compoundName;

			// Alert if the calculated ox state is atypical or unlikely
			if (front.charge !== oxState) {
				let oxStateText = "";
				if (oxState !== 0) {
					oxState % 1 === 0 ? oxStateText = `${oxState}` : oxStateText = `${oxState.toFixed(2)}`;
					oxState > 0 ? oxStateText = "+" + oxStateText : oxStateText = "-" + oxStateText;					
				} else {
					oxStateText = "0";
				}
				outputEl.innerHTML += `<br><br><br>*Unusual charge on ${front.formula}: ${oxStateText}.<br><br>`;
				outputEl.innerHTML += `The charge of ${front.formula} is +${front.charge}`;
				outputEl.innerHTML += `The oxidation state of ${back.formula} is +${back.charge}`;
			}

			return 1;
		} else {
			return;
		}
	}

	function regex5test(str) {
		// For ionic with polyatomic cation & polyatomic anion
		matched = str.match(/^(^\()?([A-Z][a-z]?)(\d*)?([A-Z][a-z]?)?(\d*)?(\))?(\d*)?(\()?([A-Z][a-z]?)(\d*)?([A-Z][a-z]?)(\d*)?([A-Z][a-z]?)?(\d*)?([A-Z][a-z]?)?(\d*)?([A-Z][a-z]?)?(\d*)?(\))?(\d*)?$/);
		console.log(matched);

		if (matched) {
			// Initial Parsing
			const front = polyCations.find(cat => cat.formula === matched.slice(2, 6).join(""));
			console.log("front: ", matched.slice(2, 6).join(""));
			
			let frontCoef = matched[7];
			if (!frontCoef) frontCoef = 1;
			else frontCoef = Number(matched[7]);

			const back = polyAnions.find(anion => anion.formula === matched.slice(9, 19).join(""));
			console.log("back: ", matched.slice(9, 19).join(""));

			let backCoef = matched[20];
			if (!backCoef) backCoef = 1;
			else backCoef = Number(matched[20]);

			// CALCULATE the OXIDATION STATE from the molecular formula
			let oxState = (0 - back.charge * backCoef) / frontCoef;

			outputEl.innerHTML = "";
			let compoundName = "";

			// NAME the compound
			compoundName = `${front.name} ${back.name}`;

			// DISPLAY compound NAME on the screen
			outputEl.innerHTML += compoundName;

			// Alert if the calculated ox state is atypical or unlikely
			if (front.charge !== oxState) {
				let oxStateText = "";
				if (oxState !== 0) {
					oxState % 1 === 0 ? oxStateText = `${oxState}` : oxStateText = `${oxState.toFixed(2)}`;
					oxState > 0 ? oxStateText = "+" + oxStateText : oxStateText = "-" + oxStateText;					
				} else {
					oxStateText = "0";
				}
				outputEl.innerHTML += `<br><br><br>*Unusual charge on ${front.formula}: ${oxStateText}.<br><br>`;
					outputEl.innerHTML += `<br>The charge of the ${front.formula} cation is +${front.charge}.`;
					outputEl.innerHTML += `<br>The charge of the ${back.formula} anion is ${back.charge}.`;
			}

			return 1;
		} else {
			return;
		}
	}

	function regex6test(str) {
		// For ionic with organic anion written first
	}
}

// NH4C2H3O2 - won't bypass regex3test(), thinks N is a metal...
// CH3COONH4 – written in organic form, NH₄⁺ + acetate
// Ca2Fe(CN)6 – complex coordination compound


