import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { createWebsiteServer } from '../serve-website.mjs';
import { siteRoutes, previewOrigin } from '../../src/site-routes.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const text = value => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

test('every public route has distinct prerendered content and metadata without JavaScript', async t => {
  const server = createWebsiteServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  const headings = new Set();
  for (const route of siteRoutes) {
    await t.test(route.path, async () => {
      const response = await fetch(base + route.path);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^text\/html/);
      assert.equal(response.headers.get('cache-control'), 'no-cache');
      const html = await response.text();
      assert.equal(text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ''), route.title);
      const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
      assert.equal(h1s.length, 1, 'Each document must have one prerendered page heading');
      const heading = text(h1s[0][1]);
      assert.ok(heading.length > 3, 'Page heading must exist before client JavaScript runs');
      assert.ok(!headings.has(heading), 'A deep route must not fall back to the homepage content');
      headings.add(heading);
      const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
      assert.equal(text(description || ''), route.description);
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
      const canonical = new URL(route.path, process.env.SITE_URL || previewOrigin).href;
      assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
      assert.ok(html.includes(`property="og:url" content="${canonical}"`));
      assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
      const imageUrl = html.match(/property="og:image" content="([^"]+)"/)?.[1];
      assert.ok(imageUrl);
      assert.equal((await fetch(base + new URL(imageUrl).pathname, { method: 'HEAD' })).status, 200, 'Sharing image must be a real built asset');
      if (route.path === '/contact') {
        assert.match(html, /<fieldset[^>]*\bdisabled(?:=|\s|>)/, 'Draft controls remain disabled until client JavaScript is ready');
        assert.match(html, /<noscript>/, 'No-JavaScript visitors receive an honest contact alternative');
      }
      const head = await fetch(base + route.path, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
    });
  }
  for (const path of ['/about/', '/about/index.html', '/projects/?view=completed']) {
    assert.equal((await fetch(base + path)).status, 200, path);
  }
});

test('unknown, private and source URLs remain true 404s instead of SPA fallbacks', async t => {
  const server = createWebsiteServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  for (const path of ['/missing-page', '/projects/not-a-real-project', '/404', '/404.html', '/src/App.jsx', '/server.mjs', '/scripts/build-pages.mjs', '/apps/development-os/launch.html', '/.data/interest.jsonl', '/.env', '/api/interest', '/assets/%2e%2e%2f%2e%2e%2fpackage.json']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
    const html = await response.text();
    assert.match(html, /<h1(?:\s|>)/, 'A useful not-found document is returned');
    assert.match(html, /Page Not Found/);
  }
  const head = await fetch(base + '/missing-page', { method: 'HEAD' });
  assert.equal(head.status, 404);
  assert.equal(await head.text(), '');
  assert.equal((await fetch(base + '/about', { method: 'POST', body: '{}' })).status, 405);
});

test('local production preview resolves the same deep pages and rejects unknown pages', async t => {
  const probe = createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ['server.mjs', '--production'], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([once(child, 'exit'), delay(3000)]);
      if (child.exitCode === null) child.kill('SIGKILL');
    }
  });
  const base = 'http://127.0.0.1:' + port;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) break;
    try { ready = (await fetch(base + '/api/health')).status === 200; } catch {}
    if (ready) break;
    await delay(100);
  }
  assert.ok(ready, 'Local production preview must start: ' + output);
  for (const route of siteRoutes) assert.equal((await fetch(base + route.path)).status, 200, route.path);
  assert.equal((await fetch(base + '/about/')).status, 200);
  assert.equal((await fetch(base + '/projects/not-a-real-project')).status, 404);
  assert.equal((await fetch(base + '/not-a-built-file.js')).status, 404);
});
