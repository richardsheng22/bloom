# 10 — Validate the whole experience on phones and protect saved progress

Status: planned. Priority: release acceptance. Dependencies: 01–08; include 09 when shipping it.

## Outcome

The expansion remains a comfortable one-thumb game, the garden feels owned and inhabited, and existing players keep their progress. This ticket verifies each delivered slice; it is not a reason to postpone validation until all features exist.

## Build requirements and acceptance matrix

### Save and lifecycle correctness

- Fixtures: fresh install; existing sparse garden; crowded 170-plant legacy garden; mature garden; customized layout; resting garden; active saved run; malformed optional data; storage quota failure.
- Verify migration, repeat migration attempts, interrupted writes, reload, backgrounding during flight, and resume from both presentations. Preserve the last valid save on failures.
- Verify 0/12/72/168/720-hour absences and clock rollback. Ownership and established progress stay constant; only bounded visual rest changes.
- Test moving/removing an object that is an Erwu target, entering play mid-action, pending garden return during a shot, and repeated input during transitions.
- If the design introduces multiple save records, define a coherent revision/recovery strategy so garden placement, cultivation progress, and discoveries cannot contradict one another after an interrupted save.

### Mobile interaction and presentation

- Automated viewport checks: 320 × 568, 375 × 667, 390 × 844, 430 × 932; a landscape case; safe-area variants; a reasonable desktop viewport.
- Actual iPhone Safari and Add to Home Screen checks: slingshot feel, edge gestures, keyboard/focus where applicable, sound preference, haptics, background/resume, rotation, and all bottom actions reachable above the home indicator.
- Test tap-based placement with one hand. A selected object, Erwu, and confirm/cancel controls must stay visible together.
- Test arrangement with every starter anchor occupied and with legacy border growth. Screenshots must show that added garden art leaves the arena and HUD readable.
- Check muted and reduced-motion modes, meaningful control labels, contrast of secondary text, focus handling, and ability to dismiss every sheet without a precision gesture.

### Performance and code seams

- Measure frame timing on a representative phone with a busy shot, mature garden, seed flights, butterflies, and Erwu behavior. Compare with the same v0.7 scenarios; record device/browser and results rather than claiming desktop emulation proves phone performance.
- Keep static garden art cached. Bound visitors, effects, behavior queues, overgrowth, and optional album media. Confirm old actions/listeners are cleaned up on transitions.
- Inspect idle/background resource use. Do not accumulate simulation catch-up work while the app is hidden.
- Add focused tests around state transitions, save migration, persistent rewards, and time calculations. Use browser interaction checks and recordings for canvas behavior rather than tests that merely duplicate rendering formulas.
- Confirm no console errors or runaway loops during repeated run/garden/edit transitions.

### Product acceptance

- Preserve the familiar aim → release → watch → advance rhythm.
- The player can recognize a chosen patch and the effect of their recent run.
- The resting garden feels welcoming and owned, never lost or awaiting chores.
- Erwu's sequence appears related to the actual garden, with enough quiet time to feel natural.
- Play/Continue remains immediately available, including during a charming animation.
- Final character fidelity is reviewed against supplied observations rather than generic cat behavior.

## Required from you

A brief hands-on session by you/your wife on the target iPhone is needed to validate actual comfort and personality. Report: device/iOS version, whether aiming still feels right, whether arranging feels easy, whether the return feels welcoming, and which Erwu action most/least resembles her. The implementer should provide a working preview and a short checklist; do not ask you to run developer tooling.

If physical-device access is unavailable, complete all independent checks and explicitly leave phone feel/haptics acceptance unverified. Do not claim a native iOS release or App Store readiness from this web milestone.

## Completion record to add during implementation

Record implemented ticket IDs, source commit(s), migrations tested, browser/device matrix, screenshots and motion captures, observed performance, owner/player feedback, resolved issues, and remaining limitations. Update README with the actual new behavior after acceptance. Deployment and native packaging are separate work; these tickets do not authorize a platform migration.
