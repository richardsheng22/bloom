# iOS 04 — Introduce a small web/native platform boundary

Status: planned. Release: 1.0. Dependencies: 02, 03.

Suggested chunk: One focused integration PR. These are review boundaries, not calendar estimates.

## Outcome

Let the same game use web fallbacks or native services without scattering platform checks through the renderer.

## Work

1. Extract a small platform module for initialization, persistence calls, app-active events, haptic feedback, audio lifecycle notifications and file sharing/import. Implement only interfaces used by the following tickets; avoid a generalized framework.
2. Keep garden-state, garden-beds, garden-layout, garden-view and erwu-behavior independent of native plugin imports. Do not rewrite physics or split the whole canvas file merely to modernize its structure.
3. Make startup await platform readiness before loading saves or creating a garden. Introduce an explicit loading/failure state; never seed a fresh garden while native reads are still pending.
4. Define event ownership and cleanup: one lifecycle subscription, no duplicated resume events and a consistent timestamp source for elapsed rest. Calls unsupported on web should have intentional fallbacks.
5. Route the current localStorage store and gardenStorage boundaries through a compatibility adapter without changing persisted data yet. Document the sync-to-async transition and which code is allowed to acknowledge a save.

## Acceptance and evidence

- Web tests still pass with no native runtime installed.
- A delayed or failed platform initialization cannot overwrite an existing save or start two game loops.
- Contract tests cover unavailable services, duplicate events and subscription cleanup.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

None.

## Out of scope

Selecting a backend service, login, cloud sync or a broad engine rewrite.

## Primary references

- [Reference 1](https://capacitorjs.com/docs/apis/app)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.

