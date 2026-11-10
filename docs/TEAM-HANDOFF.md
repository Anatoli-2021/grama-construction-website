# Developer team handoff — November 10, 2026

## Verified live website

- Repository: https://github.com/Anatoli-2021/grama-construction-website (currently public, verified through GitHub). Private business and investor data remain excluded.
- Railway website: https://grama-construction-website-production.up.railway.app/.
- Last verified source branch: `feature/investor-showcase-polish`, without a commit pin. New candidate: `feature/private-investor-presentation`, based on its latest shared source; a branch push alone is not deployment evidence.
- Latest verified live release before this refinement: `6dda772229a856a3ca891abc850f8788e4eaf24f`, deployment `7123ccec-ad4b-4c0b-b979-f4885ee53367`. Root Dockerfile, port 8080, `/healthz`, one replica in `sfo`.
- Anonymous checks: website, health and hero media HTTP 200; OS, `.data` and `.env` paths HTTP 404. Loaded website console contained no errors.
- Preserve the team's newer investor showcase, family story, project portfolio and browser-only enquiry draft. Do not deploy the older setup branch over it.
- Company domain/DNS is unchanged. Railway labels this environment `production`; the Railway address remains the current development/review website.

## Tony's standing website deployment instruction

On November 10, Tony instructed: finish requested website changes, run relevant checks, commit and push them, then deploy to the existing Railway website and verify the result. Another release confirmation is not needed for each requested website edit to this target.

This covers requested website work through deployment. It does not create a background job or authorize unrelated changes. Keep branches and PR review for stable `main`; never force-push shared history. Company-domain/DNS changes, new spending, access grants and private OS publication remain separate decisions.

The Railway connector is authenticated. Its source inspection revealed an explicit pin to `e2dca4d`. Reconnecting without a pin successfully deployed `6dda772` as deployment `7123ccec-ad4b-4c0b-b979-f4885ee53367`. However, the next GitHub push did not automatically trigger a deployment and the dashboard could not load branches. Automatic deployment remains unverified. Explicitly deploy and verify intended commits until the GitHub trigger is repaired. See `IMPLEMENTATION-QUEUE.md` for the ordered presentation and public-design work now in progress.

Run relevant local checks before pushing to the connected branch: Railway may deploy while GitHub CI runs. Stable `main` keeps its PR review convention; server-enforced review and CI-before-deploy gates are not claimed.

## Team source and setup

- `main` was verified at `af3faf5b924865f898bb32f022ef84ab7e4aca94` before this documentation update. PR #1 and #6 are merged.
- PR #7 contains the current showcase branch and remains open. PR #2 is an older setup PR; reconcile already-included changes before merging it. Do not blindly reintroduce old source.
- `axmatea` has approved GitHub write access and authored the running Railway deployment. Check current access before sending duplicate invitations.
- Node 24; `npm ci`; `npm run check`. Website: `npm run dev` at port 5173. Blank OS tool: `npm run dev:os` at port 5180.
- Fetch the latest shared source before editing. Follow [ONBOARDING.md](ONBOARDING.md) for branches, PRs and safe synchronization.

## Existing Railway target

Project `earnest-wisdom`: `ffb7baed-e751-41be-9874-c4eb4c4ae290`.
Service `grama-construction-website`: `875425ae-8bb5-4d47-a026-49a9df71dc22`.
Environment `production`: `15058afa-2401-4d42-83a7-5e807d7d1258`.

The root Dockerfile serves the website and the separate presentation authorization API; OS source, private data files and local enquiry records are excluded from its runtime. Real presentation data/accounts must be supplied through private runtime configuration. Without it the portal stays closed. See the [settings guide](../infra/website/README.md). No paid upgrade or company-domain change was made during this verification. Do not publish credentials or invite links.

## Private presentation and public refinement candidate

The `feature/private-investor-presentation` branch preserves Nail's newer website. It adds sans-serif typography, quieter captions, responsive residence/detail/community scroll animation and reduced-motion fallback. `/presentation` is a separate generic login shell with individually assigned decks, expiring/revocable access and server-only content. See [INVESTOR-PRESENTATION.md](INVESTOR-PRESENTATION.md) and [INVESTOR-CONTENT-BRIEF.md](INVESTOR-CONTENT-BRIEF.md).

Local private working review: `npm run build`, then `npm run dev:presentation`, http://localhost:5190/presentation. The owner-machine working deck and source snapshot are under ignored `.data/investor-presentation/`; they are intentionally absent from this public repository. Use individually authorized source connections for financial research. Never copy private figures or transcripts into issues, PRs, fixtures or public assets.

Browser checks covered desktop/mobile typography, all three motion phases, chapter navigation after resize, motion-off fallback, mobile menu, private deck login and responsive layout. No console errors or mobile horizontal overflow were observed. The candidate passed build, 70 automated tests, repository policy, 32-frame cinematic verification and a separate scan against private local values. Deployment evidence is recorded after publishing; no deployment is claimed from a Git push alone.

Pending owner inputs: actual investor names/emails for recipient-specific access; approval for Wispr owner-account sign-in if full transcripts are required. Both shared summaries were read. No real investor invitations or hosted financial data have been issued.

## Remaining work

- Keep branch-following source connected without a commit pin. Verify each automatic deployment and its commit; reconnecting with a pin intentionally suspends push deployments until removed.
- Reconcile/review the PRs and eventually use `main` as the stable deployment branch, preserving the approved design.
- No enforced `main` protection is claimed; issue #4 tracks owner review. The old private-repository plan restriction should be reassessed now that the repository is public.
- The OS stays local with blank templates. Real dashboards, finances and pilot evidence remain private; issue #3 tracks authentication before hosting.
- Hosted enquiry drafts send nothing to a server or CRM. Keep this wording until actual delivery is implemented and verified.

References: [release steps](RELEASES.md), [security](SECURITY.md), [roadmap](WEBSITE-ROADMAP.md), [source inventory](SOURCE-INVENTORY.md), [hosting](HOSTING.md).
