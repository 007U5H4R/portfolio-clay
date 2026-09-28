import { describe, expect, it } from "vitest";
import faqData from "@/data/tushky/faq.json";
import { experience } from "@/data/experience";
import { FaqCacheProvider, type FaqEntry } from "@/lib/ask/faq";
import { LIVE_SOURCE_DATA, faqFreshness, freshFaqIds, groupVersions, profileVersionFor } from "@/lib/ask/faq-versions";
import type { AnswerProvider } from "@/lib/ask/adapter";

/**
 * TASK-123 (FAQ-cache spec §51): cached answers are tied to a hash of the data they were written from.
 *
 * The first test is the CI tripwire: when someone changes `data/*` (or `lib/site.ts`) without refreshing
 * the FAQ, it FAILS and names every stale answer. Those answers are already not being served (they fall
 * through to the index), so the site stays correct — this makes the gap visible so it gets fixed.
 */
const FAQ = faqData as FaqEntry[];

describe("TASK-123 FAQ versioning", () => {
  it("every cached answer matches the current data (otherwise: refresh or review + --stamp)", () => {
    const { stale } = faqFreshness(FAQ);
    const report = stale
      .map((s) => `  STALE ${s.id} — depends on ${s.dependsOn.join(", ")} (stored ${s.stored}, data now ${s.current})`)
      .join("\n");
    expect(
      stale,
      `${stale.length} FAQ answer(s) no longer match the data and are NOT being served:\n${report}\n` +
        "Fix: pnpm exec tsx scripts/tushky-faq-refresh.ts --check, then redraft (Gemini) and --apply, " +
        "or re-read the answer against the data, edit it by hand, and --stamp <id>.",
    ).toEqual([]);
  });

  it("UPDATED PROFILE (§65): changing the current role invalidates current-role — and it is no longer served", async () => {
    const changed = {
      ...LIVE_SOURCE_DATA,
      experience: experience.map((r) => (r.id === "amex" ? { ...r, title: "Director of Product" } : r)),
    };
    const before = freshFaqIds(FAQ);
    const after = freshFaqIds(FAQ, changed);
    expect(before).toContain("current-role");
    expect(after).not.toContain("current-role");
    // Every entry that depends on `experience` goes stale; nothing else does.
    const dependsOnExperience = FAQ.filter((e) => e.dependsOn.includes("experience")).map((e) => e.id);
    expect(before.filter((id) => !after.includes(id)).sort()).toEqual(dependsOnExperience.sort());

    let fellThrough = 0;
    const fallback: AnswerProvider = {
      name: "index",
      ask: () => {
        fellThrough++;
        return Promise.resolve({ kind: "empty", text: "fallback", evidence: [], matched: [], suggestions: [] });
      },
    };
    const provider = new FaqCacheProvider(FAQ, fallback, { fresh: after });
    const answer = await provider.ask("What is his current role?");
    expect(fellThrough).toBe(1);
    expect(answer.kind).toBe("empty");
  });

  it("a change to one project invalidates only the answers that depend on it", () => {
    const changed = {
      ...LIVE_SOURCE_DATA,
      projects: LIVE_SOURCE_DATA.projects.map((p) => (p.slug === "railcite" ? { ...p, statusLabel: "Archived" } : p)),
    };
    const after = new Set(freshFaqIds(FAQ, changed));
    for (const e of FAQ) {
      const affected = e.dependsOn.includes("project:railcite") || e.dependsOn.includes("projects");
      expect(after.has(e.id), e.id).toBe(!affected);
    }
  });

  it("profileVersion is deterministic and rejects unknown dependency groups", () => {
    const v = groupVersions();
    expect(profileVersionFor(["experience", "profile"], v)).toBe(profileVersionFor(["profile", "experience"], v));
    expect(profileVersionFor(["experience"], v)).toMatch(/^v1-[0-9a-f]{12}$/);
    expect(() => profileVersionFor(["experiance"], v)).toThrow(/unknown FAQ dependency group/);
  });
});
