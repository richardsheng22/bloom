# 09 — Preserve a few personal discoveries and moments

Status: planned, later enrichment. Priority: after the first playable slice feels good. Dependencies: 07, 08.

## Outcome

The garden has a little history: a first visitor, a favorite nap spot, an established patch, or an amusing encounter. The player may revisit these moments in a small scrapbook.

## Build requirements

1. Start with a short authored set of meaningful event types: first cultivated patch in bloom, first contextual butterfly encounter, first use of a resting object, and an occasional garden discovery. Do not record every routine action.
2. Discoveries can happen through ordinary play and visits. No daily deadline, escalating rarity grind, missed-day penalties, or completion-percentage pressure. A missed visual event can still be recorded if it actually occurred; never claim a moment happened when it did not.
3. Any found object should either be a small decorative keepsake or unlock a behavior already supported. Keep furnishing capacity and visual clutter constraints from ticket 03; ownership need not mean everything is displayed simultaneously.
4. Record stable event ID, relevant plant/object identity, and minimal descriptive metadata. Deduplicate on save/resume and object movement. Preserve memories after rearranging or removing a displayed furnishing.
5. Use a compact album accessible from garden view, with a short caption and an illustration or deliberately captured scene. Start with lightweight deterministic illustrations if screenshots would create storage pressure or render incorrectly across devices.
6. Captions describe the event warmly and accurately. “Erwu tried the sunny stone” is safer than claiming a favorite after one visit. A favorite should come from repeated behavior or an explicit player choice.
7. Keep the album optional. A small new-moment indicator is enough; no modal interruption during shots, no unbounded badge count, no forced sharing prompt.
8. Store ownership/discovery metadata separately from any larger media. Bound media storage and handle quota failure without losing the garden or run. Explain local-only storage honestly.
9. A later photo/export function must exclude debug UI and private source references. Sharing is user initiated; do not upload anything automatically.

## Acceptance criteria

- A qualifying event yields one accurate entry; reload and replay do not duplicate it.
- Entries survive garden rest, layout edits, and save migration.
- A player can open, read, and close the album one-handed without losing a run.
- No reward or essential behavior requires album use or a daily visit.
- Storage failures in optional media cannot damage gameplay saves.
- On a small phone, images and captions remain readable without hiding dismissal controls.

## Required from you

None for the basic event/album system. Optional: preferred caption tone, a few personal phrases, or a specific keepsake meaningful to you and your wife. Obtain explicit permission before using real photos or personal text in a public/shipped artifact. Do not block the system on these extras.

## Out of scope

Social feeds, leaderboards, cloud albums, accounts, monetization, and mandatory collection goals.
