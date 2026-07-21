# Project Test Report — Review Workflow Edition

Date: 2026-07-21

## Automated validation

- All JavaScript files passed `node --check`.
- Project validation script passed.
- 28 HTML pages detected.
- 12 datasets detected.
- 25,380 generated search-matrix records confirmed.
- 148 Africa NGO records confirmed in Seed and Offline CSV.
- All offline dataset counts match their configured targets.
- All local HTML links resolve to files in the project.
- AI files and AI references remain removed.

## Functional unit tests

- Default personal tracking state tested.
- Not Available review date creation tested.
- Status history creation tested.
- Review-state classification tested.
- Undo restoration tested.
- Backup preview tested.
- Merge import tested.
- Africa NGO classification tested across all 148 rows.
- Africa region classification tested.
- Careers and official website derivation tested.
- Confirmed no NGO availability value is normalized as Not Available.

## Manual browser note

A Chromium visual run was attempted in the artifact environment, but browser navigation is blocked by the environment administrator policy. The project was therefore validated through syntax, module-level functional tests, data tests, file-link checks and structural validation. A final visual pass is recommended after opening `start-local.bat` or deploying the `organizations` directory to Vercel.
