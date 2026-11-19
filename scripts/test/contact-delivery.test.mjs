import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { createContactHandler, environmentContactConfig } from '../contact-delivery.mjs';

const origin = 'https://grama.example.com';
const config = { enabled: true, apiKey: 're_synthetic_only', from: 'website@notifications.example.com', to: 'approved@example.com', allowedOrigins: [origin] };
const providerId = '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794';
const accepted = () => ({ ok: true, json: async () => ({ id: providerId }) });
const input = (overrides = {}) => ({ submissionId: randomUUID(), name: 'Synthetic Person', email: 'person@example.com', phone: '', location: '', details: 'Synthetic project details', path: 'development', interest: 'Development partnership', lot: '', timing: '', consent: true, website: '', ...overrides });

function fixture(options = {}) {
  const sends = [];
  const handler = createContactHandler({
    getConfig: () => config,
    fetchImpl: async (url, options) => { sends.push({ url, ...options }); return accepted(); },
    addressLimit: 1000,
    globalLimit: 1000,
    ...options,
  });
  return { handler, sends };
}

async function invoke(handler, { pathname = '/api/contact', method = 'POST', data = input(), raw, headers = {}, address = '127.0.0.1', stream } = {}) {
  const req = stream || Readable.from([raw ?? JSON.stringify(data)]);
  req.method = method;
  req.headers = { origin, 'content-type': 'application/json', 'idempotency-key': data?.submissionId, ...headers };
  req.socket = { remoteAddress: address };
  const res = {
    status: null, headers: {}, body: undefined,
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(body) { this.body = body; },
  };
  const handled = await handler(req, res, pathname);
  return { ...res, handled, json: res.body ? JSON.parse(res.body) : undefined };
}

test('contact handler leaves unrelated static, presentation and local API paths untouched', async () => {
  const { handler, sends } = fixture();
  for (const pathname of ['/contact', '/api/interest', '/presentation/api/login', '/api/contact/extra']) {
    const response = await invoke(handler, { pathname });
    assert.equal(response.handled, false);
    assert.equal(response.status, null);
  }
  assert.equal(sends.length, 0);
});

