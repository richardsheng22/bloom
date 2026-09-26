# 01 — Preserve the garden; let it rest while unattended

Status: implemented; resting visuals strengthened for owner review (see the v0.8 record below). Priority: foundation. Dependencies: none.

## Outcome

A garden retains its plants, chosen layout, objects, and progress through any absence. Time away changes its appearance into a gently resting, slightly overgrown place. Returning invites renewed activity without making the player repair damage.

## Current behavior and seams

`index.html` uses `bloom.garden1`, `loadGarden`, `saveGarden`, `decayGarden`, `welcomeBack`, `tendGarden`, and `drawPlant`. Plants store angle, radius, kind, growth, and a visual seed. After 12 hours, growth decreases; plants below a threshold are deleted. Growth also drives the five HUD buds and butterfly population. The replacement must address all these consumers, not merely stop deletion.

## Build requirements

1. Introduce a versioned garden model with stable plant IDs and persistent growth/maturity. Reserve stable IDs for patches, placed objects, and discoveries. Separate owned progress from temporary rest appearance.
2. Migrate existing plant kinds, visual seeds, growth, and positions without changing their visible composition. Keep a recoverable legacy snapshot until the new save has been successfully written and loaded. Do not promise recovery of plants already removed by old decay.
3. Replace destructive elapsed-time subtraction with a bounded rest value. Initial tuning: little change before 12 hours, a gentle transition across the following days, and a visually capped resting state. Make timings tunable and never expose a countdown.
4. Rest visuals: slightly closed/cupped flowers, relaxed leaves, a few soft grass tufts along edges, quieter visitor activity. Preserve color and visible plant identity. Avoid brown/dead plants, threatening icons, and piles of tasks.
5. Overgrowth is a bounded decorative layer derived from saved visual seeds; it is not a growing array of owned plants. It must not cover paths, controls, placed objects, or inspect targets.
6. Opening the garden begins a subtle welcome transition. Ordinary play can restore remaining liveliness over the next few turns. No cleanup gesture or minimum number of rounds is required. Revisiting without playing must still be pleasant.
7. Keep growth progress separate from liveliness in the HUD and visitor logic. An owned garden must not lose progress tiers because its flowers are resting. Decide whether visitor activity is lower while resting without removing recorded discoveries.
8. Replace guilt/loss copy such as “kept what she could” with neutral, affectionate wording. Make the end-of-run promise about keeping growth factually true.
9. Handle clock rollback, implausibly large elapsed times, repeated reloads, visibility changes, malformed saves, and failed storage writes without cumulative loss or rerandomization.

## Acceptance criteria

- Compare a representative legacy garden before migration and after 0 h, 12 h, 3 d, 7 d, and 30 d: plant IDs after migration, kinds, persistent growth, placement, owned objects, and unlocks are unchanged.
- A resting garden reads as inhabited and waiting, not damaged. Rest stops becoming more visually severe after its cap.
- Reloading during wake-up does not duplicate plants, reset progress, or repeatedly grant rewards.
- Existing run resume continues to work. Backgrounding during a shot does not change ownership incorrectly.
- Reduced motion shows understandable resting/awake states without requiring animated transitions.
- Migration and elapsed-time behavior have focused deterministic tests; actual visuals are reviewed in phone screenshots.

## Required from you

None to implement. Optional: whether “slightly untidy and sleepy” or “mostly serene with closed flowers” feels closer to your intended garden. Default to serene with restrained overgrowth. Review a fresh/resting/returning visual comparison before final visual tuning; no technical choices need to be delegated to you.

## Out of scope

Weather simulation, real-world seasons, weed removal, plant death, and pet-care needs.

## Implementation record — 2026-09-26

Implemented on `develop`, based on `3df8d53`. Changes are uncommitted; no deployment was performed.

