# Organisation logos — provenance (TKT-101)

Tushar's decision (2026-09-26): the `/work` Experience timeline shows the **real** company and
institution marks. This is an exception to EVAL-021's "no logos" rule (which governs the generated
illustrations), recorded in `Design.md` §11 Dev-44. He owns the trademark-usage call. The files are
the official artwork from Wikimedia, fetched with `curl` and optimised with `svgo@3` (multipass,
`floatPrecision` 1, or 2 for `godrej.svg`, `removeViewBox` off, `removeDimensions`). Nothing was
redrawn or recoloured. They are served from `public/media/logos/` and mapped in
`components/experience/logos.ts`.

| file (public/media/logos/) | source file page | licence / trademark note (from the file page, 2026-09-26) | bytes | sha256 (first 16) | used as |
|---|---|---|---|---|---|
| `american-express.svg` | https://commons.wikimedia.org/wiki/File:American_Express_logo_(2018).svg | Public domain (text logo), **trademarked**. Author credited as Pentagram Studio | 2,618 | `4ee4f1a6b261ffeb` | American Express logo card, alt "American Express" |
| `godrej.svg` | https://commons.wikimedia.org/wiki/File:Godrej_Logo.svg | Public domain, **trademarked**. Source: Godrej press kit | 34,486 | `ac4c30e19ef59ee3` | Godrej Infotech logo card, alt "Godrej" (the group mark; Commons has no Godrej Infotech-specific file) |
| `nit-calicut.svg` | https://en.wikipedia.org/wiki/File:Correct_Logo_of_NIT_Calicut.svg | **Non-free / fair use**: hosted on English Wikipedia, not on Commons. Copyright NIT Calicut. Wikipedia's fair-use rationale does not license reuse elsewhere. Kept under Tushar's logo decision; **flagged for him** in docs/reports/TKT-101.md (delete the file and its `ORG_LOGOS` entry to fall back to the name in type) | 36,502 | `32236efc8b4a2b81` | NIT Calicut logo card, alt "National Institute of Technology Calicut" |
| `aws.svg` | https://commons.wikimedia.org/wiki/File:Amazon_Web_Services_Logo.svg | Apache License 2.0, **trademarked**. Author: Amazon.com Inc. | 2,015 | `20bfd07f17e9b5c0` | decorative mark in the Shellkode row's collage (`alt=""`, aria-hidden) |
| `google-cloud.svg` | https://commons.wikimedia.org/wiki/File:Google_Cloud_logo.svg | Public domain, **trademarked**. Author: Google | 2,886 | `bfd1af8ee6e70222` | decorative mark in the Quantiphi row's collage (`alt=""`, aria-hidden) |

## No official file found, so the name is set in type

| organisation | searched | result |
|---|---|---|
| Shellkode | Commons file search "Shellkode"; enwiki | no file. The taped label reads "Shellkode" in Fraunces |
| Quantiphi Analytics | Commons file search "Quantiphi"; enwiki | no file. The label reads "Quantiphi Analytics" |
| Bhilai Institute of Technology, Durg | Commons file search "Bhilai Institute of Technology" | only `Bitudaylogo.jpg`, a student-fest logo, not the institute's emblem. The label reads "Bhilai Institute of Technology" |

No logo was invented or redrawn. Shellkode, Quantiphi and BIT Durg can get their official files
later: drop the SVG in `public/media/logos/` and add an `ORG_LOGOS` entry.
