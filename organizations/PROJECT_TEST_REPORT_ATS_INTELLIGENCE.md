# Project Test Report — ATS Intelligence Edition

## Build information

- Version: `8.0.0-ats-intelligence`
- Validation date: 21 July 2026
- Architecture: local-first static application plus optional Vercel serverless functions
- HTML pages: 41
- Datasets: 12
- Named job sources: 87
- Africa NGOs and development organizations: 148
- Offline core records: 6,440
- Generated multi-platform search combinations: 25,380

## Automated project validation

Command:

```bash
npm run validate
```

Result: **Passed**

Validated:

- every required page, module, API file and data file exists and is non-empty;
- all 12 offline datasets match their configured target counts;
- the generated matrix contains exactly 25,380 rows;
- all 87 source-directory rows are named sources, not generated searches;
- source coverage includes 54 official sources, 5 specialist sources and 8 RSS-enabled sources;
- all 10 newly added humanitarian sources are present;
- the Africa organization directory contains 148 named records;
- Not Available remains a personal tracking status rather than a vacancy-availability status;
- removed AI pages and API modules remain absent;
- all HTML pages use the shared application module and include a Content Security Policy;
- the service-worker application shell references 52 existing files;
- every CSS custom property used by the stylesheet is defined.

## Feature-unit tests

Command:

```bash
npm run test:features
```

Result: **Passed**

Tested with deterministic mock ATS responses:

- Greenhouse response mapping
- Lever response mapping
- SmartRecruiters response mapping
- Greenhouse URL detection
- Lever URL detection
- SmartRecruiters URL detection
- Workday URL detection
- SAP SuccessFactors URL detection
- Oracle Recruiting URL detection
- Egypt eligibility and restricted-location gate
- eligibility-adjusted match limits
- synonym-aware search
- Organization Priority Score
- 25,380-row matrix generation
- 87 named sources
- first Not Available review = 30 days
- second occurrence = 60 days
- third and later occurrence = 90 days
- Job Found transition clears the recheck date

## Syntax and static-integrity tests

Result: **Passed**

- JavaScript syntax checked: 26 files
- missing internal HTML references: 0
- HTML pages missing CSP: 0
- inline HTML event handlers: 0
- undefined CSS variables: 0
- invalid project JSON files: 0
- missing service-worker shell files: 0

## Security checks implemented

- public HTTP/HTTPS URL allow-listing;
- rejection of `javascript:` and unsafe schemes;
- plain-text sanitization of imported RSS, CSV, JSON and captured descriptions;
- no inline executable scripts;
- CSP and deployment security headers;
- DNS resolution and private-IP blocking for remote inspection endpoints;
- redirect-by-redirect validation in ATS detection;
- response-size, redirect-count and timeout limits;
- fixed official ATS hosts for posting synchronization;
- board and company identifiers restricted to safe characters.

## Deployment-dependent tests

The connector transformation logic was tested with mock official responses. Live ATS synchronization, remote ATS page inspection, RSS URL fetching, link checking and public-page snapshots require deployment on Vercel or a compatible serverless environment and an internet connection.

Workday, SAP SuccessFactors and Oracle Recruiting are deliberately detection-and-monitoring integrations rather than undocumented scraping connectors.

## Final result

The project passed all automated validation, unit, syntax, internal-reference, CSP, CSS-variable, dataset-count and package-integrity checks performed for this release.
