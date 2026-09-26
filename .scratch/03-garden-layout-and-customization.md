# 03 — Give the player a small, personally arranged garden

Status: in progress — arrangement code committed in `26eac78` without an implementation record or tests. Priority: core. Dependencies: 01, 02.

## Outcome

The player can arrange a few meaningful patches and objects without managing individual blades of grass. Choices create places Erwu can later use.

## Current behavior and seams

`findSpot` randomly places plants outside the arena using screen-dependent bounds. Plant positions are polar coordinates relative to the arena; `paintGarden` caches their rendering. There is no object inventory, selection, placement, or stable spatial identity.

## Build requirements

1. Establish a small layout of three planting patches and two furnishing anchors as an initial composition, adjustable after phone review. Preserve a clear route around the nest and at least one generous place for a full-body Erwu.
2. Use stable logical anchors rather than raw pixel placement. Define how each anchor appears in garden and run views; during play, project garden patches outside the arena and suppress interactive decoration that would obstruct aiming. Scene identity must survive the projection.
3. Preserve legacy plants as an existing natural border. Do not force every old plant into a new patch or erase it to make room. Document handling of crowded saves and the existing 170-plant limit; reserve capacity or aggregate patch rendering so new cultivation remains possible.
4. Start with a minimal usable assortment: a flower patch, a cushion, and a sunny stone. Leave tall grass as the next habitat enabled by ticket 07 if space allows. Ownership is free/default or earned through cultivation, never purchased with a new currency.
5. Enter Arrange explicitly. Tap an object or patch, then tap a highlighted compatible anchor; show a preview with Place and Cancel. Dragging can be optional enhancement, not the sole placement method.
6. A placement sheet shows only the few available choices and a simple description of purpose, such as “a warm place for Erwu to nap.” Keep engineering concepts out of UI.
7. Swapping an occupied anchor must preview both resulting positions or require an explicit swap action. Never silently delete or overwrite an object. Moving/removing a furnishing returns it to the owned collection. Cancel leaves the previous layout intact.
8. Save only committed arrangements. Supply one-step undo for the last placement within the edit session. Exit editing cleanly on Play; discard an unconfirmed preview.
9. Decorations cannot cover the route, nest, touch targets, top/bottom controls, or the run arena. Reserve standing and resting positions beside interactable objects, not just their artwork bounds.
10. Rebuild cached background layers only when layout or relevant appearance changes. Animate Erwu and visitors separately; avoid repainting every static plant every frame.

## Acceptance criteria

- Place, move, swap, remove, undo, cancel, and reload all work at 320 px width using taps alone.
- No ownership or growth is lost after rearrangement, switching modes, or interrupted placement.
- Crowded legacy gardens remain recognizable and still allow the new system to function.
- Objects keep identity and relationships across device size/orientation changes; the run stays legible.
- Every usable object has reachable interaction/rest anchors for ticket 06 and a stable saved ID.
- Review a composed garden with all initial anchors occupied; it must still feel spacious and allow Erwu to be seen.

## Required from you

None for layout and placement mechanics. Optional: a photo of Erwu's real cushion, bed, or favorite toy if one should inspire an object. Otherwise use a clearly provisional cushion consistent with the existing patchwork nest. Do not block spatial work on prop references; ask for fidelity review only if adopting a real object.

## Out of scope

Pixel-perfect landscaping, rotating every plant, large inventories, shops, and cosmetic catalogs.

## Progress — 2026-09-26

Already on `develop` (from a code review, not yet verified against the acceptance criteria):

- `garden-layout.js`: five anchors (three beds, two nooks), three starter kinds (flower patch, cushion, sunny stone), validation, swap-aware placement plans, preview, undo by reversal, and put-away to the collection. Legacy plants are projected into a deterministic border that avoids anchors, approach points, and the path.
- `index.html`: an Arrange mode with a picker, highlighted anchor targets, Place / Cancel / Put away / Undo, and object inspection.

Outstanding before this ticket can be marked complete:

1. Unit tests for `garden-layout.js` (valid/invalid layouts, place/swap/remove/undo plans, stale plans rejected, `initialize` on legacy and fresh saves), and a browser pass over the acceptance criteria at 320 px using taps alone.
2. Place the cushion and sunny stone on their nooks by default. They currently start put away, so a new garden shows no furnishings.
3. Until ticket 04 lands, beds are bare soil and read as stepping stones. Give an empty bed a planted look (tilled rows, a few seedlings) so it looks like somewhere to grow.
4. The beds are also projected above the arena in the run view, where they crowd the top border. Make them smaller, fainter, or omit them during play (requirement 2).
5. `preview()` applies each change twice (inside `copy` and again in `rows`); simplify when adding tests.
6. Replace numbered labels (“Flower patch 2”) with place names, consistent with ticket 02's review notes.
7. Write the implementation record and evidence as for 01 and 02.
