# Migration Notes

- Replace the contents of the existing `organizations` folder with this release, or copy this release over it.
- Existing CSV files keep working because the new pages read the same standard schema.
- Existing localStorage keys are not deleted; the new unified tracker uses `careerTrackerV3`.
- No page redirects to the repository root.
- The old static platform-search CSV files are optional because the new matrix is generated dynamically; they can still be synchronized with `npm run sync-data`.
