# Art direction: the target

![The target mockup](target-mockup.webp)

The owner generated `target-mockup.webp` on 2026-09-27 by combining the painted garden with the game's drawn style. It is the art target for both screens. It replaces the painterly naturalism pass: in play, that pass felt too photographic, and the garden and the run felt like one static picture shown twice.

## What makes the mockup work

1. **A storybook illustration, not a painting of a photo.** The forms are simplified, with soft warm-brown outlines. The palette is light and pastel: butter, blush, lilac, cornflower and sage. Texture comes from gentle watercolour washes and paper grain, not fine detail. The flowers are simple, readable shapes. The light is airy and warm, not high contrast.
2. **Erwu belongs to it.** She's the same round, charcoal, amber-eyed cat, drawn with the same soft outline and simplified fur as everything else.
3. **A composed place, not objects on grass.** Dense flower borders frame an open sunlit clearing. The fountain is upper left and the log upper right. The borders fade into a cream paper edge with rounded, deckled corners.
4. **One garden on both screens.** The run is the same garden with the flower you play on laid over the clearing, so starting a run feels like leaning in, not changing games.
5. **The game pieces are drawn in the same language:**
   - watercolour petals, white until they bloom pink
   - painted flower targets, with their counts on small round badges
   - parchment buttons and a wooden sign for Continue

## How it stays alive (the part a mockup can't show)

The scene is built in layers, never baked into one picture, so that everything that should move can move:

| Layer | What's in it | Motion |
|---|---|---|
| Garden plate | Lawn, clearing, fountain, log, paper edge; nothing that moves or is arranged | Slow dappled light drifting across the lawn; shimmering water and droplets in the fountain |
| Border and wild clumps | Separate flower clumps along the edges and wherever play grows them | Each clump sways in the wind at its own phase; drawn in horizontal slices shifted by height, so stems bend and roots stay put. The borders fill in as the garden grows, so the lushness is earned. |
| Beds, cushion, sunny stone, rose bed and basket | The arranged pieces, by growth stage | Flowers in beds sway too; blooms open over time |
| Erwu | Poses and the walk | Everything v0.9 does, plus breathing and blinking from the eyes-closed frames |
| Air | Petals, butterflies, pollen motes (existing, restyled) | Drifting |
| Run | The flower you play on, laid over the same plate and clumps | The garden keeps swaying behind the game |

## Prompts

The complete prompts, ready to copy, are in [`PROMPTS.md`](PROMPTS.md). The existing sheets are restyled with the same layout, so the build tool's regions keep fitting; the backdrop, the flower clumps and the play pieces are new.

## What changes in code when the sheets arrive

Most of this can be built and tested with the current art first, and it looks the same whichever sheets arrive:
- the rounded, deckled paper frame around both screens
- the wind system for clumps and bed flowers
- the run drawn over the same garden as the landing page
- watercolour petals filling the existing petal shapes, so hit areas don't change
- round count badges and parchment and wooden-sign buttons, matching the mockup

When the new sheets arrive, `tools/build-art.cjs` rebuilds the atlases. The clump sheet and the plate are new inputs; the layout's fountain and log positions are then taken from the plate.
