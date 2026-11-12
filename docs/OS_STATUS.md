# Development OS — current status

Checkpoint: November 12, 2026. Maintainer: Codex. Reviewed artifact IDs and limitations below are evidence, not authorization.
Roadmap: [OS_MASTER_PLAN.md](OS_MASTER_PLAN.md). Coordination: [TEAM_HANDOFF.md](TEAM_HANDOFF.md).

## COMPLETED
- Verified existing public repository and unchanged website-root / apps/development-os source separation.
- Verified axmatea GitHub write permission; no invitation or permission expansion performed.
- Created staging-website and staging-os as empty environments in the existing Railway project; read-back confirmed no copied services, variables, volumes, buckets or pending patches.
- Prepared shared AGENTS.md / CLAUDE.md, security/integration and release contracts in draft PR #15, commit 902f8e25a081e67bef589e631f2ea7d8f67f0c3e.
- That commit passed local build, 63 existing Node checks, repository/artifact policy, 9 localhost API/asset checks and GitHub Actions run 43309929592.
- Reviewed Claude's committed handoff and source at claude/design-studio-prototype, commit 0b1d4e3f2c14621ae0a5e1b2df45aab14181b7cf. It adds only studio/index.html and studio/README.md.
- Created the three requested central documents without replacing an existing version.
- Independently exercised the exact Studio script: 11 logic checks passed and 6 complete-workflow readiness checks failed. The QA copy matches Git blob 1a64670632cf145de3142434fd8766a4b9f62a6c.

## IN PROGRESS
- Independent review of the updated central documents and reproducible QA helper in the same infrastructure PR #15; Tony's merge approval remains pending.
- Claude follow-up for the six findings below; no merge or copy of Studio into the infrastructure product source performed.

## BLOCKED
- GitHub main protection is not saved/enforced: owner identity confirmation is required.
- Current OS server does not serve Studio; its CSP rejects the prototype's inline script/blob image behavior. Do not relax access protection as a shortcut.
- No authenticated hosted OS runtime, application storage or approved live Smartsheet application connection exists.
- No runnable staging OS URL or completed staging runtime/rollback acceptance.
- The prototype and launch tool do not yet share one project-record store/ID workflow; the Dashboard link is optional and the local private dashboard is a separate artifact.
- Claude reports no committed automated Studio tests and no browser-restart persistence test.
- All-branch/history confidentiality review is not complete; the repository is public.
- Full browser workflow verification is blocked by browser policy denying local-file URLs. No alternate browser/protocol workaround was attempted. The Node logic harness is a different, limited test.
- Readiness defects: sequential task IDs, missing export revision IDs, incomplete old cost history, formula-leading CSV text and absent dependency/Dashboard integration.

## NEEDS TONY'S APPROVAL / INPUT
- Complete GitHub identity verification so the prepared main rule can be saved and checked.
- Confirm the existing Railway Can Edit member is Nail; no duplicate invitation.
- Approve identity provider/allowed accounts and any new access scopes.
- Approve exact synthetic staging runtime resources/spend and activation before anything runs.
- Review code/visual direction and approve merge; production and real-data access require separate explicit approval.
- Do not treat the prototype's selections, quantities, prices or click-to-approve as real business records or protected approvals.

## TEST RESULTS
| Check | Result |
| --- | --- |
| Existing infrastructure commit build / 63 tests / artifact policy | PASS |
| Existing localhost API/assets, 9 checks | PASS |
| Infrastructure commit GitHub CI | Initial checkpoint PASS; use the [current PR checks](https://github.com/Anatoli-2021/grama-construction-website/pull/15/checks) for the latest exact head |
| Documentation links | PASS: 45 relative links across the 21 changed files resolve; all three central documents exist |
| Limited staged-tree credential-pattern scan | No matches; not a full history audit |
| New Project → Studio → selection → budget → package → Dashboard | FAIL overall: 11 logic checks pass, 6 readiness checks fail; no full browser or cross-tool integration pass |
| Hosted authentication, project permissions, live source freshness | NOT IMPLEMENTED / NOT TESTED |
| Staging deployment and rollback drill | NOT RUN |

## Independent workflow findings
Method: unmodified committed script in Node with minimal DOM/storage stubs; actual submit/click/download handlers, no network and only synthetic inputs. This verifies logic, not rendered UI, browser persistence, protected approvals or hosted access.

| Priority / check | Observed result | Required fix / owner |
| --- | --- | --- |
| P0 hosted security | No application login/authorization exists | Codex + Claude agree backend; Tony approves provider/accounts; runtime denial tests before exposure |
| P1 FLOW-08 | Today navigation returns a placeholder instead of the project dashboard | Claude links the actual Dashboard with the shared project ID |
| P1 FLOW-09 | Draft task export has empty predecessor links | Claude/Codex define dependency and release references; keep Draft until explicitly released |
| P1 REV-02 | Prior approval history omits unit cost and cost code | Claude preserves the full approved revision and its approval/source references |
| P1 TRACE-01 | Budget export columns have no selection ID/revision | Claude carries stable IDs/revisions/source links through every output |
| P1 ID-01 | Inserting an approved item changes an existing task key from DS-01 to DS-02 | Claude uses stable project/selection/revision-derived identities |
| P1 CSV-01 | Export preserves a leading = in untrusted text cells | Claude/Codex define spreadsheet-safe text export and test intended consumers; do not execute formulas |

Working logic: create a synthetic project and kitchen area; exclude discussed/selected items from outputs; demo approval feeds a draft budget; missing costs remain blank; synthetic drawing metadata clears the prototype's drawing warning; export Draft tasks without owners/dates; edits return approved items for reapproval; HTML text is escaped.

Selection approval is a client-side demo action, not a protected business approval. Contractor tasks are draft planning inputs, not an authorized work release. No price shown in QA is a real quote.

Reproduce against a reviewed source file:

```text
node scripts/qa/verify-studio-workflow.mjs --source <reviewed Studio HTML> --expected-blob 1a64670632cf145de3142434fd8766a4b9f62a6c --commit 0b1d4e3f2c14621ae0a5e1b2df45aab14181b7cf
```

The helper checks the exact Git blob, writes synthetic results to ignored evidence/studio-qa, and exits 1 while readiness failures remain. It is a manual review helper, not part of the existing green CI suite. Do not execute arbitrary unreviewed source; node:vm is not a security boundary. After a reviewed fix, update the expected source identity and review the tests before rerunning.

CSV reference: [OWASP CSV Injection](https://community.owasp.org/attacks/CSV_Injection). Spreadsheet viewing and programmatic import need a deliberate text/number policy; CSV quoting alone is not a universal formula defense.

The definition of done is not met. Update this file from observed test evidence, never from inferred completion.
