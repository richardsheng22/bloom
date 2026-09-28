> **Current art (2026-09-28):** the storybook sheets. See [`.scratch/art-direction/README.md`](../.scratch/art-direction/README.md) for the direction, the prompts and what uses which piece; the notes below describe the earlier painterly pass and the pipeline, which is unchanged apart from the sheet list at the top of `tools/build-art.cjs`.

# Painted art

The garden and Erwu are painted in the **painterly naturalism** direction the owner chose on 2026-09-27, ahead of soft picture book and ink and watercolour. All the images here were generated from written prompts. The photos of Erwu were used only as reference and are not stored in this repository.

## What the game loads

| File | What it is | Size |
|---|---|---|
| `erwu.webp` | 28 frames of Erwu: 20 poses and an 8-frame walk, cut out and packed | about 405 KB |
| `garden.webp` | 16 garden pieces: the rose bed with her basket, the basket on its own, fountain, log, cushion, sunny stone, four stepping stones, a bed at each stage (empty, seedlings, young, flowering), grass and a meadow clump | about 440 KB |
| `garden-lawn.webp` | The owner's painted lawn, feathered into the paper in code | about 345 KB |
| `../art-manifest.js` | Where each frame sits in the packed images, and where it meets the ground | generated |

If an image hasn't loaded yet, or can't be decoded, the drawn garden and drawn Erwu from v0.9 stand in. No save data depends on art.

The run shares the painted world, but not its game pieces. The lawn (under a paper wash), the plants around the flower, and Erwu in her basket are painted. The pieces you play with (petals, buds, pollen, the aim line, numbers) stay crisp and drawn, so they read instantly while you aim.

## Sources and rebuilding

The painted pieces are cut from three generated sheets. Each sheet has a flat light-grey background.

- `erwu-sprite.png`: 1122 × 1402, 20 poses
- `erwu-walk.png`: 1774 × 887, an 8-frame walk facing right
- `garden-pieces.png`: 1254 × 1254, 12 pieces

To rebuild after regenerating a sheet, run:

```sh
node tools/build-art.cjs    # uses the BLOOM_PLAYWRIGHT / BLOOM_CHROMIUM overrides in tests/README.md
```

The tool works in six steps:

1. It sets the background from the median colour of each sheet's border.
2. It builds each pixel's transparency from its colour distance to that background (a 10–38 ramp), and removes the grey from soft edges.
3. It keeps only each piece's own connected pixels. This stops a neighbour's tail tip or a stray speck from getting in.
4. It splits the stepping stones into separate pieces.
5. It trims each piece and packs the pieces into one WebP per group.
6. It records each piece's ground anchor: the bottom centre, or, for walk frames, a point fixed relative to the nose, so the body holds still across the cycle.

The regions and the basket geometry are set by hand at the top of the tool, because the generated sheets aren't exact grids.

## How the game uses them

- **Erwu:**
  - poses: front → `sit-front`, sit → `sit-side`, sniff, crouch → `stalk`, pounce, stretch, loaf, curl, and yawn → `sit-content`
  - scale: one scale for every frame, with her walking length at 2.3 × her size, so she's the same size in every pose
  - facing: side-on poses are painted facing right and flip when she faces left
  - walking: the walk crossfades briefly into the next frame over an opaque one
  - shadow: a soft contact shadow sits under her
- **Her basket:**
  - The rose bed is placed so that its basket sits on her nest.
  - In the basket she curls up, peeks over the rim (hello, sitting, loaf), yawns, and stretches.
  - The front of the basket is redrawn over her, clipped to the rim, so she sits inside it.
- **Beds:**
  - Beds show the painted stage: empty, seedlings (growth under 0.2), young (under 0.55), then flowering.
  - Lavender and daisies have a painted flowering bed. Other kinds flower as drawn plants, a little larger, over the young bed, until they have painted beds of their own.
- **In a run and on the end card:**
  - Erwu sits in the basket on its own. The build lifts it out of the rose bed, keeping the wicker and dropping the leaves, and its front wall is drawn over her.
  - Her moods pick chest-high poses the rim can hide:

    | Mood | Painted pose |
    |---|---|
    | Idle | peek |
    | Blinking | peek-sleepy |
    | Watching the aim, the pollen or a butterfly | peek-glance or peek-turn, flipped to face it |
    | Happy | sit-content |
    | Startled | sit-grumpy |
    | Yawning | yawn |
    | Sleepy (and the end card) | curl |

  - A swat nudges her towards the swat; there is no painted paw swat yet.
- **Lawn:**
  - Wild plants that grow from play appear as painted grass or meadow clumps; mushrooms stay drawn.
  - The meadow at the lawn's edges fills in with painted clumps as the garden grows.

## Known gaps

- Flowering beds are painted only for lavender and daisies. Cosmos and the six rare kinds need their own (a fourth sheet).
- The stone surfaces have a blotchy, jigsaw-like pattern at 1:1. It isn't noticeable at phone size; regenerate if it becomes a problem.
- The painted fountain has no moving water, and the tail doesn't sway while walking.
- Unused poses are ready for later behaviour: belly-up (sunbathing), look-up (watching a butterfly), grumpy, lying on her side, a side-on loaf, a drowsy sit, and three peeks.

## Next sheet: the pieces you play with

This is the prompt for the fourth sheet. It asks for the run's game pieces in the same painterly style as the garden. It also asks for a clean basket, since the one lifted out of the rose bed is missing a few strands where leaves overlapped it.

> Production game asset sheet in EXACTLY the same painterly naturalism style, lighting and palette as the attached garden pieces and cat sheets: soft hand-painted brushwork, warm afternoon light from the upper left, gentle detail. NOT 3D, NOT glossy, NOT vector, NOT pixel art, and no blocky or mosaic textures. Flat plain light grey background (#E6E6E6) everywhere, with no ground, no cast shadows, no text, no grid lines and no borders. Wide empty space around every item; nothing touches or overlaps. Highest resolution.
>
> A grid of 5 columns × 4 rows, one item per cell, each centred:
> - Row 1:
>   1. a single long white daisy petal seen from directly above, softly cupped, with fine veins, lying flat
>   2. the same petal flushed soft pink
>   3. the golden centre of a daisy seen from above, a round disc of tiny florets
>   4. a single glowing golden pollen grain, round and soft
>   5. a round, warm, glowing little sun token, like a golden seed of light
> - Row 2: five small closed flower buds on short stems, all seen from the same gentle three-quarter view as the garden pieces: a tulip bud, a rose bud, a peony bud, a poppy bud and a bellflower bud.
> - Row 3: the same five flowers fully open, same view, same scale.
> - Row 4:
>   1. an empty round wicker basket with a cream tufted cushion, exactly like the one in the rose bed, with no flowers or leaves on or around it
>   2. a dry seed pod
>   3. a fluffy dandelion clock
>   4. the SAME grey cat as the reference, chest-high as if peeking over a basket rim, one front paw raised and swatting to the right
>   5. the same peeking cat with both paws on the rim, eyes wide and delighted

Afterwards, I'll add these to the build tool. The code will keep deciding the colours, so blooming, damage and hit states still work, and the arena's shapes and hit areas stay exactly as they are.

## Earlier explorations (not loaded)

These atlases are kept as art-direction references:
- `erwu-romantic-atlas.png`: the graphite and watercolour naturalist atlas from `31d18e0`
- `erwu-painterly-naturalism-atlas.png`, `erwu-soft-picture-book-atlas.png` and `erwu-ink-watercolor-atlas.png`: the three style studies the owner ranked
