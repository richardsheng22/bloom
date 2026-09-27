# Painted garden and Erwu: evidence (2026-09-27)

These screenshots were taken in Chromium at phone sizes, with a test garden (no personal data). See [`assets/README.md`](../../assets/README.md) for the art pipeline and how the game uses it.

- `basket-asleep.webp`: asleep in her basket in the rose bed, with beds at three stages (flowering lavender, seedlings, young).
- `basket-hello.webp`: tapped while in the basket, she peeks over the rim.
- `walking-flowering.webp`: walking to the log; cosmos and sunflower in flower as drawn plants over the painted young bed.
- `resting.webp`: a garden left for a week (fallen leaves, long grass).
- `scene-320.webp`: the smallest phone, mid-walk.
- `landscape.webp`: 568 × 320.
- `painted-poses.webp`: every packed frame on its ground line, at one shared scale.
- `fallback-no-art.webp`: images blocked; the drawn garden stands in with no page errors.

Checks run:
- `node --test tests/*.test.cjs`: 52 pass.
- The browser suites `garden-browser`, `garden-view-browser`, `erwu-browser` and `erwu-render-browser` all pass with no page errors.
- `fountain-grounded.webp`: the fountain relit into the lawn's light, darker at its foot, with grass around the plinth (owner review: it looked like a placed image).
