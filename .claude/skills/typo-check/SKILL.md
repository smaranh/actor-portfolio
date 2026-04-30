---
name: typo-check
description: Set up Typo check pre-commit hooks. Stop the commit if typo is found. Add a single aggregated commit covering all changed files.
---

# Setup Pre-Commit Hooks

## What This Sets Up

- **Typo check** Make sure that there are no typos in the files that are about to be committed.
- If a typo is found, fix it silently before committing. If a typo is ambiguous (genuine word vs. misspelling unclear), stop and ask the user before proceeding.
- **Commit** Create a **single aggregated commit** that covers every new or updated file, with a message that lists each file and its changes.

## Steps

### 1. Identify Files

Run `git status` to identify every new or updated file in the working tree (modified, added, untracked). All of these files will be included in **one commit**.

### 2. Typo Check

For each file, scan its contents (or diff for modified files) for typos. Fix obvious typos silently — they are not tracked in the commit history. If a typo is ambiguous, stop and inform the user; do not proceed with the commit until it is resolved.

### 3. Commit

Stage all the new or updated files and create **one commit** that aggregates the changes across every file.

The commit message MUST follow this exact format: a single-line subject summarizing the batch, a blank line, then a markdown section per file listing that file's discrete changes as bullets.

```
<one-line subject summarizing the batch across all files>

### <file-name-1>
- <change 1>
- <change 2>

### <file-name-2>
- <change 1>
- <change 2>
- <change 3>
```

Where:

- The **subject line** is a concise high-level summary of the batch (e.g. `chore: refresh daily logs and tighten ingest rules`). Keep it under ~70 chars so it renders cleanly in `git log --oneline` and the GitHub commits view. Do NOT prefix with `Changes in ...` — that pattern is for per-file commits, which this skill no longer produces.
- Each **`### <file-name>`** heading uses the path of the file as shown in `git status` (e.g. `Input.md`, `Report/Steps-2026-04-26.md`, `.claude/skills/typo-check/SKILL.md`).
- Under each heading, list the discrete changes in that file as `- ` bullets. One bullet per logical change. If a file has only one logical change, still include a single bullet so the format is consistent.
- Order files in the commit body the same way `git status` lists them (or by importance if obvious — e.g. core source files before incidental config tweaks).
- Do NOT mention typo fixes in the commit message. Typos are fixed silently before committing — they are not tracked in the commit history.

Pass the message via a HEREDOC to preserve newlines, headings, and the bullet lists, e.g.:

```
git commit -m "$(cat <<'EOF'
chore: refresh tomorrow's task list and update typo-check skill

### Input.md
- clear today's accomplishments
- add 'Prompting 101' video to Additional Items

### .claude/skills/typo-check/SKILL.md
- switch from per-file commits to a single aggregated commit
- update example commit message format
EOF
)"
```

The result is **one commit** covering every changed file in the working tree, with a subject line summarizing the batch and a body that breaks down the specific changes per file — readable both in `git log` and on GitHub.
