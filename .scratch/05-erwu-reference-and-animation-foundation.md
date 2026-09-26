# 05 — Build a recognizable full-body Erwu

Status: phase A implemented as provisional art, awaiting owner review; phase B planned for v0.9. Priority: core. Dependencies: phase A needs 02; phase B needs the reference pack and 03.

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

## Phasing — 2026-09-26

The full motion set is the largest and least certain piece of the series, so it is split.

**Phase A (v0.8): still poses close to the current drawing.** A curled sleeping pose (used for the resting garden, the landing, and game over) and a seated pose (used when she is awake in the garden). Both extend the existing head and paws rather than redrawing her, and blend to the run nest immediately on Play. May ship as clearly labelled provisional art if the reference pack is not ready; the owner reviews both at actual phone size. Reduced motion uses the same poses without transitions.

**Phase B (v0.9): the motion set.** Stand, walk, sniff, turn, stretch/yawn, settle, and crouch/pounce, plus the character sheet, from the reference pack. This is the foundation for 06–08.

## Phase A record — 2026-09-26

- **Curled sleep:** a round loaf with a haunch, faint tabby stripes on the back, the tail wrapped around the front, and her existing face (eyes closed) resting on her front paws. It breathes slowly. Used in the garden view while she sleeps and on the game-over card.
- **Seated:** her existing face above a sitting body, front legs and paws, and the tail curled round her feet. Shown when she's greeted; after about 12 seconds left alone she curls back up. The two poses blend over 0.45 s; with reduced motion they swap instantly.
- The run nest keeps the compact face and paws, so aiming, ball-tracking, danger ears and the swat are untouched. Play switches immediately.
- Both reuse `drawCat` with a new `noPaws` option, so the face stays identical across all three presentations.
- **Provisional:** proportions, tail length and the lack of chest markings are guesses. Please compare them with the real Erwu; the reference pack will settle them in phase B.

## Reference received — 2026-09-26

The owner shared a front-on photo of Erwu sitting. It is reference only: it is not stored in this public repository. Observations, as seen in the photo:

- British Shorthair build, blue-grey plush coat with slightly lighter, silvery tips. Faint darker banding on the chest and legs, not a strong tabby pattern.
- A very round body, much wider at the base than the head, like an egg. The head sinks straight into the shoulders with full cheeks and no visible neck.
- Short, thick, straight front legs set close together; big round paws.
- Large, round, pale golden-amber eyes; small ears set wide apart on a broad, flat-topped head; a short nose.
- Sitting pose: upright and square-on, weight settled low, tail hidden behind.

Changes made from it:

- Seated pose rebuilt: an egg-shaped body wider than the head, full cheeks merging the head into the shoulders, soft chevrons across a plush chest ruff, short thick legs and larger paws, tail tucked behind with only the tip showing.
- Curled pose made rounder and plusher, with fainter back stripes, a thicker tail and fuller cheeks.
- Fur colour warmed slightly from violet-grey (#6F6E7E) to blue-grey (#6E6C78); eyes lightened to a paler gold (#D9B452). The run view uses the same colours.
- The face itself (and its half-lidded, faintly unimpressed look) is unchanged, keeping the earlier correction that it should not look too chubby.

Still to confirm from references: her sleeping pose, tail length and carriage, and the chest colour. Photos of her asleep and from the side would settle the curled pose.
