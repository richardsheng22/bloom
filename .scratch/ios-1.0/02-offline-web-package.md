# iOS 02 — Build a reproducible offline game package

Status: planned. Release: 1.0. Dependencies: 01 architecture decision.

Suggested chunk: One packaging PR. These are review boundaries, not calendar estimates.

## Outcome

Produce a minimal, versioned web payload that an installed app can run from its first launch without a server.

## Work

1. Add a package manifest, pinned toolchain/dependencies and lockfile only as needed for the selected runtime. Add a deterministic web staging command; retain a straightforward browser development path.
2. Bundle the runtime HTML, JS modules, manifest/art metadata, decoded runtime sheets and icons. Use an explicit inclusion list: exclude .scratch evidence, source art sheets, personal reference material, tests and developer-only hooks from the app payload.
3. Replace the external Google Fonts dependency with licensed, bundled font files or an explicitly chosen local fallback. Preserve font licenses and verify layout after fonts load. Inventory every other runtime network dependency.
4. Generate a payload inventory with hashes and sizes. Check missing assets, case-sensitive paths and relative URLs. Avoid hard-coded developer server URLs and remote code updates in release configuration.
5. Measure compressed package and decoded-image sizes as baseline evidence. Do not regenerate or re-style existing art as part of packaging.

## Acceptance and evidence

- A clean checkout produces the same payload content and passes existing web tests.
- A fresh browser context with external requests blocked loads fonts/art and supports a complete run plus garden planting.
- Generated payload includes no scratch files, source photos, debug hooks or development URLs.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

None unless a font license cannot be established; present the concrete fallback if needed.

## Out of scope

Native signing, a PWA service worker, new game features, CDN infrastructure.
