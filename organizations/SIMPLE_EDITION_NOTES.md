# Simple Africa Edition

Version: 3.1.0-simple  
Build date: 2026-07-20

## What changed

- Reduced the main navigation to six clear destinations: Home, AI Search, Jobs, Africa NGOs, Organizations, and My Applications.
- Moved secondary tools such as dashboards, source methodology, link checking, alerts, and data management under a single **More** menu.
- Rebuilt the homepage around four starting points instead of showing every database at once.
- Simplified result cards to show only the essential information and one main action.
- Kept advanced filters available, but collapsed them under **More filters**.
- Added a dedicated **Africa NGOs & Development Organizations** directory.
- Added 148 named African, humanitarian, development, health, research, civic-technology, and multilateral organizations with official website or careers links.
- Added quick links to ReliefWeb, Devex, and Impactpool for current development and humanitarian vacancy searches.
- Improved Arabic and English AI intent detection for queries such as:
  - NGOs working in Africa
  - Healthcare development organizations in East Africa
  - منظمات إنسانية تعمل في أفريقيا
  - وظائف منظمات دولية في كينيا
- Preserved the application tracker, favorites, comparison, CSV export, saved searches, dashboard, link checker, offline mode, and optional OpenAI reranking.

## Important data note

The Africa directory is a curated organization directory, not a claim that every organization currently has an open vacancy. Each opportunity and deadline must be verified on the official source before applying.

## Start locally

Run `start-local.bat` on Windows or `./start-local.sh` on macOS/Linux, then open:

`http://localhost:8080/index.html`

## Deploy on Vercel

Set the Vercel Root Directory to `organizations`. The local semantic search works without an API key. Add `OPENAI_API_KEY` only if cloud reranking is required.
