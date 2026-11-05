# Grama Construction website

Premium React/Vite/GSAP website for Grama Construction, featuring the planned Dexter Acres / Webster–Dexter neighborhood and residential portfolio. This private repository is the shared source of truth for website code. The live company website is separate; no production deployment is configured here.

Repository: [Anatoli-2021/grama-construction-website](https://github.com/Anatoli-2021/grama-construction-website). Owner: **Anatoli-2021**.

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

The consented enquiry forms append to **.data/interest.jsonl on the developer's computer**. There is no email/CRM delivery, reservation, allocation or production lead service. Client and development-partner enquiries have separate types; lots are accepted only for Dexter Acres home enquiries.

.gitignore excludes enquiry records, .env files, credentials/certificates, node_modules/, dist/, local research/screenshots/raw media in evidence/, and the owner's local handoff. These files stay on their original computer. Do not force-add them. The optimized 2.8 MB runtime film is included because the current hero uses it; its large original master is excluded.

## Content and asset context

See [docs/ASSETS.md](docs/ASSETS.md) for portable source/provenance notes. Proposed Dexter Acres renderings and AI concept animation are labeled separately from authentic project photographs. The C5 plan controls lot organization; the aerial is illustrative. Do not invent approvals, specifications, prices, availability, experience figures, family roles or investment returns.

Asset preparation is **optional maintenance**, not an install/build step. The owner's machine-specific original-image preparation utility remains local and excluded from Git. The shared scripts/prepare-sequence.mjs can reuse the included frames; regenerating them requires FFmpeg and should use a separately reviewed change. Do not run preparation scripts just to clone or develop the site.
