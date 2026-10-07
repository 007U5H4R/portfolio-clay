import { describe, expect, it } from "vitest";
import { buildVCard, CARD_PATH, cardUrl, VCARD_FILENAME } from "@/lib/card/vcard";
import { PII_PATTERNS } from "@/scripts/forbidden-strings";
import { site } from "@/lib/site";

describe("vCard builder (TASK-146.3, EVAL-029)", () => {
  const body = buildVCard();
  const lines = body.split("\r\n").filter(Boolean);

  it("has the required property lines in order", () => {
    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines[1]).toBe("VERSION:3.0");
    for (const key of ["FN:", "N:", "TITLE:", "EMAIL", "URL"]) {
      expect(lines.some((l) => l.startsWith(key)), key).toBe(true);
    }
    expect(lines[lines.length - 1]).toBe("END:VCARD");
  });

  it("sources name, title, email and links from site data", () => {
    expect(body).toContain(`FN:${site.name}`);
    expect(body).toContain("N:Pathak;Tushar;;;");
    expect(body).toContain(`TITLE:${site.title}`);
    expect(body).toContain(site.email);
    expect(body).toContain(site.linkedin);
    expect(body).toContain(site.github);
  });

  it("carries no phone number or date of birth (EXE-27, EVAL-013)", () => {
    expect(body).not.toMatch(/^TEL/im);
    expect(body).not.toMatch(/^BDAY/im);
    expect(PII_PATTERNS.DOB.test(body)).toBe(false);
    expect(PII_PATTERNS.PHONE.test(body)).toBe(false);
  });

  it("uses CRLF line endings and escapes special characters", () => {
    expect(body.endsWith("END:VCARD\r\n")).toBe(true);
    expect(buildVCard({ name: "A, B; C", title: "x\ny" })).toContain("FN:A\\, B\\; C");
    // RFC 6350 §3.4: ";" is escaped as "\;" and every newline form (CRLF, LF, lone CR) as "\n".
    expect(buildVCard({ name: "A", title: "x\ry\r\nz" })).toContain("TITLE:x\\ny\\nz");
  });

  it("targets /card for the QR and names the file", () => {
    expect(CARD_PATH).toBe("/card");
    expect(cardUrl()).toMatch(/\/card$/);
    expect(VCARD_FILENAME).toBe("tushar-pathak.vcf");
  });
});
