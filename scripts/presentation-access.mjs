import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';

const deriveKey = promisify(scrypt);
const sessionHours = 4;
const digest = value => createHash('sha256').update(value).digest('hex');

export async function hashAccessCode(code, salt = randomBytes(16).toString('hex')) {
  const hash = await deriveKey(code, salt, 32);
  return { salt, hash: hash.toString('hex') };
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// Content and account records come from server configuration, never a Vite import.
// Empty/malformed configuration always denies access.
export function environmentPresentationConfig() {
  try {
    return {
      accounts: JSON.parse(process.env.PRESENTATION_ACCESS_JSON || '[]'),
      decks: JSON.parse(process.env.PRESENTATION_DECKS_JSON || '{}'),
    };
  } catch { return { accounts: [], decks: {} }; }
}

export function createPresentationHandler({ getConfig = environmentPresentationConfig, secureCookies = true, now = Date.now, shell = new URL('../dist/presentation/index.html', import.meta.url) } = {}) {
  const sessions = new Map();
  const attempts = new Map();
  const addressAttempts = new Map();
  const cookieName = secureCookies ? '__Host-grama-presentation' : 'grama-presentation';
  const cookie = (token, maxAge = sessionHours * 3600) => `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookies ? '; Secure' : ''}`;
  const validAccount = (account, time) => account && account.active === true && typeof account.email === 'string'
    && typeof account.deckId === 'string' && typeof account.salt === 'string' && /^[a-f0-9]{64}$/i.test(account.hash || '')
    && Number.isFinite(Date.parse(account.expiresAt)) && Date.parse(account.expiresAt) > time;

  return async function presentation(req, res, pathname) {
    if (pathname !== '/presentation' && !pathname.startsWith('/presentation/')) return false;
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Vary', 'Cookie');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");

    if (['/presentation', '/presentation/', '/presentation/index.html'].includes(pathname)) {
      if (!['GET', 'HEAD'].includes(req.method)) { send(res, 405, { error: 'Method not allowed.' }); return true; }
      try {
        const html = await readFile(shell);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(req.method === 'HEAD' ? undefined : html);
      } catch { send(res, 503, { error: 'The private presentation is being prepared.' }); }
      return true;
    }

    let config;
    try { config = getConfig(); } catch { config = null; }
    if (!config || !Array.isArray(config.accounts) || !config.decks || typeof config.decks !== 'object') config = { accounts: [], decks: {} };
    const time = now();
    const token = String(req.headers.cookie || '').split(';').map(item => item.trim()).find(item => item.startsWith(cookieName + '='))?.slice(cookieName.length + 1) || '';
    const sessionKey = /^[A-Za-z0-9_-]{43}$/.test(token) ? digest(token) : '';
    const session = sessions.get(sessionKey);
    const account = session && config.accounts.find(a => a && typeof a.email === 'string' && a.email.toLowerCase() === session.email);
    const authorized = session && session.expiresAt > time && validAccount(account, time) && session.fingerprint === digest(account.hash + ':' + account.deckId);

    if (pathname === '/presentation/api/deck' && req.method === 'GET') {
      if (!authorized || !Object.hasOwn(config.decks, account.deckId)) { send(res, 401, { error: 'Please sign in with your individual access details.' }); return true; }
      send(res, 200, { preparedFor: account.name || 'Invited investor', deck: config.decks[account.deckId] });
      return true;
    }

    if (['/presentation/api/login', '/presentation/api/logout'].includes(pathname) && req.method === 'POST') {
      // Browser JSON requests must come from this exact host. Do not trust a
      // user-supplied forwarded host when deciding the permitted origin.
      let sameOrigin = false;
      try { const origin = new URL(req.headers.origin); sameOrigin = ['http:', 'https:'].includes(origin.protocol) && origin.host === req.headers.host; } catch { /* absent origin denied */ }
      if (!sameOrigin || !(req.headers['content-type'] || '').startsWith('application/json')) { send(res, 403, { error: 'Use this website to sign in.' }); return true; }
      if (pathname.endsWith('/logout')) {
        sessions.delete(sessionKey);
        res.setHeader('Set-Cookie', cookie('', 0));
        send(res, 200, { ok: true }); return true;
      }
      if (!config.accounts.length) { send(res, 503, { error: 'Individual invitations are being prepared. Please contact Grama.' }); return true; }
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 4096) { send(res, 413, { error: 'Unable to accept this request.' }); return true; }
      }
      let input;
      try { input = JSON.parse(raw); } catch { send(res, 400, { error: 'Please check your access details.' }); return true; }
      const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
      const code = typeof input?.code === 'string' ? input.code : '';
      if (email.length > 254 || !email || code.length < 12 || code.length > 200) { send(res, 401, { error: 'Please check your access details.' }); return true; }
      const limitKey = email + ':' + req.socket.remoteAddress;
      const address = req.socket.remoteAddress;
      const addressHistory = addressAttempts.get(address) || { count: 0, until: time + 15 * 60 * 1000 };
      if (addressHistory.until <= time) { addressHistory.count = 0; addressHistory.until = time + 15 * 60 * 1000; }
      if (addressHistory.count >= 32) { send(res, 429, { error: 'Please wait before trying again.' }); return true; }
      addressHistory.count += 1;
      addressAttempts.set(address, addressHistory);
      if (addressAttempts.size > 1000) addressAttempts.delete(addressAttempts.keys().next().value);
      const history = attempts.get(limitKey) || { count: 0, until: time + 15 * 60 * 1000 };
      if (history.until <= time) { history.count = 0; history.until = time + 15 * 60 * 1000; }
      if (history.count >= 8) { send(res, 429, { error: 'Please wait before trying again.' }); return true; }
      history.count += 1;
      attempts.set(limitKey, history);
      if (attempts.size > 1000) attempts.delete(attempts.keys().next().value);
      const candidate = config.accounts.find(a => a && typeof a.email === 'string' && a.email.toLowerCase() === email);
      const derived = await deriveKey(code, candidate?.salt || 'invalid-account-salt', 32);
      const expected = /^[a-f0-9]{64}$/i.test(candidate?.hash || '') ? Buffer.from(candidate.hash, 'hex') : Buffer.alloc(32);
      if (!validAccount(candidate, time) || !timingSafeEqual(derived, expected) || !Object.hasOwn(config.decks, candidate.deckId)) {
        send(res, 401, { error: 'Please check your access details.' }); return true;
      }
      attempts.delete(limitKey);
      sessions.delete(sessionKey);
      const nextToken = randomBytes(32).toString('base64url');
      sessions.set(digest(nextToken), { email, fingerprint: digest(candidate.hash + ':' + candidate.deckId), expiresAt: Math.min(time + sessionHours * 3600 * 1000, Date.parse(candidate.expiresAt)) });
      if (sessions.size > 500) sessions.delete(sessions.keys().next().value);
      res.setHeader('Set-Cookie', cookie(nextToken));
      send(res, 200, { ok: true }); return true;
    }
    send(res, 404, { error: 'Not found.' });
    return true;
  };
}
