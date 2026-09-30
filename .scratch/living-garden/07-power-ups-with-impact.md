# 07 — Make power-ups feel like events

Status: implemented. Dependencies: none. Art: none required (existing sun, drawn bee and dew).

## Outcome

Hitting a medallion is a moment she looks for. Each power-up visibly changes the board, stays useful late in a run, and has its own sound and feel.

## Current behaviour

| Power-up | Now | Late run (80+ pollen, buds with 40–150 hits) |
|---|---|---|
| Sunbeam | 2 hits to each bud on one thin line from Erwu | A few buds lose 2 of ~100 hits |
| Dewdrop | 1 hit to each bud in a small circle | Invisible |
| Bee | One bee for 4 s, 1 hit per sting | Invisible |

Their strength never grows while the buds' does, so after the first few turns they stop mattering.

## Design

Power scales with the run: `power = max(3, ceil(pollen × 0.6))`, where pollen is the current ball count. Buds' hits grow with turn and pollen (`hpFor`), so this keeps power-ups proportionate all run.

| Power-up | New effect | Feel |
|---|---|---|
| **Sunbeam** | A beam from Erwu sweeps **half the flower** (180°, starting at the medallion and turning toward whichever side holds more buds), over about a second. Every bud it passes takes `power` hits, once. | A warm sweep of light across the petals; each bud flares as it's struck; rising notes; a strong haptic. |
| **Dewdrop** | A **summer shower** over a wide circle (about half the flower's radius) around the medallion. Every bud in it loses a third of its remaining hits (at least 2) and is **washed back one ring** away from Erwu when that place is free. | Rain falls in the circle for a moment, ripples on the petals; buds slide back out. Buys a turn of safety. |
| **Bee** | A **swarm**: three bees (five from turn 30) that buzz for about 5 seconds, each sting worth `ceil(power / 6)` hits. They prefer the buds closest to Erwu. | Buzzing, bees darting between the nearest buds; Erwu watches them. |

Other changes:
- The medallion intros and the README describe the new effects.
- Each power-up leaves a mark in the garden (ticket 04).
- A power-up's effect counts toward the turn's hit total, so a sweep can earn "Gorgeous".
- The power-up reminder logic stays.

## Build requirements

1. Implement the three effects in `index.html` (`sunbeam`, `dewSplash`, `releaseBee`), keeping them within the flying phase so the turn ends only when the sweep, rain and bees are finished.
2. Washing back: move a bud to the next ring out in its sector only if nothing else is there and it isn't already at the rim.
3. Reduced motion: effects apply at once with a short flash instead of the sweep, rain and swarm motion.
4. Balance check with the bot: power-ups used on average should add a clear share of a turn's damage (target: a sunbeam late in a run halves or clears the buds it passes) without making runs dramatically longer. Record run lengths before and after.

## Acceptance criteria

- Each power-up's effect is obvious at 390 × 844 without reading text.
- Late in a run (turn 60+), a sunbeam visibly clears or halves buds across half the board.
- A dewdrop pushes buds back, never onto another item or past the rim.
- The bot's average run length changes by less than about 25%; record the numbers.

## Implementation record — 2026-09-29

- `sunbeam`, `dewSplash` and `releaseBee` in `index.html`, with `powerNow() = max(3, ceil(pollen × 0.35))`. The first try at 0.6 made bot runs 45% longer (108, 124, 156 turns), so it was lowered, and the shower soaks a quarter rather than a third.
- The turn waits for the sweep, the shower and its washed-back buds, and the swarm (`powersBusy`).
- Visuals: a sweeping beam with a warm glow over the swept half; a cool wash, rain streaks and ripples for the shower; three or five bees.
- Bot runs (aiming at the nearest bud, fast-forwarded) ended at turns 60, 65, 77 and 97 (mean 75) against 88 and 90 before: within the 25% allowed, though a single run varies widely.
- Checked late in a run (turn 45, 52 pollen): each power-up visibly took a large share of the board's hits.

## The dandelion clock (2026-09-30)

The owner asked for a power-up that spreads the stream of pollen at random, and approved the dandelion clock.

- **Using it:** hitting its medallion leaves a seed head standing where it was, for the rest of the turn.
- **The scatter:** every pollen that passes through the clock is sent off at a new random angle, up to 60° either way. Each one knocks a couple of seeds loose. A stream aimed at the clock sprays across the buds behind it.
- **How it looks:** the head goes bald as it's used, and a dashed ring shows where it scatters.
- **End of turn:** the last seeds blow away, and two land in the garden as wildflowers, flying there like chain seeds.
- **Code:** `dandelionClock`, `scatterBall`, `blowClocks` and `drawClockHead` in `index.html`.
- **What it doesn't do:** it adds no character key to the save, since that would make old saves fail validation. `BloomTime.note` ignores the unknown key.
- **Frequency:** it joins the other three in the same 22% chance of a power-up on a turn, so each of the four now appears a little less often.
