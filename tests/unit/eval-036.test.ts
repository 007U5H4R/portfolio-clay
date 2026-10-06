import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * EVAL-036 (static half) — no continuous expensive animation (M-011, TASK-143 scar, §26): no `@keyframes` in the site's
 * CSS animates `filter`, `backdrop-filter`, `box-shadow` or a layout property (`width`, `height`, `top`, `left`, `right`,
 * `bottom`, margins, padding); and no element that carries an `infinite` animation also carries a `filter` or
 * `backdrop-filter` of its own (a filter on a moving layer is re-applied every frame). The runtime half (loops paused
 * off-screen / under an overlay) is tests/e2e/eval-036.spec.ts.
 */
const ROOT = process.cwd();
const FORBIDDEN = /^(filter|backdrop-filter|box-shadow|width|height|min-width|min-height|max-width|max-height|top|left|right|bottom|inset|margin(-[a-z]+)?|padding(-[a-z]+)?)$/;

function cssFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) cssFiles(p, out);
    else if (name.endsWith(".css")) out.push(p);
  }
  return out;
}

/** Brace-balanced body of the block starting at `open` (the index of its `{`). */
function body(css: string, open: number): string {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return css.slice(open + 1);
}

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const files = [...cssFiles(join(ROOT, "app")), ...cssFiles(join(ROOT, "components"))];

describe("EVAL-036 no expensive keyframes", () => {
  it("scans the site's CSS", () => {
    expect(files.length).toBeGreaterThan(1);
  });

  it("no @keyframes animates a filter, shadow or layout property", () => {
    const hits: string[] = [];
    for (const file of files) {
      const css = strip(readFileSync(file, "utf8"));
      for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
        const open = m.index! + m[0].length - 1;
        for (const prop of body(css, open).matchAll(/(?:^|[;{\s])([a-z-]+)\s*:/g)) {
          if (FORBIDDEN.test(prop[1]!)) hits.push(`${file.replace(ROOT + "/", "")} @keyframes ${m[1]} animates ${prop[1]}`);
        }
      }
    }
    expect([...new Set(hits)]).toEqual([]);
  });

  it("no element runs an infinite animation while carrying its own filter", () => {
    const hits: string[] = [];
    for (const file of files) {
      const css = strip(readFileSync(file, "utf8"));
      for (const m of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
        const decl = m[2]!;
        if (/animation(-name)?\s*:[^;]*\binfinite\b/.test(decl) && /(^|[;\s])(backdrop-)?filter\s*:/.test(decl) && !/filter\s*:\s*none/.test(decl)) {
          hits.push(`${file.replace(ROOT + "/", "")}: ${m[1]!.trim().replace(/\s+/g, " ")}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
