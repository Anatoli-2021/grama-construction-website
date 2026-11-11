# Developer team handoff — November 11, 2026

## Verified live website

- Repository: https://github.com/Anatoli-2021/grama-construction-website (currently public, verified through GitHub). Private business and investor data remain excluded.
- Railway website: https://grama-construction-website-production.up.railway.app/.
- Connected source: `feature/private-investor-presentation`, with the branch retained and no commit pin after the environment-scoped repair on November 11. Per-push deployment evidence is recorded in PR #10; configuration alone is not proof of a webhook deployment.
- Verified branch-repair release: `dcc95a45b00fda37667dbfb7554e47d8605fa489`, Railway deployment `e713d762-3ff5-43bf-9fd5-62c4a21280ef`, SUCCESS on November 11 at 19:47 UTC. Its application code is unchanged from the previously checked `bc8e81b`. Root Dockerfile, port 8080, `/healthz`, one replica in `sfo`.
- Live checks: all fourteen public pages HTTP 200; five served JS/CSS assets match the checked local build byte for byte; health HTTP 200; OS, `.data`, `.env` and unknown URLs HTTP 404. `/presentation` is a no-store login shell; anonymous deck access is HTTP 401 and unconfigured login is HTTP 503. Actual financial data/accounts are not hosted.
- Previous checked release: `bc8e81b`, deployment `3d5b57ed-6b7b-4473-a859-2a539d76bde3`; use deployment history to verify the available rollback/redeploy action. Nail's earlier multipage release `a73c017` is preserved in source/history.
- [PR #10](https://github.com/Anatoli-2021/grama-construction-website/pull/10) records current deployment evidence; [CI run 42921303047](https://github.com/Anatoli-2021/grama-construction-website/actions/runs/42921303047) passed all checks for the branch-repair source. Later documentation-only commits do not alter the application.
- Preserve the team's newer investor showcase, family story, project portfolio and browser-only enquiry draft. Do not deploy the older setup branch over it.
- Company domain/DNS is unchanged. Railway labels this environment `production`; the Railway address remains the current development/review website.

## Tony's standing website deployment instruction

On November 10, Tony instructed: finish requested website changes, run relevant checks, commit and push them, then deploy to the existing Railway website and verify the result. Another release confirmation is not needed for each requested website edit to this target.

This covers requested website work through deployment. It does not create a background job or authorize unrelated changes. Keep branches and PR review for stable `main`; never force-push shared history. Company-domain/DNS changes, new spending, access grants and private OS publication remain separate decisions.

The Railway connector is authenticated. On November 10, a live source replacement without a pin dropped the branch; a generic latest-commit command selected older `main`. The integrated build was restored and temporarily pinned. On November 11, an environment-scoped staged source update retained the correct branch and removed only `source.commitSha`. The reviewed single-field change was applied through the dashboard after the connector's accept-deploy returned `INVALID_ARGUMENT`. Railway then built `dcc95a4` from the correct feature branch, with no staged changes left. No source or Git history was lost.

For later source changes, inspect the environment's staged diff and effective source before deploying. Avoid a broad live reconnect that silently drops the branch. Never assume a generic latest-commit command selects the intended branch; confirm its source first. Verify each pushed commit against the deployment metadata and CI; the latest push-test result is recorded in PR #10.

Push test `4db877f` passed CI but created no Railway deployment. There are no watch-path exclusions in the service configuration; the dashboard reports "Auto deploy unavailable" and cannot load branches. The connected account is `Anatoli-2021`; its existing OAuth connection was refreshed, but the account's Installed GitHub Apps list does not contain Railway App. Installation is prepared for this repository only and awaits Tony's explicit approval of the new App permissions. No installation or expanded access has been granted. After approval, finish the prepared installation, enable/verify autodeploy and test another real push. Do not equate the authenticated Codex Railway connector with the separate GitHub App installation.

Run relevant local checks before pushing to the connected branch: Railway may deploy while GitHub CI runs. Stable `main` keeps its PR review convention; server-enforced review and CI-before-deploy gates are not claimed.

## Team source and setup

- `main` was verified at `af3faf5b924865f898bb32f022ef84ab7e4aca94` before this documentation update. PR #1 and #6 are merged.
- PR #7 contains the earlier showcase branch; PR #9 adds the multipage website. The new private-presentation branch integrates both. PR #2 is an older setup PR; reconcile already-included changes before merging it. Do not blindly reintroduce old source.
- `axmatea` has approved GitHub write access and authored the prior multipage Railway release. Check current access before sending duplicate invitations.
- Node 24; `npm ci`; `npm run check`. Website: `npm run dev` at port 5173. Blank OS tool: `npm run dev:os` at port 5180.
- Fetch the latest shared source before editing. Follow [ONBOARDING.md](ONBOARDING.md) for branches, PRs and safe synchronization.

## Existing Railway target

Project `earnest-wisdom`: `ffb7baed-e751-41be-9874-c4eb4c4ae290`.
Service `grama-construction-website`: `875425ae-8bb5-4d47-a026-49a9df71dc22`.
Environment `production`: `15058afa-2401-4d42-83a7-5e807d7d1258`.

The root Dockerfile serves the website and the separate presentation authorization API; OS source, private data files and local enquiry records are excluded from its runtime. Real presentation data/accounts must be supplied through private runtime configuration. Without it the portal stays closed. See the [settings guide](../infra/website/README.md). No paid upgrade or company-domain change was made during this verification. Do not publish credentials or invite links.

## Private presentation and public refinement

The `feature/private-investor-presentation` branch preserves Nail's newer multipage website, including fourteen prerendered public pages, eight completed case studies, filters, galleries, contextual contact links and a genuine 404 page. Routes are in `src/site-routes.js`; public project records are in `src/data/projects.js`. The build runs Vite and `scripts/build-pages.mjs`; Docker includes both build inputs and the separate presentation entry.

The refinement adds sans-serif typography across those pages, quieter captions, responsive residence/detail/community scroll animation and reduced-motion fallback. `/presentation` is a separate generic login shell with individually assigned decks, expiring/revocable access and server-only content. See [INVESTOR-PRESENTATION.md](INVESTOR-PRESENTATION.md) and [INVESTOR-CONTENT-BRIEF.md](INVESTOR-CONTENT-BRIEF.md).

Local private working review: `npm run build`, then `npm run dev:presentation`, http://localhost:5190/presentation. The owner-machine working deck and source snapshot are under ignored `.data/investor-presentation/`; they are intentionally absent from this public repository. Use individually authorized source connections for financial research. Never copy private figures or transcripts into issues, PRs, fixtures or public assets.

The integrated release passed build, 91 tests (including all fourteen prerendered public routes, metadata, true 404s, local preview and private-access behavior), repository policy and a separate scan against private local values. Browser checks confirmed sans-serif headings on company/project pages, completed-project filtering, case gallery, mobile navigation, cinematic neighborhood view, Lot 8 context carried into Contact, browser-only draft mode and the authenticated private working deck. No console errors or mobile overflow were observed. Earlier checks also covered chapter navigation after resize and motion-off fallback. The exact application release and live checks are recorded above.

Final live review found pale emphasis/caption text on the light motion-off detail panel. The deployed follow-up correction restores dark, readable text; browser inspection, rebuild, privacy checks and CI passed. The branch configuration is now repaired; actual push-trigger results are recorded separately from configuration changes in PR #10.

Pending owner inputs: approve the prepared repository-only Railway GitHub App installation; actual investor names/emails for recipient-specific access; open the approved notes in the Wispr Flow app with the owning/invited account to expose their transcripts. Tony approved Wispr owner-account sign-in and secure Google sign-in succeeded, but both shared pages still disable Transcript and no Wispr app window was available. Both summaries were read; full transcripts remain unread. No real investor invitations or hosted financial data have been issued.

## Remaining work

- Finish the prepared Railway GitHub App installation only after Tony approves the exact new access. Keep the verified feature branch selected, test an actual push and compare deployment SHA/CI. Until then, use an explicitly checked manual release; do not assume automatic deployment works. No tokens belong in chat, and company DNS is unrelated to this check.
- Reconcile/review the PRs and eventually use `main` as the stable deployment branch, preserving the approved design.
- No enforced `main` protection is claimed; issue #4 tracks owner review. The old private-repository plan restriction should be reassessed now that the repository is public.
- The OS stays local with blank templates. Real dashboards, finances and pilot evidence remain private; issue #3 tracks authentication before hosting.
- Hosted enquiry drafts send nothing to a server or CRM. Keep this wording until actual delivery is implemented and verified.

References: [release steps](RELEASES.md), [security](SECURITY.md), [roadmap](WEBSITE-ROADMAP.md), [source inventory](SOURCE-INVENTORY.md), [hosting](HOSTING.md).
