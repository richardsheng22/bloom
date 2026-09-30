# Bloom improvement implementation plan

Status: proposed, not implemented. Based on review of checkout `7aaf1b1`, 30 September 2026.

**Product goal**

Make the next shot easier to understand and a short visit's contribution easier to see. Keep the painted garden, Erwu, one-thumb aiming, persistent ownership, and unpressured return visits at the centre of the experience.

The first implementation pass improves reliability, presentation, teaching, and feedback. Difficulty and growth-rate changes follow observed playtesting. The two review runs are insufficient balance evidence.

**Delivery order**

| Slice | Result | Depends on | Relative size |
|---|---|---|---|
| 1 | Deterministic browser checks in CI | — | Small |
| 2 | Bad run saves cannot block the garden | 1 | Medium |
| 3 | Help is a properly isolated, pausing dialog | 1 | Small–medium |
| 4 | Health, danger, and the aimed-at object are readable | 1 | Medium–large |
| 5 | Players learn rules as they become useful | 3, 4 | Medium |
| 6 | Playback speed is clear and remembered | 3 | Small |
| 7 | Every return can show actual garden progress | 2, 3 | Medium–large |
| 8 | New-player and physical-device validation | 2–7 | Validation round |

Sizes indicate relative scope, not calendar estimates. Each slice gets a focused commit or PR with its own acceptance evidence. Save correctness and readability are the highest priorities. If scope must shrink, ship 1–4 first, then 5–7 together as the first-session improvement.

**1. Make the verification baseline dependable**

Change `tests/garden-browser.cjs`, browser test setup, `package.json`, and `.github/workflows/ios.yml`.

- Replace the assumption that elapsed hours divided by 24 equals garden days. Give the browser context an explicit timezone and use named, fixed dates.
- Add independently specified cases: a 12-hour absence that stays within one garden day, a short absence crossing local 04:00, repeated reopening, seven-day cap, backward clock movement, and daylight-saving transitions. State expected outcomes explicitly; do not derive every expected value by calling the production function under test.
- Keep a Toronto fixture and a UTC fixture. Fix any production clock defect exposed by the new boundary cases in a separate, clearly scoped change.
- Add a `test:browser` entry point covering persistence, view/input, and modal tests. Run it with the existing unit and offline-package checks in CI. Keep longer Erwu behaviour/render checks in a separate job so failures are easy to identify.
- Capture screenshots, console errors, traces on failure, runtime/browser versions, and logs. No automatic acceptance of changed screenshots.
- Use deterministic test-only fixtures/hooks for board state and gameplay randomness. Garden/decorative random calls must not silently change balance-fixture outcomes.

Acceptance: the original persistence suite passes without a wrapper; cases crossing 04:00 work in both timezones; a deliberate modal or recovery regression fails CI; existing 87 tests remain green unless a documented assertion is deliberately corrected.

**2. Protect access to the garden when a run is damaged**

Add a small `run-state.js` module following the existing pure garden modules. Integrate it at `serialize`, `restore`, `markReady`, and `start` in `index.html`. Add it to `tools/stage-web.cjs` and the script load order.

Proposed interface: `decodeRun(raw)` returns a tagged result for missing, valid, invalid, or unsupported-future data. It normalizes documented legacy defaults without mutating storage. Return a normalized checkpoint only after validation succeeds.

Validate:

- Version, positive finite integer turn/pollen values, booleans, and the ten finite petal charges in their supported range.
- An actual items array, allowed kinds, valid sectors/rings, positive bud health with `hp <= maxHp`, species/colour indices, and permitted optional seed/stubborn fields.
- Seed identity, special-turn schedule, and the shapes of optional summary data.
- Historical supported run fixtures. Do not invent arbitrary upper limits that invalidate legitimate long runs; document domain-derived bounds where there are real limits.

Recovery flow:

1. Load the garden through its existing ownership-safe path.
2. Decode the run before applying it to live state.
3. If invalid, open the garden and show a concise explanation that the run could not be resumed. Offer “Start a new run.” Keep the garden intact.
4. Preserve the rejected raw data before replacing it, using one bounded recovery slot. If preservation fails, retain the original and permit clearly labelled temporary play rather than silently overwriting it.
5. For a future unsupported version, preserve the source key and block replacement writes; explain temporary play. Do not treat a future save as ordinary corruption.
6. Keep recovery messaging separate from transient garden news so a visitor caption cannot hide a save problem.

