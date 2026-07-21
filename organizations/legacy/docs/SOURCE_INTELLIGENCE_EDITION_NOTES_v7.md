# Source Intelligence Edition Notes

Build date: 21 July 2026
Version: 7.0.0-source-intelligence

## Implemented

1. Replaced the inflated 168-row platform list with 77 named official, specialist, African regional, MENA, remote and direct-employer sources.
2. Kept the 25,380 generated search matrix separate and clearly labelled as discovery searches.
3. Added official-source-first sorting and a saved local preference.
4. Added source authority ranking from 1 to 6.
5. Added source fields for coverage, specialism, account requirement, alerts, RSS, review frequency, priority, Egypt eligibility, remote scope and application policy.
6. Added local source review scheduling.
7. Added source performance analytics based on applications, responses, interviews, offers and expired results.
8. Added six source packs: Africa technology leadership, healthcare digital transformation, development consulting, humanitarian technology, GCC senior technology and Egypt senior technology.
9. Added RSS / Atom / JSON / CSV importer with preview and selective saving.
10. Added a secure Vercel feed-fetch endpoint with SSRF protection and a 2 MB size limit.
11. Added likely duplicate vacancy comparison, with the highest-authority source marked as primary.
12. Added job-specific fields: contract type, grade, position scope, remote eligibility, nationality restrictions, language requirements, roster status and deadline timezone.
13. Added remote and Egypt-eligibility indicators to opportunity cards and details.
14. Added direct career sources for major health, humanitarian and development implementers.
15. Added `methodology.html` so workflow help remains separate from the Source Intelligence dashboard.

## Local-first limitation

Source checks, feeds and performance history are not synchronized between devices. URL-based feed fetching requires the Vercel function; file and pasted-content imports work locally.
