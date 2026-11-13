# Developer team handoff — November 13, 2026

## Final integration under review

- Repository: [Anatoli-2021/grama-construction-website](https://github.com/Anatoli-2021/grama-construction-website). Private business records, investor data and source conversations remain excluded.
- Current branch: `feature/final-website-integration`. Integration baseline `94d8759` reconciles stable `main` at `af3faf5b924865f898bb32f022ef84ab7e4aca94` with the Windows-verified feature stack at `21d8a6f8fceda7ff129390d141bd3eccdcf79ef1`. New design work follows that baseline.
- Use this integration branch’s pull request for the final review. Review target: [Railway staging](https://humorous-delight-staging-website.up.railway.app/). The final PR must record the candidate commit, deployment result, CI and browser evidence; the target URL alone is not proof of a verified release.
- Production at [gramadevelopment.com](https://gramadevelopment.com/) remains pinned to `21d8a6f8fceda7ff129390d141bd3eccdcf79ef1`. The final transformation has not been authorized for production. Obtain Tony's review and authorization before promotion; do not change company DNS as part of staging.
- Hosted Contact delivery remains disabled. Phone contact and an explicit browser-only draft are retained; no email provider is activated by the visual integration.

## What the candidate contains

The public identity is **GRAMA / Luxury Real Estate Development**, retaining Concept A and the circular G. Home leads with authentic company photography and selected completed cases. Developments separates proposed Dexter Acres from the completed Portfolio. About and Home show Tony and both approved original Alina photographs across the two pages. Official partner marks remain intact.

There are sixteen prerendered public pages: Home, Developments, About, Portfolio, eight completed cases, Dexter Acres, Partnerships, Animated Experience and Contact. Routes and metadata live in `src/site-routes.js`; case records and galleries live in `src/data/projects.js`. Completed-project attribution follows the original company portfolio and does not establish a sale or current availability.

The separate Animated Experience combines three Artlist concept scenes: arrival, interior and structural opening. Five chapters lead to a neighborhood overview. Scrolling drives the canvas without clicking Play; required desktop/mobile atlases load lazily into a bounded cache. Stills, reduced-motion opt-in, keyboard controls and a separately playable native MP4 remain available. The original Dexter Acres cinematic sequence and fourteen-lot map stay on its project page. The new sequence is an AI architectural visualization, not verified footage, engineering geometry or a measured room-to-room route. See [animation notes](ANIMATED-EXPERIENCE.md) and [asset provenance](ASSETS.md).

Contact carries only allowed topic/path and optional lot context between pages. Prerendered form controls cannot submit personal fields through native GET. Missing delivery configuration cannot report success. The local consented save workflow remains separate from hosted delivery; use synthetic data when testing. See [CONTACT-DELIVERY.md](CONTACT-DELIVERY.md).

## Setup and release boundary

Use your own GitHub account; `axmatea` is the correct collaborator identity. Verify access and current shared source before editing. Use Node 24, `npm ci`, `npm run dev` at port 5173, and `npm run check` for the shared build, tests and repository policy checks. The blank OS tool runs separately with `npm run dev:os` at port 5180.

Work on a focused feature branch and open a PR into stable `main`; request owner review before merging. Never force-push shared history. For this transformation, use the final integration PR and staging target rather than issuing competing releases from older branches. Follow [ONBOARDING.md](ONBOARDING.md), [CONTRIBUTING.md](../CONTRIBUTING.md) and [RELEASES.md](RELEASES.md).

Before claiming the candidate ready, record the exact deployed SHA, checks, desktop/mobile review, direct-route behavior, forward/reverse scroll, chapter and range controls, reduced-motion/stills/native-film fallback, original Dexter map and lot-to-Contact flow. The new three-scene journey requires its own browser evidence. Earlier Windows results apply to the production baseline, not automatically to the redesign.

The static runtime serves the website and the separate presentation authorization API. OS source, local enquiry records and private data are excluded. `/presentation` remains a generic login shell; actual financial records and individually authorized accounts require separate private runtime configuration. No populated deck or account list is committed. See [SECURITY.md](SECURITY.md) and [INVESTOR-PRESENTATION.md](INVESTOR-PRESENTATION.md).

## Existing production target

The existing Railway project is `earnest-wisdom`, project `ffb7baed-e751-41be-9874-c4eb4c4ae290`, service `875425ae-8bb5-4d47-a026-49a9df71dc22`, production environment `15058afa-2401-4d42-83a7-5e807d7d1258`. These identifiers describe the existing production target, not permission to deploy the new integration there. The root Dockerfile and [hosting settings](../infra/website/README.md) define the runtime.

Confirm the effective environment, source branch or commit pin, staged diff and intended deployment before applying a Railway change. A generic latest-commit command has previously selected older `main`; authenticated connector access does not prove the separate GitHub App or push-trigger configuration works. Verify deployment metadata against the tested commit instead of assuming autodeployment.

## Historical release evidence

The November 11 branch-repair release was `dcc95a45b00fda37667dbfb7554e47d8605fa489`, deployment `e713d762-3ff5-43bf-9fd5-62c4a21280ef`. [PR #10](https://github.com/Anatoli-2021/grama-construction-website/pull/10) and [CI run 42921303047](https://github.com/Anatoli-2021/grama-construction-website/actions/runs/42921303047) retain that evidence. Its fourteen-page checks, repaired feature-branch configuration and earlier deployment instruction describe that release; they are not current source declarations or authorization to publish this redesign.

The later Windows baseline is `21d8a6f8fceda7ff129390d141bd3eccdcf79ef1`, with production deployment `719a9f35-2ee9-43a2-956b-64a35f920c23`. [PR #22](https://github.com/Anatoli-2021/grama-construction-website/pull/22) records its Chrome/Edge wheel-only verification and the removal of the initial stationary scroll interval. Preserve those fixes when reviewing the new journey. Historical checks must not be relabelled as final-integration results.

## Remaining review items

- Complete one final integration PR with current staging deployment and browser evidence; obtain Tony's review before any production promotion.
- Verify the new journey on Chrome and Edge, mobile layouts, reduced motion, buffering/failure fallback and the original Dexter Acres map flow.
- Keep live Contact delivery disabled until approved configuration and a separately authorized end-to-end delivery test are complete.
- Keep financial claims, sales totals, availability, licenses and commercial commitments out of public copy until supported by approved records. OS authentication and operational integrations remain separate work.

References: [source inventory](SOURCE-INVENTORY.md), [assets](ASSETS.md), [release steps](RELEASES.md), [security](SECURITY.md), [hosting](HOSTING.md).