Do not introduce automatic restoration of stale run backups without proving reward deduplication and garden/run consistency. Coherent native storage remains the responsibility of the existing iOS ticket 05; this immediate web fix is not a substitute for it.

Tests: `[null]` items, non-array items, unknown kinds, invalid numbers, malformed optional metadata, future versions, unavailable/full storage, older valid runs, and exact valid checkpoint round-trips. Check recovery/reload does not overwrite owned plant data or award the same rare seed twice. Offline staging must include the new module.

Acceptance: no malformed run traps startup; a valid garden remains accessible; valid saves resume the same board; preserved/future data stays untouched unless the supported replacement flow succeeds.

**3. Make help behave like a real modal**

Change `openGuide`, `closeGuide`, guide keyboard handling, frame/update scheduling, and related state transitions in `index.html`. Keep the existing guide artwork.

- While help is open, isolate the garden, run, and end-card backgrounds. Preserve prior inert states rather than unconditionally enabling `#app` on close.
- Contain Tab and Shift+Tab within the dialog, excluding disabled/hidden navigation controls. Escape closes; focus returns to the invoking visible control or a valid view-specific fallback.
- Clear an active drag before opening. Pointer release after dismissal must not launch a stale shot.
- Pause run simulation while reading. Use an explicit pause reason and audit delayed presentation callbacks as well as the frame loop. Closing resumes once, without consuming elapsed wall time or skipping a turn.
- Resolve overlapping UI intentionally: game-over and introduction presentation must not appear above the open guide. Reevaluate the current view when restoring focus/state.
- Preserve real elapsed garden time; modal pause concerns the run, not the calendar.

Tests: repeated open/close from garden and run, Tab cycles both ways, hidden Play cannot activate, no shot progress during help, resumed shot completes once, guide plus background/foreground, guide during a queued return, game-over transitions, Escape and pointer cancellation.

Acceptance: focus never reaches the background; closing garden help leaves the run inert; reading cannot change the tactical board; no phantom shot, duplicated turn, or lost resume.

**4. Improve tactical readability without changing physics**

Change `drawBud`, `drawAim`, health-label rendering, and relevant ready-state HUD presentation in `index.html`. Add a pure geometry/presentation helper only where it makes label placement or target selection testable.

**Health:** Start with one consistent numeric label for every bud, including 1–4 health. The painted flower remains the object; a small opaque paper or dark-ink badge provides the number. Use a plain, readable numeric face. Keep labels upright and steady while flowers wobble. The one-hit glow becomes supporting feedback rather than the only cue.

Prototype 12–14 CSS-pixel digits and an 18–22-pixel badge height; these are initial visual targets, not guaranteed fit. Size three- and four-digit labels from measured text width. Inspect the tight inner rings on 320-pixel phones before choosing final dimensions. Use a small deterministic set of nearby label anchors when needed; never resolve crowding by shrinking text below the agreed readable floor. Keep associations to buds obvious. Do not alter hitboxes to make labels fit.

**Danger:** Mark buds that will reach Erwu on the next ordinary inward advance with a restrained, static outline or inward marker. Tie any accompanying wording to the swat state. Avoid a full-screen alarm, flashing, or meaning conveyed only through colour. Phrase it conditionally: the player can clear or push those buds back during the shot. Swat currently clears the centre-reaching buds and the adjacent inner ring; tutorial copy must reflect that actual behaviour.

**Aiming:** Reuse the existing drag. While aiming steadily at a directly intersected bud, show one larger footer readout, for example “Rose · 18 hits left.” Add the threat note when applicable. Select the first relevant intersection using the actual collision geometry, not the nearest centre. A mushroom should not yield a misleading bud readout behind it. Describe power-ups when directly targeted. Do not promise a full outcome prediction through bounces, moving targets, or random dandelion scatter.

Render labels and indicators in a deliberate layer above decorative glows/petal artwork. Tone down local decorative contrast where necessary while retaining the garden's visual character.

Fixtures: turns 1/10/30/60/100, occupied inner rings, mixed one-/two-/three-/four-digit health, rare-seed pods, stubborn rings, selected powers, filled petals, every season, both motion modes, and the six existing viewport sizes.

Acceptance: labels are identifiable at normal scale; labels do not obscure each other or unrelated buds in stress fixtures; urgent buds remain recognizable without colour; aiming text agrees with the actual first intersection; physics and saved board state do not change. A human screenshot/play review is required alongside geometric checks.

