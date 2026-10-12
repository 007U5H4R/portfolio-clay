/** mobile < 768 ≤ tablet < 1024 ≤ desktop, by viewport width (documented in docs/analytics.md). */
export function deviceTypeFor(width: number): "mobile" | "tablet" | "desktop" {
  return width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
}
