# Mahmoud Salama — Executive Portfolio Website

This folder is the maintained source package for Mahmoud Salama's executive portfolio at `mahmoud-salama.vercel.app`.

## Current baseline

- Version: `2026-08-03-executive-portfolio-complete`
- Primary page: `index.html`
- Full project catalogue: `portfolio.html`
- Digital card: `card.html`
- CV viewer: `resume.html`
- Contact API: `api/contact.js`
- Deployment configuration: `vercel.json`
- Visual design and external CSS files changed in this revision: **No**

## Positioning and title policy

Use the following consistently across public branding:

- Professional headline: **Technology & Digital Transformation Executive | Enterprise Architect**
- Official current position: **Head of Central Administration – Information Systems & Digital Transformation**
- Employer: **Egyptian Authority for Unified Procurement, Medical Supply & Medical Technology (UPA)**

Do not present CTO as the official employer title unless the official title changes.

## Portfolio structure

The homepage intentionally presents 10 flagship items to keep the executive message focused. `portfolio.html` contains the full 38-item project catalogue. Every project identifies Mahmoud's involvement using terms such as Led, Architected, Governed, Directed delivery, Contributed to, or Developed.

## CV

The packaged CV is:

`assets/documents/Mahmoud_Salama_Executive_CV_2026.pdf`

The website, digital card, and CV viewer all point to this file.

## Contact form configuration

The browser posts to the Vercel Serverless Function at `/api/contact`. The function performs origin checks, body-size limits, timing checks, honeypot filtering, field validation and sanitisation, rate limiting, optional Cloudflare Turnstile verification, and server-side email delivery.

Configure these variables in **Vercel Project Settings → Environment Variables**:

- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `EMAILJS_PRIVATE_KEY` — optional
- `TURNSTILE_SECRET_KEY` — optional but strongly recommended

A safe template is provided in `.env.example`. No live credentials are stored in the project.

To activate Turnstile, add the matching public site key to this element in `index.html`:

```html
<meta name="turnstile-site-key" content="YOUR_PUBLIC_SITE_KEY">
```

If Turnstile is not configured, all other validation and anti-spam controls remain active.

## Vercel Analytics

The Vercel Web Analytics loader is included in the homepage. Enable **Web Analytics** in the Vercel project dashboard so visits are recorded.

## SEO and security

- `robots.txt` and `sitemap.xml` are included.
- A dedicated 1200×630 social-sharing image is stored at `assets/images/mahmoud-salama-social-card.png`.
- `vercel.json` applies Content Security Policy and standard browser security headers.
- `.vercelignore` prevents old development copies and internal QA files from being deployed.

## Editing rules

1. Preserve the current CSS, colours, spacing, and layout unless Mahmoud explicitly requests a redesign.
2. Edit `index.html` for homepage content and `portfolio.html` for the complete project catalogue.
3. Keep the professional headline separate from the official employment title.
4. Qualify estimates with wording such as approximately, up to, estimated, or across monitored use cases.
5. Keep headline metrics limited to the six evidence-backed executive measures.
6. Run the checks documented in `DEPLOYMENT_CHECKLIST.md` before deployment.
