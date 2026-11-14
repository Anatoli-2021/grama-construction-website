# Asset and project context

This repository contains optimized website assets, not the owner's complete photo/video library or internal project records. Original source files and private research remain off GitHub. The current `feature/final-website-integration` candidate is for [staging review](https://humorous-delight-staging-website.up.railway.app/); production promotion requires Tony's authorization.

| Runtime assets | Source and meaning |
| --- | --- |
| residence.webp, residence-angle.webp, residence-garden.webp | Owner-supplied Lot 10/12 architectural concepts; not completed Dexter Acres homes |
| masterplan/dexter-acres-828082967e9d.webp, masterplan/provenance.json | Separately disclosed illustrative masterplan informed by supplied C5 lot organization; controlled 3D plus Artlist refinement/restoration. Home designs, openings, placements and landscaping are conceptual; not project photography, exact surveyed geometry, approved building pads or a film frame |
| site-plan-original.png | Supplied C5 plan; basis for interactive numbering and drawing-reported areas; approval/current revision unverified |
| portfolio-dexter.webp | Actual 1847 Dexter Lane photograph from the official Grama completed portfolio |
| portfolio-lee.webp | Actual 1906 Lee Street photograph from the official Grama completed portfolio |
| portfolio-prospect.webp | Actual 1171 Prospect Lane photograph from the official Grama completed portfolio |
| portfolio-prospect-interior.webp, portfolio-lee-bath.webp | Authentic photographs from the corresponding original project photo folders |
| portfolio-1914-entry.webp | Authentic 1914 Lee entry photograph; labeled project photography, without a listing-status claim |
| logo-dark.png, logo-light.png, general-sans.ttf | Existing Grama brand assets |
| residence-film.mp4, sequence/* | Retained five-second Higgsfield AI concept animation; optimized film, 32 WebP frames and a higher-resolution detail still; not construction footage |
| construction/* | Controlled v10 neighborhood-to-residence sequence: seven phases, 224 sampled atlas frames, eight posters including a residence alias, and a 672-native-frame / 28-second film contract. Final packaging and playback checks pending; details below |

Official project sources:

- [1847 Dexter Lane](https://www.gramaconstruction.com/projects/1847-dexter-des-plaines)
- [1906 Lee Street](https://www.gramaconstruction.com/projects/1906-lee-st-des-plaines-il)
- [1171 Prospect Lane](https://www.gramaconstruction.com/projects/prospect-ln-des-plaines-il-60018)

The company portfolio is the source for completed-project attribution, not current sale availability. No currently available home was verified during the November 5, 2026 content pass. Dexter Acres is the owner's planned 14-home Des Plaines development. Prices, schedules, approvals, final designs, infrastructure specifications and availability require current owner/project confirmation.

The [Noah About](https://www.noahchicago.com/about) and [Custom Build](https://www.noahchicago.com/custombuild) pages informed information hierarchy only. The [Royal Pop reference](https://royal-pop-website.vercel.app/) informed scroll-sequenced storytelling. No reference-site marketing copy, images or code were imported.

Preserve distinctions between concepts and actual photography. The existing materials are for Grama's website development; inclusion in this repository does not grant a separate license to reuse them for other clients or publish them elsewhere. Obtain owner approval for new public-facing people, roles and claims.

## Official-site restoration — November 10, 2026

The user authorized restoring the original company's public photography, portfolio and partner-logo section to the review website. Images below were taken from the official sources, visually inspected, and optimized without generating new people or altering the depicted work. This permission is for Grama's website; it does not establish reuse rights for unrelated projects.

### People

| Runtime file | Official source | Caption limits |
| --- | --- | --- |
| tony-grama.webp | [Original homepage About image](https://cdn.prod.website-files.com/66117180961169ea1597a070/662ffb341622859d64c24fef_about%20us.jpg), published on the [Grama homepage](https://www.gramaconstruction.com/) | Anatoli (Tony) Grama, founder; identity and founder context supplied by the user. Original photograph shows him beside a branded Grama vehicle. Optimized to 1280 × 853, WebP. |
| grama-realtor.webp | [Original realtor portrait](https://cdn.prod.website-files.com/66117180961169ea1597a070/66675008dd69d433fbd09b38_realtor.jpg), published in project enquiry sections including [Foster Avenue](https://www.gramaconstruction.com/projects/w-foster-ave-unit-1e-chicago-il-60640) and [Dexter Lane](https://www.gramaconstruction.com/projects/1847-dexter-des-plaines) | The source caption confirms “Exclusive Realtor of Grama Construction.” The user directly confirmed her first name is Alina and that she is Anatoli (Tony) Grama's wife. The website caption is “ALINA / REAL ESTATE”; no surname is assumed. Optimized to 600 × 852, WebP. |

The source also has a [second framing of the same realtor](https://cdn.prod.website-files.com/66117180961169ea1597a070/6667514e9c4da112a88bd589_anothaone-min.jpg). It was not included in the November 10 restoration; both native JPEGs are now included across Home and About in the final integration, as documented below. Alina's surname remains unconfirmed and is not needed for the approved caption. Further biography or family claims require direct confirmation.

### Complete official portfolio

The [official completed-project index](https://www.gramaconstruction.com/completed-projects) lists eight entries. All eight now have individual case pages under `/projects/`, with a shared factual record in `src/data/projects.js`. The first three retain their existing photographs; the following five also have selected original exterior and interior photographs, with direct source attribution on each case page:

- [Chicago / Avondale, IL 60618](https://www.gramaconstruction.com/projects/chicago-il-60618)
- [Burr Ridge, IL 60527](https://www.gramaconstruction.com/projects/burr-ridge-il-60527)
- [South Barrington, IL 60010](https://www.gramaconstruction.com/projects/south-barrington-il-60010)
- [W Foster Avenue, Unit 1E, Chicago, IL 60640](https://www.gramaconstruction.com/projects/w-foster-ave-unit-1e-chicago-il-60640)
- [N Sedgwick Street, Chicago, IL 60614](https://www.gramaconstruction.com/projects/n-sedgwick-st-chicago-il-60614)

“Completed project” follows the official index category. It does not mean sold, currently available, or independently verified project scope. The [current-listings page](https://www.gramaconstruction.com/current-listings) showed no published entries during this pass, so the review website offers an enquiry path rather than invented active inventory. No prices, sales totals, revenue or investment returns were added.

Do not reuse conflicting source specifications without resolution: Prospect Lane's narrative and structured bedroom/bathroom counts disagree; South Barrington and Sedgwick have conflicting floor areas. The Foster detail page was subsequently verified directly in the live browser DOM and retrieved as official HTML during the case-page work, resolving the research fetcher's cache gap. Case copy uses source-supported project details and visually checked photographs, without conflicting specifications or sale prices.

### Original partner-logo section

The approved [original GRAMA website](https://www.gramaconstruction.com/) material is the source for the eleven displayed relationships and the heading “We are honored to be trusted partners for.” All eleven remain in their original order; no additional partnerships were added. The artwork sources below identify the logos and do not independently verify commercial terms, certification, exclusivity or sponsorship.

The runtime now uses eight native SVGs and three native transparent PNGs under `public/assets/partners/`, preserving their source colors and proportions without white card backgrounds. Artwork bytes are unchanged from the downloaded sources; no company logo was generated, traced, recolored or processed to remove a raster background. Pella and ABC Supply use native transparent assets from the approved original client website. The original padded PNG versions remain archived in `public/assets/` but are no longer used by this section.

Houzz uses its official full-color vector with a separate “Featured on” caption, preserving the original badge's meaning. Andersen uses its official horizontal lockup. Goodman uses its current official header logo with “Air Conditioning & Heating.” The Home Depot's official transparent white vector is displayed on its own square in official orange `#F96302`; the surrounding cell stays transparent.

| Runtime file | Brand shown / public artwork source |
| --- | --- |
| partners/floor-decor.svg | [Floor & Decor — official header SVG](https://www.flooranddecor.com/on/demandware.static/Sites-floor-decor-Site/-/default/dwa3cbddd6/img/default.svg) |
| partners/houzz.svg | [Featured on Houzz — official Houzz SVG](https://www.houzz.com/res/29907517/pic/houzz_logo.svg?v=29907517) |
| partners/lennox.svg | [Lennox — official SVG](https://www.lennox.com/application/themes/lennox/assets/global/lennox_logo.svg) |
| partners/pella.png | [Pella — approved original client asset](https://cdn.prod.website-files.com/66117180961169ea1597a070/66734de3c932e3b783c1c664_pella-windows-logo-1EC6165366-seeklogo.com.png) |
| partners/sika.svg | [Sika — official Building Trust SVG](https://sika.scene7.com/is/content/sika/Sika_ClaimU_pos_rgb) |
| partners/andersen.svg | [Andersen Windows & Doors — official SVG](https://www.andersenwindows.com/-/media/Project/AndersenCorporation/AndersenWindows/AndersenWindows/images/brand-launch-2020/andersen_logo_tm_rectangle_rgb.svg?h=260&iar=0&w=1440) |
| partners/bosch.svg | [Bosch — unchanged inline header SVG from the official homepage](https://www.bosch.com/) |
| partners/lowes.svg | [Lowe's — official SVG](https://www.lowescdn.com/images/ui/LowesLogo_DT.svg) |
| partners/goodman.png | [Goodman — official transparent header PNG](https://www.goodmanmfg.com/images/librariesprovider6/default-album/gdmnlogo.png) |
| partners/abc-supply.png | [ABC Supply — approved original client asset](https://cdn.prod.website-files.com/66117180961169ea1597a070/66734f8d0d06de5fbb45d3fe_idrjvO-611-removebg-preview.png) |
| partners/home-depot.svg | [The Home Depot — official transparent header SVG](https://corporate.homedepot.com/themes/custom/bootstrap_thd/images/logo-site-header-homedepot.svg) |

## Individual project-page photographs

Ten photographs were selected from the five official project pages above, visually inspected before captions were written, and optimized to WebP at no more than 1600 pixels wide. Existing photographer marks remain visible. The selected originals and their attribution are preserved here; source files remain outside the repository.

| Runtime file | Direct original photograph |
| --- | --- |
| portfolio-sedgwick-street.webp | [sedgwick-street / exterior](https://cdn.prod.website-files.com/66117181961169ea1597a104/6631605ef030e92d7e209f3b_4d76f1992806c9b7d698284a7e60130e-uncropped_scaled_within_1536_1152.webp) |
| portfolio-sedgwick-street-interior.webp | [sedgwick-street / interior](https://cdn.prod.website-files.com/66117181961169ea1597a104/6631605e351cca7bd826094d_a4f3d59c6c0e9b87997cf1528b013c94-uncropped_scaled_within_1536_1152.webp) |
| portfolio-burr-ridge.webp | [burr-ridge / exterior](https://cdn.prod.website-files.com/66117181961169ea1597a104/66329f1252cc5951ff90b32f_f46317c3df3ee442fbb32cfef6ec650f-o_a.webp) |
| portfolio-burr-ridge-interior.webp | [burr-ridge / interior](https://cdn.prod.website-files.com/66117181961169ea1597a104/66329f01e9e34250fe30be52_f5425b22beacbc3815d8a68469873fa1-o_a.webp) |
| portfolio-chicago-avondale.webp | [chicago-avondale / exterior](https://cdn.prod.website-files.com/66117181961169ea1597a104/6632af2af307b188cf29cb9c_2ae8f86dfd41037adcc47a9f5e2fc06f-o_a.webp) |
| portfolio-chicago-avondale-interior.webp | [chicago-avondale / interior](https://cdn.prod.website-files.com/66117181961169ea1597a104/6632af2a1d94d76bf4d367d8_5be4033c3c451c85d952f1aaf85eef34-o_a.webp) |
| portfolio-foster-avenue.webp | [foster-avenue / exterior](https://cdn.prod.website-files.com/66117181961169ea1597a104/6632458700b1c7f4af4239ba_1.jpg) |
| portfolio-foster-avenue-interior.webp | [foster-avenue / interior](https://cdn.prod.website-files.com/66117181961169ea1597a104/6632426f8f9bd578a9a41217_2.jpg) |
| portfolio-south-barrington.webp | [south-barrington / exterior](https://cdn.prod.website-files.com/66117181961169ea1597a104/6632445e8f9ce038abbcafec_84f119cd8012118fb4b8785c15e79fc6-o_a.webp) |
| portfolio-south-barrington-interior.webp | [south-barrington / interior](https://cdn.prod.website-files.com/66117181961169ea1597a104/66324457ceefd9aca6433144_0f3d6becbc6d1066c4645dff9ac58592-o_a.webp) |

The project index separates the eight completed portfolio entries from the proposed Dexter Acres development. The current-listings filter has an honest empty state. Neither the completed category nor its photograph count is presented as sold inventory, sales performance or investment results.

## Current illustrative masterplan — November 14, 2026

`masterplan/dexter-acres-828082967e9d.webp` is the selected restored static masterplan concept, encoded as a 2048 × 1152 WebP, 633,504 bytes. Its SHA256 is `828082967e9d565b8097f4b50c7dc8aba794745ea4344d21afacca74b351405b`. Portable source/meaning limits are recorded in `masterplan/provenance.json` without account identifiers, private paths or client operational data.

The workflow used a controlled 3D community informed by the supplied C5 lot organization, followed by Artlist image refinement and one targeted restoration. Visual review retained fourteen visible houses in the broad 4 / 4 / 1 / 3 / 2 groupings, one internal connection to Dexter Lane, a dead-end turning bulb and an unbuilt east reserve. This is an illustrative organization check, not a survey or exact coordinate/parcel-boundary verification.

The selected still retains interpreted house openings, facade/roof details, curb edges and landscaping. It must not be described as a material-only pass, unchanged model geometry, approved house designs or pads, construction documentation, a built neighborhood or actual project photography. Use a visible concept caption and keep the interactive C5-based map authoritative for lot organization and enquiry selection. No lot availability, pricing, approval or investment claim is supplied by this image.

The still is separate from the controlled film and scroll frames. Do not splice it into that sequence or imply an exact camera/architecture match. Suggested caption: **Illustrative masterplan concept. Home designs and landscaping are conceptual.** Additional image notes can state that house placements and site details are illustrative and are not approved building pads or construction documents.

## Current controlled cinematic sequence — packaging contract

The revised Animated Experience uses the controlled v10 model and one continuous modeled world. The same source house geometry is repeated at fourteen conceptual placements informed by the C5-derived interactive trace. A single selected residence remains in that world through approach, interior, structural study and reassembly. This is a controlled architectural visualization, not recorded construction progress, verified engineering or a measured/approved house design.

| Phase | Native source frames | Purpose |
| --- | --- | --- |
| Land | 1–96 | Elevated site and lot-organization introduction |
| Community | 97–192 | Grounded foundations, frames and homes across the fourteen placements |
| Approach | 193–288 | Continuous approach to the selected residence |
| Interior | 289–384 | Enter its controlled interior |
| Structure | 385–480 | Architectural cutaway of the same source model |
| Reassembly | 481–576 | Return the same parts to the finished residence |
| Reveal | 577–672 | Pull back to the controlled community and a separate composited brand moment |

The current packaging contract is 672 native rendered frames at 24 fps, producing a 28-second silent 1280 × 720 H.264 playback film at `construction/construction-film.mp4`. No AI masterplan still or unrelated Artlist clip is inserted into its frames. The browser samples 224 source frames with `round(1 + browserFrameIndex × 671 / 223)`, packaged into 56 two-column, two-row sheets per viewport variant. Desktop tiles are 960 × 540; mobile tiles are 640 × 360.

Under `construction/`, eight 1280 × 720 concept posters are packaged: `land.webp`, `community.webp`, `approach.webp`, `interior.webp`, `structure.webp`, `reassemble.webp`, `reveal.webp` and `residence.webp`. The last is an alias for the finished-residence presentation, not an eighth chapter. These `construction/` assets are controlled-render derivatives and are distinct from the separately generated `masterplan/dexter-acres-828082967e9d.webp` masterplan.

**Packaging verified November 14, 2026:** all 672 native frames are complete. The package contains 112 atlases, eight posters, the film and a sanitized manifest with exact hashes and CC0 environment/tree attribution. The 28-second film is 12,915,223 bytes, silent H.264 baseline at 1280 × 720 / 24 fps; full decoding passed. Local build, all 143 tests and 335 read-only HTTP/artifact checks passed, including preservation of all 123 baseline media assets. Scroll, native playback, stills and keyboard focus were exercised in the in-app browser. Independent CI browser results and the actual Railway commit/deployment must be recorded in the final PR; this packaging note does not claim a production release. See [Animated Experience](ANIMATED-EXPERIENCE.md) for the interface and its limits.

## Retained original house study and identity assets

- `brand/grama-development.svg`, `brand/grama-g.svg` and `favicon.svg`: retained native SVG Concept A wordmark and circular G. The earlier integration candidate introduced **GRAMA / Luxury Real Estate Development** on Home with the Grama Development lockup. The founder's surname remains Grama.
- `animated/house-complete.webp`: selected OpenAI-generated architectural concept, based on the supplied house visual.
- `animated/house-structure.webp`, `animated/roof.png`, `animated/facade.png`: OpenAI Imagegen derivatives for an independently moving layered illustration. These are concept images, not measured construction or engineering details.
- The earlier neighborhood transition used the AI `community.webp` concept. That original top-level file remains byte-identical to the integration baseline for historical media preservation. Active site and social-image references use the separately disclosed, content-versioned `masterplan/dexter-acres-828082967e9d.webp` above so returning visitors receive the new still without reusing the old asset URL. Neither static masterplan is part of the controlled film or current scroll-frame atlases.

The structural scene retains `animated/artlist-house/desktop/sheet-0.webp` through `sheet-3.webp` and the equivalent mobile files: forty samples from the selected Artlist Kling 3.0 house animation, packed into two-column, five-row WebP sheets. Its start and end frames use the same house concept. `animated/house-motion-loop.mp4` remains the 1280 × 720 house-only compatibility version, played forward and in reverse. This is a generated architectural study, not construction footage or a measured model. The original full-resolution film remains outside the public website artifact. Original source portfolio links and partner marks are retained.

## Historical Artlist journey — retained media, November 13, 2026

A previous review candidate combined arrival and interior concept scenes with the retained structural study. These Artlist media remain available as an earlier architectural film, separate from the current controlled sequence. They are AI architectural visualizations, not verified completed work, a measured floor plan or a continuous real-world camera route. Generated interior imagery remains separate from the authentic completed-project galleries below.

| Runtime assets | Source and purpose |
| --- | --- |
| `film/arrival.mp4`, `film/arrival/desktop/sheet-0.webp` through `sheet-3.webp`, equivalent mobile sheets | Artlist-generated arrival study based on the selected house concept; forty sampled frames. |
| `film/interior.mp4`, `film/interior/desktop/sheet-0.webp` through `sheet-3.webp`, equivalent mobile sheets | Artlist-generated interior study; forty sampled frames. Interior design and geometry remain illustrative. |
| `film/interior-poster.webp` | Still from the interior concept for loading/static presentation. |
| `animated/artlist-house/` | Retained forty-frame structural opening study described above. |
| `film/journey.mp4` | Approximately 16.04-second, silent 1280 × 720 film combining the earlier arrival, interior and structural concept scenes. Retained compatibility media; not linked as the current controlled construction film. |
| `film/manifest.json` | Portable frame counts, atlas layout, packaged file paths and native-film metadata; no generation credentials or private prompts. |

The historical scenes use four two-column, five-row WebP sheets per viewport variant, with 960 × 540 desktop tiles and 640 × 360 mobile tiles. Their former canvas journey used lazy sheet loading and a bounded cache. The earlier overview used the then-current AI neighborhood concept. These retained assets and their approximately 16.04-second combined film are not spliced into the new controlled 28-second film or its scroll frames; the current static masterplan has its own provenance and the interactive lot numbering remains C5-based.

## Final integration photography — November 13, 2026

The final transformation brief explicitly requests both existing Alina photographs. Both original JPEGs were retrieved from the company's published assets, visually inspected, and retained at native pixels with no face edits, reconstruction, color alteration or upscaling. They are different framings from the same approved portrait setting. Use portrait proportions and keep the face clear when applying responsive crops.

| Runtime file | Exact source / native dimensions | Caption and use |
| --- | --- | --- |
| `photo/alina-portrait.jpg` | [Original realtor portrait](https://cdn.prod.website-files.com/66117180961169ea1597a070/66675008dd69d433fbd09b38_realtor.jpg), 794 × 1128, 82,774 bytes | Alina / Real Estate. The user confirmed her first name and wife relationship; the source role is Exclusive Realtor of Grama Construction. No surname or license claim is inferred. |
| `photo/alina-realtor.jpg` | [Second original framing](https://cdn.prod.website-files.com/66117180961169ea1597a070/6667514e9c4da112a88bd589_anothaone-min.jpg), 786 × 1128, 96,233 bytes | The same confirmed Alina and role, with more headroom. Do not describe it as another person or a different shoot. |
| `photo/residences.webp` | [Original Grama homepage photograph](https://cdn.prod.website-files.com/66117180961169ea1597a070/667345df51ac861d97d4a8a9_turnkey%20(2).jpg), restored PR #20 derivative, 1536 × 983 | Caption: Residential project photography / Chicago & Chicagoland. The original company photograph shows three neighboring masonry houses; exact addresses and sale status remain unverified. |

The Alina JPEGs are byte-identical to the downloaded originals. The homepage WebP is byte-identical to `public/assets/original-home-hero.webp` in commit `76db6f3b287cce4bdf1105e144ea6898ba89ebd2` (PR #20 branch); its SHA256 is `9883685e70b42e139e1fe65e05e65113139e43d7fd9e5cfdf6a8d12ac32a855c`. No new generated building or person replaces the authentic photographs.

For a coherent real-project presentation, pair `portfolio-prospect.webp` with `portfolio-prospect-interior.webp` (both 1500 × 1000) or the two Sedgwick images (both 1536 × 1025). The images establish the same project, not a verified room-to-room route. The Lee kitchen/bathroom pair is suitable for material/detail storytelling. Preserve visible photographer marks. Existing 1024-pixel images suit smaller case galleries; do not upscale them or mix different properties into a purported continuous walkthrough.

### Recovered same-property galleries

The original company case-page HTML exposes full image galleries. Twelve additional photographs were selected and visually inspected from those same-property sources, then optimized to WebP with native aspect ratios and at most 2000 pixels of width. There is no upscaling, generative/content editing or color alteration. Original selected portfolio files remain unchanged. These images document rooms and details, not a verified continuous camera route or a measured floor plan. Preserve visible photographer marks.

| Runtime file | Factual caption | Exact published source |
| --- | --- | --- |
| `photo/prospect-entry.webp` | Entry hall and staircase / 1171 Prospect Lane | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6665f225923eb0871ba82338_photo_82616469-1500x1000.jpg) |
| `photo/prospect-living.webp` | Living room and fireplace / 1171 Prospect Lane | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6665f25822839fe3d2edd124_photo_82616481-1500x1000.jpg) |
| `photo/prospect-suite.webp` | Bedroom and large windows / 1171 Prospect Lane | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6665f25894aca41b5f5d36f3_photo_82616488-1500x1000.jpg) |
| `photo/prospect-bath.webp` | Bathroom and freestanding tub / 1171 Prospect Lane | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6665f258e736030d93f3b510_photo_82616490-1500x1000.jpg) |
| `photo/lee-arrival.webp` | Entry hall and living spaces / 1906 Lee Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/68029747c4860c7c11983d72_6.jpg) |
| `photo/lee-kitchen-living.webp` | Kitchen island and open living spaces / 1906 Lee Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6802945269984d37b9b8217e_GRAMA%20Lee%20street-60.jpg) |
| `photo/lee-living.webp` | Living room and fireplace / 1906 Lee Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/680297a237da3515da445f23_3-min.jpg) |
| `photo/lee-dining.webp` | Dining room / 1906 Lee Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/680297450fbb09399a5859d8_13.jpg) |
| `photo/lee-bedroom.webp` | Bedroom / 1906 Lee Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/68029744e000913a9f2e93bc_17.jpg) |
| `photo/lee-bath.webp` | Freestanding bath and window / 1906 Lee Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6802974315f01e442abdc1b5_20.jpg) |
| `photo/sedgwick-kitchen.webp` | Kitchen and dining area / Sedgwick Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6631605e021f00cd1c0e65bb_1b21ea74fbddd9cf92199186bc7d17ee-uncropped_scaled_within_1536_1152.webp) |
| `photo/sedgwick-exterior.webp` | Street-facing elevation / Sedgwick Street | [Original photograph](https://cdn.prod.website-files.com/66117181961169ea1597a104/6631605e67339db10c243b02_fcfcd2a3bffee75ea506e5181b8cd10b-uncropped_scaled_within_1536_1152.webp) |

The Lee originals are 3500 pixels wide; their 2000-pixel derivatives provide higher-resolution interior presentation without shipping multi-megabyte JPEGs. Prospect derivatives remain at 1500 pixels. The portrait Sedgwick exterior is 770 × 1080 and suits a narrow frame rather than a large landscape hero.
