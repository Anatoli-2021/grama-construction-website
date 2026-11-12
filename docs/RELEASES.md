# Review, deployment and rollback

## Website review target

The existing review website is [Grama Construction on Railway](https://grama-construction-website-production.up.railway.app/). The integration candidate is `feature/architectural-flagship`: it combines the multipage/private-presentation baseline, configurable Contact delivery and the architectural homepage prototype. The PR is the record of the exact tested and deployed SHA. Previous release notes are historical; do not treat an old branch or commit as the current runtime without checking Railway.

The latest rebranding addendum supersedes earlier deployment authorization for this candidate: **do not deploy the rebrand or replace the public identity before Tony approves it**. Commit/push, local concept review and the PR are authorized; production release is not yet approved. See [identity review](BRAND-REVIEW.md).

The company domain/DNS remains separate. The Development OS remains local. Actual private presentation data/accounts are server configuration, not public website assets. Hosted Contact delivery is separately enabled only after sender/key setup and receipt verification; deployment alone does not make it live.

## Release workflow

1. Refresh authenticated repository access and read current contributor instructions. Inspect status, preserve unfinished work, update clean main with `git pull --ff-only`, then use a dedicated `feature/*` branch. No force push, hard reset or direct main push.
2. Integrate intended published changes without discarding Contact, presentation authorization, cinematic media, the lot map or other contributors' work. Keep private client notes, recordings, credentials and enquiry evidence outside this repository.
3. Run `npm run check` and relevant API/media/browser checks against the actual candidate. Review desktop/mobile, direct routes, motion alternatives, lot/context flow, Contact availability and anonymous presentation access. Record measured results rather than repeating another sender's report.
4. Stage explicit intended non-sensitive files and inspect the full diff. Push, open a PR against main and request `Anatoli-2021` review. Reconcile the existing PR stack before merging. Do not self-merge owner-controlled changes.
5. Obtain Tony’s approval for this proposed identity and its release before deploying it. The prior standing website-review instruction does not authorize this new rebrand. Record the prior release and inspect the complete staged platform diff before applying it. New company-domain targets, spending, account/access grants, live enquiry activation and OS publication need their applicable authorization.
6. Deploy the tested candidate, then verify Railway SUCCESS and its exact commit hash. Check live HTML/assets, health, mobile navigation, private/source exclusions and Contact mode. Source branch configuration is not proof that GitHub autodeploy works; inspect actual deployment events and use the authorized connector workflow when necessary.
7. Record branch, changed files/features, test outcomes, preview URL, PR/reviewer, remaining questions, production status and next priorities. Leave missing provider/domain/inbox checks marked unrun.

## Indexing and domain launch

This review target remains noindex in HTML and response headers, with robots.txt blocking crawlers. Generating sitemap.xml does not authorize indexing. A company-domain launch requires a reviewed plan for canonical origin, metadata, robots and hosting headers, plus exact approved DNS records and rollback. Preserve existing mail records and do not change website routing to configure outbound email.

## Rollback

Keep the previous successful commit/deployment as the runtime rollback target. Redeploy that known version if an authorized release fails; verify its actual live state. Preserve Git history and use reviewed corrective commits or revert PRs instead of force-resetting shared branches.

To stop future enquiry delivery, set CONTACT_ENABLED=false through authorized runtime configuration and verify status false / POST503; this does not retract email already accepted. See [Contact delivery](CONTACT-DELIVERY.md). Code rollback does not restore operational data or account configuration.
