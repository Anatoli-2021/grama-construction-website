# Claude Code handoff

Newest entry first. Keep every entry safe for a public repository: no real addresses, clients, prices, files or credentials.

## 2026-11-12 (evening) — DEP-02 fixed; script and styles split for a strict content policy

- **Agent:** Claude Code, directed by Tony. Role: builder. Requested reviewer: Codex. Tony merges.
- **Acknowledgement:** read `docs/OS_STATUS.md`, `docs/TEAM_HANDOFF.md` and `apps/development-os/hosted/README.md` on PR #15 at head `85262e3`. Nothing from that branch was merged or copied. No Codex-owned path was edited.
- **Branch:** `claude/design-studio-prototype`. Two commits since the reviewed `239335c`:
  1. `d2ebe5f` — DEP-02 fix, still one file. Reviewer helper at `85262e3`, unmodified, on `index.html` blob `cc17352d9e397022cf8cff5d38cc0a15af31ee8d`: **23 pass, 0 fail** (was 22 and 1).
  2. The branch head — the same page split into separate files. See the pull request for its SHA.

### DEP-02

A construction or renovation project now gets the launch plan gates its work depends on (15 items, including contract authority `T17` and release-to-build `T19`). Draft tasks reference only gates that exist in the project's own plan. A plan with no release-to-build gate cannot export contractor tasks; the page says so and lists it as a blocker. Older saved projects with an empty checklist gain the gates on load.

### Split for the hosted policy

| File | Contents |
| --- | --- |
| `studio/index.html` | Markup only. No inline script, style block or style attribute |
| `studio/studio.css` | All styles, plus small layout utilities that replace the former style attributes |
| `studio/studio-logic.js` | Record logic: IDs, checklist, approvals, outputs, exports. No page, storage or network access. Exposes `globalThis.StudioLogic` |
| `studio/studio.js` | Storage, views and events |
| `studio/test/logic.test.mjs` | 11 Node unit tests of the logic |

- Policy needed: `script-src 'self'; style-src 'self'; img-src 'self' data:`. Nothing else. No dynamic code execution. Thumbnails and previews are `data:` images; other files download.
- The two scripts are plain scripts, not modules, so the page still opens by double-click and shares names between the files. `studio-logic.js` loads first.

### For Codex

1. **Helper.** The source is now `studio-logic.js` followed by `studio.js`. `StudioLogic` can also be imported directly, as `studio/test/logic.test.mjs` does.
2. **Routes to add when the UI is wired in:** `index.html`, `studio.css`, `studio-logic.js`, `studio.js`, all behind the session check.
3. **`npm test` glob.** `apps/development-os/studio/test/*.test.mjs` is not in it. `package.json` is yours.
4. **Storage seam.** All persistence is in `studio.js`: `loadState()`, `save()` and the `Files` object. Replacing those three with calls to an authorised project-record interface is the whole client change. Proposal for that interface, not built: read and write one project record by Project ID with a revision for conflict checks, and put and get one file by file ID, each authorised per project on the server.

### Tests

| Check | Result |
| --- | --- |
| `node apps/development-os/studio/tools/browser-check.mjs` | **40 of 40**, including the split page served over HTTP under `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'` with no violations |
| `node --test apps/development-os/studio/test/logic.test.mjs` | **11 of 11** |
| Reviewer helper at `85262e3` on commit `d2ebe5f` | **23 pass, 0 fail** |
| `npm run build`, full `npm run check`, GitHub CI | Not run |
| Hosted sign-in, permissions, staging | Not tested by Claude; the UI is not wired into the hosted candidate |

### Blockers

- The UI is not served by the hosted candidate yet; routes and the project-record interface are Codex's to add.
- No pull request is open for this branch: GitHub is not signed in for Claude on this computer.
- Safari on an iPhone is not tested.

### Next three actions

1. **Codex:** retest `d2ebe5f` and the branch head; adapt the helper to the external files; add protected routes for the four UI files.
2. **Tony:** open the draft pull request; approve staging resources and the Google sign-in configuration.
3. **Claude Code:** replace browser storage with Codex's authorised project-record interface once it exists, with made-up data.

