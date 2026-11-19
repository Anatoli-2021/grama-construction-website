# GRAMA visual system

## Mineral palette

Public layouts share the tokens in `src/development-brand.css`: warm ivory `#f6f3ed`, limestone `#e8e1d6`, sand `#d8cbb9`, ink `#282724`, charcoal `#242321`, taupe `#6a635b` and restrained bronze `#7b6248`. Dark surfaces use ivory text, a lighter taupe and a lighter bronze. Original photography and third-party partner marks retain their actual colors.

Use ink or taupe for body copy on light mineral surfaces; bronze is an accent and an accessible text color on ivory. Use `--site-control-line` for interactive boundaries and `--site-line` for quiet editorial rules. Preserve semantic errors separately. Focus outlines must remain visible on both dark scenes and light mobile menus.

## Equal leadership

`FamilySection` uses the same figure, `.family-portrait-frame` and caption structure for both people. Both columns have equal width with a shared 4:5 aspect ratio, matching top alignment, spacing and caption typography. Phones use equal full-width cards in sequence. The shared max width caps enlarging the landscape Tony photograph; object positioning keeps faces visible without altering original pixels. Both original Alina JPEGs remain in use across Home and About.

## Architectural media

The premium experience is rendered from the existing controlled world and packaged separately under `/assets/construction/premium-v2/`. Its source and manifest preserve the seven-stage narrative and consistent architecture. The browser uses 336 samples from the same 672 native frames at 24 fps / 28 seconds, averaging twelve sampled poses per timeline second. This is 50% more sampled poses than the retained legacy 224-sample package. Eighty-four 2-by-2 sheets per desktop/mobile variant (168 total) retain 1440 × 810 / 768 × 432 tile dimensions and the same four-reference decoded/pending cache cap. The native renderer profile and film cadence are unchanged by this delivery refinement. Prior media remain available for cached older pages. Chapter stills, reduced motion, native film and error recovery remain first-class alternatives to the scroll canvas.

## Acceptance

Browser checks measure portrait frame/image dimensions at desktop, tablet and phone widths, verify original photo hashes and shared computed palette values, calculate contrast and reject horizontal overflow. Animation checks verify native media dimensions, authored frame inventory, scroll without Play, reversal, bounded loading, fallback and focus return. Distinguish actual browser/device coverage from engine tests or emulation; record the exact source and deployment rather than relying on a previous release.
