/**
 * jsdom project setup (technical-plan.md §A9 / §B S08.01).
 *
 * Registers @testing-library/jest-dom's custom matchers (toBeInTheDocument, toHaveAttribute,
 * toHaveClass, …) on Vitest's `expect` for the `jsdom` project only. Pure-logic `*.test.ts`
 * suites run in the `node` project, which does not load this file, so the DOM matchers exist
 * exactly where a DOM does.
 */
import "@testing-library/jest-dom/vitest";
