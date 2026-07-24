# Mahmoud Salama Career Opportunity Hub — CSS Fixed Edition

The complete project is contained inside the `organizations` folder.

## Core files

- `index.html`
- `jobs.html`
- `employers.html`
- `resources.html`
- `projects.html`
- `tracker.html`
- `contacts.html`
- `data-quality.html`
- `app.css`
- `app.js`
- `data.js`
- `logo.png`
- `data/` — JSON and CSV source files

## CSS reliability changes

1. `app.css` is located directly beside every HTML page.
2. Every HTML page also includes the complete stylesheet as an inline fallback.
3. Experimental `color-mix()` rules were removed.
4. The CSS uses standard grid, flexbox, media queries and variables.
5. Pages work on GitHub Pages and retain readable styling when opened directly.

## Local data reliability

`data.js` contains a local JavaScript copy of the JSON datasets. This avoids
browser CORS restrictions when opening `index.html` directly from a computer.
The original JSON and CSV files remain available under `data/`.

Upload the entire `organizations` folder without omitting any files.
