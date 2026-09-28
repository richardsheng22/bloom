# iOS 11 — Automate repeatable builds and release artifacts

Status: planned. Release: 1.0. Dependencies: 03, 05.

Suggested chunk: One build/release tooling PR; can proceed alongside 06–10. These are review boundaries, not calendar estimates.

## Outcome

Produce traceable, installable builds without developer-machine state becoming a hidden dependency.

## Work

1. Add documented clean-checkout commands for web validation, asset staging, native sync, build/test and archive/export. Separate unsigned checks from signing/upload jobs.
2. Run JS/unit/browser checks on ordinary CI and native build checks on an available macOS runner. Pin supported versions and record the dependency-update policy. Do not add paid infrastructure without an owner decision.
3. Configure Debug/Release identity, version 1.0 and monotonic build numbers. Keep bundle identity stable across beta and release so upgrade tests are meaningful.
4. Store signing credentials and App Store Connect credentials in appropriate local/CI secret stores, never files in Git. Document who owns certificate/provisioning maintenance and recovery.
5. Record commit, build number, payload hash, SDK/toolchain and symbol artifacts for every distributed build. Ensure Release disables development servers, debug hooks and inspector features not intended for release.

## Acceptance and evidence

- A second clean environment reproduces a build with the same source/payload identity.
- Unsigned validation works without distribution secrets; a signed archive validates under the selected team.
- A documented prior build can be rebuilt and a higher-numbered fix produced; symbols and release records are retained.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Choose available Mac/CI host, Apple team roles and credential setup through secure tooling. No secrets in tickets or chat.

## Out of scope

Automatically submitting or releasing every develop commit, purchases of hosted CI.
