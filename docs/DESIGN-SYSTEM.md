# Design-system refinement (November 17, 2026)

Branch `feature/design-refinement-2026-11-17`, [PR #24](https://github.com/Anatoli-2021/grama-construction-website/pull/24) into `feature/final-website-integration`, based on `07d614cf075512f7f9d65ddf5a227f63a74263b7` (the commit behind production and staging on November 17). Review only: not merged, not deployed.

This applies the handed-over design specification (direction B, "Drawing Set", prepared November 12 on local branch `claude/design-directions-2026-11`) to the existing website as refinements. It does not rebuild pages. Photography, portfolio data, galleries, filters, the fourteen-lot plan, enquiry context and the private presentation boundary are unchanged.

## What changed

| Area | Change | Where |
| --- | --- | --- |
| Type floor | Labels are at least 11px and supporting text at least 12px (was 6 to 10px in many places). Shared variables: label 11, small 13, body 16 (were 10, 12, 15). | `src/design-system.css` section 1 |
| Contrast | Small text on light surfaces uses `--ds-muted` `#5c6456` (5.5:1 on `#f5f3ec`, 5.0:1 on `#e8e9df`). Active process step keeps a bronze accent at `#7a5d38`. | section 2 |
| Tap targets | Footer links 44px high; breadcrumb, short navigation links and the inline process link have larger hit areas without moving layout. | section 3 |
| Headlines | `h1` and `h2` at weight 300 and `h3` at 400, tracking -0.045em, matching the wordmark. Before, an older layer set most headings to 500 while some sections used 350. Delete the two rules in section 4 to restore the previous weight. | section 4 |
| Title block | Confirmed facts as labelled cells: homepage hero (work, portfolio count, Dexter Acres), homepage Dexter Acres record, Dexter Acres cover (location, scope, drawing-reported lot areas, status). Counts and areas are computed from `projects.js` and `lotData`. | `src/components/TitleBlock.jsx`, section 5 |
| Enquiry paths | Dexter Acres ends with three choices: home or lot, investing or partnering, phone. They use only topics that `enquiry-context.js` already allows. The homepage partnership note links to the process on Partnerships. | `TitleBlock.jsx`, `App.jsx`, `HomePage.jsx`, section 6 |
| Phone menu | A direct phone line under the six destinations. Focus trap, Escape and scroll lock are the existing behaviour. | `App.jsx`, section 7 |
| Homepage photography | Selected work shows 1171 Prospect Lane, 1906 Lee Street and 1847 Dexter Lane. The Sedgwick Street photograph, which carries a visible photographer's watermark, is no longer on the homepage; its case page and the portfolio are unchanged. | `HomePage.jsx` |
| Wording | Hero line and footer: "Premium custom homes and residential development." Home page title: "Grama Development — Premium Custom Homes & Residential Development". | `HomePage.jsx`, `App.jsx`, `site-routes.js` |

## Not applied from the specification, and why

- Lot-plan drawing as the homepage hero and the project register table: the homepage keeps its authentic photograph and the portfolio keeps its grid and filters.
- Development-path stage line on Dexter Acres: stages are not confirmed.
- Sticky section navigation on Dexter Acres: it would sit over the pinned cinematic sequence.
- Bronze accent palette and sheet numbering: the current green-grey palette and minimal labels stay.
- Consolidating the older style layers (`styles`, `refinement`, `editorial`, `multipage`, `precision`, `development-brand`): still recommended, but a separate change. `design-system.css` is loaded last and overrides them; a few rules it replaces in `HomePage.css` (`.home-hero-bottom > a`, `.home-development-links`) are now unused.

## Boundaries

- Animated Experience (owner: Nail): no file of the experience is changed. Page-content rules exclude `.animated-route`; only the phone-menu line is shared. Before and after captures of `/animated-experience` have the same document height on desktop and phone.
- The Dexter Acres cinematic sequence (`.cinema`) is not restyled; its 10px captions remain.
- `apps/development-os` and OS documents are untouched.
- `src/App.jsx` is shared: this branch adds one menu link, one component in the Dexter Acres masthead and replaces one button with the enquiry cards.

## Checks

- `npm run check`: build, 143 tests and the repository policy pass.
- `node scripts/verify-design-system.mjs http://127.0.0.1:5174` against `node scripts/serve-website.mjs`: 36 of 36 checks pass (routes, blocked paths, homepage desktop and phone, phone menu, portfolio filters, gallery, Dexter Acres record, lot plan to Contact, enquiry context, reduced motion, no console errors). Headless Chrome with device emulation, not physical phones.
- Legibility audit over eight pages at 1440 and 390 wide, measured on a build of the base commit and on this branch: text below 11px, outside the cinematic sequence and the plan drawing, 151 elements to 0; text below the 4.5:1 contrast minimum 108 elements to 0; tap targets under 40px 124 to 31 (remaining: short footer and breadcrumb words that are 44px high, plan lots, the hidden anti-spam field). The 22 small captions inside the cinematic sequence and plan drawing are unchanged.
- One low-effort Codex review of the source diff (November 17) found one defect, the record not collapsing to one column under 520px; it is fixed and covered by a check.
- Not run: `scripts/verify-windows-animation.mjs` accepts only public HTTPS targets and runs in CI; this branch is not deployed.

## Before and after

Side-by-side captures (base commit on the left, this branch on the right) are in [review/design-refinement-2026-11-17](review/design-refinement-2026-11-17): homepage first screen on desktop and phone, the homepage Selected work, family and Dexter Acres sections, and the Dexter Acres cover and enquiry cards. Images used on the changed sections are listed in [ASSETS.md](ASSETS.md).

## Open questions for Tony

1. Headline weight: keep the lighter headings, or return to the heavier ones?
2. Wording: "Premium custom homes and residential development" in place of "Luxury Real Estate Development"?
3. Homepage: keep 1847 Dexter Lane in place of the watermarked Sedgwick Street photograph?
4. Dexter Acres: may a development-path stage be shown, and which one?
