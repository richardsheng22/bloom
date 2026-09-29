# A living garden: time, seasons, visitors and power-ups with weight

Planning date: 2026-09-29. Branch: `claude/ios-game-improvements-gadloe`. Source baseline: `0f6d259` (play-feedback round).

This series comes before the remaining iOS 1.0 tickets (04 onward). It changes what the game *is* for its player, so it has to land before device acceptance (iOS 13) and the beta (iOS 14) evaluate it.

## Why

A review on 2026-09-29 played the game with a bot that aims at the most threatening bud. Its runs ended at turns 88 and 90, close to where the owner's wife got bored (about turn 80). Random aim died around turn 25. Measured in one run:

- **The beds finish in one run.** With all three beds planted before the run, all three were fully established by turn 31. `garden-beds.js` says its pacing was tuned on random-aim runs of 9–18 turns. Real runs are five to eight times longer.
- **The growth meters finish in one run.** The five garden buds under **Best** were full by turn 20–30, and the wild garden hit its 170-plant cap.
- **The garden starts nearly finished.** The painted backdrop (`garden-plate.webp`) has full flower borders from first launch. The art brief wanted the borders to "fill in as the garden grows, so the lushness is earned"; the delivered plate has them built in.
- **Coming back brings nothing new.** After a few hours away the garden dims and asks for "a few turns" to wake it.
- **Power-ups barely register.** They deal 1–2 hits to buds that carry 40–150 hits late in a run.

Together these explain the play feedback: she didn't notice the background changing, because it changed early over a backdrop that already looked finished, and she was bored by turn 80, because the garden was done by turn 30.

## Direction

The garden becomes slow, seasonal and alive. It grows over days and weeks, follows the real calendar, reflects how she plays, and has something new waiting whenever she opens it. The run gets power-ups that feel like events.

Principles kept from the v0.8/v0.9 plan: no deadlines, no streaks, no lost progress, no obligation, one-thumb play, calm pacing. Missing a day costs nothing.

## Owner decisions (2026-09-29)

| Question | Decision |
|---|---|
| Existing gardens | **Everyone starts bare in 1.0**, including the owner's family. Old saves are left untouched in storage, never deleted, but the game starts a new garden. |
| Hemisphere | **Northern.** Seasons follow the northern calendar. |
| Growth without play | **Yes.** The garden grows a little each day on its own; play grows it faster. |
| Rare visitors | **Roughly every two to three weeks** each, not twice a season. |
| Cast | Agreed, plus a **cottontail rabbit** (the white-tailed rabbit that visits the owner's garden) and a **blue jay instead of the robin**. |
| Power-ups | **Redesign them to have real impact** (for example a sunbeam that sweeps half the board). |

Because the owner's garden has blue jays and cottontails (North America), the whole visitor cast is North American. The hedgehog from the first sketch is replaced by a chipmunk, since hedgehogs don't live wild there.

## Tickets

| Ticket | Result | Needs art | Depends on |
|---|---|---|---|
| [01](01-garden-time.md) | Growth paced by days: a daily tending budget, growth on its own, rest-dimming retired | No | — |
| [02](02-bare-start-and-milestones.md) | A new, bare garden in save v4 that fills in over weeks, with milestone moments | Bare backdrop (08) for the final look | 01 |
| [03](03-calendar-seasons.md) | Real northern seasons: light, what flowers when, winter dormancy, snow and leaves | Seasonal backdrops and clumps (08, 09) for the final look | 01 |
| [04](04-a-garden-that-reflects-play.md) | Kinds and places shaped by how she plays: buds decide flowers, drifts spread, power-ups leave marks | Three new clump kinds (09) | 01 |
| [05](05-while-you-were-away.md) | On opening: something happened. Seeded visits, traces, Erwu's gifts, first-visit labels | Visitors and keepsakes (10) to show them | 01, 03 |
| [06](06-visitor-cast-and-erwu.md) | The cast, their conditions and cadence, and how Erwu reacts to each | Visitors (10) | 05 |
| [07](07-power-ups-with-impact.md) | Sunbeam sweeps half the board, dew shower soaks and pushes back, a bee swarm | No | — |
| [08](08-art-bare-and-seasonal-backdrops.md) | Art: the bare backdrop in four seasonal versions | Owner generates | — |
| [09](09-art-seasonal-clumps.md) | Art: seasonal clumps and three new flower kinds | Owner generates | — |
| [10](10-art-visitors-and-keepsakes.md) | Art: two visitor sheets and a keepsakes sheet | Owner generates | — |
| [11](11-garden-soundscape.md) | Optional: a quiet garden soundscape by season and time of day | Audio (owner choice) | 03 |

## Order

1. **No art needed:** 07, then 01, 03 and 04 in code with existing art standing in, then the engine of 05. At the end of this step she sees a garden that changes daily and seasonally and differs by how she plays.
2. **Art round (owner):** 08, 09 and 10 can be generated in parallel from the prompts in [ART-PROMPTS.md](ART-PROMPTS.md). Each sheet is packed by `tools/build-art.cjs`, whose regions are set by hand after the sheet arrives.
3. **With the art:** finish 02, 03 and 04 visually, and show visitors (05, 06).
4. **Optional:** 11.

## Status

| Ticket | Status |
|---|---|
| 01 | Implemented; pacing measured (a common bed in about five days) |
| 02 | Save v4 and the bare start implemented; a stand-in wash until the bare backdrop (08) |
| 03 | Calendar, light, flowering months, winter rest and air implemented with existing art |
| 04 | Implemented; tulip, peony and poppy use stand-in clumps until 09 |
| 05 | Engine and tests implemented; nothing is drawn until the visitor art (10) |
| 06 | Cast data implemented; drawing and Erwu's reactions wait on 10. The robin is now a drawn blue jay |
| 07 | Implemented and balanced against bot runs |
| 08–10 | Waiting on the owner: prompts in [ART-PROMPTS.md](ART-PROMPTS.md) |
| 11 | Not started (optional) |

Update this table with the tickets.
