# Job Status Color UI/UX Update

This update applies status-dependent colors to **every HTML page** in the Career Intelligence project while preserving the current data, links, filters, tracker, and localStorage status system.

## What changes visually

| Meaning | Color treatment |
|---|---|
| Available / Active / Open | Green |
| Saved / Interested / Applied / Shortlisted / Interview | Blue |
| Deadline approaching / Follow-up / Possibly available | Amber |
| Expired / Not Available / Rejected / Withdrawn / Broken link | Soft red |
| Not reviewed / Not verified | Neutral gray |
| Offer | Purple |

The interface never depends on color alone. Every colored card also shows written **Availability** and **Application** labels.

## UI/UX behavior

- A 5px semantic status rail appears on each job card.
- The card receives a low-saturation background tint instead of a harsh full-color fill.
- Status changes repaint the card immediately.
- Table rows use the same status logic.
- A compact color guide appears on job and vacancy pages.
- Light mode, dark mode, mobile layout, keyboard focus, printing, reduced-motion, and high-contrast preferences are supported.
- The existing localStorage keys and Application Tracker remain unchanged.

## Apply on Windows

1. Extract this update folder.
2. Put the update folder beside the `organizations` folder, or copy its files into the `organizations` folder.
3. Double-click:

`apply-status-color-uiux.bat`

The Windows launcher uses built-in PowerShell, so Python is not required. It automatically finds the project and updates every top-level `.html` file.

You may also pass the folder path in Command Prompt:

```text
apply-status-color-uiux.bat "D:\your-project\organizations"
```

## Apply on macOS / Linux

```bash
chmod +x apply-status-color-uiux.sh
./apply-status-color-uiux.sh "/path/to/organizations"
```

## Manual commands

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File apply-status-color-uiux.ps1 "D:\your-project\organizations"
```

Cross-platform Python alternative:

```bash
python apply_status_color_uiux.py "/path/to/organizations"
```

## Files added to the project

```text
organizations/
└── assets/
    ├── job-status-color-uiux.css
    └── job-status-color-uiux.js
```

Every HTML page receives these two references:

```html
<link rel="stylesheet" href="./assets/job-status-color-uiux.css" data-status-color-uiux="css">
<script src="./assets/job-status-color-uiux.js" data-status-color-uiux="js"></script>
```

The script is idempotent: running it again does not duplicate the links.

## Validation

The patcher confirms:

- every HTML page includes both assets;
- both assets exist;
- no invalid `../assets/` paths are introduced;
- all pages remain inside the same project structure.

A small `status-uiux-backup` folder is created only when a previous version of either new asset already exists.
