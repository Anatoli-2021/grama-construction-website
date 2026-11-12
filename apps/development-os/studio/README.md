# Workspace prototype — Phase 1 foundation

Continuation of Claude's existing Studio at 239335c, not a new application.
Source: index.html, studio.css, studio.js. Public repository: synthetic input only.
Daily Workspace and Design Studio share project navigation and the same browser-local records.

## Current acceptance
Code and synthetic logic tests pass. **Phase 1 is not fully accepted:** independent
browser/CSP/layout/persistence checks and reviewed local/protected routes are still
pending. Existing loopback server and private host are not changed by this UI PR;
they do not currently serve this Studio. There is no staged OS application URL.
Do not publish these files through the public website or relax host restrictions.

The HTML loads only its external script/style, has no inline styles or handlers,
and declares a restrictive CSP. Hosting must enforce equivalent or stricter
headers. Image previews use raster data URLs under img-src self/data, not a new
blob image allowance. Uploaded sources download as octet-stream; active HTML/SVG
is not opened as an executable app document.

## What works in synthetic logic checks
- Daily Workspace: entered tasks, client requests, follow-ups, waiting decisions,
  dates and projects; project-linked actions reopen the same Studio/step.
- Studio: Project → Sources → Design → Review → Takeoff/budget → Wave proposal
  inputs → Draft work package → Construction tracking.
- Direct renovation intake includes budget (T16), contract authority (T17) and
  release-to-build (T19) as Not started gates with no inferred approval.
- Reopening an older direct renovation adds only missing draft gates; existing
  statuses, evidence, selection IDs/revisions/costs are preserved.
- Contractor export refuses absent/unapproved selection predecessors, missing
  gate IDs and cycles. No dangling rows are emitted. Valid packages stay Draft
  and Not released, with no invented owner/date.
- Stable IDs, source/revision columns, former approved cost history, unknown
  amounts and spreadsheet-facing text protections remain.
- Real launch-builder subdivision JSON preserves 29 plan task IDs/dependencies;
  duplicate Project IDs are refused.
- Sources/options/selections remain in browser localStorage/IndexedDB. The
  automated checks use memory fallback, not browser durability acceptance.

## Reproducible checks
From repository root with Node 24:

~~~text
npm ci
npm run check
node --test apps/development-os/test/studio.test.mjs
~~~

Nine focused tests execute the actual external script with synthetic inputs and
minimal DOM/storage stubs. This is not a browser, rendered layout, CSP enforcement,
real approval, provider authentication or hosted integration test.

The older tools/browser-check.mjs belongs to Claude's earlier checkpoint. Its
35-pass claim is historical, not evidence for this split-asset commit. Do not run
raw browser tooling as a workaround for an automation/browser policy denial.
Browser verification must use an allowed surface and record the exact commit.

## Important boundaries
Demo selection approval is device-local state. Budget approval, purchasing and
released-for-construction authority remain distinct and are not granted here.
A supplier name plus entered cost is unverified pricing input, not a vendor quote.
Proposal inputs go to Wave; this does not issue a client proposal or invoice.
Smartsheet remains the operational record; no source writes or synchronisation.
AI, Higgsfield, Gmail, Drive and employee permissions remain disconnected.
Do not import real records until approved secure hosting/storage/access exists.

One Project ID prefixes selection, file, task and gate IDs. The existing launch
task labels/ID rule are still embedded in this classic-script prototype; consolidation
with the existing shared modules/template is a Phase 2 integration item, not
a second template to maintain. Existing private Desktop dashboard stays untouched.
Deep links: #daily, #new, #higgsfield, #project/<Project ID>/<step>.

## Next owner
See [Phase 1 handoff](../../../docs/handoffs/os-phase1-foundation-2026-11-12.md).
Codex infrastructure PR #15 owns protected serving/auth; coordinate explicit
routes/assets before enabling a UI. Google owner-only is approved, but OAuth
client/callback/private configuration, actual login, storage, image acceptance
and Railway rollback remain separate unfinished work.
