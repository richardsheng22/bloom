# Bloom 1.0 — iOS delivery map

Status: planning only. Created 2026-09-28 on `develop`; reconciled with `d86c314` (final v0.9 feature-branch changes) before committing. No native project, account setup, build, upload or release is performed by this map.

## Goal

Deliver Bloom as a reliable, offline-capable iPhone application that preserves the current game, owned garden and Erwu's storybook identity. The proposed finish line is a tested TestFlight candidate followed by an approved, available App Store 1.0 release. Ticket 01 confirms public distribution; if this remains a private family app, revise the distribution tickets explicitly.

This is a platform/release milestone. The album from [legacy ticket 09](../09-discoveries-and-memory-album.md) remains deferred. The physical acceptance deferred in [legacy ticket 10](../10-integration-and-phone-acceptance.md) now lives in iOS ticket 13, with prerequisites covering lifecycle, audio/haptics, accessibility and performance.

## Verified starting point

- Plain HTML/JS canvas game in `index.html`, with independent garden state, cultivation, layout, view and Erwu behavior modules.
- Web manifest and Home Screen icons; no native project, package/lockfile or native build pipeline at this baseline.
- Runtime painted art in `assets/*.webp` and metadata in `art-manifest.js`. Source sheets and scratch evidence should not enter the app payload.
- External Google Fonts requests; first-launch offline parity is not yet established.
- Browser-local saves: `bloom.run3`, garden v3 under `bloom.garden2`, its backup and legacy `bloom.garden1`, plus scores/preferences/introduction flags.
- Web Audio, vibration/switch-input fallback and document visibility/pagehide handlers; native services and interruption testing remain.
- Baseline: the final v0.9 closeout records 54 unit tests and four Chromium browser suites passing. This is web evidence, not native certification.
- Arrange/furniture editing was retired. Preserve fixed beds and legacy saved positions; do not resurrect retired UI.
- Final v0.9 now includes rest as dormancy, revised home/card positioning, continued plant maturation at the 170-plant cap and gentler late-game difficulty growth. Preserve these when packaging the app. Saves containing the newly added wildflower kinds are not readable by older builds: include them in upgrade/import fixtures and do not promise safe save downgrades. Reinspect develop before implementation to preserve subsequent owner work.

## Recommended architecture

**Retain the JS/canvas game and add a small Capacitor iOS shell, subject to ticket 01's device proof.** Capacitor uses WKWebView; its current documentation lists Xcode 26+ and iOS 15+ support. Recheck these when pinning tools. Runtime compatibility does not establish acceptable performance on every eligible phone. [Capacitor iOS documentation](https://capacitorjs.com/docs/ios)

Bundle code, art and fonts locally. Keep web and native builds from the same game source through a narrow platform adapter. Avoid a Swift/SpriteKit rewrite unless the proof demonstrates a limitation that targeted changes cannot solve.

