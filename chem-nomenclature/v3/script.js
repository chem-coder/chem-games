// Allocate space for the elements array
let elements = [];

// Fetch the local elements JSON, parse into JSON format, pass to the elements array
async function loadElements() {
	const res = await fetch("../databases/elements.json");
	elements = await res.json();
	
	// The app won't start until the elements are loaded
	startApp();
};

loadElements();

function startApp() {

	const inputEl = document.getElementById("input");
	let inputValue = "";
	const btn = document.getElementById("btn");
	const outputEl = document.getElementById("output");
	const suggestions = document.getElementById("suggestions");
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



