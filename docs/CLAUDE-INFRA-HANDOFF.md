# Claude Code handoff — Tony Dashboard and Design Studio

Use after your current task reaches a safe checkpoint. This is a shared task brief, not an instruction to discard work or start another platform.

## First reply
Record your current repository, branch, exact commit, dirty paths, current task status and next checkpoint. Read AGENTS.md, docs/INFRASTRUCTURE-READINESS.md and docs/handoffs/infrastructure-2026-11-12.md. Do not switch a dirty checkout or merge this branch automatically.

## Role split
- Claude: Tony Dashboard, Design Studio, project UX and UI components in apps/development-os/.
- Codex: infrastructure, integration/security contracts, staging and release readiness.
- Nail / axmatea: authorized repository contributor; work on a separate task branch.
- Tony: scope, visual direction, user access, cost, merge and release approval.
- Agree on interfaces and touched files in the handoff before overlapping edits. Review exact commits; do not assume chat histories, local drives or memory are shared.

## Product priorities
The home screen is Tony's creation workbench. The main job is turning an opportunity or client request into a designed, priceable, sellable and executable package.
- Today: resume active work, missing inputs, next action, decisions and links to source tools.
- Design Studio: project-scoped canvas/reference board with versioned plans/surveys/photos, sketches/renderings, materials/selections, takeoff notes, vendor collaboration and comparison.
- Projects: reusable acquisition-through-closeout structure; separate workspaces and stable IDs.
- Clients Pipeline: opportunity/discovery/design/proposal/contract-handoff; preserve the distinction between a lead and an approved project.
- Document Hub: permission-checked source references, version, status and related task.
- Mail: visible disconnected/approved-read-only states; never fake sync.
- Budget & Decisions: link scope and quote to cost lines, Tony review, schedule prerequisites and assigned next action.

A kitchen example can be entirely synthetic: input plan → confirm dimensions → cabinet/vendor design → materials/colors/options → takeoff → quote-backed budget draft → presentation/approval → released work package. Do not invent real client choices, quantities, quotes or dates.

## Build boundaries
Extend existing apps/development-os/ and retain website root paths. No new repo/framework scaffold. Keep the local blank tool's access boundary intact while designing a separate authenticated hosted runtime.
Read docs/SECURE-OS-CONTRACT.md before APIs. Propose a minimal UI/backend contract, source freshness fields and direct authorization tests. Do not implement duplicate approved budget/approval registers.
Tony prefers /platform on the existing domain; that routing is pending design/verification. Do not deploy the OS using the website's static fallback.

The six design references are held in Tony's local design-output folder, outside the public repository. Ask Tony for the chosen approved reference through an authorized channel; do not upload his private prototype or real-data screenshots. No final visual direction is approved yet.

## Tools and collaboration
Verify your own official GitHub/Railway/Higgsfield connections with read-only profile/project calls. Codex's working MCP login does not log you in. Never ask for copied tokens/cookies or commit local MCP settings. If unavailable, document the needed sign-in instead of substituting a connection.
Do not start new image charges until the requested model/count/spend and input permissions are clear.
Use a separate branch and per-task handoff; another reviewer reviews the exact commit, then Tony approves. Do not interrupt other sessions, auto-merge, install broader permissions, purchase resources/domains or deploy production.

## Deliverable back to infrastructure owner
Branch/commit and changed paths; UI/backend routes and data contracts; auth/session expectations; staging build/start/health commands; synthetic fixtures; local/CI and browser evidence; unresolved source facts; conflicts; next owner. No confidential data in this file.
