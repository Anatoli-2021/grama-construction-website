import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createPresentationHandler } from './presentation-access.mjs';
import { createContactHandler } from './contact-delivery.mjs';

const dist = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const presentation = createPresentationHandler({ secureCookies: process.env.NODE_ENV === 'production' || process.argv.includes('--hosted') });
const contact = createContactHandler();

// Only single byte ranges are needed by the native MP4 player. Parse bounds
// before converting to Number so oversized header values cannot wrap or round.
function videoRange(value, length) {
  const match = typeof value === 'string' && /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2]) || length === 0) return null;
  const total = BigInt(length);
  if (!match[1]) {
    const suffix = BigInt(match[2]);
    if (suffix === 0n) return null;
    return { start: Number(suffix >= total ? 0n : total - suffix), end: length - 1 };
  }
  const start = BigInt(match[1]);
  const end = match[2] ? BigInt(match[2]) : total - 1n;
  if (start >= total || end < start) return null;
  return { start: Number(start), end: Number(end >= total ? total - 1n : end) };
}

export async function serveWebsiteRequest(req, res, { localApi = false, contactHandler = contact } = {}) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    async function notFound() {
      try {
        const content = await readFile(resolve(dist, '404.html'));
        res.writeHead(404, { 'Content-Type': types['.html'], 'Cache-Control': 'no-cache', 'Content-Length': content.length });
        return res.end(req.method === 'HEAD' ? undefined : content);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(req.method === 'HEAD' ? undefined : 'Not found.');
      }
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); return res.end('Invalid request.'); }
    try { if (await contactHandler(req, res, pathname)) return; }
    catch { res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end('{"error":"Unable to send your enquiry. Please call Grama Development or try again later."}'); }
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
      let content = await readFile(path);
      if (!localApi && path.endsWith('.html')) content = Buffer.from(content.toString('utf8').replace('name="grama-runtime" content="local-api"', 'name="grama-runtime" content="static-preview"'));
      const headers = { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': path.endsWith('.html') ? 'no-cache' : 'public, max-age=3600', 'Content-Length': content.length };
      if (extname(path) === '.mp4') {
        headers['Accept-Ranges'] = 'bytes';
        // Range applies to GET only. Without entity validators, an If-Range
        // request receives the full representation instead of a stale slice.
        if (req.method === 'GET' && req.headers.range !== undefined && req.headers['if-range'] === undefined) {
          const range = videoRange(req.headers.range, content.length);
          if (!range) {
            res.writeHead(416, { ...headers, 'Cache-Control': 'no-store', 'Content-Range': `bytes */${content.length}`, 'Content-Length': 0 });
            return res.end();
          }
          headers['Content-Range'] = `bytes ${range.start}-${range.end}/${content.length}`;
          headers['Content-Length'] = range.end - range.start + 1;
          res.writeHead(206, headers);
          return res.end(content.subarray(range.start, range.end + 1));
        }
      }
      res.writeHead(path === resolve(dist, '404.html') ? 404 : 200, headers);
      res.end(req.method === 'HEAD' ? undefined : content);
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
