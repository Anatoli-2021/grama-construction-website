import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptedReference, checkContactDelivery, contactPayload, createSubmissionSession, sendContactSubmission } from '../../src/contact-submission.js';

const values = { name: 'Synthetic Test', email: 'synthetic@example.test', phone: '', location: '', timing: '', details: 'Synthetic project', consent: true, website: '' };

test('contact context keeps Dexter lot selection and removes lots from other enquiries', () => {
  assert.equal(contactPayload(values, { path: 'home', topic: 'Dexter Acres', lot: '4' }).lot, '4');
  for (const context of [{ path: 'home', topic: 'Custom home', lot: '4' }, { path: 'development', topic: 'Landowner opportunity', lot: '4' }]) {
    assert.equal(contactPayload(values, context).lot, '');
  }
  assert.equal(contactPayload({ ...values, consent: 'true' }, { path: 'development', topic: 'Development partnership' }).consent, false);
});

test('unchanged retries reuse one UUID in both JSON and the idempotency header', () => {
  let issued = 0;
  const session = createSubmissionSession(() => 'synthetic-uuid-' + ++issued);
  const payload = contactPayload(values, { path: 'development', topic: 'Development partnership', lot: '' });
  const first = session.prepare(payload);
  const retry = session.prepare(Object.fromEntries(Object.entries(payload).reverse()));
  assert.equal(first.submissionId, retry.submissionId);
  assert.equal(retry.headers['Idempotency-Key'], JSON.parse(retry.body).submissionId);
  assert.equal(issued, 1);
});

test('a changed payload or an explicit edit/new form gets a new key', () => {
  let issued = 0;
  const session = createSubmissionSession(() => 'synthetic-uuid-' + ++issued);
  const payload = contactPayload(values, { path: 'home', topic: 'Dexter Acres', lot: '4' });
  const first = session.prepare(payload);
  const edited = session.prepare({ ...payload, lot: '5' });
  assert.notEqual(first.submissionId, edited.submissionId);
  session.invalidate();
  assert.notEqual(edited.submissionId, session.prepare({ ...payload, lot: '5' }).submissionId);
});

test('only an explicit successful readiness response enables delivery', async () => {
  for (const [ok, body, expected] of [
    [true, { enabled: true }, { enabled: true, confirmed: true }],
    [true, { enabled: false }, { enabled: false, confirmed: true }],
    [true, {}, { enabled: false, confirmed: false }],
    [true, { enabled: 'true' }, { enabled: false, confirmed: false }],
    [false, { enabled: true }, { enabled: false, confirmed: false }],
  ]) {
    assert.deepEqual(await checkContactDelivery(async (url, options) => {
      assert.equal(url, '/api/contact/status');
      assert.equal(options.method, 'GET');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.body, undefined);
      return { ok, json: async () => body };
    }), expected);
  }
  assert.deepEqual(await checkContactDelivery(async () => { throw Error('offline'); }), { enabled: false, confirmed: false });
  assert.deepEqual(await checkContactDelivery(async () => ({ ok: true, json: async () => { throw Error('not JSON'); } })), { enabled: false, confirmed: false });
});

test('success requires an accepted status and a public reference, not just HTTP success', () => {
  assert.equal(acceptedReference({ ok: true }, { status: 'accepted', reference: 'GRAMA-TEST-123' }), 'GRAMA-TEST-123');
  for (const result of [{ status: 'accepted' }, { status: 'queued', reference: 'GRAMA-TEST-123' }, { status: 'accepted', reference: '' }, { status: 'accepted', reference: 'bad\nreference' }]) {
    assert.throws(() => acceptedReference({ ok: true }, result), /could not confirm/);
  }
  assert.throws(() => acceptedReference({ ok: false }, { status: 'accepted', reference: 'GRAMA-TEST-123' }), /could not confirm/);
});

test('live requests use the prepared key and acknowledge only acceptance', async () => {
  const prepared = createSubmissionSession(() => 'synthetic-id').prepare(contactPayload(values, { path: 'development', topic: 'Investment partnership' }));
  const reference = await sendContactSubmission(prepared, async (url, options) => {
    assert.equal(url, '/api/contact');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Idempotency-Key'], 'synthetic-id');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(JSON.parse(options.body).submissionId, 'synthetic-id');
    return { ok: true, json: async () => ({ status: 'accepted', reference: 'GRAMA-TEST-123' }) };
  });
  assert.equal(reference, 'GRAMA-TEST-123');
});

test('timeout retains the same retry key and does not report a failed delivery as certain', async () => {
  const session = createSubmissionSession(() => 'retry-id');
  const payload = contactPayload(values, { path: 'home', topic: 'Custom home' });
  const prepared = session.prepare(payload);
  await assert.rejects(sendContactSubmission(prepared, async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }), { timeoutMs: 5 }), /timed out.*acceptance could not be confirmed/);
  assert.equal(session.prepare(payload).submissionId, prepared.submissionId);
});

test('network, malformed JSON, and non-accepted responses never produce success', async () => {
  const prepared = createSubmissionSession(() => 'retry-id').prepare(values);
  for (const fetcher of [
    async () => { throw Error('offline'); },
    async () => ({ ok: true, json: async () => { throw Error('bad JSON'); } }),
    async () => ({ ok: true, json: async () => ({ status: 'delivered' }) }),
    async () => ({ ok: false, json: async () => ({ status: 'accepted', reference: 'GRAMA-TEST-123' }) }),
  ]) await assert.rejects(sendContactSubmission(prepared, fetcher), /could not confirm/);
});
