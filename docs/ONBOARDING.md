# Developer onboarding and collaboration

Repository: https://github.com/Anatoli-2021/grama-construction-website (public as verified November 12, 2026; code and synthetic examples only).
Owner/release approver: Tony, GitHub `Anatoli-2021`.
Approved developer: Nail, GitHub axmatea; write permission reverified November 12, 2026. Start with AGENTS.md, INFRASTRUCTURE-READINESS.md and the task's handoff. Claude Code also reads CLAUDE.md, which imports the same repository rules.

## Join from another computer

1. Sign into your own approved GitHub account. If an invitation is pending, accept it from GitHub notifications or the repository invitation page. Do not use Tony’s credentials.
2. Install Git and Node.js 24 LTS. Use Git Credential Manager or your own GitHub CLI browser sign-in.
3. Run:

```powershell
git clone https://github.com/Anatoli-2021/grama-construction-website.git
cd grama-construction-website
git switch main
npm ci
npm run check
npm run dev
```

Visit http://localhost:5173. In a second terminal, run npm run dev:os and visit http://localhost:5180. Both servers remain local. Inspect the current task branch and unmerged PRs before making changes; do not switch another agent's checkout.

## Make one focused change

Start from a clean working tree. Do not discard someone else’s changes.

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c feature/short-description
# Edit and verify the intended product.
npm run check
git add path/to/changed-file
git commit -m "Explain the resulting behavior"
git push -u origin feature/short-description
```

On GitHub, open a pull request into `main`. Explain the problem/result, tests, screenshots for visible changes, data impact and release implications. Use the task template to link a focused issue. Request Tony’s review. Never force-push a shared branch or merge your own work without the required owner approval.

Before integration, fetch and merge `origin/main` into your feature branch. Resolve conflicts by preserving the intended combined changes, then rerun checks. Use merge commits for shared branches; do not rewrite another contributor’s history. If `pull --ff-only` fails, stop and inspect the divergence before reconciling it.

After approval and merge, switch to `main`, pull with `--ff-only`, then create a fresh branch. Keep releases tied to a reviewed commit and record the deployed SHA. Production/DNS/paid-service changes require Tony’s separate approval.

## Responsibilities

| Role | Responsibility |
| --- | --- |
| Tony | Approves accounts, access, business claims, production releases, domains and spending |
| Nail / approved developers | Work in focused branches, use synthetic data, run checks, document changes and address review |
| Website owner for a task | Public assets, accessibility, motion, enquiry behavior and website build |
| OS owner for a task | Draft logic, source provenance, access boundaries and tests; no live writes without authorization |
| Project manager agent | Maintains docs/handoff and verifies results in the active task; no assumed background synchronization |

## Access and enforcement limits

Owner path for future invitations: repository **Settings → Collaborators → Add people**. Verify the exact account with Tony before sending. Personal-repository collaborators receive read/write access; use an organization later if narrower team roles are required. Remove access when no longer needed.

An older inspection found private-repository plan restrictions. The repository is now public. A main protection rule was prepared on November 12 with PR approval, the existing verify check, up-to-date code, stale/latest-push review controls, resolved conversations and no bypass. Saving triggered owner identity verification, so enforcement is not yet confirmed. Do not equate the proposed rule or CI success with an active merge gate. No plan or visibility change was made by the infrastructure task.

CI has no deployment credentials. Railway has an existing website deployment and two empty staging environments; no OS runtime is hosted. Automatic PR environments remain disabled. Verify the current source, access and approval gates in RELEASES.md before activation.
