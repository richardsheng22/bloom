# Art prompts for the living garden

Every image the living garden uses: the bare seasonal backdrops, the rose bed in three seasons, the seasonal clumps, the visitors and the keepsakes. All of them are generated and in the game; the prompts are kept for regenerating a sheet or adding to one. Every prompt is complete: copy it as it is, attach the files listed, save the result under the name given, then set its regions in `tools/build-art.cjs`.

Same process as the storybook sheets in [`../art-direction/PROMPTS.md`](../art-direction/PROMPTS.md). The tickets these were written for, Erwu's earlier movement prompts (section 8) and the review evidence are on the `archive/docs-2026-10-01` branch; Erwu's current art is described in [`../erwu-redraw-v3/README.md`](../erwu-redraw-v3/README.md).

## Reference material

All of these are already in the repository. Attach them from these paths.

| File | What it is | Why it's attached |
|---|---|---|
| `.scratch/art-direction/target-mockup.webp` (archive branch) | The owner's mockup from 2026-09-27 | The style target: outlines, palette, watercolour, paper grain. Check it out from `archive/docs-2026-10-01` when generating. |
| `assets/garden-bare-summer.webp` | The bare summer backdrop | The composition every season shares: the fountain and log stay exactly where they are, because the game reads their positions from it. |
| `assets/garden-clumps.png` (1254 × 1254) | The flower clumps the garden grows from play | The scale, view, grass tuft and grid new clumps must match. |
| `assets/erwu-v3/poses.png` | Erwu's 20 painted poses | The size of the visitors next to Erwu, and the drawing style for animals. |
| `.scratch/living-garden/rose-bed-reference.png` | The rose bed with Erwu's basket | For image 7: the seasonal rose beds keep this exact shape, size and basket position. |
| Your photo of the cottontail (optional) | The rabbit that visits your garden | Reference only: not stored in the repository. |

Image 2 (spring, autumn, winter) also attaches the **bare summer backdrop you generate in image 1**, so all four seasons share one composition.

## Order

1. Image 1 first; images 2a–2c from it.
2. Images 3–7 in any order.

All of them are done and in the game (2026-09-29/30).

