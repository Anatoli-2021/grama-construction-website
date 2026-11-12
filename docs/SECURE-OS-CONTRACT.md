# Private OS security and integration contract

Design contract for review, not implemented authentication. Never treat this document as release evidence.

## Identity and permissions
Recommended starting choice: individual Google/OIDC login with an explicit account allowlist; provider remains Tony's decision. Validate issuer, audience, nonce/state, signature, verified account identity and stable subject server-side. Require MFA through an enforceable provider/gateway policy if the account type supports it; do not claim a personal Google login proves MFA.

Use expiring server-validated sessions, Secure/HttpOnly/SameSite cookies, logout/revocation, CSRF protection, request/rate limits and audit events without private payloads. No admin/admin or shared owner password. Keep callback URLs and secrets environment-specific.

Project membership and permission are separate from login:
| Role | Default scope |
| --- | --- |
| Owner | Explicitly authorized projects and private owner views; consequential actions still require recorded approval |
| Project manager | Assigned projects, coordination and approved operational functions |
| Contributor | Assigned work packages and permitted documents |
| Viewer | Read only assigned nonrestricted views |
| Anonymous/unassigned | Denied |

Enforce on the server for each record, document, generated image, email link, search result and export. Filter before sending/caching; do not send forbidden fields and hide them with CSS. Scope caches to identity/project/permission and invalidate on revocation. Direct URL and cross-project ID tests must fail closed. UI role previews are demonstrations only.

## Source of truth and storage
- Smartsheet: operational tasks, controls, approvals, schedule and cost-source links. Existing approved records are preserved.
- Wave: customer estimates, proposals and invoices; preserve exported documents and exact record identity.
- Approved private document storage: original plans, contracts, selections and restricted records. Document Hub stores authorized references, versions and review status rather than copying everything.
- Application database, when needed: identity/project grants, application-only draft metadata, immutable approval/audit references and integration cursors. It is not a second budget or payment ledger.
- No durable data in an unmounted Railway container filesystem. Choose a managed database/private object store only after approval, with isolated credentials, encrypted transport/storage, retention and tested backup/restore.
- Windows file links are local conveniences, not a cloud storage or access-control solution. A hosted app must not expose arbitrary Desktop folders. Do not sync the existing local SQLite memory database into a container or Drive.

## Smartsheet read-first contract
Application connections are separate from an AI assistant's MCP connection. Never extract a desktop OAuth credential into Railway.
- Approved sheet allowlist, dedicated least-privilege service identity or read-scoped OAuth, and server-held credentials.
- GET/read operations only initially; no new sheets, rows, approval changes or budget updates.
- Preserve source system, sheet/row IDs, revision, retrievedAt, last successful refresh and evidence link.
- Return a status such as live, snapshot, stale, unknown or disconnected, with a timestamp. On failure show stale/unknown, not fabricated current values or silent zeros.
- Deduplicate by source system + sheet ID + row ID + revision, not project name alone.
- Apply project/access-class authorization before returning or caching rows. Test direct restricted-row/export access, not just dashboard visibility.
- Respect pagination, timeouts, rate limits and retry-after; idempotent read retries only.
- Use synthetic fixtures and fake sheet IDs in shared development; no actual exports or private URLs in Git/CI.
- Any future write needs an explicit operation allowlist, permission check, preview, Tony approval, source revision/conflict check, idempotency and read-back audit.

## Design Studio boundaries
Plans, surveys, dimensions, selections, cabinet/vendor drawings, takeoffs, references and renderings are versioned project inputs. AI concepts do not certify dimensions, zoning, engineering, constructability or client approval. Trace a proposed selection into scope/takeoff/quote before treating it as budget evidence.

Keep concept, client presentation, pricing and released-for-work states distinct. A crew work package includes the approved drawing/version, scope, materials/selections, responsible trade, prerequisites and an authorized release. Missing inputs remain missing.

## Mail and AI tools
Mail starts disconnected; separately approve read-only scope and selected account/project matching. No sending, automatic mailbox mutation or broad ingestion by default. Redact and authorize attachments before external AI upload.
Higgsfield/other AI tools use each operator's authorized connection, explicit model/count/cost and source permissions. No shared cookies/tokens or automatic paid generations. A repository instruction does not authenticate Claude.

## Required runtime acceptance
Anonymous route/API/file denied; wrong-role and wrong-project denied; owner-authorized view works; logout/revocation works; secrets absent from client bundles/logs; restricted fields absent from payload/cache; stale-source state visible; writes unavailable; staging cannot reach production sources; backup restore tested before persistent real data; rollback exercised on synthetic staging. Record actual results, not checkboxes alone.
