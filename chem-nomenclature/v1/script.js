const elements = [
	{
		name: "hydrogen",
		symbol: "H",
		"atomic number": 1,
		"atomic mass": 1.008,
		"oxidation states": [1, -1],
		type: "nonmetal",
		subtype: "reactive nonmetal"
	},
	{
		name: "helium",
		symbol: "He",
		"atomic number": 2,
		"atomic mass": 4.0026,
		"oxidation states": [0],
		type: "nonmetal",
		subtype: "noble gas"
	},
	{
		name: "lithium",
		symbol: "Li",
		"atomic number": 3,
		"atomic mass": 6.94,
		"oxidation states": [1],
		type: "metal",
		subtype: "alkali metal"
	},
	{
		name: "beryllium",
		symbol: "Be",
		"atomic number": 4,
		"atomic mass": 9.0122,
		"oxidation states": [2],
		type: "metal",
		subtype: "alkaline earth metal"
	},
	{
		name: "boron",
		symbol: "B",
		"atomic number": 5,
		"atomic mass": 10.81,
		"oxidation states": [3],
		type: "metalloid",
		subtype: "metalloid"
	},
	{
		name: "carbon",
		symbol: "C",
		"atomic number": 6,
		"atomic mass": 12.011,
		"oxidation states": [-4, 2, 4],
		type: "nonmetal",
		subtype: "reactive nonmetal"
	},
	{
		name: "nitrogen",
		symbol: "N",
		"atomic number": 7,
		"atomic mass": 14.007,
		"oxidation states": [-3, 1, 2, 3, 4, 5],
		type: "nonmetal",
		subtype: "reactive nonmetal"
	},
	{
		name: "oxygen",
		symbol: "O",
		"atomic number": 8,
		"atomic mass": 15.999,
		"oxidation states": [-2, -1],
		type: "nonmetal",
		subtype: "reactive nonmetal"
	},
	{
		name: "fluorine",
		symbol: "F",
		"atomic number": 9,
		"atomic mass": 18.998,
		"oxidation states": [-1],
		type: "nonmetal",
		subtype: "halogen"
	},
	{
		name: "neon",
		symbol: "Ne",
		"atomic number": 10,
		"atomic mass": 20.180,
		"oxidation states": [0],
		type: "nonmetal",
		subtype: "noble gas"
	},
	{
		name: "sodium",
		symbol: "Na",
		"atomic number": 11,
		"atomic mass": 22.990,
		"oxidation states": [1],
		type: "metal",
		subtype: "alkali metal"
	},
	{
		name: "magnesium",
		symbol: "Mg",
		"atomic number": 12,
		"atomic mass": 24.305,
		"oxidation states": [2],
		type: "metal",
		subtype: "alkaline earth metal"
	},
	{
		name: "aluminum",
		symbol: "Al",
		"atomic number": 13,
		"atomic mass": 26.982,
		"oxidation states": [3],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "silicon",
		symbol: "Si",
		"atomic number": 14,
		"atomic mass": 28.085,
		"oxidation states": [-4, 4],
		type: "metalloid",
		subtype: "metalloid"
	},
	{
		name: "phosphorus",
		symbol: "P",
		"atomic number": 15,
		"atomic mass": 30.974,
		"oxidation states": [-3, 3, 5],
		type: "nonmetal",
		subtype: "reactive nonmetal"
	},
	{
		name: "sulfur",
		symbol: "S",
		"atomic number": 16,
		"atomic mass": 32.06,
		"oxidation states": [-2, 2, 4, 6],
		type: "nonmetal",
		subtype: "reactive nonmetal"
	},
	{
		name: "chlorine",
		symbol: "Cl",
		"atomic number": 17,
		"atomic mass": 35.45,
		"oxidation states": [-1, 1, 3, 5, 7],
		type: "nonmetal",
		subtype: "halogen"
	},
	{
		name: "argon",
		symbol: "Ar",
		"atomic number": 18,
		"atomic mass": 39.948,
		"oxidation states": [0],
		type: "nonmetal",
		subtype: "noble gas"
	},
	{
		name: "potassium",
		symbol: "K",
		"atomic number": 19,
		"atomic mass": 39.098,
		"oxidation states": [1],
		type: "metal",
		subtype: "alkali metal"
	},
	{
		name: "calcium",
		symbol: "Ca",
		"atomic number": 20,
		"atomic mass": 40.078,
		"oxidation states": [2],
		type: "metal",
		subtype: "alkaline earth metal"
	},
	{
		name: "scandium",
		symbol: "Sc",
		"atomic number": 21,
		"atomic mass": 44.955,
		"oxidation states": [3],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "titanium",
		symbol: "Ti",
		"atomic number": 22,
		"atomic mass": 47.867,
		"oxidation states": [2, 3, 4],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "vanadium",
		symbol: "V",
		"atomic number": 23,
		"atomic mass": 50.942,
		"oxidation states": [2, 3, 4, 5],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "chromium",
		symbol: "Cr",
		"atomic number": 24,
		"atomic mass": 51.996,
		"oxidation states": [2, 3, 6],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "manganese",
		symbol: "Mn",
		"atomic number": 25,
		"atomic mass": 54.938,
		"oxidation states": [2, 3, 4, 6, 7],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "iron",
		symbol: "Fe",
		"atomic number": 26,
		"atomic mass": 55.845,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "cobalt",
		symbol: "Co",
		"atomic number": 27,
		"atomic mass": 58.933,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "nickel",
		symbol: "Ni",
		"atomic number": 28,
		"atomic mass": 58.693,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "copper",
		symbol: "Cu",
		"atomic number": 29,
		"atomic mass": 63.546,
		"oxidation states": [1, 2],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "zinc",
		symbol: "Zn",
		"atomic number": 30,
		"atomic mass": 65.38,
		"oxidation states": [2],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "gallium",
		symbol: "Ga",
		"atomic number": 31,
		"atomic mass": 69.723,
		"oxidation states": [3],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "germanium",
		symbol: "Ge",
		"atomic number": 32,
		"atomic mass": 72.630,
		"oxidation states": [2, 4],
		type: "metalloid",
		subtype: "metalloid"
	},
	{
		name: "arsenic",
		symbol: "As",
		"atomic number": 33,
		"atomic mass": 74.922,
		"oxidation states": [-3, 3, 5],
		type: "metalloid",
		subtype: "metalloid"
	},
	{
		name: "selenium",
		symbol: "Se",
		"atomic number": 34,
		"atomic mass": 78.971,
		"oxidation states": [-2, 4, 6],
		type: "nonmetal",
		subtype: "reactive nonmetal"
	},
	{
		name: "bromine",
		symbol: "Br",
		"atomic number": 35,
		"atomic mass": 79.904,
		"oxidation states": [-1, 1, 3, 5],
		type: "nonmetal",
		subtype: "halogen"
	},
	{
		name: "krypton",
		symbol: "Kr",
		"atomic number": 36,
		"atomic mass": 83.798,
		"oxidation states": [0, 2],
		type: "nonmetal",
		subtype: "noble gas"
	},
	{
		name: "rubidium",
		symbol: "Rb",
		"atomic number": 37,
		"atomic mass": 85.468,
		"oxidation states": [1],
		type: "metal",
		subtype: "alkali metal"
	},
	{
		name: "strontium",
		symbol: "Sr",
		"atomic number": 38,
		"atomic mass": 87.62,
		"oxidation states": [2],
		type: "metal",
		subtype: "alkaline earth metal"
	},
	{
		name: "yttrium",
		symbol: "Y",
		"atomic number": 39,
		"atomic mass": 88.906,
		"oxidation states": [3],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "zirconium",
		symbol: "Zr",
		"atomic number": 40,
		"atomic mass": 91.224,
		"oxidation states": [4],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "niobium",
		symbol: "Nb",
		"atomic number": 41,
		"atomic mass": 92.906,
		"oxidation states": [3, 5],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "molybdenum",
		symbol: "Mo",
		"atomic number": 42,
		"atomic mass": 95.95,
		"oxidation states": [2, 3, 4, 5, 6],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "technetium",
		symbol: "Tc",
		"atomic number": 43,
		"atomic mass": 98,
		"oxidation states": [4, 7],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "ruthenium",
		symbol: "Ru",
		"atomic number": 44,
		"atomic mass": 101.07,
		"oxidation states": [2, 3, 4, 6, 8],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "rhodium",
		symbol: "Rh",
		"atomic number": 45,
		"atomic mass": 102.91,
		"oxidation states": [1, 2, 3],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "palladium",
		symbol: "Pd",
		"atomic number": 46,
		"atomic mass": 106.42,
		"oxidation states": [2, 4],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "silver",
		symbol: "Ag",
		"atomic number": 47,
		"atomic mass": 107.87,
		"oxidation states": [1],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "cadmium",
		symbol: "Cd",
		"atomic number": 48,
		"atomic mass": 112.41,
		"oxidation states": [2],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "indium",
		symbol: "In",
		"atomic number": 49,
		"atomic mass": 114.82,
		"oxidation states": [1, 3],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "tin",
		symbol: "Sn",
		"atomic number": 50,
		"atomic mass": 118.71,
		"oxidation states": [2, 4],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "antimony",
		symbol: "Sb",
		"atomic number": 51,
		"atomic mass": 121.76,
		"oxidation states": [-3, 3, 5],
		type: "metalloid",
		subtype: "metalloid"
	},
	{
		name: "tellurium",
		symbol: "Te",
		"atomic number": 52,
		"atomic mass": 127.60,
		"oxidation states": [-2, 2, 4, 6],
		type: "metalloid",
		subtype: "metalloid"
	},
	{
		name: "iodine",
		symbol: "I",
		"atomic number": 53,
		"atomic mass": 126.90,
		"oxidation states": [-1, 1, 3, 5, 7],
		type: "nonmetal",
		subtype: "halogen"
	},
	{
		name: "xenon",
		symbol: "Xe",
		"atomic number": 54,
		"atomic mass": 131.29,
		"oxidation states": [0, 2, 4, 6, 8],
		type: "nonmetal",
		subtype: "noble gas"
	},
	{
		name: "cesium",
		symbol: "Cs",
		"atomic number": 55,
		"atomic mass": 132.91,
		"oxidation states": [1],
		type: "metal",
		subtype: "alkali metal"
	},
	{
		name: "barium",
		symbol: "Ba",
		"atomic number": 56,
		"atomic mass": 137.33,
		"oxidation states": [2],
		type: "metal",
		subtype: "alkaline earth metal"
	},
	{
		name: "lanthanum",
		symbol: "La",
		"atomic number": 57,
		"atomic mass": 138.91,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "cerium",
		symbol: "Ce",
		"atomic number": 58,
		"atomic mass": 140.12,
		"oxidation states": [3, 4],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "praseodymium",
		symbol: "Pr",
		"atomic number": 59,
		"atomic mass": 140.91,
		"oxidation states": [3, 4],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "neodymium",
		symbol: "Nd",
		"atomic number": 60,
		"atomic mass": 144.24,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "promethium",
		symbol: "Pm",
		"atomic number": 61,
		"atomic mass": 145,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "samarium",
		symbol: "Sm",
		"atomic number": 62,
		"atomic mass": 150.36,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "europium",
		symbol: "Eu",
		"atomic number": 63,
		"atomic mass": 151.96,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "gadolinium",
		symbol: "Gd",
		"atomic number": 64,
		"atomic mass": 157.25,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "terbium",
		symbol: "Tb",
		"atomic number": 65,
		"atomic mass": 158.93,
		"oxidation states": [3, 4],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "dysprosium",
		symbol: "Dy",
		"atomic number": 66,
		"atomic mass": 162.50,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "holmium",
		symbol: "Ho",
		"atomic number": 67,
		"atomic mass": 164.93,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "erbium",
		symbol: "Er",
		"atomic number": 68,
		"atomic mass": 167.26,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "thulium",
		symbol: "Tm",
		"atomic number": 69,
		"atomic mass": 168.93,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "ytterbium",
		symbol: "Yb",
		"atomic number": 70,
		"atomic mass": 173.05,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "lutetium",
		symbol: "Lu",
		"atomic number": 71,
		"atomic mass": 174.97,
		"oxidation states": [3],
		type: "metal",
		subtype: "lanthanide"
	},
	{
		name: "hafnium",
		symbol: "Hf",
		"atomic number": 72,
		"atomic mass": 178.49,
		"oxidation states": [4],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "tantalum",
		symbol: "Ta",
		"atomic number": 73,
		"atomic mass": 180.95,
		"oxidation states": [5],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "tungsten",
		symbol: "W",
		"atomic number": 74,
		"atomic mass": 183.84,
		"oxidation states": [4, 5, 6],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "rhenium",
		symbol: "Re",
		"atomic number": 75,
		"atomic mass": 186.21,
		"oxidation states": [2, 4, 6, 7],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "osmium",
		symbol: "Os",
		"atomic number": 76,
		"atomic mass": 190.23,
		"oxidation states": [2, 3, 4, 6, 8],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "iridium",
		symbol: "Ir",
		"atomic number": 77,
		"atomic mass": 192.22,
		"oxidation states": [3, 4, 6],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "platinum",
		symbol: "Pt",
		"atomic number": 78,
		"atomic mass": 195.08,
		"oxidation states": [2, 4],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "gold",
		symbol: "Au",
		"atomic number": 79,
		"atomic mass": 196.97,
		"oxidation states": [1, 3],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "mercury",
		symbol: "Hg",
		"atomic number": 80,
		"atomic mass": 200.59,
		"oxidation states": [1, 2],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "thallium",
		symbol: "Tl",
		"atomic number": 81,
		"atomic mass": 204.38,
		"oxidation states": [1, 3],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "lead",
		symbol: "Pb",
		"atomic number": 82,
		"atomic mass": 207.2,
		"oxidation states": [2, 4],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "bismuth",
		symbol: "Bi",
		"atomic number": 83,
		"atomic mass": 208.98,
		"oxidation states": [3, 5],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "polonium",
		symbol: "Po",
		"atomic number": 84,
		"atomic mass": 209,
		"oxidation states": [2, 4, 6],
		type: "metalloid",
		subtype: "metalloid"
	},
	{
		name: "astatine",
		symbol: "At",
		"atomic number": 85,
		"atomic mass": 210,
		"oxidation states": [-1, 1, 3, 5, 7],
		type: "nonmetal",
		subtype: "halogen"
	},
	{
		name: "radon",
		symbol: "Rn",
		"atomic number": 86,
		"atomic mass": 222,
		"oxidation states": [0],
		type: "nonmetal",
		subtype: "noble gas"
	},
	{
		name: "francium",
		symbol: "Fr",
		"atomic number": 87,
		"atomic mass": 223,
		"oxidation states": [1],
		type: "metal",
		subtype: "alkali metal"
	},
	{
		name: "radium",
		symbol: "Ra",
		"atomic number": 88,
		"atomic mass": 226,
		"oxidation states": [2],
		type: "metal",
		subtype: "alkaline earth metal"
	},
	{
		name: "actinium",
		symbol: "Ac",
		"atomic number": 89,
		"atomic mass": 227,
		"oxidation states": [3],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "thorium",
		symbol: "Th",
		"atomic number": 90,
		"atomic mass": 232.04,
		"oxidation states": [4],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "protactinium",
		symbol: "Pa",
		"atomic number": 91,
		"atomic mass": 231.04,
		"oxidation states": [4, 5],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "uranium",
		symbol: "U",
		"atomic number": 92,
		"atomic mass": 238.03,
		"oxidation states": [3, 4, 5, 6],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "neptunium",
		symbol: "Np",
		"atomic number": 93,
		"atomic mass": 237,
		"oxidation states": [3, 4, 5, 6, 7],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "plutonium",
		symbol: "Pu",
		"atomic number": 94,
		"atomic mass": 244,
		"oxidation states": [3, 4, 5, 6, 7],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "americium",
		symbol: "Am",
		"atomic number": 95,
		"atomic mass": 243,
		"oxidation states": [2, 3, 4, 5, 6],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "curium",
		symbol: "Cm",
		"atomic number": 96,
		"atomic mass": 247,
		"oxidation states": [3, 4],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "berkelium",
		symbol: "Bk",
		"atomic number": 97,
		"atomic mass": 247,
		"oxidation states": [3, 4],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "californium",
		symbol: "Cf",
		"atomic number": 98,
		"atomic mass": 251,
		"oxidation states": [2, 3, 4],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "einsteinium",
		symbol: "Es",
		"atomic number": 99,
		"atomic mass": 252,
		"oxidation states": [3],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "fermium",
		symbol: "Fm",
		"atomic number": 100,
		"atomic mass": 257,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "mendelevium",
		symbol: "Md",
		"atomic number": 101,
		"atomic mass": 258,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "nobelium",
		symbol: "No",
		"atomic number": 102,
		"atomic mass": 259,
		"oxidation states": [2, 3],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "lawrencium",
		symbol: "Lr",
		"atomic number": 103,
		"atomic mass": 266,
		"oxidation states": [3],
		type: "metal",
		subtype: "actinide"
	},
	{
		name: "rutherfordium",
		symbol: "Rf",
		"atomic number": 104,
		"atomic mass": 267,
		"oxidation states": [4],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "dubnium",
		symbol: "Db",
		"atomic number": 105,
		"atomic mass": 270,
		"oxidation states": [5],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "seaborgium",
		symbol: "Sg",
		"atomic number": 106,
		"atomic mass": 271,
		"oxidation states": [6],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "bohrium",
		symbol: "Bh",
		"atomic number": 107,
		"atomic mass": 270,
		"oxidation states": [7],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "hassium",
		symbol: "Hs",
		"atomic number": 108,
		"atomic mass": 277,
		"oxidation states": [8],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "meitnerium",
		symbol: "Mt",
		"atomic number": 109,
		"atomic mass": 278,
		"oxidation states": "unknown",
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "darmstadtium",
		symbol: "Ds",
		"atomic number": 110,
		"atomic mass": 281,
		"oxidation states": "unknown",
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "roentgenium",
		symbol: "Rg",
		"atomic number": 111,
		"atomic mass": 282,
		"oxidation states": "unknown",
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "copernicium",
		symbol: "Cn",
		"atomic number": 112,
		"atomic mass": 285,
		"oxidation states": [2, 4],
		type: "metal",
		subtype: "transition metal"
	},
	{
		name: "nihonium",
		symbol: "Nh",
		"atomic number": 113,
		"atomic mass": 286,
		"oxidation states": [1, 3],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "flerovium",
		symbol: "Fl",
		"atomic number": 114,
		"atomic mass": 289,
		"oxidation states": [2, 4],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "moscovium",
		symbol: "Mc",
		"atomic number": 115,
		"atomic mass": 290,
		"oxidation states": [1, 3],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "livermorium",
		symbol: "Lv",
		"atomic number": 116,
		"atomic mass": 293,
		"oxidation states": [2],
		type: "metal",
		subtype: "post-transition metal"
	},
	{
		name: "tennessine",
		symbol: "Ts",
		"atomic number": 117,
		"atomic mass": 294,
		"oxidation states": [-1, 1, 3, 5],
		type: "nonmetal",
		subtype: "halogen"
	},
	{
		name: "oganesson",
		symbol: "Og",
		"atomic number": 118,
		"atomic mass": 294,
		"oxidation states": [0, +2],
		type: "nonmetal",
		subtype: "noble gas"
	}
];


const inputEl = document.getElementById("input");
const btn = document.getElementById("btn");
const outputEl = document.getElementById("output");

const name = () => {
	const rawInput = inputEl.value;
	// Remove non-letter characters
	const cleanedInput = rawInput.trim().replace(/[^a-zA-Z]/g, "");
	// Interrupt in case input is empty
	if (!rawInput || !cleanedInput)
	{
		outputEl.innerText = `Please enter letters only.`;
		return;
	}
	// Capitalize the first letter, lowercase the rest
	const formattedInput = cleanedInput[0].toUpperCase() + cleanedInput.toLowerCase().slice(1);
	// Find the element
	const matchedElement = elements.find(el => (el.symbol === formattedInput) || (el.name === formattedInput.toLowerCase()));
	// Output depends on whether a matching element was found
	if (!matchedElement) outputEl.innerText = `Element not found. Please, try again.`;
	else outputEl.innerText = `${matchedElement.name} - ${matchedElement.symbol}`;
}

btn.addEventListener("click", name);
inputEl.addEventListener("keydown", (e) => {
	if (e.key === "Enter") name();
});