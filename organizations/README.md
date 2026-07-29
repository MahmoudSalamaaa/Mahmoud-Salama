# Mahmoud Salama Career Intelligence — Full Complete Multinational Edition

This edition rebuilds the largest available career-intelligence project and merges all later additions.

## Included

- 1,588 fixed job records
- 68 official or primary-source job records
- 25,380 live job-search routes
- 2,238 employer records
- 235 priority multinational and strategic employer records
- 888 healthcare, pharmaceutical and MedTech employer records
- 192 supply-chain, logistics, shipping, aviation and port employer records
- 1,019 technology, cloud, software, consulting and telecom employer records
- 674 recruitment agencies
- 300 government and public-sector portals
- 390 projects, tenders and consulting assignments
- 178 job platforms and career resources
- 45 HTML pages

## Folder policy

Upload the complete `organizations` folder. No file is required at the website root.

All local paths are folder-relative, such as:

- `./index.html`
- `./assets/app.css`
- `./assets/app.js`
- `./data/js/jobs.js`
- `./data/verified-jobs.json`

## Local opening

Every listing page includes a page-specific JavaScript data bundle under `data/js/`.
This allows the application to work when opened directly from a computer, while the full JSON and CSV files remain available for hosted use and data export.

## Main pages

- `index.html`
- `directory.html`
- `search.html`
- `jobs.html`
- `live-searches.html`
- `companies.html`
- `multinationals.html`
- `projects.html`
- `tracker.html`
- `canonical.html`

## New Africa Jobs page

`africa-new-jobs.html` lists recently discovered roles from LinkedIn, Workable
and official career portals for large corporations and organizations in Egypt
and Africa. It includes local JSON/CSV data and platform search links.

Data files:
- `data/africa-new-jobs.json`
- `data/csv/africa-new-jobs.csv`
- `data/js/africa-new-jobs.js`

## Recruitera integration

The New Africa Jobs page now includes:

- `https://app.recruitera.ai` as a direct ATS resource.
- A search route for public Recruitera-hosted job pages.
- Recruitera as a platform filter.
- The DIME Healthcare Technology Lead application page supplied by the applicant.
- Clear availability-recheck labels for hosted application pages.

## Retail, Healthcare & Lifestyle Jobs

The page `retail-healthcare-lifestyle-jobs.html` covers:

- Majid Al Futtaim and major mall operators.
- Large retail and franchise groups.
- Beauty, fashion and big-shop careers.
- Hospitals, clinics and healthcare centers.
- Spa, massage, wellness and hotel-spa jobs.
- Large salon and hairdressing chains.
- Searchable current/recent job leads and official career portals.

Data files:

- `data/retail-healthcare-lifestyle-jobs.json`
- `data/csv/retail-healthcare-lifestyle-jobs.csv`
- `data/js/retail-healthcare-lifestyle-jobs.js`

## Project-wide job status controls

Every job card and job table now supports persistent browser-local settings:

- Availability: Available, Possibly Available, Deadline Approaching, Expired, Not Available, Not Verified, Broken Link, and portal-specific statuses.
- Application: Not Reviewed, Saved, Interested, Shortlisted, Applied, Follow-up, Interview, Offer, Rejected, Withdrawn, Not Suitable, Ignored, or Not Available.

The settings are shared across all job pages and the Application Tracker through local browser storage.

## Healthcare IT Companies & Profile Ranking

Added:
- `healthcare-it-companies-jobs.html`
- `abb-jobs.html`
- 30 healthcare IT companies from the supplied image
- Current and live suitable vacancies
- Official company career portals and all-vacancy searches
- Project-wide recommended sorting
- Fit-tier badges: Best Fit, Strong Fit, Good Fit, Moderate Fit and Low Fit
- Automatic bottom placement for expired, unavailable, rejected, withdrawn and not-suitable records

Data:
- `data/healthcare-it-companies-jobs.json`
- `data/js/healthcare-it-companies-jobs.js`
- `data/csv/healthcare-it-suitable-vacancies.csv`
- `data/csv/healthcare-it-companies.csv`

## LinkedIn Post Platforms

Added `linkedin-platforms.html` and merged the supplied platform list into the main platform database.

Categories:
- Global job boards and professional networks
- Egypt and MENA recruitment platforms
- Freelance and remote-work marketplaces
- Saudi flexible, hourly and part-time work platforms
- Career automation, interview preparation and language-learning tools

The page ranks each platform for Mahmoud Salama's CTO, enterprise architecture, healthcare technology and digital-transformation profile.


## Application Status Color System

