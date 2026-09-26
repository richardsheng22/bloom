# Garden validation

The persistence and elapsed-time tests use Node's built-in test runner; no package installation or build step is required:

```sh
node --test tests/*.test.cjs
```

This covers save ownership and migration (`garden-state`), arranging beds and furnishings (`garden-layout`), cultivation, rare-seed pacing and the seed tin (`garden-beds`), and garden projection (`garden-view`).

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
