import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import nextConfig from "@/next.config";
import { buildCsp, providersInUse } from "@/lib/csp";
import { portfolioEntries } from "@/data/portfolio";

/**
 * TASK-122 — the CSP stays tight while it admits the video players (video-embed spec §9, §18).
 * Fails on `frame-src *`, on any `youtube.com/embed` (the tracking host) anywhere in the policy or
 * the app source, and on ANY change to a directive other than frame-src.
 *
 * TASK-134 extends `media-src` by exactly `blob:` for Ask Tushky's voice (and pins it below).
 */
function directives(csp: string): Map<string, string> {
  return new Map(
    csp
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...values] = d.split(/\s+/);
        return [name!, values.join(" ")] as const;
      }),
  );
}

async function servedCsp(): Promise<string> {
  const rules = await nextConfig.headers!();
  const all = rules.find((r) => r.source === "/(.*)");
  const header = all?.headers.find((h) => h.key === "Content-Security-Policy");
  if (!header) throw new Error("no CSP header on /(.*)");
  return header.value;
}

// Every directive except frame-src, exactly as TP9 set it. Changing one must be a deliberate edit here.
const UNRELATED = {
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: blob:",
  // TASK-134: Ask Tushky's voice plays same-origin FAQ clips and Blob URLs of fetched speech.
  "media-src": "'self' blob:",
  "font-src": "'self'",
  "connect-src": "'self'",
  "frame-ancestors": "'none'",
  "base-uri": "'self'",
  "form-action": "'self'",
  "object-src": "'none'",
  "upgrade-insecure-requests": "",
};

describe("served CSP (next.config.ts headers)", () => {
  it("frame-src is exactly the privacy-enhanced YouTube host while no product uses Vimeo", async () => {
    const d = directives(await servedCsp());
    expect(providersInUse(portfolioEntries)).not.toContain("vimeo");
    expect(d.get("frame-src")).toBe("https://www.youtube-nocookie.com");
  });

  it("no wildcard, no 'self', no youtube.com, no http: in frame-src; no child-src loophole", async () => {
    const d = directives(await servedCsp());
    const frame = d.get("frame-src")!.split(" ");
    for (const source of frame) {
      expect(source).not.toContain("*");
      expect(source).toMatch(/^https:\/\//);
      expect(source).not.toMatch(/^https:\/\/(www\.)?youtube\.com/);
    }
    expect(d.has("child-src")).toBe(false);
  });

  it("every other directive is unchanged", async () => {
    const d = directives(await servedCsp());
    d.delete("frame-src");
    expect(Object.fromEntries(d)).toEqual(UNRELATED);
  });

  it("the other security headers are still sent", async () => {
    const rules = await nextConfig.headers!();
    const keys = rules.find((r) => r.source === "/(.*)")!.headers.map((h) => h.key);
    expect(keys).toEqual(
      expect.arrayContaining(["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Permissions-Policy"]),
    );
  });
});

describe("TASK-134 voice playback", () => {
  it("media-src admits same-origin audio and Blob URLs, and nothing else", async () => {
    const d = directives(await servedCsp());
    expect(d.get("media-src")).toBe("'self' blob:");
    expect(d.get("media-src")).not.toMatch(/\*|data:|https?:/);
  });

  it("the speech POST is same-origin: connect-src stays 'self' only; frame-src is untouched", async () => {
    const d = directives(await servedCsp());
    expect(d.get("connect-src")).toBe("'self'");
    expect(d.get("frame-src")).toBe("https://www.youtube-nocookie.com");
  });
});

describe("buildCsp (provider-derived frame-src, §19)", () => {
  it("adds player.vimeo.com only when a product uses Vimeo — a config-only switch", () => {
    const withVimeo = providersInUse([{ demoVideo: { provider: "vimeo" } }, { pitchVideo: { provider: "youtube" } }]);
    expect(directives(buildCsp(withVimeo)).get("frame-src")).toBe("https://www.youtube-nocookie.com https://player.vimeo.com");
    expect(directives(buildCsp([])).get("frame-src")).toBe("https://www.youtube-nocookie.com");
  });

  it("never changes an unrelated directive, whatever the providers", () => {
    for (const used of [[], ["youtube"], ["vimeo"], ["youtube", "vimeo"]] as const) {
      const d = directives(buildCsp(used));
      d.delete("frame-src");
      expect(Object.fromEntries(d)).toEqual(UNRELATED);
    }
  });
});

describe("no youtube.com embed anywhere in the shipped source (§1)", () => {
  const ROOT = resolve(__dirname, "../..");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : /\.(tsx?|mjs|json)$/.test(name) ? [path] : [];
    });

  it("app/, components/, lib/, data/ and next.config.ts never reference youtube.com/embed", () => {
    const files = [...["app", "components", "lib", "data"].flatMap((d) => walk(join(ROOT, d))), join(ROOT, "next.config.ts")];
    const offenders = files.filter((f) => /youtube\.com\/embed/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
