# Website handoff — original-image correction, November 12, 2026

## Authoritative current decision

Tony approved **Grama Development** naming, the refined logo direction and premium minimalist branding. Original architectural photographs and authorized existing visuals must be preserved/restored. No replacement generated houses, stock images or invented projects. Exact-version staging review and production approval remain required. This correction supersedes the earlier PR #17 homepage concept below.

## Current candidate

- Branch `feature/preserve-original-visuals-2026-11-12`, based on current production/Nail `d45e546fe0d1b8673039b45b3db34c5a7d0b784a`. PR/deployment evidence follows after publishing the verified candidate.
- Restored the original company hero photograph from the exact official source, optimized as `original-home-hero.webp` (1536 × 983). Typography, spacing, restrained photo motion, responsive framing and navigation are refined. Mobile shows the complete original photograph above the copy. Contact/private presentation identity is consistently Grama Development.
- All fifteen current live public routes, eight project cases, existing project facts, source attribution, galleries, portfolio filters, Contact safeguards and private access boundaries are preserved. Homepage concepts now link to their existing dedicated Dexter/Animated Experience pages; the supplied C5 plan is the homepage development visual. Legacy homepage #architecture/#community links redirect to the matching project anchors.
- Image inventory: [ORIGINAL-IMAGES.md](ORIGINAL-IMAGES.md), with [immutable hashes](original-assets.json). All 31 original image/plan/font assets plus seventeen Nail-owned animation source/media files match the production baseline byte for byte. Only the restored original hero is added; no new generated content.
- Validation: build and 133 tests passed; browser checked original image framing, 320/390px no overflow, 900/1100px menu/resize, focus wrap/Escape, mobile text stability under motion, portfolio filtering, gallery navigation, custom-home enquiry context, all 14 lots and Lot 4 → Contact. No captured warning/error logs. Physical-device testing, Core Web Vitals and real inbox receipt are unrun.
- [Release readiness and rollback](WEBSITE-RELEASE-CANDIDATE.md). Existing staging service/domain only; production has not been changed by this task. Current production baseline deployment `39a823df-9674-4bba-892c-636e37e239b3` at d45e546 reports rollback/redeploy available. Nail's separate production release advanced during inspection; verify again before any approved promotion.

## Ownership and next actions

- Nail owns Animated Experience PR #16. His current source, atlas/layer assets and project data are retained without edits. Correction/coordination posted on PR #16; acknowledgement remains pending. Shared App/navigation changes are confined to this new branch.
- Claude Code's Development OS, package files, central underscore OS handoff and infrastructure remain untouched. Previous branch-qualified OS pointers below remain valid coordination references, not permission to merge/deploy OS work.
- Next: Tony reviews this exact staging version; Nail acknowledges the protected checkpoint/shared-file boundaries; website lead prepares production promotion and rollback only after exact-version approval. Keep delivery activation separate.

---

# Previous staging handoff — historical, superseded where different

# Website team handoff — November 12, 2026

## Current website task

