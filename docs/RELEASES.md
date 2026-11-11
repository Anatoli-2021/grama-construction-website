# Review, preview, release and rollback

## Current state

The website is live at https://grama-construction-website-production.up.railway.app/. The November 11 branch repair deployed `dcc95a4` from `feature/private-investor-presentation` as deployment `e713d762-3ff5-43bf-9fd5-62c4a21280ef`; CI passed. The source now retains the feature branch without a pin. Application code remains the checked `bc8e81b` implementation, including Nail's multipage work. See `TEAM-HANDOFF.md` and PR #10 for current deployment and push-test evidence. Company domain/DNS remains unchanged. Reconcile the PR stack before merging to stable main.

The Development OS demonstration remains local and contains only blank templates. No OS production deployment, company data migration or live connector was made.

## Workflow and release gate

1. Link one issue; create a `feature/*` branch and use synthetic records.
2. Run `npm ci` and `npm run check`; test website API/media with `npm run dev` plus `npm run verify` when relevant. Inspect the staged diff and media for private content.
3. Push and open a PR. GitHub Actions runs tests/build/data-boundary checks. Tony reviews the result, visible changes and remaining limitations.
4. Verify the website on the existing Railway review address. OS previews stay local until authentication and access tests are implemented.
5. Merge stable `main` after owner approval. Branch protection was unavailable when the repository was private; visibility has since changed to public, so recheck current capabilities before claiming an enforced gate. No protection rule is claimed by this handoff. Do not equate a green check with permission to deploy.
6. Record the release SHA, build result, target, previous version and rollback route. Tony's November 10 standing instruction authorizes deployment of requested, checked website changes to the existing Railway address without another release confirmation. New company-domain targets, spending, access grants and OS publication are separate decisions.
7. Deploy the approved commit to the approved environment. Verify HTML/media, mobile contact, links, anonymous access and no private artifacts; record deployment ID and SHA.

CI checks the code. An environment-scoped staged source repair retained the feature branch and removed only the temporary commit pin. For subsequent pushes, compare the actual Railway deployment SHA with the intended source and GitHub CI; PR #10 records the push-test evidence. Source configuration alone does not prove webhook delivery. Prefer a reviewed environment-scoped diff over replacing the live source, which previously dropped the branch. Preserve PR review for stable `main`; this standing Railway approval does not authorize company DNS cutover. Private investor content must never enter the public static build.

## Domain cutover plan — approval required

Inventory current registrar/DNS, hosting and mail records read-only. Save a DNS export and prior target. Verify the chosen platform’s exact hostname/certificate instructions on its temporary address. Present Tony the precise DNS record changes, website release SHA, test result and rollback target. Change only approved web records; preserve email records. Verify TLS, www/apex routing and contact flow after cutover. No domain records have been edited in this task.

## Rollback and backups

- Code: keep commits/PRs; use a reviewed `git revert` PR for a bad merge. Do not reset/force-push shared `main`.
- Website: redeploy a known-good approved commit/version, verify media and contact behavior, and record the rollback. On Sites, redeploy the saved previous version; on Vercel use its documented rollback when available. This preparation does not prove an account-specific rollback until it is exercised there.
- DNS: restore only the previously saved, approved web record if cutover fails. Certificate/cache propagation may take time; check the actual provider behavior.
- OS: application rollback does not roll back database schema/data. Require reversible migrations or a tested forward fix, encrypted snapshots and a restore drill. Backups must live outside Git and the public website.

## Demonstrations in this change

- Website: existing hosted-contact adjustment is in PR #1 and the functioning public review preview; current website source/layout is preserved.
- OS: the shared launch tool rejects whitespace/unsafe Project IDs, preserves common/subdivision task counts and dependencies, and exports Draft records. Automated tests cover this behavior and local/public access boundaries.
- Current Railway verification: public HTML, health and hero media return HTTP 200; private/OS paths return 404; the loaded site has no console errors. Future changes must be checked against their actual deployed commit. A hosted OS demonstration remains deferred until access controls exist.
