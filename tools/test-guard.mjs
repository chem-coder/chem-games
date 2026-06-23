// PostToolUse hook: after a .js/.mjs file is edited, run the fast test suites so any
// regression (broken conveyor logic OR a reaction whose stored solution stops balancing)
// surfaces immediately. Reads the hook payload (JSON) from stdin; exits 2 on test failure.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url))); // tools/.. = repo root
const SUITES = [
  "shared/js/conversion-engine.test.js",
  "conversion-conveyor/js/problems.test.js",
  "conversion-builder/js/builder.test.js",
  "acid-base-sorter/js/sorter.test.js",
  "acid-base-sorter/js/periodic-table.test.js",
  "acid-base-sorter/js/intro.test.js",
  "acid-base-sorter/js/stats.test.js",
  "nomenclature/js/naming.test.js",
  "nomenclature/js/triad.test.js",
  "nomenclature/builder/js/builder.test.js",
  "periodic-table/js/game.test.js",
  "tools/acid-base-db.test.js",
  "tools/validate-reactions.test.js"
];

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let filePath = "";
  try {
    filePath = JSON.parse(raw)?.tool_input?.file_path || "";
  } catch {
    process.exit(0); // not a payload we understand — don't get in the way
  }

  if (!/\.(mjs|js)$/.test(filePath) || /node_modules/.test(filePath)) {
    process.exit(0); // only guard JavaScript changes
  }

  try {
    execFileSync("node", ["--test", ...SUITES.map((s) => join(root, s))], {
      stdio: "inherit",
      cwd: root
    });
    process.exit(0);
  } catch {
    process.exit(2); // failing tests -> signal back to the session
  }
});
