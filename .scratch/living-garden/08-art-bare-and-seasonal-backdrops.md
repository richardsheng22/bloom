# 08 — Art: the bare backdrop in four seasons

Status: waiting on the owner. Dependencies: none. Used by: 02, 03.

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
