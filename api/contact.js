'use strict';

const buckets = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;
const MAX_BODY_BYTES = 16 * 1024;

function setSecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

function reply(res, status, body) {
  setSecurityHeaders(res);
  res.status(status).json(body);
}

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
    .slice(0, 80);
}

function isAllowedOrigin(req) {
  const origin = String(req.headers.origin || '');
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return url.hostname === 'mahmoud-salama.vercel.app' ||
      (url.hostname.startsWith('mahmoud-salama-') && url.hostname.endsWith('.vercel.app')) ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1';
  } catch (_) {
    return false;
  }
}

function allowRequest(ip) {
  const now = Date.now();
  const existing = buckets.get(ip) || [];
  const recent = existing.filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    buckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  buckets.set(ip, recent);
  if (buckets.size > 5000) {
    for (const [key, values] of buckets) {
      if (!values.some((time) => now - time < WINDOW_MS)) buckets.delete(key);
    }
  }
  return true;
}

function clean(value, maxLength) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value) && value.length <= 160;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true;
}

async function sendWithEmailJs(payload) {
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || '';
  if (!publicKey || !serviceId || !templateId) {
    console.error('Email service environment variables are not configured.');
    throw new Error('Email service is not configured');
  }

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: payload
  };
  if (privateKey) body.accessToken = privateKey;

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('EmailJS delivery failed:', response.status, detail.slice(0, 300));
    throw new Error('Email delivery failed');
  }
}

module.exports = async function contactHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, { error: 'Method not allowed.' });
  }
  if (!isAllowedOrigin(req)) return reply(res, 403, { error: 'Request origin is not allowed.' });

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) return reply(res, 413, { error: 'Message is too large.' });

  const ip = getIp(req);
  if (!allowRequest(ip)) return reply(res, 429, { error: 'Too many messages. Please try again later.' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch (_) {
    return reply(res, 400, { error: 'Invalid request body.' });
  }
  if (clean(body.company_website, 200)) return reply(res, 400, { error: 'Unable to submit this message.' });

  const startedAt = Number(body.form_started_at || 0);
  const elapsed = Date.now() - startedAt;
  if (!startedAt || elapsed < 1000 || elapsed > 2 * 60 * 60 * 1000) {
    return reply(res, 400, { error: 'Please refresh the page and try again.' });
  }

  const firstName = clean(body.first_name, 80);
  const lastName = clean(body.last_name, 80);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 30);
  const subject = clean(body.subject, 160);
  const message = clean(body.message, 3000);
  const pageUrl = clean(body.page_url, 500);

  if (!firstName || !lastName || !validEmail(email) || !subject || message.length < 10) {
    return reply(res, 400, { error: 'Please complete all required fields correctly.' });
  }

  try {
    const human = await verifyTurnstile(clean(body.turnstile_token, 2048), ip);
    if (!human) return reply(res, 400, { error: 'Human verification failed. Please try again.' });

    await sendWithEmailJs({
      first_name: firstName,
      last_name: lastName,
      from_name: `${firstName} ${lastName}`,
      email,
      reply_to: email,
      phone,
      subject,
      message,
      page_url: pageUrl,
      submitted_at: new Date().toISOString()
    });
    return reply(res, 200, { ok: true });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    return reply(res, 502, { error: 'The message service is temporarily unavailable. Please email directly.' });
  }
};
