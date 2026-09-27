# Erwu pencil treatment — 2026-09-27

Based on `develop` at `30a22a9` (v0.9). Both supplied screenshots were read from the Windows mount. They are references only and have not been copied into the repository.

The second reference informs the medium: graphite-like shading, subtle paper grain, fine broken contours, and delicate whiskers. Erwu retains her grey coat, amber eyes, round build and half-lidded expression; the reference's white chest and long-haired silhouette are not adopted. This is a first procedural art pass for owner review, not a claim of final character fidelity or an exact match to the reference.

- Removed the three explicit dark back stripes in all side poses, the forehead bars, and repeated chest chevrons.
- Replaced flat body/head fills with tonal washes and fixed-seed dry-brush flecks. Fine paper grain is generated once and reused; it cannot flicker between identical frames.
- Softer cheek/chest joins, smaller garden heads, finer almond eyes and whiskers, tapered tails and side legs. Garden, run, and game-over poses share the treatment.
- Behavior selection, movement, route finding, timing, touch interactions, and save formats remain as in v0.9.

## Evidence

- `before-poses.png` / `after-poses.png`: same twelve enlarged poses and expressions, original v0.9 vs current renderer.
- `garden-320.png`, `garden-390.png`: complete phone views of the final art.
- `scene-320.png`, `scene-390.png`: garden scenes at those widths, with a frozen walking pose for review.
- Other PNGs: live behavior suite captures from this work session (before the last fine-grain adjustment).

## Verification

- 52/52 Node tests pass (`node --test tests/*.test.cjs`).
- Full `tests/erwu-browser.cjs` passes: roaming, mid-walk hello, arranging, background/resume, immediate Play, welcome back, first bloom recorded once, reduced motion at 320px, no page errors.
- `tests/erwu-render-browser.cjs` passes: stable pixels for an identical pose, nonempty rendering, both facings exercised, no page errors, twelve-pose sheet and final phone screenshots.
- Local desktop drawing sample: approximately 0.53ms per side pose versus 0.07ms before; not a physical-device benchmark.
- `git diff --check` passes. No physical Safari/iPhone check, commit, push or deployment performed.

Reproduce with the Playwright/Chromium overrides in `tests/README.md`, plus `BLOOM_BEFORE_REF=30a22a9` and `BLOOM_EVIDENCE=.scratch/erwu-sketch-evidence`.