- Added `garden-state.js` for versioned ownership, stable IDs, validation, legacy migration, verified writes, and backup recovery. `bloom.garden1` is retained untouched; new saves use `bloom.garden2` and its previous valid backup. Malformed/unrecognized data with no valid recovery, newer versions, and inaccessible storage are not overwritten.
- Separated persistent plant growth from a bounded rest value. Reserved identity namespaces and collections for future patches, objects, and discoveries; their UI is outside this ticket.
- Rest begins after 12 hours away and reaches its visual cap over the next 72 hours. No growth, plants, or progress tiers are removed. Clock rollback yields no negative elapsed time; very long absences cap visually.
- Flowers fold slightly, leaves relax, a maximum of twelve deterministic decorative grass tufts appear near the outer edges, and butterflies become quieter. Tufts avoid plant silhouettes, the path/arena, and visible title/HUD/action bounds. Future objects with unknown geometry suppress decorative placement conservatively.
- Visible visiting alone wakes a fully resting garden over approximately 90 seconds at normal frame cadence. Ordinary turns additionally reduce rest by 0.18 while retaining the existing growth reward. No cleanup or gameplay requirement was added.
- Save visible wake-up progress periodically and at lifecycle boundaries. Hidden pages do not advance the game or perform catch-up care. Plants whose seed flights are still animating persist once as owned plants.
- Updated welcome copy and flower counts to describe ownership honestly, and added an actual save-failure message. Updated the repository README and validation instructions.

### Verification

- `node --test tests/garden-state.test.cjs`: 15 passing tests covering exact migration, stable IDs, ownership through 0/12/72/168/720-hour absences, clock rollback/extreme time, wake-up/reload, turn growth, invalid data, newer formats, quota/readback failures, in-flight plants, intentionally empty saves, and a crowded 170-plant garden.
- `node tests/garden-browser.cjs` with configured Playwright/Chromium: phone-sized migration and run-resume checks across all absence cases, visible recovery without playing, reload during recovery, 320 × 568 reduced-motion interaction, actual pointer launch, hidden/visible mid-shot preservation, turn recovery, failed writes, and recovery from legacy after malformed v2 data. No page errors.
- Source syntax and whitespace checks passed. Browser screenshots use system-font fallbacks for deterministic offline execution.
- Visually inspected fresh/awake, resting, returning, and small/reduced-motion compositions. See [evidence](01-evidence/README.md).

### Practical limits and review

Physical iPhone Safari, haptics, and audio were not tested in this ticket; those remain ticket 10 acceptance. The original valid legacy state is preserved, but plants already deleted by the old decay cannot be reconstructed. No changes from tickets 02–09 are included. Owner visual feedback may tune the degree of flower folding and overgrowth; the non-destructive ownership behavior is implemented and verified.

## Review notes — 2026-09-26

- In `01-evidence`, the awake and seven-day resting captures are nearly identical apart from the sleeping “z”s and the status line. The ownership model is right; the look is too faint for a return to feel like one. Before acceptance, make rest readable at a glance on a phone: flowers visibly closed or cupped, a softer, cooler light over the clearing, fewer drifting petals, and the edge tufts a little more present. It should still read as serene, not neglected. Capture the before/after at 390 × 844 again for owner review.

## v0.8 record — resting visuals, 2026-09-26

Implemented on the working branch with tickets 03, 04, 05 phase A and 11. Ownership behaviour is unchanged; only the look moved.

- A resting garden view now sits in soft, cool evening light (a gentle blue-lavender wash over the scene, strongest at the top). Erwu is drawn above it and stays warm.
- Flowers fold further and tilt (open flowers up to about a third narrower and 60% shorter), stems droop a little more, and flower colours soften towards the paper colour by up to a quarter. Bed plantings fold and soften the same way.
- Drifting petals and motes thin out by up to 75%.
- Edge tufts now appear in the garden view too (previously they were suppressed once beds existed), at most twelve, kept clear of beds, furnishings and the path.
- Captured side by side at 390 × 844 (awake vs. fully rested): the difference is readable at a glance while staying serene. Owner review of the degree is still welcome.
