# Source inventory — verified November 10, 2026

## Reviewed sources

| Source | Finding / disposition |
| --- | --- |
| This Webdesign / Webster Dexter chat and website handoff | Existing working website, assets, local forms, animation and lot map retained |
| Grama AI Project Manager chat | Coordination/architecture proposals; no separate deployed application or code edits found in the reviewed handoff |
| OS Real Estate AI Pilot chat and latest local handoffs | Existing local HTML tools, private dashboard, operational pilot and reusable template; not a deployed authenticated app |
| Desktop `Grama Construction - Development OS` | Current local navigation and private artifacts; originals remain untouched |
| Operations output `Grama-Development-OS-2026-11-09/activation` | Retained original launch/template/dashboard builders and handoff |
| November 10 Operational QA handoff and template results | Functional draft exports with a whitespace-ID defect; private dashboard is static; broader operational and finance findings remain in the private QA package |

Only relevant portions of the named chats and handoffs were reviewed. This inventory does not imply every historical message, linked financial file or external source was audited.

## Reused code and private sources

| Artifact | Technology | Shared treatment |
| --- | --- | --- |
| Website | React, Vite 8.3.6, GSAP; native Node local API | Original root paths retained. Existing optimized media included |
| New Project Launch Template.html | Standalone HTML/CSS, embedded specification, browser download | Reused in `apps/development-os/launch.html`; builder separated into an ES module; ID validation added |
| New Project Launch Template.json | Blank 1.0-pilot specification, 29 tasks | Copied unchanged; no populated intake, project assignment, private URL or email |
| Tony Dashboard.html | Static HTML snapshot with real records and private links | Excluded. Shared workspace page explains where the real dashboard remains |
| Sprucewood pilot, workbook, QA evidence, source maps | Real operational, financial and source data | Excluded; existing private systems remain authoritative |
| Actual launch exports | User-entered project data | Download locally; `exports/` is ignored; never commit populated files |

Original HTML SHA-256: `038397f2158107d7341b7634201f5323b25eda3cbc5b5205a68c273cbf3f73c1`.
Original specification SHA-256: `cd44fb3386178dbdcabe7b13d42f7d6d0362ad89b47924974d25c7c46613a064`.

## Incremental monorepo layout

```text
src/ + public/                 existing website application
server.mjs                     existing local website / enquiry API
apps/development-os/           reusable blank intake application and tests
packages/shared/               data-free validation utilities
scripts/                       website checks and static host
infra/website/README.md      website Dockerfile and Railway settings guide
vercel.json                    alternative static website configuration
.github/                       CI, ownership, issue and PR templates
docs/                          inventory, onboarding, hosting, security, releases
```

There is one website source, not a second copy under `apps/`. A later reviewed move to `apps/website` is optional; it is not necessary to collaborate or deploy these two products separately.

## Remaining product work

- Website: approved production hosting, real enquiry delivery, domain choice and final content review.
- OS: identity provider, project-level access rules, live read adapters, protected database, audit trail and verified backup/restore.
- Private pilot: operational/financial QA findings stay with Tony and the existing pilot owner; this code preparation does not resolve or approve those records.
- No automatic coordination between Codex chats, live Smartsheet writes, agent scheduling or financial posting is established by this repository.
