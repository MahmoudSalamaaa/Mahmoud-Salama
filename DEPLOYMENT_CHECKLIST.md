# Deployment Checklist

## Before upload

- [ ] Keep the folder structure unchanged.
- [ ] Confirm `index.html`, `portfolio.html`, `card.html`, and `resume.html` open correctly.
- [ ] Confirm `assets/documents/Mahmoud_Salama_Executive_CV_2026.pdf` is present.
- [ ] Confirm no external CSS file was unintentionally changed.

## Vercel environment variables

Set these in Project Settings → Environment Variables for Production and Preview:

- [ ] `EMAILJS_PUBLIC_KEY`
- [ ] `EMAILJS_SERVICE_ID`
- [ ] `EMAILJS_TEMPLATE_ID`
- [ ] `EMAILJS_PRIVATE_KEY` if required by the EmailJS account

Recommended anti-spam protection:

- [ ] Create a Cloudflare Turnstile widget for `mahmoud-salama.vercel.app`.
- [ ] Set `TURNSTILE_SECRET_KEY` in Vercel.
- [ ] Put the matching public site key in the `turnstile-site-key` meta element in `index.html`.

## Vercel project settings

- [ ] Enable Web Analytics.
- [ ] Deploy the project and verify the Production domain.
- [ ] Submit a test contact message after environment variables are configured.
- [ ] Confirm `/robots.txt` and `/sitemap.xml` return HTTP 200.
- [ ] Confirm the social card renders when the homepage URL is shared.

## Post-deployment checks

- [ ] Homepage intro appears only on the first browser visit and completes in about 1.3 seconds.
- [ ] Homepage displays 10 flagship projects; the full portfolio displays 38.
- [ ] Project filters and Read More buttons work using keyboard and pointer controls.
- [ ] CV links download the packaged final CV.
- [ ] Contact form rejects incomplete submissions and delivers a valid test message.
- [ ] Browser console shows no application errors.
