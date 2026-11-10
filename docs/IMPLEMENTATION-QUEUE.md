# Ordered implementation queue — November 10, 2026

New messages add requirements to this queue. They do not replace unfinished work. Keep a verified completion result and release status for each stage. This file contains development context only: no private financial figures, raw transcripts, investor identities or credentials.

## 1. Shared source and website deployment

- Done: shared repository, developer onboarding, PR/CI workflow, existing live Railway website and standing authorization to commit/push/deploy requested website work.
- Done: preserved Nail's newer investor showcase, portraits, completed portfolio and lot map. Company DNS remains unchanged.
- Done: authenticated Railway connector, removed the explicit source commit pin and deployed documentation commit `6dda772` successfully.
- Open: a later GitHub push did not automatically create a deployment. Branch loading is unavailable in the dashboard. Treat GitHub webhook deployment as unverified; explicitly deploy and verify intended commits until repaired.
- Boundary: the repository is currently public, verified through GitHub. Keep confidential material outside Git and the public build regardless of visibility.

## 2. Research for investor presentation

- Read both supplied Wispr shared summaries. Full transcript tabs require owner access; a sign-in attempt was blocked by approval review. Specific owner-account access approval is pending.
- Research Smartsheet records for Dexter Acres, Sprucewood and completed-project evidence. Distinguish proposals, budgets, offers, actual costs and documented closed results.
- Do not promote spoken return targets, unapproved profit splits, placeholder budgets or incomplete models into promised investor returns.
- Compare the current company website and current Railway website. Preserve project/source evidence and identify concrete improvements.

## 3. Private personalized presentation

- Build `/presentation` as a separate investor experience with server-enforced individual access. Hiding the route or removing it from navigation is insufficient.
- Tony selected specific investors with individual access. Investor names/emails are pending; no invitations or external financial disclosure yet.
- Reusable presentation/access code may be shared. Private deck data, investor records and credentials must stay server-side and outside Git, browser bundles, public assets and logs.
- Deliver a base company/development pitch, source-labelled project numbers, completed-project case studies, proposed investment process and per-investor variants. Show material missing inputs honestly.
- Verify anonymous denial, investor separation, expired/revoked access, secure sessions and no private-data leakage before enabling actual accounts.

## 4. Public visual refinement

- Refine the existing site toward a minimal technology-company aesthetic: readable sans-serif typography, less caption clutter, generous space, clear hierarchy and real project imagery.
- Implement a deliberate scroll/swipe transition connecting residence, architectural detail and the larger neighborhood. Keep mobile performance, keyboard access and reduced-motion behavior.
- Evaluate existing cinematic assets before new generation. Higgsfield may support visuals when useful; do not alter the actual house/garage alignment or fabricate project photography.
- Preserve approved portraits, completed-project context, current portfolio, 14-lot plan and honest enquiry behavior.

## 5. Verify, release and hand off

- Run relevant behavior/security checks and build, then check desktop/mobile/reduced-motion interactions.
- Commit and push the requested changes. Deploy the intended public website commit through Railway and record its exact SHA/deployment ID/public result.
- Deploy private presentation data only behind verified access controls and for approved recipients. No company-domain cutover or new paid subscription is included.
- Update the team handoff with completed, pending and blocked items so Nail's agent can continue without chat history. Do not claim an incomplete stage is finished.