Checks for every sheet: flat plain light grey background (#E6E6E6), wide gaps so nothing touches, no text, no shadows. If a generation adds a frame, text, or shadows, regenerate; the build tool cuts pieces out by the grey.

---

## 1. Bare backdrop, summer → `assets/garden-bare-summer.png`

Attach: `.scratch/art-direction/target-mockup.webp` and `assets/garden-background-v2.png`.
Size: the same as `garden-background-v2.png` (941 × 1672, portrait 9:16), or larger in the same proportion.

```
Redraw the second attached image, a full-screen portrait garden illustration, in EXACTLY the same storybook illustration style, composition, size, viewpoint and paper edge: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, pastel palette (butter yellow, blush pink, lilac, cornflower blue, sage green, cream), warm afternoon light from the upper left, subtle paper grain. NOT photographic, NOT 3D. The first attached image is the style reference.

Keep the three-tier stone fountain in the upper left and the fallen mossy log in the upper right EXACTLY where they are and at exactly the same size. Keep the soft overhanging leaves along the top and the cream deckled paper edge with rounded corners on every side.

Change only this: remove all of the flower borders. Where the borders of daisies, lavender, roses, forget-me-nots and clover were, along the left edge, the right edge and the bottom edge, there is now plain, soft, sunlit lawn that fades into the paper edge, with only a few tufts of longer grass and a light scattering of tiny white clover flowers. Around the fountain and the log there is lawn and a little moss, but no flowers. The wide open lawn clearing in the middle stays open and empty. The garden should look young, simple and inviting, like a new garden waiting to be planted.

Portrait 9:16. No cat, no basket, no rose bed, no flower beds, no cushion, no stones or stepping stones, no path, no text, no buttons, no frame lines. Highest resolution.
```

## 2a. Bare backdrop, spring → `assets/garden-bare-spring.png`

Attach: `.scratch/art-direction/target-mockup.webp` and the **bare summer backdrop from image 1**.

```
Redraw the second attached image, a full-screen portrait garden illustration, EXACTLY: the same composition, the same three-tier stone fountain in the upper left and fallen log in the upper right in exactly the same places and sizes, the same viewpoint, the same storybook watercolour style with soft warm-brown outlines and subtle paper grain, the same cream deckled paper edge with rounded corners. The first attached image is the style reference. NOT photographic, NOT 3D.

Change only the season, to early spring: the lawn a fresh, pale, bright green; a few small clusters of purple and white crocuses and white snowdrops scattered low in the grass near the edges; the overhanging branches along the top carrying pale pink and white blossom, with a few loose blossom petals drifting down; cool, clear morning light. The open lawn clearing in the middle stays open and empty. No flower borders.

Portrait 9:16. No cat, no basket, no rose bed, no flower beds, no cushion, no stones or stepping stones, no path, no text, no buttons, no frame lines. Highest resolution.
```

## 2b. Bare backdrop, autumn → `assets/garden-bare-autumn.png`

Attach: `.scratch/art-direction/target-mockup.webp` and the **bare summer backdrop from image 1**.

```
Redraw the second attached image, a full-screen portrait garden illustration, EXACTLY: the same composition, the same three-tier stone fountain in the upper left and fallen log in the upper right in exactly the same places and sizes, the same viewpoint, the same storybook watercolour style with soft warm-brown outlines and subtle paper grain, the same cream deckled paper edge with rounded corners. The first attached image is the style reference. NOT photographic, NOT 3D.

Change only the season, to autumn: the lawn a warmer gold-green; fallen leaves in amber, rust, orange and soft red scattered across the grass, gathered a little more thickly around the log and at the foot of the fountain; the overhanging leaves along the top turned orange, gold and red; low, warm, golden afternoon light. The open lawn clearing in the middle stays open, with only a few scattered leaves. No flower borders.

Portrait 9:16. No cat, no basket, no rose bed, no flower beds, no cushion, no stones or stepping stones, no path, no text, no buttons, no frame lines. Highest resolution.
```

## 2c. Bare backdrop, winter → `assets/garden-bare-winter.png`

Attach: `.scratch/art-direction/target-mockup.webp` and the **bare summer backdrop from image 1**.

```
Redraw the second attached image, a full-screen portrait garden illustration, EXACTLY: the same composition, the same three-tier stone fountain in the upper left and fallen log in the upper right in exactly the same places and sizes, the same viewpoint, the same storybook watercolour style with soft warm-brown outlines and subtle paper grain, the same cream deckled paper edge with rounded corners. The first attached image is the style reference. NOT photographic, NOT 3D.

Change only the season, to winter: a light, soft layer of snow over the lawn, with pale green grass showing through in patches; snow resting on the fountain's bowls and along the top of the log; the fountain still, with a thin skin of pale ice in its bowls; the overhanging branches along the top bare, with a little snow on them; pale, cool, gentle daylight with soft blue shadows. Keep it cosy and light, not grey or gloomy. The open lawn clearing in the middle stays open. No flowers.

Portrait 9:16. No cat, no basket, no rose bed, no flower beds, no cushion, no stones or stepping stones, no path, no text, no buttons, no frame lines. Highest resolution.
```

## 7a. Rose bed, early spring → `assets/rose-bed-spring.png`

Attach: `.scratch/art-direction/target-mockup.webp` and `.scratch/living-garden/rose-bed-reference.png`.
Size: the same as the reference (528 × 488), or larger in the same proportion.

```
Redraw the second attached image, a round garden rose bed with a wicker cat basket in its middle, EXACTLY: the same shape, size and outline, the same ring of pale stones around it in exactly the same places, the same empty round wicker basket with its cream tufted cushion in exactly the same place, size and shape, the same gentle three-quarter view from above, the same storybook watercolour style with soft warm-brown outlines and subtle paper grain. The first attached image is the style reference. NOT photographic, NOT 3D.

Change only the season, to early spring: the rose bushes are fresh green and leafy with only a few small closed rose buds and no open flowers; a few white snowdrops and purple crocuses in the soil between the stones.

Keep the basket empty (no cat). Flat plain light grey background (#E6E6E6) around it, with no ground, no shadows, no text. Highest resolution.
```

## 7b. Rose bed, autumn → `assets/rose-bed-autumn.png`

Attach: `.scratch/art-direction/target-mockup.webp` and `.scratch/living-garden/rose-bed-reference.png`.
Size: the same as the reference (528 × 488), or larger in the same proportion.

```
Redraw the second attached image, a round garden rose bed with a wicker cat basket in its middle, EXACTLY: the same shape, size and outline, the same ring of pale stones around it in exactly the same places, the same empty round wicker basket with its cream tufted cushion in exactly the same place, size and shape, the same gentle three-quarter view from above, the same storybook watercolour style with soft warm-brown outlines and subtle paper grain. The first attached image is the style reference. NOT photographic, NOT 3D.

Change only the season, to autumn: the rose bushes have a few last open pink roses and some red rose hips; some of their leaves have turned yellow and orange; a few fallen leaves on the stones.

Keep the basket empty (no cat). Flat plain light grey background (#E6E6E6) around it, with no ground, no shadows, no text. Highest resolution.
```

## 7c. Rose bed, winter → `assets/rose-bed-winter.png`

Attach: `.scratch/art-direction/target-mockup.webp` and `.scratch/living-garden/rose-bed-reference.png`.
Size: the same as the reference (528 × 488), or larger in the same proportion.

```
Redraw the second attached image, a round garden rose bed with a wicker cat basket in its middle, EXACTLY: the same shape, size and outline, the same ring of pale stones around it in exactly the same places, the same empty round wicker basket with its cream tufted cushion in exactly the same place, size and shape, the same gentle three-quarter view from above, the same storybook watercolour style with soft warm-brown outlines and subtle paper grain. The first attached image is the style reference. NOT photographic, NOT 3D.

Change only the season, to winter: the rose bushes are cut back to short, bare, thorny stems with a few dry leaves; a soft layer of snow on the stones, on the soil and resting lightly on the rim of the basket (the cushion inside stays clean and cosy); no flowers.

Keep the basket empty (no cat). Flat plain light grey background (#E6E6E6) around it, with no ground, no shadows, no text. Highest resolution.
```

---

## 3. Seasonal clumps → `assets/garden-clumps-seasons.png`

Attach: `.scratch/art-direction/target-mockup.webp` and `assets/garden-clumps.png`.
Size: square, like `garden-clumps.png` (1254 × 1254 or larger).

```
A sheet of 16 separate flower clumps in EXACTLY the storybook illustration style of the attached clump sheet and mockup: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, pastel palette (butter yellow, blush pink, lilac, cornflower blue, sage green, cream), warm afternoon light from the upper left, subtle paper grain. NOT photographic, NOT 3D.

4 rows of 4, one clump centred in each cell. Every clump is exactly the same scale as the clumps in the attached clump sheet, standing upright, seen from the same gentle three-quarter view from above. Each grows from a small tuft of grass at its base, with its roots at the bottom of the cell. The clumps, row by row, left to right:
- Row 1: pink and cream tulips; a soft pink peony plant with two open peonies; red and orange field poppies; pale purple asters.
- Row 2: purple and white crocuses; yellow daffodils; white snowdrops; forget-me-nots with a few tulip leaves.
- Row 3: pink sedum flower heads turning rust; tall ornamental grasses with fluffy seedheads; a small shrub with orange and red autumn leaves; brown coneflower seedheads.
- Row 4: a hellebore with pale pink winter flowers; a sprig of holly with red berries; bare twigs dusted with a little snow; a tuft of grass with frost and a little snow.

Flat plain light grey background (#E6E6E6) everywhere, with no ground, no shadows, no text, no grid lines, and wide empty space around every clump so nothing touches. Highest resolution.
```

---

## 4. Visitors: birds → `assets/visitors-1.png`

Attach: `.scratch/art-direction/target-mockup.webp` and `assets/erwu-sprite-v2.png`.
Size: portrait, about 1200 × 1800 or larger.

```
A game sprite sheet of garden birds in EXACTLY the storybook illustration style of the attached mockup and cat sheet: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, soft natural colours, warm afternoon light from the upper left, subtle paper grain. NOT photographic, NOT 3D, NOT cartoonish or chibi.

5 rows of 3, one pose centred in each cell. All birds are seen from the side from the same gentle three-quarter view as the mockup, facing right, and drawn at a consistent real-life scale to each other and to the grey cat in the attached sheet (a songbird is about a quarter of the cat's height). Every pose of one bird has the same size and colours.
- Row 1: a blue jay (bright blue back, wings and crest, white and pale grey chest, a black necklace, black and white bars on the wings and tail): perched upright; bending down to drink; wings open, taking off.
- Row 2: a northern cardinal (bright red male with a crest and a black face mask): perched; pecking at the ground; wings open, taking off.
- Row 3: a dark-eyed junco (slate grey above, white belly, pale pink beak): standing; pecking at the ground; mid-hop.
- Row 4: an American goldfinch (bright yellow body, black cap and black wings with white bars): perched on a short seedhead stem (draw only the short stem); pecking; flying.
- Row 5: a ruby-throated hummingbird (green back, red throat): hovering with a soft blur of wings; hovering with its beak forward as if at a flower; perched on a tiny twig (draw only the twig).

Flat plain light grey background (#E6E6E6) everywhere, with no ground, no shadows, no text, no grid lines, and wide empty space around every bird so nothing touches. Highest resolution.
```

## 5. Visitors: animals and insects → `assets/visitors-2.png`

Attach: `.scratch/art-direction/target-mockup.webp`, `assets/erwu-sprite-v2.png`, and optionally your photo of the cottontail.
Size: portrait, about 1200 × 2400 or larger.

```
A game sprite sheet of small garden visitors in EXACTLY the storybook illustration style of the attached mockup and cat sheet: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, soft natural colours, warm afternoon light from the upper left, subtle paper grain. NOT photographic, NOT 3D, NOT cartoonish or chibi.

7 rows of 3, one pose centred in each cell. All are seen from the side from the same gentle three-quarter view as the mockup, facing right, and drawn at a consistent real-life scale to the grey cat in the attached sheet: the rabbit about the cat's size, the fox a little larger than the cat, the squirrel and chipmunk smaller, the frog, bee and moth small. Every pose of one animal has the same size and colours. If a photo of a rabbit is attached, the rabbit should look like that one.
- Row 1: an eastern cottontail rabbit (soft brown-grey fur, long ears, a round fluffy white tail): sitting upright with ears up; nibbling the grass; mid-hop.
- Row 2: a black squirrel with a big bushy tail: sitting up holding an acorn; running; digging with its front paws.
- Row 3: an eastern chipmunk (red-brown with black and white stripes down its back): sitting up; cheeks full; running.
- Row 4: a small green frog: sitting; mid-jump; sitting with its throat puffed out.
- Row 5: a red fox (rust-orange coat, white chest and tail tip, dark legs): standing and looking; walking; sitting with its tail wrapped round its feet.
- Row 6: a fuzzy bumblebee (black and golden yellow): flying seen from the side; flying seen from above; resting on a flower head (draw only the bee).
- Row 7: a pale green luna moth with long curving tails on its hind wings: wings open seen from above; wings raised seen from the side; resting with its wings folded.

Flat plain light grey background (#E6E6E6) everywhere, with no ground, no shadows, no text, no grid lines, and wide empty space around every animal so nothing touches. Highest resolution.
```

## 6. Keepsakes and traces → `assets/keepsakes.png`

Attach: `.scratch/art-direction/target-mockup.webp` and `assets/garden-clumps.png`.
Size: square, 1254 × 1254 or larger.

```
A sheet of small garden objects in EXACTLY the storybook illustration style of the attached mockup: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, subtle paper grain. NOT photographic, NOT 3D.

4 rows of 4, one object centred in each cell. Every object lies on the ground and is seen from the same gentle three-quarter view from above as the mockup, small, at a consistent real-life scale to the flower clumps in the attached clump sheet (a feather or a leaf is about a third of a clump's width). The objects, row by row, left to right:
- Row 1: a blue jay feather (bright blue with black bars and a white tip); a red maple leaf; an amber oak leaf; an acorn with its cap.
- Row 2: a small pine cone; a smooth, round grey pebble; a fallen pink cosmos flower head; a fallen white daisy flower head.
- Row 3: a little pile of nibbled acorn shells; a small patch of freshly dug brown earth; a scattering of seed husks; a small patch of clover with nibbled leaves.
- Row 4: a short trail of rabbit footprints in a small patch of snow; a short trail of tiny bird footprints in a small patch of frost; a short trail of fox paw prints on a small patch of grass; a small wet splash of water on a flat stone.

Flat plain light grey background (#E6E6E6) everywhere, with no ground beyond the small patches described, no shadows, no text, no grid lines, and wide empty space around every object so nothing touches. Highest resolution.
```

---

## After generating

- Check the four backdrops line up: laid over each other, the fountain and log should match within a few pixels. If one drifts, regenerate that one from image 1.
- Look at new visitors on your phone next to Erwu: do they look like the ones in your garden?
- Put the files in `assets/` with the names above; then set their regions in `tools/build-art.cjs`, rebuild, and check them in the game.
