// Vercel Serverless Function — POST /api/contact
// Sends inquiry emails via Resend. No third-party SDK; uses native fetch.
// Required env: RESEND_API_KEY

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'Crestics Inquiries <hello@crestics.com>';
const TO_ADDRESS = 'crestics.llc@gmail.com';

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'company', 'role', 'size', 'budget', 'project'];
const MAX_FIELD_LENGTH = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// Hosted brand assets — accessible from email clients
const LOGO_LIGHT_BG = 'https://crestics.com/assets/logo/PNGs/crestics-black-violet-dot.png'; // black wordmark, for light backgrounds
const LOGO_DARK_BG = 'https://crestics.com/assets/logo/PNGs/crestics-white-violet-dot.png'; // white wordmark, for dark backgrounds
const SITE_URL = 'https://crestics.com';

// Map of internal field codes to human-readable labels
const ROLE_LABELS = {
  ceo: 'CEO / Founder',
  coo: 'COO',
  cto: 'CTO / VP Engineering',
  product: 'Head of Product',
  ops: 'Head of Operations',
  other: 'Other',
};
const SIZE_LABELS = {
  '1-10': '1–10 employees',
  '11-50': '11–50 employees',
  '51-200': '51–200 employees',
  '201-500': '201–500 employees',
  '500+': '500+ employees',
};
const BUDGET_LABELS = {
  '5-25': '$5K – $25K',
  '25-75': '$25K – $75K',
  '75-250': '$75K – $250K',
  '250+': '$250K+',
  retainer: '$12K+/month retainer (Operate)',
  'not-sure': "Not sure yet — let's talk",
};

function label(map, code) {
  return map[code] || code;
}

