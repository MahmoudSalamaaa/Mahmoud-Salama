# Simple Africa Edition — Validation Report

Build date: 2026-07-20  
Version: 3.1.0-simple

## Verified successfully

- 28 independent HTML pages use the shared application shell.
- 12 offline datasets passed exact row-count validation.
- 6,521 core directory, employer, vacancy, project, and NGO records.
- 148 Africa NGO and development-organization records.
- All 148 NGO organization names are unique.
- All NGO URLs use valid HTTP or HTTPS schemes.
- 25,380 generated multi-platform search records.
- 28 methodology records.
- Total project coverage: 31,929 records.
- JavaScript syntax validation passed for browser modules, APIs, scripts, and the service worker.
- English and Arabic NGO-intent queries were recognized correctly.
- Local HTML references were checked: zero missing local files.
- The service worker includes the Africa NGO page and uses a new cache version.
- The application remains contained inside the single `organizations` folder.

## Interface changes checked

- Six-item primary navigation.
- Secondary tools grouped under **More**.
- Four primary homepage starting points.
- Advanced dataset filters collapsed under **More filters**.
- Simplified result cards with one primary website action.
- Africa NGO directory exposed directly in the main navigation and homepage.

## Deployment-dependent checks

These require a deployed environment, credentials, or unrestricted external network access:

- OpenAI cloud reranking using a real `OPENAI_API_KEY`.
- Live external URL checks through `/api/check-link`.
- Production Vercel deployment.
- Full browser visual-regression testing. The execution environment blocked localhost browser access, so validation was performed through syntax, data, structure, and local-reference tests.

The local semantic search, directories, filters, tracker, favorites, exports, and offline application shell do not require an OpenAI key.
