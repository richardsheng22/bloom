# Generated source assets — 2026-09-29

Generated on `develop` based on `2992870`, using the built-in image-generation tool and the repository's prompt/reference set. These are source images for the next atlas-packing pass, not an integrated game update.

## Deliverables

| Asset in `assets/` | Actual pixels | Layout |
|---|---|---|
| `rose-bed-spring.png` | 1305 × 1206 | One bed; closed buds, crocuses and snowdrops |
| `rose-bed-autumn.png` | 1305 × 1205 | One bed; last roses, hips and autumn leaves |
| `rose-bed-winter.png` | 1305 × 1205 | One bed; cut-back stems, snow and an empty cosy basket |
| `garden-clumps-seasons.png` | 1254 × 1254 | 4 × 4, in the specified order |
| `visitors-1.png` | 1024 × 1536 | 5 × 3 bird poses |
| `visitors-2.png` | 887 × 1774 | 7 × 3 animal/insect poses |
| `keepsakes.png` | 1254 × 1254 | 4 × 4, in the specified order |
| `erwu-walk-updown.png` | 1774 × 887 | 2 × 4, toward us then away |

The four seasonal backdrops were already complete and were not regenerated or replaced. No pre-existing image was overwritten. No runtime manifest, atlas builder or gameplay code changed.

## Prompt set and references

The initial prompts were extracted verbatim from [ART-PROMPTS.md](ART-PROMPTS.md), images 3–7, and [the storybook prompts](../art-direction/PROMPTS.md), image 8. References were supplied in the listed order:

- Every generation: `../art-direction/target-mockup.webp`, for style only.
- Rose beds: `rose-bed-reference.png`, as the seasonal edit target.
- Clumps and keepsakes: `assets/garden-clumps.png`, for style/scale.
- Visitors: `assets/erwu-sprite-v2.png`, for animal style. No additional rabbit photo was available or invented.
- Erwu walk: `assets/erwu-walk-v2.png` and `assets/erwu-sprite-v2.png`, for character and motion style.

Additional generation constraints reiterated the exact grid counts/order, uniform grey backgrounds, no UI/text, wide gutters and no added items. Requested sizes were square 2048 for the two 4×4 sheets, 1200×1800 for birds, 1200×2400 for animals, 2048×1024 for the walk, and the reference's 528:488 ratio at at least 1300 pixels wide for rose beds. The tool returned the actual sizes listed above; no upscaling or image post-processing was applied.

Two targeted built-in image edits produced the final selected files:

1. **Keepsakes:** remove unrequested grass/clover/ground decoration from the first two rows and from the shells/earth/husks in row three; retain the intentional nibbled clover and four ground-trace patches. Preserve all sixteen objects, positions, scale and style; fill removed areas with the grey background.
2. **Animals:** remove only the daisy under row six, column three, retaining the complete resting bee and all other poses.

## Review and follow-up

- Visually checked all outputs for species/items, expected row counts, isolation, readable silhouettes and absence of labels/grid lines. Corrected the two unwanted decorations above.
- Verified all eight saved files have valid PNG signatures and recorded dimensions. Existing game behavior was not changed, so no gameplay test rerun is claimed.
- Flat grey backgrounds are intentional for the existing cutout pipeline; these are not transparent sprites yet. Check the cutout around pale snow, moth wings and motion-blurred hummingbird wings when packing.
- Generated rose beds are not certified pixel-aligned with the original. Their basket/rim anchors and the one-pixel height difference need normalization against the reference before season switching. Do not replace a live atlas region blindly.
- Species and pose scales need explicit packing metadata, particularly the small insects. The visitor sheets are below the suggested source dimensions; assess phone-size cutout quality before enlarging or deciding to regenerate.
- Erwu's sheet has eight direction poses, but a seamless walk loop has not been demonstrated. Check left/right paw ordering, consistent body height, anchors and timing in the animation preview before integration; generation alone does not establish animation acceptance.
- Owner recognition of the rabbit and blue jay remains an art-review item. Tickets 08–10 should not be marked fully integrated or accepted solely because source files exist.

Next: set source regions and anchors in `tools/build-art.cjs`, pack atlases, integrate the seasonal/visitor behavior, then capture in-game evidence. This is the separate follow-up specified in the original asset brief.
