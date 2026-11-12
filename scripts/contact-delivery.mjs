import { createHash } from 'node:crypto';

const providerUrl = 'https://api.resend.com/emails';
const day = 24 * 60 * 60 * 1000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const topics = {
  home: ['Dexter Acres', 'Custom home'],
  development: ['Landowner opportunity', 'Investment partnership', 'Development partnership'],
};
const timingOptions = ['', 'Within 6 months', '6–12 months', 'More than a year'];
const unavailable = 'Online enquiries are temporarily unavailable. Please call Groma Development.';

export function environmentContactConfig() {
  return {
    enabled: process.env.CONTACT_ENABLED === 'true',
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.CONTACT_FROM,
    to: process.env.CONTACT_TO,
    allowedOrigins: (process.env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean),
  };
}

function address(value) {
  if (typeof value !== 'string' || value.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+$/.test(value)) return false;
  const [local, domain] = value.split('@');
  return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..')
    && domain.includes('.') && domain.split('.').every(label => label.length > 0 && label.length <= 63 && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label));
}

function usableConfig(input, allowLocalOrigins) {
  if (!input || input.enabled !== true || typeof input.apiKey !== 'string' || !/^re_[A-Za-z0-9_-]{5,250}$/.test(input.apiKey)
    || !address(input.from) || !address(input.to) || !Array.isArray(input.allowedOrigins) || !input.allowedOrigins.length) return null;
  const origins = new Set();
  for (const value of input.allowedOrigins) {
    try {
      const url = new URL(value);
      const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      if (url.origin !== value || (url.protocol !== 'https:' && !(allowLocalOrigins && loopback && url.protocol === 'http:'))) return null;
      origins.add(value);
    } catch { return null; }
  }
  return { apiKey: input.apiKey, from: input.from, to: input.to, origins };
}

function validate(input, key) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Please complete the enquiry form.' };
  if (typeof input.submissionId !== 'string' || !uuid.test(input.submissionId) || typeof key !== 'string' || key.toLowerCase() !== input.submissionId.toLowerCase()) {
    return { error: 'Please refresh the form and try again.' };
  }
  if (input.website !== undefined && (typeof input.website !== 'string' || input.website !== '')) return { error: 'Unable to accept this enquiry.' };
  function field(name, limit, multiline = false) {
    const value = input[name] === undefined ? '' : input[name];
    if (typeof value !== 'string' || value.length > limit || (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value)) return null;
    return value.trim();
  }
  const name = field('name', 100);
  const email = field('email', 254);
  const phone = field('phone', 60);
  const location = field('location', 200);
  const details = field('details', 2000, true);
  if (name === null || name.length < 2) return { error: 'Please enter your name.' };
  if (email === null || !address(email)) return { error: 'Please enter a valid email address.' };
  if (phone === null || location === null || details === null) return { error: 'Please check and shorten the project information.' };
  if (typeof input.path !== 'string' || !Object.hasOwn(topics, input.path) || !topics[input.path].includes(input.interest)) return { error: 'Please select a valid enquiry topic.' };
  const hasLot = input.lot !== undefined && input.lot !== null && input.lot !== '';
  if (hasLot && (!['string', 'number'].includes(typeof input.lot) || !/^(?:[1-9]|1[0-4])$/.test(String(input.lot))
    || input.path !== 'home' || input.interest !== 'Dexter Acres')) return { error: 'Please select a valid Dexter Acres lot.' };
  const timing = input.timing === undefined ? '' : input.timing;
  if (!timingOptions.includes(timing)) return { error: 'Please select a valid timeframe.' };
  if (input.consent !== true) return { error: 'Please confirm that Groma Development may contact you about this enquiry.' };
  return { data: { submissionId: input.submissionId.toLowerCase(), name, email, phone, location, details, path: input.path, interest: input.interest, lot: hasLot ? Number(input.lot) : null, timing } };
}

