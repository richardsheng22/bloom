# 04 — Let ordinary play grow a chosen patch

Status: implemented; pacing observed (see the v0.8 record). Release: v0.8. Priority: core. Dependencies: 01, 03. Ticket 11 builds on the same patch progress model.

## Outcome

The player chooses something to grow, plays the existing game, and returns to a visible change they helped create. Every turn remains one aiming decision.

## Current behavior and seams

`flowerFromBloom` chooses a random garden flower, `seedFromMiss` plants greenery or nurtures a nearby plant, `tendGarden` grows everything per turn, and `feedGarden` boosts the garden on full bloom. Flower growth is currently a single scalar with bud/open rendering thresholds. Preserve the satisfaction of seed flights and of misses still contributing.

## Build requirements

1. In garden view, select a planting patch and choose a featured flower from a small starting set, including lavender. Show a simple visual preview and set that patch as the current cultivation focus.
2. Never demand a pre-run selection. Keep the previous focus; when none exists, existing automatic garden growth continues. Switching focus preserves all progress already earned.
3. Define a small progress model: planted → growing → flowering → established habitat. Represent progress primarily through plant art, with concise explanatory text on inspection.
4. Route a bounded portion of normal bloom rewards to the focused patch; preserve background seeding and greenery from rim bounces. Full bloom gives a clear additional boost. Ordinary participation must contribute even in a short or unsuccessful run.
5. Tune the first meaningful visual change to arrive within an early short session; target a first completed patch within roughly 1–3 ordinary runs as an initial hypothesis. Verify with observed runs, not a hard promise or a grind requirement.
6. Do not change projectile damage, spawn difficulty, swat recharge, or score based on decoration choice. The player should choose lavender because they like it, not because it is strategically mandatory.
7. Tie new effects to their destination: a seed can travel to a visible patch, or a small edge cue can acknowledge an off-arena destination. Do not draw effects across aim targets while the player is planning.
8. At run end, report what changed in that run—e.g. a patch reaching bloom—rather than only the total flowers present. Keep total ownership separately available.
9. Completed patches remain owned and completed when resting. Continued play can sustain visual liveliness and border growth without overflowing capacity or requiring the player to reselect a goal constantly.
10. Commit progress at stable events with duplicate protection across resume/reload. Account for currently live seed flights: saving or leaving mid-flight must not lose or double the resulting plant/progress.

## Acceptance criteria

- A player can identify their chosen patch, explain how it changed after play, and find it after reload.
- Short runs and rim-bounce-heavy turns produce some visible contribution; high performance accelerates pleasure without gating basic ownership.
- Switching focus, completing a patch, repeating full bloom, and reloading do not reset or duplicate progress.
- Existing random growth remains visible outside curated patches and respects the capacity policy from ticket 03.
- Resting a completed patch changes presentation only. Its established habitat remains available to Erwu.
- Validate the first-patch pacing over several runs and document actual outcomes before declaring tuning finished.

## Required from you

None. Start with lavender, daisies, and cosmos using the current palette. Optional: favorite flowers or any flowers you want omitted. A later player observation—whether your wife notices and cares about the chosen patch—is useful tuning evidence, not a prerequisite to implementation.

## Out of scope

Skill trees, breeding, resource conversion, watering chores, and power advantages from garden choices.

## Coordination with ticket 11

Design the progress model so a bed can hold either a chosen common flower or a unique plant from a rare seed, with the same planted → growing → flowering → established stages. Rare-seed plants may take a little longer to establish but use the same reward routing; do not build a second growth system.

## v0.8 record — 2026-09-26

- `garden-beds.js` holds the model: planted (<0.2) → growing (<0.55) → flowering (<1) → established (1). Starting set: lavender, daisies and cosmos.
- Choosing: tap a bed in the garden view, pick a chip, see the planting previewed in flower, then Plant or Cancel. Planting makes that bed the focus; **Grow this bed** switches focus without losing anything. With no valid focus, the first planted, unfinished bed grows. No choice is ever required before a run.
- Rewards: +0.012 per turn, +0.011 per bloomed bud, +0.002 per rim bounce, +0.08 at full bloom. Other planted beds get a quarter of the turn growth. About a third of blooms send their seed flight to the focused bed when it's visible above the flower.
- Replanting is non-destructive: the previous planting goes to the seed tin with its growth (a common planting under 5% growth has nothing to keep).
- Stage changes during play show a small "Flowering" / "Established" note over the bed and are announced to screen readers. The run-end card now says what changed ("The lavender in the morning bed is flowering now.", "You found a moonflower seed."). The garden status line says which bed is growing and its stage.
- Progress is saved at the same stable points as plants (end of each turn and on hiding the page). A turn replayed after a reload can earn its growth again, exactly as with plants; a seed cannot be collected twice (ticket 11).
- No change to damage, spawns, swat or score.

### Pacing

Observed 2026-09-26 with a bot playing ordinary runs in the browser. It aims at random, so it is weaker than a person and its runs are short. Two separate new gardens, lavender planted in the morning bed before the first run:

| Run | Garden A: turns, bed growth | Garden B: turns, bed growth |
|---|---|---|
| 1 | 9 turns → 0.23 (growing) | 9 turns → 0.23 (growing) |
| 2 | 10 turns → 0.70 (flowering; included a full bloom) | 10 turns → 0.54 (nearly flowering) |
| 3 | 18 turns → 1.00 (established) | 13 turns → 1.00 (established) |

- The first visible change (seedlings to leafy plants) arrives in the first short run.
- The first bed established in three runs in both gardens, at the top of the 1–3 run target. A person, whose runs last longer, should get there sooner, so the starting values are kept.
- The run-end card said "The lavender in the morning bed is growing well now.", "…is flowering now." / "…is nearly flowering." and "…is fully established now." When a run crosses no stage, it now says how close the bed is ("nearly flowering") rather than just "grew a little".
- Still to confirm with the owner's real play on the phone.
