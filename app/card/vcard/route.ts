import { buildVCard, VCARD_FILENAME } from "@/lib/card/vcard";

export const dynamic = "force-static";

/** "Save contact": a vCard attachment — name, title, email and public links only (EXE-27). */
export function GET() {
  return new Response(buildVCard(), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${VCARD_FILENAME}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
