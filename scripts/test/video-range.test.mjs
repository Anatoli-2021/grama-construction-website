import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWebsiteServer } from '../serve-website.mjs';

const film = await readFile(new URL('../../dist/assets/residence-film.mp4', import.meta.url));

async function fixture(t) {
  const server = createWebsiteServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return 'http://127.0.0.1:' + server.address().port;
}

test('native MP4 playback preserves full GET and HEAD responses', async t => {
  const base = await fixture(t);
  const full = await fetch(base + '/assets/residence-film.mp4');
  assert.equal(full.status, 200);
  assert.equal(full.headers.get('content-type'), 'video/mp4');
  assert.equal(full.headers.get('accept-ranges'), 'bytes');
  assert.equal(Number(full.headers.get('content-length')), film.length);
  assert.deepEqual(Buffer.from(await full.arrayBuffer()), film);

  const head = await fetch(base + '/assets/residence-film.mp4', { method: 'HEAD', headers: { Range: 'bytes=0-15' } });
  assert.equal(head.status, 200, 'Range does not alter HEAD');
  assert.equal(head.headers.get('content-range'), null);
  assert.equal(Number(head.headers.get('content-length')), film.length);
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  const uncertain = await fetch(base + '/assets/residence-film.mp4', { headers: { Range: 'bytes=0-15', 'If-Range': '"unknown-validator"' } });
  assert.equal(uncertain.status, 200, 'An unvalidated If-Range receives the full representation');
  assert.equal(uncertain.headers.get('content-range'), null);
  assert.deepEqual(Buffer.from(await uncertain.arrayBuffer()), film);
});

test('single MP4 byte ranges return the exact requested data and metadata', async t => {
  const base = await fixture(t);
  const ranges = [
    ['bytes=0-15', 0, 15],
    ['bytes=16-', 16, film.length - 1],
    ['bytes=-17', film.length - 17, film.length - 1],
    [`bytes=0-${film.length + 1000}`, 0, film.length - 1],
    [`bytes=-${film.length + 1000}`, 0, film.length - 1],
    ['bytes=001-003', 1, 3],
    ['bytes=10-' + '9'.repeat(60), 10, film.length - 1],
  ];
  for (const [range, start, end] of ranges) {
    const response = await fetch(base + '/assets/residence-film.mp4', { headers: { Range: range } });
    assert.equal(response.status, 206, range);
    assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/${film.length}`);
    assert.equal(response.headers.get('accept-ranges'), 'bytes');
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(Number(response.headers.get('content-length')), end - start + 1);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), film.subarray(start, end + 1), range);
  }
});

test('malformed, unsupported and unsatisfiable MP4 ranges fail without a body', async t => {
  const base = await fixture(t);
  for (const range of ['bytes=', 'bytes=-', 'bytes=-0', 'bytes=10-9', `bytes=${film.length}-`, 'bytes=999999999999999999999999999999-', 'bytes=0-1,3-4', 'items=0-10', 'bytes=one-two', 'bytes=0--1', 'bytes=-1-2', 'bytes= 0-15']) {
    const response = await fetch(base + '/assets/residence-film.mp4', { headers: { Range: range } });
    assert.equal(response.status, 416, range);
    assert.equal(response.headers.get('content-range'), `bytes */${film.length}`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(Number(response.headers.get('content-length')), 0);
    assert.equal((await response.arrayBuffer()).byteLength, 0);
  }
});

test('video range handling leaves other assets, methods and private boundaries unchanged', async t => {
  const base = await fixture(t);
  const image = await fetch(base + '/assets/residence.webp', { headers: { Range: 'bytes=0-15' } });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/webp');
  assert.equal(image.headers.get('content-range'), null);
  await image.body.cancel();
  assert.equal((await fetch(base + '/assets/residence-film.mp4', { method: 'POST', headers: { Range: 'bytes=0-15' } })).status, 405);
  for (const path of ['/.env', '/src/App.jsx', '/apps/development-os/launch.html', '/api/interest']) {
    const response = await fetch(base + path, { headers: { Range: 'bytes=0-15' } });
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get('content-range'), null);
    await response.body.cancel();
  }
});
