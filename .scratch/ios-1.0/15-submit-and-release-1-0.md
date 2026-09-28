# iOS 15 — Submit and release Bloom 1.0

Status: planned. Release: 1.0. Dependencies: 12, 14.

Suggested chunk: One release operation plus a bounded launch verification. These are review boundaries, not calendar estimates.

## Outcome

Turn the accepted native candidate into an identifiable 1.0 release with a support and update path.

## Work

1. Freeze the candidate and reconcile every iOS ticket against evidence. Re-run appropriate web/native regressions after final changes. Verify supported devices, save upgrade, offline launch, privacy declarations, store media and current Apple SDK/submission rules.
2. Prepare the exact build and complete review notes. Let the owner review candidate/version, metadata, pricing/territories and release timing before the external submission/release action unless already explicitly authorized at execution time.
3. Submit the intended binary, track App Review outcome and handle specific feedback. If review requires substantive design or scope changes, record a new bounded ticket; never describe upload or submission as approval.
4. After approval, release according to the selected manual/phased policy. Verify the actual store build installs, launches offline and preserves beta/prior-version data in the supported upgrade paths.
5. Tag the released source and retain archive, symbols, payload hashes, store build identity and release notes. Publish an internal recovery/hotfix runbook: stop a phased rollout where available and issue a higher-version corrective build; do not promise an instant binary downgrade.
6. Record support ownership and a short post-release check for crash/save problems. Do not create a recurring automation as part of planning.

## Acceptance and evidence

- Store approval and availability are confirmed separately; source tag, uploaded binary and released version are traceable.
- A physical-device store-install smoke test passes and the support/privacy URLs work.
- Ticket 09 remains deferred unless separately commissioned; native completion is not dependent on an album.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Final release approval and timing, approved store materials, support owner and availability for the store-install check.

## Out of scope

Guaranteed Apple approval, Android launch, monetization additions, new roadmap features.

## Primary references

- [Reference 1](https://developer.apple.com/app-store/submitting/)
- [Reference 2](https://developer.apple.com/app-store/review/guidelines/)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.

