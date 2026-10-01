# Erwu's art (v3)

Erwu was redrawn from photographs of her (2026-09-29/30), then restyled to the garden's painted storybook look. The sources are in `assets/erwu-v3/`, and `tools/build-art.cjs` packs them into `assets/erwu.webp`. The generation prompts, previews, references and earlier drafts are on the `archive/docs-2026-10-01` branch.

| Source | What it is | In the game |
|---|---|---|
| `poses.png` | 20 poses, in rows of four: sit-front, sit-drowsy, sit-content, curl · sniff, stalk, pounce, stretch · loaf, sit-side, belly-up, yawn · peek, peek-glance, peek-turn, peek-sleepy · look-up, sit-grumpy, lie-side, loaf-side | Cut by hand-set regions, under the same names |
| `walk-side.png` | One side-on stride, two rows of four | 8 frames; mirrored when she faces left |
| `walk-front.png`, `walk-back.png` | Half a stride toward and away from us, four frames, tail centred | The game mirrors them for the other half, so her paws alternate |
| `diag-front-1..8.png`, `diag-back-1..8.png` | One frame each, walking diagonally toward and away (facing right): 1–4 cropped from the drawn stride, 5–8 the same frames with the legs swapped | 8 frames each; mirrored when she faces left |

Every walk is recoloured to the poses sheet and anchored on her torso (on her head when seen straight on), with all frames at one height.

## Still open

- **Swat and delighted poses** still come from the older `play-pieces.png`. Adding `basket-actions.png` here (two chest-high poses, side-on swatting and facing us delighted) is all it takes; the build picks it up.
- **Diagonal frames 5–8** come out about 6% longer than frames 1–4, and a couple clip the tail tip at the image edge. Not noticeable at game size so far.
