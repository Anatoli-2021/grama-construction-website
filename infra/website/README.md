# Railway website deployment

Existing project: `earnest-wisdom`.
Service: `grama-construction-website`.
Repository: `Anatoli-2021/grama-construction-website`.

The root Dockerfile builds and serves only the website. Runtime is unprivileged Node 24 with `dist` and the static host; OS source, private data, dependencies and Git history are excluded. PORT is supplied by Railway. `/healthz` reports container readiness.

Service settings to verify:

| Setting | Value |
| --- | --- |
| Root | Repository root `/` |
| Builder | Dockerfile (root `Dockerfile`) |
| Build command | Dockerfile handles `npm ci` and `npm run build` |
| Start command | Dockerfile CMD; clear conflicting custom overrides |
| Health check | `/healthz` |
| Public networking | Generated Railway HTTPS domain, target service PORT |
| Company domain | Unchanged; do not add a custom domain without approval |

`grama-construction-website.railway.internal` is a service-to-service private DNS name, not a public website URL.

Do not introduce a new `railway.toml`/`railway.json`: Railway currently prevents new services from opting into the deprecated Config as Code system. For later repeatable project management, import the existing environment with current Railway IaC, review a no-op plan, and preserve all existing resources/variables. Never apply a whole-project configuration that omits existing services.

No public OS deployment is part of this setup. See `docs/RELEASES.md` and `docs/ONBOARDING.md` for access, review and rollback steps.
