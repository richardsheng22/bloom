# iOS 06 — Move an existing web garden into the app

Status: planned. Release: 1.0. Dependencies: 05.

Suggested chunk: One import/export feature PR. These are review boundaries, not calendar estimates.

## Outcome

Give existing players an explicit, safe way to keep their garden when moving from Safari or Home Screen to iOS.

## Work

1. Add a versioned Bloom export file to the existing web UI and a native Files/share import path. Safari/PWA and the installed application's stores must be treated as separate; do not promise automatic discovery.
2. Export the coherent garden, stable run, scores and preferences defined in ticket 05, with version metadata and integrity checks. Exclude ephemeral animation/debug state. Describe checksums as corruption detection, not proof that a file is trusted.
3. Validate file type, byte limit, schema, numeric bounds, IDs and format version before import. Present a human-readable preview (beds/plants, saved run, date) and require explicit replacement confirmation if progress exists.
4. Back up the destination before committing the imported revision. Do not attempt ambiguous garden merging. Canceled, corrupt, oversized, repeated or future-version imports must not alter the current game.
5. Offer native export as a manual backup too. Provide concise migration instructions for Safari and Home Screen, including a fallback when share/download behavior differs. Verify with synthetic data before any owner save.

## Acceptance and evidence

- A representative web save imports on a physical device with matching ownership, seeds, run and settings.
- Cancel and all invalid-file cases leave destination data unchanged; replacement is recoverable from the pre-import backup.
- Import works offline and explains that export is manual backup, not cloud synchronization.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Optional final test with an exported existing garden after synthetic tests pass; do not request a save file containing unrelated personal data.

## Out of scope

Cloud accounts, automatic merge, supporting arbitrary third-party save formats.