function formatTimestamp() {
  const now = new Date();
  return now.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

// ──────────────────────────────────────────────────────────────────
// CONFIRMATION EMAIL (sent to prospect — light theme)
// ──────────────────────────────────────────────────────────────────

function buildConfirmationBodies(data) {
  const firstName = escapeHtml(data.firstName);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thanks for reaching out — Crestics</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0a0a0b;-webkit-font-smoothing:antialiased;">
  <!-- Preheader (hidden in body, shown in inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f5f5f7;opacity:0;">A senior engineer will respond within 24 hours.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td align="left" style="padding:0 0 24px 4px;">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <img src="${LOGO_LIGHT_BG}" alt="Crestics" width="120" style="display:block;width:120px;height:auto;border:0;">
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e5e5e5;border-radius:14px;padding:40px 36px;box-shadow:0 1px 3px rgba(10,10,11,0.04);">

              <!-- Violet check badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:rgba(124,92,255,0.10);border:1px solid rgba(124,92,255,0.25);border-radius:50%;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="color:#7c5cff;font-size:24px;line-height:48px;font-weight:700;">✓</span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;font-weight:700;color:#0a0a0b;letter-spacing:-0.01em;">
                Thanks, ${firstName} — we got your inquiry.
              </h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#52525b;">
                A senior engineer will review your project and respond within <strong style="color:#0a0a0b;">24 hours</strong> with next steps, a few clarifying questions, or honest advice if AI isn't the right fit.
              </p>

              <!-- What happens next -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafafa;border:1px solid #e5e5e5;border-radius:10px;padding:0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;color:#7c5cff;letter-spacing:0.8px;text-transform:uppercase;font-weight:600;">What happens next</p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" width="28" style="padding:6px 12px 6px 0;color:#7c5cff;font-weight:700;font-size:14px;">1.</td>
                        <td valign="top" style="padding:6px 0;font-size:14px;line-height:1.55;color:#27272a;">A senior engineer reads your inquiry today.</td>
                      </tr>
                      <tr>
                        <td valign="top" width="28" style="padding:6px 12px 6px 0;color:#7c5cff;font-weight:700;font-size:14px;">2.</td>
                        <td valign="top" style="padding:6px 0;font-size:14px;line-height:1.55;color:#27272a;">We reply within 24 hours with a scoped path forward — or honest pushback if AI isn't the answer.</td>
                      </tr>
                      <tr>
                        <td valign="top" width="28" style="padding:6px 12px 6px 0;color:#7c5cff;font-weight:700;font-size:14px;">3.</td>
                        <td valign="top" style="padding:6px 0;font-size:14px;line-height:1.55;color:#27272a;">If it's a fit, we book a 30-minute call to align on scope, timeline, and price.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#52525b;">
                Anything urgent or want to add context? Just reply to this email — it goes straight to our team.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px;line-height:1.6;color:#71717a;">
                    <strong style="color:#27272a;">Crestics LLC</strong> · AI Product Studio · Austin, Texas<br>
                    <a href="${SITE_URL}" style="color:#7c5cff;text-decoration:none;">crestics.com</a>
                    &nbsp;·&nbsp;
                    <a href="https://www.linkedin.com/company/crestics/" style="color:#7c5cff;text-decoration:none;">LinkedIn</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:hello@crestics.com" style="color:#7c5cff;text-decoration:none;">hello@crestics.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Thanks, ${data.firstName} — we got your inquiry.

A senior engineer will review your project and respond within 24 hours with next steps, a few clarifying questions, or honest advice if AI isn't the right fit.

WHAT HAPPENS NEXT
1. A senior engineer reads your inquiry today.
2. We reply within 24 hours with a scoped path forward — or honest pushback if AI isn't the answer.
3. If it's a fit, we book a 30-minute call to align on scope, timeline, and price.

Anything urgent or want to add context? Just reply to this email — it goes straight to our team.

—
Crestics LLC · AI Product Studio · Austin, Texas
https://crestics.com
LinkedIn: https://www.linkedin.com/company/crestics/
Email: hello@crestics.com`;

  return { html, text };
}

// ──────────────────────────────────────────────────────────────────
// INTERNAL NOTIFICATION (sent to crestics.llc@gmail.com — dark theme)
// ──────────────────────────────────────────────────────────────────

function buildEmailBodies(data) {
  const { firstName, lastName, email, company, website, role, size, budget, project } = data;
  const safeWebsite = website && /^https?:\/\//i.test(website) ? website : '';
  const timestamp = formatTimestamp();

  const row = (lbl, val) => `
    <tr>
      <td style="padding:10px 16px 10px 0;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.6px;font-family:'SF Mono',Menlo,Consolas,monospace;vertical-align:top;width:130px;">${lbl}</td>
      <td style="padding:10px 0;color:#f5f5f7;font-size:14px;line-height:1.5;vertical-align:top;">${val}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>New inquiry — ${escapeHtml(company)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f5f5f7;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0a0a0b;opacity:0;">${escapeHtml(firstName)} ${escapeHtml(lastName)} from ${escapeHtml(company)} — ${escapeHtml(label(BUDGET_LABELS, budget))}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td align="left" style="padding:0 0 24px 4px;">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <img src="${LOGO_DARK_BG}" alt="Crestics" width="120" style="display:block;width:120px;height:auto;border:0;">
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111113;border:1px solid #2a2a2e;border-radius:14px;overflow:hidden;">

              <!-- Header strip with violet accent -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,rgba(124,92,255,0.18) 0%,rgba(124,92,255,0.04) 100%);border-bottom:1px solid #2a2a2e;padding:24px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="display:inline-block;background:#7c5cff;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 10px;border-radius:999px;font-family:'SF Mono',Menlo,Consolas,monospace;">New Inquiry</span>
                        </td>
                        <td align="right" style="font-size:11px;color:#71717a;font-family:'SF Mono',Menlo,Consolas,monospace;">${timestamp}</td>
                      </tr>
                    </table>

                    <h1 style="margin:18px 0 6px;font-size:22px;line-height:1.25;font-weight:700;color:#f5f5f7;letter-spacing:-0.01em;">
                      ${escapeHtml(company)}
                    </h1>
                    <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.5;">
                      ${escapeHtml(firstName)} ${escapeHtml(lastName)} · ${escapeHtml(label(ROLE_LABELS, role))} · <span style="color:#7c5cff;font-weight:600;">${escapeHtml(label(BUDGET_LABELS, budget))}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Details table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 32px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#9b7fff;text-decoration:none;">${escapeHtml(email)}</a>`)}
                      ${safeWebsite ? row('Website', `<a href="${escapeHtml(safeWebsite)}" style="color:#9b7fff;text-decoration:none;">${escapeHtml(safeWebsite)}</a>`) : ''}
                      ${row('Company size', escapeHtml(label(SIZE_LABELS, size)))}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Project section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:8px 32px 32px;">
                    <p style="margin:0 0 12px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;color:#7c5cff;letter-spacing:0.8px;text-transform:uppercase;font-weight:600;">Project</p>
                    <div style="background:#1a1a1d;border-left:3px solid #7c5cff;border-radius:6px;padding:18px 20px;">
                      <p style="margin:0;white-space:pre-wrap;line-height:1.65;font-size:14px;color:#e5e5e7;">${escapeHtml(project)}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#0e0e10;border-top:1px solid #2a2a2e;padding:16px 32px;">
                    <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                      Hit <strong style="color:#a1a1aa;">Reply</strong> to respond directly to ${escapeHtml(firstName)} — auto-confirmation already sent to their inbox.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 8px 0;">
              <p style="margin:0;font-size:11px;color:#52525b;font-family:'SF Mono',Menlo,Consolas,monospace;letter-spacing:0.3px;">
                CRESTICS.COM · INQUIRY PIPELINE · ${timestamp.toUpperCase()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `NEW CRESTICS INQUIRY
${timestamp}

${company}
${firstName} ${lastName} · ${label(ROLE_LABELS, role)} · ${label(BUDGET_LABELS, budget)}

Email:        ${email}${safeWebsite ? `\nWebsite:      ${safeWebsite}` : ''}
Company size: ${label(SIZE_LABELS, size)}

PROJECT
-------
${project}

---
Reply to this email to respond directly to ${firstName} — auto-confirmation already sent to their inbox.`;

  return { html, text };
}

export default async function handler(req, res) {
  // CORS — only allow same-origin POSTs in practice; explicit deny for OPTIONS preflight from elsewhere
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY environment variable');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Vercel auto-parses JSON when Content-Type is application/json
  const data = (req.body && typeof req.body === 'object') ? req.body : {};

  // Honeypot — silently 200 for bots so they don't retry
  if (data._gotcha && String(data._gotcha).trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  // Required field check
  for (const field of REQUIRED_FIELDS) {
    const v = data[field];
    if (typeof v !== 'string' || v.trim() === '') {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Length sanity (DoS prevention)
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string' && v.length > MAX_FIELD_LENGTH) {
      return res.status(400).json({ error: `Field too long: ${k}` });
    }
  }

  // Email format
  if (!EMAIL_RE.test(data.email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const { html, text } = buildEmailBodies(data);
  const subject = `New Crestics inquiry — ${data.company} (${data.budget})`;

  const sendEmail = (payload) => fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  try {
    // 1. Internal notification — must succeed (this is the actual lead capture)
    const internal = await sendEmail({
      from: FROM_ADDRESS,
      to: [TO_ADDRESS],
      reply_to: data.email,
      subject,
      html,
      text,
    });

    if (!internal.ok) {
      const errorText = await internal.text();
      console.error('Resend (internal) error:', internal.status, errorText);
      return res.status(502).json({ error: 'Email delivery failed. Please try again or email hello@crestics.com directly.' });
    }

    // 2. Auto-confirmation to prospect — best-effort, do not fail the request if this fails
    const confirm = buildConfirmationBodies(data);
    sendEmail({
      from: FROM_ADDRESS,
      to: [data.email],
      reply_to: TO_ADDRESS,
      subject: 'We got your inquiry — Crestics',
      html: confirm.html,
      text: confirm.text,
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        console.warn('Resend (confirmation) non-fatal error:', r.status, t);
      }
    }).catch((e) => {
      console.warn('Resend (confirmation) network error:', e);
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
