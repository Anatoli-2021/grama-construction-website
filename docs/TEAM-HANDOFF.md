# Developer team handoff — November 10, 2026

Current central coordination: [TEAM_HANDOFF.md](TEAM_HANDOFF.md) (underscore). This hyphenated file is preserved as historical evidence.

> Historical handoff below. For the November 12 infrastructure work use [current readiness](INFRASTRUCTURE-READINESS.md), [task handoff](handoffs/infrastructure-2026-11-12.md) and [Claude's next-task prompt](CLAUDE-INFRA-HANDOFF.md). GitHub currently reports public visibility; older private/no-staging/no-deployment descriptions below are historical, not current verification.

## Start here

- Repository: https://github.com/Anatoli-2021/grama-construction-website (currently public; keep all business records outside Git).
- Working setup branch: `feature/unified-development`.
- Website preview source: PR #1. Unified deployment/tooling: PR #2, based on PR #1. Review and merge #1 first; then retarget #2 to `main` for review. Neither is automatically merged.
- Setup: Node 24, `npm ci`, `npm run check`. Website: `npm run dev` (5173). OS: `npm run dev:os` (5180).
- Full developer steps and permissions: [ONBOARDING.md](ONBOARDING.md).

## What is ready

The original website and assets remain intact. A website-only Dockerfile and static host are ready for Railway; the runtime excludes the OS and local enquiry records. Existing source paths are unchanged. The reusable blank OS launch tool is shared and tested, including common/subdivision tasks, stable IDs, Draft status and access boundaries.

GitHub Actions ran successfully on the clean Linux runner after correcting build-before-test order. Local checks also passed, including the existing nine website API/media checks. The browser downloaded a real synthetic 29-task Draft export without console errors. Desktop source HTML and JSON hashes remained unchanged.

## Existing Railway target

- Project: `earnest-wisdom`, ID `ffb7baed-e751-41be-9874-c4eb4c4ae290`.
- Service: `grama-construction-website`, ID `875425ae-8bb5-4d47-a026-49a9df71dc22`.
- Environment: Railway labels it `production`, ID `15058afa-2401-4d42-83a7-5e807d7d1258`; its intended use here is a temporary website preview, not replacement of the company site.
- Observed state before configuration: online initial GitHub deployment, `main` source, no public domain, private `*.railway.internal` endpoint. GitHub branch loading reported an error.
- Existing Railway trial shows 30 days / $5 credit remaining at inspection; no paid upgrade was purchased. This is a point-in-time UI observation, not a permanent hosting allowance.
- A project invitation already existed. Verify the recipient and acceptance in Railway before creating another invitation. Do not publish invite links, auth codes or tokens in GitHub.

## Immediate deployment work

Tony authorized this temporary Railway website deployment and keeping the company domain unchanged. Browser connectivity stopped before settings/domain changes could be applied. Restore the existing browser connection or authorize the Railway connector, then:

1. Confirm this exact project/service; do not create another repository or service.
2. Select the reviewed deployment commit/branch without replacing stable `main`. Refresh/repair the GitHub repository integration if branches cannot load.
3. Use the root Dockerfile, service PORT and `/healthz`; remove conflicting old build/start overrides. See [Railway settings](../infra/website/README.md).
4. Generate a temporary Railway HTTPS domain. Do not edit company DNS or add a custom company domain.
5. Wait for the deployment, record its source SHA and deployment ID, then verify anonymous HTTP 200, actual images/video, mobile contact, console errors and blocked private/OS/API paths.
6. Update this handoff with the verified URL and result. A running container or private internal hostname alone is not public deployment completion.

The working Sites review URL remains available: https://grama-dexter-acres-preview.anatoli-gram-1564.chatgpt.site.

## Remaining gates and owners

- Tony: review PRs, confirm Railway team invitation recipient/acceptance, approve future paid hosting or GitHub plan changes, and approve any eventual company-domain release.
- Developers: complete/verify Railway preview after connection restoration; keep all OS records private. Issues #3 and #4 track OS authentication and enforceable owner review.
- OS: no hosted service, database, live connector or company-data migration exists. Follow [SECURITY.md](SECURITY.md) before connecting private records.
- GitHub: `main` is unprotected under the current plan. CI and documented owner review exist; enforced review/production gates require further setup.

Source details: [SOURCE-INVENTORY.md](SOURCE-INVENTORY.md). Platform decision: [HOSTING.md](HOSTING.md). Approval and rollback: [RELEASES.md](RELEASES.md).
