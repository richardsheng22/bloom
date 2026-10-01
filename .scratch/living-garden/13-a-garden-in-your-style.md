# 13 — A garden in your style

Status: implemented (2026-10-01). Dependencies: 04, 12.

## Outcome

Two players' gardens grow apart, because each skilful way of playing sows a wild flower of its own. Looking at the garden tells you how you play, and the end of each game says what your play sowed.

## Styles and their flowers

| How you play | Flower | When it's planted straight away |
|---|---|---|
| Trick shots off a mushroom | Foxgloves | The first trick shot of a launch |
| Chains of blooms in one launch | Poppies | Every chain |
| Stubborn buds coaxed open | Wild roses | Every stubborn bud |
| Full blooms of the big flower | Peonies | Every full bloom |
| Close calls right next to Erwu | Sweet peas | (biases only) |
| Long games (turn 50+) | Bluebells | At the end of the game |
| Dandelion clocks | Cornflowers | Two when the clock blows away |

- **Counting:** each moment is counted in the garden as `style` (a count per style, in `garden-time.js`). Older saves have none and stay valid.
- **The bias:** a share of every new wild flower follows those counts. The share starts at none and reaches 45% once you have about a dozen moments of style behind you.
- **Plants already in the garden:** they still copy their neighbours (ticket 04), so a style's flowers spread in drifts.
- **End of a game:** the "In the garden this run" card lists up to two style flowers sown, for example "Poppies, from your chains ×3".
- **Coming back to the garden:** it sometimes says "Foxgloves are spreading: they follow your trick shots".
- **The garden guide:** it now says "Every game sows wild flowers, and how you play decides which."

## Not done

- Style counts don't fade: a garden reflects how you've played over its whole life, not just lately. A slow fade, like the character's, would let a garden turn over when your play changes.
