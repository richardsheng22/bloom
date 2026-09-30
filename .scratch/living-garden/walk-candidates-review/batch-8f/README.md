# Erwu section 8f source asset batch

Generated against develop `a2985f3`, following ART-PROMPTS.md section 8f.

## Delivered

- Added diagonal toward frames 2, 4, 6, 8; replaced frame 3.
- Added diagonal away frames 2, 4, 6, 8; replaced frames 5 and 7.
- Touched up `assets/erwu-walk-front-4.png` and `assets/erwu-walk-back-4.png`: warmer overhead light, calmer front face, softer dusty-pink rear paw pads.
- Retained toward frames 1, 5, 7 and away frames 1, 3. No transition changes.
- Each direction now has eight individual source images, named `assets/erwu-diag-{front,back}-{1..8}.png`.

The built-in image generator edited each view's retained frame 1 as the anatomical anchor. Face and side-pose crops are in `../references/`. Exact generation and correction prompts are in `prompts.json`; its final back4HindCorrection entry supersedes the earlier back4 selection. Targeted corrections fixed copied foreleg ordering and the rear frame 4 hind-leg ordering.

## Review and evidence

Open `../corrected-preview.html` through a local HTTP server from the repository root. Both diagonal sequences now load all eight frames. `front-eight-review.png` and `back-eight-review.png` show the final sequence order; these contact sheets normalize figure height for visual comparison and are not scale measurements.

`alignment-check.json` contains local texture-registration estimates against the anchors for the eleven generated diagonal frames. Best-fit head-patch scales were 98–100%; body-patch scales were 95–102%. This is a local gradient-matching proxy, not an exact anatomical measurement or a guarantee that the complete silhouettes satisfy the 5% target. Retained frames were deliberately not regenerated.

The touched-up sheets' lower-leg silhouettes overlap the previous sources by 95.9–98.1%. Bounding-box changes are at most 4 px for front frames and 1 px for back frames. Poses remain visually consistent, but the edits are not pixel-identical: final region/paw alignment should be checked during packing.

Browser smoke checks passed: six sequences load, both diagonals contain eight frames, playback advances, scrubbing/mirrored front preview works, step/background/fit controls work, no page errors, and no horizontal overflow at a 390 px viewport. Screenshots and frame measurements are beside this file. This is a browser layout check, not device acceptance or validation of natural movement in the game.

## Handoff

As requested in the prompt's “After generating” section, this batch delivers source PNGs only. The production atlas, build-art regions, and runtime are unchanged. Pack the new sources, set their regions, then review a looping in-game preview for ground contact, stride timing, and any residual appearance changes between retained and regenerated frames before adopting them.