test('status discloses only readiness and supports HEAD without a response body', async () => {
  const { handler } = fixture();
  const get = await invoke(handler, { pathname: '/api/contact/status', method: 'GET' });
  assert.deepEqual(get.json, { enabled: true });
  assert.equal(get.headers['Cache-Control'], 'no-store');
  assert.ok(!get.body.includes(config.to));
  assert.ok(!get.body.includes(config.apiKey));
  const head = await invoke(handler, { pathname: '/api/contact/status', method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.body, undefined);
  assert.equal(head.headers['Content-Length'], get.headers['Content-Length']);
});

test('missing, malformed or disabled configuration fails closed before reading personal data', async () => {
  const invalid = [null, {}, { ...config, enabled: false }, { ...config, enabled: 'true' }, { ...config, apiKey: '' },
    { ...config, from: 'Name <website@example.com>' }, { ...config, from: 'a@example.com\r\nBcc:b@example.com' },
    { ...config, to: 'a@example.com,b@example.com' }, { ...config, to: 'bad..local@example.com' },
    { ...config, allowedOrigins: [] }, { ...config, allowedOrigins: [origin + '/'] },
    { ...config, allowedOrigins: ['http://grama.example.com'] }, { ...config, allowedOrigins: ['http://localhost:5173'] },
    { ...config, allowedOrigins: [origin + '/path'] }];
  for (const value of invalid) {
    let read = false;
    const stream = new Readable({ read() { read = true; this.push(null); } });
    const { handler, sends } = fixture({ getConfig: () => value });
    const response = await invoke(handler, { stream });
    assert.equal(response.status, 503);
    assert.equal(read, false);
    assert.equal(sends.length, 0);
    assert.deepEqual((await invoke(handler, { pathname: '/api/contact/status', method: 'GET' })).json, { enabled: false });
  }
  const broken = fixture({ getConfig: () => { throw new Error('private config'); } });
  assert.equal((await invoke(broken.handler)).status, 503);
});

test('loopback HTTP is allowed only with an explicit test constructor option', async () => {
  const local = { ...config, allowedOrigins: ['http://127.0.0.1:5173'] };
  const { handler } = fixture({ getConfig: () => local, allowLocalOrigins: true });
  assert.equal((await invoke(handler, { headers: { origin: 'http://127.0.0.1:5173' } })).status, 202);
});

test('five enquiry topics reach only the configured recipient with validated reply-to and plain text', async () => {
  const { handler, sends } = fixture();
  const modes = [
    ['home', 'Dexter Acres', '14'], ['home', 'Custom home', ''],
    ['development', 'Landowner opportunity', ''], ['development', 'Investment partnership', ''], ['development', 'Development partnership', ''],
  ];
  for (const [path, interest, lot] of modes) {
    const data = input({ path, interest, lot, name: 'Name <b>literal</b>', details: '<script>plain text</script>\nAnother line', to: 'attacker@example.net', from: 'forged@example.net' });
    const response = await invoke(handler, { data });
    assert.equal(response.status, 202);
    assert.deepEqual(response.json, { status: 'accepted', reference: data.submissionId });
    const send = sends.at(-1);
    const payload = JSON.parse(send.body);
    assert.equal(send.url, 'https://api.resend.com/emails');
    assert.equal(send.method, 'POST');
    assert.equal(send.redirect, 'error');
    assert.equal(send.headers.Authorization, 'Bearer ' + config.apiKey);
    assert.equal(send.headers['Idempotency-Key'], 'contact/' + data.submissionId);
    assert.equal(payload.from, config.from);
    assert.deepEqual(payload.to, [config.to]);
    assert.equal(payload.reply_to, data.email);
    assert.equal(payload.subject, `Grama Development website enquiry — ${interest} — ${data.submissionId}`);
    assert.ok(!payload.subject.includes(data.name));
    assert.equal(Object.hasOwn(payload, 'html'), false);
    assert.match(payload.text, /<script>plain text<\/script>/);
    assert.match(payload.text, new RegExp(`Path: ${path}`));
    assert.match(payload.text, new RegExp(`Topic: ${interest}`));
    assert.match(payload.text, new RegExp(`Lot: ${lot || 'Not selected'}`));
    assert.ok(!send.body.includes('attacker@example.net'));
    assert.ok(!response.body.includes('delivered'));
  }
  assert.equal(sends.length, 5); // No automatic acknowledgement to the submitter.
});

test('matching idempotency header and a valid UUID are mandatory', async () => {
  for (const patch of [{ submissionId: 'not-a-uuid' }, { submissionId: '' }, { submissionId: null }]) {
    const { handler, sends } = fixture();
    assert.equal((await invoke(handler, { data: input(patch) })).status, 400);
    assert.equal(sends.length, 0);
  }
  for (const key of [undefined, '', randomUUID()]) {
    const { handler, sends } = fixture();
    assert.equal((await invoke(handler, { headers: { 'idempotency-key': key } })).status, 400);
    assert.equal(sends.length, 0);
  }
});

test('server validation rejects malformed fields, consent, topic combinations and non-Dexter lots', async () => {
  const patches = [
    { name: 'a' }, { name: ' '.repeat(10) }, { name: 'x'.repeat(101) }, { name: ['Name'] }, { name: 'Name\r\nBcc: bad@example.com' },
    { email: 'bad' }, { email: 'bad@example.com,other@example.com' }, { email: 'bad\n@example.com' }, { email: 'a..b@example.com' }, { email: 'a@-example.com' }, { email: 'x'.repeat(255) },
    { phone: true }, { phone: 'x'.repeat(61) }, { location: [] }, { location: 'x'.repeat(201) }, { details: 123 }, { details: 'x'.repeat(2001) }, { details: 'nul\u0000char' },
    { path: 'other' }, { path: '__proto__' }, { path: [] }, { path: ['home'], interest: 'Dexter Acres' }, { path: {} }, { interest: 'Unapproved topic' }, { path: 'home', interest: 'Investment partnership' },
    { lot: 1 }, { lot: '1', path: 'home', interest: 'Custom home' }, { timing: 'Tomorrow' }, { consent: false }, { consent: 'true' }, { consent: 1 },
    { website: 'spam.example' }, { website: ' ' }, { website: {} },
  ];
  const { handler, sends } = fixture();
  for (const patch of patches) assert.equal((await invoke(handler, { data: input(patch) })).status, 400, JSON.stringify(patch));
  for (const lot of [0, 15, -1, 1.5, true, {}, [], '01', '1e1', ' 1 ', 'NaN']) {
    assert.equal((await invoke(handler, { data: input({ path: 'home', interest: 'Dexter Acres', lot }) })).status, 400, String(lot));
  }
  for (const data of [null, [], 'string']) assert.equal((await invoke(handler, { data })).status, 400);
  assert.equal(sends.length, 0);
});

test('maximum field lengths, multiline details and every Dexter lot are accepted', async () => {
  const { handler, sends } = fixture();
  for (let lot = 1; lot <= 14; lot += 1) {
    const response = await invoke(handler, { data: input({ name: 'N'.repeat(100), phone: '1'.repeat(60), location: 'L'.repeat(200), details: 'D'.repeat(1998) + '\r\n', timing: '6–12 months', path: 'home', interest: 'Dexter Acres', lot }) });
    assert.equal(response.status, 202);
  }
  assert.equal(sends.length, 14);
});

test('unknown or absent origins and forged hosts cannot authorize sending', async () => {
  const { handler, sends } = fixture();
  for (const value of [undefined, 'null', 'https://attacker.example', origin + '.attacker.example', origin + '/', origin + ':443']) {
    const response = await invoke(handler, { headers: { origin: value, host: 'grama.example.com', 'x-forwarded-host': 'grama.example.com', 'x-forwarded-proto': 'https' } });
    assert.equal(response.status, 403);
  }
  assert.equal(sends.length, 0);
});

test('method, content type, malformed JSON and byte-size limits fail before provider contact', async () => {
  const { handler, sends } = fixture();
  for (const method of ['GET', 'HEAD', 'PUT', 'OPTIONS', 'DELETE']) {
    const response = await invoke(handler, { method });
    assert.equal(response.status, 405);
    assert.equal(response.headers.Allow, 'POST');
  }
  assert.equal((await invoke(handler, { pathname: '/api/contact/status', method: 'POST' })).status, 405);
  for (const value of ['text/plain', 'application/jsonp', undefined]) assert.equal((await invoke(handler, { headers: { 'content-type': value } })).status, 415);
  assert.equal((await invoke(handler, { raw: '{broken' })).status, 400);
  assert.equal((await invoke(handler, { headers: { 'content-length': '12001' } })).status, 413);
  assert.equal((await invoke(handler, { raw: JSON.stringify({ ignored: '😀'.repeat(4000) }) })).status, 413);
  assert.equal(sends.length, 0);
});

test('repeat and concurrent submissions share one provider operation; changed payload conflicts', async () => {
  let release;
  let calls = 0;
  const gate = new Promise(resolve => { release = resolve; });
  const { handler } = fixture({ fetchImpl: async () => { calls += 1; await gate; return accepted(); } });
  const data = input();
  const first = invoke(handler, { data });
  const second = invoke(handler, { data });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 1);
  assert.equal((await invoke(handler, { data: { ...data, details: 'Changed details' } })).status, 409);
  release();
  for (const result of await Promise.all([first, second])) assert.equal(result.status, 202);
  assert.equal((await invoke(handler, { data })).status, 202);
  assert.equal(calls, 1);
});

