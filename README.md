# Bloom

A calm, one-thumb, turn-based garden game for iPhone. Flower buds spiral in toward Erwu the cat, napping in her basket at the heart of a big daisy. Pull back to launch a swarm of pollen and coax the buds into bloom before they reach her. Every shot leaves something behind in the garden around the flower, and the garden stays from one run to the next.

## Play

Open the GitHub Pages site on your iPhone in Safari, tap Share, then **Add to Home Screen**. It then opens full-screen like an app, and your best score, current run and garden are saved on the phone.

## How it plays

The game opens in Erwu's garden: a few sprouts at first, flowering once you've played a while. Tap Erwu to say hello, tap a plant to look closer, or use **Look around** to choose a plant by name. **Play** or **Continue** starts immediately, even while Erwu is responding.

The leaf button brings you back to the garden without resetting your run. During a shot it waits for the turn to finish; tap it again to cancel. After a run ends, **Back to the garden** lets you linger, and **Play again** explicitly starts the next run.

- **Aim:** pull back anywhere on the screen like a slingshot, then let go. Letting go near where you started cancels the shot.
- **Buds:** tulips, rosebuds, peonies, poppies and bellflowers. Pollen pips under a bud (or a number, for tough ones) show the hits left; hits make it wobble and loosen, a bud with one hit left glows, and the last hit opens it into its own flower before the petals flutter away.
- **Pollen clusters** give you one more ball. The **petal** pickup splits your next shot three ways.
- **Power-ups** (from turn 4): a **dewdrop** splashes every bud around it, a **bee** buzzes from bud to bud for a few seconds, and a **sunbeam** hits every bud in a line straight out from Erwu for two.
- **Later stages:** buds toughen faster. From turn 8, **flower rings** turn any pollen that threads them golden, so it hits twice. From turn 10, **mushrooms** bounce pollen and can't be picked; one that reaches Erwu hops out into the garden. Each new thing gets a short introduction the first time it appears.
- **Full bloom:** blooming buds fills the petal behind them with colour. When all ten petals are full, every bud loses half its remaining hits, and the whole garden gets a boost.
- **Erwu's swat:** once per run, Erwu bats away a bud that reaches her. Full bloom recharges it.

## The garden

- Every bud you bloom sends a glowing seed arcing out into the garden, where it sprouts a flower (daisy, cosmos, lavender, buttercup, forget-me-not).
- Pollen that bounces off the rim drops seeds, so even a miss grows grass, clover and ferns, or feeds the nearest plant.
- Each turn Erwu tends the garden and everything grows a little. While you're aiming, she keeps an eye on it (the little glints of dew).
- The garden has its own uncluttered view, with a detail area below the scene. On a short landscape screen, the details sit beside it. Rotating the phone changes the presentation, never saved plant positions.
- The five buds under **Best** show how grown the garden is. Once it's growing well, butterflies start to visit.
- **Full bloom** lights the petals one by one, then bursts: sunbeams, a petal shower, hearts from Erwu and a couple of butterflies set free.
- Your plants and their growth stay yours, however long you are away. After about half a day, the garden gradually rests: flowers fold slightly, leaves relax, visitors grow quieter, and a little grass appears along the edges. It never withers away.
- Returning gently wakes the garden even if you just sit with Erwu. Playing a few turns helps it wake sooner; there are no cleanup chores or lost progress.

## Files

- `index.html`: the interface and canvas game (no build step)
- `garden-state.js`: garden ownership, save migration, and temporary rest
- `garden-view.js`: garden projection and return-request rules
- `tests/`: [garden validation instructions](tests/README.md)
- `manifest.webmanifest`, `icons/`: Home Screen install
- `.nojekyll`: tells GitHub Pages to serve the files as they are

The design notes and feedback log live in the `bloom/` folder of the `idea-sketches` repo.

## Garden saves

The garden is saved locally in this browser. The current format retains stable plant identities and separates permanent growth from temporary rest. Existing gardens migrate automatically; their original save is kept, and subsequent writes retain the previous valid snapshot. Unreadable or newer-format saves are left untouched. If saving is unavailable, the game says so and remains playable for the current visit. Clearing browser storage still removes local progress.
