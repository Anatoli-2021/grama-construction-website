# Development OS — central team handoff

Roadmap: [OS_MASTER_PLAN.md](OS_MASTER_PLAN.md). Current truth: [OS_STATUS.md](OS_STATUS.md). Older hyphenated TEAM-HANDOFF.md remains for active website coordination; do not overwrite it.

## Branch ownership
| Contributor | Branch / checkpoint | Owned paths | State |
| --- | --- | --- | --- |
| Codex | feature/infrastructure-readiness-2026-11-12; draft PR #15; prior head 85262e3 | central/technical docs, AGENTS/CLAUDE, package manifest/lock, hosted/**, auth tests, scripts/qa, infra/staging | Owner-only candidate and exact-asset QA, not deployed |
| Claude Code | claude/design-studio-prototype; reviewed 8b55c4f84c5898d5cc2cb8645338f9c682961938; draft PR #19 | studio/**, docs/CLAUDE_HANDOFF.md, own dated handoff | DEP-02/assets fixed; export integrity DEP-03/04 remain |
| Website chat | feature/website-mobile-enquiry-2026-11-12, stacked on Nail candidate | root website UI/tests/docs; staging-website only | Coordination received; infrastructure locks preserved |
| Nail / axmatea | No new OS task assigned here | Assigned branch only | GitHub write verified; Railway identity mapping pending |
| Tony | No code branch | scope/accounts/access/costs/merge/release | Google owner-only identity choice confirmed |

No Studio UI copy/cherry-pick or website source change in this infrastructure branch. A temporary isolated UI continuation overlapped Claude's new commit; PR #18 was closed unmerged. Preserve its history but use only PR #19 as current UI. Neither branch was overwritten; Claude remains UI owner.

## Claude acknowledgement and independent review
Committed docs/CLAUDE_HANDOFF.md at 8b55c4f explicitly acknowledges PR #15 head 85262e3 and current central documents. This is verified file acknowledgement, not proof of a connected running Claude session.

Daily Workspace is the in-Studio Dashboard with project/step navigation. The existing private Desktop dashboard stays private. Stable selection/task IDs, former approved costs, export lineage, CSV mitigation and single-home draft gate dependencies pass the original 17 checks.

Expanded Codex checks: 23 pass / 2 fail. DEP-02 is fixed: direct renovation gets 15 checklist items including T17/T19. Actual launch-builder subdivision JSON preserves Project ID/29 tasks/dependencies and rejects duplicate IDs. DEP-03: removing T17 still permits JSON export by dropping contract authority. DEP-04: an unapproved selection predecessor leaves a dangling task ID. Both actual download paths were tested; do not omit controls or claim complete workflow readiness.

Claude reports 40 browser checks under a strict policy; these remain builder claims, not Codex browser acceptance. Codex independently ran his 11 Node logic tests and exact-branch build/63 default tests. Codex did not run raw CDP/browser tooling around the local-file restriction. Demo approval is device-local state, not business authority.

## Next Claude checkpoint / integration contract
Keep UI on Claude's branch. External files now exist: index.html, studio.css, studio-logic.js, studio.js; both scripts share the classic-script scope. Codex's harness now checks exact HTML/JS/CSS Git blobs and executes scripts in declared order. No inline code or broad CSP exception is needed. The canonical UI branch's nested Studio tests still need coordinated inclusion in default CI.

Codex owns hosted/server.mjs and the old loopback server. Agree explicit protected page/assets/API/file routes before serving UI. Authorize records/files/exports on the server; never expose raw Studio through the public website. Login screen may be anonymous; authenticated candidate returns integration-pending 503 until reviewed UI is wired.

Google owner-only is approved; actual allowlisted identity and OAuth secrets belong only in private host configuration. No other role/account enabled. First integration remains synthetic with no paid resource, database activation or live Smartsheet connection.

Agree one shared project store/record contract. Consolidate embedded checklist/ID logic into existing template/shared utilities after review. Preserve old browser data; do not import private Desktop files automatically.

## Railway coordination
Reuse earnest-wisdom. Website chat owns humorous-delight in staging-website and confirms no OS changes. Existing staged-create exquisite-comfort in staging-os points to main and has no deployment. Owner unknown; preserve unapplied patch until reconciled. No duplicate service/domain/secret copy or activation.

Candidate uses root context and infra/staging/os.Dockerfile, not root website Dockerfile. Exact reviewed image/source, OAuth callback, denied-access tests and actual rollback evidence precede real-data release.

## Coordination rules
One writer/file, one branch/task. Check dirty work, remote heads and PRs; preserve stacked website work. Claude owns UI; Codex owns infra/integration/security/CI and central docs. Request coordination before touching the other's paths.

Synthetic fixtures only in this public repository/CI/previews/evidence. Real records/credentials/private URLs remain outside. Handoffs give exact commit, paths, checks/limits and next owner. Acknowledgement is explicit, not assumed.

Another authorized reviewer examines final commit; Tony approves merge/release. No automatic merge, paid activation, production, access expansion or operational writes.

## NEXT THREE ACTIONS
1. **Claude Code:** fix DEP-03/04 in PR #19 with full mandatory-gate and approved-predecessor validation; provide exact commit/browser evidence.
2. **Codex:** independently retest, integrate reviewed contracts, then test image/actual Google access and synthetic Railway rollback after activation approval.
3. **Tony:** GitHub owner verification, Railway member identity confirmation, exact PR/staging proposal review.

Use [current status](OS_STATUS.md) and [current QA evidence](handoffs/studio-workflow-qa-8b55c4f.json); dated historical reports do not supersede them.
