# Grama Construction development workspace

One shared repository for the existing React/Vite/GSAP website and the reusable Development OS launch tool. The website remains at the repository root to preserve its working paths and hosting configuration. Private dashboards, pilot records and finances stay in their existing operational systems.

Repository: [Anatoli-2021/grama-construction-website](https://github.com/Anatoli-2021/grama-construction-website). Owner: **Anatoli-2021**.

## Proposed rebrand — client approval required

`feature/architectural-flagship` now includes the proposed **GRAMA / DEVELOPMENT** identity, three original SVG logo directions and 13 labelled corporate applications at `/brand-review`, plus the website/Dexter concept. It preserves the 14 established website routes and adds the review room as a fifteenth document. Run locally to review. **Do not deploy this identity or replace the current public brand before Tony approves it.** [Identity review guide](docs/BRAND-REVIEW.md).

Website review preview: [Grama Construction on Railway](https://grama-construction-website-production.up.railway.app/). The current company domain remains separate. The existing Railway release is not this unapproved rebrand. The investor/developer showcase restores the official company portraits, completed-project archive and partner logos while preserving Dexter Acres motion and the 14-lot plan.

Hosted enquiries use a server-only Resend integration when the approved sender, recipient, origin and secret key are configured and delivery is explicitly enabled. Unconfigured previews offer a clearly labelled browser-only draft without submitting personal fields. Localhost retains its existing local-save workflow. See [contact delivery setup and verification](docs/CONTACT-DELIVERY.md); do not call inbox delivery verified until a real test is received. Sold-home totals, closing values and company revenue are omitted until supported by approved records.

## Multipage website

Current integration candidate: `feature/architectural-flagship`, combining the multipage website, private presentation, configurable Contact delivery and the architectural homepage prototype. The PR records the exact checked SHA and actual Railway deployment state. Existing branch pushes are not proof of deployment. See [architectural review](docs/LUXURY-DESIGN-REVIEW.md).

The established website has fourteen prerendered pages; this feature adds an explicitly conceptual identity review room. Normal document links and direct URL refreshes work without a catch-all homepage response. Build with `npm run build`; the build emits each page’s HTML, title, description, canonical and sharing metadata. Preview indexing remains disabled.

| Page | Route |
| --- | --- |
| Company homepage | `/` |
| About and family | `/about` |
| Project index and status filters | `/projects` |
| Eight individual completed cases | `/projects/<project-slug>` |
| Dexter Acres cinematic and 14-lot plan | `/projects/dexter-acres` |
| Development partnerships and process | `/partnerships` |
| Contact and contextual enquiry | `/contact` |

Project links come from `src/data/projects.js`; the public page registry is `src/site-routes.js`. Unknown URLs return a real 404. Runtime hosting serves `dist` plus the explicit contact-delivery and individually authorized presentation APIs; repository files, the OS and local enquiry API remain unavailable. Contact links carry only an allowed topic/path and optional Dexter lot; personal fields are entered on Contact. Prerendered form controls remain disabled until JavaScript is ready so they cannot fall back to native GET submission. Missing delivery configuration cannot report a successful submission.

## Two products, separate boundaries

| Product | Source | Start locally | Data / hosting status |
| --- | --- | --- | --- |
| Public website | Root `src/`, `public/`, `server.mjs` | `npm run dev` → port 5173 | Hosted contact delivery is disabled until configured; local development saves synthetic enquiries locally |
| Development OS | `apps/development-os/` | `npm run dev:os` → port 5180 | Loopback-only blank launch tool; no live data or authentication |
| Shared utility | `packages/shared/` | Used by OS / Node tests | Project ID validation; no company records |

This candidate preserves the preceding private-presentation, multipage and Contact work. Review the existing PR stack before merging to stable main. The public preview and completed checks are recorded in the candidate PR.

Read the [team handoff and deployment status](docs/TEAM-HANDOFF.md), [source inventory](docs/SOURCE-INVENTORY.md), [onboarding](docs/ONBOARDING.md), [hosting decision](docs/HOSTING.md), [security boundary](docs/SECURITY.md) and [release procedure](docs/RELEASES.md). These documents replace reliance on chat history for developer setup.

The [ordered implementation queue](docs/IMPLEMENTATION-QUEUE.md) records all current requests. The [investor content brief](docs/INVESTOR-CONTENT-BRIEF.md) supplies portable context for Nail's agent. `/presentation` is a separate login shell with server-enforced individual deck access; actual figures and account records stay outside Git and the static build. See [private presentation setup](docs/INVESTOR-PRESENTATION.md). A local private review runs with `npm run dev:presentation` at port 5190 after building and supplying the approved local data. Hosted access remains closed until actual recipients are approved and provisioned.

## Start on another computer

Accept the owner's GitHub invitation using your own account. Install Git and **Node.js 24 LTS** with npm, then run:

~~~powershell
git clone https://github.com/Anatoli-2021/grama-construction-website.git
cd grama-construction-website
npm ci
npm run dev
~~~

Open [http://localhost:5173](http://localhost:5173). The server binds to 127.0.0.1; keep the terminal running and use **Ctrl+C** to stop it. No environment variables, API keys, FFmpeg or access to the owner's computer/Drive folders are required for normal development. All runtime images, fonts, the small optimized concept film and animation frames are included.

Use Git Credential Manager's browser sign-in or your own GitHub CLI authentication. Never share the owner's login or put access tokens in a repository URL. Port 5173 must be free. For another port, set PORT before starting the server; the UI and API share that port.

## Development workflow

- **main** is the stable shared version.
- Work on a focused **feature/** branch, such as feature/property-gallery.
- Commit clear, focused changes and push your branch.
- Open a pull request into main; request owner review before merging.
- Sync safely before new work. Never overwrite another developer's changes or force-push shared branches.

See [CONTRIBUTING.md](CONTRIBUTING.md) for exact invitation, branch, PR, conflict-resolution and safe-sync instructions. The PR template records the change and checks. Review is a team requirement; verify repository settings for technical enforcement rather than assuming this document configures it.

## Verify and preview

Run the full shared checks with `npm run check`: website build, OS draft and access-boundary tests, then repository/artifact data-policy checks. The build runs first because the static host tests exercise the actual output. GitHub Actions runs these checks on pull requests and on `main`, plus the website API/media checks. The workflow has read-only repository permission and contains no deployment secrets.

The OS has no dependencies beyond Node and runs independently of the website. Use synthetic input during shared development. Its JSON exports remain Draft and do not provision or update operational records.

Build without changing the source website:

~~~powershell
npm run build
~~~

While npm run dev is running, use a second terminal in the project directory:

~~~powershell
npm run verify
node scripts/verify-sequence.mjs
node scripts/verify-consultations.mjs
~~~

Development checks default to localhost port 5173 and also support VERIFY_URL. Verification scripts create ignored evidence/ reports; they do not send emails. The consultation check's optional --require-browser mode is for specifically documented synthetic browser records and is not needed for ordinary setup.

For a production-output preview, stop the dev server first:

~~~powershell
npm run build
npm run preview
~~~

Visit the same localhost URL. Rebuild after source edits before restarting production preview. Stop it before restarting development. scripts/verify-production.mjs defaults to a separate production server on port 5174; set VERIFY_URL=http://localhost:5173 when testing the normal preview instead. This preview does not publish anything.

## Source map

| Path | Purpose |
| --- | --- |
| src/App.jsx | Navigation, hero, section assembly, lot enquiry and project dialogs |
| src/components/BrandSections.jsx | About, properties, capabilities and partnerships |
| src/components/DevelopmentProcess.jsx | Seven-step development experience |
| src/components/Consultation.jsx | Homeowner and development-partner forms |
| src/components/CinematicStory.jsx | Residence → detail → neighborhood scroll sequence |
| src/components/SitePlan.jsx | Fourteen C5-derived lots and drawing-reported areas |
| src/styles.css, src/refinement.css, component CSS | Desktop/mobile styling |
| server.mjs | Local server, API validation and local enquiry storage |
| scripts/contact-delivery.mjs | Hosted enquiry validation, limits, deduplication and server-only email delivery |
| public/assets/ | Optimized runtime photographs, concepts, logos, font and sequence |
| package-lock.json | Reproducible npm dependency installation |

## Local data and excluded files

Hosted forms check delivery availability before enabling submission. A configured server sends a plain-text notification only to its approved recipient; visitor email addresses are used as validated Reply-To values. A successful response means the provider accepted that notification, not guaranteed inbox delivery or a reservation. No enquiry records are stored in the website filesystem and no automatic messages are sent to visitors. If delivery is unavailable, phone contact and an explicitly selected browser-only draft remain available. Localhost/loopback retains its consented local-save API. Deployment never copies local enquiry records.

The consented enquiry forms append to **.data/interest.jsonl on the developer's computer**. There is no email/CRM delivery, reservation, allocation or production lead service. Client and development-partner enquiries have separate types; lots are accepted only for Dexter Acres home enquiries.

.gitignore excludes enquiry records, .env files, credentials/certificates, node_modules/, dist/, local research/screenshots/raw media in evidence/, and the owner's local handoff. These files stay on their original computer. Do not force-add them. The optimized 2.8 MB runtime film is included because the current hero uses it; its large original master is excluded.

## Content and asset context

See [docs/ASSETS.md](docs/ASSETS.md) for portable source/provenance notes. Proposed Dexter Acres renderings and AI concept animation are labeled separately from authentic project photographs. The C5 plan controls lot organization; the aerial is illustrative. Do not invent approvals, specifications, prices, availability, experience figures, family roles or investment returns.

Asset preparation is **optional maintenance**, not an install/build step. The owner's machine-specific original-image preparation utility remains local and excluded from Git. The shared scripts/prepare-sequence.mjs can reuse the included frames; regenerating them requires FFmpeg and should use a separately reviewed change. Do not run preparation scripts just to clone or develop the site.
