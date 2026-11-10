import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWebsiteServer } from '../serve-website.mjs';

test('website host health is available and source/private/API paths stay inaccessible', async t => {
  const server = createWebsiteServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  assert.equal((await fetch(base + '/healthz')).status, 200);
  const page = await fetch(base + '/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Dexter Acres/);
  const media = await fetch(base + '/assets/residence.webp', { method: 'HEAD' });
  assert.equal(media.status, 200);
  assert.equal(media.headers.get('content-type'), 'image/webp');
  for (const route of ['/apps/development-os/launch.html', '/.data/interest.jsonl', '/.env', '/package.json', '/api/interest', '/assets/%2e%2e%2f%2e%2e%2fpackage.json']) assert.equal((await fetch(base + route)).status, 404, route);
  assert.equal((await fetch(base + '/api/interest', { method: 'POST', body: '{}' })).status, 405);
});
