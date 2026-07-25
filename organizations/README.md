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
