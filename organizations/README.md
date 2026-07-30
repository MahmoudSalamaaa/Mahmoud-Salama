# Mahmoud Salama Career Intelligence — Cleaned Strategic Sectors Edition

This is the complete cleaned static project. Every required runtime, dataset, image and page is inside the `organizations` folder.

## What was cleaned

- Removed the dedicated Google/live-search hub and regional platform-search pages.
- Removed Google Search-generated records from the remaining JSON datasets and CSV exports.
- Removed six duplicate HTML pages and redirected all internal references to their canonical pages before deletion.
- Preserved official employer links, direct vacancy links and real job-platform URLs.
- Fixed pages that could remain on `Loading…` by rendering immediately while the optional Web Worker initializes.
- Hardened application and availability status storage with localStorage, sessionStorage and memory fallbacks.
- Kept light mode as the first-visit default.

## Verified inventory

- HTML pages: 63
- JavaScript files: 47
- JSON files: 53
- CSV files: 59
- CSS files: 1
- Catalog records: 16,611
- Invalid local links: 0
- Invalid JSON files: 0
- JavaScript syntax errors: 0
- Google Search URLs in datasets: 0
- Placeholder-domain references: 0

## Main entry points
- `index.html` — Career Intelligence Dashboard
- `directory.html` — Complete Project Directory
- `search.html` — Unified Search
- `jobs.html` — All Job Records
- `official-jobs.html` — Official &amp; Primary-Source Jobs
- `priority-jobs.html` — Priority Job Matches
- `companies.html` — All Employers
- `organizations.html` — All Organizations
- `multinationals.html` — Priority Multinationals
- `projects.html` — Projects, Tenders &amp; Consultancies
- `tracker.html` — Application Tracker
- `data-quality.html` — Data Quality Dashboard

## Major datasets

- Catalog records: 16,611
- Job records: 1,371
- Official jobs: 68
- Priority jobs: 140
- Employers: 2,014
- Organizations: 1,991
- Multinationals: 212
- Healthcare employers: 518
- Technology employers: 675
- Supply-chain employers: 72
- Recruitment agencies: 353
- Government sources: 100
- Projects and consultancies: 390
- Platforms: 199

## Status and tracking

Every listing supports persistent **Application Status** and **Vacancy Availability** controls. Changes are shared with the tracker and reflected immediately in card, table-row and drawer colors.

Application states include Saved, Interested, Shortlisted, Applied, Follow-up, Interview, Offer, Rejected, Withdrawn, Not Suitable and Not Available.

## Local and hosted operation

Listing pages load a page-specific JavaScript data bridge from `data/js/`, so they can render without waiting for a network JSON request. The original JSON and CSV files remain available for hosting, inspection and export.

For deployment, upload the complete `organizations` folder and open `organizations/index.html`.

## Removed pages

Dedicated live-search pages removed:
- `live-searches.html`
- `platform-search-hub.html`
- `platform-search-africa.html`
- `platform-search-arab.html`
- `platform-search-egypt.html`
- `platform-search-gcc.html`
- `platform-search-remote.html`

Duplicate pages removed:
- `government-jobs.html` → `government.html`
- `medical-companies.html` → `healthcare-companies.html`
- `private-company-directory.html` → `companies.html`
- `project-opportunities.html` → `projects.html`
- `recruitment-agencies.html` → `agencies.html`
- `job-search-platforms.html` → `platforms.html`

## Test evidence

- `BROWSER_SMOKE_TEST.json` — the original 63 cleaned pages tested in desktop and mobile viewports.
- `AIRLINES_AVIATION_BROWSER_TEST.json` — the new airlines page and its integrations tested on desktop and mobile.
- `FULL_DATA_BROWSER_TEST.json` — largest pages tested with their complete datasets.
- `FINAL_CLEANUP_AUDIT.json` and `.md` — final removal and validation record.

## Airlines & Aviation Employers
Open `airlines-aviation-employers.html` for a searchable directory of 34 airline employers across Egypt, the GCC and Africa. Records prioritize official career portals and use official corporate sites only where no dedicated career portal is published.
