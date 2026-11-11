# Data boundary and release security

## Current implemented boundary

- Repository is currently public, verified November 10. Keep all confidential business/investor records and credentials outside Git. `axmatea` has approved write permission.
- Git excludes local enquiry data, populated exports, private-data/backups folders, environment files, credentials, workbooks and database dumps. `.env.example` contains ports only.
- Shared OS specification is blank; actual dashboard, project finances, private source URLs and pilot evidence are excluded.
- OS server binds only to `127.0.0.1`, allowlists exact routes, rejects unexpected Host headers and writes, and sets no-store / frame / outbound-connection restrictions.
- Website build contains only generic public assets, including the presentation login shell and renderer. Automated checks look for private paths and OS specification leakage. The Railway host rejects repository/local API paths; its separate presentation API requires an individual server-validated session.
- GitHub CI uses pinned official action commits, read-only permissions and no application/deployment secrets. PR checks do not provision records or send messages.

Hosted contact delivery is a separate, narrowly scoped handler. It is disabled unless an operator explicitly enables it and supplies the approved origin, sender, recipient and server-only provider key. The browser receives availability and an accepted reference, never the key or recipient configuration. The server validates fields, consent, allowed topics/lots, origin and size; limits requests; rejects honeypot submissions; and uses request/provider idempotency to avoid duplicate notifications on retries. Recipient and sender cannot be selected by the visitor. Visitor input is sent as plain text with a validated Reply-To address; no automatic email is sent to unverified visitor addresses.

The website does not persist enquiry bodies or log personal fields. Notification content is processed by the configured email provider and delivered to the approved mailbox; their access and retention settings still apply. In-memory counters and fingerprints are bounded and reset on restart; provider idempotency lasts 24 hours. This is a small single-instance contact endpoint, not a durable CRM or a distributed abuse-control service. A provider acceptance response is not proof of inbox placement. See [setup and real delivery verification](CONTACT-DELIVERY.md).

The private investor presentation has its own authorization middleware. Its static HTML/JavaScript contain only a login shell and generic renderer. Private deck data comes from server configuration after individual login; account-to-deck assignment, expiry/revocation, secure production cookies, origin checks and request/guess limits apply. Empty configuration denies access. This is separate from the unhosted Development OS; neither user accounts nor private business records are copied from the OS automatically. See `INVESTOR-PRESENTATION.md` for the current small-deployment scope and provisioning limits.

Gitignore and pattern checks reduce accidents; they do not certify the entire history is free of secrets. Review every staged diff and asset before pushing. If a credential is exposed, revoke it first, notify Tony and repair history deliberately; deleting the latest file is insufficient.

## Required before OS can be hosted with real data

- [ ] Tony approves the identity provider, permitted accounts, hosting scope and spending.
- [ ] Individual login with MFA; secure server-validated sessions; logout/revocation; no shared owner login.
- [ ] Server-side project authorization, least-privilege roles (owner, project manager, contributor, viewer), deny by default; test unauthorized project/export access directly.
- [ ] Private database network, encrypted transport/storage, distinct preview/staging/production credentials; no client-bundled secrets.
- [ ] Read adapters first. Preserve source IDs/revisions, freshness, approvals and existing authoritative records; no blind provisioning or financial posting.
- [ ] Audit trail for actor, change, source, time and approval. Financial/client data stays out of application logs and GitHub issues.
- [ ] CSRF/rate-limit/request-size controls, safe output rendering, file access rules, session expiry and tested account removal.
- [ ] Encrypted backups, retention/access policy, owner-selected recovery objectives, and an actual restore test before importing records.
- [ ] No real data in PR previews or synthetic test fixtures. Protected OS deployment and authenticated app access are both tested anonymously.
- [ ] Tony approves exact migration/import and verifies read-back, access and rollback before release.

The local blank tool has no authentication/database and must not be presented as a secure multi-user OS. A hidden URL, private GitHub repository or host preview password does not replace application authorization. Smartsheet remains the operational record; original evidence and accounting records remain in their existing systems.
