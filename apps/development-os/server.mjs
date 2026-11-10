import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Explicit routes only. No dashboard snapshots, filesystem browsing or data API.
const routes = new Map([
  ['/', ['index.html', 'text/html']],
  ['/launch.html', ['launch.html', 'text/html']],
  ['/launch-template.json', ['launch-template.json', 'application/json']],
  ['/src/launch.mjs', ['src/launch.mjs', 'text/javascript']],
  ['/src/form.mjs', ['src/form.mjs', 'text/javascript']],
  ['/packages/shared/project-id.mjs', ['../../packages/shared/project-id.mjs', 'text/javascript']],
]);

export function createOsServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; form-action 'none'; frame-ancestors 'none'; base-uri 'none'");
    const host = String(req.headers.host || '');
    if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) {
      res.writeHead(403); return res.end('Local access only.');
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end('Read-only local tool.');
    }
    let route;
    try { route = routes.get(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); return res.end('Invalid request.'); }
    if (!route) { res.writeHead(404); return res.end('Not found.'); }
    try {
      const content = await readFile(new URL(route[0], import.meta.url));
      res.writeHead(200, { 'Content-Type': route[1] + '; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch { res.writeHead(500); res.end('Unable to load local tool.'); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.OS_PORT || 5180);
  const server = createOsServer();
  server.listen(port, '127.0.0.1', () => console.log(`Development OS local draft tool: http://localhost:${port}\nLoopback only. No live records or external integrations.`));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}
