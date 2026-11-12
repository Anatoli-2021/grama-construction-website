# Original images and protected animation assets

## Scope and approval

Tony approved the Grama Development naming and refined minimalist logo direction on November 12, 2026. He explicitly rejected replacing original architectural photographs and visuals with generated houses, stock imagery or invented projects. This refinement restores the original company homepage photograph and preserves existing authorized photographs, portraits, partner marks, project information and enquiry behavior.

The original-image manifest is [original-assets.json](original-assets.json). Its baseline is commit `d45e546fe0d1b8673039b45b3db34c5a7d0b784a`, the inspected Nail Animated Experience checkpoint. The manifest records SHA-256 hashes for 31 original assets (29 photographs/partner images, the supplied plan and the existing font), 17 protected animation files (five source files and twelve media files), and the restored original hero. Each baseline file was read from Git and compared with its working-copy bytes when this record was prepared. No generated replacement image is introduced.

## Restored original homepage hero

| Field | Value |
| --- | --- |
| Official original source | [Original Grama homepage photograph](https://cdn.prod.website-files.com/66117180961169ea1597a070/667345df51ac861d97d4a8a9_turnkey%20(2).jpg) |
| Repository output | [original-home-hero.webp](../public/assets/original-home-hero.webp) |
| Output dimensions | 1536 × 983 pixels |
| Processing | Resize and WebP reencoding only; no image generation or depicted-content alteration |
| Original JPG SHA-256 | `8445520b8f65eea37ed88dbca1c44904364f8b635ad24f5a402779d86f36b33c` |
| Output WebP SHA-256 | `9883685e70b42e139e1fe65e05e65113139e43d7fd9e5cfdf6a8d12ac32a855c` |

The source URL and original JPG hash identify the original downloaded photograph; the repository contains its optimized WebP derivative. The homepage uses this authorized original as the architectural hero. Typography, spacing, sizing and logo treatment may be refined without substituting generated buildings or changing what the photograph depicts.

## Preserved project photographs

All sixteen existing project photographs remain byte for byte unchanged from the baseline. Attribution and factual captions remain governed by [ASSETS.md](ASSETS.md) and the existing project records. Completed-portfolio attribution does not establish that a property is sold or available.

| Asset | Classification |
| --- | --- |
| `portfolio-dexter.webp` | Existing authorized completed-project photograph |
| `portfolio-lee.webp` | Existing authorized completed-project photograph |
| `portfolio-lee-bath.webp` | Existing authorized completed-project photograph |
| `portfolio-prospect.webp` | Existing authorized completed-project photograph |
| `portfolio-prospect-interior.webp` | Existing authorized completed-project photograph |
| `portfolio-1914-entry.webp` | Existing authorized project photograph; no listing-status claim |
| `portfolio-chicago-avondale.webp` | Existing authorized completed-project photograph |
| `portfolio-chicago-avondale-interior.webp` | Existing authorized completed-project photograph |
| `portfolio-burr-ridge.webp` | Existing authorized completed-project photograph |
| `portfolio-burr-ridge-interior.webp` | Existing authorized completed-project photograph |
| `portfolio-south-barrington.webp` | Existing authorized completed-project photograph |
| `portfolio-south-barrington-interior.webp` | Existing authorized completed-project photograph |
| `portfolio-foster-avenue.webp` | Existing authorized completed-project photograph |
| `portfolio-foster-avenue-interior.webp` | Existing authorized completed-project photograph |
| `portfolio-sedgwick-street.webp` | Existing authorized completed-project photograph |
| `portfolio-sedgwick-street-interior.webp` | Existing authorized completed-project photograph |

## Preserved people, partner marks and source materials

- People: `tony-grama.webp` and `grama-realtor.webp`. Preserve the actual people and the original image content, including historic branding visible within a photograph.
- Partner marks, in existing source order: `partner-floor-decor.png`, `partner-houzz.png`, `partner-lennox.png`, `partner-pella.png`, `partner-sika.png`, `partner-andersen.png`, `partner-bosch.png`, `partner-lowes.png`, `partner-goodman.png`, `partner-abc-supply.png`, `partner-home-depot.png`. Preserve their colors and identities; displaying them does not create new endorsement or certification claims.
- Drawing: `site-plan-original.png`, the supplied C5 source for lot organization and drawing-reported areas. Current approval/revision status is not inferred.
- Typography: `general-sans.ttf`, the existing authorized font asset.

## Legacy concepts and Nail's ownership

Existing owner-supplied `residence.webp`, `residence-angle.webp` and `residence-garden.webp` are architectural concepts, not completed-project photographs. `community.webp`, `residence-film.mp4` and `sequence/*` are documented legacy AI concept visuals. They are retained on the dedicated project/animation experiences with their concept distinctions; they do not replace the restored original homepage photograph or completed-project photography.

Nail owns Animated Experience. Its protected source files are `AnimatedExperience.css`, `AnimatedExperience.jsx`, `ArtlistHouseSequence.jsx`, `animated-timeline.js` and `artlist-house-sequence.js` under `src/components/`. The manifest also protects the four layer images and eight desktop/mobile Artlist atlas sheets under `public/assets/animated/`.

Those existing animation assets are documented generated concept derivatives, not original architectural photography. They are retained only within the dedicated project/animation experience and remain labelled as concepts. Their preservation does not approve their use as replacement company photography. This branding refinement does not overwrite Nail's animation code or media and does not modify Development OS.

## Verification and release boundary

Check original asset and protected-animation hashes against the manifest; verify the restored hero dimensions/hash and its actual homepage reference. Check that the eight completed case pages retain their photograph galleries, source attribution, project information and enquiry links. Review desktop/mobile image framing and partner/portrait visibility in the browser; hash preservation alone does not validate cropping or layout.

Use only the existing repository and Railway website staging service for review. Production release requires Tony's approval of the exact version and a verified rollback checkpoint. No new site, service or domain is authorized by this refinement.
