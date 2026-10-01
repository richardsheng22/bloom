# How Erwu walks

The movement is in `erwu-behavior.js` (`GAIT`, `walkAlong`) and the drawing in `index.html` (`drawPaintedErwu`, `paintWalk`). The 2026-09-29 diagnosis that led here, with its measurements, recordings and before/after sheets, is on the `archive/docs-2026-10-01` branch.

- **Speed:** she gathers speed over her first steps and brakes into her last, so there's no full-speed start or truncated stop. The walk cycle is driven by distance, so her paws don't slide.
- **Steering:** she steers toward a point a little ahead on her path at a limited turning rate. Corners are rounded, and she slows while still turning.
- **Facing and view:** she turns to face left or right only once the new direction is clear. She's drawn side-on, at three-quarters, or straight toward or away from us, by the direction she walks. Each view has its own way in and out, so it doesn't flicker.
- **Frames:** walk frames cross-dissolve exactly, so no ghost paws are left behind. A change of view dissolves over 220 ms, and turning round side-on narrows and widens over 200 ms.
- **Hops:** onto the cushion or stone, a hop is a short crouch, then a leap in the pounce pose.

## The check

```sh
node .scratch/erwu-walk-review/diagnose.cjs --assert
```

It runs the real behaviour module at 60 Hz in a fixed 358 × 400 scene. It fails if she starts at full speed, turns more than her turning rate in one update, flips facing back and forth, or brakes badly. The gait unit tests in `tests/erwu-behavior.test.cjs` cover the same ground at 30, 60 and 120 Hz.
