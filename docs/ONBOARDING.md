# Developer onboarding and collaboration

Repository: https://github.com/Anatoli-2021/grama-construction-website (private).
Owner/release approver: Tony, GitHub `Anatoli-2021`.
Approved developer: Nail, verified GitHub `axmatea` (display name AI); write permission verified November 10, 2026.

## Join from another computer

1. Sign into your own approved GitHub account. If an invitation is pending, accept it from GitHub notifications or the repository invitation page. Do not use Tony’s credentials.
2. Install Git and Node.js 24 LTS. Use Git Credential Manager or your own GitHub CLI browser sign-in.
3. Run:

```powershell
git clone https://github.com/Anatoli-2021/grama-construction-website.git
cd grama-construction-website
git switch feature/investor-showcase-polish
npm ci
npm run check
npm run dev
```

Visit http://localhost:5173. In a second terminal, run `npm run dev:os` and visit http://localhost:5180. Both servers remain local. The branch above contains the current Railway showcase; use stable `main` for new work after the team reviews/reconciles the PRs. Check `TEAM-HANDOFF.md` for the latest source before starting.

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

GitHub rejected branch protection for this private repository under the current plan (403: Pro or public repository required). `main` is currently unprotected. Owner review and passing CI are documented conventions, not enforced merge gates. Keep the repository private. Tony may approve a plan/organization change later to enforce protection; no upgrade was purchased.

CI has no deployment credentials. The website is running on Railway, but its settings currently report automatic deployment unavailable. Follow the standing authorization and explicit deployment verification in `RELEASES.md`; a push alone is not proof that the website updated.