function emailPayload(data, config) {
  // Keep this payload deterministic: Resend rejects a changed body for an
  // existing idempotency key. User input is plain text, never email headers.
  return {
    from: config.from,
    to: [config.to],
    reply_to: data.email,
    subject: `Groma Development website enquiry — ${data.interest} — ${data.submissionId}`,
    text: [
      'New Groma Development website enquiry',
      `Reference: ${data.submissionId}`,
      `Path: ${data.path}`,
      `Topic: ${data.interest}`,
      `Lot: ${data.lot ?? 'Not selected'}`,
      `Timeframe: ${data.timing || 'Still exploring'}`,
      '',
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || 'Not provided'}`,
      `Project location: ${data.location || 'Not provided'}`,
      '',
      'Project details:',
      data.details || 'Not provided',
      '',
      'The sender consented to contact about this enquiry. This is not a property reservation or investment commitment.',
    ].join('\n'),
  };
}

function json(req, res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Length': Buffer.byteLength(body), ...extraHeaders });
  res.end(req.method === 'HEAD' ? undefined : body);
}

class BodyError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function readBody(req, limit) {
  const length = req.headers['content-length'];
  if (length !== undefined && (!/^\d+$/.test(length) || Number(length) > limit)) throw new BodyError(413, 'Please shorten the enquiry.');
  let size = 0;
  const chunks = [];
  try {
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > limit) throw new BodyError(413, 'Please shorten the enquiry.');
      chunks.push(buffer);
    }
  } catch (error) { req.resume(); throw error; }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new BodyError(400, 'Please check the form and try again.'); }
}

export function createContactHandler({
  getConfig = environmentContactConfig,
  fetchImpl = globalThis.fetch,
  now = Date.now,
  timeoutMs = 8000,
  allowLocalOrigins = false,
  bodyLimit = 12000,
  rateWindowMs = 15 * 60 * 1000,
  addressLimit = 20,
  globalLimit = 100,
  maxRecords = 1000,
} = {}) {
  const submissions = new Map();
  const addresses = new Map();
  let global = { count: 0, until: 0 };

  function sweep(time) {
    for (const [key, entry] of submissions) if (!entry.pending && entry.until <= time) submissions.delete(key);
    for (const [key, entry] of addresses) if (entry.until <= time) addresses.delete(key);
  }

  function allowRequest(req, time) {
    sweep(time);
    if (global.until <= time) global = { count: 0, until: time + rateWindowMs };
    // Do not trust X-Forwarded-For supplied by a browser. Behind Railway's
    // proxy this may group visitors; keep one replica and review real proxy
    // behavior before replacing this with a trusted, shared limiter.
    const key = String(req.socket?.remoteAddress || 'unknown');
    let entry = addresses.get(key);
    if (!entry) {
      if (addresses.size >= maxRecords) return false;
      entry = { count: 0, until: time + rateWindowMs };
      addresses.set(key, entry);
    }
    if (global.count >= globalLimit || entry.count >= addressLimit) return false;
    global.count += 1;
    entry.count += 1;
    return true;
  }

  async function deliver(payload, id, apiKey) {
    const controller = new AbortController();
    let timer;
    const timeout = new Promise(resolve => {
      timer = setTimeout(() => { controller.abort(); resolve({ status: 504, error: 'The email service took too long to respond. Please retry this enquiry.' }); }, timeoutMs);
    });
    const operation = (async () => {
      try {
        const response = await fetchImpl(providerUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact/${id}` },
          body: payload,
          signal: controller.signal,
          redirect: 'error',
        });
        if (!response.ok) return { status: 503, error: unavailable };
        const result = await response.json();
        if (!result || typeof result.id !== 'string' || !uuid.test(result.id)) return { status: 502, error: unavailable };
        return { status: 202 };
      } catch { return { status: 503, error: unavailable }; }
    })();
    try { return await Promise.race([timeout, operation]); }
    finally { clearTimeout(timer); }
  }

  return async function contact(req, res, pathname) {
    if (pathname !== '/api/contact' && pathname !== '/api/contact/status') return false;
    const statusRoute = pathname.endsWith('/status');
    if (!(statusRoute ? ['GET', 'HEAD'] : ['POST']).includes(req.method)) {
      json(req, res, 405, { error: 'Method not allowed.' }, { Allow: statusRoute ? 'GET, HEAD' : 'POST' });
      return true;
    }
    let config;
    try { config = usableConfig(getConfig(), allowLocalOrigins); } catch { config = null; }
    if (statusRoute) { json(req, res, 200, { enabled: Boolean(config) }); return true; }
    if (!config) { json(req, res, 503, { error: unavailable }); return true; }
    if (typeof req.headers.origin !== 'string' || !config.origins.has(req.headers.origin)) {
      json(req, res, 403, { error: 'Please use the Groma Development website to send your enquiry.' }); return true;
    }
    if (!allowRequest(req, now())) {
      json(req, res, 429, { error: 'Please wait before sending another enquiry.' }, { 'Retry-After': String(Math.ceil(rateWindowMs / 1000)) }); return true;
    }
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?\s*$/i.test(req.headers['content-type'] || '')) {
      json(req, res, 415, { error: 'Unsupported form format.' }); return true;
    }
    let input;
    try { input = await readBody(req, bodyLimit); }
    catch (error) { json(req, res, error instanceof BodyError ? error.status : 400, { error: error instanceof BodyError ? error.message : 'Please check the form and try again.' }); return true; }
    const checked = validate(input, req.headers['idempotency-key']);
    if (checked.error) { json(req, res, 400, { error: checked.error }); return true; }
    const data = checked.data;
    const payload = JSON.stringify(emailPayload(data, config));
    const fingerprint = createHash('sha256').update(payload).digest('hex');
    const time = now();
    sweep(time);
    let entry = submissions.get(data.submissionId);
    if (entry && entry.fingerprint !== fingerprint) {
      json(req, res, 409, { error: 'This enquiry was edited. Please begin a new submission before sending.' }); return true;
    }
    if (!entry) {
      // Fail closed rather than evict an unexpired key and permit duplicates.
      if (submissions.size >= maxRecords) { json(req, res, 503, { error: unavailable }); return true; }
      entry = { fingerprint, until: time + day, pending: null, accepted: false };
      submissions.set(data.submissionId, entry);
    }
    if (!entry.accepted) {
      if (!entry.pending) {
        // Install the promise synchronously before yielding so simultaneous
        // submissions with the same key share a single provider operation.
        entry.pending = deliver(payload, data.submissionId, config.apiKey).then(result => {
          entry.accepted = result.status === 202;
          entry.pending = null;
          return result;
        });
      }
      const result = await entry.pending;
      if (result.status !== 202) { json(req, res, result.status, { error: result.error }); return true; }
    }
    json(req, res, 202, { status: 'accepted', reference: data.submissionId });
    return true;
  };
}
