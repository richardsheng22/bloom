# 11 — Find rare seeds in play and grow unique plants

Status: implemented; pacing observed (see the v0.8 record). The 2026-09-28 web closeout restores clock-driven sunflower canopy movement and strawberry ripening in the painted path. Strawberry beds retain white flowers while fruit changes from pale green to red over growth 0.75–1; the source painting and stone rim remain intact. These traits also render under reduced motion, without continuous sway. See [closeout evidence](v09-closeout/README.md). Dependencies: 03 (beds), 04 (patch progress model).

## Outcome

Now and then a run turns up a rare seed. The player carries it home, plants it in a bed, and grows something that no ordinary bloom produces, each with a small trait of its own. It gives a light reason to return (“what's in that bed now?”) without deadlines, grinding, or a currency.

## Current behavior and seams

Board items are spawned in `spawnRing` (buds, orb, petal, power-ups, and later mushrooms and rings). Blooming a bud already sends a seed flight to the garden (`flowerFromBloom`, `plant(..., from)`), which is the natural animation to reuse. Ticket 04 defines bed progress; ticket 01's save model reserves stable-ID domains; ticket 03 owns beds and anchors.

## Design

**Finding.** Occasionally a *seed bud* appears in a spawned ring: an ordinary bud with a visible glinting seed pod, and the same hit points as its neighbours. Blooming it sends a distinctive seed flight to a small seed tin on the HUD instead of into the border. It changes no damage, spawn difficulty, swat, or score, and it is not a power-up.

**Pacing.** Tunable starting values, to be checked against observed runs:
- The first seed bud is guaranteed within the first two runs after the feature ships.
- After that, on average one every two to three runs, with bad-luck protection: the chance rises each run without one, so a drought never lasts long.
- At most one seed bud on the board at a time.
- If a seed bud reaches Erwu or the run ends first, nothing is lost. The next one arrives sooner. No “missed it” message.
- No duplicates until every kind has been found. After that, repeats let a favourite be planted again.

**Unique plants.** A starting set of six, each with one gentle trait. Traits are visual or affectionate; none affects the run.

| Plant | Trait |
|---|---|
| Catnip | Erwu is visibly pleased when it's grown (v0.8: a content expression while sleeping or sitting nearby; v0.9: she seeks it out through ticket 06). |
| Sunflower | Tall; its head follows the light across the day by the device clock, and it shades the nook beside it. |
| Moonflower | Closed by day and open in the evening, by the device's local time. Never a deadline: it is simply different at night. |
| Dandelion | When mature, a tap in garden view blows its seeds away in a puff; it re-forms over later turns. |
| Bleeding heart | Arching stems of heart-shaped flowers, echoing Erwu's hearts. |
| Wild strawberry | Low leaves and white flowers that ripen into red berries over several turns. |

**Planting.** In garden view, the seed tin lists seeds in hand. Choose a seed, then an empty bed; show a preview with Plant and Cancel, as in ticket 03. The planted seed grows through ticket 04's stages from ordinary play. A rare plant may take somewhat longer to establish than a common flower, but it uses the same reward routing, not a second growth system.

**Capacity.** There are three beds. If all are occupied, seeds wait in the tin indefinitely. Replanting an occupied bed must be an explicit choice with a preview, and the current plant is never destroyed: it returns to the tin as a potted keepsake keeping its progress, and can be replanted later. If this feels cramped in review, add planting anchors in ticket 03 rather than shrinking beds.

**Seed tin.** Shows only seeds found. Whether to hint that more exist is an owner choice (below). Default: a single “there may be others out there” line, with no count, silhouettes, or completion percentage.

## Build requirements

1. Add a seed-bud board item in `spawnRing` with the pacing rules above. Include it in the run snapshot (`bloom.run3` items) so resume preserves it.
2. Record a collected seed in the garden save at the moment it is collected, with a stable ID and dedup protection. Reload during the seed flight, backgrounding mid-shot, and game over on the same turn must neither lose nor duplicate it.
3. Extend the ticket 01 save model with a versioned seed collection and a bed planting reference. Migrate existing v2 saves without changing anything else. Keep the pacing counter in the save, not the run, so it survives new runs.
4. Draw each unique plant in the existing watercolour, hand-drawn style at every ticket 04 growth stage and in resting (ticket 01) appearance. Each must be recognisable at phone size in both the garden view and the run view border.
5. Implement the six traits. Time-of-day traits use the device's local clock, update when the garden is revisited, and must be understandable without text.
6. A seed bud must be distinguishable from ordinary buds without colour alone (shape of the pod as well as its glint), and the tin must have DOM controls with labels.
7. Reduced motion: the seed flight becomes a short fade to the tin; the dandelion puff becomes a state change.
8. Emit two event records for ticket 09: first seed found, and first unique plant in flower (per kind).

## Acceptance criteria

- Over several observed ordinary runs, the first seed arrives within two runs and later seeds feel occasional, not rare to the point of being forgotten. Record actual counts before calling pacing tuned.
- A seed can be found, carried home, planted, and grown to flowering through ordinary play, and survives reload, rest, and rearrangement throughout.
- No change to run difficulty or score from seed buds or unique plants. A bot or scripted run with and without the feature shows the same hit-point and spawn distributions apart from the seed bud itself.
- All six plants read clearly at 320 × 568 and 390 × 844 and look at home beside the existing daisies and cosmos.
- Moonflower and sunflower change correctly when the device clock is moved forward and back, including across midnight.
- Unit tests cover pacing (guarantee, bad-luck protection, no duplicates until complete), save migration, and dedup on reload.

## Required from you

None to start. Optional, with defaults:
- The plant list. Default: the six above. Swap any for flowers that mean something to you and your wife.
- Whether the tin hints at undiscovered seeds. Default: one line, no count.
- Whether catnip should exist at all if Erwu doesn't care for it in real life. Default: keep it; a real observation from ticket 05's reference notes overrides this.

## Out of scope

Seed trading, crossbreeding, seasons, rarity tiers, shops, daily drops, and any gameplay bonus from unique plants.

## v0.8 record — 2026-09-26

- **Seed buds:** when a run's planned turn arrives, one of that ring's new buds carries a seed. It is drawn with an acorn-shaped pod (cap and body) and a twinkle beside the bud, so it differs in shape as well as colour. First appearance gets a short introduction ("A seed bud: open it to find a rare seed for your garden"). Seed buds are saved in the run snapshot.
- **Collecting:** blooming it (including by full bloom or Erwu's swat) records the seed in the garden and saves at once. A "A rare seed" banner, a three-note chime and a haptic play, and the seed flies to the seed tin beside **Best**. The run's seed key prevents a second collection after a reload.
- **Pacing (`BloomBeds.planRun`):** decided once per run. First seed: 50% on the first run, certain on the second. After that 30% +20% per run without one, capped at 100%. The seed bud appears on turn 3–8. No repeats until all six are found.
- **Seed tin:** a tin in the garden's top corner with a count. Opening it lists seeds (and potted keepsakes); choose one and the beds are highlighted; tap one to preview and plant. It says "There may be others out there." until all six are found, without counts or silhouettes.
- **Plants and traits:** catnip (Erwu pleased: hearts every 6–11 s and a happy face when sitting), sunflower (head follows the device clock from morning to evening), moonflower (open 19:00–06:00, furled by day), dandelion (flowers, then clocks; tap the bed to blow them, re-forming over 3 turns), bleeding heart, and wild strawberry (white flowers ripen to red berries). Rare plantings establish at 75% of the common rate.
- **Save:** garden format v3 adds `seeds`, `luck` (`dry`, `last`), `focus`, bed `flower`/`growth`/`puffed`, and seed IDs. v2 saves upgrade in place; the v2 save is kept as the backup on the first v3 write.
- **Events for ticket 09:** `seed-found` (first of each kind) and `first-flower` (first time each rare kind flowers).
- **Tests:** `tests/garden-beds.test.cjs` covers pacing, the first-seed guarantee, no-duplicates, dedup on reload, first-flower records, dandelion puffs, time-of-day traits, the v2→v3 upgrade and newer-save protection.

### Pacing

Same two bot gardens as ticket 04:

- Garden A: no seed bud on run 1 (the 50% roll missed); on run 2 a seed bud appeared and was opened, giving catnip; run 3 had none.
- Garden B: none on run 1; on run 2 the seed bud appeared but was not opened before the run ended (no message, nothing lost); on run 3 another appeared and gave a bleeding heart seed.
- Both first seeds arrived within the first three runs, and a missed seed bud was followed by one on the very next run, as designed. Six runs is too few to confirm the long-run rate of one every two to three runs; the unit tests pin the probabilities (30/50/70/90/100% after 0–4 dry runs).
- No page errors in either garden.
