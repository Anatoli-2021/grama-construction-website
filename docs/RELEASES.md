# Review, preview, release and rollback

## Current state

The website is live at https://grama-construction-website-production.up.railway.app/. Last verified release before the private-presentation refinement: `6dda772`, deployed from `feature/investor-showcase-polish`. The next candidate is `feature/private-investor-presentation`; do not assume a pushed commit is live. See `TEAM-HANDOFF.md` for exact verified deployment evidence. Company domain/DNS remains unchanged. PR #1 and #6 are merged; PR #7 contains newer showcase work. Reconcile the older setup PR before merging it.

The Development OS demonstration remains local and contains only blank templates. No OS production deployment, company data migration or live connector was made.

## Workflow and release gate

1. Link one issue; create a `feature/*` branch and use synthetic records.
2. Run `npm ci` and `npm run check`; test website API/media with `npm run dev` plus `npm run verify` when relevant. Inspect the staged diff and media for private content.
3. Push and open a PR. GitHub Actions runs tests/build/data-boundary checks. Tony reviews the result, visible changes and remaining limitations.
4. Verify the website on the existing Railway review address. OS previews stay local until authentication and access tests are implemented.
5. Merge stable `main` after owner approval. Branch protection was unavailable when the repository was private; visibility has since changed to public, so recheck current capabilities before claiming an enforced gate. No protection rule is claimed by this handoff. Do not equate a green check with permission to deploy.
6. Record the release SHA, build result, target, previous version and rollback route. Tony's November 10 standing instruction authorizes deployment of requested, checked website changes to the existing Railway address without another release confirmation. New company-domain targets, spending, access grants and OS publication are separate decisions.
7. Deploy the approved commit to the approved environment. Verify HTML/media, mobile contact, links, anonymous access and no private artifacts; record deployment ID and SHA.

CI checks the code. The old Railway commit pin was removed and reconnecting the same source deployed commit `6dda772`, but a subsequent push did not create an automatic deployment. Treat webhook deployment as unverified. Run relevant checks before pushing, explicitly deploy the intended commit through the authenticated Railway control and verify its public result. Preserve PR review for stable `main`; this standing Railway approval does not authorize company DNS cutover. The private investor presentation is a separate access-controlled release and must never expose its data through this public static build.

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
