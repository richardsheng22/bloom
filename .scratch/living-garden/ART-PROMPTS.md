# Art prompts for the living garden

Seven images (plus the rose bed in three seasons, image 7), for tickets [08](08-art-bare-and-seasonal-backdrops.md), [09](09-art-seasonal-clumps.md) and [10](10-art-visitors-and-keepsakes.md). Every prompt below is complete: copy it as it is, attach the files listed under it, and save the result under the name given. Put the results in `assets/` on the branch; after that, I set each sheet's regions in `tools/build-art.cjs` and wire them into the game.

Same process as the storybook sheets in [`../art-direction/PROMPTS.md`](../art-direction/PROMPTS.md).

## Reference material

All of these are already in the repository. Attach them from these paths.

| File | What it is | Why it's attached |
|---|---|---|
| `.scratch/art-direction/target-mockup.webp` | Your mockup from 2026-09-27: the garden (left) and a run (right) | The style target for everything: outlines, palette, watercolour, paper grain. Attach it to every prompt. |
| `assets/garden-background-v2.png` (941 × 1672) | The current full-screen garden backdrop, with its flower borders | The composition to keep for the bare backdrop: the fountain and log must stay exactly where they are, because the game reads their positions from it. |
| `assets/garden-clumps.png` (1254 × 1254) | The 16 flower clumps the garden grows from play | The scale, view, grass tuft and grid the new clumps must match, so old and new sit side by side. |
| `assets/erwu-sprite-v2.png` (1122 × 1402) | Erwu's 20 painted poses | The size of the visitors next to Erwu, and the same drawing style for animals. |
| `.scratch/living-garden/rose-bed-reference.png` | The rose bed with Erwu's basket, cut from the garden pieces sheet | For image 7: the seasonal rose beds must keep this exact shape, size and basket position. |
| `assets/erwu-walk-v2.png`, `assets/erwu-walk-updown.png` | Erwu's side walk and her front/back walk | For image 8: the side walk is the master model; the front/back sheet shows the views. |
| Your photo of the cottontail (optional) | The rabbit that visits your garden | So it looks like yours. Reference only: it is not stored in the repository. |

Image 2 (spring, autumn, winter) also attaches the **bare summer backdrop you generate in image 1**, so all four seasons share one composition.

## Order

1. Image 1 first; images 2a–2c from it.
2. Images 3–7 in any order, whenever convenient.

Images 1, 2a, 2b and 2c are done (2026-09-29) and in the game.

Images 3–7 now have generated source PNGs in `assets/` (2026-09-29), along with the front/back Erwu walk from the older prompt file. See [the generation handoff](GENERATED-ASSETS-2026-09-29.md) for dimensions, corrections and remaining packing/acceptance checks. These source files are not yet integrated into the game.

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

## 8. Erwu's movement frames (optional: for a smoother walk)

Generation update: all four source candidates are now saved under the filenames below. See [the movement generation handoff](ERWU-MOVEMENT-GENERATION.md) for inspection notes and actual dimensions. **Not yet packed or approved:** the front/back eight-frame cycle still needs paw-sequence correction, and the generated fur retains more layering than requested.

These fill the gaps the walk review found (`.scratch/erwu-walk-review/README.md`): diagonal views so changes of direction don't swap between two very different drawings, twice as many front and back frames, and a few transition poses. Priority order: 8a and 8b first (biggest improvement), then 8c, then 8d.

Generated frames tend to drift from each other. For each sheet, check before using it: the same cat in every frame, paws on one line, legs alternating (a paw on the ground stays in place while the body moves over it). If one frame is off, regenerate just that sheet.

Attach to every image in this section: `assets/erwu-walk-v2.png` (the side walk: the master model), `assets/erwu-walk-updown.png` (front and back) and `assets/erwu-sprite-v2.png` (her poses). Their colours already match in the game, so match the side walk.

### 8a. Walking diagonally toward us → `assets/erwu-walk-diag-front.png`
Size: landscape, 2048 × 1024 or larger.

