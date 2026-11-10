# Website vision and implementation roadmap

Grama Construction's website should help investment partners, developers, property owners and custom-home clients understand the company, assess its work and begin a useful conversation. The direction is a premium architectural showcase with clear evidence, readable content and a practical development journey.

Milestones below describe proposed work and acceptance criteria. They do not promise dates, fees, investment results, search rankings or lead volumes.

## M1 — Delivered showcase and responsive refinement

Website release `e2dca4d` provides:

- An investor/developer-facing introduction and partnership CTA while retaining custom-home enquiries.
- The company and family story featuring Anatoli (Tony) Grama and Alina, using existing official portraits.
- A source-backed completed-project portfolio, existing company/partner logos and a clearly separate proposed Dexter Acres development.
- Refined typography, section hierarchy and mobile presentation.
- The preserved architectural cinematic sequence and interactive 14-lot plan, with accessible navigation, project dialogs and consultation paths.

The Railway address is the review deployment; the company domain remains a separate release decision. Hosted enquiries currently support a clearly labelled browser-only draft review and send nothing to a server. Local development retains its local-save workflow. No email/CRM delivery or reservation is implied.

## M2 — Implemented page depth and project navigation

The multipage release implements fourteen prerendered pages: the company homepage, About/team, Projects, eight individual case studies, Dexter Acres, Partnerships and Contact. Services are described on About; the seven-stage process is on Partnerships. The cinematic sequence and14-lot plan remain available on the homepage and dedicated Dexter Acres page.

Implemented acceptance criteria:

- Public pages have meaningful URLs, direct navigation and refresh support, distinct titles/descriptions and a consistent navigation system.
- Project browsing supports approved upcoming, current and completed statuses. Introduce current projects only when their status is supported; do not invent inventory to populate a filter.
- Individual cases explain location, Grama's role, scope, status and relevant photography without confusing proposed work with completed achievements.
- Unknown URLs return a genuine 404. Source, private-data, OS and API paths remain inaccessible in the public website service; routing must not replace these boundaries with a blanket fallback.
- Desktop, mobile, keyboard navigation, cinematic behavior, lot selection and consultation paths remain verified.

The existing React/Vite build prerenders each known route to static HTML with page-specific metadata. The static host resolves real page documents and returns a separate404 for unknown routes. Project status filters include an honest empty current-listings view; no active inventory is invented.

## M3 — Approved project proof and financial context

Maintain an approved project register and asset inventory. Add dates, scope, sold status, sale prices or aggregate metrics only when their source, definition, period and attribution are confirmed and public disclosure is approved.

Keep these measures distinct:

- Completed work versus sold properties.
- Asking prices versus verified closed-sale prices.
- Whole-project development value versus Grama-attributable work.
- Project/sale values versus the named company's revenue.
- Proposed pipeline versus realized results.

Supporting records remain private; the website receives only approved summaries and licensed assets. Continue refining the company story through confirmed biographies, roles and original media. Omit unsupported badges, counters, timelines and performance claims.

## M4 — Reliable enquiry delivery

Confirm the real recipient or CRM, operational owner and intended response process before enabling hosted submissions. Then implement and test server validation, spam controls, delivery, failure handling, useful confirmation, monitoring and the agreed privacy/retention practices.

Acceptance requires synthetic end-to-end evidence that the correct destination receives the intended enquiry, failures are recoverable and confirmation accurately describes the outcome. Replace browser-only draft wording only when real delivery is connected and verified. Keep telephone contact available.

## M5 — Reviewed company-domain launch

Reconcile and review the PR stack, approve the release commit and verify the website on its review address. Company-domain cutover requires separate approval of the target, exact web DNS changes, certificate/routing behavior and rollback destination. Preserve mail records and verify the resulting site and contact journey after any approved change.

Page metadata and local business information should use confirmed company facts and contact details. Keep preview indexing policy distinct from the eventual approved company launch.

## M6 — Future Development OS

Treat the OS as a separate product track. The existing blank local launch tool is not an authenticated multi-user operating platform. Decide whether future OS work belongs in a separate repository or an explicitly isolated application boundary before expanding or moving source.

Define users, workflows, authoritative systems, project roles, data ownership and approval needs first. Public website hosting must remain separate from operational/financial records and authenticated OS services. No OS publication, live-data migration or connector write access follows automatically from a website release.

## Development and review discipline

Use focused feature branches and reviewed PRs. For each milestone record its scope, source/asset approvals, acceptance checks, release SHA, deployment target and rollback route. Preserve working features and run relevant build, behavior, responsive and access-boundary checks before promotion.

Related guides: [asset provenance](ASSETS.md), [hosting](HOSTING.md), [security boundaries](SECURITY.md), [release workflow](RELEASES.md).
