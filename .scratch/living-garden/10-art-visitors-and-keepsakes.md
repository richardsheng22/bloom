# 10 — Art: visitors and keepsakes

Status: done for the visitors and keepsakes (2026-09-29); the owner check of the cottontail and blue jay is still open.

## What's needed

Three sheets in the storybook style, on the grey background the build tool expects:
- `assets/visitors-1.png`: birds (blue jay, northern cardinal, dark-eyed junco, American goldfinch, ruby-throated hummingbird)
- `assets/visitors-2.png`: animals and insects (cottontail rabbit, squirrel, chipmunk, green frog, red fox, bumblebee, luna moth)
- `assets/keepsakes.png`: Erwu's presents and the traces visitors leave

The visitors are small on screen (about a third to half of Erwu's height), so simple, clear shapes matter more than detail. Attach a photo of the real cottontail if you have one, as reference only (it is not stored in the repository).

## Prompts and reference material

The complete, copy-ready prompts, the files to attach and why, and the output names are in [ART-PROMPTS.md](ART-PROMPTS.md) (images 4, 5 and 6).

## Acceptance

- Each visitor reads as its species at phone size next to Erwu.
- Poses of one animal share size and colour, so switching between them doesn't jump.
- The owner confirms the cottontail and the blue jay look right.

## Implementation record — 2026-09-29

- The three sheets are cut by `grid` into a new atlas, `assets/visitors.webp` (52 pieces, 288 KB), named in `ART.visitors`. Cut-outs were checked on a dark background: clean edges on the hummingbird's wings, the luna moth and the snow patches.
- Not integrated: `erwu-walk-updown.png` (toward and away from us). It is drawn in a noticeably fluffier, more photographic style than her other poses, with a different tail, so she would visibly change as she turns. It needs regenerating against `erwu-sprite-v2.png` before it can replace the zigzag walk.
