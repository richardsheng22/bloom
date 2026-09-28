# iOS 01 — Lock the 1.0 target and prove the runtime

Status: planned. Release: 1.0. Dependencies: None.

Suggested chunk: Small investigation; one disposable device proof and one recorded decision. These are review boundaries, not calendar estimates.

## Outcome

Choose the distribution target and demonstrate that the existing game can run acceptably inside the proposed iOS runtime before building around it.

## Work

1. Confirmed 2026-09-28: TestFlight followed by a public App Store release, and no web-to-app save transfer (everyone starts fresh). Proposed, to record: iPhone-first, portrait during play, English, offline single-player, free, Data Not Collected. Do not assume iPad, Mac, Android or monetization are included.
1a. Check App Store name availability early ("Bloom" is likely taken) and choose a fallback. Choose an individual or organisation developer account (an individual account shows the owner's legal name as seller). Decide the web version's future after launch.
2. Inventory access to a compatible Mac/Xcode environment, an iPhone and Apple Developer team. Record exact hardware, OS, runtime and plugin versions. Current Capacitor v8 documentation lists iOS 15+ and Xcode 26+; these are reference constraints, not a promise that every supported device will meet Bloom's performance target. Recheck current Apple submission requirements when choosing the toolchain.
3. Make a disposable Capacitor/WKWebView proof using local game assets. Demonstrate launch, aiming, a busy shot, garden rendering, an Erwu walk and suspend/resume on one physical iPhone. Capture frame/memory observations. This proof may use existing storage; it does not establish production save safety.
4. Compare the result with the current web build. Prefer retaining the JS/canvas renderer and adding a thin native boundary. If the device proof exposes a blocking renderer/input limitation, document evidence and propose a bounded alternative before any Swift/SpriteKit rewrite.
5. Record launch scope, supported-device proposal, minimum iOS version, build-machine arrangement, architecture choice and an initial performance budget in a decision note. Keep credentials and personal photos out of the repo.

## Owner answers so far (2026-09-28)

- **Build host:** no working Mac. Proposed: build in the cloud (a GitHub Actions macOS runner, or a MacinCloud pay-as-you-go day at $4 with a 24-hour minimum for hands-on Xcode sessions) and install on the phone through TestFlight's internal testing, which needs no USB connection or Beta App Review. Device profiling with Instruments needs a Mac connected to the phone; without one, use an in-app debug frame-time overlay in test builds.
- **Test phones:** an iPhone 11 or 12 is the main test device. The iPhone 7 stops at iOS 15, and the game uses canvas `roundRect` (Safari 16) and CSS `color-mix()` (Safari 16.2), so it cannot run the current game without changes. Proposed minimum: iOS 16.2 (iPhone 8 and later).
- **iPad:** the owner has an iPad. The 1.0 app is iPhone-only, so on the iPad it runs in the iPhone-sized compatibility window; use it to check that mode (App Review may test there) and, later, as the test device for any native iPad version.
- **Repository:** stays public (free, unlimited GitHub macOS build minutes). Erwu appearing publicly is fine with the owner and family.
- **Store name:** **Erwu's Garden** ("Bloom" is crowded on the App Store). Proposed subtitle: "Grow a garden with a lazy cat" (29/30 characters). A future Nest release would follow the same pattern as "Erwu's Nest". The name is confirmed only when the App Store Connect app record is created, so create it as soon as the developer account is approved.
- **Apple Developer Program:** not yet enrolled; the owner is enrolling as an **individual** (the store shows the owner's legal name as seller).

## Acceptance and evidence

- Decision note distinguishes approved choices from assumptions.
- Device proof has reproducible commands, source revision, device details and a short capture; simulator-only results cannot close this ticket.
- Failure of the proof produces a concrete alternative and revised dependency plan, not a silently expanding rewrite.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Mac/build-host access; one target iPhone and its iOS version; Apple Developer membership/team availability; confirm public App Store versus private use and the iPhone-only/no-monetization default. No passwords, certificates or recovery codes in chat.

## Out of scope

Production shell, native persistence, purchasing accounts, publishing, and redesigning the game.

## Primary references

- [Reference 1](https://capacitorjs.com/docs/ios)
- [Reference 2](https://capacitorjs.com/docs)
- [Reference 3](https://developer.apple.com/app-store/submitting/)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.
