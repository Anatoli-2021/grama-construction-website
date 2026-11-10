# Development OS — shared local tool

Run `npm run dev:os` from the repository root and visit http://localhost:5180. No installation, login, API key or private company record is needed for this local tool. Keep it on your own computer; this is not an authenticated multi-user application.

The existing New Project Launch Template HTML and 1.0-pilot blank JSON specification were reused. All 27 common tasks, two subdivision tasks, source-map fields, cost-line fields, approval gates and download behavior are retained. The export builder is now a separately testable module. Project IDs are validated and trimmed consistently, fixing the whitespace-only export defect found in the November 10 local QA.

The original Desktop files are untouched. `launch-template.json` and the embedded JSON in `launch.html` must match; `npm run check:repository` checks this. Change both deliberately when revising the specification. Exported files are local drafts; do not add them to Git.

The shared workspace page explains the dashboard boundary. It is not a substitute for Tony’s private dashboard and does not display real Sprucewood records. The local server permits only explicit tool routes, rejects writes and unexpected Host headers, and always binds to loopback. Browser policy blocks outbound connections; form submission only downloads JSON.

Before hosted use, implement and verify the identity/authorization/storage requirements in `docs/SECURITY.md`. No public OS deployment configuration is included.
