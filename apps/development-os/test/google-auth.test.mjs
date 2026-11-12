import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createGoogleAuth, GOOGLE_ISSUER } from '../hosted/google-auth.mjs';

// Ephemeral keys and synthetic claims. All provider requests are intercepted;
// an unexpected URL throws instead of making a network request.
const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const otherKeys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicJwk = { ...keys.publicKey.export({ format: 'jwk' }), kid: 'fixture-key', use: 'sig', alg: 'RS256' };
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function jwt(claims, key = keys.privateKey) {
  const body = encode({ alg: 'RS256', kid: 'fixture-key' }) + '.' + encode(claims);
  return body + '.' + sign('RSA-SHA256', Buffer.from(body), key).toString('base64url');
}
async function provider(overrides = {}, badSignature = false) {
  const now = Math.floor(Date.now() / 1000), seen = [];
  const flow = { state: 'synthetic-state', nonce: 'synthetic-nonce', verifier: 'A'.repeat(43) };
  const config = { clientId: 'fixture-client', clientSecret: 'fixture-only-not-a-credential', origin: 'https://os.example.invalid' };
  const claims = { iss: GOOGLE_ISSUER, sub: 'synthetic-subject', aud: config.clientId,
    iat: now, exp: now + 120, nonce: flow.nonce,
    email: 'owner@example.invalid', email_verified: true, ...overrides };
  const fetch = async (input, init) => {
    const url = String(input); seen.push(url);
    if (url.endsWith('/.well-known/openid-configuration')) return Response.json({
      issuer: GOOGLE_ISSUER, authorization_endpoint: GOOGLE_ISSUER + '/o/oauth2/v2/auth',
      token_endpoint: GOOGLE_ISSUER + '/token-fixture', jwks_uri: GOOGLE_ISSUER + '/jwks-fixture',
      response_types_supported: ['code'], subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: ['client_secret_post'],
      code_challenge_methods_supported: ['S256'],
    });
    if (url.endsWith('/token-fixture')) {
      const body = new URLSearchParams(init.body);
      assert.equal(body.get('code_verifier'), flow.verifier);
      assert.equal(body.get('redirect_uri'), config.origin + '/platform/auth/callback');
      return Response.json({ access_token: 'synthetic-access', token_type: 'Bearer',
        id_token: jwt(claims, badSignature ? otherKeys.privateKey : keys.privateKey), expires_in: 120 });
    }
    if (url.endsWith('/jwks-fixture')) return Response.json({ keys: [publicJwk] });
    throw new Error('Network forbidden in offline provider test.');
  };
  const auth = createGoogleAuth(config, { fetch });
  const authorization = await auth.authorizationURL(flow);
  const callback = new URL(config.origin + '/platform/auth/callback?code=synthetic-code&state=' + flow.state);
  return { auth, flow, authorization, callback, seen };
}
test('Google adapter requests only identity scopes with PKCE, nonce, state and pinned callback', async () => {
  const p = await provider();
  assert.equal(p.authorization.origin, GOOGLE_ISSUER);
  assert.equal(p.authorization.searchParams.get('scope'), 'openid email');
  assert.equal(p.authorization.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(p.authorization.searchParams.get('state'), p.flow.state);
  assert.equal(p.authorization.searchParams.get('nonce'), p.flow.nonce);
  assert.equal(p.authorization.searchParams.get('redirect_uri'), 'https://os.example.invalid/platform/auth/callback');
  assert.ok(p.authorization.searchParams.get('code_challenge'));
  const claims = await p.auth.claimsFromCallback(p.callback, p.flow);
  assert.equal(claims.sub, 'synthetic-subject');
  assert.ok(p.seen.some(url => url.endsWith('/jwks-fixture')), 'Signature verification must fetch the fixture JWK.');
});
for (const [name, claims, badSignature] of [
  ['wrong audience', { aud: 'another-client' }, false],
  ['expired token', { exp: Math.floor(Date.now() / 1000) - 600 }, false],
  ['nonce mismatch', { nonce: 'another-nonce' }, false],
  ['wrong issuer', { iss: 'https://attacker.invalid' }, false],
  ['forged signature', {}, true],
]) {
  test('real OIDC validation rejects ' + name + ' offline', async () => {
    const p = await provider(claims, badSignature);
    await assert.rejects(p.auth.claimsFromCallback(p.callback, p.flow));
  });
}
test('OIDC state mismatch fails before a token request', async () => {
  const p = await provider();
  p.callback.searchParams.set('state', 'another-state');
  await assert.rejects(p.auth.claimsFromCallback(p.callback, p.flow));
  assert.ok(!p.seen.some(url => url.endsWith('/token-fixture')));
});
