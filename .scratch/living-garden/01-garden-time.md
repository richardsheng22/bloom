# 01 — Pace the garden by days, not turns

Status: implemented. Dependencies: none. Art: none.

## Outcome

The garden grows over days and weeks. Playing grows it faster, but no single sitting can finish it. It also grows a little on its own, so there is always something slightly further along when she opens the game. Being away never takes anything away.

## Current behaviour (measured 2026-09-29)

- The focus bed grows 0.012 per turn plus up to 0.03 per shot from blooms (`BloomBeds.GROW`). A full bed (growth 1) takes about 24 turns; three planted beds were all established by turn 31.
- Blooms plant up to 8 flowers per shot and misses up to 5 seeds, so the 170-plant cap and the top garden tier are reached within one run.
- Every turn adds 0.035 growth to every wild plant (`BloomGarden.tend`).
- After 3 hours away, `rest` rises and the garden dims; a visit wakes 20% of it and each turn another 18%.

## Design

**A garden day.** A day runs from 4:00 to 4:00 local time, so late-evening play counts toward the day it started in. The save records the current day's key and how many turns have been tended in it.

**A daily tending budget.** The first 25 turns of a garden day count fully. After that, each turn counts a quarter. Nothing is lost by playing more; it simply stops racing ahead. The budget is invisible to the player: no counters, no "come back tomorrow" messages.

**Target pacing** (tunable, record observed values):

| What | Target with about 25–40 turns a day |
|---|---|
| A common bed from just planted to established | About 5 days |
| A rare bed | About 7 days |
| New wild plants | About 8 a day at full weight, plus growth of existing ones |
| The top garden tier (the five buds under Best) | About 3–4 weeks |
| The 170-plant cap | About 3–4 weeks, after which plants mature into neighbours (ticket 04) |

**Growth on its own.** When she opens the game on a new garden day, each day that passed (up to 7) gives:
- every planted bed a small amount of growth (about 0.03 a day), so a bed nobody plays still flowers in about a month;
- one or two new wild plants and a little growth for the existing ones.

These are part of ticket 05's "something happened" moment rather than silent numbers.

**Rest is retired.** Absence no longer dims or hides the garden. The `rest` field stays in the save format (always 0) so older code paths and tests keep a valid value. The dormancy drawing code is reused by ticket 03 for winter. The "The garden is resting" line is removed.

**The run still feeds the garden visibly.** Seed flights, sprouting and bed news during a run stay as they are; only the amounts change.

## Build requirements

1. Add a pure module `garden-time.js` (no canvas or browser globals, like the other garden modules): day keys, the turn weight for the current day, calendar season (ticket 03), and the elapsed-days growth.
2. Record `day: { key, turns }` in the garden save; start a new day's budget at 4:00 local time.
3. Scale bed growth, wild planting, `tend` growth and full-bloom feeding by the turn weight. Cap new wild plants per day.
4. Apply growth on its own once per new garden day, capped at 7 days, deterministic for the day (a reload never applies it twice).
5. Retire absence rest: `welcomeBack` no longer raises it and no longer shows the resting note.
6. Clock changes: moving the device clock backwards never removes growth and never applies growth twice; moving it forward applies at most 7 days.

## Acceptance criteria

- A bot playing 40 turns a day establishes a common focus bed on about day 5, not within one sitting. Record the observed curve.
- One 90-turn sitting does not reach the top garden tier or the 170-plant cap.
- A garden left alone for a week has visibly grown when opened.
- Reloading, backgrounding, or opening the game many times in a day never applies a day's growth twice.
- Unit tests cover day keys around 4:00, the budget taper, the 7-day cap, and clock changes.

## Out of scope

Push notifications, streaks, daily rewards, catch-up purchases.

## Implementation record — 2026-09-29

- `garden-time.js` (`BloomTime`) with `tests/garden-time.test.cjs`: garden days from 4:00, the budget (25 full turns, then a quarter), 5 wild plants a day from play, growth on its own (0.03 a day to every planted bed, 1 wild plant, +0.05 to every plant, at most 7 days at once), and clock changes that never apply a day twice.
- `BloomBeds.GROW` retuned (turn 0.002, bloom 0.002, at most 0.0055 a shot, miss 0.0003, full bloom 0.015). Misses now share a shot's cap with blooms: a late shot bounces dozens of times, and uncapped misses established a bed in two days.
- Seeds that find no new ground still fly out and feed the nearest plant, so a run keeps its seed flights all day.
- Rest is retired: `rest` is always 0, nothing dims on return, and the resting note is gone.
- Measured with a bot planting three beds and playing 40 turns a day: the focus bed reached 0.22, 0.44, 0.71 and 0.99 on days 1–4, so it's established on day 5; the garden reached tier 2 by day 3 at about six new plants a day, putting the top tier around week 3. The second bed only starts growing in earnest once the first is established.
