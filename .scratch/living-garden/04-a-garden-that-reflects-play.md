# 04 — Let the garden reflect how she plays

Status: implemented with stand-in clumps for tulip, peony and poppy. Dependencies: 01. Art: tulip, peony and poppy clumps (ticket 09); existing clumps stand in until then.

## Outcome

After a month, her garden is recognisably hers. A drift of bluebells on the side she favours, moss and ferns by the fountain because she uses dew, poppies where she opened poppy buds. Two players' gardens differ in what grows, not only where.

## Current behaviour

- **Where** already follows play: a plant's angle comes from the bud or rim hit that produced it, and `garden-view.js` places it in the garden by that angle.
- Misses plant grass, clover and fern; blooms plant flowers.
- **What** is random: blooms plant `pick(FLOWER_KINDS)`, and a full garden matures a plant into a random wildflower (`mature()`).

## Design

1. **The bud decides the flower.** Half of all bloom plantings are the bud's own kind; the other half are common flowers chosen by rule 2.

   | Bud | Grows |
   |---|---|
   | Rose | Rose bush (`clump-rose`) |
   | Bellflower | Bluebells (`clump-bluebell`) |
   | Tulip | Tulips (new; sweet peas stand in) |
   | Peony | Peonies (new; the rose bush stands in) |
   | Poppy | Poppies (new; the wildflower tuft stands in) |

2. **Plants spread from their neighbours.** A new plant copies the kind of the nearest flowering plant within a short distance four times in ten. When the garden is full, a maturing plant becomes the kind most common among its neighbours rather than a random wildflower. Clusters grow into drifts, and each garden develops its own patches.

3. **Power-ups leave a mark** (with ticket 07's redesign):
   - Dew: ferns and forget-me-nots where the shower fell, and moss on the stones sooner.
   - Bee: lavender and clover spread more; bumblebees visit more often (ticket 06).
   - Sunbeam: buttercups along the beam's sweep.

4. **When she plays.** Evening play (after 18:00) favours white and pale flowers (daisies, pale sweet peas): an evening garden. Morning play (before 10:00) favours buttercups and forget-me-nots.

5. **A garden character.** The save keeps slowly decaying counts: blooms, misses, each power-up used, morning and evening turns. They bias rules 3–4 and feed visitor conditions (ticket 06). A scrappy player gets a greener, mossier, fern-filled garden; an accurate one a flowery garden. Neither is better.

## Build requirements

1. Planting takes a kind hint from its source (bud kind, power-up, miss) and resolves the final kind through the rules above, in one tested function.
2. Add `tulip`, `peony` and `poppy` to the garden's plant kinds, drawn with stand-in clumps until ticket 09's art arrives.
3. `mature()` uses the neighbour majority.
4. Record the character counts in the save; decay them by 10% a garden day.
5. Keep all randomness seeded per plant so a garden repaints identically.

## Acceptance criteria

- Two scripted players (one aiming mostly left with dew, one mostly right and missing often) produce visibly different gardens after a simulated month.
- Drifts form: the median distance between plants of the same kind is clearly smaller than with random kinds.
- No change to run difficulty or score.

## Implementation record — 2026-09-29

- `chooseKind` and `BUD_FLOWERS` in `index.html`: half of bloom plantings are the bud's own kind; four in ten new plants copy their nearest flowering neighbour; evening and morning play bias the common kinds.
- `mature()` turns a plant into the most common flowering kind around it when that's a step on, so drifts spread once the garden is full.
- `powerMark`: dew plants ferns and forget-me-nots, the sunbeam buttercups, bees feed lavender and clover.
- `garden.character` (blooms, misses, dew, bee, sun, morning, evening) fades by a tenth a garden day and feeds visitor boosts (ticket 05).
- `tulip`, `peony` and `poppy` are valid plant kinds; until ticket 09's clumps exist they draw as sweet peas, a rose bush and a wildflower tuft.
- Not yet measured: the two-player comparison in the acceptance criteria.