test('provider HTTP errors, network errors and malformed success never claim acceptance or expose details', async () => {
  const failures = [
    async () => ({ ok: false, status: 403, json: async () => ({ message: config.apiKey }) }),
    async () => ({ ok: false, status: 429 }),
    async () => ({ ok: false, status: 500 }),
    async () => { throw new Error('private provider error ' + config.to); },
    async () => ({ ok: true, json: async () => ({ id: 'invalid' }) }),
    async () => ({ ok: true, json: async () => { throw new Error('private response'); } }),
  ];
  for (const fetchImpl of failures) {
    const { handler } = fixture({ fetchImpl });
    const response = await invoke(handler);
    assert.ok([502, 503].includes(response.status));
    assert.ok(!response.body.includes('accepted'));
    assert.ok(!response.body.includes(config.apiKey));
    assert.ok(!response.body.includes(config.to));
    assert.ok(!response.body.includes('private'));
  }
});

test('timeouts abort provider work and retries preserve the exact key and payload', async () => {
  const calls = [];
  let aborted = false;
  const { handler } = fixture({ timeoutMs: 15, fetchImpl: async (url, options) => {
    calls.push(options);
    if (calls.length > 1) return accepted();
    return new Promise(() => { options.signal.addEventListener('abort', () => { aborted = true; }); });
  } });
  const data = input();
  assert.equal((await invoke(handler, { data })).status, 504);
  assert.equal(aborted, true);
  assert.equal((await invoke(handler, { data })).status, 202);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body, calls[1].body);
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
});

