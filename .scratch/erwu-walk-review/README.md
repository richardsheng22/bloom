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
