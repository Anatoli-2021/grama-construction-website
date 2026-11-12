import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { once } from 'node:events';
import { createOsHost, readHostConfig } from '../hosted/server.mjs';
import { GOOGLE_ISSUER } from '../hosted/google-auth.mjs';

const env = {
  OS_PUBLIC_ORIGIN: 'https://os.example.invalid',
  GOOGLE_CLIENT_ID: 'fixture-client', GOOGLE_CLIENT_SECRET: 'fixture-only-not-a-credential',
  OS_OWNER_EMAIL: 'owner@example.invalid', OS_DATA_MODE: 'synthetic',
  OS_ALLOWED_PROJECTS: 'DEMO-A', OS_RELEASE: 'test',
};
const owner = { iss: GOOGLE_ISSUER, sub: 'fixture-subject', email: env.OS_OWNER_EMAIL, email_verified: true };
function httpCall(server, path, { method = 'GET', cookie, origin, csrf, host = 'os.example.invalid' } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: server.address().port, path, method,
      headers: { Host: host, ...(cookie ? { Cookie: cookie } : {}),
        ...(origin ? { Origin: origin } : {}), ...(csrf ? { 'X-Grama-CSRF': csrf } : {}) } }, res => {
      let body = ''; res.setEncoding('utf8'); res.on('data', x => body += x);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body,
        json: () => JSON.parse(body) }));
    });
    req.on('error', reject); req.end();
  });
}
const takeCookie = (response, name) => (response.headers['set-cookie'] || [])
  .find(x => x.startsWith(name + '='))?.split(';')[0];
async function fixture(t, claims = owner, extra = {}) {
  let time = Date.now(), calls = 0;
  const config = readHostConfig({ ...env, ...extra.env });
  const auth = {
    async authorizationURL(flow) {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('state', flow.state);
      return url;
    },
    async claimsFromCallback() { calls++; return claims; },
  };
  const server = createOsHost(config, { auth, now: () => time, projects: [
    { id: 'DEMO-A', title: 'Synthetic A', synthetic: true, restrictedBudget: 'must-never-leak' },
    { id: 'DEMO-B', title: 'Synthetic B', synthetic: true },
  ] });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(r => server.close(r)); });
  const call = (path, opts) => httpCall(server, path, opts);
  async function start() {
    const response = await call('/platform/auth/start');
    return { response, cookie: takeCookie(response, '__Secure-GramaOSFlow'),
      state: new URL(response.headers.location).searchParams.get('state') };
  }
  async function finish(flow, state = flow.state) {
    return call('/platform/auth/callback?code=synthetic-code&state=' + state, { cookie: flow.cookie });
  }
  async function login() {
    const flow = await start(); const response = await finish(flow);
    return { cookie: takeCookie(response, '__Secure-GramaOS'), response, flow };
  }
  return { server, call, start, finish, login, tick: delta => { time += delta; }, calls: () => calls };
}

