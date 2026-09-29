# Movement asset corrections

Based on develop `d548a20` and the revised instructions in `ART-PROMPTS.md` §8e. Generated with the built-in image tool. Original rejected sheets remain available for comparison; use the new filenames below for further review, not the rejected eight-frame sheets.

## Delivered source images

| Files under `assets/` | What changed | Review result |
| --- | --- | --- |
| `erwu-walk-front-4.png` | Four large front-view half-cycle poses, hidden tail, neutral balanced lighting | Suitable for testing the specified mirrored second half; no claimed foot-lock validation |
| `erwu-walk-back-4.png` | Four rear half-cycle poses, centered hanging tail, neutral balanced lighting | Same mirroring approach; tail stays between the hind legs |
| `erwu-diag-front-1.png`, `-3.png`, `-5.png`, `-7.png` | Individually generated three-quarter front poses using the corresponding side crops | Different foreleg reach/support/swing roles; frame 7 required an explicit near/far foreleg swap |
| `erwu-diag-back-1.png`, `-3.png`, `-5.png`, `-7.png` | Individually generated rear three-quarter poses | Frame 5 required separate foreleg and hind-leg corrections; frame 7 required a foreleg correction |
| `erwu-transitions-2.png` | Turn away, rear stop, front-paw landing with tucked hind legs, airborne hop with all paws tucked | Distinct requested key poses, replacing the previous play-bow interpretation of landing |

The front/back and transition sheets are 1774 × 887. Individual diagonals are approximately 1493–1686 × 933–1054; the generator varies its canvas dimensions. Exact silhouette bounds used by the review are recorded in `corrected-measurements.json`. New front silhouettes are about 390–398 px tall instead of the old ~230 px, with wide cell gutters.

## Inspection

- Reviewed the latest repository critique and its cropped paw strips before generating.
- Used precisely cropped source frames 1, 3, 5 and 7 from the existing side sheet, in `references/`. The crop rectangles come from the existing atlas builder; these are source references, not replacement art.
- The initial front/back results still had unilateral golden rim lighting. A targeted relighting edit removed it so the light no longer visibly swaps sides when mirrored. Tails are hidden/centered as requested.
- A front-diagonal passing attempt incorrectly repeated the extended leg; it was discarded and regenerated. Subsequent single-leg edits made the opposite foreleg roles explicit rather than relying on the generator to infer a full alternating cycle.
- The rear frame 5 initially retained the same planted hind leg; an additional hind-only edit changed the support/swing roles. Exact successful prompts are in `correction-prompts.json`.
- Browser screenshots include original/mirrored front poses to show that the leading paw swaps, plus the diagonal and transition views after display-only grey removal.

## Remaining acceptance boundaries

These corrections address the rejected sheets' layout, tail, lighting, view and repeated-pose problems, but **do not establish a production-quality walk cycle**. The diagonal images are four key poses per view as requested, not eight finished frames. Their head/torso proportions, tail shape, warm edge light and camera elevation still vary somewhat across independent generations. Exact correspondence of all four limbs to the original side cycle is not guaranteed. They need stable pivots, consistent scale/color processing and gait review before use. The rig prototype remains the reliable route to fully consistent anatomy, contact timing and intermediate frames.

The front/back viewer mirrors the four source frames for the other half. This visibly exchanges left/right paws, but final stride cadence and contacts still need animation review. Whole-body mirroring can also reveal residual facial asymmetry. Do not ship the raw half-cycle twice without mirroring.

The transition images are independent key poses. Playing them sequentially in the viewer is an inspection convenience, not a proposed animation clip. The airborne pose needs a flight-height offset at integration; the viewer's generic baseline does not supply one.

No production atlas, manifest, renderer or behavior files changed in this correction batch. The already merged movement fixes on develop are preserved.

## Interactive review

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/.scratch/living-garden/walk-candidates-review/corrected-preview.html`.

Choose a sequence, play/pause, step or scrub frames, change speed, and compare against a lawn-colored background. The front/back sequences preview the mirrored second half. The rejected front sequence is available for comparison. Large and small renderings show detail and approximate game-scale legibility.

The viewer fits silhouette height by default for comparison; turn that option off to expose raw size variation. Neither mode substitutes for authored root/paw anchors. Cut-out is performed only in the preview; source PNGs retain their grey background for the existing packing process.

Browser smoke checks passed for all six sequences, playback, scrubbing, stepping, background/scale controls, and a 390 px viewport without horizontal overflow. No page errors. Reduced-motion preference starts paused. Screenshot evidence and source bounds are next to this file. These checks verify the review tool, not natural gait or iOS acceptance.
