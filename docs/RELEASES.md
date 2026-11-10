# Website review and release guide

The multipage implementation is `6fb4308`, proposed in [PR9](https://github.com/Anatoli-2021/grama-construction-website/pull/9), branch `feature/multipage-website`.

Public review: [Grama Construction preview](https://grama-construction-website-production.up.railway.app/). The PR records the deployed source version and verification result. Company-domain publication is a separate decision.

## Verify a candidate

Use the committed lockfile and Node.js24. Run `npm ci` and `npm run check`. The current website builds fourteen page documents plus404; the83 tests cover route HTML, metadata, request boundaries and enquiry context. Inspect desktop/mobile navigation, all case links, galleries, the Dexter Acres cinematic sequence and14-lot plan. Check the resulting static output before publishing.

Hosted enquiries remain browser-only drafts until a delivery destination is connected and tested. Unknown URLs must return404. Source, private-data, OS and API paths must stay unavailable through the public website host. Preview pages remain noindex.

## Collaborate and publish

Use a focused feature branch and a reviewable PR. Preserve unfinished work, inspect diffs and stage only intended files. Obtain owner review before merging to main; do not push directly to main or force-push shared history.

Deploy checked website changes only to an authorized review target. Verify the actual resulting source version, public page content, media, direct links and mobile behavior. Record the outcome in the PR. Administrative account details and platform identifiers are maintained privately, outside this repository.

## Company launch and rollback

Company-domain changes require a separate release decision. Preserve mail records and verify the approved website target after any cutover. Keep the previous working source version available for rollback; use reviewed revert changes rather than rewriting shared history. An OS service, authentication, live-data import or enquiry integration does not follow automatically from a website release.
