import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOsServer } from '../server.mjs';
import { request } from 'node:http';

test('OS exposes only local blank-tool routes and rejects writes/private records', async t => {
  const server = createOsServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  for (const route of ['/', '/launch.html', '/launch-template.json', '/src/form.mjs', '/src/launch.mjs', '/packages/shared/project-id.mjs']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('content-security-policy'), /connect-src 'none'/);
  }
  for (const route of ['/Tony%20Dashboard.html', '/.env', '/private-data/pilot.json', '/src/../../../package.json', '/api/projects']) assert.equal((await fetch(base + route)).status, 404, route);
  assert.equal((await fetch(base + '/launch.html', { method: 'POST', body: '{}' })).status, 405);
  const status = await new Promise((resolve, reject) => {
    const req = request(base, { headers: { Host: 'untrusted.example' } }, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(status, 403, 'DNS rebinding Host must be rejected');
  assert.equal(server.address().address, '127.0.0.1');
});
