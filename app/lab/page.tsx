import type { Metadata } from "next";
import { LabLoader } from "@/components/lab/LabLoader";

/**
 * Gummy Lab (TASK-143, S30): the hidden "Keep the Gummy Alive" game. Reached only by five quick
 * clicks on the header name / TP monogram — never linked, never in the sitemap, `noindex` (but NOT
 * disallowed in robots.txt: a crawler must be able to fetch the page to read the noindex). The page
 * itself is a static server shell; the whole game (three.js, R3F, rapier) is a dynamic import inside
 * `LabLoader`, so no other route's first-load set contains any of it (EVAL-027).
 */
export const metadata: Metadata = {
  title: "Gummy Lab",
  description: "Keep the gummy alive.",
  robots: { index: false },
};

export default function LabPage() {
  return <LabLoader />;
}
