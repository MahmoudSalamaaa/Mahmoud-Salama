# Project Test Report — Opportunity Intelligence Edition

Tested: 21 July 2026

## Scope

The full local-first career hub was validated after adding consulting, rosters, talent pools, volunteering, secondments, procurement, application requirements, templates, opportunity archives, email import, encrypted local storage, profile coverage and configurable rules.

## Automated results

- 52 HTML pages validated.
- 12 datasets validated.
- 6,448 offline core records built.
- 25,380 multi-platform search combinations preserved.
- 95 named job and opportunity sources validated.
- 148 named Africa NGOs and development organizations validated.
- 9 source packs validated.
- All JavaScript files passed syntax checking.
- All internal HTML references resolved.
- No removed AI-search or cloud-sync runtime files remain.
- CSS custom properties passed definition checks.
- Content Security Policy checks passed for static pages.
- `Not Available` remains a personal tracking status only.

## Feature tests

Passed:

- Greenhouse, Lever and SmartRecruiters mappings.
- Workday, SuccessFactors and Oracle ATS detection.
- Egypt eligibility gate.
- Synonym-aware search and opportunity-track filter.
- Organization priority scoring.
- Opportunity Decision Score.
- Application-requirement inference.
- Consulting, roster, volunteer, secondment and procurement track detection.
- ZIP opportunity archive creation and integrity.
- PBKDF2/AES-GCM encrypted portable backup flow.
- Adaptive 30/60/90-day `Not Available` review cycle.
- Transition to `Job Found` when a suitable opportunity is recorded.

## Security controls checked

- Imported text is sanitized.
- Unsafe URL schemes are rejected.
- Server-side fetch functions restrict private and metadata-network targets.
- Feed and page downloads enforce size, redirect and timeout limits.
- The vault uses PBKDF2-SHA256 with AES-GCM for encrypted local data and exports.

## Runtime limits

Static validation and module-level tests passed. Cross-origin ATS synchronization, external feed retrieval, public-page snapshots and remote link monitoring require deployment to Vercel or another compatible serverless environment and must be verified against live providers after deployment.

The project remains local-first. Browser storage may be cleared by the user or browser, so regular encrypted backups are recommended.
