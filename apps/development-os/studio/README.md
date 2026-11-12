# Design Studio — prototype

**Status:** prototype for owner review. Not served by the local tool server, not hosted, not connected to AI or to Smartsheet.

## What it is

One page, `index.html`. No build step and no dependencies. Open the file in a browser.

It lets one person:

- open a project by address, or add one;
- keep files per design area (survey, drawing, photo, reference, specification, rendering);
- record selections and move each through `Discussed → Selected → Approved → Ordered → Received → Paid → Installed`;
- build a text brief for an AI tool from the notes, selections and file list;
- turn approved selections into a takeoff, budget lines, proposal inputs, a procurement list and Draft contractor tasks;
- see decisions waiting, blockers and deadlines for the project.

## Data rules

- The file ships with **one made-up project**. Never commit real addresses, client names, prices, files or exports.
- What a person adds is stored in that browser only (`localStorage` for records, `IndexedDB` for file contents). Nothing is uploaded or sent.
- Downloads (CSV and JSON) are generated in the browser. Do not commit them; the repository policy rejects `.csv`.
- A blank quantity or cost means unknown. It is never treated as zero.

## Rules built into the prototype

- Outputs are built only from approved selections.
- Editing an approved selection keeps the old revision in its history, raises the revision number and returns the item to `Selected` for a new approval.
- A file added with the same name in the same area becomes a new revision. Nothing is removed.
- Proposal inputs are line items to enter in the accounting system of record. The page does not produce a proposal document.
- Draft tasks use the same fields as `launch-template.json` tasks: `status: "Draft"`, no responsible person, no dates. The trade is a suggestion.

## Handoff for Codex

Builder: Claude Code. Reviewer: Codex. Branch: `claude/design-studio-prototype`, from `main`.

**Added:** `apps/development-os/studio/index.html`, `apps/development-os/studio/README.md`.

**Not touched:** `server.mjs`, `package.json`, lockfile, CI, Dockerfile, `scripts/`, `docs/`, the website, the launch tool. No entry was added to `docs/TEAM-HANDOFF.md` because open pull requests edit that file; this section is the handoff until they are merged.

**Left for the infrastructure owner:**

1. Serving it from `npm run dev:os`. `apps/development-os/server.mjs` allows explicit routes only, and its content policy (`script-src 'self'`, `img-src 'self' data:`) blocks this page's inline script and its `blob:` thumbnails. Options: move the script and styles into files under `studio/`, add the routes, and allow `img-src blob:`.
2. Tests. None were added. The pure functions worth covering are `blockers()`, `outRows()`, `csv()` and the revision rule in the selection form handler. Moving them into `studio/src/*.mjs` would let `node --test` reach them.

**Checked by the builder:** opens with no console errors; desktop and phone widths with no sideways scroll; approve, advance and edit-after-approval behave as described above; file revisions increment; budget total counts known amounts only; CSV quoting; user text is escaped; project search and add.

**Not checked:** persistence across a browser restart in a normal profile (the test view had storage disabled, so the in-memory fallback ran); Safari on iPhone; an accessibility audit.

**Open questions for the owner:** which AI tool the brief should go to, and whether it may receive project files; where files live in the real version (the project's own folder rather than the browser); when approved outputs may be written to Smartsheet.
