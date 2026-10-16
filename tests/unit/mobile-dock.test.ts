import { describe, expect, it } from "vitest";
import { navItems } from "@/lib/nav";
import { activeDockHref, dockItems } from "@/lib/mobile-dock";

describe("mobile dock (TASK-224)", () => {
  it("has the six destinations in order, reusing the site's existing routes", () => {
    expect(dockItems.map((i) => i.label)).toEqual(["Home", "Xp", "Portfolio", "About", "Certs", "Tushky"]);
    const routes = new Set(navItems.map((i) => i.href));
    for (const item of dockItems) if (item.kind === "link") expect(routes.has(item.href), item.href).toBe(true);
    expect(dockItems.filter((i) => i.kind === "ask")).toHaveLength(1);
  });

  it("marks the exact route current, and Portfolio for project detail pages", () => {
    expect(activeDockHref("/")).toBe("/");
    expect(activeDockHref("/work")).toBe("/work");
    expect(activeDockHref("/work/")).toBe("/work");
    expect(activeDockHref("/work/teachspark")).toBe("/projects");
    expect(activeDockHref("/projects")).toBe("/projects");
    expect(activeDockHref("/about")).toBe("/about");
    expect(activeDockHref("/certifications")).toBe("/certifications");
  });

  it("marks nothing on routes outside the dock", () => {
    expect(activeDockHref("/contact")).toBeUndefined();
    expect(activeDockHref("/thinking")).toBeUndefined();
    expect(activeDockHref(null)).toBeUndefined();
  });
});
