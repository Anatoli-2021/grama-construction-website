# Contact enquiry delivery

Setup and verification guide. Official references checked **November 11, 2026**. This document describes the configuration and required checks; it is not evidence that an account, sender domain, deployment or inbox delivery has been verified.

Contact notifications use a server-side HTTP request to Resend. Browser code never receives the API key. Messages go to one configured, owner-approved recipient; there is no automatic acknowledgement to the person filling in the form. The notification is plain text, with fixed server-controlled sender/recipient and only the validated visitor address used as Reply-To. See the [Resend sending API](https://resend.com/docs/api-reference/emails/send-email) and [Node.js 24 fetch reference](https://nodejs.org/docs/latest-v24.x/api/globals.html#fetch).

## Disabled is the safe default

Delivery requires the literal CONTACT_ENABLED value true and all required configuration below. Missing, invalid or disabled configuration leaves GET /api/contact/status reporting {"enabled":false}; POST /api/contact returns 503 before collecting the request body.

The hosted interface must identify delivery as unavailable and offer an explicitly labelled draft option. A browser-only draft is not a sent enquiry. An error, timeout or unavailable provider must never produce a success message. Localhost's existing local-test-save flow remains separate from hosted email delivery.

| Endpoint | Contract |
| --- | --- |
| GET /api/contact/status | Returns {"enabled":boolean}; exposes no addresses or credentials. Configuration readiness is not proof of domain verification, quota availability or inbox delivery. |
| HEAD /api/contact/status | Same availability check, with no response body. |
| POST /api/contact | JSON enquiry fields plus path, interest, optional lot, consent:true and a UUID submissionId. The Idempotency-Key header must match that UUID. |
| Successful POST | HTTP 202 with {"status":"accepted","reference":"<UUID>"} only after Resend returns a valid provider message ID. Accepted means accepted by the provider, not confirmed in the recipient's inbox. |

## Account, sender and cost preparation

1. Use the authorized Resend account. Confirm its owner, access and current plan before creating credentials. Do not buy a domain, upgrade a plan or enable paid add-ons as an implicit part of setup.
2. Select an approved domain or subdomain the organization controls, for example notify.example.com. A recipient mailbox and a sender domain are different: a Gmail destination can receive notifications, but gmail.com is not a domain this project can verify as its own sender.
3. Add the sending domain in Resend and use the exact DNS record list it supplies. Sending must be verified before enabling CONTACT_FROM. Resend recommends a separate sending subdomain. [Verified domains](https://resend.com/docs/dashboard/domains/introduction), [domain setup](https://resend.com/docs/add-a-domain).
4. Create a sending-access API key restricted to the verified domain where supported. Enter it directly in the server's Railway variables; do not paste it into Git, screenshots, public logs or browser code. [Resend API keys](https://resend.com/docs/dashboard/api-keys/introduction).

At the date checked, Resend's transactional Free plan lists 3,000 emails per month and a 100-email daily cap. Provider rate limits also apply, and test emails consume quota. Confirm the actual account's current limits before testing; do not assume unlimited or permanently free sending, or authorize spending through this guide. [Pricing](https://resend.com/pricing), [usage limits](https://resend.com/docs/api-reference/rate-limit), [provider test-email guidance](https://resend.com/docs/dashboard/emails/send-test-emails).

## DNS changes require an exact approved record plan

Before changing DNS, record the proposed sender domain, provider region, each record's type/name/value, priority if applicable, TTL and purpose. Save the existing records and have the domain owner approve this precise change set.

Add only the records required for the approved sending setup. If Resend specifies a Return-Path or MX record, confirm its exact subdomain and purpose before applying it. Preserve existing mailbox MX, SPF/DMARC settings and website A/AAAA/CNAME records unless a specific modification is approved. Do not replace a company's receiving-mail configuration or repoint its website just to enable notifications. Receiving email through Resend is a separate feature and is not required by this outbound-only integration.

Return to Resend and verify the actual sending-domain status. A copied DNS record or a pending verification screen is not completion. This guide supplies no account-specific DNS values and does not authorize record changes.

## Railway configuration

Configure these **server runtime variables** on the intended website service/environment. Values below are examples, not usable credentials or an approved destination.

| Variable | Required value |
| --- | --- |
| CONTACT_ENABLED | true only when setup is ready and activation is authorized; otherwise false or unset |
| RESEND_API_KEY | Secret from the authorized Resend account |
| CONTACT_FROM | One bare sender email address on the verified domain; no display name or address list |
| CONTACT_TO | One bare, approved recipient email address; no display name or address list |
| CONTACT_ALLOWED_ORIGINS | Comma-separated exact HTTPS origins, including every authorized website origin |

Example preparation, still disabled:

~~~text
CONTACT_ENABLED=false
RESEND_API_KEY=<set privately in Railway>
CONTACT_FROM=enquiries@notify.example.com
CONTACT_TO=recipient@example.net
CONTACT_ALLOWED_ORIGINS=https://grama-construction-website-production.up.railway.app
~~~

Use origins only: scheme plus hostname and any explicit port, without a path, trailing slash or wildcard. Production configuration uses HTTPS; loopback HTTP allowances belong to isolated tests, not the deployed allowlist. Do not put any of these settings in VITE_ variables or commit a populated .env file. Railway PORT remains the service's normal port setting.

Apply the variables to the intended running deployment and recheck status; editing a variable screen alone does not prove the process has loaded it. Set CONTACT_ENABLED=true only after the sender, destination, origin list and release are ready. To change the recipient later, update CONTACT_TO to the newly approved single address in Railway, apply the change and repeat receipt verification. Do not hard-code the address in source.

## Retry and data boundaries

Each new enquiry uses a fresh UUID. Retry an uncertain request with the **same UUID/header and identical payload**; do not create a new ID merely because the browser timed out. Reusing an ID for different content must be rejected. The application keeps an in-memory hash-based duplicate guard, while Resend supports provider idempotency for 24 hours. This is not a durable lead queue or indefinite deduplication guarantee. [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).

The hosted application does not persist enquiry PII or log message contents. The provider and destination mailbox still process the notification, so confirm their access and retention settings with the operational owner. Keep actual submissions, provider logs and receipt evidence outside the public repository. This feature adds no CRM, visitor mailing list, auto-response or outbound marketing workflow.

## Verification before calling delivery complete

Run the repository's normal npm run check and relevant contact tests with mocked provider responses first. Cover disabled/missing configuration, invalid origins, malformed fields, missing consent, honeypot, oversized body, rate limiting, same-ID retries, changed-content conflicts, provider rejection and timeout. No provider request should occur when disabled.

After configuration and activation are authorized, use synthetic data and only the approved destination for end-to-end checks. The sender identity must already be verified. Run cases sequentially within application/provider limits; do not use real customer details or call a telephone number as part of testing.

| Case | path / interest | Check |
| --- | --- | --- |
| 1 | home / Dexter Acres | Correct enquiry type; no lot required |
| 2 | home / Custom home | No Dexter lot attached |
| 3 | development / Landowner opportunity | Correct opportunity type |
| 4 | development / Investment partnership | Correct opportunity type |
| 5 | development / Development partnership | Correct opportunity type |
| 6 | home / Dexter Acres | Full buyer example: selected lot 4 plus synthetic phone, location where applicable, timeframe and details; explicit consent |

Use a distinct submission UUID for each new case. Exercise all 14 lot selections in local validation/browser checks; the full notification case above does not require sending 14 duplicate test emails.

For each real-send case, record its application reference privately, verify the expected provider activity/message and ask the approved recipient to confirm the actual notification and content. Inspect spam/junk placement and check for delayed, failed, bounced or suppressed events. Provider sent/accepted status alone is insufficient. The provider's retrieve API exposes last_event; its event definitions distinguish the delivery lifecycle. [Retrieve sent email](https://resend.com/docs/api-reference/emails/retrieve-email), [email events](https://resend.com/docs/webhooks/event-types).

Test bounce/failure handling with mocks first. A real provider bounce simulation requires an approved isolated test destination/setup; use Resend's documented test addresses rather than inventing a recipient or changing the live destination to force an error. Such tests consume quota. Do not report a real bounce, inbox receipt or a successful acknowledgement until that outcome was actually observed. No acknowledgement is sent to the visitor by this implementation.

The release record must separate: code checks passed; service configured; provider accepted; provider delivery event observed; recipient confirmed receipt. Leave any unperformed check marked unrun. No live-delivery outcome is asserted by this setup document.

## Disable or roll back delivery

Set CONTACT_ENABLED=false in the website's Railway runtime variables, apply the change and verify the updated service reports {"enabled":false}. POST /api/contact must return 503 without collecting the body; the interface must return to unavailable/draft-only wording without reporting a sent enquiry.

Disabling delivery does not retract messages already accepted by the provider. Investigate a failure through authorized provider activity and recipient checks, without exposing payloads or secrets. If a key is compromised, revoke/replace it through the authorized account and reconfigure privately. Use the existing [release and rollback procedure](RELEASES.md) for a code rollback; preserve the site's routes, media and current private-investor boundaries.
