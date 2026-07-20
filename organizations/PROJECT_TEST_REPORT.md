# Project Test Report

Build date: 2026-07-20  
Version: 3.0.0

## Passed automated checks

- JavaScript syntax validation for all browser modules, API functions, service worker and Node scripts.
- Required-file validation.
- 27 independent HTML pages using the shared application shell.
- 11 offline datasets with exact configured row counts.
- 6,373 core directory/job/project records.
- 25,380 generated platform-search records.
- 28 methodology records, for total project coverage of 31,781 records.
- Arabic and English semantic-query tests.
- Local HTML asset/link validation: zero missing local references.
- CSS custom-property validation: zero undefined variables.
- PWA manifest and service-worker files present.
- No project files outside the single `organizations` folder.

## Deployment-dependent checks

The following require deployment credentials or external network access and were therefore not executed with a real account during packaging:

- OpenAI cloud reranking with a real `OPENAI_API_KEY`.
- Live URL checks against external employers through `/api/check-link`.
- Vercel production deployment.

Both APIs have local fallbacks or clear error states, so the static platform continues to work when these services are unavailable.
