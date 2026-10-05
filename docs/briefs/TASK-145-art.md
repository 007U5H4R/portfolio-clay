# TASK-145.2 footer ocean art — provenance (M-010 T4)

Model gpt_image_2_5 (flare), quality medium, 2k, transparent background, generated 2026-10-05 ~23:40-23:48 local (UTC 18:10-18:16) by the T4 lane.
Credits: per-job cost not recorded by the first agent (8 jobs, 0 regenerations). Account balance at resume: 557.4. Dark twins were made from the light results (image-to-image recolor).

| Asset | Job id | Source | QA |
|---|---|---|---|
| ship-light | 55fee54a-4fae-4803-8520-36e645d16712 | text prompt, 1:1 | pass: clean silhouette, transparent, paper fibres, cream sails + terracotta hull |
| ship-dark | 86187864-af63-4444-a674-9d817a90f463 | recolor of ship-light | pass: identical silhouette, dusk rust hull |
| wave-back (light) | f2ccb9a7-992c-440b-90ac-6a95ff72ae96 | text prompt, 21:9 | pass: low-amplitude, edges equal height (tiles) |
| wave-mid (light) | 380b9c57-17dd-42de-a5fc-aceb09c9bebe | text prompt, 21:9 | pass: curled crests, edges equal height |
| wave-front (light) | 7c4d7db2-69e1-4941-a5e6-5c31dde776f7 | text prompt, 21:9 | pass: bold crest, cream ribbon edge |
| wave-back-dark | 04d7f20b-c72a-454b-b74d-9ae10c3a7c6b | recolor of wave-back | pass (dusky violet-blue, slightly purple; accepted) |
| wave-mid-dark | 9875233b-6617-4eba-9129-32ab899a0bd2 | recolor of wave-mid | pass |
| wave-front-dark | 8071bdeb-523a-4aa1-9c4c-25549bd34fcc | recolor of wave-front | pass: deep navy |

Prompts: see the Higgsfield generation history for these job ids (all end "no text, no gloss, no watermark; transparent background above the wave only").
Optimisation: alpha-cropped to the content box, resized to 1800 px wide (waves) / 640 px wide (ships), WebP into public/footer-ocean/ (~380 KB total, 8 files). Originals (PNG) in Portfolio-illustration/illustrations/paper-cut/chrome/.
Seam check: left-edge and right-edge crest heights are equal in every wave strip (rows 14/59/100 and dark twins), so each strip tiles horizontally.