## 2026-11-12 (later) — Six reviewed workflow fixes and the shared Project ID

- **Agent:** Claude Code, directed by Tony. Role: builder. Requested reviewer: Codex. Tony merges.
- **Acknowledgement:** read `AGENTS.md`, `docs/OS_MASTER_PLAN.md`, `docs/OS_STATUS.md`, `docs/TEAM_HANDOFF.md` and `docs/CLAUDE-INFRA-HANDOFF.md` from PR #15 (`feature/infrastructure-readiness-2026-11-12`, head `7f5464b876` when read). Nothing from that branch was merged or copied here.
- **Branch:** `claude/design-studio-prototype`, from `main`. Commits are made without checking the branch out, so the shared checkout was never switched and has no dirty paths from this work.
- **Dashboard source:** the dashboard is the Daily Workspace view inside `apps/development-os/studio/index.html`. A separate dashboard prototype holding real pilot data exists only on Tony's computer and stays out of this repository. It links to the Studio by Project ID.
- **Scope:** Studio paths and Claude handoff files only. No server, CI, package, staging, website or Animated Experience file is touched.

### The six findings

| Finding | Fix | Evidence |
| --- | --- | --- |
| FLOW-08 Dashboard navigation was a placeholder | The Daily Workspace is the dashboard: every project by Project ID, with decisions, deadlines and blockers. `#project/<ID>` and `#project/<ID>/<step>` open a project; an unknown ID opens intake with the ID filled in | Codex helper FLOW-08; browser checks "dashboard lists projects by Project ID" and both deep-link checks |
| FLOW-09 Draft tasks had no predecessors | Every Draft task depends on the launch plan's contract-authority and release-to-build tasks (`<project>-T17`, `<project>-T19`) and on any selection it must follow. A loop is refused. Tasks carry `releaseStatus: "Not released"` | FLOW-09; "task dependencies" and "a dependency loop is refused" |
| ID-01 Task keys shifted when an item was inserted | Each selection gets a permanent number when created. IDs derive from it: `<project>-SEL-nn`, task key `DS-nn`, task ID `<project>-DS-nn` | ID-01; "stable IDs" |
| TRACE-01 Outputs had no selection or revision | Takeoff, budget, proposal inputs, procurement and tasks all carry Selection ID, Revision, Approved on, Source document and Project ID | TRACE-01; "traceability" |
| REV-02 Old revision lost unit cost and cost code | The whole approved revision is kept, with its approval date. Every status change is logged with time and revision. The history can be downloaded as JSON | REV-02; "full approval history" and "approval history export" |
| CSV-01 Formula-leading text | Text starting with `=`, `+`, `-`, `@`, a tab or a return (after any spaces) gets a leading apostrophe. Numbers from numeric fields stay numbers. Programs should read the JSON exports | CSV-01; "CSV: formula-leading text is neutralised" |

### Connected to the existing workflow, no new application

- **One Project ID.** The Studio uses the same rule as `packages/shared/project-id.mjs`. The rule is duplicated in the page because a single file cannot import a module when opened directly; see "Left for Codex".
- **Launch plan import.** New Development Project accepts the Draft JSON exported by `launch.html`. The project keeps its Project ID, and the plan rows become its checklist with their Task IDs and predecessors.
- **Same row shape out.** The task export includes `planRows` with the launch plan's column names, so Studio tasks can join the same plan.
- **Still Draft.** Selection approval is a demo action on one device. Budget approval, purchase commitment and released-for-work approval are separate and are not recorded.

### Tests

| Check | Result |
| --- | --- |
| `node apps/development-os/studio/tools/browser-check.mjs` (headless Chrome, throwaway profile) | **35 of 35 pass** |
| `scripts/qa/verify-studio-workflow.mjs` from PR #15, unmodified, against this branch's `index.html` | **17 pass, 0 fail** (was 11 and 6). Run with the blob SHA of `index.html` at this branch's head |
| Repository unit tests on an export of this branch, without a website build | 62 of 63; the one failure needs `dist` |
| `npm run build`, full `npm run check`, GitHub CI | **Not run** |
| Hosted authentication, permissions, staging | **Not implemented, not tested** |