```
A game sprite sheet of one cat walking, in EXACTLY the storybook illustration style of the attached cat sheets: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, soft grey fur suggested by a few gentle strokes (NO scale-like or plate-like fur, NO pointed tufts), warm light from the upper left, subtle paper grain. NOT photographic, NOT 3D.

The cat is EXACTLY the same cat as in the attached side-view walk sheet: a round, plump, pale charcoal-grey British Shorthair with a long soft barrel body, short sturdy legs, full cheeks, small ears set wide apart, heavy-lidded amber-gold eyes, and a big fluffy tail carried low. Same size, same proportions, same colour and brightness as the attached side walk in every frame; do not make her darker, more saturated or fluffier.

2 rows of 4 frames, one walk cycle of 8 frames in order, left to right then the second row. The cat walks DIAGONALLY toward the viewer and to the viewer's right: a three-quarter front view, her face and chest turned about 45 degrees toward us, her body and tail trailing back to the left. The camera is the same shallow angle as the side walk, about 15 degrees above the ground; do not look down on her back.

A natural, unhurried cat walk: at any moment two or three paws are on the ground and the body is carried over them; a lifted paw is only slightly raised. The frames step through the cycle evenly:
1. left front paw forward and planted, right hind paw forward and planted
2. passing: left front paw under the shoulder, right front paw lifting
3. right front paw reaching forward
4. right front paw planted, left hind paw forward
5. to 8. the same four phases on the opposite legs, so frame 8 leads smoothly back into frame 1.
Her head stays level and steady; her body rises and falls only very slightly; her tail sways gently.

Flat plain light grey background (#E6E6E6) everywhere, with no floor, no shadows, no text, no grid lines, and wide empty space around every frame so nothing touches. Every frame at the same scale with the paws on one common baseline per row. Highest resolution.
```

### 8b. Walking diagonally away from us → `assets/erwu-walk-diag-back.png`
Size: landscape, 2048 × 1024 or larger.

```
A game sprite sheet of one cat walking, in EXACTLY the storybook illustration style of the attached cat sheets: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, soft grey fur suggested by a few gentle strokes (NO scale-like or plate-like fur, NO pointed tufts), warm light from the upper left, subtle paper grain. NOT photographic, NOT 3D.

The cat is EXACTLY the same cat as in the attached side-view walk sheet: a round, plump, pale charcoal-grey British Shorthair with a long soft barrel body, short sturdy legs, full cheeks, small ears set wide apart, heavy-lidded amber-gold eyes, and a big fluffy tail carried low. Same size, same proportions, same colour and brightness as the attached side walk in every frame; do not make her darker, more saturated or fluffier.

2 rows of 4 frames, one walk cycle of 8 frames in order, left to right then the second row. The cat walks DIAGONALLY away from the viewer and to the viewer's right: a three-quarter back view, her hindquarters and the back of her head toward us, her head turned about 45 degrees away so one ear, one cheek and a sliver of eye show; her tail low and relaxed behind her. The camera is the same shallow angle as the side walk, about 15 degrees above the ground.

A natural, unhurried cat walk: at any moment two or three paws are on the ground and the body is carried over them; a lifted paw is only slightly raised, the pad just showing. The frames step through the cycle evenly:
1. left hind paw forward and planted, right front paw forward and planted
2. passing: left hind paw under the hip, right hind paw lifting
3. right hind paw reaching forward
4. right hind paw planted, left front paw forward
5. to 8. the same four phases on the opposite legs, so frame 8 leads smoothly back into frame 1.
Her head stays level; her hips shift gently side to side with each step.

Flat plain light grey background (#E6E6E6) everywhere, with no floor, no shadows, no text, no grid lines, and wide empty space around every frame so nothing touches. Every frame at the same scale with the paws on one common baseline per row. Highest resolution.
```

### 8c. Walking toward and away from us, 8 frames each → `assets/erwu-walk-updown-8.png`
Size: landscape, 2048 × 1024 or larger.

