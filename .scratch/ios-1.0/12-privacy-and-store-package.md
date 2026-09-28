# iOS 12 — Prepare privacy, rights and store materials

Status: planned. Release: 1.0. Dependencies: 01, 03; finalize after 06, 08, 09, 11.

Suggested chunk: One documentation/assets PR; external forms remain drafts until authorized. These are review boundaries, not calendar estimates.

## Outcome

Create an accurate submission package that describes the actual finished game.

## Work

1. Inventory native plugins, network access, diagnostics and required-reason API use. Add/review privacy manifests as applicable and prepare App Privacy answers from observed behavior, including third-party dependencies. Default scope adds no analytics, ads, tracking or accounts.
2. Document rights/provenance for generated art, fonts, icons and audio. Keep Erwu reference photos out of shipping assets and public records unless separately authorized.
3. Draft product name/subtitle/description, age-rating answers, categories, support contact/URL, privacy-policy URL and review notes. Verify current screenshot/icon requirements against the chosen device family; capture from the release candidate, not mockups.
4. Explain the complete offline game, saved garden, native integrations and how reviewers can reach each feature. Evaluate minimum-functionality and completeness guidance; a bundled app is not a guarantee of approval, and adding arbitrary native widgets is not a substitute for a finished game.
5. Document encryption/export-compliance answers using actual dependencies. Confirm pricing, territories, seller identity and publication choice before completing external distribution settings.

## Acceptance and evidence

- Submission checklist and draft metadata match the tested binary; no placeholders or invented privacy claims.
- Required manifests/licenses are included and release network behavior matches disclosures.
- Owner can review the exact store package and public URLs before submission.
- Record implementation commit(s), build number where applicable, commands/results and evidence paths before marking complete. A blocked device or signing step does not turn into a pass.

## Required from you

Seller identity, support email/site, privacy-policy hosting, name/icon/copy approval, pricing/territories, age-audience intent and rights questions if provenance is incomplete.

## Out of scope

Legal conclusions, accounts/ads/IAP, public posting of personal photos, actual submission.

## Primary references

- [Reference 1](https://developer.apple.com/app-store/review/guidelines/)
- [Reference 2](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [Reference 3](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)

Checked during planning on 2026-09-28; recheck version-dependent requirements when implementing.

