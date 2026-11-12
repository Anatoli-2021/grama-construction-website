# Workspace prototype — Daily Workspace, Design Studio, New Development Project

**Status:** prototype for owner review. Not served by the local tool server, not hosted, not connected to AI, Smartsheet, Wave, Higgsfield or email.

Handoff, tests and open items: [`docs/CLAUDE_HANDOFF.md`](../../../docs/CLAUDE_HANDOFF.md).

## Open it

Open `index.html` in a browser. No build step and no dependencies.

## What it does

- **Daily Workspace** — tasks, client requests and follow-ups you type in; decisions waiting; deadlines; projects.
- **Design Studio** — one project, eight steps: Project → Upload sources → Design → Review & approve → Takeoff & budget → Client proposal → Work package → Construction.
- **New Development Project** — start a project by address. A development project gets the standard launch checklist grouped by partners, legal documents, feasibility, architecture, permits, budgets, schedules, team responsibilities and closeout.
- **Higgsfield designs** — add images made in Higgsfield to a project as renderings and attach them to a design option.

## Data rules

- The file ships with **one made-up project**. Never commit real addresses, client names, prices, files or exports.
- What a person adds is stored in that browser only (`localStorage` for records, `IndexedDB` for file contents). Nothing is uploaded or sent.
- Downloads (CSV and JSON) are generated in the browser. Do not commit them; the repository policy rejects `.csv`.
- A blank quantity or cost means unknown. It is never treated as zero.

## Check it

```
node apps/development-os/studio/tools/browser-check.mjs
```

Needs Node 22 or later and a local Chrome (`CHROME_PATH` if it is not in the default Windows location). It starts Chrome headless with a throwaway profile, runs 23 checks and, given a folder as the second argument, writes screenshots.

## Deep links

`#daily`, `#new`, `#higgsfield`, `#studio`, `#studio-1` … `#studio-8`.
