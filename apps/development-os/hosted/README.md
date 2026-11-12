# Private OS authentication candidate — not deployed

Tony approved Google sign-in with one initial owner account. The actual account
belongs only in private service configuration; no real identity or credential is
included here.

This is the server-side staging boundary for the existing OS, not another UI.
It does not copy or modify Claude's Studio. The old loopback launch tool and the
public website runtime remain unchanged.

## Implemented and locally tested

- Pinned Google issuer; authorization-code flow with S256 PKCE, state and nonce.
- openid-client 6.8.9 validates issuer, audience, expiry and nonce. Explicit
  non-repudiation checks also verify ID-token signatures against Google's JWKs.
- Server-side verified-email owner allowlist, stable issuer/subject identity and
  optional subject pin. Other accounts are refused before a session is created.
- Opaque server-held sessions, Secure/HttpOnly/SameSite cookies, expiry,
  one-time callback transactions, bounded login attempts and CSRF-protected logout.
- Per-project allowlist; unassigned IDs return 404. Only synthetic id/title
  metadata is returned, with unexpected fields omitted before serialization.
- No real data mode, source writes, private files, company records, source
  credentials, access tokens or refresh tokens exposed/stored in browser code.
- Missing required configuration fails startup. Health reports synthetic mode
  and uiIntegrated=false; an authenticated page returns 503 until reviewed UI
  integration is complete.

Tests in ../test/hosted.test.mjs use actual localhost HTTP requests and synthetic
identity fixtures. ../test/google-auth.test.mjs exercises the real OIDC library
against intercepted provider/JWK responses and ephemeral signing keys; no Google
account/network request is used. These are not a live Google sign-in test.

## Routes

| Route | Boundary |
| --- | --- |
| GET /healthz | No identities or records; release/readiness only |
| GET /platform/ | Anonymous login link; authenticated UI remains unavailable |
| GET /platform/auth/start | Pinned Google redirect; no extra API scopes |
| GET /platform/auth/callback | Bound, expiring, single-use transaction |
| POST /platform/auth/logout | Session + exact Origin + CSRF required |
| GET /platform/api/session | Own minimal identity and logout CSRF only |
| GET /platform/api/projects[/id] | Authenticated, project-filtered synthetic metadata |
| Other writes/files/exports | Unavailable or denied |

## Configuration and storage limits

See ../../../infra/staging/os.env.example for variable names. Configure an
approved dedicated OS origin, Google web OAuth client/secret, owner allowlist and
explicit synthetic project scope. Register the exact
/platform/auth/callback URL on that origin. Secrets go only in private host
settings; never copy a desktop/MCP OAuth credential.

Session/transaction stores are in memory, single-instance only. Restart removes
sessions, including after account/config changes. This is intentional for this
synthetic candidate; it is not durable application/project storage or a shared
multi-replica session store. No database is provisioned.

Use a dedicated OS staging origin separate from the public website. Future
same-origin /platform routing still needs an explicit website/OS security review.
No automatic public OS previews or real-data import.

## Readiness still blocked

- Real Google OAuth client, registered staging callback and private environment
  configuration; owner sign-in and actual provider/MFA policy verification.
- Review and Tony approval of the exact code and resource activation.
- Existing Railway staged-create service needs reconciliation: its current
  source main is the website baseline, not this candidate.
- Claude's quick-created renovation dependency defect, common hosted project
  records, CSP-compatible UI integration, browser persistence and access tests.
  His reviewed 239335c fix passes the original six regressions; expanded
  independent checks are 22 pass / 1 fail. See docs/OS_STATUS.md from repo root.
- Container build/runtime acceptance and real Railway rollback drill.

The prepared Dockerfile is infra/staging/os.Dockerfile, root build context.
Do not use the root website Dockerfile for the private OS. Do not deploy this
candidate as a working Dashboard/Studio.

Local checks: npm run check includes both new security test files.
node apps/development-os/hosted/server.mjs refuses missing configuration.

## Rollback acceptance

The HTTP tests confirm sessions cannot survive service replacement. That is
session-revocation evidence, not an application/deployment rollback.

Before a Railway drill, obtain approval for synthetic resources, record two
reviewed image/commit versions and a known-good release, and verify configured
identity/project scope. Deploy version A; test login, scoped access and health;
deploy reviewed B; restore the actual A image; repeat access/health checks with
a fresh login and confirm old sessions are denied. Record exact image/deploy
IDs, outputs and approval. No such Railway rollout/rollback has run.

Official implementation references:
- https://developers.google.com/identity/openid-connect/openid-connect
- https://github.com/panva/openid-client
