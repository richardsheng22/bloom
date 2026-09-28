# Play feedback round, 2026-09-28

The owner's wife played the v0.9 build for a long session (to about turn 80). The iOS map is on hold until this round is settled.

| Feedback | Cause found | Change |
|---|---|---|
| Erwu walks weird, like she's moonwalking | Only side-on walk art; her routes ran straight up and down the lawn (e.g. basket to cushion: ~8 px down per 0-3 px sideways) | Steep stretches become a lazy zigzag no steeper than 0.75 (`meander` in `erwu-behavior.js`), clear of the roses and on the lawn; stride matched to the painted paws (1.25 nests per cycle). Proper fix: toward/away walk sheet, prompt 8 in `art-direction/PROMPTS.md` |
| Play area too crowded to aim | Each bud drawn as a tall plant with leaves (~2.9x its hit size) plus a badge above; up to 2 mushrooms a turn | Buds drawn as compact flower heads (~the hit size), count badge at their foot; at most one mushroom a turn. The 5-bud cap was deliberately not done: owner wants to see smaller buds first |
| Didn't know how power-ups work | Nothing said you hit them; intro only said what they do | Intros now say "hit it with pollen"; a one-time "Power-ups" how-to for players who already met them; a reminder after 3 unused ones in a run (until 5 have been used); a coloured burst when one is used |
| Power-ups unclear among objects | Bee pollen-sized, sun like a pollen cluster | Glowing, pulsing medallion in each power-up's colour; larger hit area |
| Didn't notice the background changing | Painted meadow already full of flowers, so grown plants got lost | During a run the meadow is washed back to a plain lawn by how much of the garden is missing or resting; it fills in as plants grow |
| Bored by turn 80 | Nothing new after the last introduction | Seasons every 25 turns (light + drifting air + card), special turns every 10-15 turns from 12 (gust, stubborn bud, butterfly turn) |

Not done by owner decision: the 5-bud cap and per-run goals.
