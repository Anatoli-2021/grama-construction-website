# Luxury design review and prototype — November 11, 2026

Branch `claude/luxury-design-prototype`, based on `feature/private-investor-presentation` at `dcc95a4` (the source of the current Railway release `bc8e81b`). Proposed for owner review only: not merged, not deployed, no DNS change. Railway stays pinned to `bc8e81b`; pushing this branch does not deploy it.

## What the prototype changes (homepage only)

| Area | Before | Prototype |
| --- | --- | --- |
| Hero | AI concept film of a Dexter Acres house; headline addressed to investors only | Authentic completed residence (1847 Dexter Lane desktop, 1914 Lee Street portrait on phones), credited on-image; headline for custom-home clients; three start paths: custom home / develop with Grama / Dexter Acres |
| Proof | None above the fold | Proof bar derived from `src/data/projects.js` (8 completed residences, 14 Dexter Acres homes, 4 communities, family-run) |
| Portfolio | **Contrast defect:** `precision.css` set a light background while `BrandSections.css` kept ivory text; titles, filters and copy were near-invisible (≈1.1:1). Tab counts read 09/01/08 | New `SignatureResidences` rail: all eight completed projects, dark-on-light text, scroll-snap swipe on phones, arrow buttons, live counter, case-study links. Dexter Acres concept is introduced as "in development" and stays labelled |
| Partners | Heading cut off: "We are honored to be trusted partners for" | "Materials & suppliers — The brands we build with." (no implied endorsement) |
| Performance | 3.9 MB before first scroll (2.7 MB MP4 + 111 KB TTF), no compression | ≈0.8 MB desktop / 1.1 MB phone; film no longer requested on the homepage (asset kept); WOFF2 font (38 KB) with TTF fallback; gzip for text in the static host (JavaScript 412 KB → 134 KB) |
| SEO | No structured data, sitemap or robots file | `HomeAndConstructionBusiness` JSON-LD (homepage), `BreadcrumbList` on other pages, `sitemap.xml`, `robots.txt` that blocks crawling unless `SITE_INDEXING=true` at build (company-domain launch only) |

Unchanged: interior pages, the cinematic residence/detail/neighborhood sequence, the 14-lot plan, contact/enquiry behaviour, `/presentation` access boundary, OS. Existing classes and `PropertyCollection` remain in source for comparison.

Files: `src/components/SignatureHome.jsx`, `src/signature.css` (new, loaded last, `.sig-*` scoped), `src/App.jsx`, `src/main.jsx`, `src/components/BrandSections.jsx` (partner heading), `src/styles.css` (font source), `index.html` (preloads), `scripts/build-pages.mjs`, `scripts/serve-website.mjs`, `public/assets/general-sans.woff2`.

Verification: `npm run build`, 91/91 tests, repository policy check, desktop 1440×900 and phone 390×844 screenshots, reduced-motion, rail keyboard/buttons, no horizontal overflow, no console errors on home, projects, Dexter Acres, contact, about, partnerships. Comparison images: `docs/review/`.

## Owner confirmations needed before release

1. Photo rights: `portfolio-sedgwick-street*.webp` carries a visible "© VHT STUDIOS" watermark, and several 1024 px images look like MLS listing photography. Confirm Grama holds a licence for website use or replace with commissioned photography.
2. Public business address for structured data and Google Business Profile (omitted until confirmed).
3. Hero copy "Luxury custom homes, built by family" and the proof-bar wording.
4. Dexter Acres: keep "proposed" wording until the subdivision resubmittal and approvals are confirmed; no dates, prices or availability.
5. Higher-resolution originals (≥2400 px) of the strongest exteriors for the hero.

## Recommended next steps (not in this branch)

See the owner-facing review for the full ranked list. In short: commission photography; a dedicated custom-home client page with process, timeline and investment ranges once approved; Dexter Acres lot-to-home configurator after approvals; consolidate the five overlapping CSS layers (`styles`, `refinement`, `editorial`, `precision`, component CSS ≈137 KB) into one token-based stylesheet; connect real enquiry delivery (M4); responsive image sizes (`srcset`) and long-cache hashed assets.
