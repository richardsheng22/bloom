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
