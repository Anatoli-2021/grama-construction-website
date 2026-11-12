# Grama Construction Development OS — master plan

## Authority and scope
Tony approved continuing the existing platform, the five-step execution order below, Claude Code owning Tony Dashboard/Design Studio, and Codex owning infrastructure/integration. He subsequently confirmed Google sign-in with one initial owner account only. The actual identity belongs in private configuration. Detailed design, additional accounts/scopes, paid resources, operational writes, merge and production release are not approved merely because they appear here.

Current execution state: [OS_STATUS.md](OS_STATUS.md). Branch ownership and next handoff: [TEAM_HANDOFF.md](TEAM_HANDOFF.md). Preserve older dated reports as evidence; do not use them as competing live status registers.

One existing repository: Anatoli-2021/grama-construction-website. Website remains at root; OS remains apps/development-os/. No duplicate application/repository is required. The repository is public: only code, blank templates and clearly synthetic examples belong in Git.

## Approved work order and acceptance
| Step | Owner | Acceptance criteria |
| --- | --- | --- |
| 1 Verify | Codex | Record existing source paths, exact branches/commits, developer permission, Railway targets and completed checks; distinguish source evidence from claims |
| 2 Organize | Codex | These three central documents exist, link correctly and separate approved direction, verified work, proposals and pending approval |
| 3 Coordinate | Claude UI / Codex infrastructure | Review Claude's exact committed handoff, record file ownership and interface dependencies; changes remain on separate branches/PRs; no conflicting edits or unreviewed merge |
| 4 Prepare deployment | Codex | Isolated staging configuration, server authentication/authorization contract, synthetic-only data, least-privilege sources and tested release/rollback acceptance; do not call empty shells a deployed platform |
| 5 Validate | Codex with Claude fixes | Exercise New Project → Design Workspace → Approved Selections → Budget → Contractor Package → Project Dashboard with labeled demo data; record passes, failures and missing integration; no live writes |

Do not skip failed gates to make the sequence appear complete. No invented dates, estimates, approvals or technical releases.

## Product roadmap
1. **Foundation and review:** retain the existing launch tool, source boundaries, instructions, CI and isolated staging. Obtain effective branch review protection.
2. **Tony's creation workbench:** Claude develops Dashboard and Design Studio in the existing OS. Gather plans/surveys/photos, compare ideas/renderings, coordinate vendor drawings, record selections and identify missing facts.
3. **Connected project workflow:** one stable project ID connects launch plan, design areas, source documents, approved selection revisions, budget draft, contractor package and dashboard. Shared links must work; copying a project name between disconnected stores is insufficient. Claude's reviewed 8b55c4f fixes all original six findings and DEP-02. Expanded exact-asset testing is 23 pass / 2 fail: missing contract authority is dropped instead of blocking export, and an unapproved predecessor can leave a dangling task ID. Browser, shared storage and secure UI integration remain incomplete.
4. **Private staging:** review the Google owner-only authentication candidate, integrate Claude's UI with server project/field/file permissions, isolated secrets and synthetic fixtures, then run real provider/access tests and a Railway rollback drill. Local HTTP/offline cryptographic tests are evidence for the candidate, not a hosted acceptance.
5. **Read-only business pilot:** after Tony approves accounts and source access, show permitted Smartsheet records with source revision/freshness. Preserve existing approved records. Use the existing property pilot only through private sources.
6. **Controlled daily operation:** after evidence review and explicit release approval, enable the minimum approved operations. Additional trades/projects use the same template. Automation and writes are introduced one operation at a time, not by granting unrestricted agent access.

No calendar deadlines are assigned by this document.

## Reusable business structure
Acquisition/opportunity → feasibility → partnership/legal → architecture/design → engineering → permits/utilities → detailed budget/schedule → procurement → construction/financial controls → completion/closeout.
Every project records address/opportunity, stable ID, type, linked original sources, people/roles, current phase, missing facts, decisions, dependencies and next action. Restricted records retain their existing access boundaries.

Selection approval, budget approval, purchase/contract commitment and released-for-work approval are distinct. An approved color is not authorization to buy, pay or release a contractor.

## Responsibilities
- Tony: business priorities, scope/selections, allowed accounts and access, resource spending, merge and release approval.
- Claude Code: Dashboard and Design Studio interface and the requested UI fixes; publish exact branch/commit, changed files and evidence.
- Codex: repository/infrastructure, integration/security contracts, staging preparation, independent validation and consolidated status.
- Nail / axmatea and future approved developers: assigned branch/PR, minimal authorized access, checks and handoff; no assumed access to Tony's computer or private records.
- Any two contributors: one writer per file; agree on shared-file changes before editing. Another reviewer examines the exact final commit. No AI agreement creates business authority.

## Tony's subsequent six-phase execution plan
The supplied execution plan is accepted as product direction; begin with Phase 1.
It does not grant release, spending, source-write or expanded-account authority.
Claude retains UI ownership; Codex coordinates and independently tests/integrates.
The overlapping Codex UI draft was closed when Claude published the same foundation.

| Phase | Owner | Acceptance |
| --- | --- | --- |
| 1 Foundation | Claude UI / Codex review | DEP-02 and all export integrity gates pass; external assets; same-project Dashboard/Studio; regression and browser acceptance |
| 2 Private access | Codex / Claude interface | Existing owner-only host integration; denied-access tests; synthetic-only staging readiness, no unprotected website route |
| 3 Daily Dashboard | Claude | Priorities, projects, decisions, requests, design work, blockers, known deadlines, follow-ups and exceptions open the correct project quickly |
| 4 Design Studio | Claude | Synthetic kitchen from source upload through alternatives, revisions, vendor references, demo review, quantities and draft package; integrations labeled honestly |
| 5 Design to production | Claude / Codex contracts | Project → sources → design → selections → separate approvals → takeoff → budget → Wave proposal reference → work package → tracking, with lineage |
| 6 Business interfaces | Codex / Claude views | Read-first approved source contracts, scoped permissions and freshness; no duplicate operational records or automatic writes |

Phase 1 remains in progress; the two export findings and unverified browser/serving gates prevent signoff. Later product phases do not override the source systems or approval boundaries above.

## Definition of done
Tony can enter/resume a project through one accessible private platform; the complete workflow shares IDs and source-backed records; users see only permitted data; staging/auth/integration/rollback tests pass; documentation matches deployed behavior; another authorized developer can set up and continue from the central handoff. Tony approves the exact merge/release and real-data scope.
This definition is NOT yet met. See current blockers in OS_STATUS.md.

Technical details: [security/integration contract](SECURE-OS-CONTRACT.md), [staging procedure](../infra/staging/README.md), [release/rollback](RELEASES.md), [Claude task brief](CLAUDE-INFRA-HANDOFF.md).
