import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { gunzipSync } from 'node:zlib';
import { readFile, readdir } from 'node:fs/promises';
import { createWebsiteServer, serveWebsiteRequest } from '../serve-website.mjs';
import { createContactHandler } from '../contact-delivery.mjs';

const dist = new URL('../../dist/', import.meta.url);
const disabledContact = () => createContactHandler({ getConfig: () => ({ enabled: false }) });

async function host(t, options = {}) {
  const server = createWebsiteServer({ contactHandler: disabledContact(), ...options });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  return 'http://127.0.0.1:' + server.address().port;
}

function request(base, path, { method = 'GET', encoding, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const outgoing = http.request(base + path, { method, headers: { ...(encoding === undefined ? {} : { 'Accept-Encoding': encoding }), ...headers } }, incoming => {
      const chunks = [];
      incoming.on('data', chunk => chunks.push(chunk));
      incoming.on('error', reject);
      incoming.on('end', () => resolve({ status: incoming.statusCode, headers: incoming.headers, body: Buffer.concat(chunks) }));
    });
    outgoing.on('error', reject);
    outgoing.end();
  });
}

async function entryAssets() {
  const html = await readFile(new URL('index.html', dist), 'utf8');
  const js = html.match(/<script\b[^>]*\bsrc="([^"]+\.js)"/)?.[1];
  const css = html.match(/<link\b[^>]*\bhref="([^"]+\.css)"/)?.[1];
  assert.ok(js && css, 'The real build must include its JS and CSS entry assets');
  return [js, css];
}

test('HTML, JavaScript and CSS are valid gzip representations with correct wire lengths and HEAD metadata', async t => {
  const base = await host(t);
  for (const path of ['/', '/about', ...await entryAssets()]) {
    const identity = await request(base, path);
    assert.equal(identity.status, 200, path);
    assert.equal(identity.headers['content-encoding'], undefined);
    assert.equal(Number(identity.headers['content-length']), identity.body.length);
    assert.ok(identity.body.length > 1024, 'Exercise a response large enough for compression');
    const gzip = await request(base, path, { encoding: 'gzip' });
    assert.equal(gzip.status, 200, path);
    assert.equal(gzip.headers['content-encoding'], 'gzip');
    assert.match(gzip.headers.vary, /(?:^|,\s*)Accept-Encoding(?:,|$)/i);
    assert.equal(gzip.headers['content-type'], identity.headers['content-type']);
    assert.equal(gzip.headers['cache-control'], identity.headers['cache-control']);
    assert.equal(Number(gzip.headers['content-length']), gzip.body.length);
    assert.deepEqual(gunzipSync(gzip.body), identity.body, path);
    assert.ok(gzip.body.length < identity.body.length, 'The actual build asset should transfer fewer bytes');
    const head = await request(base, path, { method: 'HEAD', encoding: 'gzip' });
    assert.equal(head.status, 200);
    assert.equal(head.headers['content-encoding'], 'gzip');
    assert.equal(head.headers['content-length'], gzip.headers['content-length']);
    assert.equal(head.headers.vary, gzip.headers.vary);
    assert.equal(head.body.length, 0);
  }
});

test('quality weights, explicit refusals, case and whitespace control encoding selection', async t => {
  const base = await host(t);
  const plain = await request(base, '/about');
  const identityPreferences = [
    undefined, '', 'identity', 'br', 'gzip;q=0', 'GZIP ; Q = 0.000',
    'gzip;q=0, *;q=1', '*;q=1, gzip;q=0', 'gzip;q=0, x-gzip;q=1',
    'gzip;q=0.2, identity;q=0.8', 'gzip;q=invalid', 'gzip;q=1.1', 'gzip;q=0.0001',
  ];
  for (const encoding of identityPreferences) {
    const response = await request(base, '/about', { encoding });
    assert.equal(response.status, 200, String(encoding));
    assert.equal(response.headers['content-encoding'], undefined, String(encoding));
    assert.deepEqual(response.body, plain.body, String(encoding));
    assert.match(response.headers.vary, /Accept-Encoding/i);
    const head = await request(base, '/about', { method: 'HEAD', encoding });
    assert.equal(head.headers['content-encoding'], undefined);
    assert.equal(head.headers['content-length'], response.headers['content-length']);
    assert.equal(head.body.length, 0);
  }
  for (const encoding of ['GZIP', ' br ; q=1 , GZip ; Q = 0.500 ', 'gzip;q=0.001', '*;q=0.5', 'gzip;q=1.000, identity;q=0.5', 'x-gzip']) {
    const response = await request(base, '/about', { encoding });
    assert.equal(response.headers['content-encoding'], 'gzip', encoding);
    assert.deepEqual(gunzipSync(response.body), plain.body, encoding);
  }
});

