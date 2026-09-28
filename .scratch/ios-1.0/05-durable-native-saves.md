# iOS 05 — Persist a coherent garden and run safely on iOS

Status: planned. Release: 1.0. Dependencies: 04.

Suggested chunk: One storage PR; split adapter and migration commits within it. These are review boundaries, not calendar estimates.

## Outcome

Protect owned plants, rare seeds, preferences and the current run across native app updates and interruptions.

## Work

1. Inventory all bloom.* keys and garden backups, including run3, scores, preferences and introduction flags. Define a versioned save envelope linking the garden and stable run checkpoint with one revision. Specify what is durable after each completed turn.
2. Choose storage from measured data size/write frequency: lightweight Preferences may suit settings; use an app-private file or database if save atomicity/workload needs it. Record the rationale. Do not treat webview localStorage as the only native durable store.
3. Serialize writes and retain a last-known-good snapshot. Validate schema and bounds before applying data; commit a new revision atomically using the chosen backend's actual guarantees. Handle low disk, failed reads/writes, corrupt newest data and newer unsupported formats without silently resetting. Include final-v0.9 mature gardens with newly introduced wildflower kinds; older builds cannot read those saves, so downgrade compatibility must not be assumed from an unchanged version number.
4. Preserve the existing v1/v2/v3 garden migration and rare-reward deduplication behavior. The app starts fresh; there is no Safari/PWA transfer (ticket 06 dropped).
5. Expose a calm save-failure/recovery state and retry path. Do not report saved while a native write is pending. Explicitly document that uninstall can remove local saves; backup/export and cloud sync are separate capabilities.

## Acceptance and evidence

- Fresh, legacy, 170-plant, rare-seed and partially completed run fixtures survive migrations and native app upgrades.
- Fault-injected interrupted writes recover one coherent revision, with no duplicated reward or mixed garden/run state.
- A failed load never becomes an automatic empty garden; unsupported future saves remain recoverable.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

None for implementation. Clarify only if cross-device automatic sync becomes a requirement; it is excluded by default.

## Out of scope

iCloud/account sync, automatic recovery after uninstall, exporting Safari data.

## Primary references

- [Reference 1](https://capacitorjs.com/docs/apis/preferences)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.
