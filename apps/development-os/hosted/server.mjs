import http from 'node:http';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createGoogleAuth, GOOGLE_ISSUER } from './google-auth.mjs';

const SESSION_COOKIE = '__Secure-GramaOS';
const FLOW_COOKIE = '__Secure-GramaOSFlow';
const TTL = 60 * 60 * 1000;
const FLOW_TTL = 5 * 60 * 1000;
const token = () => randomBytes(32).toString('base64url');
const hash = value => createHash('sha256').update(value).digest('hex');
function equal(a, b) {
  return typeof a === 'string' && typeof b === 'string' &&
    a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
function cookie(req, name) {
  const values = String(req.headers.cookie || '').split(';')
    .map(x => x.trim()).filter(x => x.startsWith(name + '='))
    .map(x => x.slice(name.length + 1));
  return values.length === 1 && /^[A-Za-z0-9_-]{43}$/.test(values[0]) ? values[0] : null;
}
function setCookie(res, name, value, age, path) {
  const field = name + '=' + value + '; Path=' + path +
    '; HttpOnly; Secure; SameSite=Lax; Max-Age=' + age;
  const previous = res.getHeader('Set-Cookie') || [];
  res.setHeader('Set-Cookie', [...previous, field]);
}
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

export function readHostConfig(env = process.env) {
  const required = ['OS_PUBLIC_ORIGIN', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'OS_OWNER_EMAIL'];
  const missing = required.filter(name => !env[name]?.trim());
  if (missing.length) throw new Error('Missing configuration: ' + missing.join(', '));
  const origin = new URL(env.OS_PUBLIC_ORIGIN);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
  if ((origin.protocol !== 'https:' && !(local && origin.protocol === 'http:')) ||
      origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('OS_PUBLIC_ORIGIN must be an HTTPS origin (HTTP loopback only for local tests).');
  }
  if (env.OS_DATA_MODE !== 'synthetic') throw new Error('Only synthetic staging data is supported.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.OS_OWNER_EMAIL)) throw new Error('Invalid owner account.');
  const projectIds = (env.OS_ALLOWED_PROJECTS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (projectIds.some(x => !/^[A-Za-z0-9_-]{1,80}$/.test(x))) throw new Error('Invalid project scope.');
  return Object.freeze({
    origin: origin.origin,
    clientId: env.GOOGLE_CLIENT_ID.trim(),
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    ownerEmail: env.OS_OWNER_EMAIL.trim().toLowerCase(),
    ownerSubject: env.OS_OWNER_SUBJECT?.trim() || null,
    projectIds: Object.freeze([...new Set(projectIds)]),
    version: /^[A-Za-z0-9._-]{1,80}$/.test(env.OS_RELEASE || '') ? env.OS_RELEASE : 'unreleased',
    dataMode: 'synthetic',
  });
}

// Same application auth boundary for pages and APIs. This candidate serves only
// a login screen and explicitly scoped synthetic metadata, not Claude's UI.
// Options are dependency-injection seams for tests, not runtime HTTP/env toggles.
export function createOsHost(config, options = {}) {
  const auth = options.auth || createGoogleAuth(config);
  const now = options.now || Date.now;
  const projects = options.projects || [
    { id: 'DEMO-OS-001', title: 'Synthetic staging project', synthetic: true },
  ];
  if (projects.some(p => p.synthetic !== true)) throw new Error('Real data is not supported by this staging candidate.');
  const sessions = new Map(), transactions = new Map(), rate = new Map();
  function prune(map) {
    for (const [key, value] of map) if (value.expires <= now()) map.delete(key);
  }
  function principal(claims) {
    if (!claims || claims.iss !== GOOGLE_ISSUER || typeof claims.sub !== 'string' || !claims.sub ||
        claims.email_verified !== true || typeof claims.email !== 'string' ||
        claims.email.toLowerCase() !== config.ownerEmail ||
        (config.ownerSubject && claims.sub !== config.ownerSubject)) return null;
    return { issuer: claims.iss, subject: claims.sub, role: 'owner' };
  }
  function session(req) {
    prune(sessions);
    const raw = cookie(req, SESSION_COOKIE);
    return raw ? sessions.get(hash(raw)) : null;
  }
  const server = http.createServer({ maxHeaderSize: 8192, requestTimeout: 10000, headersTimeout: 10000 },
    async (req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      try {
        const url = new URL(req.url, config.origin);
        if (url.origin !== config.origin) return json(res, 400, { error: 'Invalid request origin.' });
        if (url.pathname === '/healthz' && req.method === 'GET') {
          return json(res, 200, { ok: true, release: config.version, dataMode: 'synthetic', uiIntegrated: false });
        }
        if (req.headers.host !== new URL(config.origin).host) return json(res, 403, { error: 'Unexpected host.' });
        if (Number(req.headers['content-length'] || 0) > 4096) return json(res, 413, { error: 'Request too large.' });
        if (url.pathname === '/platform/auth/start' && req.method === 'GET') {
          prune(transactions); prune(rate);
          const key = req.socket.remoteAddress;
          const limit = rate.get(key) || { count: 0, expires: now() + 60000 };
          if (++limit.count > 20 || rate.size >= 1000 || transactions.size >= 1000) {
            return json(res, 429, { error: 'Try again later.' });
          }
          rate.set(key, limit);
          const raw = token();
          const flow = { state: token(), nonce: token(), verifier: token(), expires: now() + FLOW_TTL };
          const target = await auth.authorizationURL(flow);
          if (target.protocol !== 'https:' || target.hostname !== 'accounts.google.com') {
            throw new Error('Unexpected identity provider.');
          }
          transactions.set(hash(raw), flow);
          setCookie(res, FLOW_COOKIE, raw, FLOW_TTL / 1000, '/platform/auth');
          res.writeHead(302, { Location: target.href }); return res.end();
        }
        if (url.pathname === '/platform/auth/callback' && req.method === 'GET') {
          prune(transactions);
          const raw = cookie(req, FLOW_COOKIE), flow = raw && transactions.get(hash(raw));
          if (raw) transactions.delete(hash(raw));
          setCookie(res, FLOW_COOKIE, '', 0, '/platform/auth');
          if (!flow || url.searchParams.getAll('state').length !== 1 ||
              !equal(url.searchParams.get('state'), flow.state) ||
              url.searchParams.getAll('code').length !== 1) {
            return json(res, 401, { error: 'Login expired or invalid.' });
          }
          const identity = principal(await auth.claimsFromCallback(url, flow));
          if (!identity) return json(res, 403, { error: 'Account is not allowed.' });
          prune(sessions);
          if (sessions.size >= 1000) return json(res, 503, { error: 'Session capacity reached.' });
          const old = cookie(req, SESSION_COOKIE);
          if (old) sessions.delete(hash(old));
          const sid = token();
          sessions.set(hash(sid), { identity, csrf: token(), expires: now() + TTL });
          setCookie(res, SESSION_COOKIE, sid, TTL / 1000, '/platform');
          res.writeHead(302, { Location: config.origin + '/platform/' }); return res.end();
        }
        const current = session(req);
        if (url.pathname === '/platform/' && req.method === 'GET' && !current) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end('<!doctype html><title>Grama OS private staging</title><h1>Grama OS</h1><p>Synthetic staging candidate. Owner access only.</p><a href="/platform/auth/start">Sign in with Google</a>');
        }
        if (!url.pathname.startsWith('/platform/')) return json(res, 404, { error: 'Not found.' });
        if (!current) return json(res, 401, { error: 'Sign-in required.' });
        if (url.pathname === '/platform/auth/logout' && req.method === 'POST') {
          if (req.headers.origin !== config.origin || !equal(req.headers['x-grama-csrf'], current.csrf)) {
            return json(res, 403, { error: 'Invalid request.' });
          }
          sessions.delete(hash(cookie(req, SESSION_COOKIE)));
          setCookie(res, SESSION_COOKIE, '', 0, '/platform');
          return json(res, 200, { ok: true });
        }
        if (req.method !== 'GET') return json(res, 405, { error: 'Read-only staging.' });
        if (url.pathname === '/platform/api/session') {
          return json(res, 200, { identity: current.identity, csrf: current.csrf, dataMode: 'synthetic' });
        }
        const scoped = p => p.synthetic === true && config.projectIds.includes(p.id);
        const metadata = p => ({ id: p.id, title: p.title, synthetic: true });
        if (url.pathname === '/platform/api/projects') {
          return json(res, 200, { projects: projects.filter(scoped).map(metadata), dataMode: 'synthetic' });
        }
        const match = url.pathname.match(/^\/platform\/api\/projects\/([A-Za-z0-9_-]{1,80})$/);
        if (match) {
          const project = projects.find(p => p.id === match[1] && scoped(p));
          return project ? json(res, 200, { project: metadata(project), dataMode: 'synthetic' }) :
            json(res, 404, { error: 'Not found.' });
        }
        if (url.pathname === '/platform/') return json(res, 503, { error: 'Reviewed UI integration is pending.', dataMode: 'synthetic' });
        return json(res, 404, { error: 'Not found.' });
      } catch {
        // No callback URLs, auth codes, claims or tokens in logs/responses.
        if (!res.headersSent) json(res, 401, { error: 'Authentication or request failed.' });
        else res.end();
      }
    });
  server.keepAliveTimeout = 5000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const config = readHostConfig();
    const bind = process.env.OS_BIND_HOST || '127.0.0.1';
    if (!['127.0.0.1', '0.0.0.0'].includes(bind)) throw new Error('Unsupported bind address.');
    const port = Number(process.env.PORT || 5190);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
    const server = createOsHost(config);
    server.listen(port, bind, () => console.log('Synthetic OS authentication candidate started; reviewed UI integration pending.'));
    server.on('error', () => { console.error('OS host could not start.'); process.exitCode = 1; });
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
  } catch (error) {
    console.error(error.message.startsWith('Missing configuration:') ? error.message : 'Invalid OS staging configuration.');
    process.exitCode = 1;
  }
}
