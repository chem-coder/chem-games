const concSA = document.getElementById("SA-conc");
const pHBtn = document.getElementById('calculate-pH');
const pHout = document.getElementById("pH-output");

const pHcalculate = () => {
	pHout.innerText = `pH = ${(-Math.log10(parseFloat(concSA.value))).toFixed(2)}`;
}

pHBtn.addEventListener("click", pHcalculate);
concSA.addEventListener("keydown", (e) => {
	if (e.key === "Enter") pHcalculate();
});