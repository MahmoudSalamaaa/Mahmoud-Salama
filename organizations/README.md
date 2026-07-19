# GitHub deployment structure

Upload the single `organizations` folder exactly as shown:

```text
organizations/
├── index.html
├── 404.html
├── .nojekyll
├── regional-employment.html
├── organizations.html
├── medical-companies.html
├── gcc-vacancies.html
├── egypt-vacancies.html
├── remote-jobs.html
├── recruitment-agencies.html
├── government-jobs.html
├── regional-private-companies.html
├── *.csv
└── mahmoud-salama-logo-optimized.png
```

Open:

```text
/organizations/index.html
```

The index redirects internally to:

```text
./regional-employment.html
```

All page, image and CSV links are relative to the same `organizations` folder.
