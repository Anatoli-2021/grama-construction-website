# Developer team handoff — November 10, 2026

## Verified live website

- Repository: https://github.com/Anatoli-2021/grama-construction-website (private).
- Railway website: https://grama-construction-website-production.up.railway.app/.
- Connected branch: `feature/investor-showcase-polish`. Running source: `e2dca4de464e663a9facc5b91aa29f1495fd4e00`, deployed by `axmatea`.
- Active deployment: `1f2b9373-162f-429a-9fd0-b52af5ef3abb`. Root Dockerfile, port 8080, `/healthz`, one replica in `sfo`.
- Anonymous checks: website, health and hero media HTTP 200; OS, `.data` and `.env` paths HTTP 404. Loaded website console contained no errors.
- Preserve the team's newer investor showcase, family story, project portfolio and browser-only enquiry draft. Do not deploy the older setup branch over it.
- Company domain/DNS is unchanged. Railway labels this environment `production`; the Railway address remains the current development/review website.

## Tony's standing website deployment instruction

On November 10, Tony instructed: finish requested website changes, run relevant checks, commit and push them, then deploy to the existing Railway website and verify the result. Another release confirmation is not needed for each requested website edit to this target.

This covers requested website work through deployment. It does not create a background job or authorize unrelated changes. Keep branches and PR review for stable `main`; never force-push shared history. Company-domain/DNS changes, new spending, access grants and private OS publication remain separate decisions.

Railway currently displays **Auto deploy unavailable / Could not load branches** despite the connected GitHub source. Until the integration is repaired and a push-to-deploy test succeeds, explicitly deploy the intended commit through authenticated Railway controls, wait for success and verify the public result. Record the source SHA and deployment ID. A successful push alone does not prove deployment; report access failures honestly.

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

The root Dockerfile serves only the website; OS source and private enquiry records are excluded from its runtime. See the [settings guide](../infra/website/README.md). No paid upgrade or company-domain change was made during this verification. Do not publish credentials or invite links.

## Remaining work

- Repair and verify GitHub automatic deployment with the account owner; use explicit deployment verification meanwhile.
- Reconcile/review the PRs and eventually use `main` as the stable deployment branch, preserving the approved design.
- `main` is unprotected under the current GitHub plan; issue #4 tracks enforced owner review.
- The OS stays local with blank templates. Real dashboards, finances and pilot evidence remain private; issue #3 tracks authentication before hosting.
- Hosted enquiry drafts send nothing to a server or CRM. Keep this wording until actual delivery is implemented and verified.

References: [release steps](RELEASES.md), [security](SECURITY.md), [roadmap](WEBSITE-ROADMAP.md), [source inventory](SOURCE-INVENTORY.md), [hosting](HOSTING.md).
