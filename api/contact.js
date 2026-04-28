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

function buildConfirmationBodies(data) {
  const firstName = escapeHtml(data.firstName);
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:32px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0a0a0b;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5;">
    <div style="margin-bottom:24px;">
      <span style="display:inline-block;width:32px;height:32px;background:#7c5cff;border-radius:6px;color:#fff;text-align:center;line-height:32px;font-weight:700;font-size:18px;">C</span>
    </div>
    <h2 style="margin:0 0 16px;font-size:20px;color:#0a0a0b;">Thanks, ${firstName} — we got your inquiry.</h2>
    <p style="margin:0 0 16px;line-height:1.6;color:#3f3f46;">A senior engineer will review your project and respond within <strong>24 hours</strong> with next steps, a few clarifying questions, or honest advice if AI isn't the right fit.</p>
    <p style="margin:0 0 24px;line-height:1.6;color:#3f3f46;">If anything's urgent or you want to add context, just reply to this email — it goes straight to our team.</p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 20px;">
    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
      <strong style="color:#0a0a0b;">Crestics LLC</strong><br>
      AI Product Studio · Austin, Texas<br>
      <a href="https://crestics.com" style="color:#7c5cff;text-decoration:none;">crestics.com</a>
    </p>
  </div>
</body></html>`;

  const text = `Thanks, ${data.firstName} — we got your inquiry.

A senior engineer will review your project and respond within 24 hours with next steps, a few clarifying questions, or honest advice if AI isn't the right fit.

If anything's urgent or you want to add context, just reply to this email — it goes straight to our team.

—
Crestics LLC
AI Product Studio · Austin, Texas
https://crestics.com`;

  return { html, text };
}

function buildEmailBodies(data) {
  const { firstName, lastName, email, company, website, role, size, budget, project } = data;
  const safeWebsite = website && /^https?:\/\//i.test(website) ? website : '';

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:32px;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f5f5f7;">
  <div style="max-width:600px;margin:0 auto;background:#111113;border:1px solid #2a2a2e;border-radius:12px;padding:32px;">
    <h2 style="margin:0 0 24px;color:#7c5cff;font-size:20px;">New Crestics Inquiry</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#a1a1aa;width:140px;">Name</td><td style="padding:6px 0;">${escapeHtml(firstName)} ${escapeHtml(lastName)}</td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#7c5cff;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">Company</td><td style="padding:6px 0;">${escapeHtml(company)}</td></tr>
      ${safeWebsite ? `<tr><td style="padding:6px 0;color:#a1a1aa;">Website</td><td style="padding:6px 0;"><a href="${escapeHtml(safeWebsite)}" style="color:#7c5cff;text-decoration:none;">${escapeHtml(safeWebsite)}</a></td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#a1a1aa;">Role</td><td style="padding:6px 0;">${escapeHtml(role)}</td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">Company Size</td><td style="padding:6px 0;">${escapeHtml(size)}</td></tr>
      <tr><td style="padding:6px 0;color:#a1a1aa;">Budget</td><td style="padding:6px 0;"><strong>${escapeHtml(budget)}</strong></td></tr>
    </table>
    <h3 style="margin:32px 0 12px;font-size:15px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.5px;">Project</h3>
    <p style="white-space:pre-wrap;line-height:1.6;margin:0;font-size:14px;">${escapeHtml(project)}</p>
    <hr style="border:none;border-top:1px solid #2a2a2e;margin:28px 0 16px;">
    <p style="font-size:12px;color:#71717a;margin:0;">Submitted from crestics.com · Reply to this email to respond directly to the prospect.</p>
  </div>
</body></html>`;

  const text = `New Crestics Inquiry

Name: ${firstName} ${lastName}
Email: ${email}
Company: ${company}${safeWebsite ? `\nWebsite: ${safeWebsite}` : ''}
Role: ${role}
Company Size: ${size}
Budget: ${budget}

Project
-------
${project}

---
Submitted from crestics.com · Reply to this email to respond directly to the prospect.`;

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