To keep Codex's helper working, the page keeps one inline script, the `newproj` quick-add form, the `viewInfo()` name and the first six budget columns in their original order.

### Functionality checklist (made-up data, one browser)

| Step | State |
| --- | --- |
| New Project, by address or by importing a launch plan | Works |
| Design: sources, options, selections, revisions | Works |
| Selections approved and re-approved after a change | Works as a demo action; not a protected approval |
| Budget draft from approved selections | Works; unknown cost stays blank |
| Contractor package: Draft tasks with predecessors, procurement list | Works; nothing is released or ordered |
| Dashboard by Project ID | Works |
| Sign-in, roles, shared storage, Smartsheet | Not built |

### Staging, hosting and sign-in — proposal only, nothing built or deployed

- **Hosting.** Recommendation: a protected app subdomain rather than `/platform` on the main domain. The public site is served separately, so a `/platform` path needs a proxy in front of the website. A separate host also keeps session cookies and the content policy apart from the public site and makes deny-by-default simpler. `/platform` stays possible later behind such a proxy. Tony decides.
- **Staging.** Use the existing empty `staging-os` environment, synthetic data only, after Tony approves the exact resources.
- **Sign-in and permissions.** As `docs/SECURE-OS-CONTRACT.md` sets out: individual sign-in with an account allowlist, server-validated sessions, project roles, deny by default. Tests required before any exposure: anonymous denied, wrong role denied, wrong project denied, sign-out works.
- **Authentication test results:** none. Nothing is hosted.

### Left for Codex (not done here)

1. Hosted runtime, sign-in, permissions, routes and staging deployment.
2. Serving the Studio: its inline script and `blob:` thumbnails do not pass the local server's content policy. Claude will move the script and styles into files under `studio/` once Codex confirms how the helper should then load the source.
3. One copy of the Project ID rule and of the launch task list, once the page is served and can import modules.

### Blockers

- Identity provider, allowed accounts and staging resources are not approved.
- Claude has no Railway connection, and the GitHub command-line tool is not signed in on this computer.
- `main` is not protected.
- Safari on an iPhone is not tested.

### Next three actions

1. **Codex:** rerun the helper and review this branch's head; confirm the plan for external script files.
2. **Tony:** choose subdomain or `/platform`, approve the identity provider, accounts and staging resources.
3. **Claude Code:** after 1 and 2, make the Studio assets policy-compatible and build the screens against Codex's signed-in read interface, with synthetic data.

## 2026-11-12 — Workspace prototype: Daily Workspace, Design Studio, New Development Project

- **Branch:** `claude/design-studio-prototype`. Builder: Claude Code. Scope: a prototype for review.
- **Navigation:** Daily Workspace · Design Studio · New Development Project · Higgsfield designs, then projects by address. On a phone: a bottom bar.
- **Design Studio flow:** Project → Upload sources → Design → Review & approve → Takeoff & budget → Client proposal → Work package → Construction.

| File | Purpose |
| --- | --- |
| `apps/development-os/studio/index.html` | The whole prototype. One page, no build step, no dependencies |
| `apps/development-os/studio/README.md` | What it is, data rules |
| `apps/development-os/studio/tools/browser-check.mjs` | Headless browser check. Node 22+ and a local Chrome; no packages |
| `apps/development-os/studio/screenshots/*.png` | Screenshots produced by the check, made-up data only |
| `docs/CLAUDE_HANDOFF.md` | This file |

Rules the page enforces: outputs come only from approved selections; a changed approved item keeps its earlier revision and returns for approval; a file added again becomes a new revision; unknown quantity or cost stays blank; a date is proposed until confirmed; a checklist item marked Done without evidence is flagged; new projects start with no owner, dates or prices; proposal inputs are lines to enter in Wave; Higgsfield links are accepted only on `higgsfield.ai`.

Missing integrations: Smartsheet, Wave, AI generation, Higgsfield, email and calendar are not connected. There is no sign-in. Not built: a free-form canvas, deleting or archiving, whole-workspace import and export, notifications.
