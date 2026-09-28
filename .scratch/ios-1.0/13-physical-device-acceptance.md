# iOS 13 — Complete the deferred phone acceptance on the native app

Status: planned. Release: 1.0. Dependencies: 06, 07, 08, 09, 10, 11.

Suggested chunk: One acceptance cycle and bounded fixes; split newly discovered large issues into tickets. These are review boundaries, not calendar estimates.

## Outcome

Close the physical-device gap deliberately deferred during v0.9.

## Work

1. Carry forward legacy ticket 10's save, interaction, accessibility, performance and owner-feel requirements. Retire Arrange cases; test fixed beds, planting/inspection, Erwu hello and immediate Play. Safari/Home Screen remain relevant to web regression and transfer, not as substitutes for native tests.
2. Use a written matrix with device/model/iOS/build: smallest/oldest supported device, representative newer device, minimum/current supported OS where hardware permits. Mark unavailable combinations untested and resolve support claims explicitly.
3. Cover fresh install, native upgrade, web import, sparse/mature/resting gardens, 170 plants, rare rewards, clock rollback, low storage, airplane mode, lifecycle interruptions and repeated launch. Check actual safe areas and system edge gestures.
4. Run the audio/haptics and accessibility scenarios from 08–09. Replay a busy shot and long-session performance scenario from 10. Retain native captures and defect records.
5. Give the owner a short play checklist: aiming feel, readability, pleasant rest/return, Erwu identity/pacing and first-bloom-to-rest sequence. Do not ask the owner to execute developer commands.
6. Triage defects by data loss/crash, blocked interaction, material visual/audio issues and optional polish. Fix/retest blockers and the affected regressions before closing.

## Acceptance and evidence

- All supported-device release gates are passed or explicit support changes are recorded; no unresolved save-loss/crash/core-interaction defects.
- Owner feedback is recorded against a specific native build with unresolved subjective items clearly identified.
- Evidence links distinguish actual devices, simulators and browser emulation.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

A short hands-on session on agreed iPhone(s), including sound/haptics and the garden sequences. This is the planned point for the previously deferred testing.

## Out of scope

Album implementation, broad new mechanics, claiming untested hardware coverage.
