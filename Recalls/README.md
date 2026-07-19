# Medical Recall Explorer — Phase 1

A responsive, filterable HTML project created for **Mahmoud Salama** from the handwritten PDF `Recalls recent_260719_130608_Compress.pdf`.

## Current scope

- Source PDF: **116 pages**
- Structured and reviewed in this phase: **pages 1–20**
- Recall sessions created: **19**
- Countries represented in the first batch: United Kingdom, Malaysia, Oman, Saudi Arabia, India and Egypt
- Centres represented: UK, Malaysia, Oman, Jeddah, Mumbai, Hyderabad and Egypt

The original source PDF is included in the project, so every recall card can open the related handwritten page for verification.

## Main features

- Full-text search across titles, countries, centres, categories and recall content
- Category filters: History, Communication, Video, Clinical, Development and Others
- Filters by year, country, centre and month
- Sorting by newest, oldest or centre
- Expand/collapse all sections
- Copy the complete text of an individual recall session
- Print the currently filtered results
- Dark/light theme
- Responsive mobile, tablet and desktop layout
- Original-PDF source viewer
- Personal branding, logo, website, digital card, LinkedIn and email

## Project structure

```text
recalls_project_phase1/
├── index.html
├── styles.css
├── app.js
├── data.js
├── README.md
└── assets/
    ├── logo.png
    └── recalls-source.pdf
```

## Open the project

Open `index.html` directly in a modern browser. It does not require a server, database or internet connection for its core features.

When publishing it online, upload the entire folder without changing the relative file structure.

## Adding the next batch

Add each new recall session as another object inside `window.RECALLS_DATA` in `data.js` using this schema:

```javascript
{
  id: "unique-centre-date-day",
  center: "Centre name",
  country: "Country name",
  region: "Region",
  year: 2025,
  month: "February",
  day: 1,
  title: "Centre — February 2025 — Day 1",
  pages: [21, 22],
  sections: {
    History: ["Item one", "Item two"],
    Communication: ["Item one"],
    Video: ["Item one"],
    Clinical: ["Item one"],
    Development: ["Item one"],
    Others: ["Optional item"]
  }
}
```

Then update `transcribedThroughPage` in `window.RECALLS_META`. All counts, progress, filters and category statistics update automatically.

## Transcription approach

The source is handwritten and contains specialist abbreviations. Phase 1 was manually structured for readability while retaining abbreviations where the source uses them. Text that remains uncertain is marked in the interface and can be corrected in later quality-assurance passes while viewing the original page.

## Planned batches

1. **Completed:** Foundation and pages 1–20
2. **Next:** Pages 21–50
3. Pages 51–85
4. Pages 86–116 and final quality assurance

## Study notice

This project contains exam-recall study material. It is not a clinical guideline and must not be used as patient-specific medical advice.
