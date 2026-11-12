import http from 'node:http';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createPresentationHandler } from './presentation-access.mjs';
import { createContactHandler } from './contact-delivery.mjs';

const dist = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const compressible = new Set(['.html', '.js', '.css', '.svg', '.json', '.xml', '.txt']);
const gzipCache = new Map();
const maxGzipEntries = 64;
const maxGzipBytes = 8 * 1024 * 1024;
const maxGzipEntryBytes = 1024 * 1024;
let gzipCacheBytes = 0;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const presentation = createPresentationHandler({ secureCookies: process.env.NODE_ENV === 'production' || process.argv.includes('--hosted') });
const contact = createContactHandler();

function acceptsGzip(value) {
  if (typeof value !== 'string') return false;
  const qualities = new Map();
  for (const item of value.split(',')) {
    const [token, ...parameters] = item.trim().split(';');
    const coding = token.trim().toLowerCase().replace(/^x-gzip$/, 'gzip');
    if (!['gzip', 'identity', '*'].includes(coding)) continue;
    let quality = 1;
    if (parameters.length) {
      const weight = parameters.length === 1 && /^q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i.exec(parameters[0].trim());
      quality = weight ? Number(weight[1]) : 0;
    }
    // A specific rejection must not become acceptable through a wildcard or
    // conflicting duplicate entry. Invalid weights cannot enable compression.
    qualities.set(coding, Math.min(qualities.get(coding) ?? 1, quality));
  }
  const quality = qualities.get('gzip') ?? qualities.get('*') ?? 0;
  return quality > 0 && quality >= (qualities.get('identity') ?? 0);
}

function packedContent(content) {
  // Hash the final bytes, including the local/hosted runtime marker rewrite.
  // A path or mtime alone could return another runtime's cached document.
  const key = createHash('sha256').update(content).digest('base64');
  const cached = gzipCache.get(key);
  if (cached) {
    gzipCache.delete(key);
    gzipCache.set(key, cached);
    return cached;
  }
  const packed = gzipSync(content, { level: 6 });
  if (packed.length <= maxGzipEntryBytes) {
    while (gzipCache.size >= maxGzipEntries || gzipCacheBytes + packed.length > maxGzipBytes) {
      const oldest = gzipCache.keys().next().value;
      gzipCacheBytes -= gzipCache.get(oldest).length;
      gzipCache.delete(oldest);
    }
    gzipCache.set(key, packed);
    gzipCacheBytes += packed.length;
  }
  return packed;
}

function sendStatic(req, res, status, content, extension, localApi) {
  if (!localApi && extension === '.html') content = Buffer.from(content.toString('utf8').replace('name="grama-runtime" content="local-api"', 'name="grama-runtime" content="static-preview"'));
  const headers = { 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600' };
  if (compressible.has(extension)) {
    const vary = String(res.getHeader('Vary') || '').split(',').map(value => value.trim()).filter(Boolean);
    if (!vary.some(value => ['*', 'accept-encoding'].includes(value.toLowerCase()))) vary.push('Accept-Encoding');
    headers.Vary = vary.join(', ');
    if (content.length > 1024 && acceptsGzip(req.headers['accept-encoding'])) {
      content = packedContent(content);
      headers['Content-Encoding'] = 'gzip';
    }
  }
  // HEAD negotiates exactly the same representation as GET, but sends no body.
  headers['Content-Length'] = content.length;
  res.writeHead(status, headers);
  return res.end(req.method === 'HEAD' ? undefined : content);
}

export async function serveWebsiteRequest(req, res, { localApi = false, contactHandler = contact } = {}) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    async function notFound() {
      try {
        const content = await readFile(resolve(dist, '404.html'));
        return sendStatic(req, res, 404, content, '.html', localApi);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(req.method === 'HEAD' ? undefined : 'Not found.');
      }
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); return res.end('Invalid request.'); }
    try { if (await contactHandler(req, res, pathname)) return; }
    catch { res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end('{"error":"Unable to send your enquiry. Please call Grama or try again later."}'); }
    try { if (await presentation(req, res, pathname)) return; }
    catch { res.writeHead(500, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end('{"error":"Unable to load private presentation."}'); }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end('Static preview only.'); }
    if (pathname === '/healthz') { res.writeHead(200); return res.end(req.method === 'HEAD' ? undefined : 'ok'); }
    // Only the explicit contact and presentation handlers expose server APIs.
    // Repository files and the local enquiry/OS APIs stay unavailable.
    if (pathname.split(/[\\/]/).some(part => part.startsWith('.')) || pathname.startsWith('/api/')) {
      return notFound();
    }
    let path = resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(dist + sep)) return notFound();
    try {
      const entry = await stat(path);
      if (entry.isDirectory()) path = resolve(path, 'index.html');
      else if (!entry.isFile()) return notFound();
      const content = await readFile(path);
      return sendStatic(req, res, path === resolve(dist, '404.html') ? 404 : 200, content, extname(path), localApi);
    } catch { return notFound(); }
}
export function createWebsiteServer(options = {}) {
  return http.createServer({ requestTimeout: 15000, headersTimeout: 10000, keepAliveTimeout: 5000, maxHeaderSize: 16384 }, (req, res) => serveWebsiteRequest(req, res, options));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 5174);
  const host = process.argv.includes('--hosted') ? '0.0.0.0' : '127.0.0.1';
  const server = createWebsiteServer();
  server.listen(port, host, () => console.log(`Static website preview on ${host}:${port}`));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}
