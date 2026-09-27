# Naturalist Erwu direction — 2026-09-27

Supersedes the rejected textured-vector pass in `../erwu-sketch-evidence`.

The user's Henriette Ronner-Knip reference calls for observed anatomy, softly merging forms and expressive pencil/wash edges. Further vector revisions still looked geometric, so the garden now uses a locally bundled painted atlas. The eight-frame walk and static action poses run through the existing behavior controller. The previous procedural art is retained solely for loading/error fallback and compact run/game-over presentation. Explicit back stripes are removed from the fallback too.

## Review artifacts

- `romantic-study.png`: the generated art-direction study, not a game screenshot.
- `painted-poses.png`: the actual atlas source regions rendered through the game's sprite routine.
- `scene-390.png`, `scene-320.png`: the painted cat inside the actual garden at phone sizes.
- `garden-motion.webm`: six-second capture of the actual garden canvas and behavior controller.
- `after-poses.png`: procedural fallback sheet, **not** the primary garden artwork.
- Other screenshots are live behavior regression evidence.

## Limits

This is a first playable direction for review. The generated walk drawings need artistic cleanup before being described as final animation. Slow-blink, happy-face and open-mouth yawn frames remain to be painted; greetings still turn to the seated pose, but no longer show the old procedural facial animation. Run and game-over artwork remain procedural. Physical iPhone/Safari rendering and frame timing have not been tested. No commit, push, or deployment.

## Checks

52 Node tests pass. The full Erwu browser suite covers roaming, hello mid-walk, arranging, background/resume, immediate Play, return greeting, first bloom recorded once, and reduced motion. The visual harness also waits for successful atlas decoding, renders all sixteen production frame regions, checks 320/390px layouts, and captures the motion clip. See `tests/README.md` for commands. Generated asset provenance and final atlas prompt are in `assets/README.md`.