test('restarting the handler still sends deterministic provider retries for the same submission', async () => {
  const data = input();
  const first = fixture();
  const second = fixture();
  assert.equal((await invoke(first.handler, { data })).status, 202);
  assert.equal((await invoke(second.handler, { data })).status, 202);
  assert.equal(first.sends[0].body, second.sends[0].body);
  assert.equal(first.sends[0].headers['Idempotency-Key'], second.sends[0].headers['Idempotency-Key']);
});

test('per-address and global quotas are atomic, ignore forwarded IP claims and reset after their window', async () => {
  let time = 1000;
  const limited = fixture({ now: () => time, addressLimit: 1, globalLimit: 2, rateWindowMs: 1000 });
  assert.equal((await invoke(limited.handler, { address: 'proxy-a' })).status, 202);
  const blocked = await invoke(limited.handler, { address: 'proxy-a', headers: { 'x-forwarded-for': 'new-address' } });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers['Retry-After'], '1');
  assert.equal((await invoke(limited.handler, { address: 'proxy-b' })).status, 202);
  assert.equal((await invoke(limited.handler, { address: 'proxy-c' })).status, 429);
  time += 1000;
  assert.equal((await invoke(limited.handler, { address: 'proxy-a' })).status, 202);
  assert.equal(limited.sends.length, 3);
});

test('bounded state fails closed instead of evicting a live deduplication record', async () => {
  let time = 1000;
  const { handler, sends } = fixture({ now: () => time, maxRecords: 1 });
  const first = input();
  assert.equal((await invoke(handler, { data: first })).status, 202);
  assert.equal((await invoke(handler)).status, 503);
  assert.equal((await invoke(handler, { data: first })).status, 202);
  assert.equal(sends.length, 1);
  time += 24 * 60 * 60 * 1000;
  assert.equal((await invoke(handler)).status, 202);
  assert.equal(sends.length, 2);
});

test('a real HTTP request follows browser JSON -> handler -> mock provider -> accepted response', async t => {
  const { handler, sends } = fixture();
  const server = http.createServer(async (req, res) => {
    if (!await handler(req, res, new URL(req.url, origin).pathname)) { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  const data = input({ path: 'home', interest: 'Dexter Acres', lot: '7' });
  const response = await fetch(base + '/api/contact', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': data.submissionId }, body: JSON.stringify(data) });
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { status: 'accepted', reference: data.submissionId });
  assert.equal(sends.length, 1);
  const oversized = await fetch(base + '/api/contact', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID() }, body: JSON.stringify({ ignored: 'x'.repeat(13000) }) });
  assert.equal(oversized.status, 413);
  assert.equal(sends.length, 1);
  const chunked = await new Promise((resolve, reject) => {
    const request = http.request(base + '/api/contact', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID(), 'Transfer-Encoding': 'chunked' } }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
    });
    request.on('error', reject);
    request.write('{"ignored":"');
    request.write('x'.repeat(13000));
    request.end('"}');
  });
  assert.equal(chunked.status, 413);
  assert.equal(typeof JSON.parse(chunked.body).error, 'string');
  assert.equal(sends.length, 1);
});

test('environment reader does not enable delivery without the literal kill-switch value', () => {
  const previous = process.env.CONTACT_ENABLED;
  try {
    for (const value of ['', '1', 'TRUE', 'false']) { process.env.CONTACT_ENABLED = value; assert.equal(environmentContactConfig().enabled, false); }
    process.env.CONTACT_ENABLED = 'true';
    assert.equal(environmentContactConfig().enabled, true);
  } finally {
    if (previous === undefined) delete process.env.CONTACT_ENABLED; else process.env.CONTACT_ENABLED = previous;
  }
});
