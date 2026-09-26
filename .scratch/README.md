# Bloom: an owned garden and a life for Erwu

Status: **v0.8 released** to `main` on 2026-09-26 (01–04, 05 phase A, 11) after owner play on the phone; formal ticket 10 checks (Safari performance while a rested garden wakes, haptics, audio) remain open. v0.9 (05 phase B, 06–08) is implemented on the working branch, awaiting owner review and on-phone play; 09 remains planned. See each ticket for its record and evidence, and [`v08-evidence/`](v08-evidence/README.md) for screenshots.
Planning date: 2026-09-25. Roadmap revised 2026-09-26 (release split, Erwu phasing, review notes, ticket 11).
Source baseline: `3df8d53` (Bloom v0.7). Working branch: `develop`.

## Agreed direction

Bloom is a personal game for the owner's wife, starring their real cat, Erwu. Preserve one-handed portrait play, one aiming decision per turn, unhurried thinking, and the pleasure of watching pollen ricochet. Preserve the warm, restrained storybook style and Erwu's recognizable, sometimes unimpressed personality.

The garden becomes an owned place that the player can shape and visit. Erwu gains contextual actions within it. Progress from play already grows plants; extend that existing relationship rather than rebuilding it as a new economy.

**Absence means rest, not loss.** Plants remain owned and in place. Flowers curl or close slightly, stems relax, and a little soft overgrowth suggests a garden waiting for the player. No dying, deletion, punishment, debt, lost unlocks, or obligation to clear weeds. A return should feel welcoming. The old 12-hour grace period is a starting point for visual tuning, not a promised attendance schedule.

## Evidence and limits

Planning is grounded in the current source, release history, the original `bloom/IDEA.md` on the `claude/ios-game-app-concept-8rd7i9` branch of `richardsheng22/Idea-sketches`, and a local Chromium session at 390 × 844. That run reached turn 14, produced 39 plants and seven open flowers, and confirmed reload/resume. Simulated absences demonstrated the current destructive decay. Physical iPhone gestures, audio, and haptics remain release checks.

The arena nearly fills the phone width. Garden plants occupy space above and below it. Erwu is currently a face and paws anchored in her nest. Garden choice, free movement, full-body poses, and direct interaction require new behavior and layout work, not just more decorative effects.

## Releases

The full series is too large for one release, and its riskiest work (a walking, full-body Erwu) should not block the part of the expansion that can be enjoyed first. Split it into two minor versions, each shippable on its own:

| Release | Theme | Tickets | Done when |
|---|---|---|---|
| **v0.8 — “Her garden”** | An owned garden you shape and grow | 01, 02, 03, 04, 05 phase A, 11; 10 for this slice | Your wife can pick a patch, grow it through ordinary play, find a rare seed, plant it, and come back to a resting garden that welcomes her. Erwu has a curled sleep and a seated pose that match her current face. |
| **v0.9 — “Erwu at home”** | Erwu lives in the garden | 05 phase B, 06, 07, 08; 10 for this slice | The first living-garden sequence (ticket 07) and the return ritual (ticket 08) are accepted from a recording. |
| Later | Keepsakes | 09 | After v0.9 feels right. |

Why this order: tickets 01–04 plus 11 give a complete reason to return (something you chose is growing, and something new might turn up) without any new character animation. Ticket 05 phase A adds the poses that matter most for a still scene, stays close to the existing drawing, and can ship as provisional art if the reference pack is not ready. Walking, navigation, and contextual behaviour (05 phase B, 06, 07) are the largest and least certain pieces; they get their own release with the reference pack in hand.

Deploying v0.8 to `main` also retires v0.7's destructive decay for real players. Until it ships, the live game can still delete plants from gardens left alone for about a week.

## Ticket sequence

| Ticket | Result | Depends on |
|---|---|---|
| [01](01-owned-garden-and-resting.md) | Persistent ownership and non-destructive rest | None |
| [02](02-garden-view-and-mobile-interaction.md) | Interactive garden view; safe switch to/from a saved run | 01 |
| [03](03-garden-layout-and-customization.md) | A small, editable layout of patches and useful objects | 01, 02 |
| [04](04-cultivation-through-play.md) | Choose a patch and grow it through normal play | 01, 03 |
| [05](05-erwu-reference-and-animation-foundation.md) | Phase A (v0.8): curled sleep and seated poses. Phase B (v0.9): full-body motion set | A: 02. B: reference pack, 03 |
| [06](06-erwu-behavior-and-touch.md) | Contextual behavior, navigation, and gentle touch responses | 02, 03, 05 |
| [07](07-first-living-garden-sequence.md) | Cultivation → flower → butterfly → Erwu visit → rest | 04, 06 |
| [08](08-in-round-personality-and-return-ritual.md) | Restrained play reactions and a welcoming return | 01, 02, 05, 06, 07 |
| [09](09-discoveries-and-memory-album.md) | Occasional discoveries and a small personal scrapbook | 07, 08; later enrichment |
| [10](10-integration-and-phone-acceptance.md) | Migration, interaction, accessibility, and phone acceptance | Each release's tickets |
| [11](11-rare-seeds-and-unique-plants.md) | Rare seeds found in play grow unique plants | 03, 04 |

