import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const alias = { "@": fileURLToPath(new URL(".", import.meta.url)) };

// Two projects (A9): `node` for pure-logic suites (schema, providers, format, seo,
// forbidden-strings, predeploy-check, bundle-budget) written as `*.test.ts`, and
// `jsdom` for Testing Library component suites written as `*.test.tsx`. Splitting by
// extension keeps each test file in exactly one project (no double counting).
export default defineConfig({
  test: {
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
          include: ["tests/unit/**/*.test.tsx"],
        },
      },
    ],
  },
});
