# Bloom

A calm, one-thumb, turn-based garden game for iPhone. Flower buds spiral in toward Erwu the cat, napping in her basket at the heart of a big daisy. Pull back to launch a swarm of pollen and coax the buds into bloom before they reach her. Every shot leaves something behind in the garden around the flower, and the garden stays from one run to the next.

## Play

Open the GitHub Pages site on your iPhone in Safari, tap Share, then **Add to Home Screen**. It then opens full-screen like an app, and your best score, current run and garden are saved on the phone.

## How it plays

The game opens in Erwu's garden, drawn after the real one: a round rose bed with a rose arch in the middle, where Erwu is curled up asleep in her basket; a three-tier stone fountain and a fallen log at the back; and stepping stones up a lawn that fades softly into the page. Tap her and she sits up to say hello; left alone, she curls back up. Tap a flower bed to plant it, or the cushion or sunny stone to see what it's for. Everything else in the garden grows by itself as you play. **Play** or **Continue** starts immediately, even while Erwu is responding.

The leaf button brings you back to the garden without resetting your run. During a shot it waits for the turn to finish; tap it again to cancel. After a run ends, **Back to the garden** lets you linger, and **Play again** explicitly starts the next run.

- **Aim:** pull back anywhere on the screen like a slingshot, then let go. Letting go near where you started cancels the shot.
- **Buds:** tulips, rosebuds, peonies, poppies and bellflowers. Pollen pips under a bud (or a number, for tough ones) show the hits left; hits make it wobble and loosen, a bud with one hit left glows, and the last hit opens it into its own flower before the petals flutter away.
- **Pollen clusters** give you one more ball. The **petal** pickup splits your next shot three ways.
- **Power-ups** (from turn 4): a **dewdrop** splashes every bud around it, a **bee** buzzes from bud to bud for a few seconds, and a **sunbeam** hits every bud in a line straight out from Erwu for two.
- **Later stages:** buds toughen faster. From turn 8, **flower rings** turn any pollen that threads them golden, so it hits twice. From turn 10, **mushrooms** bounce pollen and can't be picked; one that reaches Erwu hops out into the garden. Each new thing gets a short introduction the first time it appears.
- **Full bloom:** blooming buds fills the petal behind them with colour. When all ten petals are full, every bud loses half its remaining hits, and the whole garden gets a boost.
- **Erwu's swat:** once per run, Erwu bats away a bud that reaches her. Full bloom recharges it.

## Flower beds

- The garden has three flower beds (the morning bed, the high bed and the evening bed), plus a cushion and a sunny stone for Erwu.
- Tap an empty bed and choose lavender, daisies or cosmos, or a rare seed from your seed tin. A preview shows how it will look in flower; **Plant** confirms and **Cancel** changes nothing.
- The bed you planted last grows as you play: a little every turn, a little more for every bud you bloom, and a clear boost at full bloom. Other planted beds grow slowly alongside. Tap a bed and **Grow this bed** to choose which one you're growing. Now and then a bloom's seed flies to it during a run.
- Beds go from *just planted* to *growing*, *flowering* and finally *established*. The garden screen says which bed you're growing and how far along it is, and the end of a run says what changed.
- **Replant** a bed any time. Nothing is thrown away: whatever was growing waits in your seed tin, just as grown, to be planted again.
- **Arrange** moves beds (with whatever is growing in them), the cushion and the stone between their places, with a preview, **Undo** and **Put away**.

## Rare seeds

- Once in a while a **seed bud** turns up: an ordinary bud with a little acorn-shaped pod and a twinkle. Bloom it and a rare seed flies to the seed tin beside **Best**. It's no tougher than the buds around it and doesn't change your score.
- Your first seed bud comes within your first two runs. After that, roughly one every two or three runs, and each run without one makes the next more likely. At most one per run; missing one costs nothing. You won't get a repeat until you've found them all.
- Six rare plants, each with a small trait of its own:
  - **Catnip:** once it's flowering, Erwu is visibly pleased (hearts, and a happy face when she's sitting up).
  - **Sunflower:** tall, and its head follows the sun from morning to evening by your phone's clock.
  - **Moonflower:** closed by day, open in the evening.
  - **Dandelion:** yellow flowers, then seed clocks. Tap the bed to blow them away; new ones form as you play.
  - **Bleeding heart:** arching stems hung with little pink hearts.
  - **Wild strawberry:** white flowers that ripen into red berries.
- Rare plants take a little longer to establish. They never affect the game itself.

## The garden

- Every bud you bloom sends a glowing seed arcing out into the garden, where it sprouts a flower (daisy, cosmos, lavender, buttercup, forget-me-not).
- Pollen that bounces off the rim drops seeds, so even a miss grows grass, clover and ferns, or feeds the nearest plant.
- Each turn Erwu tends the garden and everything grows a little. While you're aiming, she keeps an eye on it (the little glints of dew).
- The garden has its own uncluttered view, with a detail area below the scene. On a short landscape screen, the details sit beside it. Rotating the phone changes the presentation, never saved plant positions.
- The five buds under **Best** show how grown the garden is. Once it's growing well, butterflies start to visit.
- **Full bloom** lights the petals one by one, then bursts: sunbeams, a petal shower, hearts from Erwu and a couple of butterflies set free.
- Everything growing on the lawn comes from play. As the garden grows, lawn daisies and clover spread, a wildflower meadow creeps in from the edges, moss finds the stepping stones, ferns unfurl by the log, ivy climbs the fountain, a robin starts visiting it, and a fairy ring appears.
- Your plants and their growth stay yours, however long you are away. After about half a day, the garden gradually rests: the light turns soft and cool like evening, flowers fold and droop a little, fewer petals drift by, visitors grow quieter, and tufts of grass appear along the edges. Autumn leaves settle on the lawn, the fountain stills with a leaf floating in it, the grass grows a little long with a few dandelion clocks, fireflies drift in the evening light, and a snail takes its time across the path. It never withers away.
- Returning gently wakes the garden even if you just sit with Erwu. Playing a few turns helps it wake sooner; there are no cleanup chores or lost progress.

## Files

- `index.html`: the interface and canvas game (no build step)
- `garden-state.js`: garden ownership, save migration, and temporary rest
- `garden-layout.js`: flower beds and furnishings, their places, and arranging them
- `garden-beds.js`: what grows in the beds, rare seeds and the seed tin
- `garden-view.js`: garden projection and return-request rules
- `tests/`: [garden validation instructions](tests/README.md)
- `manifest.webmanifest`, `icons/`: Home Screen install
- `.nojekyll`: tells GitHub Pages to serve the files as they are

The design notes and feedback log live in the `bloom/` folder of the `idea-sketches` repo.

## Garden saves

The garden is saved locally in this browser. The current format (version 3) retains stable plant identities, separates permanent growth from temporary rest, and holds the beds, their plantings, the seed tin and seed pacing. Existing gardens migrate automatically; their original save is kept, and subsequent writes retain the previous valid snapshot. Unreadable or newer-format saves are left untouched. If saving is unavailable, the game says so and remains playable for the current visit. Clearing browser storage still removes local progress.