Release v0.8 is 01–04, 05 phase A, and 11. Release v0.9 is 05 phase B and 06–08. Before the release split, the first complete playable slice was 01–07; that is now the v0.9 goal. Ticket 08 completes the return experience; ticket 09 is optional enrichment after the core feels right. Ticket 10 applies to each shipped release. Numeric order is a reading order; dependency order governs implementation. Ticket 05 reference gathering can happen while garden foundations are built.

## Shared interaction and scope rules

- Use two presentations of the same owned garden: a garden view for interaction and the existing run view for aiming. Never maintain divergent copies of ownership.
- Protect the playfield and its aiming gesture. Placement, petting, and inspection occur in garden view; movement there never changes run physics.
- Starting/continuing play must not wait for an animation or require a pet-care action.
- Prefer a few generous planting areas and object anchors over manipulating dozens of tiny plants.
- No currencies, energy, hunger, daily streaks, shops, new combat power-ups, or native iOS port in this series. Rare seeds (ticket 11) are owned garden keepsakes, not a currency or a power-up.
- Keep the working web game. Extract small modules only where state/lifecycle boundaries make implementation safer; do not make a framework rewrite a prerequisite.
- Preserve reduced-motion support. Progress and interaction must still work with animation disabled.
- Existing local saves are user-owned work. Version and migrate them; do not silently reset them.

## Input needed from the owner

Every ticket contains an explicit **Required from you** section. Most foundations require nothing. The main request is the Erwu reference pack in ticket 05: a few useful photos or clips and written observations of recognizable habits. Label invented/default behavior as provisional until reviewed. Missing references should block final character fidelity, not unrelated engineering or a clearly labeled motion prototype.

Optional preferences have defaults so they do not become repeated approval requests. No reference material is needed to start ticket 01 or 02. Do not add personal photos/videos to a public repository or shipped bundle merely because they were supplied for reference.

## Completion evidence

For each implemented ticket, record behavior changed, relevant validation, phone-sized screenshots or motion captures, save-compatibility outcomes, unresolved issues, and implementation commit. A ticket is complete only when its acceptance criteria are met; code existing is insufficient evidence of interaction quality. Keep these tickets as planned until implementation actually happens.

## Review notes — 2026-09-26

Findings from a review of tickets 01–03 as committed in `26eac78`. Each is also recorded in the ticket it affects.

- **Tests:** both browser suites failed on `develop` because their loopback server did not serve `garden-layout.js`, so `garden-state.js` could not load. The allowlists are fixed. With the fix, all node tests and both browser suites pass. Any new module must be added to both server allowlists.
- **Rest is barely visible (01).** At 390 × 844, the awake garden and the garden after seven days away differ only by the sleeping “z”s and the status line. A return needs a visible change to welcome the player back into. Strengthen flower folding and quieting before accepting 01's visual tuning, while keeping it serene.
- **The garden view feels empty (02, 03).** Erwu is small in a wide clearing. The three flower beds show bare soil until cultivation exists, so they read as stepping stones. The cushion and sunny stone start put away, so a new garden shows neither. Ticket 04 fills the beds; ticket 03 should place the starter furnishings by default.
- **The run view carries the beds (03).** The projected beds above the arena crowd the top border plants during play. Reconsider their run-view projection (smaller, faded, or omitted) under 03's requirement 2.
- **The interface looks like a form (02, 03).** Native `<select>` pickers and labels such as “Daisy 1” and “Flower patch 2” read as database rows, not the storybook style. Make tapping in the scene the main path. Keep the pickers as the keyboard and screen-reader route, and name things by place or character (“the daisy by the path”, “the sunny bed”).
- **The landing tagline changed** from “Helping Erwu make her garden bloom” to “A little time with Erwu”. Confirm this is intended.
- **Public repository.** The Erwu reference pack for ticket 05 must be kept out of this repository; describe observations in text here instead.

### Follow-up in v0.8 (2026-09-26)

Every point above except the tagline has been addressed; see tickets 01, 02 and 03. The tagline still reads "A little time with Erwu" pending the owner's call.

## Owner review for v0.8

Things only you can judge, best on your phone:

1. **Erwu's two new poses** (curled asleep, seated) are provisional. Do the proportions and tail feel like her? Does she really care about catnip?
2. **Resting:** is the evening-light look right, too strong, or too faint?
3. **Pacing:** in the bot runs a first bed was established in three short runs, and a first rare seed turned up by run three. Does that feel right in real play?
4. **The plant list:** swap any of the six rare plants, or the three common ones, for flowers that mean something to you both.
5. **The tagline:** keep "A little time with Erwu", or go back to "Helping Erwu make her garden bloom"?

## Owner review for v0.9

1. **Does she move like Erwu?** The walk, the stalk-and-pounce and the stretch are invented from general cat movement. A short clip of her walking and one of her stretching would let these be tuned to her.
2. **Pace of her day:** does she do too much or too little? How long she naps, and how often she stalks butterflies, are easy to change.
3. **The welcome back** after time away: is it the right length, and the right gesture?
4. **Butterfly encounters:** charming or too frequent?
5. **During play:** are the yawn after waiting, the glance at butterflies and the pleased look after a strong turn noticeable but not distracting?
