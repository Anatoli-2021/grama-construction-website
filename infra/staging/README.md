# Railway staging preparation

Use the existing earnest-wisdom project. Do not create another project or clone production resources.

Two empty environments exist:
- staging-website: intended website preview, synthetic forms only.
- staging-os: intended authenticated Development OS preview, synthetic data only.

They currently have no running services, volumes, buckets or copied variables. The declarative [plan.json](plan.json) is a preparation record, not a deployable Railway manifest and not an automatic activation tool.

## Website activation, after review
1. Use the existing root Dockerfile and root build context; preserve the public website paths.
2. Select a reviewed branch/commit explicitly. Never repoint the current production service as a shortcut.
3. Bind Railway PORT and use /healthz. Confirm the chosen branch's actual build/start behavior; contact/presentation work differs between branches.
4. Disable real enquiry delivery; use synthetic input and dedicated test destinations only after authorization. No production secrets.
5. Create a Railway temporary preview URL only for the website if approved; no domain purchase or company DNS changes.
6. Verify public pages/assets/mobile, health, unknown routes, and denial of OS/source/private-data paths.

## OS activation, after backend/auth review
1. Claude provides the real hosted build/start/health contract. The current apps/development-os/server.mjs is loopback-only and not suitable for public hosting.
2. Implement server identity, project/field/file authorization, session protection and synthetic fixtures. Fail closed when identity configuration is missing.
3. Run synthetic OS separately from the website, with its own secrets and no production Smartsheet connection.
4. Keep it unexposed until anonymous/wrong-role/wrong-project tests pass. A future /platform URL requires reviewed routing that covers assets, callbacks, APIs, cookies and cache behavior.
5. Any database/private storage requires explicit resource/cost approval. Do not persist shared records in an ephemeral container or reuse the local AI memory SQLite file.
6. Test approved login, denial, revocation, disconnected/stale integration and rollback before a real-data release.

## Previews and costs
Automatic project-wide PR environments remain disabled. Existing GitHub CI is the initial preview gate; local loopback previews use synthetic data. Later enable only explicitly reviewed staging previews with scoped watch paths, no production secrets, defined expiry and approved spend. Never create an automatically public OS environment.

## Reconciliation and release
Verify environment names/IDs in Railway immediately before every write. Do not copy production variable values into Git, issue bodies or logs. Record reviewed commit, image/deployment ID, source branch, tests, URL/access class, approval and rollback target privately. Follow docs/RELEASES.md. Empty environments are ready for configuration, not evidence of an operating staging platform.

Official reference: https://docs.railway.com/environments — empty environments contain no services; duplicated environments copy configuration/variables and stage deployments. Verified November 12, 2026.
