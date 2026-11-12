# Claude Code handoff

Newest entry first. Keep every entry safe for a public repository: no real addresses, clients, prices, files or credentials.

## 2026-11-12 — Workspace prototype: Daily Workspace, Design Studio, New Development Project

- **Agent:** Claude Code, directed by Tony.
- **Branch:** `claude/design-studio-prototype`, from `main`.
- **Role:** builder. Requested reviewer: Codex. Tony merges.
- **Scope:** a prototype for review. No production deployment, no live-record change, no infrastructure change.

### Step 1 — what the current interface was missing

| Area | Before this branch | Missing |
| --- | --- | --- |
| Daily workspace | Nothing in the repository. A private dashboard prototype exists outside it | A place for tasks, client requests, follow-ups, deadlines and decisions across projects |
| Design Studio | Nothing in the repository | Sources, design options, review and approval, selections, revisions, and a path to estimating and construction |
| New project | `launch.html` exports a Draft JSON plan and stops | Creating a project inside the workspace with partners, legal, feasibility, architecture, permits, budgets, schedules and team roles organised |

### Step 2 — navigation

Sidebar: **Daily Workspace · Design Studio · New Development Project · Higgsfield designs**, then projects by address with search. On a phone: a bottom bar with Daily, Studio, New and Projects.

Inside a project the Design Studio is one eight-step flow:

`Project → Upload sources → Design → Review & approve → Takeoff & budget → Client proposal → Work package → Construction`

### Step 3 — what was built

| File | Purpose |
| --- | --- |
| `apps/development-os/studio/index.html` | The whole prototype. One page, no build step, no dependencies |
| `apps/development-os/studio/README.md` | What it is, data rules, built-in rules |
| `apps/development-os/studio/tools/browser-check.mjs` | Headless browser check. Node 22+ and a local Chrome; no packages |
| `apps/development-os/studio/screenshots/*.png` | Eight screenshots produced by the check, made-up data only |
| `docs/CLAUDE_HANDOFF.md` | This file |

Rules the page enforces:

- Outputs are built only from approved selections.
- Editing an approved selection, or revising an approved design option, keeps the earlier revision and returns the item for approval.
- A file added again under the same name becomes a new revision. Nothing is removed.
- Unknown quantity or cost stays blank and is never counted as zero. The budget total says how many lines are not included.
- A date is "proposed" until it is marked "confirmed".
- A development checklist item marked Done without evidence is flagged.
- New projects start with no owner, no dates and no prices. Team roles are blank until a real name is typed.
- Proposal inputs are lines to enter in Wave. The page produces no proposal document and no price.
- Draft tasks use the `launch-template.json` task fields with `status: "Draft"`, no responsible person and no dates.
- Higgsfield links are accepted only on `higgsfield.ai`.

### Step 4 — tests

`node apps/development-os/studio/tools/browser-check.mjs` — **23 of 23 checks pass** (headless Chrome, throwaway profile):

- sample data and counts; budget total from known amounts only;
- approval, revision and design-option rules;
- file revisions; typed text is escaped; CSV quoting;
- intake rejects empty and duplicate addresses; 27 or 29 checklist items by type; none for construction;
- tasks add and complete; exported tasks are Draft with no owner or date;
- Higgsfield import rejects other links and lands as a Rendering attached to the option;
- records and an uploaded file survive a reload;
- no sideways scroll in 11 views at desktop and phone width; no script errors.

Repository unit tests on an export of this branch, without a website build: 62 of 63 pass. The one failure is `scripts/test/website-host.test.mjs`, which needs `dist`. `npm run build` and the full `npm run check` were **not** run; no website, package or CI file is touched.

Not tested: Safari on an iPhone; a screen-reader pass; very large files.

### Step 5 — for Codex to integrate and deploy

Nothing below was done on this branch. These are infrastructure, left to its owner.

1. **Serve it.** `apps/development-os/server.mjs` allows explicit routes only, and its content policy (`script-src 'self'`, `img-src 'self' data:`) blocks this page's inline script and `blob:` thumbnails. Split script and styles into files under `studio/`, add the routes, allow `img-src blob:`.
2. **One template.** `index.html` embeds a grouped copy of the 29 launch tasks. Once served, load `launch-template.json` instead and add a group field there, or extend `scripts/check-repository.mjs` to compare the two.
3. **Unit tests.** Move `blockers()`, `outRows()`, `csv()`, `importHiggsfield()` and the revision rules into `studio/src/*.mjs` so `node --test` covers them. Wire `tools/browser-check.mjs` into CI only if the runner has Chrome.
4. **Storage.** Browser storage is a stand-in. Files belong in each project's own folder or approved storage, and records in Smartsheet. Follow `docs/SECURITY.md` before any real data or any hosting.
5. **Deployment.** None requested. The page has no sign-in and must not be hosted with real data.

### Missing integrations

| Integration | State |
| --- | --- |
| Smartsheet | Not connected. Draft task export only. Smartsheet stays the operational record |
| Wave | Not connected. Status and document number are typed by hand |
| AI design generation | Not connected. The page builds a text brief to paste into an AI tool |
| Higgsfield | Not connected to the page. Images are added by hand, or by an assistant that has the Higgsfield connection |
| Email and calendar | Not connected. Client requests and dates are typed by hand |
| Sign-in and roles | None |

### Not built

A free-form canvas for arranging and annotating images; deleting or archiving; importing or exporting a whole workspace; notifications; permissions.

### Next actions

| # | Action | Owner |
| --- | --- | --- |
| 1 | Try the prototype on one real kitchen or bathroom and say what to change | Tony |
| 2 | Review this branch against the rules above | Codex |
| 3 | Decide where project files really live and which AI tool receives briefs | Tony |
| 4 | Serve the page from the local tool server and move logic into testable modules | Codex |
| 5 | Design the read-only Smartsheet reader, then Draft-row creation after approval | Claude Code builds, Codex reviews, Tony approves each write type |
