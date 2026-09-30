# Erwu photographic-reference redraw, v3

Base: develop e7ec95e. Generated with the built-in image tool from the user's real photos and watercolor reference. Exact prompts, references, and selected output paths are in prompts.json.

## Delivered source art

All seven PNGs live in `assets/erwu-v3/`:

| File | Contents | Status |
| --- | --- | --- |
| model.png | Four neutral-view references | Revised anatomy reference |
| poses.png | Twenty resting, action, basket-peek and expression poses | Redrawn source sheet; hand-set crop guides in preview |
| walk-side.png | Eight side-view source cells | Animation draft |
| walk-front.png | Eight toward-camera source cells | Animation draft |
| walk-back.png | Eight away-camera source cells | Animation draft |
| walk-diag-front.png | Eight toward-diagonal source cells | Animation draft |
| walk-diag-back.png | Eight away-diagonal source cells | Animation draft |

This is 64 source cells, not 64 verified unique animation poses. The walking sheets are explicitly not approved for production packing.

The intended changes are a longer torso, gentler back curve, softer low belly, more distinct legs and modest paws, a longer tapered tail and a slimmer face. The window-standing photo informs body structure; the close-up informs face shape; the reclining photo informs relaxed poses; the watercolor sheet informs medium. These replace the previous barrel-body study as the latest redraw attempt, not as an exact anatomical reconstruction.

Pose order, left to right by row:

1. sit-front, sit-drowsy, sit-content, curl
2. sniff, stalk, pounce, stretch
3. loaf, sit-side, belly-up, yawn
4. peek, peek-glance, peek-turn, peek-sleepy
5. look-up, sit-grumpy, lie-side, loaf-side

## Review

Serve the repository over HTTP and open `.scratch/erwu-redraw-v3/preview.html`. It provides frame stepping, playback, mirroring, and enlarged/small displays, plus the complete source sheet. It uses constant scale within each sheet; it does not resize every frame to an equal silhouette height. Pose crops use explicit boundaries because the generator did not honor an exact grid. Preview crop guides are not production atlas regions.

Browser checks in checks.json cover seven decoded sheets, cell counts, playback, stepping, mirroring and a 390px layout without horizontal overflow or page errors. Screenshots show selected source frames. These checks do not validate anatomy or gait.

## Findings and outstanding work

The resting/action set is a concrete redraw rather than another plan. Its pose selection covers the main twenty-pose source sheet; swat/delighted artwork from play-pieces and dedicated turn/hop transition sources are not replaced by this batch.

Walk generation repeatedly produced very similar foreleg poses in both half-cycles. Targeted second-row edits and front/back mirror requests improved some contacts, but did not reliably enforce every near/far-leg assignment. In particular, the side and diagonal second/third frames are too similar and corresponding half-cycle poses can still repeat a leading leg. Some front/back bottom-row images also fail to precisely mirror the top row. Do not describe these sheets as verified eight-frame feline strides.

The model and directional sheets also need common landmark registration. Fixed-size cells expose rather than solve vertical placement drift; use shoulder/hip landmarks and a common paw baseline when packing, not independent whole-silhouette height fitting. A successful likeness redraw must not be confused with a completed motion system.

Next implementation work: retain the latest likeness/body references, construct each failing gait pose individually against a fixed anchor and limb-overlap drawing, verify opposite contacts, and only then pack. For straight front/back views, the existing runtime can mirror a verified four-frame half-cycle deterministically rather than trusting generated copies. Natural turns still need intermediate heading poses and planted-paw weight transfer.

No live atlas, manifest, build regions, or runtime files changed in this batch. The previous no-squeeze turn fix remains in develop. Production adoption remains incomplete because these gait checks have not passed, not because user permission is missing.

## Packed into the game (2026-09-30)

At the owner's request, the v3 sheets now replace all of Erwu's in-game art (`tools/build-art.cjs`).

**How they're packed:**
- **Poses sheet:** its 20 poses keep their old names, cut by hand-set regions around each figure. None overlaps a neighbour. It sets her colour.
- **Walks:** every walk sheet is recoloured to match the poses sheet.
- **Side walk:** 8 frames, at the sheet's own scale.
- **Toward, away and both diagonals:** 8 frames each, drawn as they are, each fitted to one height.
- **Anchors:** the toward and away frames are anchored on her head. A torso anchor followed her tail and would have shifted her body sideways every half-stride.

What the game shows was checked in the browser: every pose, her basket peeks, and all five walk views. The atlas is 817 KB, down from 990 KB. All unit and browser tests pass.

**Still in the old storybook style:** her swat and delighted poses, which come from the play-pieces sheet.

### Issues found, most visible first

1. **The diagonal walks limp.** In both diagonal sheets, frames 5–8 repeat frames 1–4 on the same leg: the near front paw lifts in frames 2–3 and again in 6–7, and the far one never lifts. About half her walking uses these views, so it shows.
2. **The tail jumps sides in the toward-us walk.** The bottom row is a mirror of the top row, so the legs do alternate, but the big tail swaps from her left to her right between frames 4 and 5. The away walk does it too, less visibly, because the tail stays near the middle.
3. **She's narrow from behind.** The away-walk cat is about 0.42 as wide as she is tall. The toward-walk body is about 0.5. At the same height she looks slimmer walking away.
4. **Style.** v3 is a detailed, realistic painting, and the garden, flowers and visitors are storybook watercolour. She now stands out from the scene more than before. That's a matter of taste, not a fault.
5. **The swat and delighted poses are still the old art.** They show briefly during a run, in the old style.

### Prompts to fix them

Attach `assets/erwu-v3/model.png` and `assets/erwu-v3/poses.png` to every one of these.

**Diagonals, one frame at a time.** For frames 5–8, edit the matching frame 1–4 and swap which leg does what. Crop that frame and attach it as well.
```
Edit this single frame of the attached cat walking diagonally [toward / away from] the viewer. Keep her body, head, tail, size, colour, lighting and position exactly the same. Swap ONLY which front leg and which hind leg do what: the leg that is lifted must now be planted, and the planted one lifted to the same height and bend. The near front leg (closest to us) must now be [planted / lifted]. Do not change anything else. Plain light grey background.
```

**Toward and away walks with the tail centred** (4 frames; the game mirrors them for the other half):
```
Edit this sheet: keep the top row's four frames exactly (her legs, body, head, size, colour and light), and delete the bottom row. Move her tail so it is hidden behind her body (walking toward us) or hangs straight down the middle between her hind legs (walking away), the same in all four frames. Keep her [body the same width as in the attached model sheet's front view]. Plain light grey background, four frames in one row, wide gaps.
```

**Her swat and delighted poses:**
```
Two poses of the attached cat, in the same painting style and colour as the attached poses sheet, each on a plain light grey background with wide space around it: (1) sitting side-on facing right, one front paw raised and batting forward at something; (2) sitting facing us, eyes happily closed, mouth slightly open, delighted. Draw each from the chest up only; the lower body is hidden behind a basket rim.
```
