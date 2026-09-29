# 09 — Art: seasonal clumps and three new flowers

Status: done (2026-09-29).

## What's needed

One sheet of 16 clumps in exactly the same format as `assets/garden-clumps.png`: the same scale, view, grass tuft at the base and grey background, so they sit beside the existing clumps. It covers the three flower kinds buds now grow (ticket 04) and the seasons the current summer clumps can't show (ticket 03).

File: `assets/garden-clumps-seasons.png`.

## Prompts and reference material

The complete, copy-ready prompts, the files to attach and why, and the output names are in [ART-PROMPTS.md](ART-PROMPTS.md) (image 3).

## Acceptance

- Placed next to the existing clumps in the game, they look like the same set at the same size.
- Tulips, peonies and poppies are recognisable at phone size and match the buds' colours in the run.

## Implementation record — 2026-09-29

- `garden-clumps-seasons.png` is cut by the build's new `grid` option (each shape goes to the cell its centre is in, so leaning grasses stay whole) into `clump-tulip` … `clump-frost-grass`, at the same 0.6 scale as the other clumps.
- Tulips, peonies and poppies now draw as themselves. Out-of-season plants show autumn seedheads, turning leaves and sedum, or spring bulbs among the leaves; grass and ferns are frosted in winter.
- The lawn-edge border uses each season's own set (`EDGE_SEASONS`): bulbs in spring, the summer flowers, asters and seedheads in autumn, hellebore, holly, twigs and frosted grass in winter.