**5. Teach a rule when the player can use it**

Refactor `INTRO`, `offerIntro`, `seen`, the first-shot hint, and `GUIDES`. A small `game-hints.js` pure selector can decide the next hint from stable board state and previously acknowledged hints.

Recommended sequence:

| Trigger | Message/action |
|---|---|
| First ready board | Pull back and release, with one quiet directional example |
| First aim at a bud | Explain that its number is the hits still needed |
| First completed turn | Briefly mark a surviving bud's new position: buds spiral closer after a shot |
| First imminent threat | Explain what happens if it survives this shot, using the current swat state |
| Swat used | Explain that Full bloom restores it |
| First useful power-up | Name the actual object and explain that pollen activates it |
| First rare seed | Point to the tin and its planting purpose |
| First longer shot | Explain the speed control |

Keep one contextual message at a time. Use a small docked caption and an anchored highlight, not a card over the target. Allow immediate aiming to dismiss decorative instruction. Keep a hint pending if its object has disappeared or the player opened help/returned to the garden. Mark it seen after it has actually been presented, not merely at spawn as happens now.

Do not require a scripted shot or change the board's random difficulty just to force a lesson. Introduce advanced rules when they occur. The existing picture guide remains available for replay and gets accurate entries for health, movement, speed, and Full bloom's damage/swat effects.

Version the small hint preference separately from owned garden data. Preserve previously acknowledged mechanics where their explanation remains valid; teach only genuinely new information after an update.

Acceptance: immediate Play/Continue still works; only one hint appears; a hint never points at a dead or absent object; returning players are not forced through an opening tutorial; short sessions and reloads do not spam or lose pending hints. Include fresh, returning, skipped-hint, and interrupted-hint browser cases.

**6. Make playback speed obvious and persistent**

Change `#ff`, `updateHud`, `launch`, and the speed preference. Keep the two choices: 1× and 3×.

- Label it explicitly, such as “Speed · 1×” and “Speed · 3×”; the breeze artwork can remain.
- After discovery, keep its location stable in the footer. Let the player set the next shot's speed while ready, instead of hunting for a control that appears late.
- Save the chosen speed and reuse it at launch. Give it a full accessible name and a comfortable touch target.
- Apply faster time only to shot resolution, preserving unhurried aiming and legible notices.
- Audit the 22-second shot safety timeout. It currently uses unscaled elapsed time while physics uses scaled time. Decide and implement a consistent simulation-time policy so playback speed does not accidentally change the rules. Any resulting balance correction must be identified and validated separately from relabelling.

Acceptance: preference survives reload; no footer overlap at 320 pixels; speed does not launch anything by itself; deterministic controlled shots at 1× and 3× produce equivalent gameplay results, allowing documented numerical tolerance. Test the timeout and powers, not just a simple empty-rim bounce.

**7. Show actual garden progress on every return**

Add `garden-progress.js` for summary calculations and integrate it with `runLog`, `runSummary`, `showSummary`, `showTitle`, `leaveTitle`, `drawBed`, and Erwu's existing changed-bed visit. Update the offline manifest for any new module.

The current run log stores a flower/stage string, which cannot measure a small growth increase. Add optional versioned summary metadata containing bed identity, planting identity or generation, flower kind, numeric growth at baseline, relevant seed/discovery identities, and the last acknowledged return-summary revision. Keep it small and validate it through the save layer. Keep the run baseline in the run checkpoint, but store the pending return summary and its acknowledgement in an optional, versioned `garden.feedback` field: the run checkpoint is deleted at game over. Extend `garden-state.js` validation and snapshot serialization for this additive field; older v4 gardens without it remain valid and keep all ownership. Capture play contributions at the relevant growth/turn events so passive arrival growth can be distinguished from play. Feedback metadata never applies growth itself.

Use two baselines deliberately: total run changes for the existing end card, and changes since the last garden return for the short-visit moment. Initialize at the actual beginning of play, so a bed planted before the first shot is not mistakenly reported as something the run grew. A replant begins a new planting baseline; never subtract growth across different plantings or credit passive growth as play-earned growth.

At a safe return to the garden:

