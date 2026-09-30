# Bloom review — 30 September 2026

Reviewed checkout: `7aaf1b1` (`Picture guides: one for the garden, one for play`). The checkout was clean when the review began. This review adds evidence and this document only; it does not change the game.

**My assessment**

Bloom has a convincing identity: a small, affectionate garden that gives a bouncing-pollen puzzle a reason to exist. Erwu, the painted setting, permanent plant ownership, and the gentle treatment of losing fit together unusually well. The garden is the strongest part of the experience. The puzzle has interesting ingredients, but its visual feedback does not yet make all of its decisions as legible as they could be.

I would focus the next iteration on understanding the board and seeing what a short visit accomplished. More mechanics would add more things to explain before resolving those problems.

**What I actually tried**

- Opened the unmodified game in Chromium at 390 × 844, using an isolated browser profile. Looked at the live garden, interacted with planting, read both picture guides, and made slingshot shots through the real pointer handlers.
- Completed two runs, ending at turns 14 and 17. I chose the opening shots visually, then used scripted pointer drags toward the nearest threatening bud. These are interaction samples, not human playtesting or a reliable difficulty distribution. The first script had less conservative timing between turns; I added a settling delay for the second run.
- Collected a wild strawberry seed, planted it in the high bed, cancelled a replant preview, replanted daisies as cosmos, and reloaded. Cancellation preserved the planting; replanting preserved the grown daisies in the tin; the replacement beds survived reload.
- Used separate, explicitly seeded turn-60 saves to inspect a crowded board and exercise sunbeam, dew, bee, dandelion, and Full bloom. These were controlled scenarios, not a claim that I naturally reached turn 60. Every scenario advanced to turn 61 without page errors. Full bloom cleared the charges and restored the swat.
- Ran the unit suite and all five documented browser suites. The view suite covers six sizes from 320 × 568 to 1024 × 768, including landscape, safe-area simulation, pointer cancellation, garden return, resume, game over, and Full bloom transitions.
- Reproduced malformed-run recovery and help-dialog keyboard problems separately.

I did not test a physical iPhone, Mobile Safari/WebKit, a native iOS build, thermal/battery behaviour, or haptics. I did not assess audio by listening. Sound logic has unit coverage, but that is a different kind of evidence. Long-term garden growth was examined through code and elapsed-time fixtures, not weeks of real visits.

**What works well**

1. **The garden feels like a place.** The autumn palette, stone beds, fountain, basket, and moving cat form a coherent scene. Erwu changes pose and location rather than functioning only as a logo. The behaviour suite also passed greetings, mid-walk interruption, return after time away, and a first flowering visit. [First opening](01-garden.png).
2. **The interaction is economical.** Pulling back anywhere leaves the board visible. The aim line gives useful immediate feedback, and playing can start promptly from the garden. Return-to-garden and continuation are well considered, including a cancellable return during a shot.
3. **Losing fits the tone.** Erwu curling up for a nap is a good ending. The end card redirects attention to the garden instead of treating the run as wasted. My first run's card named both the daisies and the strawberry seed. [End card](play-15.png).
4. **Planting has a satisfying connection to play.** The rare-seed tin and planting preview create a clear next step. Keeping a grown planting when replacing it gives experimentation a low cost. [Rare seed preview](12-rare-preview.png).
5. **There is already meaningful mechanical variety.** Petal charges, bank shots, swat recovery, splitting, flower rings, mushrooms, and the four power-ups offer different reasons to choose an angle. In the controlled late-board check, the dandelion visibly scattered the stream and the sunbeam damaged a broad swathe of buds. [Dandelion in use](late-dandelion-effect.png).
6. **The technical foundation has real strengths.** Garden state, time, beds, visits, and behaviour are separate modules with substantial tests. The offline package has a precise inventory, local fonts, and bundled art. Garden save validation and backup handling are noticeably more careful than run-save handling.

**Where the experience needs work**

