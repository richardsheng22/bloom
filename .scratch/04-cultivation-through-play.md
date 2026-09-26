# 04 — Let ordinary play grow a chosen patch

Status: planned. Priority: core. Dependencies: 01, 03.

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
