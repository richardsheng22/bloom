# Bloom

A calm, one-thumb, turn-based garden game for iPhone. Flower buds spiral in toward Erwu the cat, napping in her basket at the heart of a big daisy. Pull back to launch a swarm of pollen and coax the buds into bloom before they reach her. Every shot leaves something behind in the garden around the flower, and the garden stays from one run to the next.

## Play

Open the GitHub Pages site on your iPhone in Safari, tap Share, then **Add to Home Screen**. It then opens full-screen like an app, and your best score, current run and garden are saved on the phone.

## How it plays

The game opens in Erwu's garden, drawn after the real one: a round rose bed with a rose arch in the middle, where Erwu is curled up asleep in her basket; a three-tier stone fountain and a fallen log at the back; and stepping stones up a lawn that fades softly into the page. Tap her to say hello, or tap a flower bed to plant it. The cushion and sunny stone are resting places she visits herself. Everything else in the garden grows by itself as you play. **Play** or **Continue** starts immediately, even while Erwu is responding.

The leaf button brings you back to the garden without resetting your run. During a shot it waits for the turn to finish; tap it again to cancel. After a run ends, **Back to the garden** lets you linger, and **Play again** explicitly starts the next run.

- **Aim:** pull back anywhere on the screen like a slingshot, then let go. Letting go near where you started cancels the shot.
- **Buds:** tulips, rosebuds, peonies, poppies and bellflowers. Pollen pips under a bud (or a number, for tough ones) show the hits left; hits make it wobble and loosen, a bud with one hit left glows, and the last hit opens it into its own flower before the petals flutter away.
- **Pollen clusters** give you one more ball. The **petal** pickup splits your next shot three ways.
- **Power-ups** (from turn 4): a **dewdrop** splashes every bud around it, a **bee** buzzes from bud to bud for a few seconds, and a **sunbeam** hits every bud in a line straight out from Erwu for two.
- **Later stages:** buds toughen faster. From turn 8, **flower rings** turn any pollen that threads them golden, so it hits twice. From turn 10, **mushrooms** bounce pollen and can't be picked; one that reaches Erwu hops out into the garden. Each new thing gets a short introduction the first time it appears.
- **Full bloom:** blooming buds fills the petal behind them with colour. When all ten petals are full, every bud loses half its remaining hits, and the whole garden gets a boost.
- **Erwu's swat:** once per run, Erwu bats away a bud that reaches her. Full bloom recharges it.

## Erwu

- In the garden, Erwu has her own day. She naps in her basket, on the cushion or on the sunny stone; sniffs the beds; sits by the fountain; investigates the log; stretches; and now and then stalks a butterfly that has settled nearby, crouching with her tail twitching before she pounces (she never catches one).
- Tap her to say hello. She stops whatever she's doing, turns to look at you with a slow blink, then carries on; if she was asleep she sits up. With sound on, she purrs.
- After time away, she wakes up, stretches, and comes to the front of the rose bed to greet you.
- The first time one of your beds flowers, a butterfly finds it and so does Erwu. After a run that changed a bed, she goes to have a look.
- During play she stays in her nest in the middle of the flower. If you take a while, she yawns before dozing off; she watches butterflies that pass close by, and looks pleased after a strong turn.

## Flower beds

- The garden has three flower beds (the morning bed, the high bed and the evening bed), plus a cushion and a sunny stone for Erwu.
- Tap an empty bed and choose lavender, daisies or cosmos, or a rare seed from your seed tin. A preview shows how it will look in flower; **Plant** confirms and **Cancel** changes nothing.
- The bed you planted last grows as you play: a little every turn, a little more for every bud you bloom, and a clear boost at full bloom. Other planted beds grow slowly alongside. Tap a bed and **Grow this bed** to choose which one you're growing. Now and then a bloom's seed flies to it during a run.
- Beds go from *just planted* to *growing*, *flowering* and finally *established*. The garden screen says which bed you're growing and how far along it is, and the end of a run says what changed.
- **Replant** a bed any time. Nothing is thrown away: whatever was growing waits in your seed tin, just as grown, to be planted again.
- Beds stay in their places while you choose what to grow. Arrange and furniture editing were retired after owner review.

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
- The garden has its own view. A bed's planting card overlays the foot of the scene without moving or resizing the garden. Rotating the phone changes the presentation, never saved plant positions.
- The five buds under **Best** show how grown the garden is. Once it's growing well, butterflies start to visit.
- **Full bloom** lights the petals one by one, then bursts: sunbeams, a petal shower, hearts from Erwu and a couple of butterflies set free.
- Everything growing on the lawn comes from play. As the garden grows, lawn daisies and clover spread, a wildflower meadow creeps in from the edges, moss finds the stepping stones, ferns unfurl by the log, ivy climbs the fountain, a robin starts visiting it, and a fairy ring appears.
- Your plants and their growth stay yours, however long you are away. Rest begins after about four hours and deepens over the following 36 hours: the garden grows quieter and its colour becomes subdued. It never withers away.
- Sitting with Erwu restores half the garden's liveliness; ordinary turns bring back the rest. There are no cleanup chores or lost progress.

## Files

- `index.html`: the interface and canvas game (no build step)
- `garden-state.js`: garden ownership, save migration, and temporary rest
- `garden-layout.js`: persisted bed/furnishing positions and Erwu's destinations; legacy arrangement operations remain for compatibility
- `garden-beds.js`: what grows in the beds, rare seeds and the seed tin
- `garden-view.js`: garden projection and return-request rules
- `tests/`: [garden validation instructions](tests/README.md)
- `manifest.webmanifest`, `icons/`: Home Screen install
- `fonts/`: the game's two typefaces (Fraunces and Bricolage Grotesque, SIL Open Font License), bundled so it needs no network
- `assets/`, `art-manifest.js`: the painted art, packed by `tools/build-art.cjs`
- `ios/`, `capacitor.config.json`, `package.json`: the iPhone app, **Erwu's Garden** (see below)
- `.nojekyll`: tells GitHub Pages to serve the files as they are

The design notes and feedback log live in the `bloom/` folder of the `idea-sketches` repo.

## The iPhone app

The same game ships as an iPhone app, **Erwu's Garden**, in a thin [Capacitor](https://capacitorjs.com/docs/ios) shell (iPhone only, portrait, iOS 16.2+). The web game stays the source; the app bundles a staged copy of it and plays fully offline. The plan is in `.scratch/ios-1.0/`.

```sh
npm ci
npm run stage        # copy exactly the files the game needs into www/, with a payload inventory in build/
npm run ios:sync     # stage, then copy www/ into the iOS project
npm run test:offline # play the staged package in a browser with every outside request blocked
node tools/build-icon.cjs   # re-render the app icon and launch image from the painted art
```

Building the app needs Xcode 26 on a Mac. Without one, GitHub Actions builds it: `.github/workflows/ios.yml` runs the game checks and compiles the app for the iOS Simulator on every push (unsigned, no Apple account needed). Signed TestFlight builds come with iOS ticket 11.

## Garden saves

The garden is saved locally in this browser. The current format (version 3) retains stable plant identities, separates permanent growth from temporary rest, and holds the beds, their plantings, the seed tin and seed pacing. Existing gardens migrate automatically; their original save is kept, and subsequent writes retain the previous valid snapshot. Unreadable or newer-format saves are left untouched. If saving is unavailable, the game says so and remains playable for the current visit. Clearing browser storage still removes local progress.
