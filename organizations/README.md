# Mahmoud Salama Career Hub — Consulting, Rosters & Opportunity Intelligence Edition

All runtime files remain inside the `organizations` folder. The project is local-first and does not use cloud synchronization or AI search.

## New in version 9

- Seven opportunity tracks: employment, consulting, rosters, volunteering, secondments, procurement and traineeships.
- Official consulting sources: UNGM, WBGeProcure RFx Now and AfDB E-Consultant.
- UN Talent Pipeline, UN Volunteers, EEAS Vacancies and EURAXESS Africa.
- Opportunity Decision Score combining professional match, eligibility, source authority, deadline risk, application effort and competition.
- Application-requirements checklists and reusable templates.
- Local email-alert importer.
- ZIP opportunity archive with evidence, snapshots and attachments.
- Optional encrypted local vault and encrypted portable backups using PBKDF2-SHA256 and AES-GCM.
- Editable rules engine and profile coverage matrix.
- Source lifecycle states: Active, Low Yield, Paused, Broken, Replaced and Archived.

## Run locally

Windows: `start-local.bat`

Linux/macOS: `./start-local.sh`

Then open `http://localhost:8080/index.html`.

## Important limits

- Cross-origin ATS, RSS and page monitoring require Vercel deployment.
- Browser storage can be cleared; use local and encrypted backups.
- Losing the vault password may make encrypted data unrecoverable.
- Every opportunity, deadline, eligibility rule and application method must be verified on the official source.
