# Garden validation

The persistence and elapsed-time tests use Node's built-in test runner; no package installation or build step is required:

```sh
node --test tests/*.test.cjs
```

This covers save ownership and the version 4 fresh start (`garden-state`), arranging beds and furnishings (`garden-layout`), cultivation, rare-seed pacing and the seed tin (`garden-beds`), garden days, growth on its own, seasons and flowering (`garden-time`), visitors, their cadence and Erwu's presents (`garden-visits`), the soundscape's levels (`garden-sound`), and garden projection (`garden-view`).

The browser suites seed a version 4 garden built from the generated fixture by `tests/fixtures/garden-v4.cjs`.

The browser suite uses an existing Playwright installation and Chromium. It serves this checkout on an ephemeral loopback port and uses isolated browser storage; it does not access a player's saved garden. Google Fonts requests are blocked so tests use the shipped system-font fallbacks without external network access.

```sh
# Omit these overrides if Playwright and its browser are installed normally.
export BLOOM_PLAYWRIGHT=/absolute/path/to/playwright
export BLOOM_CHROMIUM=/absolute/path/to/chromium
export BLOOM_EVIDENCE=/tmp/bloom-ticket01
node tests/garden-browser.cjs
```

`BLOOM_EVIDENCE` defaults to `/tmp/bloom-ticket01`. The suite captures awake, resting, returning, and small/reduced-motion views. It covers legacy migration, 0/12/72/168/720-hour absences, wake-up persistence, exact run resume, backgrounding during a real pointer-launched shot, storage write failures, and recovery from a malformed new save. Tests use a generated garden fixture, not personal data.

These checks do not substitute for physical iPhone touch, Safari rendering, audio, or haptics acceptance.

## Garden interaction and run preservation

Using the same Playwright/Chromium overrides above:

```sh
export BLOOM_EVIDENCE=/tmp/bloom-ticket02
node tests/garden-view-browser.cjs
```

This suite covers 320 × 568, 375 × 667, 390 × 844, 430 × 932, 568 × 320, and 1024 × 768. It checks touch inspection, keyboard selection/dismissal, minimum target sizes, separate scene/detail areas, simulated safe-area padding, rotation without ownership changes, exact stable-run preservation, reload, cancelled pointers, queued return/cancellation, ordinary and queued game over, and return during Full bloom. It also captures garden, inspection, run, and queued-return screenshots. These are browser-emulated gestures and insets, not physical-device acceptance.

The browser suites serve `index.html` and any root-level `.js` module, so a new module needs no change to the test servers.

## Erwu in the garden

The behaviour module has its own unit tests (included in `node --test tests/*.test.cjs`). The browser suite runs a real visit and checks her day, a hello mid-walk, bed inspection without scene movement, backgrounding, Play mid-walk, the welcome after time away, the first bloom (recorded once), and reduced motion on a small phone:

```sh
export BLOOM_EVIDENCE=/tmp/bloom-erwu
node tests/erwu-browser.cjs
```

It opens the game with `?erwu=7`, which shows the development overlay and fixes her random choices. Butterflies still add some variety, so the checks allow for it.

## Erwu art review

The painted regression checks also exercise run/greeting blinks, sunflower direction with a stationary rim and reversible clock changes, and strawberry ripening in normal/reduced-motion rendering. `plant-traits.png` and `plant-traits-reduced.png` capture the production bed renderer. Physical-device acceptance is deferred to the future iOS roadmap by owner instruction (2026-09-28); browser results do not replace it.

`node tests/erwu-render-browser.cjs` uses the same Playwright environment overrides. It captures twelve enlarged poses/expressions and 320/390 px garden views, checks repeatable grain for an identical pose, and reports a local drawing-time sample. Set `BLOOM_BEFORE_REF=30a22a9` to also render the original v0.9 art. Its drawing hooks are injected by the local test server; they are not shipped in the game. The phone screenshots deliberately freeze one walking frame for visual comparison. Use `erwu-browser.cjs` for live behavior acceptance. Timing is a desktop sample, not an iPhone performance guarantee.

The current art review additionally loads the painted atlas, renders its sixteen production source regions in `painted-poses.png`, and records six seconds of the game canvas in `garden-motion.webm`. `after-poses.png` now shows the procedural fallback, not the primary painted garden art. The static art sheet does not certify animation quality; inspect the motion clip and the live game.

## Offline package (iOS app)

`npm run test:offline` (or `node tests/offline-package-browser.cjs`, with the same overrides) stages the package into `www/`, checks it holds exactly the listed files, then serves only `www/` and aborts every request to any other origin. It checks the bundled fonts and painted art load, plants a bed and plays a run. Evidence defaults to `/tmp/bloom-offline-package`.
