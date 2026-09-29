# 08 — Art: the bare backdrop in four seasons

Status: done (2026-09-29), including the seasonal rose beds.

## What's needed

Four versions of one garden backdrop: the same composition as `assets/garden-background-v2.png`, with the flower borders removed, in spring, summer, autumn and winter. The fountain and log must stay in exactly the same places in all four, because the layout reads their positions from the plate.

Generate the summer version first, then make the other three from it with image-to-image (attach the summer version and ask only for the season to change).

## Files

Put them in `assets/` as:
- `garden-bare-summer.png`
- `garden-bare-spring.png`
- `garden-bare-autumn.png`
- `garden-bare-winter.png`

Then `tools/build-art.cjs` packs them (a follow-up adds them to the build and the manifest as `plate-bare-<season>`).

## Prompts and reference material

The complete, copy-ready prompts, the files to attach and why, and the output names are in [ART-PROMPTS.md](ART-PROMPTS.md) (images 1, 2a, 2b and 2c).

## Acceptance

- Laid over each other, the fountain and log line up in all four within a few pixels.
- At phone size the four read as their seasons without text.
- The bare summer version, next to the current backdrop, looks clearly emptier but still inviting.

## Implementation record — 2026-09-29

- The owner generated all four; each is 941 × 1672, and the fountain and log stand exactly on the positions the layout already uses (`ART.lawn.fountain` and `.log`), so the layout is unchanged.
- Sources are `assets/garden-bare-<season>.webp`; `tools/build-art.cjs` writes `assets/garden-plate-<season>.webp` (390–480 KB each) and `ART.lawn.seasons`. The old lush `garden-plate.webp` is retired; its source stays in `assets/`.
- The game loads the real season's backdrop, and in a season's last week the next one too, blending toward it. The stand-in wash and the season light grading are skipped with the seasonal backdrops, which carry their own light.
- The lawn-edge border now grows with the garden (4 + 7 per tier clumps, flowering in their months), so a month-old garden is framed by drifts where day one is bare lawn.
- Remaining: the rose bed around Erwu's basket blooms all year (a single painted piece), which looks wrong in winter and early spring. Image 7 in ART-PROMPTS.md asks for spring, autumn and winter versions.

## Seasonal rose beds — 2026-09-29

- `rose-bed-spring/autumn/winter.png` are packed into `garden.webp` at 0.37 scale. Their baskets were fitted by the wicker's outline, calibrated on the summer bed (within a few pixels of its known basket); winter's snowy rim was set by hand. `ART.garden.baskets` holds each basket in its own frame's pixels.
- `roseBedPlacement` scales each season's bed so its basket matches the summer basket exactly, so Erwu sits in the same place all year; `clipBasket` draws the front wall from the same season's bed. The season switches half-way through the last week's blend.
