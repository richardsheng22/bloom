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

## Prompt 1: bare summer backdrop

Attach: `.scratch/art-direction/target-mockup.webp` and `assets/garden-background-v2.png`.

> Redraw the attached garden backdrop (the second image) in EXACTLY the same storybook illustration style, composition, size, viewpoint and paper edge: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, pastel palette (butter yellow, blush pink, lilac, cornflower blue, sage green, cream), warm afternoon light from the upper left, subtle paper grain. NOT photographic, NOT 3D.
>
> Keep the three-tier stone fountain upper left and the fallen log upper right EXACTLY where they are and at the same size. Keep the overhanging leaves at the top and the cream deckled paper edge with rounded corners.
>
> Change only this: remove all the flower borders. Where the borders were, there is now plain, soft lawn that fades into the paper edge, with only a few tufts of longer grass and a scattering of tiny white clover flowers. No flowers around the fountain or the log apart from a little moss. The garden looks young and simple, like a new garden waiting to be planted.
>
> Portrait 9:16. No cat, no basket, no rose bed, no flower beds, no cushion, no stones or stepping stones, no path, no text, no buttons, no frame lines. Highest resolution.

## Prompt 2: spring, autumn and winter versions

Attach: the bare summer backdrop you just made. Run once per season.

> Redraw the attached garden illustration EXACTLY: same composition, same fountain and log in exactly the same places and sizes, same viewpoint, same storybook watercolour style, same paper edge and rounded corners. Change only the season to **[SEASON]**:
> - **Spring:** fresh pale green lawn, a few crocuses and snowdrops in the grass, soft blossom petals drifting from the overhanging branches at the top, cool clear morning light.
> - **Autumn:** the lawn a warmer gold-green, fallen leaves in amber, rust and red scattered on the grass and around the log, the overhanging leaves at the top turning orange and yellow, low warm light.
> - **Winter:** a light, soft layer of snow on the lawn, the fountain's bowls and the log, the grass showing through in places, the overhanging branches at the top bare with a little snow, pale cool light; the fountain is still, with a little ice.
>
> Portrait 9:16. No cat, no basket, no rose bed, no flower beds, no cushion, no stones, no path, no text. Highest resolution.

## Acceptance

- Laid over each other, the fountain and log line up in all four within a few pixels.
- At phone size the four read as their seasons without text.
- The bare summer version, next to the current backdrop, looks clearly emptier but still inviting.
