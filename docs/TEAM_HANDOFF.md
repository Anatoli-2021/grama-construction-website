# Development OS — central team handoff

Current roadmap: [OS_MASTER_PLAN.md](OS_MASTER_PLAN.md). Current truth: [OS_STATUS.md](OS_STATUS.md). This file owns coordination; the older hyphenated TEAM-HANDOFF.md is retained as historical evidence.

## Branch ownership
| Contributor | Branch / reviewed checkpoint | Owned paths | State |
| --- | --- | --- | --- |
| Codex | feature/infrastructure-readiness-2026-11-12; PR #15; prior commit 902f8e25a081e67bef589e631f2ea7d8f67f0c3e | AGENTS.md, CLAUDE.md, central/technical docs, infra/staging, safety exclusions | Documentation/preparation; no runtime changes |
| Claude Code | claude/design-studio-prototype; reviewed commit 0b1d4e3f2c14621ae0a5e1b2df45aab14181b7cf | apps/development-os/studio/index.html and studio/README.md | Committed local prototype; no PR/merge/release inferred |
| Nail / axmatea | No OS task branch assigned by this handoff | Assigned task only | GitHub write verified; Railway identity match pending |
| Tony | No code branch required | Scope, access, costs, final approvals | Review/input gates in OS_STATUS.md |

Claude also owns Tony Dashboard UI. The exact current Dashboard branch/local source is not established by the Studio handoff; do not assume the separate luxury website branch is the OS dashboard.

## Claude handoff reconciled after source review
Source: studio/README.md on the exact Claude checkpoint above.
- Adds a standalone Studio page with one made-up project, per-area files, selection states, AI brief preparation and output drafts.
- Uses browser localStorage/IndexedDB with a memory fallback. No AI, Smartsheet, application login or hosted storage connection.
- Builder reports manual desktop/phone checks, escaping, CSV quoting and reapproval behavior. Independent Node logic checks confirmed reapproval and text escaping, but found six readiness failures recorded in OS_STATUS.md. Browser/phone claims remain builder-reported.
- Builder explicitly leaves serving/CSP and automated tests to infrastructure coordination. No edits to server.mjs, package files, CI, Dockerfile, docs or website were claimed; tree review confirms the Studio-only additions.
- Required next integration: externalize script/styles without weakening CSP, add explicit loopback Studio routes, agree shared project/selection/output contracts, cover revision/output/persistence behavior, and link Dashboard.
- Reviewed findings: use stable task IDs; include selection/source/revision in exports; preserve old cost fields; provide spreadsheet-safe CSV text; carry dependency/release links; replace the Dashboard placeholder. No real approval, purchase, payment or work release was created by QA.
- Reconcile those changes in a focused PR after agreeing path ownership. Do not cherry-pick or merge the full branch into another active task automatically.

## Coordination protocol
1. Before editing, publish task, exact branch/commit and intended paths here or in the linked PR. Check the other contributor's latest checkpoint.
2. One writer per shared file. Codex requests a handoff before touching Studio source; Claude requests coordination before server, CI, infrastructure or central-doc changes.
3. Use synthetic fixtures only. Real pilot files, private dashboards and credentials stay outside this public repository.
4. Each PR includes source SHA, changed paths, reproducible checks, remaining gaps and next owner. Another reviewer checks the exact final commit, then Tony approves.
5. A shared file is not automatic agent synchronization. Mark acknowledgement explicitly; no background agents or broad tool grants are created.
6. Work from agreed reviewed bases. Preserve stacked website PRs and current production source; do not merge them to simplify OS work.

## NEXT THREE ACTIONS
1. **Claude Code:** acknowledge this handoff after a safe checkpoint, confirm Dashboard source, and fix the six reviewed readiness gaps on a separate focused UI/integration PR with tests.
2. **Codex:** review/retest Claude's exact follow-up commit, coordinate explicit server/CSP routes and backend interfaces, then run the approved staging access and rollback checks.
3. **Tony:** complete GitHub verification; review the PR and concrete identity/accounts/staging resource proposal before merge or activation.

## Prompt for Claude Code
Read AGENTS.md, docs/OS_MASTER_PLAN.md, docs/OS_STATUS.md and this file from the infrastructure PR without overwriting your working branch. Preserve your current changes. Confirm your branch, commit, dirty paths and Dashboard source. Continue owning Tony Dashboard and Design Studio. Review the independent test findings before fixes. Propose the smallest integration into existing apps/development-os: explicit routes/CSP-compatible assets, common project IDs and draft outputs, and Dashboard navigation. Coordinate shared server/CI/contract paths with Codex. Keep demo selections/budgets distinct from approved operational records. Do not merge, expose private data, use copied credentials, create paid resources or deploy production.

Acknowledgement from Claude: not yet verified. Review of the published handoff does not claim contact with the running Claude session.
