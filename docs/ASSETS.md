# Website assets

`public/assets/` contains the website’s optimized photographs, brand artwork and architectural concept media. Editable scenes, native render masters, original media libraries and working notes stay outside the public application.

| Asset group | Use |
| --- | --- |
| `photo/*`, `portfolio-*` and existing leadership photographs | Authentic company and project photography. Preserve original faces, image proportions, visible photographer marks and source attribution. Responsive cropping is applied in CSS; the original portrait files remain unchanged. |
| `brand/*` and the favicon | GRAMA wordmark and G symbol. Use the supplied vector artwork. |
| `partners/*` | Third-party brand artwork. Preserve its original colors and proportions; do not infer new endorsements or commercial relationships from artwork alone. |
| `site-plan-original.png` and `masterplan/*` | Site-plan reference and separately labelled illustrative architectural concepts. Keep the interactive lot map distinct from concept imagery. |
| `sequence/*` and `residence-film.mp4` | Retained generated concept study; not recorded construction footage. |
| `construction/*` | Retained earlier animation package for compatibility with cached pages. |
| `construction/premium-v2/*` | Current versioned architectural animation described below. |
| `animated/*` and `film/*` | Retained earlier architectural studies and playback alternatives. Keep their concept labels. |

## Current animation delivery

The premium package follows one continuous architectural concept through land, community, approach, interior, structure, reassembly and reveal.

- Native film: 1920 × 1080, 672 frames, 24 fps, 28 seconds, silent H.264 with progressive-download metadata.
- Scroll delivery: 336 sampled poses using `round(1 + browserFrameIndex * 671 / 335)`.
- Atlas layout: 84 two-column, two-row sheets per variant, 168 sheets total.
- Desktop tiles: 1440 × 810. Mobile tiles: 768 × 432.
- Eight posters include the seven chapters and a finished-residence alias.
- Decoded and pending images share a four-reference cache limit. Native video loads after deliberate activation.
- `construction/premium-v2/manifest.json` lists the packaged files, dimensions, byte hashes and third-party licenses.

The native film is stored as lossless binary parts under `media/construction-premium-v2/`. `npm run prepare:media`, also run before development and builds, verifies every part and reconstructs the exact ignored public MP4 with its original SHA256. Parts stay outside the public runtime; assembly does not encode or alter the film. Existing concept labels and asset licenses still apply.

Keep asset URLs versioned when changing media. Retain the earlier root `construction/` package for existing cached pages. Its 224-pose / 56-sheet-per-variant delivery is a separate compatibility package.

Architectural visualizations are illustrative concepts, not completed-project photography, measured plans or approved construction documentation. Retain this distinction in captions and alternative text.

## Attribution and asset care

Authentic project photography comes from the company’s [published portfolio](https://www.gramaconstruction.com/completed-projects). Individual public source links remain in [the project data](../src/data/projects.js) and the corresponding case pages. Preserve visible photographer credits. Company photography and third-party artwork must not be repurposed for unrelated projects.

The controlled visualization uses Poly Haven’s `meadow`, `grass_ground`, `brown_mud`, `shrub_04` and `tree_small_02` resources, recorded under [CC0-1.0](https://polyhaven.com/license). Exact resource URLs and retained attribution are listed in the runtime manifest’s `licenses` section. Keep those records with any derivative package.

Retain applicable font and other third-party notices. Review format, dimensions, source preservation, loading behavior, still-image alternatives and native byte-range playback when changing assets.
