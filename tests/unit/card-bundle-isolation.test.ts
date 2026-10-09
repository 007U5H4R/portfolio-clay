import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * EVAL-027 spirit for /card (TASK-146.5): no card code or art bytes in the home first-load set.
 * SKIPs visibly without a `.next` build — never passes vacuously.
 */
const NEXT = resolve(process.cwd(), ".next");
const HOME = resolve(NEXT, "server/app/index.html");
const built = existsSync(HOME);

const MARKERS = ["data-card-root", "paper-light.webp", "paper-dark.webp", "sailboat.webp", "media/card/panther", "qrcode-generator"];

describe.skipIf(!built)("card bundle isolation (home first-load set)", () => {
  it("home HTML and its first-load chunks carry no card markers", () => {
    const html = readFileSync(HOME, "utf8");
    const srcs = new Set<string>();
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+\.js/g)) srcs.add(m[0]);
    expect(srcs.size).toBeGreaterThan(0);
    const hits: string[] = [];
    const scan = (label: string, text: string) => {
      for (const marker of MARKERS) if (text.includes(marker)) hits.push(`${label}: ${marker}`);
    };
    scan("index.html", html);
    for (const s of srcs) {
      const file = resolve(NEXT, s.replace(/^\/_next\//, ""));
      if (existsSync(file)) scan(s, readFileSync(file, "utf8"));
    }
    expect(hits).toEqual([]);
  });
});