| Priority | Observation | Why it matters | Recommended change |
|---|---|---|---|
| High | Bud health is difficult to read at phone size. Low-health buds use very small gold pips; larger values use tiny badges. Flower heads, filled petals, glows, and nearby buds compete. | Choosing which bud to hit is the core decision. Players need to distinguish a nearly finished bud from a costly one quickly. | Increase the minimum health-label size and contrast, put pips on a quiet backing, and consider a consistent numeric option. Review the innermost ring as carefully as the outer one. |
| High | The first-shot hint teaches the gesture, but the strategic rules remain scattered. | A player can learn to launch without understanding health, the inward spiral, or how much danger the next turn creates. | Add a short contextual lesson around a real bud: “2 hits left,” then show its next inward position. Explain the swat when it is used and full-bloom recovery when relevant. Keep the guide as a reference. |
| Medium | Both “Best” and the large central HUD value are about turn survival, while the garden's incremental progress is less visible. | A short run can feel productive internally but look almost unchanged afterward. The first run still described the daisies as “Just planted.” | Make the end-of-visit change visible on the actual bed: a new shoot, a brief before/after highlight, or a specific growth description. Preserve the multi-day pace. |
| Medium | Many rules arrive early, and their practical value is unevenly explained. | By turn 10 there can already be health labels, pollen, petal colour, a bee, rings, and a mushroom. | Improve teaching order and make each introduction point to its object. Avoid adding further systems until a new player can explain why they chose a shot. |
| Medium | “Breeze” does not clearly communicate faster playback and resets on each shot. The picture guide does not explain it. | It is easy to mistake it for another garden effect. Repeatedly finding it can become friction on longer turns. | Use an explicit speed label such as “Breeze · 3×” and explain its first appearance. Consider remembering the player's preference after observing real usage. |
| Medium | The calm garden and survival puzzle ask for different kinds of attention. | The garden invites unhurried visits; a crowded board asks for tiny, precise threat assessments. | Keep the puzzle, but make imminent threats obvious and let stopping after a small amount of play feel complete. A turn count alone should not define a successful visit. |

The picture guides themselves are attractive and readable, including the checked 320 × 568 layout. Their principal weakness is coverage and context, not typography. [Guide](07-guide.png).

[Turn 10](play-10.png) and the [controlled turn-60 board](late-sun-before.png) show the readability problem. I would preserve the painting and Erwu's prominence while giving decision-critical marks a stronger visual hierarchy.

I would **not** use my two short runs to conclude that the game is too hard, nor assume that historical bot runs establish good human pacing. The repo's balance records themselves show wide variation. The next useful playtest is observing new players: which bud they target, whether they notice its health and danger, whether they discover Breeze, and what they believe they gained after stopping.

**Confirmed implementation findings**

**1. P2 — A malformed run save can prevent the entire game from opening.**

Location: [index.html:6396](/home/developer/bloom/index.html:6396), with the unchecked restore beginning at [index.html:1130](/home/developer/bloom/index.html:1130).

Startup only checks the run version and that `items` has a nonzero length. `restore` then trusts the item structures. With an existing valid garden, setting `bloom.run3` to `{"v":3,"turn":9,"ballCount":8,"items":[null]}` and reloading throws `Cannot read properties of null (reading 'ring')`. After eight seconds the loading splash remains, and Play is unavailable. The garden is still stored, but the player cannot reach it.

This is a controlled corrupted-data reproduction; I did not observe ordinary play producing that save. It nevertheless exposes a recovery gap in a game whose central promise is persistent ownership. Validate the complete run schema and quarantine a bad run, keeping the garden usable. A bad run must not require clearing all browser storage. [Screenshot](corrupt-run.png); reproduction: `recovery.cjs`.

**2. P2 — The help dialog allows keyboard interaction with the garden behind it.**

Location: [index.html:6326](/home/developer/bloom/index.html:6326).

Open the garden's question-mark guide, then Tab beyond Next. Focus visits the underlying flower beds, Erwu, sound, help, and Play. Pressing Enter on that hidden-behind-the-modal Play button switches to the run while the guide remains open. There is no focus containment, and `openGuide` only makes `#app` inert, although the garden is the separate `#title` section.

Additionally, `closeGuide` always sets `#app.inert = false`, undoing the garden view's existing inert state. The game view was inert before opening the garden guide and was no longer inert after closing it. Make every background view inert while the modal is open, contain keyboard focus, and restore prior state on close. Reproduction: `modal-check.cjs`.

