# iOS 08 — Make audio and touch feedback behave like an iOS game

Status: planned. Release: 1.0. Dependencies: 04, 07.

Suggested chunk: One sensory-feedback PR. These are review boundaries, not calendar estimates.

## Outcome

Keep Bloom's feedback restrained, reliable and respectful of device and player preferences.

## Work

1. Replace the switch-input/vibration workaround in the native build with supported native haptics through the platform adapter. Map existing actions to a small vocabulary; coalesce rapid impacts and keep a no-op fallback for unsupported devices.
2. Add persistent, separately understandable sound and haptic settings. Default to a non-intrusive configuration; prevent duplicate feedback from both native and web paths.
3. Define audio-session behavior: respect the silent switch by default, avoid interrupting other music, and stop when backgrounded. Verify the actual WKWebView/native audio-session behavior; use a minimal native adjustment if required.
4. Resume audio after interruption only when appropriate. Handle headphones/Bluetooth routing, user gesture unlock, incoming calls, mute toggles and rapid app switching without delayed sound bursts.
5. Keep all audio generation/assets local. Avoid unnecessary microphone permission or background modes.

## Acceptance and evidence

- Physical-device tests cover silent mode, sound off, haptics off, headphones, other music and interruption recovery.
- No repeated haptic storm during busy shots; preferences persist after restart.
- Web fallback remains playable with unsupported audio/haptics.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Confirm preferred default sound/haptic settings after hearing a proposed build; owner testing is scheduled in ticket 13.

## Out of scope

New soundtrack production, microphone access or continuous background audio.

