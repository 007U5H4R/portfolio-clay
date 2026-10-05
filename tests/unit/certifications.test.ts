import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { certifications, featuredCertifications, otherCertifications } from "@/data/certifications";

/**
 * TKT-102 — `data/certifications.ts` shape + truth rules (certifications-spec.md): one reusable
 * array, newest first; every credential URL is an INDIVIDUAL Credly credential (never the profile);
 * every badge file exists and stays small; only the five certifications in Tushar's reference carry
 * an "applied" note (nothing invented for the rest).
 */
const CREDENTIAL_URL = /^https:\/\/www\.credly\.com\/badges\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("data/certifications", () => {
  it("lists all 22 Credly badges, each with the full field set", () => {
    expect(certifications).toHaveLength(22);
    for (const c of certifications) {
      expect(c.name.trim(), c.slug).not.toBe("");
      expect(c.issuer.trim(), c.slug).not.toBe("");
      expect(c.issued, c.slug).toMatch(ISO_DATE);
      expect(c.year, c.slug).toBe(c.issued.slice(0, 4));
      if (c.expires !== null) expect(c.expires, c.slug).toMatch(ISO_DATE);
      expect(["certification", "skill-badge"]).toContain(c.kind);
      expect(Array.isArray(c.skills)).toBe(true);
      expect(c.applied === null || c.applied.trim().length > 0).toBe(true);
    }
  });

  it("links every card to its own Credly credential — never the profile URL, never twice", () => {
    for (const c of certifications) {
      expect(c.credentialUrl, c.slug).toMatch(CREDENTIAL_URL);
      expect(c.credentialUrl).not.toContain("/users/");
    }
    expect(new Set(certifications.map((c) => c.credentialUrl)).size).toBe(certifications.length);
    expect(new Set(certifications.map((c) => c.slug)).size).toBe(certifications.length);
  });

  it("is sorted newest first", () => {
    const dates = certifications.map((c) => c.issued);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("serves every badge from public/media/certifications as a small WebP", () => {
    for (const c of certifications) {
      expect(c.badge, c.slug).toBe(`/media/certifications/${c.slug}.webp`);
      const file = join(process.cwd(), "public", c.badge);
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeLessThanOrEqual(20_000);
    }
  });

  it("annotates exactly the five certifications in Tushar's reference", () => {
    expect(featuredCertifications.map((c) => c.slug).sort()).toEqual(
      ["gcp-generative-ai-leader", "gcp-professional-cloud-architect", "pmp", "pspo-i", "safe-6-agilist"].sort(),
    );
    for (const c of featuredCertifications) expect(c.skills.length, c.slug).toBeGreaterThan(0);
    expect(otherCertifications.every((c) => c.applied === null)).toBe(true);
    expect(featuredCertifications.length + otherCertifications.length).toBe(certifications.length);
  });
});
