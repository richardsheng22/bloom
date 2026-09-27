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

The quickest way to keep what already works is to restyle the existing sheets with the same layout. The build tool's hand-set regions then still fit, and the code needs few changes. Attach the mockup as the style reference to every prompt.

Shared style paragraph (add to every prompt):

> Style: EXACTLY the storybook illustration style of the attached mockup: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, pastel palette (butter yellow, blush pink, lilac, cornflower blue, sage green, cream), warm afternoon light from the upper left, subtle paper grain. NOT photographic, NOT 3D, NOT glossy, no fine photographic fur or stone detail, no blocky or mosaic textures.

1. **Erwu poses:** attach `assets/erwu-sprite.png` and the mockup.
   > Redraw the attached sprite sheet in the style of the attached mockup. Keep EVERY pose, the same number of poses, each pose in the same position and at the same size on the sheet, and the same flat plain light grey background (#E6E6E6), with no ground and no shadows. The same round charcoal-grey cat with amber-gold eyes, drawn like the cat in the mockup. Highest resolution. [style paragraph]
2. **Erwu walk:** attach `assets/erwu-walk.png` and the mockup. Use prompt 1's text with "sprite sheet" read as "8-frame walk cycle". Add:
   > Keep each frame's feet on the same line and the body at the same height, so the frames still loop.
3. **Garden pieces:** attach `assets/garden-pieces.png` and the mockup.
   > Redraw the attached sheet of garden pieces in the style of the attached mockup. Keep every piece in the same position and at the same size, on the same flat light grey background (#E6E6E6), with nothing touching. Smooth painted stone (no mosaic pattern). [style paragraph]
   - Optional: the mockup's bottom-right bed is a wooden planter. If you prefer that to the round stone beds, ask for the four bed stages as wooden planters instead.
4. **Garden plate:** attach the mockup.
   > A portrait 9:16 garden scene in the style and composition of the left half of the attached mockup, but EMPTY in the middle. No cat, no basket, no rose bed, no flower beds, no cushion, no stones or stepping stones, no text, no buttons. A three-tier stone fountain in the upper left, and a fallen mossy log in the upper right a little lower than the fountain. Dense flower borders only along the left, right and bottom edges. A wide, open, sunlit lawn clearing filling the middle 65% of the picture. Everything fades into cream deckled paper with rounded corners at every edge. Highest resolution. [style paragraph]
5. **Border and growth clumps:** attach the mockup.
   > A sheet of 16 separate flower clumps, 4 × 4, on a flat plain light grey background (#E6E6E6), with wide space between them and no ground or shadows. Each clump stands upright with its roots at the bottom, seen from the same gentle three-quarter view as the mockup: white daisies, forget-me-nots, pink cosmos, lavender, white clover, buttercups, foxgloves, bluebells, a small pink rose bush, a fern, a tuft of long grass, a trio of little mushrooms, a mixed wildflower tuft, pale pink sweet peas, cornflowers, and a low leafy tuft. [style paragraph]
6. **Play pieces:** the sheet in `assets/README.md` ("Next sheet"), with the shared style paragraph in place of its first paragraph, and the mockup attached. Its petals should look like the run in the mockup: a white watercolour petal, and the same petal in pink.

## What changes in code when the sheets arrive

Most of this can be built and tested with the current art first, and it looks the same whichever sheets arrive:
- the rounded, deckled paper frame around both screens
- the wind system for clumps and bed flowers
- the run drawn over the same garden as the landing page
- watercolour petals filling the existing petal shapes, so hit areas don't change
- round count badges and parchment and wooden-sign buttons, matching the mockup

When the new sheets arrive, `tools/build-art.cjs` rebuilds the atlases. The clump sheet and the plate are new inputs; the layout's fountain and log positions are then taken from the plate.
