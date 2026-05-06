# 🧪 Chemical Elements Nomenclature App

This is a lightweight and fully client-side web application that allows users to input either a **chemical element name** or its **symbol**, and receive the correct match from the periodic table (e.g., `oxygen → O`, `Fe → iron`). Now with intelligent autocompletion!

---

## 🚀 Features (v3)

- Accepts both **element names** and **symbols**
- Handles messy input (removes non-letter characters)
- **Autocomplete dropdown** with:
  - Partial matching on names and symbols
  - Click-to-select suggestions
  - Full keyboard navigation (↑ ↓ + Enter)
- Displays matching element name and symbol
- Friendly error message if no match is found
- Fully client-side – no build tools or servers required

---

## 📁 Files

- `index.html` – App layout and main interface
- `styles.css` – Styles for layout, form, and active suggestion highlighting
- `script.js` – Autocomplete logic, event handling, element data

---

## 🖱 How to Use

1. Open `index.html` in your browser
2. Begin typing a chemical name or symbol
3. Use ↑ ↓ to highlight suggestions or click one directly
4. Press **Enter** or click the **Name** button to confirm
5. The correct element name and symbol will appear below the input field

---

## 🔒 Input Rules

- Only letters are allowed (e.g., `na`, `NaCl` → `na`)
- Case-insensitive matching
- Suggestions match from the **start** of the name or symbol
- Input must match a known element name or symbol to return a result

---

## ✅ Completed Features Since v1

- ✅ Integrated an autocomplete suggestion list
- ✅ Enabled keyboard navigation (↑ ↓) and selection (Enter)
- ✅ Fixed input cleaning and matching edge cases
- ✅ Highlighting of selected suggestions
- ✅ Refactored code for clarity and modularity
- ✅ Preserved all original v1 functionality

---

## 🌱 Still To Do (Planned Features)

- 📦 Move `elements` data into a separate JSON file or API
- 🧪 Expand to suggest and parse **simple formulas** (e.g., `NaCl`)
- 🧠 Add compound naming (binary ionic, polyatomic, acids, covalent)
- 💅 Style improvements (transitions, responsive layout)
- 🎯 Accessibility tweaks (ARIA roles for suggestion list)

---

## 👩‍🔬 Built With

- Vanilla JavaScript (no frameworks)
- HTML5
- CSS3 (minimal, custom)