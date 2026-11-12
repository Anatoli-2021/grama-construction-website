# Infrastructure handoff — November 12, 2026

Objective: prepare the existing repository and Railway project for Claude Code, Nail and future authorized developers.

Builder: Codex. UI owner: Claude Code; exact active UI branch/commit still unconfirmed. Do not overwrite it.

Branch: feature/infrastructure-readiness-2026-11-12, based on main af3faf5b924865f898bb32f022ef84ab7e4aca94.
Scope: repository instructions, source/data boundaries, staging plan, developer handoff, preview/review/rollback procedure and factual public/private corrections. No website/OS UI or operational records changed.

Verified: existing source paths, public repository visibility, axmatea write access, existing Railway production service, two newly created empty staging environments, PR environments disabled. Runtime and permissions contract is defined, not implemented.

GitHub main protection: prepared but blocked by owner identity verification when saving. Do not count it as enforced until the actual saved rule is checked.
Railway membership: an existing Can Edit member is visible; mapping that member to Nail remains unconfirmed. No invitations or new access grants made.

Testing: npm ci completed (25 packages audited; no vulnerabilities reported), npm run check passed (website build, 63 Node checks, repository/public-artifact policy), and all 9 existing localhost API/asset checks passed. Thirty relative documentation links resolved. Staging JSON was validated as synthetic/inactive/isolated, shared instructions are 3,657 bytes, and CLAUDE.md imports AGENTS.md. A limited staged-tree credential-pattern scan found no matches; full history/all-branch review is not complete. The first PowerShell localhost health probe failed; the Node direct-loopback retry passed. No staging application deployment, hosted-auth test or rollback drill has run.

Next:
1. Tony completes GitHub identity verification; infrastructure owner verifies saved rule.
2. Claude checkpoints current work and acknowledges docs/CLAUDE-INFRA-HANDOFF.md with branch/commit/paths.
3. Reviewer checks this branch and CI, then Tony approves merge.
4. Agree on identity provider, approved accounts, /platform routing and source adapters.
5. Approve synthetic staging runtime activation/cost, connect only reviewed commits, then run runtime/access/rollback acceptance.
6. Approve real-data integration separately after evidence and access checks.

Handoff received/acknowledged by Claude: NOT VERIFIED. No automatic message to another developer has been sent.

## Later checkpoint — use central documents
The preceding paragraphs preserve the initial checkpoint. Current state is maintained in [OS_STATUS.md](../OS_STATUS.md) and [TEAM_HANDOFF.md](../TEAM_HANDOFF.md).
Claude's 239335c handoff explicitly acknowledges PR #15 at 7f5464b. Original six logic regressions pass; expanded independent review is 22 pass / 1 fail (renovation gate dependencies). Google owner-only was approved; a synthetic host candidate passes 22 local security tests (85 total repository tests), not actual Google/Railway acceptance. Existing OS staged-create service is preserved, undeployed; website staging is now active under separate website coordination. No merge, paid activation, production change or operational write in this continuation.
