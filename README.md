# Grama Construction development workspace

One private repository for the existing React/Vite/GSAP website and the reusable Development OS launch tool. The website remains at the repository root to preserve its working paths and hosting configuration. Private dashboards, pilot records and finances stay in their existing operational systems.

Repository: [Anatoli-2021/grama-construction-website](https://github.com/Anatoli-2021/grama-construction-website). Owner: **Anatoli-2021**.

Public review preview: [Grama / Dexter Acres](https://grama-dexter-acres-preview.anatoli-gram-1564.chatgpt.site). The current company domain remains separate.

## Two products, separate boundaries

| Product | Source | Start locally | Data / hosting status |
| --- | --- | --- | --- |
| Public website | Root `src/`, `public/`, `server.mjs` | `npm run dev` → port 5173 | Public static preview; hosted enquiry delivery not connected |
| Development OS | `apps/development-os/` | `npm run dev:os` → port 5180 | Loopback-only blank launch tool; no live data or authentication |
| Shared utility | `packages/shared/` | Used by OS / Node tests | Project ID validation; no company records |

For the prepared OS work, check out `feature/unified-development` until its PR is approved and merged. For the existing web preview work, see PR #1. `main` remains the stable starting version.

Read [current source inventory](docs/SOURCE-INVENTORY.md), [onboarding](docs/ONBOARDING.md), [hosting decision](docs/HOSTING.md), [security boundary](docs/SECURITY.md) and [release procedure](docs/RELEASES.md). These documents replace reliance on chat history for developer setup.

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
| public/assets/ | Optimized runtime photographs, concepts, logos, font and sequence |
| package-lock.json | Reproducible npm dependency installation |

## Local data and excluded files

On hosted preview addresses, the consultation section provides Grama's direct telephone link and clearly states that online enquiry delivery is not connected. Personal-information forms appear only on localhost/loopback, where the local API can save them. Publishing the static preview does not copy local enquiry records or connect email/CRM delivery.

The consented enquiry forms append to **.data/interest.jsonl on the developer's computer**. There is no email/CRM delivery, reservation, allocation or production lead service. Client and development-partner enquiries have separate types; lots are accepted only for Dexter Acres home enquiries.

.gitignore excludes enquiry records, .env files, credentials/certificates, node_modules/, dist/, local research/screenshots/raw media in evidence/, and the owner's local handoff. These files stay on their original computer. Do not force-add them. The optimized 2.8 MB runtime film is included because the current hero uses it; its large original master is excluded.

## Content and asset context

See [docs/ASSETS.md](docs/ASSETS.md) for portable source/provenance notes. Proposed Dexter Acres renderings and AI concept animation are labeled separately from authentic project photographs. The C5 plan controls lot organization; the aerial is illustrative. Do not invent approvals, specifications, prices, availability, experience figures, family roles or investment returns.

Asset preparation is **optional maintenance**, not an install/build step. The owner's machine-specific original-image preparation utility remains local and excluded from Git. The shared scripts/prepare-sequence.mjs can reuse the included frames; regenerating them requires FFmpeg and should use a separately reviewed change. Do not run preparation scripts just to clone or develop the site.
