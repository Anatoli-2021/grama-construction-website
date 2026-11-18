# Website release procedure

Use a feature branch and a reviewed pull request. Keep the stable branch and previous release available throughout verification.

## Prepare and verify

1. Inspect repository status, preserve unfinished work and update a clean `main` with a fast-forward pull. Create a focused `feature/*` branch; do not push changes directly to `main` or force-push shared history.
2. Install the committed dependencies with `npm ci`. Set `SITE_URL` to the intended canonical origin and run `npm run check`. Use the same origin for build and metadata tests. Run the existing API/media verification when relevant.
3. Review the complete diff and staged files. Include only intended source, portable documentation and optimized runtime assets. Keep credentials, original media libraries, render masters, personal records and working notes outside the public artifact.
4. Open a pull request. Describe the resulting behavior, tests, screenshots and any remaining verification limits. Obtain maintainer review before merging into the stable branch.

## Staging acceptance

Deploy the exact tested commit to the review environment before running browser checks against its public URL. Verify the deployed source revision and artifact; a successful build, branch push or configured source alone does not prove which version is live.

Check the rendered desktop and mobile layouts, direct page routes, canonical metadata, genuine 404 responses and source/configuration boundaries. Compare served asset hashes with the built artifact. Verify the native video's GET, HEAD and byte-range responses.

Exercise scrolling without Play, all animation chapters, reverse scrolling, keyboard controls, reduced motion, still-image alternatives, loading failure and native film playback/seeking/focus return. Check equal leadership frames, palette contrast and horizontal overflow. Distinguish installed Safari from WebKit engine tests and label device emulation accurately.

Preserve the retained cinematic media and fourteen-lot map. Exercise the lot-to-Contact path using synthetic data. Hosted automatic Contact delivery remains disabled until its separate provider configuration and delivery verification are complete; unavailable delivery must never report success.

## Production verification

Rebuild with the production canonical origin and complete the required checks. Apply only the authorized website service changes, using the exact accepted commit. Preserve unrelated services and configuration; keep secrets in the hosting environment.

After deployment, confirm the live source revision, health, HTML, asset hashes, native-video ranges, navigation, mobile layouts and scroll experience. Record the deployed revision, target URL and completed verification in the release review. Do not infer automatic deployment from a source setting or a previous successful run.

## Recovery

Retain the previous validated website version. If recovery is needed, redeploy that version and verify the same public routes, media and Contact behavior. Reconcile any code correction through a reviewed pull request or `git revert`; do not rewrite shared history.
