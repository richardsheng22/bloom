# 02 — Start with a bare garden that fills in over weeks

Status: implemented in code; the final look waits on the bare backdrop (ticket 08). Dependencies: 01. Art: the bare backdrop (ticket 08) for the final look.

## Outcome

The first screen is a simple garden: lawn, the rose bed with Erwu's basket, the fountain, the log and three empty beds. Over the following weeks, borders, drifts of flowers, ivy and visitors arrive. After a month she can put a screenshot from day one next to today and see a garden she made.

## Owner decision

Everyone starts bare in 1.0, including the owner's family (2026-09-29). Old saves stay in storage untouched and are never deleted, but the game does not load them.

## Design

**Save v4.** A new storage key (`bloom.garden4`, with its own backup key). On first launch of this version the game starts a fresh v4 garden whatever is under the older keys. The v3 and older keys are not read, written or removed. The run in progress (`bloom.run3`) is discarded with the old garden, so a run can't feed a garden it didn't start in. Best score, sound preference and seen introductions are kept.

**What "bare" means.**
- The backdrop is the bare plate (ticket 08). Until it arrives, the existing plate is washed back toward plain lawn in the garden view by how grown the garden is, as the run already does.
- No starter sprouts beyond two or three tufts of grass by the rose bed.
- The flower borders at the lawn's edges come only from play (`drawYard` already fills the edges by tier).

**Milestones.** Tier changes become small moments, shown once each on the garden's paper label when she next visits the garden:

| Tier | Moment |
|---|---|
| 1 | "The first flowers are coming up." |
| 2 | "The borders are starting to fill in." |
| 3 | "Ivy has found the fountain." (the ivy already drawn at this tier) |
| 4 | "Moss is softening the stepping stones." |
| 5 | "The garden has really settled in." (the fairy ring) |

Tier thresholds rise so the top tier takes about 3–4 weeks under ticket 01's pacing.

## Build requirements

1. Garden state v4 with a fresh-start load path, its own backup, and tests: an existing v3 save is left byte-for-byte untouched and a fresh v4 garden is created; a v4 save round-trips; a newer-format save is left untouched.
2. Garden view washes the painted plate by lushness until the bare plate is available; swap to the bare plate when `garden-plate-bare` is in the art manifest.
3. Raise the tier thresholds; record milestone moments in `garden.discoveries` so they show once.
4. Remove the resting copy from the HUD; the status line describes the focus bed or the latest milestone.

## Acceptance criteria

- A fresh install shows a noticeably simpler garden than the current first screen.
- An owner's existing v3 garden is still present in storage after first launch of v4.
- Each milestone shows once, survives reload, and never repeats.
- With the bare plate in place, day 1 and day 30 screenshots differ clearly at phone size.

## Implementation record — 2026-09-29

- `garden-state.js` is version 4 under `bloom.garden4` (backup `bloom.garden4.backup`). Older keys are listed in `BloomGarden.RETIRED` and never read, written or removed. Migration code for v1–v3 is gone, since nothing loads those saves any more.
- A new garden gets three tufts of grass by the rose bed; a run left from the older garden is set aside for a new one.
- Until `garden-plate-bare` exists, the garden view washes the painted borders along the sides and foot back to lawn by how grown the garden is, clear of the fountain and log (`paintBackground`). It's a stand-in: flowers still show faintly through it.
- Tier thresholds are now 4, 15, 40, 75, 120. Milestone moments are recorded as `milestone` discoveries and shown once on the garden's label.
- Checked: `tests/garden-state.test.cjs` (old saves untouched, v4 round trip) and `tests/garden-browser.cjs` (bare first launch, old saves byte-for-byte, the old run set aside).
