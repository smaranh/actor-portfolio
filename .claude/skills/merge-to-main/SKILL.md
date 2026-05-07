---
name: merge-to-main
description: Rebases and squash-merges the current branch into main. Commits any pending changes first via /commit. Stops and notifies the user if already on main.
---

# Merge to Main

Rebases the current branch onto main and merges it via squash commit with a detailed message.

## Steps

### 1. Check current branch

Run `git branch --show-current`.

If the result is `main`, stop immediately and tell the user:

> You are already on `main`. Switch to the branch you wish to merge first.

Do not proceed further.

### 2. Commit any pending changes

Run `/commit` to ensure the working tree is clean before rebasing. If there is nothing to commit, continue.

### 3. Rebase onto main

```bash
git fetch origin main
git rebase origin/main
```

If there are rebase conflicts, stop and report them to the user. Do not proceed until resolved.

### 4. Push the rebased branch

```bash
git push origin <branch> --force-with-lease
```

### 5. Squash-merge into main via GitHub PR

Use `gh pr merge` to merge via GitHub (respects branch protection rules):

```bash
gh pr merge <PR-number> --squash --subject "<subject>" --body "<body>"
```

- Find the open PR for the current branch with `gh pr view`.
- If no PR exists, create one first with `gh pr create`.
- Write the commit subject and body using the `/typo-check` message format: one-line subject summarizing all changes, then a `### file` section per changed file with bullet points.

### 6. Switch to main and sync

```bash
git checkout main
git pull origin main
```

### 7. Delete the merged branch

Delete the remote branch first, then the local branch:

```bash
git push origin --delete <branch>
git branch -D <branch>
```

- Delete the remote branch with `git push origin --delete <branch>`. If GitHub already auto-deleted it (repo setting), this is a no-op — ignore the error.
- Use `git branch -D` (force delete) because squash merges aren't tracked by git's safe `-d` check.

### 8. Confirm

Print the merge commit SHA and confirm main is up to date and the branch is gone.
