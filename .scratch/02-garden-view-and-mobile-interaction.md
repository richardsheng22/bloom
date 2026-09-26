# 02 — Make the garden a usable place on a phone

Status: implemented and locally verified; physical iPhone acceptance remains in ticket 10. Priority: foundation. Dependencies: 01.

## Outcome

The player can linger in an interactive garden, then start or resume a run in one action. Garden interactions have enough space and cannot accidentally fire pollen.

## Current behavior and seams

`showTitle`, `leaveTitle`, `titleT`, `layout`, and `drawClearing` already transition between the clearing and arena. `Back to the garden` currently calls `newGame` after game over. `state` mixes title and turn lifecycle. Global `#app` pointer handlers treat almost any non-button input as aiming. Run snapshots are saved at stable turn boundaries by `markReady`.

## Build requirements

1. Treat presentation (`garden` / `run`) separately from run phase (`ready`, `flying`, `advancing`, `over`). Entering a garden must not implicitly start or reset a run.
2. Promote the existing landing clearing into garden view. Let the large title recede after entry so it does not compete with Erwu and plants. Keep Play/Continue reachable near the lower thumb area.
3. Add a small garden-return control during ready turns. If requested during flight/advance, finish the current turn and enter at the next stable boundary; give immediate quiet feedback, allow cancellation, and do not discard the shot. Repeated requests must not queue multiple transitions.
4. Preserve board contents, turn, balls, petal charges, swat, and pending next-shot effect when switching. Resume from the existing stable-save semantics. A new-run action remains explicit.
5. Garden input priority: visible UI → active edit/inspection mode → Erwu/object hit targets → empty ground. Run input remains the established slingshot. Clear pointer capture, aim, held presses, and queued gestures on every mode change or pointer cancellation.
6. Garden gestures: tap Erwu/object to interact or inspect; tap empty ground to dismiss inspection; explicit Arrange enters customization. No hidden required long press, pinch, or precision gesture. Ticket 03 supplies placement behavior.
7. Define safe layout zones using actual viewport and safe-area insets: compact top utilities, central inhabitable scene, bottom actions, and reserved space for an inspection sheet. Hit targets should be at least 44 CSS px, even when art is smaller.
8. On short screens, reduce decorative spacing and collapse the title before shrinking controls or obscuring Erwu. A compact sheet must not cover its selected object or trap Play/Continue. Avoid permanent panels around the scene.
9. Use a shared semantic scene layout with separate garden/run rendering transforms. Garden view may use the central clearing that the arena occupies during play. Later customization must not force plant art into the active arena.
10. In landscape or desktop layouts, keep the core portrait composition usable; do not stretch the circle or leave required controls offscreen. Handle rotation without moving owned objects in saved state.

## Acceptance criteria

- Exercise widths 320, 375, 390, and 430 CSS px, including 568/667 px short heights and safe-area examples. Controls, Erwu, and the selected object remain usable.
- Garden → run → garden preserves the run exactly at its stable boundary. Reload from either view offers the correct Continue state.
- Tapping, dragging, cancelling, or dismissing a garden interaction never launches pollen or carries a stale drag into play.
- Starting play during an Erwu action is immediate; no mandatory return-to-nest cutscene.
- Keyboard-accessible controls have meaningful labels and visible focus; dismissal returns focus sensibly. Canvas visuals have usable DOM interaction equivalents where necessary.
- Capture garden, inspection, run, and transition states at a small and a typical phone size. Validate gesture transitions, not screenshots alone.

## Required from you

None. Use the existing warm design and portrait, one-handed priority. Optional feedback on the first working garden/run transition; implementation should proceed with the interaction rules above.

## Out of scope

A separate scrolling world, free camera controls, multiple gardens, or a new menu hierarchy.

## Implementation record — 2026-09-26

Implemented on `develop` alongside the uncommitted ticket 01 changes. No commit or deployment was performed.

### Behavior delivered

- Separated `presentation` (garden/run) from turn `state` (ready/flying/advancing/over). Visiting the garden never calls `newGame` or regenerates the board. Completed runs remain completed until Play again is pressed.
- Added a leaf control to the run header. Ready turns enter immediately. Flying/advancing phases keep one pending return; the same control or Escape cancels it. The return happens after the stable snapshot is saved, including full-bloom sequences. A losing turn can enter the garden without a late game-over dialog reopening over it.
- Made the clearing interactive. Touch Erwu for a brief existing blink response, tap a visible plant to inspect it, or choose a named plant through Look around. This is a modest use of the existing renderer; reference-backed signature behaviors remain in tickets 05–08.
- Added a persistent scene/detail/action layout so inspection cannot cover Erwu or its selected plant. The title recedes; short screens start compact. Landscape places controls alongside the scene, while portrait retains lower thumb-area actions.
- Added `garden-view.js` for return-request decisions and a semantic garden projection. Both views use the same owned plant records; only rendering positions differ. Resizing and rotation never rewrite ownership coordinates. Tall plants retain headroom below the title.
- Provided at-least-44px DOM controls, keyboard plant selection, Escape/close dismissal with focus return, a focusable keyboard-aiming board, and inert inactive UI. Pointer capture/aim is cleared on view switches, cancellation, focus loss, and hiding the page. Garden drags never launch pollen.
- Play/Continue is immediate. The arena has a short visual-only fade with no input lock. Delayed introductions and game-over callbacks cannot leak into garden view. View changes invalidate the cached garden layer immediately.
- Preserved ticket 01's save/rest model. Seed flights already owned are settled visually on garden entry, without granting additional growth. Resting appearance and plant detail copy remain coherent.

### Ticket boundary

This ticket delivers inspection and safe input routing. Arrange/placement will be introduced with ticket 03's actual patch/object layout and confirmation/cancel behavior; no nonfunctional Arrange control is exposed here. There are no movable furnishings yet. Existing plant picking plus a named selector supplies touch and keyboard access without placing dozens of overlapping DOM buttons on the scene.

### Verification

- `node --test tests/garden-state.test.cjs tests/garden-view.test.cjs`: 18 passing tests for persistent ownership plus presentation requests, projected bounds, and picking.
- `tests/garden-browser.cjs`: ticket 01 browser regression passed, including all absence cases, stable-run resume, reduced motion, mid-shot hiding/resume, and storage failures.
- `tests/garden-view-browser.cjs`: passed at 320 × 568, 375 × 667, 390 × 844, 430 × 932, 568 × 320, and 1024 × 768. Covered touch inspection, keyboard selection/dismissal, control bounds, exact snapshots across visits/reload, garden drag isolation, simulated safe-area reservations, rotation, plant tapping/empty-ground dismissal, immediate play, cancelled pointers, queued return/cancel, ordinary/queued game over, and Full bloom advancement. No page errors.
- Screenshots use system-font fallbacks to avoid network dependence. See [review evidence](02-evidence/README.md).

### Remaining acceptance

Physical iPhone Safari touch feel, real safe-area behavior, audio, and haptics are not claimed verified by Chromium emulation. Those remain ticket 10 checks. The large new Erwu animation set, customization, and reference gathering remain in their own tickets.
