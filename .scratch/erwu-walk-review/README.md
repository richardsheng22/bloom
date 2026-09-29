# Erwu walking: asset refinement and diagnosis

Reviewed 2026-09-29 after pulling develop from `49a957d` to `a5576fe`.

## Outcome and scope

Replaced `assets/erwu-walk-updown.png` with a refinement referenced solely to `assets/erwu-walk-v2.png`: a smaller, calmer face, softer grey coat, more compact proportions and lower tail carriage. The exact generation brief is in `asset-prompt.md`. The old sheet is recoverable from Git.

This is a closer character match, **not an anatomically validated walk cycle**. Some generated paw poses remain too similar. The latest develop intentionally excludes this sheet from the atlas; this review preserves that decision. No gameplay, atlas or runtime animation code was changed. The live walking issues below therefore remain outstanding.

## What makes the current walk unnatural

### 1. Abrupt translation and turning — confirmed

`erwu-behavior.js` advances at a fixed speed from the first walking update. It follows straight waypoint segments, changes heading instantly at corners, and flips the side sprite immediately when horizontal travel changes sign. Its `meander` workaround deliberately adds diagonal travel because only side-facing sprites are available.

`diagnose.cjs` exercises the real behavior module at 60 Hz in a deterministic 358 × 400 scene, using the current painted stride factor (1.25). Depth scaling is held at 1 to isolate movement. These are fixture measurements, not universal measurements of every garden/device:

| Measurement | Current route | Same route without added meander |
| --- | ---: | ---: |
| Largest direction change in one update | 111.4° | 99.8° |
| Direction changes greater than 30° | 6 | 3 |
| Instantaneous left/right flips | 5 | 0 |
| Distance travelled in sampled walk | 414.94 | 293.44 |

The zigzag adds about 41% distance here. Removing it eliminates the flips in this example, but **does not solve sharp waypoint corners**. Curved steering and turn animation are both needed. The comparison substitutes only the two meander call sites in memory; it does not edit production files.

In a separate straight walk, first-frame speed is already 100% of cruise speed (34 scene units/second). Stopping truncates the final step rather than progressively braking. The initial diagnostic assertion reproduces this abrupt start and intentionally fails.

### 2. The pose blend produces ghost paws — confirmed in the renderer

`drawPaintedErwu` in `index.html` draws the current frame fully opaque, then overlays the next frame during the latter 65% of the frame interval. At phase 0.675 the calls are `walk-0` at opacity 1 and `walk-1` at opacity 0.5; at 0.95 the second opacity is about 0.983 while the first is still 1.

Where the next sprite is transparent, the old paws remain visible even near the end of the blend. At the next frame boundary those old paws disappear. This is an overlay with doubled silhouettes, not motion interpolation. `production-crossfade.png` and `render-trace.json` capture the actual production draw function at selected phases. They show why increasing crossfade duration cannot repair this gait. Even a correctly weighted dissolve would still show two paws between incompatible poses.

### 3. Sparse poses and unverified foot contact — confirmed limitations

The eight-pose side loop takes about 2.09 seconds at the sampled size: **3.83 distinct poses per second**. This is a pose-change rate, not the browser refresh rate. A slow amble can be appropriate; sparse poses plus dissolving feet make it look like a sliding paper cutout.

The phase advances with distance, which is useful, but the source frames have no authored contact timing or measured stride/root-displacement metadata. The existing distance/phase test does not track individual paws and cannot prove that a planted paw stays fixed against the ground. Exact paw-slip distance has not been measured in this review.

`tools/build-art.cjs` normalizes each walk frame to a common height and aligns its upper-body silhouette centroid. That is not a stable skeletal or planted-foot anchor, and can suppress intended vertical movement or introduce pose-dependent alignment shifts. It also recolors walking artwork against the general Erwu sheet; future directional sheets must share the same processing, not just match raw source colors.

### 4. Transitions and direction coverage — confirmed

`drawErwu` dissolves between pose kinds over about 0.3 seconds while movement can already be underway. There is no authored stand-up, first step, braking step or settling sequence. The front/back source sheet is not in the packed Erwu atlas and is never selected by the live renderer. Updating that PNG alone cannot change the current walking animation.

## Recommended direction, without constraining the authoring approach

