# Project Test Report — Verified Source Intelligence Edition

Build date: 21 July 2026  
Version: 7.0.0-source-intelligence

## Automated validation

- All JavaScript modules, service-worker code, serverless functions and validation scripts passed `node --check`.
- The project validator passed all required page, file, feature and dataset checks.
- 36 HTML pages and 12 configured datasets were found.
- All expected core pages and source-intelligence assets are present.
- Removed AI files remain absent.

## Source intelligence tests

- Named source directory: 77 unique sources.
- Generated monitoring searches in named source directory: 0.
- Official sources passing the strict validator classification: 44.
- Specialist-platform sources: at least 5.
- Sources with configured RSS/feed entry points: 8.
- Search packs: 6.
- Official source authority rank tested above generated discovery search rank.
- Duplicate vacancy test selected the official employer link as primary.
- Source performance test correctly calculated applications, responses, interviews and priority score.
- Remote eligibility test recognized worldwide scope as potentially eligible from Egypt.

## Search and data tests

- Search synonym test matched “Systems Manager” to “Head of Applications”.
- Generated multi-platform matrix count: 25,380.
- Africa NGO directory: 148 named records.
- All configured offline dataset targets passed.
- `Not Available` remains a personal tracking status only.

## Security and local-first checks

- Feed URL fetching is server-side only.
- HTTP/HTTPS protocol validation is enabled.
- Private, loopback, link-local and metadata network destinations are blocked.
- Redirect count, response size and timeout limits are enforced.
- No API key, cloud database, AI dependency or user account is required.

## Packaging result

- Internal project validation: passed.
- JavaScript syntax validation: passed.
- ZIP archive integrity: tested after packaging.

## Operational limitation

Automated monitoring cannot run while the browser and project are closed. URL-based RSS/feed fetching, remote link checks and public-page snapshots require Vercel deployment. Local files and pasted RSS, Atom, JSON or CSV imports work without cloud synchronization.
