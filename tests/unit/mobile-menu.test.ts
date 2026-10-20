import { describe, expect, it } from "vitest";
import { activeMenuHref, menuGroups } from "@/lib/mobile-menu";
import { dockItems } from "@/lib/mobile-dock";
import { site } from "@/lib/site";

describe("mobile menu (TASK-232)", () => {
  it("has exactly the Portfolio and Connect groups in the briefed order", () => {
    expect(menuGroups.map((g) => g.label)).toEqual(["Portfolio", "Connect"]);
    expect(menuGroups[0]!.items.map((i) => i.label)).toEqual(["Home", "Experience", "Portfolio", "Ask Tushky", "About", "Certifications"]);
    expect(menuGroups[1]!.items.map((i) => i.label)).toEqual(["Let's connect", "LinkedIn", "GitHub", "Resume"]);
  });

  it("drops Product thinking and Gummy Lab from the drawer only", () => {
    const hrefs = menuGroups.flatMap((g) => g.items).map((i) => ("href" in i ? i.href : ""));
    expect(hrefs).not.toContain("/thinking");
    expect(hrefs).not.toContain("/lab");
  });

  it("Ask Tushky opens the drawer (no route) with its subtitle; LinkedIn is the site URL, external", () => {
    const ask = menuGroups[0]!.items.find((i) => i.kind === "ask");
    expect(ask).toMatchObject({ label: "Ask Tushky", hint: "Questions about my work" });
    const li = menuGroups[1]!.items[1];
    expect(li).toMatchObject({ href: site.linkedin, external: true });
  });

  it("reuses the dock's icons so the dock and drawer match", () => {
    const dockIcons = new Set(dockItems.map((i) => i.icon));
    for (const item of menuGroups[0]!.items) expect(dockIcons.has(item.icon), item.label).toBe(true);
  });

  it("marks the current route, including /contact and project details under Portfolio", () => {
    expect(activeMenuHref("/work")).toBe("/work");
    expect(activeMenuHref("/work/teachspark")).toBe("/projects");
    expect(activeMenuHref("/contact")).toBe("/contact");
    expect(activeMenuHref("/lab")).toBeUndefined();
  });
});
