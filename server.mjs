import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname, sep } from 'node:path';
import { mkdir, appendFile, readFile, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const production = process.argv.includes('--production');
const port = Number(process.env.PORT || 5173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.json': 'application/json' };
const recent = new Map();
let vite;

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function validateInterest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Please complete the form.';
  if (input.website) return 'Unable to accept this submission.';
  if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.length > 100) return 'Please enter your name.';
  if (typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'Please enter a valid email address.';
  if (input.phone && (typeof input.phone !== 'string' || input.phone.length > 60)) return 'Please check the phone number.';
  const hasLot = input.lot !== undefined && input.lot !== null && input.lot !== '';
  if (hasLot && (!['string', 'number'].includes(typeof input.lot) || !Number.isInteger(Number(input.lot)) || Number(input.lot) < 1 || Number(input.lot) > 14)) return 'Please select a valid lot.';
  const path = input.path || 'home';
  if (!['home', 'development'].includes(path)) return 'Please select a consultation type.';
  const topics = path === 'home' ? ['Dexter Acres', 'Custom home'] : ['Landowner opportunity', 'Investment partnership', 'Development partnership'];
  const interest = input.interest || (path === 'home' ? 'Dexter Acres' : 'Development partnership');
  if (!topics.includes(interest)) return 'Please select a valid type of enquiry.';
  if (input.lot && (path !== 'home' || interest !== 'Dexter Acres')) return 'Lot selection is available for Dexter Acres enquiries.';
  for (const [field, limit] of [['location', 200], ['details', 2000]]) {
    if (input[field] && (typeof input[field] !== 'string' || input[field].length > limit)) return 'Please shorten the project information.';
  }
  if (input.timing && !['Within 6 months', '6–12 months', 'More than a year'].includes(input.timing)) return 'Please select a valid timeframe.';
  if (input.consent !== true) return 'Please confirm that Groma Development may contact you about this enquiry.';
  return null;
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'same-origin');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const url = new URL(request.url, 'http://localhost:' + port);
  try {
    if (/^\/(?:\.data|evidence)(?:\/|$)/.test(url.pathname)) return json(response, 403, { error: 'Private preview records are not public assets.' });
    if (url.pathname === '/api/health') return json(response, 200, { ok: true, mode: 'local-preview' });
    if (url.pathname === '/api/interest') {
      if (request.method !== 'POST') return json(response, 405, { error: 'Please use the enquiry form.' });
      const origin = request.headers.origin;
      if (origin && !['http://localhost:' + port, 'http://127.0.0.1:' + port].includes(origin)) return json(response, 403, { error: 'This preview accepts local enquiries only.' });
      if (!(request.headers['content-type'] || '').startsWith('application/json')) return json(response, 415, { error: 'Unsupported form format.' });
      let raw = '';
      for await (const chunk of request) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 12000) return json(response, 413, { error: 'Please shorten the enquiry.' });
      }
      let input;
      try { input = JSON.parse(raw); } catch { return json(response, 400, { error: 'Please check the form and try again.' }); }
      const error = validateInterest(input);
      if (error) return json(response, 400, { error });
      const key = input.email.trim().toLowerCase();
      if (recent.has(key) && Date.now() - recent.get(key) < 15000) return json(response, 429, { error: 'Your enquiry was just received. Please wait a moment.' });
      const path = input.path || 'home';
      const record = { id: randomUUID(), createdAt: new Date().toISOString(), name: input.name.trim(), email: key, phone: String(input.phone || '').trim(), path, lot: input.lot ? Number(input.lot) : null, interest: input.interest || (path === 'home' ? 'Dexter Acres' : 'Development partnership'), location: String(input.location || '').trim(), timing: input.timing || '', details: String(input.details || '').trim(), consent: true, source: 'localhost-preview' };
      await mkdir(resolve(root, '.data'), { recursive: true });
      await appendFile(resolve(root, '.data', 'interest.jsonl'), JSON.stringify(record) + '\n', { encoding: 'utf8', mode: 0o600 });
      recent.set(key, Date.now());
      if (recent.size > 500) recent.delete(recent.keys().next().value);
      return json(response, 201, { ok: true, id: record.id, mode: 'local-preview' });
    }
    if (url.pathname.startsWith('/api/')) return json(response, 404, { error: 'Not found.' });
    if (!production) return vite.middlewares(request, response);
    const { serveWebsiteRequest } = await import('./scripts/serve-website.mjs');
    return await serveWebsiteRequest(request, response, { localApi: true });
  } catch (error) {
    console.error('Request failed:', error.message);
    if (!response.headersSent) json(response, 500, { error: 'The local preview could not save your enquiry. Please try again.' });
  }
});

if (!production) {
  const { createServer } = await import('vite');
  vite = await createServer({ root, server: { middlewareMode: true, ws: { server } }, appType: 'spa' });
}
server.listen(port, '127.0.0.1', () => console.log('\nGroma Development private preview\nLocal: http://localhost:' + port + '\nPublic deployment: disabled\n'));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await vite?.close(); server.close(() => process.exit(0)); });
