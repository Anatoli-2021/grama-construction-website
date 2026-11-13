# Animated Experience

The separate `/animated-experience` page extends the existing website. Home, company and project pages retain the published composition, original Dexter Acres cinematic sequence and fourteen-lot plan.

The review identity reads **Grama Development**, with the retained Concept A wordmark treatment and circular G. The founder's name remains Anatoli (Tony) Grama. Original project-source links, business contact addresses and partner marks retain their source identities.

The live house visualization uses a five-second Artlist take sampled into forty frames, a native scroll timeline, chapter navigation and a static alternative. Forward scroll opens the house; reverse scroll reassembles it. Separate image layers remain as the loading, failure and static fallback. The structural view is an illustrative architectural concept, not an engineering model or a construction specification. The limited generated camera movement does not represent a complete three-dimensional model or orbit. The neighborhood image is the existing AI concept; the supplied lot plan remains the source for lot organization.

The scroll timeline begins opening the house from the first scroll input, easing into the open view over the first 42% of travel. This removes the earlier initial 8% stationary interval. The open hold and reverse assembly timing remain unchanged, and scrolling does not require activating **Play animation**.

The complete house and derivative structure, roof and façade images were prepared using OpenAI Imagegen for this visual review. The selected Artlist Kling 3.0 take uses the complete house as its start frame and the same layered house as its end frame. Four WebP atlases per viewport variant provide the forty frames with adjacent-frame blending. Desktop assets total approximately 811 kB; the mobile variant totals approximately 443 kB. The structural chapter holds the open house; the neighborhood remains a separately labelled existing concept. A continuous interior-to-aerial film requires consistent approved source geometry and a reviewed generated take.

Keep the website's motion preference, keyboard controls and static alternative usable when updating this sequence. Test forward and reverse scroll, chapter controls, narrow screens and the original lot-to-Contact path after asset changes. Test contact delivery separately; this visual change does not activate an email provider.

The visible **Play animation** link provides an independent native video player. It opens the same selected Artlist house take, followed by its reverse, as a 10.08-second silent H.264 baseline / yuv420p MP4 at 1280 × 720. The video is requested only after activation and includes native playback controls and a direct-file link. The ordinary anchor is also present in server-rendered HTML for browsers that cannot run the interactive page. The website server supports single byte ranges for MP4 playback and seeking.

Reduced motion starts in still view. Visitors can explicitly choose **Enable scroll animation** for this page, including when the surrounding website has disabled motion. Returning to stills or a new system reduced-motion preference clears that override. This choice does not change system or website-wide preferences.

The **Windows scroll animation** CI jobs run Chrome and Edge on a Windows runner. After installing isolated browser test tools, each job runs `node scripts/verify-windows-animation.mjs` with `BROWSER_CHANNEL` set to `chrome` or `msedge`. The verifier checks native wheel scrolling on the candidate build and public domain without clicking Play, and saves browser/version details, rendered-frame evidence and screenshots as workflow artifacts. A Windows result is confirmed only by the completed job and its evidence; adding this workflow does not itself establish a passing browser test.

This experience is a conceptual architectural study. Final project specifications, dates and availability require current confirmation.
