# Website development guide

The multipage implementation is commit `6fb4308`, proposed through [PR9](https://github.com/Anatoli-2021/grama-construction-website/pull/9) on `feature/multipage-website`.

Public review: [Grama Construction preview](https://grama-construction-website-production.up.railway.app/).

## Build and verify

Use Node.js24 and the committed lockfile. Run `npm ci` and `npm run check`. The build creates fourteen route-specific HTML pages and a separate404 document. Tests cover route content, metadata, enquiry context and public-host boundaries.

Pages include Home, About, Projects, eight completed cases, Dexter Acres, Partnerships and Contact. Routes are registered in `src/site-routes.js`; approved project content is in `src/data/projects.js`. Shared static hosting supports direct URLs and refreshes, with genuine404 responses for unknown routes.

## Preserve the website

Keep the Dexter Acres cinematic sequence, original media and14-lot drawing geometry intact. Inspect desktop/mobile navigation, project filters, galleries and lot-to-contact links after relevant changes. Completed projects, proposed developments and current listings remain distinct.

Hosted forms prepare browser-only drafts. Email/CRM delivery and reservations are not enabled. The company domain is a separate launch decision. Use verified public project facts and approved media; keep private records and platform administration details outside source control.

## Collaborate

Work on focused feature branches, inspect diffs and relevant checks, then open a PR for owner review. Do not push directly to main or overwrite unfinished work. The PR records the reviewed source version, preview and completed checks. Platform administration and release-account details are maintained privately by the project owners.
