# Development OS — current status

Checkpoint: November 12, 2026. Maintainer: Codex. Roadmap: [OS_MASTER_PLAN.md](OS_MASTER_PLAN.md). Coordination: [TEAM_HANDOFF.md](TEAM_HANDOFF.md). Evidence is not release authority.

## COMPLETED
- Verified public repository, website-root / apps/development-os separation and axmatea GitHub write access; no access expansion.
- Infrastructure draft [PR #15](https://github.com/Anatoli-2021/grama-construction-website/pull/15); 85262e3 passed 85 tests and GitHub Actions run 43317304312. Later changes require exact-head checks and reviewer confirmation.
- Tony confirmed Google sign-in with one initial owner account only. Actual identity/credentials remain private.
- Added synthetic Google OIDC host candidate, pinned openid-client 6.8.9, project allowlist, filtered metadata, expiring server sessions, single-use PKCE/state/nonce, CSRF logout and fail-closed configuration. No real-data mode or live writes.
- Local website build and 85 tests passed: existing 63 plus 15 actual localhost HTTP security tests and 7 offline real-OIDC-library/signature tests. No Google account was used.
- Latest reviewed Claude UI commit 8b55c4f84c5898d5cc2cb8645338f9c682961938 in [draft PR #19](https://github.com/Anatoli-2021/grama-construction-website/pull/19). His committed handoff acknowledges infrastructure 85262e3. HTML, both external scripts and CSS are locked to Git blob identities before QA.
- All six original failures and DEP-02 pass in logic. Expanded independent checks: **23 PASS / 2 FAIL** (DEP-03/04 below). Actual launch-builder subdivision import preserves Project ID and all 29 task IDs/dependencies; duplicate IDs refused.
- Claude's exact split-asset commit passed independent build, 63 default tests, artifact policy and a separate rerun of its 11 Studio logic tests. Those 11 are not in the default npm test glob yet.
- Closed overlapping temporary PR #18 unmerged after Claude's new commit appeared; its work is preserved as historical evidence, not a second active UI.
- OS-specific Dockerfile and variable-name-only example prepared; container/deployment not tested.

## IN PROGRESS
- Same PR #15: auth candidate, exact-source QA and central documentation review.
- Phase 1: Claude's DEP-02/asset split implemented; remaining export defects and independent browser/serving acceptance. No Studio UI copied into infrastructure product source.
- Shared hosted project records/storage; JSON import passing logic is not a shared application store.

## BLOCKED
- **P1 DEP-03:** removing T17 while keeping T19 still allows actual contractor JSON download; the missing contract gate is silently dropped. Require mandatory gates instead of omitting controls.
- **P1 DEP-04:** an approved selection following an unapproved selection exports a predecessor task ID absent from the package/checklist. Block invalid export or require predecessor approval.
- Authenticated host intentionally returns UI-integration-pending 503. Old loopback tool remains unchanged; no protected hosted Dashboard/Studio yet.
- No Google OAuth client/callback/private configuration or actual owner sign-in acceptance. Personal Google login does not prove MFA.
- Docker unavailable locally; image build/runtime untested. No persistent/shared project storage, backup or browser-restart durability acceptance.
- No OS staging URL/deployment or actual Railway rollback drill.
- GitHub main protection unsaved pending owner identity verification; existing Railway Can Edit member not conclusively mapped to Nail.
- Read-only Smartsheet application connection, approved sheet scope and freshness/permissions tests unimplemented; assistant connector credentials are not reused.
- Full all-branch/history confidentiality review incomplete; repository is public.
- Local-file browser verification blocked by browser policy. No alternate protocol/browser workaround; Node logic tests are limited evidence.

## Railway observation
Initially both staging environments were created empty. Re-read November 12:
- staging-website now has active SUCCESS service humorous-delight, source main. Website chat owns review; this continuation did not deploy it.
- staging-os has existing staged-create service exquisite-comfort, source main; no deployment, variables, volume or domain. Unapplied patch preserved; owner unknown. Website chat confirms it will leave it untouched.
- Reconcile that existing draft rather than duplicate it. Its main source is the website baseline, not the OS host candidate; do not apply as-is.
- Production source/configuration untouched. **OS staging URL: none.**

## TEST RESULTS
| Check | Observed result |
| --- | --- |
| Local build / Node suite / artifact policy | PASS: 85 tests with synthetic auth candidate |
| Google owner sign-in / MFA | NOT RUN |
| Anonymous / forged session / nonowner / wrong-project / restricted fields / logout / expiry / replacement | PASS locally with synthetic identities; owner-only, not future multi-role acceptance |
| Real OIDC signature / issuer / audience / nonce / expiry / state | PASS offline, intercepted discovery/token/JWK responses |
| Original six regressions + DEP-02 | PASS at exact 8b55c4f, logic only |
| Expanded independent workflow | 23 PASS / 2 FAIL: missing contract gate and unapproved predecessor |
| Exact Claude branch build/default tests/artifact policy | PASS: 63 tests; 11 additional Studio logic tests independently pass outside default glob |
| Actual launch JSON import | PASS logic: subdivision ID/29 tasks/dependencies; duplicate refused |
| Complete browser + hosted workflow | NOT READY |
| Container / Railway access / rollback | NOT RUN |
| Current PR CI | [Exact-head checks](https://github.com/Anatoli-2021/grama-construction-website/pull/15/checks); prior green head is not new-head evidence |

## Six reviewed fixes
| Finding | Result retained at 8b55c4f |
| --- | --- |
| FLOW-08 Dashboard context | PASS: project-linked Daily Workspace action returns to same project/budget step |
| FLOW-09 dependencies | PASS for single-home and direct renovation; DEP-03/04 remain |
| REV-02 cost history | PASS: former approved unit cost and cost code retained |
| TRACE-01 lineage | PASS: project/selection/revision headers; source/approval fields exist, missing source stays missing |
| ID-01 stable keys | PASS: actual new selection/reordering preserves existing key; distinct selection IDs/tasks unique |
| CSV-01 formula text | PASS: dangerous text neutralized; numbers preserved; spreadsheet consumer/resave not tested |

Synthetic flow: create project/area → selection excluded until demo approval → 2 × 100 = 200 budget draft → Draft/unreleased contractor package → project-linked Daily Workspace action. These are fictional inputs, not prices/quotes, protected business approvals or work release.

Evidence: [current exact-asset results](handoffs/studio-workflow-qa-8b55c4f.json), [asset identities](handoffs/studio-8b55c4f-assets.json), [host candidate/limits](../apps/development-os/hosted/README.md), [staging procedure](../infra/staging/README.md). Historical checkpoints: 0b1d4e3 was 11 pass / 6 fail; 48bbde9 was 12 / 5; [239335c was 22 / 1](handoffs/studio-workflow-qa-2026-11-12.json). They do not supersede this status.

~~~text
node scripts/qa/verify-studio-workflow.mjs --source <reviewed Studio HTML> --expected-blob 871633a946ecd7bf372cb611df9138c5841348b7 --commit 8b55c4f84c5898d5cc2cb8645338f9c682961938 --asset-manifest docs/handoffs/studio-8b55c4f-assets.json
~~~

Manual helper verifies Git blob, writes ignored evidence/studio-qa, exits 1 for the remaining defect and is separate from green infrastructure CI. Run only reviewed trusted code; Node vm is not a security boundary.

CSV guidance: [OWASP CSV Injection](https://community.owasp.org/attacks/CSV_Injection); CSV quoting alone is not universal formula protection.

## NEEDS TONY'S APPROVAL / INPUT
- Complete GitHub identity verification for the prepared protection; confirm Railway member mapping, without duplicate invitations.
- Review exact PR/code; merge approval remains separate.
- Approve concrete synthetic resource activation/spend/deployment after UI/security review and OAuth setup. Google provider/account choice is already approved.
- Additional accounts/scopes, live-data integration and production require separate approvals.

## NEXT THREE ACTIONS
1. **Claude Code:** fix DEP-03/04 in PR #19; retain all mandatory gates, validate predecessor closure and publish exact regression/browser evidence.
2. **Codex:** independently retest, connect reviewed UI/backend contracts and test OS image; prepare real provider/access/rollback acceptance.
3. **Tony:** finish GitHub verification and review exact PR/resource proposal.

Definition of done is not met; keep approval/dependency gates visible.