```
A game sprite sheet of one cat walking, in EXACTLY the storybook illustration style of the attached cat sheets: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, soft grey fur suggested by a few gentle strokes (NO scale-like or plate-like fur, NO pointed tufts), warm light from the upper left, subtle paper grain. NOT photographic, NOT 3D.

The cat is EXACTLY the same cat as in the attached side-view walk sheet: a round, plump, pale charcoal-grey British Shorthair with a long soft barrel body, short sturdy legs, full cheeks, small ears set wide apart, heavy-lidded amber-gold eyes, and a big fluffy tail carried low. Same size, same proportions, same colour and brightness as the attached side walk in every frame; do not make her darker, more saturated or fluffier. The attached front and back walking sheet shows the views wanted; keep those views but match the side walk's colour and fur exactly.

2 rows of 8 frames.
- Row 1: walking straight TOWARD the viewer, one walk cycle of 8 frames: face, chest and front paws toward us, a little of her back above her shoulders, tail low behind her and to one side. Frame 1 her right front paw (viewer's left) forward and planted; frames 2 to 4 that paw passing under her as the other lifts and reaches; frame 5 her left front paw forward and planted; frames 6 to 8 back toward frame 1. The hind paws move opposite the front paws on the same side.
- Row 2: walking straight AWAY from the viewer, one walk cycle of 8 frames: rounded hindquarters, the back of her head and ears ahead, tail low and relaxed. Frame 1 her left hind paw forward and planted; frames 2 to 4 passing and reaching; frame 5 her right hind paw planted; frames 6 to 8 back toward frame 1. Her hips shift gently with each step.
The camera is the same shallow angle as the side walk, about 15 degrees above the ground. Lifted paws are only slightly raised. Her head stays level.

Flat plain light grey background (#E6E6E6) everywhere, with no floor, no shadows, no text, no grid lines, and wide empty space around every frame so nothing touches. Every frame at the same scale with the paws on one common baseline per row. Highest resolution.
```

### 8d. Starting, stopping and turning → `assets/erwu-transitions.png`
Size: landscape, 2048 × 1024 or larger.

```
A game sprite sheet of one cat, in EXACTLY the storybook illustration style of the attached cat sheets: simplified, gentle forms with soft warm-brown outlines, light airy watercolour and gouache washes, soft grey fur suggested by a few gentle strokes (NO scale-like or plate-like fur, NO pointed tufts), warm light from the upper left, subtle paper grain. NOT photographic, NOT 3D.

The cat is EXACTLY the same cat as in the attached side-view walk sheet: a round, plump, pale charcoal-grey British Shorthair with a long soft barrel body, short sturdy legs, full cheeks, small ears set wide apart, heavy-lidded amber-gold eyes, and a big fluffy tail carried low. Same size, same proportions, same colour and brightness as the attached side walk in every frame; do not make her darker, more saturated or fluffier.

2 rows of 5 frames, all side views facing right unless stated, same scale and baseline:
- Row 1, getting up and setting off: 1. sitting upright; 2. rising, hindquarters lifting, front legs straight; 3. standing on all four paws, weight settling; 4. first step, right front paw lifting; 5. first step, right front paw reaching forward, body starting to move.
- Row 2, stopping and turning: 1. braking step, front paw planted ahead, body leaning back slightly; 2. standing still, all four paws down; 3. turning round, seen three-quarters from the front, head and shoulders already turned toward the viewer, hindquarters still facing right; 4. turning round, facing the viewer head-on, body curving; 5. landing from a small hop, front paws touching down first, hind legs still tucked.

Flat plain light grey background (#E6E6E6) everywhere, with no floor, no shadows, no text, no grid lines, and wide empty space around every frame so nothing touches. Every frame at the same scale with the paws on one common baseline per row. Highest resolution.
```

## After generating

- Check the four backdrops line up: laid over each other, the fountain and log should match within a few pixels. If one drifts, regenerate that one from image 1.
- Look at the cottontail and the blue jay on your phone next to Erwu: do they look like the ones in your garden?
- Put the files in `assets/` with the names above and tell me; I'll pack them, set their regions, and wire them in.
- For Erwu's frames (image 8), I'll check each sheet's paws and proportions against the side walk before using it, and show you a looping preview.
