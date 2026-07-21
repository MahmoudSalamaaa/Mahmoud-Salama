# Local Productivity Edition Notes

## Requested constraint

Cloud synchronization was intentionally not added. All new functionality is local-first.

## Implemented enhancements

### Daily workflow
- Added Today page.
- Rechecks due.
- Follow-ups and next-contact dates.
- Deadlines within 14 days.
- Newly added named opportunities.
- Saved items not yet applied to.
- Changed careers pages.
- Broken or unavailable links.

### Vacancy monitoring
- Per-record monitoring flag.
- Content fingerprinting.
- Page-title and careers-keyword signals.
- Changed-page timeline event.
- Manual and optional once-daily checks.
- No false claim that a changed page contains a matching vacancy.

### Relationships and contacts
- Contact name and role.
- Email, phone and LinkedIn.
- Last and next contact dates.
- Relationship notes.
- Relationship timeline combined with application status history.

### Search
- Synonym groups.
- Permanent exclusions.
- Six ready-made search presets.
- Freshness filter.
- Comfortable, compact and table views.
- Improved empty states with filter-removal suggestions.

### Documents and evidence
- IndexedDB document library.
- Multiple attachments per tracked record.
- Manual vacancy-description snapshots.
- Optional server-side public-page capture.
- Interview-preparation panel.
- Interview date, outcome, notes and questions.

### Analytics
- Submitted applications.
- Response, interview and offer rates.
- Average response time.
- Country, sector, source and CV-version conversion tables.

### Africa organizations
- Interactive regional map.
- Country coverage table.
- Organization class.
- Headquarters and regional-office fields.
- Funding-model field.
- Operating-status verification note.
- Careers-link quality.

### Data quality
- Fresh, aging, old and stale classifications.
- Duplicate candidate detection.
- Duplicate warning before adding or importing custom records.
- Verified, manual-review, generated, missing-careers and broken-link states.
- Dedicated verification queue.

### Local resilience
- Up to 10 rolling automatic local backups.
- Restore and delete automatic backups.
- Existing manual JSON, CSV and Excel-compatible exports retained.
- Migration from the previous V3 browser-storage keys.

## Limitations

- Browser data is device- and browser-specific.
- Uploaded files can be lost if browser site data is cleared.
- Link monitoring and automatic page capture require a deployed serverless API.
- Cross-origin pages may block or restrict automated fetching.
- Derived NGO classifications are navigation aids, not independent due-diligence conclusions.
