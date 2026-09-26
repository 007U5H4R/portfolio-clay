/**
 * routes.test.ts (technical-plan.md §B S09.03) — unit coverage for the route loader's fallback
 * ORDER. Runs in the `node` Vitest project; injects a fake fetch so no server is needed.
 */
import { describe, expect, it } from "vitest";
import {
  DEV_ROUTES,
  STATIC_ROUTES,
  loadRoutes,
  type FetchLike,
} from "@/tests/e2e/routes";
import { navItems } from "@/lib/nav";
import allowlist from "@/tests/e2e/crawler-allowlist.json";

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://portfolio-clay.example/</loc></url>
  <url><loc>https://portfolio-clay.example/work</loc></url>
  <url><loc>https://portfolio-clay.example/work/teachspark</loc></url>
  <url><loc>https://portfolio-clay.example/contact</loc></url>
  <url><loc>https://portfolio-clay.example/about</loc></url>
</urlset>`;

const fakeFetch = (impl: (url: string) => Awaited<ReturnType<FetchLike>>): FetchLike => {
  return async (url: string) => impl(url);
};

describe("loadRoutes fallback order (S09.03)", () => {
  it("prefers the sitemap when it returns 200 with <loc> entries", async () => {
    const routes = await loadRoutes({
      fetchImpl: fakeFetch(() => ({ ok: true, status: 200, text: async () => SITEMAP_XML })),
    });
    expect(routes).toEqual(["/", "/work", "/work/teachspark", "/contact", "/about"]);
    // The sitemap included a route (/about) not in the static file — proving preference, not merge.
    expect(routes).toContain("/about");
  });

  it("falls back to the static list on a non-200 sitemap", async () => {
    const routes = await loadRoutes({
      fetchImpl: fakeFetch(() => ({ ok: false, status: 404, text: async () => "not found" })),
    });
    expect(routes).toEqual([...STATIC_ROUTES]);
  });

  it("falls back to the static list when the sitemap is 200 but empty", async () => {
    const routes = await loadRoutes({
      fetchImpl: fakeFetch(() => ({ ok: true, status: 200, text: async () => "<urlset></urlset>" })),
    });
    expect(routes).toEqual([...STATIC_ROUTES]);
  });

  it("falls back to the static list when the fetch throws", async () => {
    const routes = await loadRoutes({
      fetchImpl: async () => {
        throw new Error("ECONNREFUSED");
      },
    });
    expect(routes).toEqual([...STATIC_ROUTES]);
  });

  it("appends dev routes only when includeDev is set", async () => {
    const withoutDev = await loadRoutes({
      fetchImpl: fakeFetch(() => ({ ok: false, status: 404, text: async () => "" })),
    });
    expect(withoutDev).not.toContain(DEV_ROUTES[0]);

    const withDev = await loadRoutes({
      includeDev: true,
      fetchImpl: fakeFetch(() => ({ ok: false, status: 404, text: async () => "" })),
    });
    expect(withDev).toEqual([...STATIC_ROUTES, ...DEV_ROUTES]);
  });
});

// TC-131 step 1 (TKT-71 AC 5, decision D8): five nav items with Playground; every href is a static
// route the crawler (EVAL-011) can reach, and none needs the allow-list. If Tushar reverts D8 the
// expected length becomes 4 and the band gains a Playground link (one documented edit each).
describe("primary nav (lib/nav.ts, D8)", () => {
  it("has the Design.md §4.1 items in order, then Certifications (TKT-102, Dev-46)", () => {
    expect(navItems).toHaveLength(6);
    expect(navItems.map((item) => item.href)).toEqual(["/", "/work", "/thinking", "/about", "/playground", "/certifications"]);
    expect(navItems.map((item) => item.label)).toEqual(["Home", "Work", "Thinking", "About", "Playground", "Certifications"]);
  });

  it("never lists Contact — the pill, the band and page CTAs carry that path", () => {
    expect(navItems.some((item) => item.href === "/contact")).toBe(false);
  });

  it("every href is a static route and none is on the crawler allow-list", () => {
    for (const item of navItems) {
      expect(STATIC_ROUTES, `${item.href} must be a static route`).toContain(item.href);
    }
    const allowed = (allowlist as unknown[]).map((entry) => JSON.stringify(entry));
    for (const item of navItems) {
      expect(allowed.some((entry) => entry.includes(`"${item.href}"`)), `${item.href} needs no allow-list entry`).toBe(false);
    }
  });
});
