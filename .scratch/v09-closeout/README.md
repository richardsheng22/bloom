# v0.9 web closeout — 2026-09-28

## Scope and baseline

Implemented on `develop`, based on `b461a28` (owner review: retire Arrange, keep the garden still, smooth Erwu's walk). Implementation commit subject: `Restore painted garden traits and close v0.9 web tickets`. This is a web closeout, not a deployment or a tagged release.

The owner explicitly deferred ticket 09 (album) and physical-phone acceptance in ticket 10. Carry physical Safari/Home Screen testing, audio, haptics, safe areas, lifecycle and device performance into the future complete iOS-build roadmap. No phone acceptance or native readiness is claimed here. The separate feature-branch commit `5b4a1dd` is not included.

## Changes

- Painted sunflowers follow the device clock through a small canopy bend while the stone rim stays fixed. Clock rollback restores the earlier direction. Existing minute-based garden invalidation updates the painting.
- Painted strawberry beds retain white flowers and show pale fruit becoming red as persistent growth advances from 0.75 to 1. Preview shows the mature planting. Colours retain the source painting's shading; stones and foliage are not globally tinted.
- Plant variants are cached in a bounded set (21 sunflower directions and 11 strawberry stages), used by both the still/reduced-motion path and the live wind path. No source images, save schema or reward pacing changed.
- Erwu's run blink now reads the actual seconds-remaining timer rather than an unreachable threshold. Aim/pollen tracking still takes priority.
- Garden greetings use the painted closed-eye seated/peek poses while the slow-blink timer runs. Seated catnip pleasure and looking up select their existing expressions.
- Outside the basket, the yawn uses the existing full-body stretch with an open mouth, respecting facing. It shares the stretch illustration rather than introducing a new independently animated seated yawn. Basket yawns keep their dedicated close-up.
- Tickets now distinguish implemented features, retired Arrange controls, deferred work, and optional future character refinement. Historical implementation notes remain available but dated current-scope notes take precedence.

## Validation

All checks below passed against these changes using Node and local Chromium/Playwright on Linux:

| Check | Result |
|---|---|
| `node --test tests/*.test.cjs` | 53/53 pass: saves/migration, ownership, cultivation, rewards, layouts, behavior and view state |
| `node tests/garden-browser.cjs` | Pass: migration/absence cases, resume, reduced motion, storage failures, legacy recovery |
| `node tests/garden-view-browser.cjs` | Pass at 320×568, 375×667, 390×844, 430×932, 568×320 and 1024×768; bed inspection, keyboard, queued return, exact resume and game over |
| `node tests/erwu-browser.cjs` | Pass: visit variety, mid-walk hello, stationary bed card, background/resume, immediate play, welcome and first-bloom discovery, reduced motion |
| `node tests/erwu-render-browser.cjs` | Pass: painted blink selection, sunflower pixel change with identical rim, reversible clock selection, increasing red fruit through growth, normal/reduced-motion render paths, stable fallback rendering and screenshots |
| `git diff --check` | Pass |

All four browser suites completed without page errors. The render suite's first attempt exposed a stale test reference to `cat` after game initialization replaced it; the injected hook now uses a getter for the live state, and the rerun passed. Hooks are test-server-only.

## Evidence and limits

- [Plant direction and ripening](plant-traits.png): production `drawBed` at three clock times and three growth stages, visually inspected.
- [Reduced-motion plant traits](plant-traits-reduced.png).
- [390 px garden](garden-390.png).
- Full temporary outputs: `/tmp/bloom-close-erwu-render-browser`, `/tmp/bloom-close-garden-browser`, `/tmp/bloom-close-garden-view-browser`, `/tmp/bloom-close-erwu-browser`.

Automated tests do not establish real-phone performance or subjective likeness. First-bloom browser coverage reaches the visit/stalking and checks discovery deduplication; it does not certify the entire sequence's artistic quality. These are documented limits, not requests for a phone session in this milestone. Further owner observations can guide later polish.

## Remaining roadmap

1. Future iOS planning: bring forward ticket 10's physical-device acceptance matrix.
2. Deferred enrichment: ticket 09's memory album, including its UI and narrative curation.
3. Optional polish: Erwu's distinctive habits/likeness and the complete first-bloom sequence; consider the separate rest-presentation branch when integrating subsequent work.