**3. P2 for test reliability — The persistence browser suite assumes elapsed hours equal garden days.**

Location: [tests/garden-browser.cjs:84](/home/developer/bloom/tests/garden-browser.cjs:84).

The suite expects `floor(hours / 24)` days of growth. The game deliberately uses local garden-day boundaries at 04:00. A 12-hour absence can cross that boundary. Here the unmodified suite fails with bed growth `0.63` where its assertion expects `0.60`.

I ran a temporary wrapper that changed only this test expectation to the difference in garden-day indices. The rest of the suite then passed, including 0/12/72/168/720-hour visits, ownership, background/resume, failed writes, backup recovery, and unreadable saves. This diagnoses the failure; it does not turn the original suite green. The repository test is unchanged. Fix its fixture/timezone assumptions and explicitly test visits that cross 04:00 despite lasting under 24 hours. Diagnostic wrapper: `garden-suite-wrapper.cjs`.

**Other engineering and documentation observations**

- The current CI web job runs `npm test` and the offline package suite, but not the garden-view, persistence, behaviour, or rendering browser suites. Add appropriate interaction checks after making their clock assumptions deterministic. See [.github/workflows/ios.yml:20](/home/developer/bloom/.github/workflows/ios.yml:20).
- `index.html` is 6,419 lines and combines UI, input, physics, save restoration, sound synthesis, and rendering. The useful next extraction is run state/validation and turn simulation into a testable module, following the existing garden-module pattern. A broad rewrite would carry unnecessary risk.
- Keyboard aiming exists, but the canvas is hidden from accessibility APIs and the board's accessible label only describes the controls. A nonvisual player cannot obtain the current tactical board from that label. Treat full screen-reader gameplay as unfinished rather than assuming labelled buttons provide it.
- Some documentation promises exceed implementation. README says replanting preserves everything, but `garden-beds.js:109` discards common plantings below 5% growth. The planting UI also says “Nothing you have grown is lost.” This is a small but concrete copy/behaviour mismatch. The README's power-up list also omits the new dandelion clock, and its planting-card position description does not match the current central overlay.
- Approximately 3.77 MB of font and painted-art resource transfers were observed on the tested autumn first load. The complete staged package is 6,113 KiB (about 6 MB). Those sizes are reasonable to measure on the target phone; these desktop checks do not establish decode-memory or battery performance.

**Validation record**

| Check | Result |
|---|---|
| `npm test` | 87 passed, 0 failed |
| `tests/garden-view-browser.cjs` | Passed all six sizes and interaction/lifecycle scenarios; no page errors |
| `tests/erwu-browser.cjs` | Passed behaviour, greeting, first bloom, backgrounding, and reduced-motion checks; no page errors |
| `tests/erwu-render-browser.cjs` | Passed pose/turn-volume, trait, stable rendering, and phone screenshot checks; no page errors |
| `tests/offline-package-browser.cjs` | Passed exact 27-file inventory, blocked-outside-network play, fonts/art, planting, and a run to turn 3 |
| `tests/garden-browser.cjs` unmodified | Failed at the 12-hour growth expectation |
| Persistence diagnostic wrapper | All remaining scenarios passed after correcting the test's day-count expectation in memory |
| Two ordinary-start pointer-controlled runs | Ended at 14 and 17; no page errors |
| Five controlled late-game scenarios | Advanced to turn 61; no page errors; Full bloom reset charges and recharged swat |
| Cancel/replant/reload | Cancellation preserved beds; grown daisies returned to tin; new plantings survived reload |

Browser dependencies were supplied outside the repository. Staging generated ignored `www/` and `build/` outputs. Logs and selected screenshots are alongside this report. The reproduction scripts contain this review environment's absolute browser/runtime paths and may need those paths changed elsewhere.

**Recommended next slice**

First fix run-save recovery and help-dialog focus, and repair the failing persistence test. Then improve bud-health legibility and contextual teaching. Finish with a visible, modest “what changed this visit” moment for the planted bed. Preserve the warm tone, permanent ownership, immediate Play/Continue, and the absence of streak pressure; those are already doing useful work.
