/**
 * Stage 12 RCA3 (L-07, TASK-317): Ask Tushky is deterministic (decision S7) — it only knows what was written for it. On
 * 2026-10-21 "Tell me about Slag City" hit the fallback because 7 of 10 listed products had no answer of their own. Every
 * listed product must have a cached "Tell me about <name>" answer that names it; a product added to `data/projects.ts`
 * without one fails here.
 */
import { describe, expect, it } from "vitest";
import faqData from "@/data/tushky/faq.json";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";
import { compileFaq, lookupFaq, type FaqEntry } from "@/lib/ask/faq";

const entries = faqData as FaqEntry[];
const compiled = compileFaq(entries);
const fresh = new Set(entries.map((e) => e.id));
const listed = projects.filter(isListed);

describe("Tushky product coverage (RCA3)", () => {
  it("covers at least the ten listed products", () => {
    expect(listed.length).toBeGreaterThanOrEqual(10);
  });
  for (const project of listed) {
    it(`"Tell me about ${project.name}." is a cached answer that names the product`, () => {
      const hit = lookupFaq(compiled, `Tell me about ${project.name}.`, fresh);
      expect(hit.kind, `${project.name} has no cached answer`).toBe("hit");
      if (hit.kind === "hit") expect(hit.entry.answer.toLowerCase()).toContain(project.name.toLowerCase().replace(/^the /, "").split(" ")[0]);
    });
  }
});
