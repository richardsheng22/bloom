# iOS 09 — Finish iPhone interaction and accessible controls

Status: planned. Release: 1.0. Dependencies: 02, 04, 08.

Suggested chunk: Two bounded commits: layout/input, then accessibility/settings. These are review boundaries, not calendar estimates.

## Outcome

Make the game comfortable on supported iPhones with clear, reachable controls and honest accessibility behavior.

## Work

1. Audit the actual native safe-area insets, status bar, home indicator, notches and supported orientation changes. Fix primary actions, planting cards and settings at the smallest supported size; preserve the stationary garden when a card opens.
2. Test aiming near system edges, pointer cancellation, multiple touches, interrupted drags and accidental scrolling/selection. Protect immediate Play/Continue and the single aiming decision per turn.
3. Provide one restrained settings/help area for sound, haptics, reduced motion, version and support. Keep engineering details out of normal gameplay.
4. Give DOM controls useful names, focus order, selected states and generous targets. Honor text-size changes in UI labels/cards without scaling the canvas out of bounds; check contrast and differentiate essential information beyond colour.
5. Audit VoiceOver on real hardware. Define an accessible aiming route (adjust angle, explicit launch/cancel and concise turn/result announcements) using the same physics, plus bed selection and inspection. If the core loop cannot be made usable within this slice, record a concrete follow-up and accurate accessibility claims rather than declaring full support.
6. Apply Reduce Motion consistently to native and canvas effects, including changes while the app is open. Preserve gameplay timing/progress even when decorative movement is suppressed.

## Acceptance and evidence

- Native layout/input checks pass on small and large supported phones, text sizes and orientation policy.
- VoiceOver can reach controls, dismiss sheets and operate the documented core-loop route; any unsupported interaction is explicitly tracked.
- Reduced motion, focus restoration and settings persistence have regression evidence; no Arrange/furniture editing returns.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Optional readability preferences; a short accessible-control demonstration for feedback, not an open-ended redesign request.

## Out of scope

iPad redesign, new garden interactions, album, reintroducing Arrange.
