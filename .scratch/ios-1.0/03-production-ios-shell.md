# iOS 03 — Create the production iOS shell and install it

Status: planned. Release: 1.0. Dependencies: 01, 02.

Suggested chunk: One native shell PR. These are review boundaries, not calendar estimates.

## Outcome

Install Bloom as an application with bundled content, a stable identity and a coherent launch experience.

## Work

1. Create and check in the selected runtime configuration and native iOS project. Pin compatible plugin versions and native dependency resolution. Use an owner-confirmed bundle identifier and display name before distribution.
2. Load the packaged assets locally. Configure iPhone device family, deployment target and orientation policy from ticket 01; verify actual supported orientations instead of relying on the web manifest.
3. Add app icon assets and a restrained launch screen matching the garden. Hide launch UI only when the playable surface is ready; supply a recoverable startup failure state rather than a permanent blank screen.
4. Configure status bar, home-indicator/safe-area behavior and native navigation boundaries. External support/privacy links should open intentionally outside the game; arbitrary external pages must not replace the privileged game webview.
5. Provide clean-clone build, sync, simulator and device-install instructions. Keep development live reload separate from Release and ensure Release cannot require it.

## Acceptance and evidence

- Clean Debug and Release builds install and launch from bundled assets in airplane mode.
- No browser chrome, missing art, hidden primary action or debug overlay on the chosen phone.
- Repeated cold launches and a failed asset/startup simulation lead to a usable app or a clear recovery message.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Bundle identifier namespace, final display-name choice and Apple team selection. Provide a proposed icon for approval before any store submission.

## Out of scope

App Store upload and final launch artwork/metadata approval; production persistence is ticket 05.

## Primary references

- [Reference 1](https://capacitorjs.com/docs/ios)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.