test('binary photos, film and font assets retain their original bytes and no transfer encoding', async t => {
  const base = await host(t);
  const files = await readdir(new URL('assets/', dist));
  const binary = [];
  for (const extension of ['.webp', '.mp4', '.ttf', '.woff2']) {
    const file = files.find(file => file.endsWith(extension));
    if (file) binary.push(file);
  }
  assert.ok(binary.some(file => file.endsWith('.webp')), 'Exercise a real project photograph');
  assert.ok(binary.some(file => /\.(?:ttf|woff2)$/.test(file)), 'Exercise an actual font');
  for (const file of binary) {
    const expected = await readFile(new URL('assets/' + file, dist));
    const response = await request(base, '/assets/' + file, { encoding: 'gzip, *;q=1' });
    assert.equal(response.status, 200, file);
    assert.equal(response.headers['content-encoding'], undefined, file);
    assert.equal(response.headers.vary, undefined, file);
    assert.equal(Number(response.headers['content-length']), expected.length);
    assert.deepEqual(response.body, expected);
  }
});

test('the shared gzip cache keeps hosted and local runtime markers separate in either request order', async t => {
  const hosted = await host(t);
  const local = await host(t, { localApi: true });
  for (const path of ['/contact', '/about']) {
    for (const [base, marker] of [[hosted, 'static-preview'], [local, 'local-api'], [local, 'local-api'], [hosted, 'static-preview']]) {
      const response = await request(base, path, { encoding: 'gzip' });
      assert.equal(response.status, 200);
      const body = gunzipSync(response.body).toString('utf8');
      assert.ok(body.includes(`name="grama-runtime" content="${marker}"`));
      assert.ok(!body.includes(`name="grama-runtime" content="${marker === 'local-api' ? 'static-preview' : 'local-api'}"`));
      assert.match(body, /<meta name="robots" content="noindex, nofollow"/);
      assert.equal(response.headers['x-robots-tag'], 'noindex, nofollow');
    }
  }
});

test('vary headers are extended without losing an existing cache dimension', async t => {
  const server = http.createServer((req, res) => {
    res.setHeader('Vary', 'Origin');
    return serveWebsiteRequest(req, res, { contactHandler: disabledContact() });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await request(base, '/about', { encoding: 'gzip' });
  assert.deepEqual(response.headers.vary.split(/,\s*/), ['Origin', 'Accept-Encoding']);
  assert.equal(response.headers['content-encoding'], 'gzip');
});

test('compression preserves 404, contact readiness and private presentation boundaries', async t => {
  const base = await host(t);
  for (const path of ['/missing-page', '/src/App.jsx', '/scripts/contact-delivery.mjs', '/.env', '/.data/interest.jsonl', '/api/interest', '/apps/development-os/launch.html']) {
    const response = await request(base, path, { encoding: 'gzip' });
    assert.equal(response.status, 404, path);
    const body = (response.headers['content-encoding'] === 'gzip' ? gunzipSync(response.body) : response.body).toString('utf8');
    assert.match(body, /Page Not Found/);
    assert.ok(!body.includes('RESEND_API_KEY'));
  }
  const status = await request(base, '/api/contact/status', { encoding: 'gzip' });
  assert.equal(status.status, 200);
  assert.deepEqual(JSON.parse(status.body), { enabled: false });
  assert.equal(status.headers['content-encoding'], undefined);
  assert.equal(status.headers['cache-control'], 'no-store');
  const deck = await request(base, '/presentation/api/deck', { encoding: 'gzip' });
  assert.equal(deck.status, 401);
  assert.equal(deck.headers['content-encoding'], undefined);
  assert.match(deck.headers['cache-control'], /no-store/);
  assert.equal(deck.headers.vary, 'Cookie');
  assert.equal((await request(base, '/healthz', { encoding: 'gzip' })).body.toString(), 'ok');
});
