# ATS Intelligence Edition Notes

## Release

- Version: `8.0.0-ats-intelligence`
- Date: 21 July 2026
- Architecture: local-first static application with optional Vercel serverless endpoints
- Cloud synchronization: not included
- AI search: not included

## Implemented changes

### 1. ATS connectors

- Greenhouse Job Board connector
- Lever Postings connector
- Lever EU connector
- SmartRecruiters company-postings connector
- ATS configuration stored locally
- Official-job preview before saving
- Official ATS job IDs retained for duplicate prevention
- Relevant-job count after eligibility and match checks
- `Job Found` update for linked tracked organizations

### 2. ATS discovery

- URL-based detection in the browser
- Server-side page inspection for embedded ATS links
- Workday, SAP SuccessFactors and Oracle Recruiting detection
- custom careers-page fallback
- manual redirect validation and SSRF protection

### 3. Humanitarian sources added

- ICRC Careers
- IFRC Careers
- Norwegian Refugee Council Careers
- NORCAP Expert Deployments
- Danish Refugee Council Careers
- Oxfam International Careers
- Oxfam in Africa Jobs
- Plan International Careers
- Médecins Sans Frontières Careers
- International Medical Corps Careers

Named source total increased from 77 to 87. Generated search links remain in the separate search matrix and are not counted as named platforms.

### 4. Browser capture

- drag-to-bookmarks `Save to Career Hub` bookmarklet
- captures title, URL, selected text or meta description and detected company text
- review form before saving
- automatic ATS detection
- local tracker and job snapshot creation

### 5. Eligibility gate

- explicit Egypt and Cairo recognition
- Africa, MENA, EMEA, international and worldwide scope
- remote-region interpretation
- nationality and residence restrictions
- work-authorization restrictions
- French-language warning
- national/local-contract warning
- relocation and on-site warning
- eligibility-adjusted match score

### 6. Organization review intelligence

- Organization Priority Score from relevance, source authority, freshness, applications, interviews, changed pages and repeated no-suitable-job reviews
- suggested review cycle of 3, 7, 30, 60 or 90 days
- first Not Available review: 30 days
- second occurrence: 60 days
- third and later occurrences: 90 days
- monitored page change returns an organization to Review Queue
- Job Found clears the scheduled recheck

### 7. Calendar and history

- local calendar for deadlines, follow-ups, interviews, contact dates and rechecks
- standards-compatible `.ics` export
- job-description snapshots retain every version
- compare two versions to identify added and removed terms

### 8. Weekly Review

- source review
- careers-page and ATS-change review
- imported-vacancy processing
- duplicate review
- saved-job applications
- follow-ups
- eligibility verification
- stale-record cleanup
- local backup
- JSON weekly summary export

### 9. Performance

- dataset-specific lazy loading
- dynamic search matrix rather than duplicating 25,380 HTML cards
- Web Worker filtering for large, compatible searches
- synonym-aware worker search
- 24-record pagination
- Cancel Loading action in global search
- separate cache per dataset

### 10. Security

- imported HTML converted to plain text
- unsafe `javascript:` and non-HTTP(S) URLs rejected
- no inline event handlers or inline scripts
- Content Security Policy on every page and deployment headers
- API timeouts, content-size limits and redirect limits
- private, loopback, link-local and metadata targets blocked