Protect progress early. Native saves must not rely solely on webview localStorage. Capacitor describes Preferences as lightweight persistence and cautions about localStorage eviction; ticket 05 chooses the backend from measured size, write frequency and atomicity needs. [Preferences documentation](https://capacitorjs.com/docs/apis/preferences)

Treat Safari/Home Screen saves and installed-app storage as separate. Provide deliberate export/import, preview replacement and retain the original save.

A complete offline game and native polish support a submission but do not guarantee approval. Review the actual finished binary for completeness and minimum functionality; do not add unrelated features to pad a wrapper. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Defaults to confirm in ticket 01

| Decision | Proposal | Needed before |
|---|---|---|
| Distribution | TestFlight then public App Store | Production distribution setup |
| Platforms | iPhone first; no dedicated iPad, Mac or Android work | Native project configuration |
| Orientation | Portrait gameplay with safe handling of system transitions | Shell/UI work |
| Content | Existing game, fixed beds and current art | All implementation |
| Language | English | Store materials |
| Business model | No ads, IAP, accounts or analytics added; price is an owner decision | Store configuration |
| Data | Local durable progress and manual export/import; no cloud sync | Storage architecture |
| Toolchain/devices | Supported runtime/Xcode pair and measured device floor | Device proof |
| Build host | Available compatible Mac, local or hosted by explicit choice | Native builds |

Surface Mac access, target iPhone, Apple team, bundle namespace and distribution intent early. Missing access need not stop independent packaging or fixture work, but never replace physical evidence with a simulator pass. Record unresolved choices rather than demanding every preference before useful work.

## Tickets

Each ticket is one reviewable outcome, usually one PR or a couple of coherent commits. Chunk sizes are not calendar promises; device access and Apple review are external dependencies. Every ticket includes scope, acceptance evidence, dependencies and required owner inputs.

| Ticket | Dependencies | Status |
|---|---|---|
| [01 — Lock the 1.0 target and prove the runtime](01-target-and-device-proof.md) | None | Planned |
| [02 — Build a reproducible offline game package](02-offline-web-package.md) | 01 architecture decision | Planned |
| [03 — Create the production iOS shell and install it](03-production-ios-shell.md) | 01, 02 | Planned |
| [04 — Introduce a small web/native platform boundary](04-platform-boundary.md) | 02, 03 | Planned |
| [05 — Persist a coherent garden and run safely on iOS](05-durable-native-saves.md) | 04 | Planned |
| [06 — Move an existing web garden into the app](06-save-transfer-and-backup.md) | 05 | Planned |
| [07 — Make interruptions and resume deterministic](07-interruptions-and-resume.md) | 05 | Planned |
| [08 — Make audio and touch feedback behave like an iOS game](08-native-audio-and-haptics.md) | 04, 07 | Planned |
| [09 — Finish iPhone interaction and accessible controls](09-iphone-ui-and-accessibility.md) | 03, 04, 06, 08 | Planned |
| [10 — Tune the existing art and renderer for device budgets](10-rendering-and-device-performance.md) | 03, 07, 09 | Planned |
| [11 — Automate repeatable builds and release artifacts](11-repeatable-builds-and-signing.md) | 03, 05 | Planned |
| [12 — Prepare privacy, rights and store materials](12-privacy-and-store-package.md) | 01, 03; finalize after 06, 08, 09, 11 | Planned |
| [13 — Complete the deferred phone acceptance on the native app](13-physical-device-acceptance.md) | 06, 07, 08, 09, 10, 11 | Planned |
| [14 — Distribute and stabilize a TestFlight beta](14-testflight-beta.md) | 11, 12, 13 | Planned |
| [15 — Submit and release Bloom 1.0](15-submit-and-release-1-0.md) | 12, 14 | Planned |

## Milestones and order

1. **Feasibility and install: 01 → 02 → 03.** Exit: device proof accepted and production shell launches bundled assets.
2. **Safe native foundation: 04 → 05 → 06/07.** Exit: coherent saves, web transfer and deterministic interruptions.
3. **iPhone experience: 08 → 09 → 10.** Exit: native feedback, usable/accessibility-reviewed controls and measured performance.
4. **Release preparation:** 11 can proceed after 03/05 alongside experience work. Draft 12 after 01/03; finalize against the finished binary.
5. **Acceptance and beta: 13 → 14.** Exit: physical matrix and owner review passed, then distributed beta installation/upgrade verified.
6. **1.0: 15.** Exit: approval, store availability and installed-release smoke test recorded separately.

Native device installation begins in ticket 01; do not wait for every feature to prove the runtime. Formal beta distribution follows durable saves and device acceptance.

## Definition of 1.0 done

- Installed game launches offline with bundled fonts/art and plays without a website connection.
- Progress survives supported upgrades and interruptions. Failed reads/writes and malformed data cannot silently erase an owned garden.
- Web players can deliberately transfer progress. Uninstall recovery is not promised without an export/backup.
- Supported-device input, safe areas, lifecycle, audio/haptics, accessibility and performance gates have evidence.
- No unresolved crash, save-loss or core-interaction blocker. Artistic preferences and minor polish are recorded honestly.
- Signed binary, source revision and asset payload are traceable.
- Store disclosures/media match the binary; distribution settings and release timing have owner approval.
- For public distribution, App Review approval, availability and store-install verification are complete. Upload alone is not completion.

## Carry-forward and exclusions

Legacy 01–08 and 11 are the implemented gameplay baseline. Legacy 03's Arrange criteria remain superseded, and legacy 09 remains deferred beyond this map. Legacy 10's phone checks are reactivated in iOS 13 with the native app as the main target; Safari/Home Screen still matter for transfer and web regression.

No cloud sync, push reminders, multiplayer, accounts, monetization system, engine rewrite or art overhaul unless separately planned. No publishing, enrollment purchases, tester messages or signing-secret collection is authorized by writing this plan. Later external actions follow the user's instructions at execution time.

## Evidence and status updates

During implementation, keep evidence under `evidence/<ticket-id>/`: commands/results, device/OS/build, captures, migration fixtures, outstanding risks and source commits. Exclude personal saves, credentials and reference photos. Update ticket and map statuses together.

Code, screenshots, browser emulation, simulator runs and physical tests establish different things. Missing physical or signing access must stay visible as a blocker. Split newly discovered large work into a named follow-up with dependencies rather than hiding it in a completed ticket.

Do not assign a release date until build/device access is established and performance is measured. Plan beta feedback and specific review fixes without indefinite feature expansion.

## Primary sources and freshness

Checked 2026-09-28. Recheck plugin, SDK and submission requirements during implementation and before release; this map does not freeze Apple's future deadlines.

- [Capacitor iOS](https://capacitorjs.com/docs/ios): runtime and build environment.
- [Preferences](https://capacitorjs.com/docs/apis/preferences): persistence boundaries.
- [App API](https://capacitorjs.com/docs/apis/app): native lifecycle.
- [Apple TestFlight](https://developer.apple.com/testflight/): beta distribution.
- [Apple submission guidance](https://developer.apple.com/app-store/submitting/): current submission requirements.
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/): completeness and review criteria.
- [Apple privacy guidance](https://developer.apple.com/app-store/user-privacy-and-data-use/): disclosures and dependency inventory.
