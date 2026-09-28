# iOS 10 — Tune the existing art and renderer for device budgets

Status: planned. Release: 1.0. Dependencies: 03, 07, 09.

Suggested chunk: One profiling/fix PR; each optimization tied to a measured bottleneck. These are review boundaries, not calendar estimates.

## Outcome

Meet explicit device budgets without sacrificing the coherent storybook art or reliable input.

## Work

1. Profile Release builds on the oldest supported and a representative newer device: cold start, mature 170-plant garden, Erwu walk, busy shot, Full bloom and return from rest. Record tool, device, OS, thermal conditions, frame times, memory and startup latency.
2. Set measurable gates from ticket 01's baseline before optimizing. Initial engineering targets: interactive cold start within three seconds on the baseline phone, sustained 60 Hz rendering where supported, p95 frame work below the 16.7 ms budget, and no continuing memory growth after repeated transitions. Treat these as provisional targets to validate, not measured claims.
3. Inspect decoded atlas footprint, device-pixel-ratio costs, canvas caches, requestAnimationFrame work and unnecessary repaints. Prefer bounded caches, careful resolution limits and atlas adjustments over unrelated code cleanup.
4. Check touch latency, thermal behavior and energy use over a representative 15-minute session; verify no continuous animation/audio work remains active while backgrounded.
5. Review production-scale Erwu transitions, blinks, sun-following and berry stages after optimizations. Fix visible clipping, jumps or blending artifacts while retaining the current approved direction.

## Acceptance and evidence

- A before/after report shows each changed bottleneck and the agreed budget results on physical devices.
- No unbounded memory/cache growth or degraded save/interaction behavior under sustained play.
- No new art direction or rewritten engine without evidence that targeted fixes are insufficient.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Access to agreed baseline phone(s); confirm only if measurements require raising the supported-device floor or accepting a visible quality tradeoff.

## Out of scope

Speculative optimization, new asset generation, a renderer rewrite without the ticket 01 decision being revisited.

