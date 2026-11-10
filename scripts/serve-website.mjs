import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dist = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
export async function serveWebsiteRequest(req, res) {
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
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end('Static preview only.'); }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); return res.end('Invalid request.'); }
    if (pathname === '/healthz') { res.writeHead(200); return res.end(req.method === 'HEAD' ? undefined : 'ok'); }
    // Website deployment serves only the build, never repository files or APIs.
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
      res.writeHead(path === resolve(dist, '404.html') ? 404 : 200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': path.endsWith('.html') ? 'no-cache' : 'public, max-age=3600', 'Content-Length': content.length });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch { return notFound(); }
}
export function createWebsiteServer() {
  return http.createServer(serveWebsiteRequest);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 5174);
  const host = process.argv.includes('--hosted') ? '0.0.0.0' : '127.0.0.1';
  const server = createWebsiteServer();
  server.listen(port, host, () => console.log(`Static website preview on ${host}:${port}`));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}
