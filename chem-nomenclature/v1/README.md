# 🧪 Chemical Elements Nomenclature App

This is a simple and elegant web application that allows users to input either a **chemical element name** or its **symbol** and returns the corresponding match (e.g., `oxygen → O`, `Fe → iron`).

---

## 🚀 Features

- Accepts both **element names** and **symbols**
- Handles messy input (removes numbers and special characters automatically)
- Displays the correct match if a valid element is found
- Friendly message for invalid or empty input
- Fully client-side — no frameworks, no dependencies

---

## 📁 Files

- `index.html` – App structure and input field
- `styles.css` – Minimal layout styling
- `script.js` – Core functionality and periodic table data (first 118 elements)

---

## 🖱 How to Use

1. Open `index.html` in your browser.
2. Type a chemical **element name** or **symbol** into the input field.
3. Click the “Name” button or press **Enter**.
4. The app will display the matching name and symbol (e.g., `carbon - C`).

---

## 🔒 Input Rules

- Letters only: all other characters are automatically removed.
- Not case sensitive — both `na` and `NA` will work.
- If the input is invalid or doesn't match any element, you'll see:
  > `Element not found. Please, try again.`

---

## 🌱 Next Steps (Planned Features)

- 🔍 Autocompletion for partial inputs (element symbols and names)
- ⌨️ Keyboard navigation of suggestions
- Moving the elements object out as an API hosted on GitHub
- Autocompletion for partial inputs, with suggestions of compound formulas (N -> nitrogen, Na, NaCl, etc.) – maybe..
- Expanding to name simple binary ionic compounds, then polyatomic ionic compounds, then acids and binary covalent compounds

---

## 👩‍🔬 Built With

- Vanilla JavaScript
- HTML & CSS