import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * TKT-21 (technical-plan.md §B M-004 TKT-21 row: "only transform/opacity/clip-path in the
 * transition list (unit test greps the CSS)") — the Show-the-thinking node reveal rules in
 * app/globals.css must never animate a layout-triggering property (width/height/top/left/margin/
 * etc.), matching Design.md §4's hardware-acceleration rule ("every entry … animates only
 * `transform` and `opacity` (plus `clip-path` for the Show-the-thinking connector draw-in)").
 */
const CSS = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

const ALLOWED = new Set(["opacity", "clip-path", "transform"]);

/** Every `transition`/`transition-property` declaration's comma-separated property list. */
function transitionedProperties(block: string): string[] {
  const props: string[] = [];
  for (const m of block.matchAll(/transition(?:-property)?:\s*([^;]+);/g)) {
    for (const raw of m[1]!.split(",")) {
      const token = raw.trim().split(/\s+/)[0]; // "opacity 220ms var(--ease-reveal)" → "opacity"
      if (token && token !== "none") props.push(token);
    }
  }
  return props;
}

/** Extract the `.thinking-node` / `.thinking-nodes` rule blocks (selector + body) from the CSS. */
function thinkingBlocks(css: string): string[] {
  const blocks: string[] = [];
  const re = /((?:\.thinking-node[a-zA-Z-]*[^{]*)\{[^}]*\})/g;
  for (const m of css.matchAll(re)) blocks.push(m[1]!);
  return blocks;
}

describe("Show-the-thinking motion (Design.md §4 hardware-acceleration rule)", () => {
  it("app/globals.css declares at least one .thinking-node rule (sanity — the grep isn't vacuous)", () => {
    const blocks = thinkingBlocks(CSS);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("every .thinking-node(s) transition only ever lists opacity/clip-path/transform", () => {
    const blocks = thinkingBlocks(CSS);
    const offenders: string[] = [];
    for (const block of blocks) {
      for (const prop of transitionedProperties(block)) {
        if (!ALLOWED.has(prop)) offenders.push(prop);
      }
    }
    expect(offenders, `disallowed animated properties found: ${offenders.join(", ")}`).toEqual([]);
  });
});
