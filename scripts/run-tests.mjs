import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const compiled = spawnSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.tests.json"], { cwd, stdio: "inherit" });
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

const tests = readdirSync(new URL("../.test-build/tests/", import.meta.url))
  .filter((name) => name.endsWith(".test.js"));
if (!tests.length) throw new Error("No test files found.");
// node:test runs these suites in this process, including restricted environments
// that permit compilation but prohibit spawning a worker for every test file.
for (const name of tests) {
  await import(new URL(`../.test-build/tests/${name}`, import.meta.url));
}
