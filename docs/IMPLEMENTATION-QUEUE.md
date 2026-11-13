# Ordered implementation queue — November 11, 2026

New messages add requirements to this queue. They do not replace unfinished work. Keep a verified completion result and release status for each stage. This file contains development context only: no private financial figures, raw transcripts, investor identities or credentials.

## 1. Shared source and website deployment

- Done: shared repository, developer onboarding, PR/CI workflow, existing live Railway website and standing authorization to commit/push/deploy requested website work.
- Done: preserved Nail's newer investor showcase, portraits, completed portfolio and lot map. Company DNS remains unchanged.
- Done: Nail's concurrent multipage release `a73c017` on PR #9 is integrated into the private-presentation candidate. Its new pages, project cases and direct-route behavior are preserved and passed combined checks.
- Done: authenticated Railway connector, removed the explicit source commit pin and deployed documentation commit `6dda772` successfully.
- Branch repair: the November 11 environment-scoped staged change removed only the temporary pin while retaining `feature/private-investor-presentation`. Railway successfully deployed `dcc95a4` as `e713d762-3ff5-43bf-9fd5-62c4a21280ef`; application code remains the checked `bc8e81b`. Actual push-trigger evidence is recorded in PR #10. Company DNS is unchanged.
- Automatic deployment prerequisite: test push `4db877f` passed CI but did not deploy. Railway App is absent from the owner's GitHub installations. Its installation is prepared for this repository only; explicit approval of the new permissions is pending before the final Install & Authorize action. Existing OAuth reconnection did not resolve the missing App. No access expansion has occurred.
- Boundary: the repository is currently public, verified through GitHub. Keep confidential material outside Git and the public build regardless of visibility.

## 2. Research for investor presentation

- Read both supplied Wispr shared summaries. Tony subsequently approved owner-account access; secure Google sign-in succeeded. Both shared pages still disable Transcript and require the Wispr app; no available app window was found. Tony has been asked to open the two notes in the owning/invited app account. Full transcripts remain unread; permission is no longer the blocker.
- Done: read relevant Smartsheet records for Dexter Acres, Sprucewood and completed-project evidence. The working deck separates reported inputs, projections, offers and unverified results; sampled whole-subdivision budgets are not treated as complete totals.
- Do not promote spoken return targets, unapproved profit splits, placeholder budgets or incomplete models into promised investor returns.
- Done: compared the current company website and Railway showcase. The sanitized content brief records the comparison and concrete design/access improvements.

## 3. Private personalized presentation

- Build `/presentation` as a separate investor experience with server-enforced individual access. Hiding the route or removing it from navigation is insufficient.
- Tony selected specific investors with individual access. Investor names/emails are pending; no invitations or external financial disclosure yet.
- Reusable presentation/access code may be shared. Private deck data, investor records and credentials must stay server-side and outside Git, browser bundles, public assets and logs.
- Deliver a base company/development pitch, source-labelled project numbers, completed-project case studies, proposed investment process and per-investor variants. Show material missing inputs honestly.
- Verify anonymous denial, investor separation, expired/revoked access, secure sessions and no private-data leakage before enabling actual accounts.
- Implemented locally: presentation shell, individual access middleware, assigned deck data, expiry/revocation, private review tooling and source-labelled base content outside Git. Desktop/mobile review completed. Actual recipient provisioning remains pending names/emails.

## 4. Public visual refinement

- Refine the existing site toward a minimal technology-company aesthetic: readable sans-serif typography, less caption clutter, generous space, clear hierarchy and real project imagery.
- Implement a deliberate scroll/swipe transition connecting residence, architectural detail and the larger neighborhood. Keep mobile performance, keyboard access and reduced-motion behavior.
- Evaluate existing cinematic assets before new generation. Higgsfield may support visuals when useful; do not alter the actual house/garage alignment or fabricate project photography.
- Preserve approved portraits, completed-project context, current portfolio, 14-lot plan and honest enquiry behavior.
- Implemented locally: sans-serif refinement, quieter captions, mobile/desktop cinematic mode, lower mobile pixel ratio, clean contained neighborhood view, chapter refresh after resize, motion-off fallback and static-preview contact-mode correction. Browser checks confirmed mobile navigation, all three story phases, no horizontal overflow and no console errors.

## 5. Verify, release and hand off

- Run relevant behavior/security checks and build, then check desktop/mobile/reduced-motion interactions.
- Integrated local release candidate passed build, 91 automated tests, repository policy, cinematic asset verification and a separate scan against the local private financial/account values. Browser checks covered direct pages, filters, galleries, mobile cinema, lot-to-contact context and private login. Only a synthetic test identity overlaps existing synthetic OS fixtures; no real investor identity is configured.
- Commit and push the requested changes. Deploy the intended public website commit through Railway and record its exact SHA/deployment ID/public result.
- Deploy private presentation data only behind verified access controls and for approved recipients. No company-domain cutover or new paid subscription is included.
- Update the team handoff with completed, pending and blocked items so Nail's agent can continue without chat history. Do not claim an incomplete stage is finished.
- Done for the application release: GitHub PR #10 and green CI; all fourteen public pages and exact JS/CSS build verified live, private paths blocked, anonymous private deck denied. The source branch repair and subsequent deployment are recorded above. Shared handoff and setup instructions are in the repository; PR #10 records the subsequent push test. Actual investor accounts/data and full transcripts remain pending the inputs listed above.
