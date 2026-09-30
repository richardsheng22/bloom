# 12 — Reward skilful shots, and celebrate what already happens

Status: implemented (2026-09-29); see the record. Dependencies: 07. Art: none.

## Outcome

Aiming well feels different from firing lots of pollen. A clever angle and a big chain are recognised the moment they happen, and the game's existing moments (a petal filling, clearing the board, passing her best) feel like small events.

## Owner decisions (2026-09-29)

From the suggestions, build **bank shots** and **chain blooms** now. Erwu's per-run requests wait until there are rewards worth asking for (see below).

## Design

**Bank shot.** A bud bloomed by pollen that reached it only off the rim, touching no other bud on the way. It's the shot that reaches a bud hidden behind others. Reward: +1 pollen for the next turn, at most twice a turn. Shown with a gold ring on the bud, "Banked! +1", a rising three-note chime, a double haptic tick and a happy bounce from Erwu.

**Chain bloom.** The 7th, 11th, 15th… bloom of one launch bursts into golden seeds that fly out and plant a flower in the garden. A chain rewards the garden, not the run. Shown with a burst of gold seeds, "Chain ×n ✿", two notes and a haptic tick. The bloom counter turns gold.

**Celebrations on existing mechanics** (no rule changes):

| Moment | Before | Now |
|---|---|---|
| Blooms during a shot | Nothing until the end-of-turn word | A "n blooms" count under the flower from 3, popping with each bloom |
| A bud cleared right next to Erwu | Nothing | "Close one!", a happy bounce and hearts (once a turn) |
| A petal fills | A glow and two notes | Plus a sparkle running out along the petal and a burst at its tip |
| Board cleared | "All clear" banner and hearts | A bigger banner, a petal shower, sun rays, a four-note chord and a delighted Erwu |
| Passing her best during a run | Only mentioned on the end card | "A new best" card the moment it happens, with a petal shower |

## Balance

Tuned with the bot (aims at the nearest bud, fast-forwarded), which sees banks rarely because it never aims for the rim. First try (chain from the 5th bloom, every 3rd) made runs far longer (122–150 turns): chains happened most turns. See the record for the final numbers.

## Erwu's requests (deferred): are there enough rewards?

For the run itself, yes, just about: extra pollen, a petal split shot, recharging her swat and a rare-seed bud already exist and are meaningful. For the garden, there's growth and rare seeds. What's missing is something that is clearly *a present for doing what she asked*, and that is seen again later. Candidates, cheapest first:
1. **Recharge her swat** or **a rare-seed bud next run**: existing rewards, no art.
2. **A keepsake she keeps in the garden:** a ball of yarn, a feather toy or a bell she plays with in the garden afterwards (needs a small art sheet and a few behaviours: she bats it, sleeps next to it).
3. **Her favourite spot:** a request completed on a bed makes it her napping spot for a while.

Recommendation: start requests with (1) and add (2) as the lasting reward, so requests feel like doing something for her rather than for points.

## Implementation record — 2026-09-29

- `celebrateBloom` and `chainScatter` in `index.html`; balls count the buds they touch (`b.touches`), and `hitBall` tells a bloom which pollen made it.
- Chains were tuned in three steps with bot runs (aims at the nearest bud, 8× speed):
  1. Seeds that hit nearby buds, from the 5th bloom: chains on most turns, runs 122–150 turns.
  2. From the 7th bloom, plus a pollen for the first chain of a turn: runs still clearly longer.
  3. **Final:** chains plant a garden flower only.
- The bot's run lengths vary enormously even on the unchanged game (33–180 turns with identical settings), so small differences can't be measured with a handful of runs:

| | Games | Range | Median | Mean |
|---|---|---|---|---|
| Unchanged game | 10 | 33–180 | 60 | 77 |
| Final rules | 12 | 41–158 | 106 | 101 |

  Banks averaged about 4 pollen a run for this bot, which never aims for the rim. Runs may be somewhat longer; the owner's play is the real check. If they are, the bank reward is the only rule change left to trim.
- Captured in play: the bloom counter, "Close one!" with Erwu reaching out, and a chain with the gold counter.

## The stubborn bud, made visible (2026-09-30)

Owner feedback: the "A stubborn bud" card appeared, but nothing showed which bud it meant, and nothing seemed to change.
- **What it was:** that turn's new row was one bud about twice as tough as usual, instead of two to seven buds. It was drawn like any other bud, and the older buds were still on the board, so the only effect was fewer new buds.
- **The look:** a slowly turning gold ring with a soft glow behind it, and a gold count badge.
- **The reward:** blooming it pays **3 extra pollen** for the next turn, with a gold burst, a four-note chime and a delighted Erwu. The card now says so: "the one in the gold ring: bloom it for 3 extra pollen".
- **Saving:** a run in progress saves the mark, so it survives a reload.

## Changes after play (2026-09-30)

- **Bank shots became trick shots.** A player can't aim a bank shot: every launch leaves the basket straight out, so it meets the rim head-on and comes straight back. Banks only happened by chance.
  - Now a bud bloomed by pollen that has bounced off a **mushroom** is a trick shot. Clipping a mushroom's edge sends the stream sideways into the buds beside it.
  - Each pollen counts once. The first two of a launch pay a pollen each and are celebrated ("Trick shot! +1").
  - Tested: a launch aimed just off a mushroom's centre made 10–13 blooms off the mushroom, with two paid. Aimed dead-centre, it comes straight back, like the rim.
- **Erwu's swat is once per game.** It used to come back with every full bloom, so a long game had several. Returning to the garden never recharged it: a saved game keeps a used swat.
- **The launch hint** ("Pull back anywhere…") fades by itself after 7 seconds on the game screen, as well as after your first launch.
