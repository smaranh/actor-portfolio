---
name: commit
description: Commit all pending changes. Ensures pre-commit hooks are set up, checks for typos, and creates a single aggregated commit with a detailed message.
---

# Commit

Combines `/setup-pre-commit` and `/typo-check` into one step.

## Steps

### 1. Ensure pre-commit hooks are set up

Check whether Husky + lint-staged are already configured:

- `.husky/pre-commit` exists and is executable
- `.lintstagedrc` exists
- `prepare: "husky"` in package.json
- `husky`, `lint-staged`, `prettier` in devDependencies

If **all** are present, skip to step 2.

If **any** are missing, run `/setup-pre-commit` in full before continuing.

### 2. Typo check and commit

Run `/typo-check` — this will:

- Identify all modified, added, and untracked files via `git status`
- Scan each file (or its diff) for typos; fix obvious ones silently, stop and ask the user for ambiguous ones
- Create a single aggregated commit with a detailed message per file
