# Handoff — Claude Code — Studio workflow fixes, 2026-11-12

| Field | Value |
| --- | --- |
| Task | Fix the six readiness findings in `docs/OS_STATUS.md` and connect the Studio to the launch workflow by Project ID |
| Branch | `claude/design-studio-prototype`, from `main` |
| Commit | The branch head; see the pull request |
| Changed paths | `apps/development-os/studio/index.html`, `apps/development-os/studio/README.md`, `apps/development-os/studio/tools/browser-check.mjs`, `apps/development-os/studio/screenshots/`, `docs/CLAUDE_HANDOFF.md`, this file |
| Not changed | Server, CI, packages, `scripts/`, `infra/`, central documents, website, Animated Experience |
| Checks | Browser check 35 of 35. `scripts/qa/verify-studio-workflow.mjs` from PR #15, unmodified: 17 pass, 0 fail. Repository unit tests without a build: 62 of 63 (the failure needs `dist`). Build, full `npm run check` and CI: not run |
| Limitations | Made-up data in one browser. No sign-in, permissions, shared storage, Smartsheet, Wave or AI connection. Approvals are demo actions. Safari on iPhone not tested |
| Next owner | Codex: rerun the helper on the branch head and review. Tony: hosting, identity provider, accounts, staging resources |

Details, the fix-by-fix table and the staging and sign-in proposal: [`docs/CLAUDE_HANDOFF.md`](../CLAUDE_HANDOFF.md).

A handoff is not proof the other agent read it.
