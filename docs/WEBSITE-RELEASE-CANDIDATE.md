# Original-image branding refinement — release readiness

## Candidate and authority

Tony approved the **Grama Development** name, refined logo direction and premium minimalist branding on November 12, 2026. He required original architectural photography and existing authorized visuals to be preserved. This candidate restores the original company homepage photograph and refines the existing production composition. It does not generate houses, add stock imagery, invent projects or alter Development OS.

Branch: `feature/preserve-original-visuals-2026-11-12`, based on current production/Nail checkpoint `f7e9546d24ac38fe8e38cd95062da234e1304475`. This revision supersedes the homepage direction in PR #17; do not merge that older concept over this candidate. It retains all fifteen current public routes, eight completed case pages, portfolio filters, galleries, Contact delivery safeguards, private presentation handlers and Nail's separate Animated Experience.

The company homepage now shows original photographs and the supplied C5 plan. Existing concept visuals remain on the dedicated Dexter Acres and Animated Experience pages with their labels. The original film and concept files remain in Git; none is introduced as replacement company photography. Original sources, dimensions and immutable hashes are in [ORIGINAL-IMAGES.md](ORIGINAL-IMAGES.md) and [original-assets.json](original-assets.json).

## Validation

- `npm run check`: website build, 138 tests and public-artifact policy pass. New tests protect 31 original assets, the restored hero, twenty Nail-owned source/media files, public brand metadata, all case galleries/attribution and contextual enquiry links.
- Browser: desktop, 320/390px mobile and 900/1100px navigation checks; original-photo framing, no horizontal overflow, focus containment/Escape/resize cleanup, completed filter, single/multi-photo galleries, custom-home context, all fourteen lots and Lot 4 → Contact. Reduced motion plus manual on/off were exercised. Animated Experience loads with its original concept labels. No captured warning/error logs.
- No physical-device audit, Core Web Vitals benchmark or real inbox receipt is claimed. Contact activation is not part of this revision.
- PR, exact application commit, CI and staging deployment are recorded in [TEAM-HANDOFF.md](TEAM-HANDOFF.md) after verification. Final handoff-only commits may differ from the pinned application commit without changing runtime source.

## Existing targets and rollback

| Item | Inspected checkpoint |
| --- | --- |
| Railway project | `earnest-wisdom` / `ffb7baed-e751-41be-9874-c4eb4c4ae290` |
| Existing website staging | `humorous-delight` / `ee093a0e-93c7-4a86-8965-78e151adeb64`, environment `staging-website` / `68266b74-e9b9-448c-99b2-c38241f0484b` |
| Existing production | `grama-construction-website` / `875425ae-8bb5-4d47-a026-49a9df71dc22`, environment `production` / `15058afa-2401-4d42-83a7-5e807d7d1258` |
| Main domain | `gramadevelopment.com`, existing mapping to port 8080 |
| Production baseline | `feature/windows-animation-playback`, pinned `f7e9546d24ac38fe8e38cd95062da234e1304475` |
| Baseline deployment | `5caa1719-e9f4-429e-8277-64c69b28e552`, SUCCESS; Railway reports rollback and redeploy available |
| Earlier Contact checkpoint | `6310a778-eaa0-4cbc-87c7-bea70fcf3704` / `bf33cf4`, retained as earlier history; use the current Nail baseline for rollback unless a different version is explicitly approved |

The production source advanced through Nail's separate work during inspection. This task made no production, DNS, account, OS or paid-plan change. Re-read the live checkpoint before any later release; do not overwrite new concurrent work using this document alone. Rollback availability was inspected, not exercised on production.

## Approval and release sequence

1. Tony reviews the staging comparison and approves the **exact application commit**. Approval of the brand direction is already recorded; it does not authorize production publication.
2. The website lead rechecks the production checkpoint, confirms Nail's shared-file coordination and resolves the PR stack with Tony. Keep the website in the existing repository/project and retain all current domains and operational configuration. No merge is authorized by this document.
3. Only after exact-version approval, prepare/apply an environment-scoped source change to that commit on the existing production service. Review the staged diff; it must contain only intended website source changes. Keep Contact disabled unless separately configured and verified, and do not copy private presentation accounts/data.
4. Verify health, public routes, original-image/code hashes, brand metadata, navigation, gallery/lot enquiries, disabled/unconfigured delivery behavior and private access boundaries on the main domain.
5. If verification fails, use the inspected Railway rollback/redeploy checkpoint for the same service/environment, restore the previous source pin and verify again. No domain or DNS replacement is required. Retain exact release/rollback evidence in the shared website handoff.

**Readiness:** staging review candidate. Production publication and merge remain awaiting Tony's exact-version approval. Provider activation, new domains/services and Development OS are outside this release.
