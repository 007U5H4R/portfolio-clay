import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Gummy Lab (TASK-143): react-three-fiber is imperative by design. Per-frame `useFrame` callbacks
  // mutate three.js objects and refs (spec §39: "use refs for per-frame values, no React state per
  // frame"), which the React Compiler's immutability rule reads as mutating hook values. Scoped to
  // the lab's own folder; every other rule stays on.
  {
    files: ["components/lab/**/*.{ts,tsx}"],
    rules: { "react-hooks/immutability": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