1. Settle the current turn using the existing cancellable return mechanism.
2. Compare actual persisted progress with the visit baseline.
3. Prefer a rare discovery or stage milestone. Otherwise name the focused bed's real progress. Show at most one principal message with an optional secondary discovery.
4. Briefly highlight the affected bed without moving the scene. Let Erwu's existing sniff-bed action reinforce the result when convenient; Play must remain immediate.
5. Record acknowledgement so reloading does not repeat the same celebration. Interrupted display may replay harmless presentation, but must never reapply growth or award a seed.

Improve `drawBed` with restrained intermediate growth cues derived deterministically from stored growth: additional sprouts/leaves within the early stage, then fuller growth approaching flowering. Use existing artwork where possible. If that art cannot produce a meaningful difference, request a small intermediate-stage asset slice rather than enlarging a whole mature bed to pretend it grew. In winter use truthful leaf/rest cues, not flowers that contradict the season.

Example copy: “The morning bed has grown since your last visit.” Use “New shoots in the morning bed” only when the corresponding visible threshold was crossed. If there was no material change, show no invented reward.

Also resolve replanting copy: preserve every common planting with positive growth, while allowing a completely untouched common planting to be replaced without adding an empty duplicate to the tin. Add a regression case below the current 5% threshold. Rare seeds remain preserved regardless of growth.

Tests: partial-run return, end-of-run return, no shots, focus change, replant mid-run, multiple beds of the same species, passive growth, a fully established bed, winter, missing legacy metadata, repeated reload, interruption during summary, and save failure. Restoring old runs initializes a baseline without retroactively claiming progress.

Acceptance: a short visit yields honest, visible feedback when progress occurred; a paused run remains exactly resumable; rewards never duplicate; scene geometry stays fixed; repeated visits do not repeat the same event; established/winter beds have sensible outcomes. Keep the existing multi-day growth rates for this slice.

**8. Validate the result before changing balance**

Run the full unit/browser/offline checks, then perform a small formative playtest with roughly five people who have not played Bloom. This is qualitative evidence, not a statistically representative study. Include a returning player separately.

Give no verbal tutorial. Ask each new player to open the game, plant something, play for a short visit, return to the garden, and explain their choices. Observe whether they:

- Launch and cancel a shot without help.
- Read a bud's health correctly.
- Identify the next threat and understand the swat.
- Activate a power-up deliberately.
- Find the speed control when waiting.
- Describe what changed in their garden and find Continue.

Use four of five understanding the key decisions without prompting as a directional target, not a conclusive usability score. Repeat observation for any misunderstood concept. Record observed behaviour and quotes locally; no analytics service is required.

For balance, compare fixed-seed runs across multiple aiming policies and several device sizes. Separate gameplay randomness from decorative randomness in the harness. Record run-length distributions, power-up impact, swat/full-bloom frequency, and time spent waiting. Replay identical fixtures before/after changes. Do not tune difficulty to the lifespan of a single nearest-bud bot.

For release, feed results into existing iOS tickets 05, 07, 08, 09, 10, and 13 rather than marking them complete from browser evidence. Check actual safe areas, edge gestures, interrupted aiming, suspend/resume, readable text, VoiceOver controls, live Reduce Motion changes, audio interruptions, haptics, sustained frame pacing, and memory on the supported phone floor. Frame and memory targets should be set against measured hardware before acceptance.

Full nonvisual tactical play needs its own bounded route under iOS 09: inspect board objects and danger, adjust aim, launch/cancel explicitly, and receive concise turn results. A keyboard-focus fix alone does not provide that capability.

**Architecture and scope**

Use existing modules and canvas rendering. Extract run validation and progress calculations because they have clear independent contracts. Extract small hint/geometry helpers only when they simplify implementation and testing. Defer moving the full physics engine until reproducible simulation comparisons exist.

Synchronize README and help with the final shipped behaviour, including dandelion, modal placement, playback speed, and replant preservation. Keep save-format changes additive and explicitly tested. New runtime files must be added to HTML loading and the offline staging inventory.

Deferred until this work is evaluated: new power-ups, quests, achievements, furniture editing, daily obligations, automatic difficulty changes, and a whole-engine rewrite. Their value cannot be judged well while existing decisions and rewards are difficult to read.

**Done means**

The game opens even when a run is bad; help cannot leak input; players can read health and imminent danger; teaching follows their actions; speed is clear; a short visit has an honest garden outcome; regression checks run in CI; and native release claims are backed by device evidence. Each completed slice records its commit, tests, screenshots, and any remaining limitations.
