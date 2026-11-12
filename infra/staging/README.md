# Railway staging preparation

Use the existing earnest-wisdom project. Do not create another project or clone production resources.

Two existing staging environments are reused:
- staging-website: website chat now has an active SUCCESS service, humorous-delight, source main. This infrastructure continuation did not deploy it.
- staging-os: existing staged-create exquisite-comfort points to main; no deployment, variables, volume or domain. Unapplied patch is preserved; owner unknown.

Both environments were initially created empty. The observations above supersede that initial checkpoint. Do not duplicate the existing OS draft or apply it as-is: main is the website baseline, not the candidate OS host. The declarative [plan.json](plan.json) records observation/proposal separately; it is not a deployable manifest or activation tool. No OS staging URL exists.

## Website activation, after review
1. Use the existing root Dockerfile and root build context; preserve the public website paths.
2. Select a reviewed branch/commit explicitly. Never repoint the current production service as a shortcut.
3. Bind Railway PORT and use /healthz. Confirm the chosen branch's actual build/start behavior; contact/presentation work differs between branches.
4. Disable real enquiry delivery; use synthetic input and dedicated test destinations only after authorization. No production secrets.
5. Create a Railway temporary preview URL only for the website if approved; no domain purchase or company DNS changes.
6. Verify public pages/assets/mobile, health, unknown routes, and denial of OS/source/private-data paths.

## OS activation, after backend/auth review
1. Review [host candidate](../../apps/development-os/hosted/README.md) and reconcile its exact commit with the existing draft service. Use root build context and os.Dockerfile, not the website Dockerfile. Candidate health is /healthz, start is node apps/development-os/hosted/server.mjs; UI remains integration-pending. The old loopback server is unchanged.
2. Google sign-in with one owner is approved. Configure a separate web OAuth client, exact staging callback and private owner/project allowlist; never reuse a desktop connector credential. The candidate's 22 local HTTP/offline OIDC checks pass, but real Google login, container and Railway acceptance have not run. Other roles/files/exports/storage are not implemented.
3. Run synthetic OS separately from the website, with its own secrets and no production Smartsheet connection.
4. Keep it unexposed until anonymous/wrong-role/wrong-project tests pass. A future /platform URL requires reviewed routing that covers assets, callbacks, APIs, cookies and cache behavior.
5. Any database/private storage requires explicit resource/cost approval. Do not persist shared records in an ephemeral container or reuse the local AI memory SQLite file.
6. After reviewed UI and resource activation approval, test actual owner login, nonowner/anonymous/project denial, revocation and source-disconnected behavior. Run the actual two-version Railway rollback drill in the host README; server replacement/session tests alone do not prove rollback.

## Previews and costs
Automatic project-wide PR environments remain disabled. Existing GitHub CI is the initial preview gate; local loopback previews use synthetic data. Later enable only explicitly reviewed staging previews with scoped watch paths, no production secrets, defined expiry and approved spend. Never create an automatically public OS environment.

## Reconciliation and release
Verify environment names/IDs in Railway immediately before every write. Do not copy production variable values into Git, issue bodies or logs. Record reviewed commit, image/deployment ID, source branch, tests, URL/access class, approval and rollback target privately. Follow docs/RELEASES.md. Empty environments are ready for configuration, not evidence of an operating staging platform.

Official reference: https://docs.railway.com/environments — empty environments contain no services; duplicated environments copy configuration/variables and stage deployments. Verified November 12, 2026.