**Build one consistent Erwu rig, animate it properly, and bake it into painted 2D sprites for the existing canvas game.** My preferred authoring tool is a modest 3D cat rig with hand-painted, soft gouache materials, rendered from fixed garden camera angles. This gives consistent anatomy and lighting across directions without requiring a live 3D engine in the app. A skilled frame-by-frame animator could deliver the same result; consistency and contact control matter more than the software.

Retain the garden's simplified illustrated finish: rounded grey mass, short sturdy legs, modest ears, relaxed gold eyes, restrained fur detail and soft edges. Use the real photos for Erwu's silhouette and temperament. Avoid turning the fur into scales or adding decorative back stripes.

The gait should have distinct stance and swing phases: a supporting paw stays planted while the body passes over it, then lifts and reaches for its next contact. Cat walking uses coordinated lateral-sequence footfalls, not four legs swinging together. Primary studies describe speed-dependent coordination and stabilization of paw trajectories: [interlimb coordination in walking cats](https://pmc.ncbi.nlm.nih.gov/articles/PMC4044364/) and [stabilization of cat paw trajectory](https://pmc.ncbi.nlm.nih.gov/articles/PMC4137248/). Exact timings should be measured from reference and tuned to Erwu, not assumed to be four equally spaced contacts.

Layer modest shoulder and pelvis motion over that gait, keep the head comparatively steady, and let the tail follow turns with a slight delay. Weight transfer should arise from supporting legs; arbitrary whole-body bouncing will look less natural.

### Suggested implementation chunks

1. **Canonical model and one excellent side walk.** Lock body proportions, camera, palette and root anchor. Author roughly 12–16 useful poses per cycle as a starting point, with contact events and measured cycle distance. Build a scrub/loop viewer with a ground grid and paw markers. Validate at actual game size before producing other directions. More frames alone are not acceptance.
2. **Movement and contact integration.** Replace constant-speed starts/stops with acceleration and braking. Follow collision-safe smoothed paths, derive heading from travel, limit turning rate, and remove forced zigzags once directional coverage exists. Drive gait from travelled distance using authored metadata, with a sensible cadence range. Avoid interpolating entire sprite silhouettes by opacity.
3. **Directional and transition coverage.** Bake eight directions with one camera and model. Add first-step, stop/settle, stand/sit and small/large turn sequences. Use heading hysteresis to avoid directional flicker and step through turns instead of mirrored snaps. Handle hops separately with lift, landing and appropriate pose progression. Do not stretch one ordinary walk frame across a jump.
4. **Garden and iOS acceptance.** Pack atlases with explicit pivots, contact metadata and consistent color processing. Measure decoded texture memory and loading cost on the intended iOS targets before choosing final resolution/direction count. Retain reduced-motion behavior. Check paths around objects and compare the whole scene at its normal display scale.

Optional reference from the owner: short clips of Erwu walking side-on, toward and away from the camera, starting, stopping and turning would improve her individual gait and tail habits. These are helpful for likeness, not a prerequisite to building the rig and diagnostic viewer. Existing photos are sufficient to begin the canonical model.

### Acceptance for the eventual replacement

- A planted paw remains fixed to the ground during a straight stance, with a proposed tolerance of one rendered pixel at normal game scale; record and measure it rather than relying on phase tests.
- All four limbs follow the intended contact order without clipping or doubled silhouettes.
- No single-frame heading reversals; direction changes have visible stepping and weight transfer.
- Starts and stops include acceleration/braking and appropriate body transitions.
- Equal elapsed time at 30/60/120 Hz produces consistent distance, contacts and destination behavior.
- Curved paths retain obstacle clearance; validate smoothing against garden geometry.
- Artist review confirms the same Erwu silhouette and palette in every direction and within the garden.
- Device-specific performance/phone acceptance remains a later iOS gate, not something proven by this desktop review.

## Evidence and reproduction

From the repository root:

```sh
node .scratch/erwu-walk-review/diagnose.cjs
node .scratch/erwu-walk-review/diagnose.cjs --direct-route
node .scratch/erwu-walk-review/diagnose.cjs --assert
node .scratch/erwu-walk-review/capture.cjs
```

The `--assert` command is intentionally red on the current implementation. It expresses the desired gradual start and is not registered in the normal test suite. Capture requires Playwright and its Chromium dependencies; `BLOOM_PLAYWRIGHT` and `BLOOM_CHROMIUM` optionally point to installed alternatives.

Files:
- `measurements.json`: current movement fixture.
- `direct-route-comparison.json`: controlled removal of meander only.
- `render-trace.json`, `production-crossfade.png`: production pose compositing evidence.
- `production-walk.webm`: six-second browser capture from the existing rendering suite; provided for replay, not a quantified paw-contact analysis.
- `asset-prompt.md`: exact generation brief for the selected source refinement.

The existing browser rendering suite passed with no page errors during this review. Its blink, greeting, pose and reduced-motion checks establish a baseline; they do not establish natural walking. No runtime repair is claimed by this asset/diagnosis change.

## Follow-up — 2026-09-29: the code half of chunks 2 and 3

The movement and rendering fixes that need no new art are done. The rig itself (chunk 1 and the art in chunk 3) is still open.

**Movement (`erwu-behavior.js`, `walkAlong` and `GAIT`)**
- She gathers speed over about half a second and brakes into her stop (braking from the distance left on her path).
- She steers for a point a little way ahead on her path at a limited turning rate (4.2 rad/s), so corners are rounded, not snapped, and she slows while her body is still turning.
- Left/right facing changes only once the new direction is clearly established.
- With front and back frames available (`w.directional`), steep stretches are walked straight; `meander` remains only as the fallback without them.

**Rendering (`index.html`, `drawPaintedErwu` and `paintWalk`)**
- Frames are blended by an exact cross-dissolve: each frame at its weight, added off screen (`lighter`), so a paw only one frame has fades with that frame. The old overlay kept the outgoing frame at full strength (the ghost paws above).
- `erwu-walk-updown.png` is now packed (`walk-front-0..3`, `walk-back-0..3`, colour-matched and torso-anchored like the side walk). She is drawn from the front walking down the lawn and from the back walking up it, with a 0.22 s dissolve when her view changes and a 0.26 s settle from a front/back walk into the next pose.

**Measured with `diagnose.cjs` (same fixture as above)**

| Measurement | Before | After (zigzag fallback) | After (directional, as in the game) |
|---|---:|---:|---:|
| First frame speed, share of cruise | 100% | 3% | 3% |
| Last moving frame speed | 12 | 5 | 5 |
| Largest direction change in one update | 111.4° | 4.0° | 4.0° |
| Direction changes over 30° | 6 | 0 | 0 |
| Instantaneous facing flips | 5 | 3 | 0 |
| Distance for the same route | 414.9 | 369.5 | 279.6 |

`diagnose.cjs --assert` now passes. New unit tests in `tests/erwu-behavior.test.cjs` cover the ramps, the turning limit, no flip-flopping, straight directional walks, rounded corners staying out of the roses and on the lawn, and consistent results at 30, 60 and 120 Hz. `after-walk-sheet.png` is a browser capture every 0.2 s of a walk to the fountain and back to the basket.

**Still open (needs art, as recommended above):** poses are still sparse (3.8 a second on the side walk, fewer on the 4-frame front/back walks); no authored start, stop or turn steps; paw contacts are not verified; no diagonal views, so a 45° stretch uses the side walk.

## Follow-up — 2026-09-29 (owner feedback: still noticeable at direction changes and the sun stone)

- **Hop onto the cushion or stone:** was a 0.45 s straight slide in the walking pose after an instant switch to side view. It is now a turn toward the target, a 0.22 s crouch, and a 0.4 s arc in the leap pose (`hop` in `erwu-behavior.js`). `after-hop-sheet.png` captures it every 0.1 s.
- **Turning round side-on:** was a one-frame mirror. She now narrows to a sliver and widens facing the other way over 0.2 s (`TURN_MS` in `index.html`), a standard 2D stand-in for turn frames.
- **Noted, needs art:** her poses on `erwu-sprite-v2.png` (loaf, sit, curl) are darker and more saturated than the walk frames, so she visibly changes colour when she stops. The front/back walks have 4 frames against 8 for the side walk, and there are no diagonal (three-quarter) views, so a change between side and front/back is a 0.22 s dissolve between two different drawings.
