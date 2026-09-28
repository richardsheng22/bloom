# iOS 02 — Build a reproducible offline game package

Status: **implemented, pending the first cloud build** (2026-09-28). Signing, device install and the shell's on-device checks wait for the Apple Developer account (ticket 01). Release: 1.0. Dependencies: 01 architecture decision.

Suggested chunk: One packaging PR. These are review boundaries, not calendar estimates.

## Outcome

Produce a minimal, versioned web payload that an installed app can run from its first launch without a server.

## Work

1. Add a package manifest, pinned toolchain/dependencies and lockfile only as needed for the selected runtime. Add a deterministic web staging command; retain a straightforward browser development path.
2. Bundle the runtime HTML, JS modules, manifest/art metadata, decoded runtime sheets and icons. Use an explicit inclusion list: exclude .scratch evidence, source art sheets, personal reference material, tests and developer-only hooks from the app payload.
3. Replace the external Google Fonts dependency with licensed, bundled font files or an explicitly chosen local fallback. Preserve font licenses and verify layout after fonts load. Inventory every other runtime network dependency.
4. Generate a payload inventory with hashes and sizes. Check missing assets, case-sensitive paths and relative URLs. Avoid hard-coded developer server URLs and remote code updates in release configuration.
5. Measure compressed package and decoded-image sizes as baseline evidence. Do not regenerate or re-style existing art as part of packaging.

## Includes the iOS shell (former ticket 03)

The native shell work in [03](03-production-ios-shell.md) is done in this ticket: packaging and a shell that installs it are one reviewable outcome. Its work items and acceptance apply here.

## Acceptance and evidence

- A clean checkout produces the same payload content and passes existing web tests.
- A fresh browser context with external requests blocked loads fonts/art and supports a complete run plus garden planting.
- Generated payload includes no scratch files, source photos, debug hooks or development URLs.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

None unless a font license cannot be established; present the concrete fallback if needed.

## Out of scope

Native signing, a PWA service worker, new game features, CDN infrastructure.

## Implementation record (2026-09-28)

**Offline package**
- `tools/stage-web.cjs` (`npm run stage`) copies an explicit list of 20 files into `www/`: the page, six game modules, the four packed art files, bundled fonts with licences, and icons. It fails if a listed file is missing, if the art manifest names an unlisted file, or if a staged page, style or script loads anything from another origin. It writes `build/payload-inventory.json` with sizes, SHA-256 hashes and one payload hash. Two runs from the same checkout give the same payload hash (`cb62b4ea…` at this commit, before the icon change). Payload: about 3 MB.
- Fonts: Google Fonts is replaced by bundled Latin variable fonts: Fraunces (all axes, 121 KB) and Bricolage Grotesque (opsz, 77 KB), SIL Open Font License, from @fontsource-variable 5.3.0 (`fonts/`). The web game uses them too, so it no longer needs a network either. Earlier test screenshots used fallback fonts, because the tests blocked Google Fonts.
- Other network dependencies: none. Developer-only hooks are inert in the app: `?erwu` debugging needs a URL parameter the app cannot receive, and the `window.claude?.hot` hook does nothing when absent.
- `tests/offline-package-browser.cjs` (`npm run test:offline`) checks the package holds exactly the listed files, serves only `www/` with every other origin blocked, and checks the bundled fonts and painted art load, a bed can be planted and a run played, with no page errors. The four existing browser suites now serve `fonts/` and pass with the real fonts.

**iOS shell (former ticket 03)**
- Capacitor 8.5.2, pinned exactly (`package.json`, `package-lock.json`); Swift Package Manager, no CocoaPods. `capacitor.config.json`: app id `com.richardsheng.erwusgarden` (**proposed; the owner confirms it before the App Store record is created, since it can never change after**), name "Erwu's Garden", `webDir: www`, cream background, no web-view scrolling or link previews.
- `ios/`: iPhone only (`TARGETED_DEVICE_FAMILY = 1`), iOS 16.2+ (the game uses canvas `roundRect` and CSS `color-mix()`), portrait only, full screen, dark status-bar text on the cream background, `arm64`, and `ITSAppUsesNonExemptEncryption = false` (no encryption; saves the export question on every upload).
- `tools/build-icon.cjs` renders the icon from the painted art (Erwu peeking from her basket in the daisy, on the lawn) as a 1024² opaque RGB PNG, plus the web icons and a cream launch image. The launch screen background is cream, so dark mode never flashes black.
- `.github/workflows/ios.yml`: on every push, runs the unit tests and the offline package test on Linux, then on a `macos-26` runner selects the newest Xcode 26, stages and syncs, compiles the app for the iOS Simulator unsigned, and checks the built bundle's name, minimum iOS, bundled files and that no scratch or test files are inside. Free for this public repo; no Apple account needed.

**Not done here**
- A signed build and install on a phone: needs the Apple Developer account (tickets 01, 11).
- A startup failure screen: the game already falls back to its drawn art if images fail; a failure of the page itself is left to on-device testing.
- Safe areas and the status bar are checked only in the browser so far; ticket 09 checks them on the phone.
