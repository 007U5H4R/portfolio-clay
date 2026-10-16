/**
 * Enterprise Field Journal (TASK-204, EXE-80): every displayed fact traces to `data/enterprise.ts`, every card has art
 * that exists in both themes, the art config holds no facts and stays inside the cutout, and the card's one action is a
 * disclosure (no link, no modal).
 */
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnterpriseClientWork, scopeTags } from "@/components/portfolio/EnterpriseClientWork";
import { enterpriseCases } from "@/data/enterprise";
import { enterpriseArt, enterpriseHeaderArt } from "@/data/enterprise-art";
import { formatRange } from "@/lib/format";

const MEDIA = resolve(process.cwd(), "public/media/enterprise-work");

describe("Enterprise Field Journal cards", () => {
  it("shows, on each face, only the client, program and scope tags of its own record", () => {
    const { container } = render(<EnterpriseClientWork cases={enterpriseCases} />);
    const items = container.querySelectorAll(".ee-item");
    expect(items).toHaveLength(6);
    enterpriseCases.forEach((c, i) => {
      const face = items[i]!.querySelector(".ee-face")!;
      expect(face.querySelector(".ee-client")?.textContent).toBe(c.client);
      expect(face.querySelector(".ee-program")?.textContent).toBe(c.program);
      const shown = [...face.querySelectorAll(".ee-scope > span")].map((s) => s.textContent!.replace(/^ · /, ""));
      expect(shown).toEqual(scopeTags(c));
      for (const tag of shown) expect(c.tags).toContain(tag);
      expect(face.querySelector(".ee-num")?.textContent).toContain(String(i + 1).padStart(2, "0"));
    });
  });

  it("the dossier carries only the record's role, dates, summary, workstreams and tags", () => {
    const { container } = render(<EnterpriseClientWork cases={enterpriseCases} />);
    enterpriseCases.forEach((c, i) => {
      const panel = container.querySelectorAll(".ee-item")[i]!.querySelector(".ee-dossier")!;
      expect(panel.querySelector(".ee-role")?.textContent).toContain(`${c.role} · ${formatRange(c.period)}`);
      expect(panel.querySelector(".ee-summary")?.textContent).toBe(c.summary);
      const streams = [...panel.querySelectorAll(".ee-streams li")].map((li) => [li.querySelector("strong")!.textContent, li.querySelector("span")!.textContent]);
      expect(streams).toEqual(c.workstreams.map((w) => [w.name, w.detail]));
      expect([...panel.querySelectorAll(".ee-tags li")].map((li) => li.textContent)).toEqual(c.tags);
    });
  });

  it("the action is a disclosure button: collapsed by default, one open at a time, no links", () => {
    const { container } = render(<EnterpriseClientWork cases={enterpriseCases} />);
    expect(container.querySelectorAll("a")).toHaveLength(0);
    // the case files' disclosure buttons (the phone carousel's pagination dots are buttons too, TASK-233)
    const buttons = screen.getAllByRole("button").filter((b) => b.classList.contains("ee-open"));
    expect(buttons).toHaveLength(6);
    for (const b of buttons) expect(b).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelectorAll(".ee-dossier:not([hidden])")).toHaveLength(0);
    fireEvent.click(buttons[0]!);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(within(container.querySelectorAll<HTMLElement>(".ee-item")[0]!).getByText("Close case file")).toBeTruthy();
    expect(container.querySelector(".ee-item[data-open]")).not.toBeNull();
    expect(container.querySelectorAll(".ee-dossier:not([hidden])")).toHaveLength(1);
    fireEvent.click(buttons[2]!);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    expect(buttons[2]).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(buttons[2]!);
    expect(container.querySelectorAll(".ee-dossier:not([hidden])")).toHaveLength(0);
  });

  it("activation plays the signature once and clears it again", async () => {
    const { container } = render(<EnterpriseClientWork cases={enterpriseCases} />);
    const item = container.querySelector(".ee-item")!;
    fireEvent.click(item.querySelector("button")!);
    expect(item.hasAttribute("data-play")).toBe(true);
  });
});

describe("Enterprise art (data/enterprise-art.ts)", () => {
  it("has art for every case, in both themes, within the byte budget, and for the header", () => {
    for (const c of enterpriseCases) {
      const art = enterpriseArt[c.id];
      expect(art, c.id).toBeDefined();
      for (const theme of ["light", "dark"]) {
        const file = resolve(MEDIA, art!.dir, `${theme}.webp`);
        expect(existsSync(file), file).toBe(true);
        expect(statSync(file).size, file).toBeLessThan(90 * 1024);
      }
    }
    for (const theme of ["light", "dark"]) expect(existsSync(resolve(MEDIA, enterpriseHeaderArt.dir, `${theme}.webp`))).toBe(true);
    expect(Object.keys(enterpriseArt).sort()).toEqual(enterpriseCases.map((c) => c.id).sort());
  });

  it("keeps every layer, connector and mark inside the cutout, at most one hover part, and no embedded text", () => {
    for (const [id, art] of Object.entries(enterpriseArt)) {
      expect(art.parts.filter((p) => p.hover).length, id).toBe(1);
      for (const { rect } of [...art.parts, ...art.marks]) {
        const [x, y, w, h] = rect;
        expect(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 100.001 && y + h <= 100.001, `${id} ${rect}`).toBe(true);
      }
      expect(art.parts.filter((p) => p.hole).length, id).toBeLessThanOrEqual(1);
      for (const p of art.parts) expect(Math.abs(p.dy) <= 8 && Math.abs(p.dx ?? 0) <= 8, `${id} travel`).toBe(true);
      expect(art.alt).not.toMatch(/\d/);
    }
  });
});
