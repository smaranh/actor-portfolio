---
name: implement-plan
description: Implements a development plan from a markdown file. Takes the name of the PR and the markdown file path as arguments. Creates a primary PR off main, and sub-PRs for each issue, using /tdd, /setup-pre-commit, and /typo-check skills.
---

# Implement Plan

## What This Does

Executes a development plan from a markdown file by creating a hierarchy of Pull Requests: one primary PR for the overall plan, and one sub-PR per issue. Integrates `/tdd`, `/setup-pre-commit`, and `/typo-check` to enforce quality at every step.

**Arguments**

- `PR_NAME` — name of the primary PR to create on GitHub (branch off `main`)
- `MARKDOWN_FILE` — path to the markdown file containing the plan and issue list

## Steps

### 1. Read the Plan

Read `MARKDOWN_FILE` in full. Identify every issue to implement and note which are marked **AFK** (autonomous) vs **HITL** (human in the loop).

### 2. Branch from Main

```bash
git checkout main && git pull
git checkout -b <branch-name-derived-from-PR_NAME>
```

### 3. Create Primary PR

Create the primary PR targeting `main`. It may be empty or a draft at this point.

```bash
gh pr create --title "<PR_NAME>" --base main --draft
```

### 4. For Each Issue: Sub-PR Loop

Repeat the following for every issue in the plan:

**4a. Create sub-branch** off the primary branch:

```bash
git checkout -b <sub-branch-name>
```

**4b. TDD loop** — invoke `/tdd` to generate a test plan, write tests (RED), then implement (GREEN).

**4c. Implement**:

- **AFK**: proceed autonomously — make all changes needed to resolve the issue.
- **HITL**: propose the changes, then STOP and ask the user if clarification is needed before continuing.

**4d. Pre-commit checks** — invoke `/setup-pre-commit` and ensure all checks pass.

**4e. Commit** — invoke `/typo-check` to fix typos, generate the commit message, and commit.

**4f. Create sub-PR** targeting the primary branch:

```bash
gh pr create --title "<issue title>" --base <primary-branch>
```

**4g. Merge sub-PR** into the primary branch.

**4h. Sync** — switch back to the primary branch and pull before starting the next issue:

```bash
git checkout <primary-branch> && git pull
```

### 5. Finalize

- [ ] All issues resolved
- [ ] All sub-PRs merged into the primary branch
- [ ] Primary PR is up to date

**STOP here.** Ask the user to review the primary PR. Do not merge into `main` without explicit approval.

## Notes

- Branch names should be slugified from the PR/issue name (lowercase, hyphens, no spaces)
- AFK issues run fully autonomously; HITL issues require a human checkpoint before committing
- The primary PR is never merged by this skill — only the human can approve that merge
