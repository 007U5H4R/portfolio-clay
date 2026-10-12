# TASK-202 report: 3D paper-cut card art (BLOCKED, no site changes)

## Status
Blocked at asset download. No code, manifest, test or asset changes were made.

## What happened
- Higgsfield balance at start: 428.65 credits. Brief budget: about 25.
- Model `gpt_image_2_5`, quality medium, 1k, 16:9: 0.5 credit per image (measured with get_cost).
- A batch of 12 cover prompts hit `429 rate_limit_reached` for 8 of them (not submitted, not charged). Four jobs ran and completed (2 credits):

| Cover | Job id |
|---|---|
| teachspark | 77fca480-0135-4aff-b6b3-334ed015767a |
| velora | 79a5a49d-6b42-4b7a-953c-f06a9dcf51b6 |
| token-toli | aea8d31d-a184-4be7-8c42-3c6b8200e077 |
| campfire-board | a1299880-217d-4cdc-89c1-b0633eff512f |

- The result URLs are on `d8j0ntlcm91z4.cloudfront.net`. Fetching them from this container fails: the egress proxy answers `CONNECT ... 403` (organisation egress policy). Per the proxy README this is not to be retried or routed around, so the generated images could not be pulled into the repo.
- Because nothing could be downloaded, I stopped generating more (to avoid spending credits on art that cannot be shipped) and did not touch the Featured Work layer manifest or its test.

## Needed to continue
Allow the host `d8j0ntlcm91z4.cloudfront.net` for this environment (or provide another way to move Higgsfield outputs into the container), then re-run. The four jobs above can be reused.

## Not done
13 covers, 3 Featured Work layered cards, WebP/AVIF encode and byte report, provenance README, gates, screenshots.