- Objective: evolve the existing website toward Grama Development's luxury-home and residential-development positioning; preserve working pages, enquiry safeguards and private access boundaries. No rebuild.
- Tony confirmed exact spelling **Grama Development** on November 12 in the Grama Website chat. Identity design and production release still require Tony's approval. This task's production gate supersedes the older November 10 deployment instruction preserved below.
- Branch: `feature/website-mobile-enquiry-2026-11-12`, based on Nail's `feature/architectural-flagship` at `7e5c4a192a9162069ad563a6b835beaa29c29e5b` / PR #14. Use a stacked PR to review the incremental change without re-reviewing the full existing site.
- Scope and six-competitor study: [prior website review](https://github.com/Anatoli-2021/grama-construction-website/blob/feature/website-mobile-enquiry-2026-11-12/docs/WEBSITE-REVIEW-2026-11-12.md). Implementation: mobile navigation focus/inert/scroll cleanup; portfolio keyboard/resize behavior; specific homeowner and development enquiry paths; luxury-home/scope copy; confirmed-spelling review status. Grama uses its existing photographs and original code/assets.
- Validation: Node 24; `npm run check` passes build, 140 tests and public-artifact policy; `VERIFY_URL=http://localhost:5274 npm run verify` passes all 9 API/asset checks; `git diff --check` passes. Local browser checks at 320/390/1280 CSS pixels showed no horizontal overflow. Focus entry/wrap/Escape, scroll/inert restoration after resize, Home/End/Arrow Right portfolio navigation, homeowner and landowner/partner context, disabled delivery and confirmed spelling were checked. Browser prefers reduced motion; that fallback was exercised. No captured warning/error logs. Physical-device checks, Lighthouse/Core Web Vitals and email inbox receipt are not claimed.
- Review PR: [#17](https://github.com/Anatoli-2021/grama-construction-website/pull/17), stacked on PR #14. Application commit `d6d20e64af7ad95e95e12cebb95fade7c857eb02`; [CI run 43316741744](https://github.com/Anatoli-2021/grama-construction-website/actions/runs/43316741744) passed. Later handoff-only commits do not change the deployed application.
- Verified staging: https://humorous-delight-staging-website.up.railway.app/ — deployment `83529a90-e1c9-4c78-b44e-eb9efcc71a8f` SUCCESS at the exact application commit above. Existing `humorous-delight` (`ee093a0e-93c7-4a86-8965-78e151adeb64`) in `staging-website` (`68266b74-e9b9-448c-99b2-c38241f0484b`), project `earnest-wisdom` (`ffb7baed-e751-41be-9874-c4eb4c4ae290`). Source is pinned to that commit. No new service, production-variable copy, OS data or paid upgrade. No pending staging changes remain.
- Staging HTTP checks at 22:08 UTC: all 15 public pages 200; five served JS/CSS assets match the checked local build byte for byte; nine source/private/unknown paths 404; health 200; Contact readiness `enabled:false` and empty POST 503; anonymous presentation deck 401. Staging browser confirmed the new heading, mobile focus/inert/scroll behavior and development topic preservation, with no captured warning/error logs. Screenshots and verification JSON are retained in the owner's ignored `evidence/` directory. Production was read back unchanged: deployment `6310a778-eaa0-4cbc-87c7-bea70fcf3704`, same source/domains/config, no staged changes.
- Production was inspected at Contact source `bf33cf4035c27fceca3f21c5c7a635c62c02336f`, branch `feature/contact-enquiry-delivery`; its existing domains include the Railway address and `gramadevelopment.com`. This task does not alter production or DNS. Contact activation still needs provider/sender configuration and real receipt evidence; staging must remain disabled.

## Ownership and coordination

- Nail / `axmatea`: owns Animated Experience, [PR #16](https://github.com/Anatoli-2021/grama-construction-website/pull/16), branch `feature/animated-experience`, inspected at `aa8eb9703a3d327caca755581a8395169b560c13`. The new architectural homepage and that branch diverge after the Contact checkpoint. No animation source, assets or history is overwritten or merged. Coordination request posted to PR #14; acknowledgement and integration checkpoint remain pending.
- Claude Code: owns Development OS. The OS infrastructure chat acknowledged the boundary and staging-website purpose. Its locked package files, `apps/development-os/**`, `infra/staging/**`, QA helper, AGENTS/CLAUDE and central OS documents remain untouched. The existing staging-os patch is outside this task and remains untouched.
- Central **OS** coordination is [docs/TEAM_HANDOFF.md on PR #15's branch](https://github.com/Anatoli-2021/grama-construction-website/blob/feature/infrastructure-readiness-2026-11-12/docs/TEAM_HANDOFF.md) (underscore). Preserve the OS task's historical/pointer lines when reconciling its branch; this hyphenated file records current website work. [PR #15](https://github.com/Anatoli-2021/grama-construction-website/pull/15), [infrastructure readiness](https://github.com/Anatoli-2021/grama-construction-website/blob/feature/infrastructure-readiness-2026-11-12/docs/INFRASTRUCTURE-READINESS.md), [OS task handoff](https://github.com/Anatoli-2021/grama-construction-website/blob/feature/infrastructure-readiness-2026-11-12/docs/handoffs/infrastructure-2026-11-12.md) and [Claude next task](https://github.com/Anatoli-2021/grama-construction-website/blob/feature/infrastructure-readiness-2026-11-12/docs/CLAUDE-INFRA-HANDOFF.md) remain branch-qualified while unmerged.
- Open PRs inspected: #2 legacy setup, #10 private presentation, #12 live Contact, #14 architectural candidate, #15 OS coordination and #16 Animated Experience. Search omitted several recent PRs, so their metadata was verified directly. No merges, force pushes or reviewer approval are claimed.

## Next actions / owners

1. Tony: review staging and choose/approve the identity direction and proposed design changes. Exact spelling is already confirmed. Production release requires approval of an exact commit.
2. Nail + website lead: acknowledge the Animated Experience checkpoint, reconcile its shared App/routes/brand files with the architectural candidate, and verify mobile/reduced-motion behavior in a separate focused PR.
3. Website lead + Tony: resolve the stacked PR release order and plan real Contact delivery configuration/receipt verification before activation. Keep Claude's OS work separate.

---

# Historical website handoff — November 11, 2026

The following record is preserved as evidence. Its older source, domain and deployment instructions are superseded where the current November 12 website facts above differ.

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
