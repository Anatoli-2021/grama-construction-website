# Website developer guide

## Application structure

The public Grama Development website uses React, Vite and GSAP. Seventeen prerendered routes cover Home, Developments, About, Portfolio, individual project cases, Dexter Acres, Partnerships, Animated Experience, Grama Kitchens and Contact.

- `src/site-routes.js`: routes and page metadata.
- `src/data/projects.js`: project cases, galleries and public source links.
- `src/components/FamilySection.jsx`: shared equal leadership frames and captions.
- `src/development-brand.css`: common architectural palette tokens.
- `src/components/AnimatedExperience.jsx` and `construction-timeline.js`: scroll chapters and media delivery.
- `scripts/serve-website.mjs`: built-site hosting, explicit website API routing and streamed native video.
- `public/assets/`: optimized runtime images, artwork, fonts and media.

The hosted application serves the built website and its explicit handlers. Source files, private records and configuration must not be exposed through static routing. Keep credentials in environment configuration and use synthetic data for tests.

## Visual and media contracts

Both leadership photographs use identical 4:5 clipping frames, matching layout and caption typography. Responsive CSS cropping may adjust framing; original photograph bytes and facial features remain unchanged. Public surfaces share the ivory, limestone, charcoal, taupe and bronze palette.

Animated Experience follows Land → Community → Approach → Interior → Structure → Reassembly → Reveal. The versioned premium package uses 336 browser samples, 84 two-by-two sheets per variant, 1440 × 810 desktop tiles and 768 × 432 mobile tiles. Decoded and pending images share a four-reference cap. The separate silent native film contains 672 frames at 1920 × 1080, 24 fps and 28 seconds.

Keep older media URLs available for cached pages. Preserve the retained generated cinematic study and fourteen-lot map on the Dexter Acres case page. Architectural concepts remain distinct from authentic project photography and approved construction documentation. See [animation notes](ANIMATED-EXPERIENCE.md), [visual system](VISUAL-SYSTEM.md) and [asset guidance](ASSETS.md).

Contact navigation carries only the supported topic/path and optional lot context. Personal fields must not fall back to native GET submission. Hosted automatic delivery remains disabled until separately configured and verified; the interface must retain its honest unsent state and available contact alternatives. See [Contact delivery](CONTACT-DELIVERY.md).

### Website intake and indexing

- Set `VITE_SMARTSHEET_ENQUIRY_URL` in Railway before building to use the verified public form URL. The same form serves Contact, Dexter Acres and Grama Kitchens. Only lead category and an optional Dexter lot go in the URL. Keep the underlying sheet private and confirm one synthetic form submission reaches it before release. When the setting is empty, the website uses the existing contact options.
- Grama Kitchens previews optional JPEG and PNG images locally. Publish an attachment workflow only after the project owner approves access and retention.
- Set `PUBLIC_INDEXING_ENABLED=true` on the production service to enable the public sitemap and allow indexing on `gramadevelopment.com`. Railway aliases and preview hosts retain `noindex`. Check `/robots.txt`, `/sitemap.xml`, representative public and 404 responses and the private presentation boundary after a release.

## Setup and checks

Use Node.js 24 and the committed lockfile. Run `npm ci`, then `npm run dev` for the local website on port 5173. `npm run check` builds the site and runs shared tests and repository/artifact policy checks. Use `npm run verify` with the documented local server when checking API and media behavior. Match `SITE_URL` between the build and canonical-metadata tests.

Inspect desktop, tablet and phone layouts, original image loading, portrait equality, palette contrast, direct routes and horizontal overflow. Verify scroll without Play, forward/reverse chapters, native playback/seeking, stills, reduced motion and failure recovery. Preserve the lot-to-Contact flow.

CI includes Windows Chrome/Edge, installed macOS Chrome, WebKit/Firefox engines and a separate installed Apple Safari job. Safari's isolated runner uses native keyboard scrolling. Record actual browser/OS versions and viewports; engine and emulated-device tests must not be described as physical-device tests.

## Collaboration and release

Work on a focused feature branch and open a pull request into `main`. Review the intended diff, meaningful checks and visual evidence before merging; preserve shared history and existing work.

Use staging first, pin the tested commit and verify its public artifact before production. Follow [the release procedure](RELEASES.md) for exact-revision deployment, post-deployment checks and recovery. Store current release results with the review rather than embedding deployment history in this guide.
