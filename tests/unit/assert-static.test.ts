import { describe, expect, it } from "vitest";
import { checkStatic, DYNAMIC_ROUTE_ALLOWLIST } from "@/scripts/assert-static";

/**
 * TASK-134 (Design.md §11 Dev-128) — the SSG guarantee with the site's first server functions:
 * exactly `/api/tushky/speech` and the dev-only `/api/dev/tushky-voice` may run at request time.
 * Every page must still be prerendered, and any other dynamic route handler fails the build.
 */
const appRoutes = {
  "/page": "/",
  "/about/page": "/about",
  "/work/[slug]/page": "/work/[slug]",
  "/_not-found/page": "/_not-found",
  "/robots.txt/route": "/robots.txt",
  "/api/tushky/speech/route": "/api/tushky/speech",
  "/api/dev/tushky-voice/route": "/api/dev/tushky-voice",
};
const prerender = { routes: { "/": {}, "/about": {}, "/robots.txt": {} }, dynamicRoutes: { "/work/[slug]": {} } };

describe("assert-static (TP1 + TASK-134)", () => {
  it("the allow-list is exactly the speech route and the dev audition route", () => {
    expect([...DYNAMIC_ROUTE_ALLOWLIST].sort()).toEqual(["/api/dev/tushky-voice", "/api/tushky/speech"]);
  });

  it("passes a build whose only dynamic entries are the two allow-listed handlers", () => {
    const result = checkStatic(appRoutes, prerender);
    expect(result.dynamicPages).toEqual([]);
    expect(result.dynamicHandlers).toEqual([]);
    expect(result.allowedHandlers.sort()).toEqual(["/api/dev/tushky-voice", "/api/tushky/speech"]);
    expect(result.pages).toEqual(["/", "/about", "/work/[slug]"]);
  });

  it("fails any dynamic page — the allow-list never covers a page", () => {
    const result = checkStatic({ ...appRoutes, "/contact/page": "/contact", "/api/tushky/speech/page": "/api/tushky/speech" }, prerender);
    expect(result.dynamicPages.sort()).toEqual(["/api/tushky/speech", "/contact"]);
  });

  it("fails any other dynamic route handler", () => {
    const result = checkStatic({ ...appRoutes, "/api/other/route": "/api/other", "/sitemap.xml/route": "/sitemap.xml" }, prerender);
    expect(result.dynamicHandlers.sort()).toEqual(["/api/other", "/sitemap.xml"]);
  });
});
