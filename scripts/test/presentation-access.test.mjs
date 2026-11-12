import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createPresentationHandler, hashAccessCode, environmentPresentationConfig } from '../presentation-access.mjs';

const code = 'synthetic-test-access-code-ONLY';
const credential = await hashAccessCode(code);

async function fixture(t, { secureCookies = false, empty = false } = {}) {
  let clock = Date.parse('2026-11-10T18:00:00Z');
  const config = { accounts: empty ? [] : [
    { email: 'alpha@example.invalid', name: 'Synthetic Alpha', deckId: 'alpha', active: true, expiresAt: '2026-11-11T18:00:00Z', ...credential },
    { email: 'beta@example.invalid', name: 'Synthetic Beta', deckId: 'beta', active: true, expiresAt: '2026-11-11T18:00:00Z', ...credential },
  ], decks: { alpha: { title: 'PRIVATE_ALPHA_ONLY' }, beta: { title: 'PRIVATE_BETA_ONLY' } } };
  const handle = createPresentationHandler({ getConfig: () => config, secureCookies, now: () => clock });
  const server = http.createServer(async (req, res) => { if (!(await handle(req, res, new URL(req.url, 'http://localhost').pathname))) { res.writeHead(404); res.end(); } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  const login = (email = 'alpha@example.invalid', value = code, origin = base) => fetch(base + '/presentation/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ email, code: value }) });
  return { config, base, login, advance: ms => { clock += ms; } };
}

test('anonymous requests never receive private presentation data', async t => {
  const { base } = await fixture(t);
  const response = await fetch(base + '/presentation/api/deck');
  assert.equal(response.status, 401);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.ok(!(await response.text()).includes('PRIVATE_'));
  assert.equal((await fetch(base + '/presentation/private-data.json')).status, 404);
});

test('individual session can read only its assigned deck, regardless of query parameters', async t => {
  const { base, login } = await fixture(t);
  const response = await login();
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/);
  const deck = await fetch(base + '/presentation/api/deck?deckId=beta', { headers: { Cookie: cookie.split(';')[0] } });
  const value = await deck.json();
  assert.equal(value.preparedFor, 'Synthetic Alpha');
  assert.equal(value.deck.title, 'PRIVATE_ALPHA_ONLY');
  assert.ok(!JSON.stringify(value).includes('PRIVATE_BETA_ONLY'));
});

test('revoked or reassigned credentials immediately invalidate an existing session', async t => {
  const { base, login, config } = await fixture(t);
  const cookie = (await login()).headers.get('set-cookie').split(';')[0];
  config.accounts[0].deckId = 'beta';
  assert.equal((await fetch(base + '/presentation/api/deck', { headers: { Cookie: cookie } })).status, 401);
  config.accounts[0].active = false;
  assert.equal((await login()).status, 401);
});

test('session expiry and logout remove access', async t => {
  const { base, login, advance } = await fixture(t);
  const first = (await login()).headers.get('set-cookie').split(';')[0];
  advance(4 * 3600 * 1000 + 1);
  assert.equal((await fetch(base + '/presentation/api/deck', { headers: { Cookie: first } })).status, 401);
  const second = (await login()).headers.get('set-cookie').split(';')[0];
  const logout = await fetch(base + '/presentation/api/logout', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', Cookie: second }, body: '{}' });
  assert.equal(logout.status, 200); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await fetch(base + '/presentation/api/deck', { headers: { Cookie: second } })).status, 401);
});

test('cross-origin login, incorrect credentials and repeated guesses are denied', async t => {
  const { base, login } = await fixture(t);
  assert.equal((await login('alpha@example.invalid', code, 'https://unrelated.invalid')).status, 403);
  for (let attempt = 0; attempt < 8; attempt++) assert.equal((await login('alpha@example.invalid', 'incorrect-code-for-test')).status, 401);
  assert.equal((await login()).status, 429);
  assert.equal((await fetch(base + '/presentation/api/deck')).status, 401);
});

test('unconfigured production access fails closed and cookies require HTTPS', async t => {
  const empty = await fixture(t, { empty: true });
  assert.equal((await empty.login()).status, 503);
  const secure = await fixture(t, { secureCookies: true });
  const cookie = (await secure.login()).headers.get('set-cookie');
  assert.match(cookie, /^__Host-grama-presentation=/); assert.match(cookie, /; Secure/);
  const old = process.env.PRESENTATION_ACCESS_JSON;
  process.env.PRESENTATION_ACCESS_JSON = '{invalid';
  assert.deepEqual(environmentPresentationConfig(), { accounts: [], decks: {} });
  if (old === undefined) delete process.env.PRESENTATION_ACCESS_JSON; else process.env.PRESENTATION_ACCESS_JSON = old;
});

test('rotating guessed email addresses cannot bypass the address attempt limit', async t => {
  const { login } = await fixture(t);
  for (let i = 0; i < 32; i++) assert.equal((await login(`unknown-${i}@example.invalid`)).status, 401);
  assert.equal((await login('another@example.invalid')).status, 429);
});
