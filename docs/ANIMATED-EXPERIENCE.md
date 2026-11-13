# Animated Experience

## Final integration candidate

The separate `/animated-experience` page is part of `feature/final-website-integration`. Review it on [Railway staging](https://humorous-delight-staging-website.up.railway.app/animated-experience). The final PR must record the actual deployed commit and browser evidence. Production remains pinned to `21d8a6f8fceda7ff129390d141bd3eccdcf79ef1`; Tony's authorization is required before promoting the new experience.

The design retains Concept A and the circular G within the **GRAMA / Luxury Real Estate Development** presentation. Home links to the experience. The original Dexter Acres cinematic sequence and fourteen-lot map remain on `/projects/dexter-acres`, with a continuation link from the experience to the plan.

## Journey and rendering

Three Artlist-generated architectural scenes provide forty sampled frames each: arrival, interior and structural opening. Five chapters—Arrival, Entrance, Interior, Structure and Overview—organize the scroll journey. The last chapter transitions to the existing neighborhood concept. Forward and reverse scroll seek the same timeline; normal motion mode starts responding to scroll without activating Play. Chapter buttons, keyboard navigation and the progress range provide alternative controls.

`journey-timeline.js` defines chapter positions and scene transitions. `JourneySequence.jsx` draws adjacent-frame blends and scene crossfades on one canvas. Each scene has four two-column, five-row WebP atlas sheets per viewport variant: 960 × 540 frame tiles on desktop, 640 × 360 on mobile. The renderer requests required sheets lazily, prefetches adjacent sheets and the next scene near the end, and bounds decoded/pending image references to six. It retains the last painted view while buffering and cancels obsolete requests on variant changes or cleanup. It does not run an idle animation loop.

The arrival atlases are in `public/assets/film/arrival/`; interior atlases and their poster are in `public/assets/film/interior/` and `public/assets/film/interior-poster.webp`. The existing structural take remains in `public/assets/animated/artlist-house/`. `public/assets/film/manifest.json` records the packaged sizes and frame layout. Original generation masters and prompts are excluded from the public artifact.

## Stills and native film

Reduced motion starts with four stills: residence, interior, structure and neighborhood. Visitors can choose **Enable scroll animation** for this page. Returning to stills or a new system reduced-motion preference clears that override; it does not change the system or website-wide preference. Pause/Resume freezes or restores scroll updates.

The independent **Play animation** link opens `/assets/film/journey.mp4`, a silent, approximately 16.04-second, 1280 × 720 native film combining the arrival, interior and structural study. The video is requested after activation and supplies native controls plus a direct-file link. The ordinary anchor is present in prerendered HTML so the file remains reachable without the interactive page. The website server supports single byte ranges for playback and seeking. The earlier `animated/house-motion-loop.mp4` remains packaged as the original house-only compatibility film.

Loading or unavailable canvas views retain a poster/static alternative and a path to the native film. Do not remove keyboard access, readable captions, visible focus or reduced-motion choices when revising the experience.

## Source limits and verification

These scenes are an **AI architectural concept**, not recorded project footage, a measured floor plan, an engineering model or a verified room-to-room walkthrough. The arrival and interior are visual studies; they do not establish finished Dexter Acres interiors or approved specifications. The structural take uses the previously selected OpenAI house concepts. The neighborhood image is the existing AI concept; the supplied C5 drawing remains the source for lot organization. Authentic completed-project galleries are documented separately in [ASSETS.md](ASSETS.md).

The production baseline at `21d8a6f` was verified with wheel-only scrolling on Windows Chrome and Edge before this redesign. That evidence does not automatically verify the new three-scene journey. The **Windows scroll animation** CI jobs run `scripts/verify-windows-animation.mjs` with `BROWSER_CHANNEL=chrome` or `msedge`; inspect completed job artifacts for the browser version, scene/frame progression and screenshots. PR Windows checks verify the local Journey build and the final Railway staging in Chrome and Edge. Manual dispatch can target production or another allowed public preview, with schema auto-detection for the legacy release. A workflow definition alone is not a passing browser result.

Before release, verify forward/reverse wheel scrolling without Play, every chapter, the progress range, viewport resizing, mobile layout, buffering/error handling, stills, reduced-motion opt-in, native film seeking and the original Dexter Acres lot-to-Contact path. Record candidate and deployed SHAs with the results. Contact delivery remains disabled and needs separate authorized delivery verification.
