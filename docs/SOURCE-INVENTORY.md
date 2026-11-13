# Source inventory — November 13, 2026 integration

## Current website integration

`feature/final-website-integration` reconciles `main` at `af3faf5` and the Windows-verified website stack at `21d8a6f`, with merge baseline `94d8759`. One final review PR is pending. The [staging target](https://humorous-delight-staging-website.up.railway.app/) is for review; production at [gramadevelopment.com](https://gramadevelopment.com/) remains pinned to `21d8a6f8fceda7ff129390d141bd3eccdcf79ef1`. Tony's authorization is required before promoting this transformation.

| Source / implementation | Treatment in the final candidate |
| --- | --- |
| Existing company website and [completed portfolio](https://www.gramaconstruction.com/completed-projects) | Authentic project photographs, eight completed case records, Tony's photograph and original partner marks retained. Completed does not imply sold or available. |
| Both original Alina JPEGs published on the company site | Preserved at native pixels without face edits or upscaling; one appears on Home and the other on About. First name and family relationship were directly confirmed. |
| Original company homepage residential photograph | Restored unchanged from the earlier PR #20 derivative as `photo/residences.webp`; exact project addresses and sale status are not inferred. |
| Prospect Lane, Lee Street and Sedgwick official case galleries | Selected same-property exterior/interior photographs support expanded cases. Photographs establish project attribution, not a measured camera route. Exact public sources are in [ASSETS.md](ASSETS.md). |
| Existing Dexter Acres concepts, cinema and supplied C5 drawing | Original cinematic sequence and interactive fourteen-lot map preserved on the Dexter Acres page; concepts remain distinguished from actual photography and the supplied plan. |
| Artlist arrival, interior and structural concept scenes | Three forty-frame scenes drive the separate Animated Experience, with lazy viewport-specific atlases, an overview image, stills and a native-film fallback. These are generated architectural visualizations. |
| Public route registry and case data | `src/site-routes.js` defines sixteen public pages; `src/data/projects.js` defines completed cases. Home, Developments, Portfolio, About, Partnerships, Animated Experience and Contact share the public navigation. |
| Existing Contact and private-presentation code | Retained behind their existing configuration and authorization boundaries. Hosted Contact delivery stays disabled; private financial/account content remains outside Git and static assets. |

The [Compass development site](https://www.compass.com/development/), [Noah Properties](https://www.noahchicago.com/), [Related Group](https://relatedgroup.com/), [Terra](https://www.terragroup.com/) and [Fortune International Group](https://fortuneintlgroup.com/) informed hierarchy, typography roles and project-led composition. No reference-site copy, photographs or code were imported.

This inventory records source scope, not independent verification of project economics, legal entity, current listings or engineering approvals. See [team handoff](TEAM-HANDOFF.md) for the current release boundary and checks; original research and communications remain private.

## Historical source review — November 10, 2026

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

- Website: final integration review, verified staging release and Tony's authorization before production; separately approved live enquiry delivery and final factual content review. The existing production domain is not changed by this candidate.
- OS: identity provider, project-level access rules, live read adapters, protected database, audit trail and verified backup/restore.
- Private pilot: operational/financial QA findings stay with Tony and the existing pilot owner; this code preparation does not resolve or approve those records.
- No automatic coordination between Codex chats, live Smartsheet writes, agent scheduling or financial posting is established by this repository.
