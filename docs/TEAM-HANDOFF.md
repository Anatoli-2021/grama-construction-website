# Developer team handoff — November 10, 2026

## Verified live website

- Repository: https://github.com/Anatoli-2021/grama-construction-website (currently public, verified through GitHub). Private business and investor data remain excluded.
- Railway website: https://grama-construction-website-production.up.railway.app/.
- Connected source: `feature/private-investor-presentation`, temporarily pinned to the exact tested application commit below because the unpinned connection did not retain the branch.
- Verified application release: `bc8e81b12fea07b701d0970a400c2f08589bcfb2`, Railway deployment `3d5b57ed-6b7b-4473-a859-2a539d76bde3`, SUCCESS on November 10; live checks at 23:06 UTC. Root Dockerfile, port 8080, `/healthz`, one replica in `sfo`.
- Live checks: all fourteen public pages HTTP 200; five served JS/CSS assets match the checked local build byte for byte; health HTTP 200; OS, `.data`, `.env` and unknown URLs HTTP 404. `/presentation` is a no-store login shell; anonymous deck access is HTTP 401 and unconfigured login is HTTP 503. Actual financial data/accounts are not hosted.
- Previous recoverable integrated release: `9f6b6d0`, deployment `3befd28a-70c6-469b-8ac6-3c824403ca9d`. Nail's earlier multipage release `a73c017` is also preserved in source/history.
- [PR #10](https://github.com/Anatoli-2021/grama-construction-website/pull/10) records current deployment evidence; [CI run 42919880006](https://github.com/Anatoli-2021/grama-construction-website/actions/runs/42919880006) passed all checks for the final application commit. Later documentation-only commits do not alter the running application.
- Preserve the team's newer investor showcase, family story, project portfolio and browser-only enquiry draft. Do not deploy the older setup branch over it.
- Company domain/DNS is unchanged. Railway labels this environment `production`; the Railway address remains the current development/review website.

## Tony's standing website deployment instruction

On November 10, Tony instructed: finish requested website changes, run relevant checks, commit and push them, then deploy to the existing Railway website and verify the result. Another release confirmation is not needed for each requested website edit to this target.

This covers requested website work through deployment. It does not create a background job or authorize unrelated changes. Keep branches and PR review for stable `main`; never force-push shared history. Company-domain/DNS changes, new spending, access grants and private OS publication remain separate decisions.

The Railway connector is authenticated. Its unpinned source call built the requested feature branch once but did not retain the branch in service configuration; subsequent pushes did not deploy. The dashboard could not load branches. Its command-palette "Deploy latest commit" selected older `main`, briefly activating `af3faf5`; the verified integrated build was restored, then exact tested `bc8e81b` was deployed with a commit pin. Current source inspection confirms that branch and pin. Do not use the generic latest-commit command or remove the pin until the GitHub/branch connection is repaired and its target verified. No source or Git history was lost.

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

Final live review found pale emphasis/caption text on the light motion-off detail panel. The deployed follow-up correction restores dark, readable text; browser inspection, rebuild, privacy checks and CI passed. Automatic deployment is unresolved; the exact-commit release above is verified independently.

Pending owner inputs: actual investor names/emails for recipient-specific access; approval for Wispr owner-account sign-in if full transcripts are required. Both shared summaries were read. No real investor invitations or hosted financial data have been issued.

## Remaining work

- Platform owner/Nail: repair the Railway account's GitHub repository/branch connection through secure provider UI, then verify the intended feature branch and a push-triggered deployment before removing the temporary pin. Never provide tokens in chat or change company DNS for this repair. Until then, deploy only an explicitly checked commit and verify its actual SHA.
- Reconcile/review the PRs and eventually use `main` as the stable deployment branch, preserving the approved design.
- No enforced `main` protection is claimed; issue #4 tracks owner review. The old private-repository plan restriction should be reassessed now that the repository is public.
- The OS stays local with blank templates. Real dashboards, finances and pilot evidence remain private; issue #3 tracks authentication before hosting.
- Hosted enquiry drafts send nothing to a server or CRM. Keep this wording until actual delivery is implemented and verified.

References: [release steps](RELEASES.md), [security](SECURITY.md), [roadmap](WEBSITE-ROADMAP.md), [source inventory](SOURCE-INVENTORY.md), [hosting](HOSTING.md).
