# 06 — Give Erwu contextual intentions and gentle interaction

Status: implemented for v0.9; awaiting owner review of pacing and personality. Priority: core. Dependencies: 02, 03, 05.

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

## Implementation record — 2026-09-26

- **`erwu-behavior.js`** is pure state, time in real seconds and a seeded random source. Its lifecycle: choose an action, then walk, then act, then settle, with cooldowns.
- **Navigation:** a small authored network. She leaves the basket by the gate at the front, goes round the rose bed's sides (never behind the roses), and takes spurs to each bed, the cushion, the stone, the fountain and the log. Routes use the shortest path. Every place is reachable at five phone sizes (unit-tested).
- **Actions:**
  - `nap` in the basket or on the cushion or stone (much likelier while the garden rests, and unlikely in the first 45 s of an awake visit)
  - `sniff-bed` at a planted bed
  - `cushion` and `sun-stone` (loafing on them, wherever they've been arranged)
  - `fountain` (sitting and looking up at it)
  - `log`
  - `wander`
  - `stretch`
  - `sit-quietly`
  - `stalk` a resting butterfly
- **Variety:** weights, cooldowns and a short memory prevent repetition. A five-minute simulated visit has at least five kinds of action, none over 45% of choices, no action four times running, and more still time than walking.
- **Touch:**
  - The hello button follows her around the garden.
  - A tap mid-activity: she stops, turns to face you with a slow blink, then carries on, re-routing if she was walking.
  - A tap while she sleeps: she wakes, sits up facing you, then gets on with her day.
  - Taps within 1.2 s don't stack.
  - With sound on, a hello gives a soft synthesised purr (at most every 6 s; it is not a recording of her).
- **Priority:**
  - Play is immediate.
  - Arranging pauses her in place.
  - Moving or putting away a furnishing she was heading for makes her choose again.
  - A hidden page does nothing and replays nothing on return; each update is capped at 0.1 s.
  - Her timing ignores Breeze and frame rate: the same choices at 30 and 60 fps, within a frame's walk per step.
- **Diagnostics (development only):** `?erwu` in the address shows her current action, step, pose, reason and cooldowns in the garden view, and exposes `window.__erwu.trigger(name)`. `?erwu=<n>` also fixes her random choices, for tests. Nothing is shown in normal play.
- **Tests:**
  - `tests/erwu-behavior.test.cjs` (13): routing, variety, no foot sliding, frame-rate independence, taps (including going back to what she was doing), invalidation and pausing, empty and resting gardens, stalking, a butterfly leaving first, the welcome, and queued sequences.
  - `tests/erwu-browser.cjs` (8 checks): a real visit, a hello mid-walk, arrange pause and re-plan, background and resume, Play mid-walk, the welcome, the first bloom, and reduced motion at 320 × 568.
- **Known limit:** she is always drawn in front of garden art. Her routes keep her in front of the things she visits, so this rarely shows, but she can appear over tall border plants.
