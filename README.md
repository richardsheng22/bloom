# Bloom

A calm, one-thumb, turn-based garden game for iPhone. Flower buds spiral in toward Erwu the cat, napping in her basket at the heart of a big daisy. Pull back to launch a swarm of pollen and coax the buds into bloom before they reach her. Every shot leaves something behind in the garden around the flower, and the garden stays from one run to the next.

## Play

Open the GitHub Pages site on your iPhone in Safari, tap Share, then **Add to Home Screen**. It then opens full-screen like an app, and your best score, current run and garden are saved on the phone.

## How it plays

- **Aim:** pull back anywhere on the screen like a slingshot, then let go. Letting go near where you started cancels the shot.
- **Buds:** each hit peels back one sepal: six, five, four, three, then the bud blooms open and lets its petals go. Tougher buds show a number and a deeper colour.
- **Pollen clusters** give you one more ball. The **petal** pickup splits your next shot three ways.
- **Full bloom:** blooming buds fills the petal behind them with colour. When all ten petals are full, every bud loses half its remaining hits, and the whole garden gets a boost.
- **Erwu's swat:** once per run, Erwu bats away a bud that reaches her. Full bloom recharges it.

## The garden

- Every bud you bloom plants a flower (daisy, cosmos, lavender, buttercup, forget-me-not) out in the garden near where it bloomed.
- Pollen that bounces off the rim drops seeds, so even a miss grows grass, clover and ferns, or feeds the nearest plant.
- Each turn Erwu tends the garden and everything grows a little. While you're aiming, she keeps an eye on it (the little glints of dew).
- The five buds under **Best** show how grown the garden is.
- Erwu keeps things tidy for about half a day after you stop playing. After that the garden slowly retreats, outermost plants first, back to sprouts and then bare ground over about a week.

## Files

- `index.html`: the whole game (HTML, CSS and canvas JavaScript, no build step)
- `manifest.webmanifest`, `icons/`: Home Screen install
- `.nojekyll`: tells GitHub Pages to serve the files as they are

The design notes and feedback log live in the `bloom/` folder of the `idea-sketches` repo.