Every vacancy card, table row, status panel, details drawer and tracker metric now uses a semantic color based on **My Application Status**.

Brand-aligned mapping:

- Not Reviewed — neutral slate
- Saved — gold
- Interested — cyan
- Shortlisted — teal
- Applied — deep navy/cyan
- Follow-up — gold/amber
- Interview — bright cyan
- Offer — success teal
- Rejected / Not Available — soft red
- Withdrawn / Not Suitable — muted red/slate
- Ignored — neutral gray

UI behavior:

- 5px semantic status rail on every card
- Low-saturation status background tint
- Application-status badge in the top badge area
- Status-colored application selector
- Separate availability color on the availability selector
- Immediate repaint after changing a status
- Matching colors in table rows, details drawer and application tracker
- Written labels remain visible so color is never the only status indicator


## Social Media Jobs & Searches

Added `social-media-jobs.html`.

The page includes:
- Publicly indexed suitable social-media opportunities.
- LinkedIn employer vacancies and recruiter posts.
- An archived Facebook example clearly marked Not Available.
- A Reddit technical partnership clearly marked as project-based and not employment.
- Live searches for Facebook, Instagram, X, Threads, Reddit, Telegram, TikTok, YouTube, Bluesky and Discord.
- Source-quality grades and verification warnings.
- Profile-fit ranking and the full colored application-status system.
- CSV exports for opportunities and search routes.

Only non-archived employment records are merged into the global job database, with title/employer deduplication.

## Independent Work Platforms and Job Preferences

Added:
- `independent-work-platforms.html`
- `fiverr-platform.html`
- `freelancer-platform.html`
- `upwork-platform.html`
- `toptal-platform.html`
- `contra-platform.html`
- `peopleperhour-platform.html`
- `guru-platform.html`
- `flexjobs-platform.html`
- `wellfound-platform.html`
- `weworkremotely-platform.html`

A universal Job Preferences panel is loaded on every HTML page.

Preferences:
- Target role families
- Preferred regions
- Remote, hybrid or on-site work
- Full-time, contract, consulting/freelance or part-time
- Minimum fit percentage
- Rank mode or strict filter mode
- Hide unavailable records
- Hide rejected, withdrawn and not-suitable records

Preferences are stored locally in the browser using `career_job_preferences_v1`.

## All Pages Runtime Fix

The shared listing runtime was repaired after a duplicated orphan `return` block in `assets/app.js` caused a browser-level `Illegal return statement`. Because the same runtime is used by the organization, vacancy, employer, platform, agency, project and regional pages, the error left all of those pages displaying `Loading…`.

Repairs:
- Removed the invalid duplicate table block.
- Rebuilt the shared listing initialization function.
- Preserved profile ranking, application-status colors and job preferences.
- Added a built-in main-thread fallback when Blob Web Workers are unavailable, blocked by policy or fail during startup.
- Added worker startup timeout and visible error recovery instead of leaving pages permanently on `Loading…`.
- Browser-tested the unified catalog, organizations, jobs, regional employment, platforms and all custom vacancy pages.

## Default Theme

Light mode is now the default theme on first visit across all HTML pages.
A theme previously selected by the user remains stored in the browser under `careerTheme` and continues to take precedence.

## Top 100 Companies in Egypt and the GCC

Added `top-100-companies-egypt.html` and `top-100-companies-gcc.html`, each with 100 employer targets, official careers or live searches, advanced filters, cards/table views, profile ranking, availability/application controls, saved searches, preferences, pagination and CSV export.

## Hotels and Private Hospitals

Added:
- `hotels-private-hospitals.html`
- `major-hotels-egypt.html` — 50 properties
- `major-hotels-gcc.html` — 60 properties
- `private-hospitals-egypt.html` — 40 facilities
- `private-hospitals-gcc.html` — 60 facilities

All four listing pages include:
- Official careers or live employer searches
- Search, advanced filters and sorting
- Cards and table views
- Application and availability status controls
- Project-wide Job Preferences
- Saved searches and current-result CSV export
- Full dataset CSV downloads
- Light theme by default and dark-theme support
- Responsive desktop and mobile layouts

The directories are employer-targeting resources, not hotel-quality or hospital-quality rankings.

## Strategic Sector Employers

Added six separate directories and 311 employer records for insurance, automotive and manufacturing companies in Egypt and the GCC.

Suggested next sectors: pharmaceuticals and medical devices; logistics and aviation; telecom, cloud and data centers; fintech; energy; consulting and BPO; smart cities; FMCG and e-commerce.
