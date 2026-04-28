# Crestics

**AI Product Studio · Austin, Texas**

Ship AI in weeks, not quarters. Crestics is an Austin-based AI product studio delivering production-grade AI features, automations, voice agents, and custom products — built by senior engineers, shipped fast.

- 🌐 Website: [crestics.com](https://crestics.com)
- 📍 Based in: Austin, Texas
- ✉️ Contact: hello@crestics.com
- 💼 LinkedIn: [crestics](https://www.linkedin.com/company/crestics/)

---

## Brand System

### Colors (locked)

| Role | Hex | Usage |
|---|---|---|
| **Electric Violet** | `#7C5CFF` | Primary accent — logo, CTAs, links |
| **Violet Light** | `#9B7FFF` | Hover state |
| **Violet Deep** | `#5B3FD4` | Pressed state |
| **Primary Dark** | `#0A0A0B` | Page background |
| **Surface** | `#111113` | Card background |
| **Surface Elevated** | `#1F1F22` | Hover / elevated surface |
| **Border Subtle** | `#2A2A2E` | Dividers |
| **Warm White** | `#F5F5F7` | Primary text |
| **Muted Gray** | `#A1A1AA` | Secondary text |
| **Subtle Gray** | `#71717A` | Tertiary text |
| **Light BG** | `#FAFAFA` | Light-mode background |

Usage rule: 60% dark neutrals / 30% text / 10% violet accent.

### Typography

- **Headlines**: [Geist](https://fonts.google.com/specimen/Geist) 700 Bold · letter-spacing -0.04em · line-height 1.05
- **Body**: [Inter](https://fonts.google.com/specimen/Inter) 400 / 500 · letter-spacing 0 · line-height 1.6
- **Mono / labels**: [Geist Mono](https://fonts.google.com/specimen/Geist+Mono) 400
- **Accent italic**: [Poppins](https://fonts.google.com/specimen/Poppins) 200 italic — gradient phrases only

### Logo

- Icon: Rounded white "C" shape with a solid violet `#7C5CFF` dot inside at the bottom-right of the C opening.
- Wordmark: `crestics` all lowercase in Geist 700 Bold, with the dot on the "i" in violet `#7C5CFF`.

---

## Services & Engagement Tiers

Productized tiers. Fixed scope. Fixed price.

1. **Discover** — From $5,000 · 2–3 weeks. AI audit + roadmap.
2. **Build** — From $25,000 · 4–8 weeks. Production AI feature/product.
3. **Operate** — From $12,000/month. Ongoing senior AI team.
4. **AI Pod** — $12K–$25K/month. Embedded senior AI engineer + ML/ops support, monthly rolling.

### Verticals

E-commerce · FinTech · B2B SaaS

---

## Tech Stack

- Pure HTML / CSS / vanilla JS (no framework dependencies)
- Google Fonts (Geist, Inter, Geist Mono, Poppins)
- IntersectionObserver for scroll animations + scrollspy
- SVG inline for icons and logo
- Vercel for hosting
- One Vercel serverless function (`/api/contact`) for the inquiry form
- Resend for transactional email delivery

---

## Project Structure

```
/
├── api/
│   └── contact.js              # Vercel serverless fn — inquiry form → Resend
├── assets/                     # Favicons, OG images, social covers
├── scripts/                    # Build-time image generators (excluded from deploy)
│   ├── favicon.gen.py
│   ├── og-variants.gen.py
│   └── social-covers.gen.py
├── index.html                  # Homepage
├── discover.html               # Discover engagement page
├── build.html                  # Build engagement page
├── operate.html                # Operate engagement page
├── work-with-us.html           # Inquiry form
├── case-industrial-distribution.html  # Case study
├── privacy.html / terms.html / cookies.html
├── package.json                # Node 18+, ESM (for serverless fn)
├── site.webmanifest            # PWA manifest
├── robots.txt / sitemap.xml
├── llms.txt                    # AI crawler context
├── .vercelignore               # Excludes scripts/ from deploy
└── README.md
```

---

## Local Development

### Static pages

```bash
# Serve all static HTML
python3 -m http.server 4500
# → http://localhost:4500
```

The contact form will fail locally on this server — `/api/contact` only exists in the Vercel runtime. To test the form end-to-end, use the Vercel CLI (below).

### Full preview including the API endpoint

```bash
# Install Vercel CLI once
npm i -g vercel

# Link the project (first time only)
vercel link

# Pull production env vars locally
vercel env pull .env.local

# Run with serverless functions
vercel dev
# → http://localhost:3000
```

`vercel dev` reads `.env.local`, so `RESEND_API_KEY` is available to `/api/contact`.

---

## Inquiry Form & Email Pipeline

The form on `work-with-us.html` POSTs to `/api/contact` (Vercel serverless function), which validates input and sends an HTML email via Resend.

### Architecture

```
Browser form (work-with-us.html)
    │
    │  POST /api/contact  (JSON body)
    ▼
Vercel serverless fn (api/contact.js)
    │  - Honeypot check (silent 200 for bots)
    │  - Required-field validation
    │  - Email format + length sanity
    │  - HTML escape all user input
    │
    │  Sends TWO emails via Resend:
    │
    ├──[1] Internal notification (must succeed)
    │      From: Crestics Inquiries <hello@crestics.com>
    │      To:   crestics.llc@gmail.com
    │      Reply-To: <prospect's email>
    │      Subject: New Crestics inquiry — <Company> (<budget>)
    │
    └──[2] Auto-confirmation to prospect (best-effort, non-blocking)
           From: Crestics Inquiries <hello@crestics.com>
           To:   <prospect's email>
           Reply-To: crestics.llc@gmail.com
           Subject: We got your inquiry — Crestics
```

Email 1 failure → request returns `502` and the form shows an error.
Email 2 failure → logged as warning, request still succeeds (the lead is captured either way).

### Required environment variable

| Name | Where to set | Value |
|---|---|---|
| `RESEND_API_KEY` | Vercel Project Settings → Environment Variables (Production + Preview) | API key from [resend.com](https://resend.com) dashboard, scoped to `crestics.com` with sending access only |

The function returns `500: Server misconfigured` if this is missing — check Vercel env vars first when debugging.

### Resend domain setup (one-time)

`crestics.com` is verified in Resend with DNS records on Namecheap. If the domain is ever re-added or rotated, the records to add are:

| Type | Host | Value | Priority |
|---|---|---|---|
| TXT | `resend._domainkey` | DKIM public key from Resend dashboard (full string) | — |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | — |

After adding records, verify with:

```bash
dig +short TXT resend._domainkey.crestics.com @8.8.8.8
dig +short TXT send.crestics.com @8.8.8.8
dig +short MX  send.crestics.com @8.8.8.8
dig +short TXT _dmarc.crestics.com @8.8.8.8
```

Then click **Verify DNS Records** in the Resend dashboard.

### Email config (in `api/contact.js`)

| Constant | Value | Notes |
|---|---|---|
| `FROM_ADDRESS` | `Crestics Inquiries <hello@crestics.com>` | Must use a `@crestics.com` address (Resend rejects others) |
| `TO_ADDRESS` | `crestics.llc@gmail.com` | Recipient inbox — change here, then redeploy |
| `MAX_FIELD_LENGTH` | 5000 chars | DoS guard |
| Honeypot field | `_gotcha` | Hidden in CSS; bots fill it, request silently 200s |

To change the recipient, edit `TO_ADDRESS` in `api/contact.js` and push.

### Form mechanics (in `work-with-us.html`)

- `<form id="inquiryForm" action="/api/contact" method="post" novalidate>`
- Native `required` + `type="email"` validation runs first via `form.checkValidity()`
- On submit: button shows "Sending..." with spinner, all fields disabled
- On `200 { ok: true }`: form is hidden, success card fades in, scrolls into view
- On error: inline red error box appears above submit button with mailto fallback
- Honeypot input `_gotcha` is `position: absolute; left: -10000px` — hidden from sighted users + screen readers via `aria-hidden`

### Limits & costs

- **Resend free tier**: 3,000 emails/month, 100/day — easily covers MVP volume
- **Vercel Hobby**: 100 GB-hours of serverless execution/month — function runs ~50ms per inquiry, won't approach limit
- **No rate limiter currently** — Resend has its own throttling. If form abuse appears, add Vercel KV-backed rate limiting in `api/contact.js`

### Testing the live form

```bash
curl -X POST https://crestics.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test","lastName":"User","email":"you@example.com",
    "company":"Test Co","role":"ceo","size":"1-10",
    "budget":"5-25","project":"Test inquiry from curl"
  }'
# Expect: {"ok":true}
```

Check `crestics.llc@gmail.com` for the email. Spam folder if first time.

---

## Deployment

Site auto-deploys to Vercel on `git push origin main`.

### One-time Vercel setup

1. Connect GitHub repo at vercel.com → import project
2. Framework preset: **Other** (or leave auto-detect — it'll find `api/`)
3. Build command: leave empty (static + serverless, no build step)
4. Output directory: leave empty (root `.`)
5. Add env var `RESEND_API_KEY` in Project Settings → Environment Variables (Production + Preview scopes)

### What gets deployed

Everything in the repo *except* what's in `.vercelignore`:

```
scripts/    # Local-only image generation scripts
```

The `api/` directory is auto-detected by Vercel and each `.js` file becomes a serverless function under `/api/<filename>`.

---

## Brand Guidelines

Full brand guidelines are maintained separately. See `brand-guidelines.pdf` in the sister `/brand-assets` folder for:

- Complete color specs (HEX, RGB, HSL, CMYK)
- Typography system with tracking/leading specs
- Logo application rules (8 variants)
- WCAG accessibility contrast ratios
- Usage do's and don'ts
- Required deliverable specs

---

© 2026 Crestics LLC · Austin, Texas · All rights reserved
