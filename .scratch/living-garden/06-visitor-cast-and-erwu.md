# 06 — The visitor cast, and how Erwu responds

Status: implemented, including Erwu's reactions (2026-09-29); the owner check of the cottontail and blue jay is still open.

## Outcome

A small, North American cast that matches the owner's real garden, each with a place, a season and a habit. Erwu responds to each in character: she chatters at birds, stalks the rabbit and never catches it, and pointedly ignores the fox from her basket.

## The cast

"Where" names the garden's existing places. "Needs" refers to ticket 04's garden character and ticket 03's seasons.

| Visitor | Class | Season | Time | Where | Needs | Trace | Erwu |
|---|---|---|---|---|---|---|---|
| Blue jay (replaces the robin) | Common | All year | Day | Fountain top bowl, then the rose arch | — | A blue feather by the fountain | Looks up and chatters (`look-up`), tail twitching |
| Cottontail rabbit | Occasional | Spring–autumn; tracks in winter snow | Dawn, dusk | Lawn by the beds | Clover in the garden | Nibbled clover or strawberry leaves; winter footprints | Crouches and stalks (`stalk`), never pounces; the rabbit freezes, then hops off |
| Bumblebee | Common | May–September | Day | A flowering bed | Lavender, cosmos or clover in flower; more with bee power-ups | — | Watches, one paw lifted |
| Chipmunk | Occasional | April–October | Day | The log | — | Acorn shells on the log | Sniffs the log after it leaves (`sniff`) |
| Squirrel (black or grey) | Common | All year | Day | Lawn, the log | — | A small dug patch in autumn (a buried acorn) | Stalks, gives up, grooms |
| American goldfinch | Occasional | July–October | Day | Seedheads: sunflower bed, dandelion clocks, cornflowers | Sunflower or dandelion planted, or cornflowers | — | Watches from the cushion |
| Green frog | Occasional | June–August | Day, dusk | Fountain basin | More likely with dew power-ups | A wet splash on the stones | Paw at the water's edge |
| Northern cardinal | Occasional | December–February | Day | Rose bed, fountain | — | Seed husks on snow | Looks up from the basket |
| Dark-eyed junco | Common | November–March | Day | Lawn, under the roses | — | Tiny footprints in frost or snow | Watches, half asleep |
| Ruby-throated hummingbird | Rare | June–August | Day | Foxgloves or a flowering bed | Foxgloves or sweet peas | — | Astonished stare |
| Luna moth | Rare | May–July | Night | The moonflower bed, or the fountain | Better with a moonflower | — | Watches with wide eyes |
| Red fox | Rare | All year | Dusk | The lawn edge by the log | — | Footprints across the lawn | Retreats to her basket and loafs, unimpressed (`loaf`, `sit-grumpy`) |

Rare visitors come roughly every two to three weeks each (owner decision). Common and occasional rates are tuned so a typical opening shows at most one visitor.

## Erwu

Her existing behaviour module already handles visitors (butterflies): approach, crouch, pounce, scare. Extend it with per-visitor reactions from the table, using existing poses (`look-up`, `stalk`, `sniff`, `loaf`, `sit-grumpy`, `sit-content`). She never catches anything; animals leave when she gets close. Gifts (ticket 05) use `sit-content` next to the item.

## Build requirements

1. Cast table in `garden-visits.js` (conditions and cadence) with tests.
2. Visitor drawing: 2–3 poses each (arrive, stay, leave) from ticket 10's sheets, anchored to the garden's places; small sway or hop per visitor.
3. Erwu reactions in `erwu-behavior.js` keyed by visitor kind.
4. Remove the procedurally drawn robin once the blue jay is painted.
5. Butterflies and fireflies stay drawn in code.

## Acceptance criteria

- Each visitor appears only in its season and time, at its place, and reads as that animal at 390 × 844.
- Erwu's reaction is recognisable per visitor and never delays Play.
- The owner confirms the cottontail and blue jay look like the ones in the real garden.

## Implementation record — 2026-09-29

- The cast table above is encoded in `BloomVisits.CAST`, with tests for seasons, times and needs.
- The procedurally drawn robin at the fountain is now a drawn blue jay (blue back, white breast, crest and necklace), shown once the garden reaches tier 2, until the painted one arrives.

## Drawing and Erwu — 2026-09-29

- `VISITOR_LOOK` in `index.html` gives each visitor its poses, leaving pose and size. Birds fly off; the rabbit and frog hop; the fox walks away.
- Ground visitors (cottontail, squirrel, chipmunk, junco, cardinal) join Erwu's visitor list, so she may stalk one; her pounce sends it off (checked with a junco in the browser). The fox and anything up on the fountain or log are left alone.
- The fountain's ambient blue jay is now the painted one; it steps aside when a blue jay is the visitor.
- Erwu notices each visitor a moment after it arrives (`erwu-behavior.js`, new `watch-visitor` and `retreat` actions, with a unit test): she stalks the rabbit or the squirrel; watches birds, bees, the moth and the frog, looking up with the tail-twitching `look-up` at a bird on the fountain or log; and at the fox she goes back to her basket and glances at it over the rim before curling up. Her reaction waits until any welcome-back greeting has finished.
- From her basket she now glances toward whatever she's watching (`peek-glance`, turned its way).
