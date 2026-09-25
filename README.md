# Bloom

A calm, one-thumb, turn-based game for iPhone. Amethyst gems spiral in toward Erwu the cat, who sits in the golden heart of a lavender flower. Pull back to launch a swarm of pollen and knock the gems out before they reach her.

## Play

Open the GitHub Pages site on your iPhone in Safari, tap Share, then **Add to Home Screen**. It then opens full-screen like an app, and your best score and current run are saved on the phone.

## How it plays

- **Aim:** pull back anywhere on the screen like a slingshot, then let go. Letting go near where you started cancels the shot.
- **Gems:** each hit knocks off one side: hexagon, pentagon, square, triangle, gone. Tougher gems show a number.
- **Pollen clusters** give you one more ball. The **petal** pickup splits your next shot three ways.
- **Full bloom:** popping gems fills the petal behind them with colour. When all ten petals are full, every gem loses half its remaining hits.
- **Erwu's swat:** once per run, Erwu knocks away a gem that reaches her. Full bloom recharges it.

## Files

- `index.html`: the whole game (HTML, CSS and canvas JavaScript, no build step)
- `manifest.webmanifest`, `icons/`: Home Screen install
- `.nojekyll`: tells GitHub Pages to serve the files as they are

The design notes and feedback log live in the `bloom/` folder of the `idea-sketches` repo.
