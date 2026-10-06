# Organisation logos — provenance (TKT-101)

Tushar's decision (2026-09-26): the `/work` Experience timeline shows the **real** company and
institution marks. This is an exception to EVAL-021's "no logos" rule (which governs the generated
illustrations), recorded in `Design.md` §11 Dev-92. He owns the trademark-usage call. The files are
the official artwork from Wikimedia, fetched with `curl` and optimised with `svgo@3` (multipass,
`floatPrecision` 1, or 2 for `godrej.svg`, `removeViewBox` off, `removeDimensions`). Nothing was
redrawn or recoloured. They are served from `public/media/logos/` and mapped in
`components/experience/logos.ts`.

| file (public/media/logos/) | source file page | licence / trademark note (from the file page, 2026-09-26) | bytes | sha256 (first 16) | used as |
|---|---|---|---|---|---|
| `american-express.svg` | https://commons.wikimedia.org/wiki/File:American_Express_logo_(2018).svg | Public domain (text logo), **trademarked**. Author credited as Pentagram Studio | 2,618 | `4ee4f1a6b261ffeb` | American Express logo card, alt "American Express" |
| `godrej.svg` | https://commons.wikimedia.org/wiki/File:Godrej_Logo.svg | Public domain, **trademarked**. Source: Godrej press kit | 34,486 | `ac4c30e19ef59ee3` | Godrej Infotech logo card, alt "Godrej" (the group mark; Commons has no Godrej Infotech-specific file) |
| `nit-calicut.svg` | https://en.wikipedia.org/wiki/File:Correct_Logo_of_NIT_Calicut.svg | **Non-free / fair use**: hosted on English Wikipedia, not on Commons. Copyright NIT Calicut. Wikipedia's fair-use rationale does not license reuse elsewhere. **Fair-use file kept at Tushar's direction 2026-09-26** ("Keep the NIT Calicut logo"). To drop it later: delete the file and its `ORG_LOGOS` entry to fall back to the name in type | 36,502 | `32236efc8b4a2b81` | NIT Calicut logo card, alt "National Institute of Technology Calicut" |
| `aws.svg` | https://commons.wikimedia.org/wiki/File:Amazon_Web_Services_Logo.svg | Apache License 2.0, **trademarked**. Author: Amazon.com Inc. | 2,015 | `20bfd07f17e9b5c0` | decorative mark in the Shellkode row's collage (`alt=""`, aria-hidden) |
| `google-cloud.svg` | https://commons.wikimedia.org/wiki/File:Google_Cloud_logo.svg | Public domain, **trademarked**. Author: Google | 2,886 | `bfd1af8ee6e70222` | decorative mark in the Quantiphi row's collage (`alt=""`, aria-hidden) |

## Supplied by Tushar (TASK-153, 2026-10-06)

Shellkode, Quantiphi and Bhilai Institute of Technology, Durg have no file on Wikimedia Commons (searched
2026-09-26, see below). Tushar supplied their official logo files on 2026-10-06 ("update the logo of Shellkode,
Quantiphi and Bhilai Institute of Technology Durg in the Experience tab … enhance the quality"). Processing,
all in Python/Pillow, nothing redrawn or recoloured: the white canvas is turned transparent with a colour-to-alpha
pass (keeps anti-aliased edges), trimmed to the mark with a few px of margin, and sized for ~3× the logo card
(max 170 × 132 CSS px). BIT Durg's source is a 200 × 200 JPEG, so it was median-denoised, upscaled 2× with
Lanczos and lightly sharpened before the alpha pass (the Recraft AI upscaler was unavailable that day — re-run a
crisp AI upscale from the source if a sharper version is wanted). Its triangles' soft white highlights become
partly transparent; the logo always sits on a light backing (light card, or the dark-mode paper label), where it
reads as the original. Originals: `/Volumes/E Drive/Dev/.scratch/logos/*-src.*`.

| file (public/media/logos/) | source (Tushar's file) | processing | size (px) | bytes | sha256 (first 16) | used as |
|---|---|---|---|---|---|---|
| `shellkode.webp` | `shellcode-private-limited@3x.png` (2520 × 1080) | white → alpha, trim, 510 w, lossless WebP | 510 × 86 | 12,784 | `d40533ddf96e1960` | Shellkode logo card, alt "Shellkode" |
| `quantiphi.webp` | `quantiphi-inc-logo-vector.png` (900 × 500) | white → alpha, trim, 510 w, lossless WebP | 510 × 95 | 10,160 | `f3fc118742f82854` | Quantiphi logo card, alt "Quantiphi" |
| `bit-durg.webp` | `1631339146254.jpeg` (200 × 200) | denoise, 2× Lanczos, sharpen, white → alpha, trim, WebP q90 | 412 × 408 | 59,928 | `de038b9e73041ea1` | BIT Durg logo card, alt "Bhilai Institute of Technology, Durg" |

In dark mode the logo cards turn navy, which would bury dark marks; every `.ct-logo-img` gets its own light
paper label there (`globals.css`, the same move as the certification badges).

## Searched on Wikimedia (2026-09-26) — no official file


| organisation | searched | result |
|---|---|---|
| Shellkode | Commons file search "Shellkode"; enwiki | no file. The taped label reads "Shellkode" in Fraunces |
| Quantiphi Analytics | Commons file search "Quantiphi"; enwiki | no file. The label reads "Quantiphi Analytics" |
| Bhilai Institute of Technology, Durg | Commons file search "Bhilai Institute of Technology" | only `Bitudaylogo.jpg`, a student-fest logo, not the institute's emblem. The label reads "Bhilai Institute of Technology" |

No logo was invented or redrawn; the three above now use Tushar's supplied files.
