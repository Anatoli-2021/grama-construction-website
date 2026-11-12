# Review, preview, release and rollback

## Current state

November 12 infrastructure status: two isolated empty Railway environments, staging-website and staging-os, are created. Existing production was not reconfigured by this work. The older source/preview statements below are historical; use [current readiness](INFRASTRUCTURE-READINESS.md) and [staging procedure](../infra/staging/README.md) before any deployment.

The company production domain is unchanged. The public Sites review preview is tied to web source commit `a339806ee240c4546a5b3c2b75f0276136f6b108`; its hosted contact section does not collect personal data. PR #1 contains that source. The unified-workspace PR builds on PR #1, without merging either change into `main` automatically.

The Development OS demonstration remains local and contains only blank templates. No OS production deployment, company data migration or live connector was made.

## Workflow and release gate

1. Link one issue; create a `feature/*` branch and use synthetic records.
2. Run `npm ci` and `npm run check`; test website API/media with `npm run dev` plus `npm run verify` when relevant. Inspect the staged diff and media for private content.
3. Push and open a PR. GitHub Actions runs tests/build/data-boundary checks. Tony reviews the result, visible changes and remaining limitations.
4. Preview the website only. Use existing Sites review deployment or an approved hosting PR preview. OS previews stay local until authentication and access tests are implemented.
5. Merge only after independent review and Tony approval. Main protection was prepared but its save awaits GitHub identity confirmation; verify the actual saved rule before claiming enforcement. Do not equate a green check with permission to deploy.
6. Record the approved release SHA, build result, target, previous version and rollback route. Obtain Tony’s explicit approval for the production target and cost before activation.
7. Deploy the approved commit to the approved environment. Verify HTML/media, mobile contact, links, anonymous access and no private artifacts; record deployment ID and SHA.

The prepared CI does not deploy. Once the selected platform is approved, connect branch previews and gate production promotion with supported environment approval controls. If the account cannot enforce that gate, retain manual owner promotion; do not allow every push to update company production.

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
- Pending: independent human review, merge and approved hosting integration; a hosted OS demonstration is deliberately deferred until its access controls exist.

## Exact-commit preview and rollback acceptance

- Keep website and OS preview sources explicit and record the exact commit, build result, deployment/image ID, environment and prior known-good release. Branch names alone are insufficient.
- PR CI uses synthetic data, read-only permissions and no deployment credentials. Keep Railway automatic PR environments disabled until cost, isolation and public/private exposure are approved.
- Before enabling the private OS, run anonymous, wrong-role, wrong-project, file/export, revoked-session and stale-source checks against the actual runtime. A UI screenshot or unit policy test is not a passing runtime test.
- For a synthetic staging rollback drill, deploy reviewed version A, record health/assets/auth behavior, deploy reviewed version B, then restore A and repeat checks. Record the outcome. No such runtime drill has run yet.
- Production rollback uses the approved prior deployment/image, not an unreviewed feature branch. Database compatibility and restore are separate gates; application rollback must not destroy newer records.
- Before /platform routing, verify root/website/contact/presentation routes, OS assets/callbacks/API paths, cookie scope, authenticated caching and denial of private data. Never route the existing public static fallback to OS source.