test('hosted configuration fails closed without credentials, on nonloopback HTTP or real-data mode', () => {
  assert.throws(() => readHostConfig({}), /Missing configuration/);
  assert.throws(() => readHostConfig({ ...env, OS_PUBLIC_ORIGIN: 'http://os.example.invalid' }), /HTTPS/);
  assert.throws(() => readHostConfig({ ...env, OS_PUBLIC_ORIGIN: 'https://os.example.invalid/elsewhere' }), /HTTPS/);
  assert.throws(() => readHostConfig({ ...env, OS_DATA_MODE: 'real' }), /synthetic/);
  assert.throws(() => readHostConfig({ ...env, OS_ALLOWED_PROJECTS: '../private' }), /project scope/);
});
test('anonymous health exposes only release/readiness; login page contains no project data', async t => {
  const f = await fixture(t);
  const health = await f.call('/healthz');
  assert.equal(health.status, 200);
  assert.deepEqual(health.json(), { ok: true, release: 'test', dataMode: 'synthetic', uiIntegrated: false });
  const page = await f.call('/platform/');
  assert.equal(page.status, 200); assert.match(page.body, /Sign in with Google/);
  assert.ok(!page.body.includes('Synthetic A'));
});
test('anonymous, forged, duplicate and wrong-host sessions cannot read projects or exports', async t => {
  const f = await fixture(t);
  for (const path of ['/platform/api/projects', '/platform/api/projects/DEMO-A', '/platform/files/private', '/platform/export']) {
    assert.equal((await f.call(path)).status, 401);
  }
  assert.equal((await f.call('/platform/api/projects', { cookie: '__Secure-GramaOS=' + 'A'.repeat(43) })).status, 401);
  const { cookie } = await f.login();
  assert.equal((await f.call('/platform/api/projects', { cookie: cookie + '; ' + cookie })).status, 401);
  assert.equal((await f.call('/platform/api/projects', { cookie, host: 'attacker.invalid' })).status, 403);
});
test('valid owner sees only assigned projects and explicitly permitted metadata', async t => {
  const f = await fixture(t), login = await f.login();
  assert.equal(login.response.status, 302);
  const response = await f.call('/platform/api/projects', { cookie: login.cookie });
  assert.equal(response.status, 200);
  assert.deepEqual(response.json().projects, [{ id: 'DEMO-A', title: 'Synthetic A', synthetic: true }]);
  assert.equal((await f.call('/platform/api/projects/DEMO-B', { cookie: login.cookie })).status, 404);
  assert.equal((await f.call('/platform/api/projects/unknown', { cookie: login.cookie })).status, 404);
  assert.ok(!response.body.includes('must-never-leak'));
  const session = (await f.call('/platform/api/session', { cookie: login.cookie })).json();
  assert.deepEqual(session.identity, { issuer: GOOGLE_ISSUER, subject: owner.sub, role: 'owner' });
  assert.ok(!JSON.stringify(session).includes(env.GOOGLE_CLIENT_SECRET));
});
for (const [name, changes] of [
  ['other account', { email: 'other@example.invalid' }],
  ['unverified email', { email_verified: false }],
  ['wrong issuer', { iss: 'https://attacker.invalid' }],
  ['missing subject', { sub: '' }],
  ['wrong pinned subject', { sub: 'other-subject' }],
]) {
  test('denies ' + name + ' at login, not only in the UI', async t => {
    const f = await fixture(t, { ...owner, ...changes }, { env: { OS_OWNER_SUBJECT: owner.sub } });
    const result = await f.login();
    assert.equal(result.response.status, 403);
    assert.equal(result.cookie, undefined);
    assert.equal((await f.call('/platform/api/projects')).status, 401);
  });
}
test('missing, mismatched, expired and replayed callback transactions fail before token exchange', async t => {
  const f = await fixture(t);
  assert.equal((await f.call('/platform/auth/callback?code=synthetic-code&state=missing')).status, 401);
  let flow = await f.start();
  assert.equal((await f.finish(flow, 'wrong-state')).status, 401);
  assert.equal(f.calls(), 0);
  assert.equal((await f.finish(flow)).status, 401);
  flow = await f.start(); f.tick(5 * 60000 + 1);
  assert.equal((await f.finish(flow)).status, 401); assert.equal(f.calls(), 0);
  flow = await f.start();
  assert.equal((await f.finish(flow)).status, 302);
  assert.equal((await f.finish(flow)).status, 401);
});
test('cookies are secure; API is no-store; logout requires same origin and CSRF and revokes session', async t => {
  const f = await fixture(t), login = await f.login();
  const cookies = login.response.headers['set-cookie'];
  assert.ok(cookies.every(c => c.includes('HttpOnly; Secure; SameSite=Lax')));
  const response = await f.call('/platform/api/session', { cookie: login.cookie });
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['x-frame-options'], 'DENY');
  assert.match(response.headers['content-security-policy'], /default-src 'none'/);
  assert.equal((await f.call('/platform/auth/logout', { method: 'POST', cookie: login.cookie })).status, 403);
  assert.equal((await f.call('/platform/auth/logout', { method: 'POST', cookie: login.cookie, origin: 'https://attacker.invalid', csrf: response.json().csrf })).status, 403);
  assert.equal((await f.call('/platform/auth/logout', { method: 'POST', cookie: login.cookie, origin: env.OS_PUBLIC_ORIGIN, csrf: response.json().csrf })).status, 200);
  assert.equal((await f.call('/platform/api/projects', { cookie: login.cookie })).status, 401);
});
test('session expiry, service replacement and denied writes preserve the read-only boundary', async t => {
  const a = await fixture(t), login = await a.login();
  assert.equal((await a.call('/platform/api/projects', { method: 'POST', cookie: login.cookie })).status, 405);
  assert.equal((await a.call('/platform/', { cookie: login.cookie })).status, 503);
  const replacement = await fixture(t);
  assert.equal((await replacement.call('/platform/api/projects', { cookie: login.cookie })).status, 401);
  a.tick(60 * 60000 + 1);
  assert.equal((await a.call('/platform/api/projects', { cookie: login.cookie })).status, 401);
});
test('a new owner login rotates and invalidates the prior session', async t => {
  const f = await fixture(t), previous = await f.login(), flow = await f.start();
  const next = await f.call('/platform/auth/callback?code=synthetic-code&state=' + flow.state,
    { cookie: previous.cookie + '; ' + flow.cookie });
  const rotated = takeCookie(next, '__Secure-GramaOS');
  assert.equal(next.status, 302); assert.notEqual(rotated, previous.cookie);
  assert.equal((await f.call('/platform/api/projects', { cookie: previous.cookie })).status, 401);
  assert.equal((await f.call('/platform/api/projects', { cookie: rotated })).status, 200);
});
test('empty project scope denies project data; real-data fixtures and unregistered routes are refused', async t => {
  const f = await fixture(t, owner, { env: { OS_ALLOWED_PROJECTS: '' } }), login = await f.login();
  assert.deepEqual((await f.call('/platform/api/projects', { cookie: login.cookie })).json().projects, []);
  assert.equal((await f.call('/platform/api/projects/DEMO-A', { cookie: login.cookie })).status, 404);
  assert.equal((await f.call('/platform/files/private', { cookie: login.cookie })).status, 404);
  assert.throws(() => createOsHost(readHostConfig(env), { projects: [{ id: 'REAL', synthetic: false }] }), /Real data/);
});
test('login attempt rate is bounded', async t => {
  const f = await fixture(t);
  for (let i = 0; i < 20; i++) assert.equal((await f.call('/platform/auth/start')).status, 302);
  assert.equal((await f.call('/platform/auth/start')).status, 429);
});
