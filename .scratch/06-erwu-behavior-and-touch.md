# 06 — Give Erwu contextual intentions and gentle interaction

Status: planned. Priority: core. Dependencies: 02, 03, 05.

## Outcome

Erwu notices things, chooses an activity, carries it out, and becomes distracted or rests. The player can acknowledge her without turning her into a button that pays out rewards.

## Build requirements

1. Add a bounded behavior controller with clear action lifecycles: idle/observe → choose target → approach → act → settle/cooldown. Inputs include reachable garden objects, mature patches, visitors, recent actions, presentation mode, and rest state.
2. Derive valid targets from actual scene objects and plants. Avoid sniffing empty ground where an object used to be or tracking a nonexistent butterfly.
3. Start with a simple walkable route around the nest and object anchors. Choose a few authored paths if that fits the small scene better than general pathfinding. Respect feet/body bounds, object depth, screen edges, and inspection overlays.
4. Use weighted choice, cooldowns, and repetition limits. Quiet observation and doing nothing are valid outcomes. Do not run every available action in a predictable loop.
5. Garden tap on Erwu: pause/acknowledge with a look, slow blink, or small lean depending on current action. A brief stationary stroke may be added if it can coexist with scrolling sheets and edit gestures; tapping must remain sufficient.
6. Responses are invitations, not guaranteed compliance. Avoid affection meters, mood penalties, reward farming, hunger, or required attention. Repeated taps should not stack clips or generate unlimited hearts/sounds.
7. Mode priority: Play/Continue and explicit UI always win; edit mode suspends autonomous movement near edited objects; direct interaction can politely interrupt low-priority idle actions; active transitions finish only as needed for visual continuity.
8. If a target is moved or removed, release its reservation and choose a coherent fallback. Cancel obsolete delayed callbacks and visitor-following actions on mode change.
9. Keep behavior timing independent of the shot's 3× Breeze speed and of frame rate. Backgrounding pauses active motion; returning must not replay a backlog of actions.
10. Provide development-only observation of current action, target, reason, and cooldown, plus a way to trigger individual actions. Do not expose diagnostics in product UI.

## Acceptance criteria

- Watch a five-minute garden session: behavior has pauses, varied targets, and no repeated identical sequence dominating the session.
- Tap repeatedly, move/remove a target, open inspection, enter Arrange, start play mid-walk, and background/resume; no stuck action or out-of-bounds cat results.
- Erwu reaches actual interaction anchors and layers correctly in front of/behind furnishings.
- Touch interaction does not plant, move, or launch anything unintentionally.
- Behavior works with reduced motion, an empty garden, a crowded legacy garden, and no visitors.
- Use focused state-transition tests for interruption/target invalidation; use recordings for naturalness and pacing.

## Required from you

Use the ticket 05 reference pack; do not request it again. Optional written observations: how she responds to being touched when resting, whether she leans into petting, and whether she follows or ignores attention. Default responses may be prototyped, but any action described as her signature requires your confirmation. No input is needed for navigation, interruption, or gesture handling.

## Out of scope

A pet-needs simulation, conversational AI, obedience training, or random behavior that influences aiming difficulty.
