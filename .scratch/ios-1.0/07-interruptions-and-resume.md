# iOS 07 — Make interruptions and resume deterministic

Status: planned. Release: 1.0. Dependencies: 05.

Suggested chunk: One lifecycle PR. These are review boundaries, not calendar estimates.

## Outcome

An interruption never steals progress, duplicates a reward or launches an unintended shot.

## Work

1. Integrate native app-state events with document visibility/pagehide through the platform boundary. Cancel active aim on suspension, stop/suspend animation and audio, and prevent elapsed-frame catch-up.
2. Define interruption semantics for aiming, flying, resolving, advancing, Full bloom, seed flights, game over and queued garden return. Prefer a coherent last-settled-turn checkpoint on process death; link run and garden rollback so replay cannot duplicate rewards.
3. Persist checkpoints during normal progress, not only in a last-moment suspend handler. Treat forced termination as an event for which a final callback may not arrive.
4. On foregrounding, reload/reconcile native state when appropriate, recompute bounded rest using wall time, reset animation clocks, and resume without firing held input. Keep Play available during Erwu's return.
5. Exercise Control Center, lock/unlock, app switching, phone/audio interruptions and OS process termination. Define web fallback behavior consistently.

## Acceptance and evidence

- Each phase in the interruption matrix has an expected resume point and a passing fixture or device test.
- No duplicate plants/seeds, score inflation, phantom shots, backlog animation or extra audio contexts after repeated suspend/resume.
- Killed mid-shot and updated-from-prior-build cases recover the documented checkpoint.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Device access through the agreed testing arrangement; no subjective decisions required.

## Out of scope

Background simulation, background audio, replaying unfinished physics exactly unless separately justified.

## Primary references

- [Reference 1](https://capacitorjs.com/docs/apis/app)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.

