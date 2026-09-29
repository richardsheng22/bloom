# Erwu movement source sheets — generation handoff

Generated after pulling develop to `3719534`, before resuming the side-walk rig prototype. Built-in image generation was used, with the three reference sheets specified in `ART-PROMPTS.md` section 8. No atlas packing or game integration is included in this batch.

| Source asset | Layout | Actual dimensions | Status |
| --- | --- | --- | --- |
| `assets/erwu-walk-diag-front.png` | 4 columns × 2 rows, toward/right | 1774 × 887 | Generated; gait acceptance pending |
| `assets/erwu-walk-diag-back.png` | 4 columns × 2 rows, away/right | 1774 × 887 | Generated; gait acceptance pending |
| `assets/erwu-walk-updown-8.png` | 8 columns × 2 rows, front then back | 1774 × 887 | Candidate only; front paw sequence needs correction |
| `assets/erwu-transitions.png` | 5 columns × 2 rows, specified transition poses | 1774 × 887 | Generated; timing/pose acceptance pending |

## Inspection and limitations

- All four have the requested figure count and ordering of views/actions, grey backgrounds, separated figures, no text or grid lines, and no visible ground/cast shadows. They broadly retain the side sheet's pale grey palette, warm lighting and low tail carriage.
- The generator returned 1774 × 887 despite the 2048 × 1024 request. Files are saved at native resolution, without upscaling. In particular, each front/back cell is relatively narrow; review detail at intended display size before packing.
- The existing references strongly propagate their layered/scalloped fur. These outputs do not fully meet the brief's softer, non-plate-like fur requirement. They are source candidates, not approved final animation.
- The eight-frame front cycle still favors one leading paw and has limited phase variation. Two correction attempts did not reliably solve it. The selected version keeps the closest existing proportions; the other attempt made her taller and exaggerated rear paw pads. Do not interpret eight images as eight validated gait phases or automatically replace the existing cycle with this sheet.
- Diagonal cycles also need a looping check of contact order and body alignment. Consistent-looking stills do not establish grounded motion. Transition drawings are key poses, not a complete interpolated transition animation.
- Exact regions, pivots, color matching, packing, looping acceptance and integration remain as assigned in the prompt file's “After generating” section. Existing runtime assets are untouched.

## Prompts and references

Base prompts: `ART-PROMPTS.md`, sections **8a–8d**, used verbatim after a short production wrapper identifying the references and requesting landscape 2048 × 1024 or larger. Wrappers emphasized the requested cell counts and soft fur. Reference order: `assets/erwu-walk-v2.png` (master character/color), `assets/erwu-walk-updown.png` (views), `assets/erwu-sprite-v2.png` (poses).

The selected 8c image additionally used this exact correction prompt against its first generated sheet:

```text
Edit this sprite sheet, preserving the same Erwu cat, palette, light direction, eight columns and two rows, camera views, compact head, low tail and grey background. Change the fur surface in ALL sixteen cats: replace the overlapping scalloped plates with smooth soft watercolor/gouache washes and only a few fine fur strokes. No scales, overlapping discs, tiles, plates or feathers. Preserve the pale grey colors and warm edges. Correct the walking sequence: top row viewer-left forepaw forward in frame 1, passing and lifting the opposite forepaw in 2, reaching that opposite forepaw in 3, contact in 4, viewer-right forepaw forward in frame 5, then complementary passing, reaching, contact in 6,7,8. It is essential that frame 5 lead paw is the OPPOSITE of frame 1, not the same pose repeated. Give frame 1 the SAME low tail to viewer-left as the remaining front frames. Rear row show alternating hind legs stepping, same relaxed tail across frames. Exactly sixteen separate figures, clear grey gutters. No text/shadows/floor. Render at 2048 by 1024 pixels.
```

## Next work

Resume the separately requested side-walk rig prototype against current develop. Its authored foot contacts and stable character model are still necessary; this generation batch does not replace that work. The newer movement/renderer fixes already on develop must be preserved.

## Review (2026-09-29)

Reviewed in [ART-PROMPTS.md section 8e](ART-PROMPTS.md#8e-review-of-the-2026-09-29-candidates). Only the transitions sheet is usable:
- Both diagonals are side views with the head turned, and frames 5–8 repeat 1–4.
- The front/back walk never alternates its legs.

Section 8e has correction prompts that avoid asking the generator for a sequence of alternating legs.
