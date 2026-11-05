# Contributing

Private repository: [Anatoli-2021/grama-construction-website](https://github.com/Anatoli-2021/grama-construction-website). **Anatoli-2021 is the owner.** Keep `main` stable; propose changes through `feature/*` branches and reviewed pull requests. Public hosting and live-domain changes require separate owner authorization.

## Owner: invite approved collaborators

Invite only exact GitHub accounts approved by the owner. For Nail or any additional developer, confirm the GitHub username first; a first name or an email address alone does not identify an approved account.

1. Sign in as `Anatoli-2021` and open the repository above.
2. Select **Settings** (under the overflow menu if hidden).
3. Under **Access**, select **Collaborators**, then **Add people**.
4. Search the approved username, verify the matching profile, select it, and click **Add NAME to REPOSITORY**.
5. Each person signs in to their own invited account and accepts the repository invitation from GitHub's invitation email. Access begins after acceptance. Check the Collaborators list to confirm acceptance; an unanswered invitation is not active access.[^invite]

A personal repository has two access levels: owner and collaborator. In this **private personal repository**, collaborators receive read/write access; there is no read-only collaborator option or organization-style role picker. Collaborators can push changes and merge PRs, so our review convention matters. Only the owner manages invitations and repository ownership/settings reserved to the owner.[^permissions]

## Contributor: authenticate and run locally

Use your own GitHub account, with a passkey or 2FA. Never share the owner's login, tokens, or recovery codes. Install Git for Windows (including Git Credential Manager), Node.js 24 LTS, and npm. Git Credential Manager authenticates HTTPS operations through your browser and stores credentials in Windows Credential Manager. GitHub account passwords do not authenticate Git operations.[^auth][^credentials]

After accepting the invitation, run this in your chosen parent folder:

```powershell
git clone https://github.com/Anatoli-2021/grama-construction-website.git
cd grama-construction-website
npm ci
npm run dev
```

Complete the browser sign-in with your own invited account when prompted. Open [http://localhost:5173](http://localhost:5173). Stop with **Ctrl+C**. This server is local; the forms save test enquiries on your computer, without email/CRM delivery or reservations. See [README.md](README.md) for the source map and production preview.

## Make a focused change

Start with a clean working tree. If `git status` shows changes, preserve them using the next section before switching/updating branches.

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c feature/short-description
```

Edit only the intended files. Coordinate shared-file work with the other contributors. Run `npm run build` and inspect relevant desktop/mobile behavior. For API/asset changes, run `npm run verify` in a second terminal while the local server is running; review any generated evidence separately.

Stage explicit files rather than everything; the paths below are examples to replace with your changed paths:

```powershell
git diff
git add -- src/App.jsx src/refinement.css
git diff --cached
git commit -m "Explain the concrete change"
git push -u origin feature/short-description
```

Keep commits focused. Never stage credentials, `.env` secrets, `.data/` enquiry records, or unrelated private files. When a dependency changes intentionally, include the corresponding `package.json` and `package-lock.json` changes; use `npm ci` to install the committed lockfile.

## Sync without losing unfinished work

Run `git status` first. Commit intentional work on your feature branch, or stash it locally before merging. If you started edits on `main`, first move them to a new branch with `git switch -c feature/short-description`.

For an existing feature branch with unfinished changes:

```powershell
git stash push -u -m "Before syncing feature branch"
git stash list
git status
```

Confirm that your new stash exists and the working tree is clean, then synchronize the feature branch:

```powershell
git fetch origin
git merge origin/main
```

Only after the merge succeeds, restore the entry you just created (normally `stash@{0}`):

```powershell
git stash apply 'stash@{0}'
git status
```

`apply` retains the stash as a recovery copy. Inspect the restored work and resolve any conflicts; drop that specific stash only after confirming the work is preserved. The `-u` option includes untracked files, but not ignored files.[^stash]

If any command fails, stop and inspect its output. Do not run `reset --hard`, `git clean`, force-push, or blindly overwrite files to make synchronization succeed. If local `main` has diverged and `--ff-only` refuses, preserve the local commits and ask the owner to reconcile them.

## Resolve conflicts and open a PR

For merge conflicts, use `git status` to identify files, agree on the intended combined result, edit the conflict markers out, stage only resolved files, and commit the resolution. Rebuild and recheck the affected behavior, then push your feature branch. Do not select an entire side of a conflict without inspecting what it discards.[^conflicts]

On GitHub, click **Compare & pull request** for your pushed branch. Confirm **base: main** and **compare: feature/short-description**. Explain the change, why it is needed, and what you checked; include screenshots for visible changes. Request review from `Anatoli-2021` or an owner-designated reviewer. Use a draft PR if unfinished.[^pr]

Address review comments with additional commits on the same branch. **Merge only after owner approval, required review feedback is resolved, and relevant checks pass.** Do not push directly to `main`. These are team conventions: this guide does not certify that branch protection, rulesets, required reviews, or CI checks are configured or enforced.

## After the PR is merged

Use **Delete branch** on the merged PR when no other open PR needs it.[^delete] Then, from a clean local tree:

```powershell
git switch main
git pull --ff-only origin main
git branch -d feature/short-description
git fetch --prune origin
```

If `-d` refuses after a squash/rebase merge, leave the branch and ask the owner to verify its work is included; do not substitute a forced deletion. Create a fresh `feature/*` branch for the next change.

## Verified references

Official documentation checked 2026-11-05. Repository settings and invitations are owner actions, not actions performed by this guide.

[^invite]: [GitHub: Inviting collaborators to a personal repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository).
[^permissions]: [GitHub: Permission levels for a personal account repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository).
[^auth]: [GitHub: About authentication to GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github).
[^credentials]: [GitHub: Caching your GitHub credentials in Git](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git).
[^stash]: [Git: git-stash reference](https://git-scm.com/docs/git-stash).
[^conflicts]: [GitHub: Resolving a merge conflict using the command line](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/resolving-a-merge-conflict-using-the-command-line).
[^pr]: [GitHub: Creating a pull request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request).
[^delete]: [GitHub: Deleting and restoring branches in a pull request](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request).
