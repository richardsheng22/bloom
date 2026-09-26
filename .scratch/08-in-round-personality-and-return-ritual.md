# 08 — Bring Erwu's personality into play and make returns welcoming

Status: implemented for v0.9; awaiting owner review. Priority: complete the core experience. Dependencies: 01, 02, 05, 06, 07.

## Outcome

Erwu feels continuous across garden and gameplay. Returning to a resting garden and finishing a run both produce a gentle, personal moment without slowing the game.

## Build requirements

1. Keep the existing run reactions: aiming/ball tracking, catch paw, danger ears, defensive swat, and happy full-bloom response. Add a few small contextual actions using the improved character system.
2. Initial additions: a yawn or stretch after waiting; a subtle ear/tail reaction to a nearby visitor; a recognizable satisfied pose after a strong turn. Prioritize gaze and information-bearing danger cues above ambient actions.
3. Keep full-body roaming in garden view. Between shots, a small action can start only if it will not obscure targets or delay input. Starting an aim cancels/blends the ambient action immediately.
4. Cap ambient frequency and visual intensity. A rare, readable gesture is better than constant motion. Actions and their sounds must not speed up with Breeze.
5. Returning after absence: show the owned arrangement resting, let Erwu acknowledge the player if appropriate, and quietly restore some activity. Keep Play/Continue available immediately. No dialog reporting losses or asking the player to clean up.
6. Ensure absence copy, flower counts, progress indicators, and habitat availability agree with ticket 01's ownership model. Distinguish open blooms from owned/established plants where text needs to describe both.
7. At game over, show a true settling/curling pose using ticket 05 rather than describing a curl over a front-facing face. Keep the existing score and offer both Play again and garden access.
8. Make the garden aftermath visible when useful: mention the patch that changed, then allow the player to inspect it. Do not add a forced reward-collection screen.
9. With sound enabled, consider a brief soft purr for a selected confirmed behavior. Sound stays off by default; no looping audio on return or requirement to hear a cue. Reuse the existing sound preference.
10. Resume must respect both run state and garden state. The cat can settle into a valid pose on reload; no need to replay every prior animation.

## Acceptance criteria

- Aim/launch remains responsive during every new idle reaction. No target or projectile is hidden by added art.
- Run and garden versions of Erwu look like the same character and transition without a jarring scale/pose jump.
- An absence followed by immediate Continue works without care tasks or animation locks.
- A run ending shows a believable resting pose and accurate garden change summary.
- Reduced motion, muted sound, background/resume, and repeated mode switching remain coherent.
- Review recordings of a quiet thinking interval, a busy shot, full bloom, an absence return, and game over.

## Required from you

Use existing references from ticket 05. Optional: describe her distinctive yawn, stretch, satisfied expression, or greeting. If a recognizable real purr is desired, provide a clip and specify whether it is reference-only; a generated/synthesized purr should not be presented as a recording of her. Default to visual personality first. Review the chosen signature gestures; no input is needed for transition engineering.

## Out of scope

Attention prompts during shots, stronger combat abilities, timed return bonuses, and streaks.

## Implementation record — 2026-09-26

- **During play**, all small and all cancelled by aiming:
  - After about 8 s of waiting she gives one slow yawn, then dozes off as before (at 12 s).
  - A butterfly drifting close to the nest gets an ear flick, and her eyes follow it when there's nothing else to watch.
  - After a strong turn ("Lovely" or better) she has a pleased, eyes-closed look and a little bounce.
  - Danger ears and the aiming gaze take priority. Nothing here covers targets or delays input, and Breeze doesn't speed any of it up.
- **The return ritual:** after real time away (the garden resting, or over three hours), the next garden visit opens with her curled in the basket. She yawns, stretches, walks to the gate and sits facing you with a slow blink, then goes about her day. Play and Continue are available immediately throughout. There's no loss dialog and nothing to clean up.
- **Garden aftermath:** after a run that moved a bed to a new stage, **Back to the garden** finds her going to sniff that bed. The run-end card already lists what changed (ticket 04).
- **Game over** keeps the curled sleeping pose on the card (phase A).
- **Purr:** a hello, with sound on, gives a soft synthesised purr.
- **Checked:** these are covered by the browser suite and by captures (`v09-evidence/welcome.png`, `run-yawn.png`).
