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
