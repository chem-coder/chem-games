# 🧪 Chemical Elements Nomenclature App

This is a lightweight and fully client-side web application that allows users to input either a **chemical element name** or its **symbol**, and receive the correct match from the periodic table (e.g., `oxygen → O`, `Fe → iron`). The app now dynamically fetches element data from the local project database, and includes intelligent autocompletion.

---

## 🚀 Features (v3)

- Accepts both **element names** and **symbols**
- Handles messy input (removes non-letter characters)
- **Autocomplete dropdown** with:
  - Partial matching on names and symbols
  - Click-to-select suggestions
  - Full keyboard navigation (↑ ↓ + Enter)
- Displays matching element name and symbol
- Highlights the selected suggestion during keyboard navigation
- Clean, modular code with `startApp()` initialization after JSON load
- Fetches element data from the local project database
- Fully client-side – no build tools, modules, or server setup required

---

## 📁 Files

- `index.html` – App layout and input form
- `styles.css` – Basic styling and active suggestion highlighting
- `script.js` – Main logic for input handling, search, autocompletion, and dynamic data loading

---

## 📦 Data Source

The elements are now fetched dynamically from the local project database:

```
../databases/elements.json
```

The upstream source is still:

```text
https://github.com/chem-coder/chemical-data
```

This enables cleaner separation of data from logic, local/offline-friendly development, and simpler future updates.

---

## 🖱 How to Use

1. Open `index.html` in your browser (just double-click it!)
2. Start typing a chemical element name or symbol
3. Use ↑ ↓ to navigate suggestions or click one directly
4. Press **Enter** or click the **Name** button to confirm
5. The correct element name and symbol will appear below

---

## 🖱 How to Use (in case a local host is required)

1. Serve the app locally (e.g., with Python):
   ```
   python3 -m http.server
   ```
2. Open your browser and visit:
   ```
   http://localhost:8000
   ```
3. Start typing an element name or symbol
4. Use ↑ ↓ to navigate suggestions or click one directly
5. Press **Enter** or click the **Name** button to see the match
6. The result will appear below the input

---

## 🔒 Input Rules

- Only letters allowed; non-letter characters are stripped
- Case-insensitive matching
- Partial matches are supported at the beginning of name/symbol
- Must match a known element name or symbol to show results

---

## ✅ Completed Features Since v2

- ✅ Replaced internal `elements` array with local JSON fetch
- ✅ Reorganized app flow into `loadElements()` → `startApp()` to ensure data readiness
- ✅ Handled async fetch behavior safely
- ✅ Removed Chrome's built-in autocomplete conflicts
- ✅ Improved keyboard/Enter logic for repeated use without reselecting
- ✅ Cleaned up input after selection and clarified UX behavior

---

## 🌱 Still To Do (Planned Features)

- 🧪 Expand to parse and suggest **simple formulas** (e.g., `NaCl`)
- 🧠 Add compound naming (binary ionic, polyatomic, acids, covalent)
- 💅 Style enhancements (transitions, spacing, mobile responsiveness)
- 🎯 Accessibility improvements (ARIA roles, better keyboard UX)

---

## 👩‍🔬 Built With

- Vanilla JavaScript (no frameworks)
- HTML5
- CSS3 (minimal custom styling)
- Local JSON data snapshot from the chemistry data repository
