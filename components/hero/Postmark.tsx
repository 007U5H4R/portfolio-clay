export type PostmarkProps = {
  className?: string | undefined;
};

/**
 * Postmark stamp (TKT-93, Design.md §11 Dev-21): a circular cancellation mark — outer ring, a dashed
 * lettering ring, the "TP" monogram and four wavy cancellation lines running left of the circle —
 * sitting in the hero banner's top-right corner. One counted decoration, `data-decor="sketch"`,
 * `aria-hidden` (Design.md §3.2 rule 6: a sketch with text must be hidden; "TP" repeats the header
 * monogram and carries no information). The brief's suggested ring words ("TP · BUILD · LEARN") are
 * deliberately not rendered: postmark ring lettering is micro text by nature, and EVAL-008's 14 px
 * content-text floor has no decoration exemption — the dashed ring keeps the texture without the
 * words. Colours come from the tokens in app/globals.css (`.hero-stamp *` — rust ink, multiply blend).
 */
export function Postmark({ className }: PostmarkProps) {
  return (
    <svg
      data-decor="sketch"
      data-sketch="postmark"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 220 128"
      className={["hero-postmark", className].filter(Boolean).join(" ")}
    >
      <circle className="postmark-ring" cx="156" cy="64" r="57" />
      <circle className="postmark-ring postmark-ring-dashed" cx="156" cy="64" r="45" />
      <circle className="postmark-ring postmark-ring-inner" cx="156" cy="64" r="33" />
      <text className="postmark-mono" x="156" y="75" textAnchor="middle">
        TP
      </text>
      <path className="postmark-wave" d="M 6 42 c 11 -7 22 7 33 0 s 22 7 33 0 s 14 4 20 0" />
      <path className="postmark-wave" d="M 4 58 c 11 -7 22 7 33 0 s 22 7 33 0 s 14 4 20 0" />
      <path className="postmark-wave" d="M 6 74 c 11 -7 22 7 33 0 s 22 7 33 0 s 14 4 20 0" />
      <path className="postmark-wave" d="M 10 90 c 11 -7 22 7 33 0 s 22 7 33 0 s 10 4 16 0" />
    </svg>
  );
}
