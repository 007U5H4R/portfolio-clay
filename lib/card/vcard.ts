import { siteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

/** The public card page the QR points at (card-updated.md §9). */
export const CARD_PATH = "/card";
export const VCARD_PATH = "/card/vcard";
export const VCARD_FILENAME = "tushar-pathak.vcf";

/** `${siteUrl()}/card` — the QR payload (EVAL-029). */
export function cardUrl(): string {
  return `${siteUrl()}${CARD_PATH}`;
}

const esc = (v: string) =>
  v.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\;").replace(/,/g, "\\,");

export interface VCardInput {
  name?: string;
  title?: string;
  email?: string;
}

/**
 * vCard 3.0 for the card's "Save contact". Name, title, email and public links only, all from
 * `lib/site` — never a phone number or a date of birth (EXE-27, EVAL-013).
 */
export function buildVCard(input: VCardInput = {}): string {
  const name = input.name ?? site.name;
  const title = input.title ?? site.title;
  const email = input.email ?? site.email;
  const [first = "", ...rest] = name.split(" ");
  const last = rest.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(name)}`,
    `N:${esc(last)};${esc(first)};;;`,
    `TITLE:${esc(title)}`,
    `EMAIL;TYPE=INTERNET:${esc(email)}`,
    `URL:${siteUrl()}`,
    `URL;TYPE=LinkedIn:${site.linkedin}`,
    `URL;TYPE=GitHub:${site.github}`,
    "END:VCARD",
  ];
  return lines.join("\r\n") + "\r\n";
}
