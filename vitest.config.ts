import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const alias = { "@": fileURLToPath(new URL(".", import.meta.url)) };

// Two projects (A9): `node` for pure-logic suites (schema, providers, format, seo,
// forbidden-strings, predeploy-check, bundle-budget) written as `*.test.ts`, and
// `jsdom` for Testing Library component suites written as `*.test.tsx`. Splitting by
// extension keeps each test file in exactly one project (no double counting).
//
// Reporters/outputFile are root-level (a run-wide concern, not per-project): the JSON
// reporter writes .eval/vitest.json (git-ignored) so `scripts/eval.ts` can read the
// Vitest layer's real results (A16). `default` keeps the human-readable console output.
export default defineConfig({
  test: {
    reporters: ["default", "json"],
    outputFile: { json: ".eval/vitest.json" },
    projects: [
      {
        resolve: { alias },
        test: {
          name: "node",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "jsdom",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./tests/setup/jest-dom.ts"],
          include: ["tests/unit/**/*.test.tsx"],
        },
      },
    ],
  },
});
