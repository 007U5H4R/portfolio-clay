# Paper World layer art — provenance (EVAL-021 / EVAL-034)

Every file here is a layer of a layered paper scene (Design.md §14.5). Masters, prompts and job ids live in
`Portfolio-illustration/illustrations/paper-world/<scene>/README.md` (outside the repo, like the M-010 masters).
Encoding: `/Volumes/E Drive/Dev/.scratch/m011/tools/encode.py` (transforms baked in; WebP q70, alpha q80; desktop 2400 px, mobile 1280 px).

| File | Scene | Layer | Depth | Theme | Model | Job id (final) | Source composite | Light twin |
|---|---|---|---|---|---|---|---|---|
| hero-home/hero-home-bg[-mobile].webp | hero-home | bg | .05 | light | gpt_image_2_5 | 8e026bb0-d343-4da9-b002-9530a98b1fe0 | paper-cut/hero-banner-light.png | — |
| hero-home/hero-home-subject[-mobile].webp | hero-home | subject | .22 | light | gpt_image_2_5 + remove_background | 81849031-5b6b-4ee8-a098-3cb134cc0b1c | paper-cut/hero-banner-light.png | — |
| hero-home/hero-home-fg[-mobile].webp | hero-home | fg | .40 | light | gpt_image_2_5 + remove_background | 34be5da3-8200-49af-8ac5-ee8e4dffc414 | paper-cut/hero-banner-light.png | — |
| hero-home/hero-home-details[-mobile].webp | hero-home | details | .60 | light | gpt_image_2_5 + local key | 77625d99-37fd-45f7-8e9c-4bc3d355275d | paper-cut/hero-banner-light.png | — |
| hero-home/hero-home-bg-dark[-mobile].webp | hero-home | bg | .05 | dark | gpt_image_2_5 | 26a8397b-f9b0-46d9-8db9-0a4c7c9d65a3 | paper-cut/hero-banner-dark.png | hero-home-bg |
| hero-home/hero-home-subject-dark[-mobile].webp | hero-home | subject | .22 | dark | gpt_image_2_5 + remove_background | 9ca163e0-f46c-4133-9e39-faed73281370 | paper-cut/hero-banner-dark.png | hero-home-subject |
| hero-home/hero-home-fg-dark[-mobile].webp | hero-home | fg | .40 | dark | gpt_image_2_5 + local key | dff1650e-1062-41d2-ace3-392517d733ae | paper-cut/hero-banner-dark.png | hero-home-fg |
| hero-home/hero-home-details-dark[-mobile].webp | hero-home | details | .60 | dark | gpt_image_2_5 + local key | 1efe7b1e-2692-4fbd-8a4b-57967fb34589 | paper-cut/hero-banner-dark.png | hero-home-details |

# Paper World layered scenes — provenance
Masters: `Portfolio-illustration/illustrations/paper-world/<scene>/` (README.md + PROMPTS.md there hold job ids and QA). Encoded by `.scratch/m011/tools/encode.py` (desktop 2400 px, mobile 1280 px, q70).

| Manifest id | Layers (depth) | Source scene | Credits | Task |
|---|---|---|---|---|
| scene-work | bg .05, mid .22, fg .40 (light + dark) | portfolio, origami-miniature composite (S32) | 8 | TASK-158.1 |
| scene-certifications | bg .05, mid .22, fg .40 (light + dark) | certifications, origami-miniature composite (S32) | 9 | TASK-158.2 |
| scene-experience | bg .05, subject .22, fg .40, details .60 (light + dark) | experience | 13.5 | TASK-158.3 |
| scene-about | bg .05, subject .22, fg .40 (light + dark) | about | 16.5 (incl. 6 for gate-fix regen of bg + fg) | TASK-158.4 |
| scene-contact | bg .05, subject .22, fg .40 (light + dark) | contact | 10.5 | TASK-158.5 |
| scene-thinking | bg .05, mid .22, fg .40 (light + dark) | thinking | 8.25 | TASK-158.6 |
| scene-playground | bg .05, subject .22, fg .40 (light + dark) | playground | 13.75 | TASK-158.6 |

Gate fix round (2026-10-06): scene-work/certifications/contact/thinking re-keyed with key.py v2 (soft cast shadows); scene-work house-wall scribbles painted out; scene-certifications left-edge fringe eroded; scene-thinking-dark star blob erased; scene-about bg + fg regenerated (hill/trail in bg, ground lowered to the shins); scene-playground subject dy -60.
