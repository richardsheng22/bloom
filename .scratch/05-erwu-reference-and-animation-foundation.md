# 05 — Build a recognizable full-body Erwu

Status: planned. Priority: core. Dependencies: reference gathering can start now; integrate with 02 and 03.

## Outcome

Erwu can stand, walk, investigate, stretch, and settle while remaining recognizably the same cat as the current face. This is the visual foundation for contextual behavior, not a demand for a large animation catalog.

## Current behavior and seams

`drawCat` renders the head, ears, eyes, whiskers, and front paws. `freshCat`, `catPose`, and `drawCardCat` drive moods and small motions. Current details include blue-grey fur, olive-gold eyes, forehead marks, cheek/crown tufts, and the characteristic half-lidded look. The original notes record that an earlier face was too chubby; preserve that correction rather than redesigning from a generic cat.

## Required from you

For final character fidelity, provide a small reference pack when convenient:

- One clear side or three-quarter full-body photo showing body proportions and tail.
- A photo of her usual resting/sleeping pose; a second if she has a very different favorite pose.
- If available, short clips of walking, stretching/yawning, sniffing, and preparing to pounce. Written descriptions can substitute for missing clips.
- Three to five signature observations: how she holds her tail, which paw leads, how she greets you, what attracts her attention, whether she kneads, how she loses interest, or how she settles down.
- Identify the two or three details that most strongly make a drawing feel like Erwu, plus anything the current face gets wrong.

No need to supply all possible angles or capture every behavior. Ask one consolidated follow-up only where reference gaps affect the chosen first sequence. Photos/clips are reference material by default, not permission to publish originals or include them in a public repo/app. Confirm separately before any such use.

Engineering and labeled placeholder poses can proceed without the pack. Final body proportions and “signature” animations remain awaiting reference/review; do not invent habits and present them as observed facts.

## Build requirements

1. Create a short character sheet from supplied evidence: proportions, silhouette, markings, facial expression, tail language, confirmed habits, and unknowns. Distinguish observations from proposed animation choices.
2. Evaluate the existing canvas approach first. A reusable layered drawing or small sprite set is acceptable; choose based on legibility and animation quality at actual phone scale. Avoid a whole rendering-engine rewrite.
3. Separate body pose, facing, world position, gaze, expression, and action timing. Existing ball tracking and swat must continue to work while garden poses use the same identity.
4. First pose/action set: seated neutral; stand; short walk; sniff; turn; stretch/yawn; settle; sleep. Add crouch/pounce for ticket 07. Share transitions where possible rather than making disconnected clips.
5. Show anticipation, contact, and settling with restrained timing. Feet should not slide, the body should not teleport, and objects should receive believable gaze/contact. Tail and ears may provide secondary motion without constant twitching.
6. Preserve scale relationships: larger body/readable actions in garden view, compact head/paws in the run nest. Do not enlarge Erwu over the inner rings to show more detail.
7. Support interruption at safe pose transitions and a quick blend to run presentation. Pressing Play cannot wait for a long clip. Prevent abrupt facing flips and mirror distinctive asymmetrical markings only if appropriate.
8. Reduced motion uses stable representative poses and gentle state changes; no rapid pounce, repetitive bobbing, or required animation to understand the state.
9. Store only durable character preferences/identity in saves. Transient limbs and clip progress need not persist; reload into a coherent settled pose.

## Acceptance criteria

- Review the existing face beside the new seated, side, and sleeping views at their actual rendered sizes.
- Owner confirms recognizable proportions and the selected signature details before calling final art complete.
- A single motion study demonstrates seated → stand → walk → sniff → settle, plus immediate transition to play.
- Existing gaze, catch, danger, swat, and happy expressions still read correctly on the board.
- Low-motion variants remain expressive; there are no visible foot slides, clipping through props, or accidental changes to identity across poses.

## Out of scope

Photorealism, a large cosmetic wardrobe, complex skeletal tooling without demonstrated need, and dozens of unverified behaviors.
