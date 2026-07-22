# Medical Recall Studio V2 — Visual Refresh

A redesigned V2 release with a product-first hero, release banner, modern navigation, clearer study command panel, visible What’s New entry point, and a more polished library workspace.

# Medical Recall Intelligence Library - Verified Study Studio 2.0

Curated by **Mahmoud Salama**.

## Open the project

1. Extract the complete ZIP.
2. Keep all folders together.
3. Open `index.html`.

The project works when opened locally. For the installable PWA and full offline cache, publish the folder to any HTTPS host or run a local web server.

Example local server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Implemented capabilities

- Modern responsive branding and hero section
- Search by word, phrase, abbreviation and common spelling variants
- Filters by category, year, country, centre, month, specialty, age group, context and verification status
- Side-by-side transcription and original PDF source viewer
- Source-page navigation, zoom, rotation and full-screen viewing
- Verification status, confidence and reviewer notes
- Study mode with timer and grading
- Flashcards with local spaced-repetition scheduling
- Favourites, difficult topics, completion tracking, personal notes and suggested-answer workspace
- Analytics dashboard and clickable filters
- Country, centre and year comparison mode
- Deep links to sessions
- Local editor for sessions and recall items
- Structured data import/export
- Progress backup and restore
- Print / Save PDF for single, selected or filtered sessions
- Reading size, density, theme, contrast and focus controls
- Installable PWA files
- Polished readable PDF with cover, clickable contents, bookmarks and source-page references

## Important verification note

`Verified` means the transcription was reviewed against the handwritten source page. It does not mean that the clinical content was independently validated against current guidelines.

Suggested-answer fields are intentionally user-editable. Always verify clinical notes against current professional guidance.

## Main files

- `index.html` - application entry point
- `styles.css` - responsive visual design and print styling
- `app.js` - search, filters, study tools, analytics, editor and storage logic
- `data/recalls-data.js` - browser-ready structured data
- `data/recalls-data.json` - portable JSON export
- `docs/original-handwritten.pdf` - original 116-page source
- `docs/readable-edition.pdf` - polished readable edition
- `manifest.webmanifest` and `sw.js` - PWA support


## Version 2 page

- `whats-new.html` presents the user-facing Version 2 enhancements.
- The original homepage layout has been preserved.
- A compact highlighted button in the hero section links to the What's New page without changing the main layout.
