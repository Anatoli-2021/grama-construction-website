# Phase 1 foundation — continuation handoff

## Objective and scope
Tony's pasted execution plan authorizes an isolated Phase 1 UI continuation.
Builder for this continuation: Codex on codex/os-phase1-foundation, based on
Claude's exact 239335c12ba97a74be907a5f7e8042989ff4845b. Claude's branch is
unchanged. Ongoing UI ownership returns to Claude after this review; infrastructure
remains Codex's separate PR #15. No simultaneous edits in Claude's checkout.

## COMPLETED
- DEP-02 fixed: direct renovation creation gets draft budget/contract/release gates.
- Older direct renovations gain only missing gates; existing records preserved.
- Exports refuse missing gates, missing/unapproved predecessors and cycles.
- Split existing HTML/CSS/JS; removed inline script, style block/attributes and handlers.
- Raster data-URL thumbnails; source files download without same-origin execution.
- Work-package checks no longer imply budget/purchase/work-release approval from
  a selected item or claim an entered vendor/cost is a verified quote.

## WORKING FEATURES
Synthetic kitchen: create project/area → add source/design selection → demo approval
→ 2 × 100 = 200 draft budget → unreleased contractor tasks → same-project
Daily Workspace action. Amounts are test fixtures, not a quote. Existing
revision/lineage/stable-ID/unknown-cost/CSV protections and launch import retained.

## FILES / COMMIT / PR
Branch codex/os-phase1-foundation, stacked on claude/design-studio-prototype.
Files: studio/index.html, studio/studio.css, studio/studio.js, studio/README.md,
test/studio.test.mjs and this handoff. Exact commit and review URL are recorded
by the branch PR; never infer a merge from publication.

No public website, Nail animation, server, package manifest, CI, Dockerfile,
Railway service, original project record or private dashboard is changed.
The central roadmap/status/team handoff remain in infrastructure PR #15;
this dated file is supporting evidence, not another status register.

## TESTS
Nine focused Node tests pass against the actual external script. They cover
DEP-02, complete synthetic kitchen logic, migration preservation, denied invalid
exports, cycles, lineage/revisions/identity/CSV, actual subdivision launch import
and safe source downloads. Test method is DOM/storage stubs, not a browser.
Full repository build/check and exact-head CI are recorded in PR evidence.

## BLOCKERS
Phase 1 acceptance remains partial: no independent browser/CSP/layout/mobile or
browser-restart persistence verification for this commit. Prior local-file
browser denial is respected; no alternate protocol/raw-CDP workaround used.
UI is not served by either existing host. Scoped route integration is a Codex
handoff; do not expose raw Studio via public website or weaken CSP.

## PHASE 2 COORDINATION
Google owner-only is already approved; no copied connector credentials.
Use PR #15's host candidate, not another auth system. Proposed asset mount:
authenticated /platform/ page plus explicitly allowlisted studio.js/studio.css,
same-origin under the protected host. Resolve all relative paths deliberately;
authorize page/assets/APIs/files, preserve no-store and deny unknown paths.
UI needs no external script/style/network calls; img-src self/data suffices.
Do not enable file uploads/real records until storage/permissions are approved.

The old manual hash-locked Codex harness expects inline source. Next Codex
integration checkpoint must load both reviewed HTML and external JS by explicit
blob identities; do not silently execute an unreviewed sibling asset.
Keep repository tests reproducible; this UI PR adds tests without CI/package edits.

## NEEDS TONY'S APPROVAL
Exact merge/release, resource activation/cost, expanded accounts/scopes, live
sources and production. Provider/account choice is not pending a second time.

## NEXT THREE ACTIONS
1. Reviewer/Claude: review exact continuation diff and retain one UI owner;
   provide allowed browser acceptance for the split assets before Phase 1 signoff.
2. Codex infrastructure: adapt exact-asset QA and implement reviewed protected
   serving contract in PR #15; test image, real owner sign-in/denials and rollback.
3. Tony: complete GitHub identity verification and review concrete code/staging
   proposal. No merge/deployment is automatic.
