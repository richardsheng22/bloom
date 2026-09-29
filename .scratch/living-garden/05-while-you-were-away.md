# 05 — Something happened while you were away

Status: planned. Dependencies: 01, 03. Art: visitors and keepsakes (ticket 10) to show them.

## Outcome

Opening the game is a small surprise. Most times, something is new: a visitor at the fountain, a feather by the birdbath, footprints in frost, a flower that opened overnight, or a little present from Erwu by her basket. Missing a day costs nothing.

## Design

**When it runs.** Once per opening of the garden after at least 2 hours away. The time since the last check is stepped through in 3-hour slots, capped at 48 hours. Each slot has a time of day, so dusk slots can bring the fox and night slots the moths.

**What it produces**, at most:
- **One visitor present** when she arrives, for the current time of day and season, about 6 times in 10.
- **Up to two traces** from earlier visits (ticket 06 lists them), which stay for a day or two and then fade.
- **A present from Erwu** about once every three days of absence: a blue jay feather, a leaf, an acorn, a flower head, a pebble, a pine cone, depending on the season. She sits next to it looking pleased.
- **Growth on its own** from ticket 01, described in one line if it's notable ("The cosmos opened overnight").

**Deterministic.** Every roll is seeded from the garden's identity and the slot's time, and the last check time is saved first, so reloading never rerolls or duplicates.

**Cadence.** Each visitor has a class:
- common: likely in any matching slot;
- occasional: a few times a week;
- rare: **roughly every two to three weeks** (owner decision). After a rare visit the next is not eligible for 14 days; after that its chance rises each slot, so it almost always appears by day 21 of matching slots.

**First visits.** The first time each visitor comes, a small paper label says so ("A cottontail came by the beds"). Visits are recorded in `garden.discoveries` so the deferred album (legacy ticket 09) can use them later without new tracking.

**Presentation.** The garden view opens as usual; Play is available immediately. The present visitor stays for a short while (20–60 seconds) or until she starts a run. Tapping a visitor shows its name on the paper label. Nothing pops up over the garden.

## Build requirements

1. A pure module `garden-visits.js`: cast data (ticket 06), conditions, cadence, the slot simulation and its output. No canvas or browser globals.
2. Save: `visits: { checked, next: { kind: time }, seen: { kind: count }, traces: [...], gift }` in garden v4.
3. Garden view: draw the present visitor, traces and the gift from the visitor and keepsake sheets (ticket 10); nothing is drawn for a piece that isn't in the art manifest yet.
4. Unit tests: determinism across reloads, the 48-hour cap, rare cadence (no rare visitor within 14 days; eligible visitors seen by day 21 in a simulated year), season and time conditions, gift frequency.

## Acceptance criteria

- Over a simulated month of daily openings, about three openings in four show something new, and every visitor eligible in that season appears.
- Rare visitors appear roughly every two to three weeks, never twice within 14 days.
- Reload, backgrounding and clock changes never duplicate a visit, trace or gift.
- No text interrupts the garden; Play and Continue always work immediately.

## Out of scope

Notifications, collecting or trading visitors, feeding mechanics, completion percentages.
