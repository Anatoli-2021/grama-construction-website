# Animated Experience

## Construction candidate

The separate `/animated-experience` page presents one controlled architectural concept from a fourteen-lot neighborhood into one residence and its structure. Its review release must record the exact Git commit, Railway deployment and completed browser evidence in the final PR. A production release requires the authorized target, exact tested source pin and live verification; a staging URL alone is not evidence of production promotion. Owner review remains required before merging main.

The design retains Concept A’s minimal GRAMA wordmark; the extra header/footer symbol has been removed. Home introduces the experience beneath authentic residential photography. The original Dexter Acres cinematic and fourteen-lot map remain on `/projects/dexter-acres`; the construction page links directly to that plan and a contextual enquiry.

## Seven stages and scroll rendering

Land → Community → Approach → Interior → Structure → Reassembly → Reveal. A continuous camera moves from the supplied C5 lot arrangement toward one house, enters its rooms, reveals an aligned structural cutaway, and returns to the completed neighborhood. All seven phases occupy 96 authored frames each. The hero retains the same geometry and world transform; thirteen lighter exterior neighbors use the source-derived lot arrangement. Construction grows from supported positions, and the cutaway keeps structural parts aligned.

`construction-timeline.js` maps scroll progress linearly across 336 premium sampled frames. `ConstructionSequence.jsx` draws adjacent-frame blends on one canvas. Eighty-four 2-by-2 WebP sheets per variant (168 total) supply 1440 × 810 desktop tiles and 768 × 432 mobile tiles. Premium assets live under `/assets/construction/premium-v2/`; its manifest records sampling, dimensions, licenses and file hashes. The mapping is `round(1 + browserFrameIndex × 671 / 335)` across the same 672 native source frames at 24 fps / 28 seconds: twelve sampled poses per timeline second on average, 50% more than the retained legacy package's eight. Denser samples shorten the spans between authored camera poses without generating intermediate geometry or changing the native film. The legacy `/assets/construction/` package remains at 224 samples and 56 sheets per variant.

After 140 ms without a new pose, the canvas settles onto one nearest authored frame so a stationary house does not retain double contours from frame blending. A new movement resumes interpolation immediately; the single settle timer is cleared on cleanup and does not create an idle animation loop.

Required sheets load lazily with directional prefetch. Decoded and pending image references share a maximum of four, with no more than two pending requests. The renderer retains its last paint during buffering, cancels obsolete loads and clears references on resize, disable and unmount. It has no idle animation loop. Scroll uses ordinary document movement without wheel interception or a smooth-scroll dependency.

Chapter buttons, arrow/Home/End keys and an accessible progress range provide alternatives. Pause freezes the current view; Resume returns to scroll position. Short phone layouts keep controls within the viewport and the full house fits inside the mobile image band.

## Motion preferences, stills and film

Reduced motion begins with seven captioned stills. **Enable scroll animation** opts into motion for this page only. View stills or a newly enabled system reduced-motion preference revokes that override. Switching to stills returns keyboard focus to the replacement enable control.

**Play film** opens a separate, silent 28-second H.264 film with native controls, inline playback and a direct-file fallback. The MP4 is requested only after deliberate activation. The premium film uses native 1920 × 1080 source renders, rather than enlarging the old 960 × 540 master. Its ordinary anchor remains present in prerendered HTML, and the server supports byte ranges for seeking. Escape closes the dialog and returns focus to its trigger.

An unavailable canvas keeps a poster and offers stills or the film. An unavailable video reports its failure and retains the direct-file link. The prior `/assets/construction/` package remains byte-identical for already-open pages and cached older bundles. New pages request the separately versioned premium media so a cached atlas cannot be decoded using the new dimensions. Previous Artlist film assets remain packaged for compatibility and provenance; they are separate from this continuous construction experience.

## Authenticity and source limits

This is an **illustrative architectural concept**, using a front-view study and the supplied C5 lot trace. Lot and road organization follow that trace; house footprints, orientations, driveways, landscaping and final specifications are illustrative because no approved building pads were supplied. It is not measured project plans, structural engineering, an approved building design, a construction schedule or actual construction footage. Unseen elevations and interiors are conceptual. It does not establish Dexter Acres specifications or lot availability.

Real completed-project galleries and both original Alina portraits remain separate. The supplied C5 drawing remains the source for Dexter Acres lot organization. Environment assets use source-verified CC0 licenses, recorded in the construction manifest. Production tooling, private prompts and original working files are excluded from the public website artifact.

## Verification

Run `npm run check` and live HTTP/asset verification. `scripts/verify-windows-animation.mjs` verifies native wheel movement without Play, all seven stages, reversal to the original frame and scene, bounded image references and zero unsolicited MP4 requests. The spatial scene comparison permits at most one 8-bit channel level of screenshot-raster difference; exact canvas hashes and measured differences remain recorded. Separate cases cover reduced motion, blocked-sheet fallback, Pause/Resume, chapters/range, stills focus and deliberate film playback/seeking. Phone/tablet contexts save their initial, interior, reveal and stills screenshots for visual review. Additional Home/About checks measure equal portrait frame/image dimensions, aligned desktop captions and unchanged original portrait hashes at four viewport sizes. Eight primary routes are checked for shared palette values, text contrast and horizontal overflow.

CI retains actual headed Windows Chrome and Edge and adds installed Google Chrome headless on macOS plus WebKit/Firefox engine tests. Mobile/tablet contexts are explicitly labelled browser/device emulation, not physical iPhone, Android or tablet testing. Native Safari/Chrome visual checks must be reported separately when performed. A workflow definition or old production test is not evidence that the current candidate passed.

Before promotion, inspect actual desktop/phone layouts, the construction film, all five enquiry contexts and the original Dexter map-to-Contact path. Record unperformed checks honestly. A visitor-controlled email handoff is separate from verified automatic email delivery; see [Contact delivery](CONTACT-DELIVERY.md).
