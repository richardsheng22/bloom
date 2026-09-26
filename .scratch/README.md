# Bloom: an owned garden and a life for Erwu

Status: tickets 01–02 implemented and locally verified; tickets 03–10 remain planned. See each ticket for evidence and remaining review.
Planning date: 2026-09-25.
Source baseline: `3df8d53` (Bloom v0.7). Working branch: `develop`.

## Agreed direction

Bloom is a personal game for the owner's wife, starring their real cat, Erwu. Preserve one-handed portrait play, one aiming decision per turn, unhurried thinking, and the pleasure of watching pollen ricochet. Preserve the warm, restrained storybook style and Erwu's recognizable, sometimes unimpressed personality.

The garden becomes an owned place that the player can shape and visit. Erwu gains contextual actions within it. Progress from play already grows plants; extend that existing relationship rather than rebuilding it as a new economy.

**Absence means rest, not loss.** Plants remain owned and in place. Flowers curl or close slightly, stems relax, and a little soft overgrowth suggests a garden waiting for the player. No dying, deletion, punishment, debt, lost unlocks, or obligation to clear weeds. A return should feel welcoming. The old 12-hour grace period is a starting point for visual tuning, not a promised attendance schedule.

## Evidence and limits

Planning is grounded in the current source, release history, the original `bloom/IDEA.md` on the `claude/ios-game-app-concept-8rd7i9` branch of `richardsheng22/Idea-sketches`, and a local Chromium session at 390 × 844. That run reached turn 14, produced 39 plants and seven open flowers, and confirmed reload/resume. Simulated absences demonstrated the current destructive decay. Physical iPhone gestures, audio, and haptics remain release checks.

The arena nearly fills the phone width. Garden plants occupy space above and below it. Erwu is currently a face and paws anchored in her nest. Garden choice, free movement, full-body poses, and direct interaction require new behavior and layout work, not just more decorative effects.

## Ticket sequence

| Ticket | Result | Depends on |
|---|---|---|
| [01](01-owned-garden-and-resting.md) | Persistent ownership and non-destructive rest | None |
| [02](02-garden-view-and-mobile-interaction.md) | Interactive garden view; safe switch to/from a saved run | 01 |
| [03](03-garden-layout-and-customization.md) | A small, editable layout of patches and useful objects | 01, 02 |
| [04](04-cultivation-through-play.md) | Choose a patch and grow it through normal play | 01, 03 |
| [05](05-erwu-reference-and-animation-foundation.md) | Reference-backed full-body Erwu and motion foundation | Can begin immediately; integrate with 02/03 |
| [06](06-erwu-behavior-and-touch.md) | Contextual behavior, navigation, and gentle touch responses | 02, 03, 05 |
| [07](07-first-living-garden-sequence.md) | Cultivation → flower → butterfly → Erwu visit → rest | 04, 06 |
| [08](08-in-round-personality-and-return-ritual.md) | Restrained play reactions and a welcoming return | 01, 02, 05, 06, 07 |
| [09](09-discoveries-and-memory-album.md) | Occasional discoveries and a small personal scrapbook | 07, 08; later enrichment |
| [10](10-integration-and-phone-acceptance.md) | Migration, interaction, accessibility, and phone acceptance | 01–08; include 09 if shipped |

The first complete playable slice is 01–07. Ticket 08 completes the return experience; ticket 09 is optional enrichment after the core feels right. Ticket 10 applies to each shipped slice. Numeric order is a reading order; dependency order governs implementation. Ticket 05 reference gathering can happen while garden foundations are built.

## Shared interaction and scope rules

- Use two presentations of the same owned garden: a garden view for interaction and the existing run view for aiming. Never maintain divergent copies of ownership.
- Protect the playfield and its aiming gesture. Placement, petting, and inspection occur in garden view; movement there never changes run physics.
- Starting/continuing play must not wait for an animation or require a pet-care action.
- Prefer a few generous planting areas and object anchors over manipulating dozens of tiny plants.
- No currencies, energy, hunger, daily streaks, shops, new combat power-ups, or native iOS port in this series.
- Keep the working web game. Extract small modules only where state/lifecycle boundaries make implementation safer; do not make a framework rewrite a prerequisite.
- Preserve reduced-motion support. Progress and interaction must still work with animation disabled.
- Existing local saves are user-owned work. Version and migrate them; do not silently reset them.

## Input needed from the owner

Every ticket contains an explicit **Required from you** section. Most foundations require nothing. The main request is the Erwu reference pack in ticket 05: a few useful photos or clips and written observations of recognizable habits. Label invented/default behavior as provisional until reviewed. Missing references should block final character fidelity, not unrelated engineering or a clearly labeled motion prototype.

Optional preferences have defaults so they do not become repeated approval requests. No reference material is needed to start ticket 01 or 02. Do not add personal photos/videos to a public repository or shipped bundle merely because they were supplied for reference.

## Completion evidence

For each implemented ticket, record behavior changed, relevant validation, phone-sized screenshots or motion captures, save-compatibility outcomes, unresolved issues, and implementation commit. A ticket is complete only when its acceptance criteria are met; code existing is insufficient evidence of interaction quality. Keep these tickets as planned until implementation actually happens.
