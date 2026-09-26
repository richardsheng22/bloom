# 07 — Connect cultivation, visitors, and Erwu in one complete scene

Status: planned. Release: v0.9. Priority: first playable milestone. Dependencies: 04, 06.

## Outcome

A patch the player grew becomes a place where something personal happens: a flower opens, a butterfly visits, Erwu notices and investigates, then chooses somewhere to rest. This is the first end-to-end proof of the expansion.

## Current behavior and seams

Butterflies already exist in `flySpot`, `addFly`, and `updateFlies`. They seek sufficiently grown plants; their population is tied to garden tier. Extend that implementation with meaningful patch/visitor identity rather than layering a second unrelated butterfly system on top.

## Build requirements

1. Use the first completed cultivated patch from ticket 04. If completion happens during play, persist its new state and make its introduction available on the next garden visit. Do not insert a forced cutscene between shots.
2. The patch blooms in the garden, a visitor chooses an actual flower position, and Erwu can notice it. Use a small cue or gaze shift to direct attention; keep UI banners away from the action.
3. Sequence: notice → orient → approach patch → sniff/watch → follow the visitor a short distance or attempt a restrained pounce → lose interest → choose a nearby rest anchor. Allow variations and a quiet watch-only branch.
4. The visitor remains autonomous. If it leaves or becomes unreachable, Erwu looks after it and settles instead of chasing forever. Avoid looping around the entire phone scene.
5. The player can continue to play, inspect, or leave throughout. An interrupted encounter is not a failure; the habitat remains and later visits can produce ordinary encounters. Do not repeat a special first-introduction event on every reload.
6. Associate objects with activity possibilities: cushion/stone supports resting; flowers support sniffing and visitors; optional tall grass supports crouching/pouncing. Keep these as natural descriptions, not stat bonuses.
7. Reuse existing visitors and cap simultaneous activity so Erwu remains readable. A single contextual event is enough; multiple butterflies must not all trigger competing actions.
8. Resting flowers still count as established habitat. Quiet encounters can occur during absence recovery; there is no requirement to “repair” a patch before Erwu uses it.
9. Define rare versus ordinary event records so ticket 09 can later recognize a first encounter without storing every blink or visit. Events must be deduplicated across reloads.

## Acceptance criteria

- From a fresh migrated/new garden, grow a chosen patch through actual play and observe the complete sequence on return.
- The visual relationship is understandable without a tutorial: Erwu is interested in something the player grew.
- The scene works at 320 × 568 and 390 × 844 without hiding behind controls, leaving bounds, or shrinking Erwu into illegibility.
- Play can interrupt each stage promptly. Re-entering the garden produces a valid state, not a frozen or endlessly restarted scene.
- Empty/full gardens, a missing resting object, a moved patch, visitor departure, and reduced motion have graceful variants.
- Capture the complete sequence and obtain character-fidelity feedback before calling this first playable milestone complete.

## Required from you

Review one short recording for personality and pacing. For a signature pounce or sniff, use ticket 05 references; if these are missing, ask for a short clip or written description of that specific behavior. A generic watch/sniff/settle prototype can proceed, explicitly labeled provisional. No additional game-rule decisions are required from you.

## Out of scope

A catalog of creatures, elaborate ecology, mandatory collectible hunts, and changing combat rewards for encounters.
