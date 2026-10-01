# Art

All the art was generated from written prompts in a painted storybook style. Photos of Erwu were used only as reference and aren't stored here. Older style studies, rejected candidates and superseded sheets are on the `archive/docs-2026-10-01` branch.

## What the game loads

| File | What it is |
|---|---|
| `erwu.webp` | Erwu: 20 poses, her swat and delight, and walks side-on, toward, away and both diagonals |
| `garden.webp` | Garden pieces: beds at each stage, the rose bed in four seasons, the fountain, log, cushion, stones, and every wild-flower clump (summer and seasonal) |
| `play.webp` | The pieces you play with: petals, the flower's centre, pollen, the sun, buds and open flowers, the basket, the seed pod and the dandelion |
| `visitors.webp` | The visitors, the traces they leave, and Erwu's keepsakes |
| `garden-plate-<season>.webp` | The backdrop, one per season |
| `../art-manifest.js` | Where each piece sits in the packed images and where it meets the ground (generated; don't edit) |

If an image can't load, drawn stand-ins take its place. No save data depends on art.

## Sources

`node tools/build-art.cjs` cuts every piece from these sheets (grey background), colour-matches Erwu's walks to her poses, and packs the images above. It uses the `BLOOM_PLAYWRIGHT` / `BLOOM_CHROMIUM` overrides in `tests/README.md`.

| Source | Becomes |
|---|---|
| `erwu-v3/poses.png`, `walk-side.png`, `walk-front.png`, `walk-back.png`, `diag-front-1..8.png`, `diag-back-1..8.png` | Erwu (see `erwu-v3/README.md`) |
| `play-pieces.png` | The play pieces, and Erwu's swat and delight until `erwu-v3/basket-actions.png` exists |
| `garden-pieces-v2.png`, `garden-beds.png`, `garden-clumps.png`, `garden-clumps-seasons.png`, `rose-bed-<season>.png` | The garden |
| `visitors-1.png`, `visitors-2.png`, `keepsakes.png` | Visitors, traces and keepsakes |
| `garden-bare-<season>.webp` | The seasonal backdrops, re-encoded |

The regions on each sheet are set by hand at the top of the tool, because the generated sheets aren't exact grids. The prompts are in `.scratch/art-direction/PROMPTS.md` (the storybook sheets) and `.scratch/living-garden/ART-PROMPTS.md` (the seasonal and visitor sheets).
