# Private investor presentation

The public website and `/presentation` share branding, but private content follows a separate server authorization boundary. Public source contains the login shell, renderer and access code only. Real deck data, account identities and credential hashes stay in private server configuration, never Git or static assets.

## Local review

Run `npm run build`, then `npm run dev:presentation`. Open http://localhost:5190/presentation. Without account/data configuration the gate remains closed.

Private local files live under ignored `.data/investor-presentation/`:

- `decks.json`: base and personalized deck records keyed by deck ID.
- `access.json`: individually approved recipient records, each assigned exactly one deck.
- `private-access-receipt.json`: local-only credential receipt. Never commit it or put it in a public artifact.

After Tony approves a specific person, provision local access with `node scripts/provision-presentation-access.mjs --email=approved@example.com --name="Approved name" --deck=approved-deck-id`. This creates a random code and salted scrypt hash, expires access after seven days, and sends no invitation. Do not provision actual investors or transmit credentials without the recipient-specific approval. Each person uses their own email and private access code; possession of those details grants that account's deck, not independent verification of email ownership.

The Node server reads `PRESENTATION_ACCESS_JSON` and `PRESENTATION_DECKS_JSON` from private runtime configuration for hosted use. The local review script loads the ignored local files. No VITE-prefixed secret variable is used. Never upload the private data files as public assets or Docker build inputs.

## Personalization

Prepare a separate deck ID for each investor or approved audience. Customize the introduction, selected projects, opportunity, underwriting basis and next conversation. Assign that ID to the account record. A browser parameter cannot select another account's deck. Use a new approved source snapshot when figures change and keep source/date/status visible next to material numbers.

Invalidate access by disabling the account, changing its hash/deck assignment, or reaching its expiry. Sessions last at most four hours and also respect account expiry. Revocation is checked on every protected request; the browser refreshes its view on focus and every minute. A recipient may retain an already viewed or printed copy, so issue only the data that person may receive.

## Current preparation limits

The two supplied Wispr shared summaries were read; full transcripts need owner access and specific approval. The reusable development brief excludes unrelated account/security discussion. Do not treat meeting-summary action items as authorization to change other systems.

Selected Smartsheet records are financial research sources, not automatically approved investor claims. The private working example distinguishes reported land cost, budget projections, expected sale value, reserves and missing costs. Offer comparisons do not prove closed sale results. Do not invent portfolio revenue, realized returns or annual yields to fill a slide.

The repository is currently public. Keep all investor identities, raw notes and actual financial snapshots out of commits even if repository visibility changes later. The authenticated content API uses no-store headers; empty/malformed configuration denies access. Hosted financial data and real invitations remain pending approved recipients and completed access checks.

See `IMPLEMENTATION-QUEUE.md` for ordered work, `SECURITY.md` for the wider private-data boundary, and `RELEASES.md` for the existing website deployment authority. The public website authorization does not make private investor financial data public.
