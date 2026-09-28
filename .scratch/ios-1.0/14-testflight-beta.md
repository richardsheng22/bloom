# iOS 14 — Distribute and stabilize a TestFlight beta

Status: planned. Release: 1.0. Dependencies: 11, 12, 13.

Suggested chunk: One beta delivery and feedback cycle; timeboxed by build evidence rather than feature additions. These are review boundaries, not calendar estimates.

## Outcome

Validate installation, updates and everyday use outside the development setup.

## Work

1. Prepare a signed candidate with the archive/metadata from earlier tickets. Upload to App Store Connect and establish the appropriate TestFlight testing group when authorized. Internal versus external testing determines available review/distribution steps; verify current requirements.
2. Start with the owner and a small invited group chosen by the owner. Friends outside the developer team are external testers: their build needs Beta App Review first. Provide install/upgrade steps, known limitations and a focused feedback prompt. Do not contact testers without explicit authorization.
3. Test upgrade from a previous beta with real fixture gardens, and preserve saves. Ask testers to use cold launch, offline play and return after an absence in ordinary use.
4. Collect reproducible defects and available crash reports with build numbers; avoid adding telemetry merely for convenience. Retain symbols and record privacy implications of any diagnostic collection.
5. Keep a beta log: build, changes, known issues, crash findings, save incidents and acceptance results. Ship bounded fixes and retest affected scenarios; do not introduce the deferred album or other scope expansion.

## Acceptance and evidence

- Named testers can install the distributed candidate and update without progress loss.
- At least one prior-build-to-candidate upgrade is verified on a physical device; no open release-blocking defects or unexplained save incidents.
- Final candidate, feedback disposition and remaining nonblocking limitations are recorded for release review.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Tester selection, beta access authorization, availability for ordinary use and feedback; external testing may require Apple review.

## Out of scope

Public App Store release, messaging people without authorization, indefinite feature development.

## Primary references

- [Reference 1](https://developer.apple.com/testflight/)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.
