import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createWebsiteServer } from '../serve-website.mjs';
import { createContactHandler } from '../contact-delivery.mjs';

test('host delivers every supported enquiry through its narrow contact API without opening private routes', async t => {
  const sent = [];
  const origin = 'https://contact.example.invalid';
  const contactHandler = createContactHandler({
    getConfig: () => ({ enabled: true, apiKey: 're_synthetic_test_key', from: 'website@example.invalid', to: 'inbox@example.invalid', allowedOrigins: [origin] }),
    fetchImpl: async (url, options) => {
      sent.push({ url, options, body: JSON.parse(options.body) });
      return new Response(JSON.stringify({ id: randomUUID() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
  });
  const server = createWebsiteServer({ contactHandler });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = 'http://127.0.0.1:' + server.address().port;
  const status = await fetch(base + '/api/contact/status');
  assert.deepEqual(await status.json(), { enabled: true });
  assert.match(status.headers.get('cache-control'), /no-store/);
  const head = await fetch(base + '/api/contact/status', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');

  const scenarios = [['development', 'Investment partnership'], ['development', 'Development partnership'], ['development', 'Landowner opportunity'], ['home', 'Custom home'], ['home', 'Dexter Acres']];
  for (const [path, interest] of scenarios) {
    const id = randomUUID();
    const body = { name: 'Synthetic contact check', email: 'contact-check@example.invalid', phone: '', location: 'Synthetic location', timing: '', details: 'Synthetic contact scenario. No real lead.', path, interest, lot: interest === 'Dexter Acres' ? '4' : '', website: '', consent: true, submissionId: id };
    const response = await fetch(base + '/api/contact', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': id }, body: JSON.stringify(body) });
    assert.equal(response.status, 202, path + '/' + interest + ': ' + await response.clone().text());
    assert.deepEqual(await response.json(), { status: 'accepted', reference: id });
  }
  assert.equal(sent.length, scenarios.length);
  for (const item of sent) {
    assert.equal(item.url, 'https://api.resend.com/emails');
    assert.deepEqual(item.body.to, ['inbox@example.invalid']);
    assert.equal(item.body.from, 'website@example.invalid');
    assert.equal(item.body.reply_to, 'contact-check@example.invalid');
    assert.equal(item.body.html, undefined, 'Untrusted fields must not become HTML');
    assert.match(item.body.text, /Synthetic contact check/);
  }
  assert.match(sent.at(-1).body.text, /4/);
  assert.equal((await fetch(base + '/contact')).status, 200);
  assert.equal((await fetch(base + '/healthz')).status, 200);
  assert.equal((await fetch(base + '/presentation/api/deck')).status, 401);
  for (const path of ['/api/interest', '/api/contact/admin', '/scripts/contact-delivery.mjs', '/.env', '/.data/interest.jsonl', '/apps/development-os/launch.html']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
});

test('unconfigured deployed host advertises no delivery and cannot pretend to accept a lead', async t => {
  const server = createWebsiteServer({ contactHandler: createContactHandler({ getConfig: () => ({ enabled: false }) }) });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = 'http://127.0.0.1:' + server.address().port;
  assert.deepEqual(await (await fetch(base + '/api/contact/status')).json(), { enabled: false });
  const response = await fetch(base + '/api/contact', { method: 'POST', headers: { Origin: 'https://contact.example.invalid', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.status, undefined);
  assert.equal(body.reference, undefined);
  assert.ok(body.error);
});
