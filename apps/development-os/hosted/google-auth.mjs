import * as oidc from 'openid-client';

export const GOOGLE_ISSUER = 'https://accounts.google.com';

// No stored access/refresh tokens. The optional fetch seam is for offline tests,
// never a request/environment-selected provider or an authentication bypass.
export function createGoogleAuth(config, { fetch: testFetch } = {}) {
  let pending;
  async function configuration() {
    if (!pending) {
      pending = oidc.discovery(new URL(GOOGLE_ISSUER), config.clientId,
        config.clientSecret, undefined,
        testFetch ? { [oidc.customFetch]: testFetch } : {}).then(value => {
        value.timeout = 8;
        oidc.enableNonRepudiationChecks(value);
        return value;
      }).catch(error => { pending = undefined; throw error; });
    }
    return pending;
  }
  return {
    async authorizationURL(transaction) {
      const value = await configuration();
      return oidc.buildAuthorizationUrl(value, {
        redirect_uri: config.origin + '/platform/auth/callback',
        response_type: 'code',
        scope: 'openid email',
        state: transaction.state,
        nonce: transaction.nonce,
        code_challenge: await oidc.calculatePKCECodeChallenge(transaction.verifier),
        code_challenge_method: 'S256',
      });
    },
    async claimsFromCallback(url, transaction) {
      const tokens = await oidc.authorizationCodeGrant(await configuration(), url, {
        pkceCodeVerifier: transaction.verifier,
        expectedState: transaction.state,
        expectedNonce: transaction.nonce,
        idTokenExpected: true,
      });
      return tokens.claims();
    },
  };
}
