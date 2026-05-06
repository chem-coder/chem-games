const concSA = document.getElementById("SA-conc");
const concWA = document.getElementById("WA-conc");
const concSB = document.getElementById("SB-conc");
const concWB = document.getElementById("WB-conc");
const ka = document.getElementById("Ka");
const kb = document.getElementById("Kb");
const inputs = [concSA, concSB, concWA, ka, concWB, kb];

const inputGroups = {
	SA: [concSA], 		// Strong acid
	SB: [concSB], 		// Strong base
	WA: [concWA, ka], 	// Weak acid + Ka
	WB: [concWB, kb]	// Weak base + Kb
};

const isGroupFilled = (group) => group.some(input => input.value.trim() !== "");

const updateFormState = () => {
	let activeGroup = null;


	for (const [key, group] of Object.entries(inputGroups)) {
		group.forEach(el => el.classList.remove("active-input"));
		if (isGroupFilled(group)) {
			activeGroup = key;
			group.forEach(el => el.classList.add("active-input"));
			break;	// Only one group should be active
		}
	}

	if (activeGroup === null) {
		inputs.forEach(input => input.disabled = false);	// Nothing filled -> enable all inputs
	} else {
		for (const [key, group] of Object.entries(inputGroups)) {
			const shouldDisable = key !== activeGroup;
			group.forEach(input => input.disabled = shouldDisable);	// Disable all except active group
		}
	}
};

const pHBtn = document.getElementById('calculate-pH');
const pHout = document.getElementById("pH-output");

// Calculate [H+] or [OH-] from Ka + WA-conc or from KB + WB-conc
const getHOH = (k, wc) => Math.sqrt(k * wc);

// Calculate pH or pOH from H+ or OH-
const getpHpOH = (hOH) => -Math.log10(hOH);

const pHcalculate = (type) => {
	// Determine which input group was active
	let x = type.toString();
	let pH;
	switch (x) {
	case "SA":
		const h = inputGroups[type][0].value;
		pH = getpHpOH(h);
		break;
	case "SB":
		const oh = inputGroups[type][0].value;
		pH = 14 - getpHpOH(oh);
		break;
	case "WA":
		const wa = inputGroups[type][0].value;
		const ka = inputGroups[type][1].value;
		pH = getpHpOH(getHOH(ka, wa));
		break;
	case "WB":
		const wb = inputGroups[type][0].value;
		const kb = inputGroups[type][1].value;
		pH = 14 - getpHpOH(getHOH(kb, wb));
		break;
	}
	pHout.innerText = `pH = ${pH.toFixed(2)}`;
}

// Run once on page load to check for pre-filled inputs
updateFormState();
pHBtn.addEventListener("click", pHcalculate);

//Checks form state on every stroke
inputs.forEach(input => {
	input.addEventListener("input", updateFormState);	// updates form
	input.addEventListener("keydown", (e) => {	// calculates pH on "Enter"
		if (e.key === "Enter") {
			for (const [type, group] of Object.entries(inputGroups)) {
				if (group.every(el => el.value !== "")) {
					pHcalculate(type);
				} else if (type === "WA" && group[0].value === "" && group[1].value !== "") {
					alert("Please, enter the concentration for the weak acid");
				} else if (type === "WA" && group[0].value !== "" && group[1].value === "") {
					alert("Please, enter the Ka of the weak acid");
				} else if (type === "WB" && group[0].value === "" && group[1].value !== "") {
					alert("Please, enter the concentration for the weak base");
				} else if (type === "WB" && group[0].value !== "" && group[1].value === "") {
					alert("Please, enter the Kb of the weak base");
				}
			}
		}	
	});
});
// If SA-conc input is not empty, disable the rest
// If SB-conc input is not empty, disable the rest
// If WA-conc input is not empty, disable all except Ka
// If WB-conc input is not empty, disable all except Kb
// If Ka input is not empty, disable all except WA-conc
// If Kb input is not empty, disable all except WB-conc




