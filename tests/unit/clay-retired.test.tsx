import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoVideo } from "@/components/projects/DemoVideo";

/**
 * TKT-90a (S11 residual) — regression guard: the clay system stays retired. Mirrors the ticket's
 * grep gate so a reintroduced clay import/token/avatar path fails `pnpm test`, not just a manual grep.
 */
const ROOT = process.cwd();
const RETIRED = /components\/clay|ClayButton|toneClass|radius-clay|shadow-clay|radius-utility|shadow-utility|gradient-clay|\/avatar\//;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

describe("clay system retired (TKT-90a)", () => {
  it("no app/components/lib source references a clay primitive, clay token or avatar path", () => {
    const offenders = ["app", "components", "lib"]
      .flatMap((dir) => sourceFiles(join(ROOT, dir)))
      .filter((file) => RETIRED.test(readFileSync(file, "utf8")))
      .map((file) => file.slice(ROOT.length + 1));
    expect(offenders).toEqual([]);
  });

  it("the clay tree and the avatar assets are gone", () => {
    expect(existsSync(join(ROOT, "components/clay"))).toBe(false);
    expect(existsSync(join(ROOT, "public/avatar"))).toBe(false);
  });

  it("DemoVideo's play control is a paper pill with a 44 px target", () => {
    render(
      <DemoVideo
        name="Fixture"
        video={{ src: "/media/fixture.mp4", poster: "/media/illustrations/hero-poster.webp", durationSec: 5 }}
      />,
    );
    const play = screen.getByRole("button", { name: "Play demo: Fixture" });
    expect(play.getAttribute("type")).toBe("button");
    expect(play.className).toMatch(/min-h-11/);
    expect(play.className).toMatch(/min-w-11/);
    expect(play.className).toMatch(/rounded-\[var\(--radius-pill\)\]/);
    expect(play.className).toMatch(/shadow-\[var\(--shadow-paper\)\]/);
  });
});
