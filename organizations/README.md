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

## Remote4Africa Suitable Jobs

Added `remote4africa-jobs.html` with public Remote4Africa listings and live searches checked on 27 July 2026.

The page:
- Includes only roles aligned with Mahmoud Salama's senior technology profile.
- Ranks best-fit vacancies first.
- Uses the full application-status and availability color system.
- Preserves browser-local status selections.
- Adds Remote4Africa to the main Platforms database.
- Adds the curated vacancies to All Jobs, Remote Opportunities and Priority Jobs.
- Clearly distinguishes direct vacancy pages from live-search results.
- Notes that some full job details and application links require Remote4Africa registration or premium access.

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
