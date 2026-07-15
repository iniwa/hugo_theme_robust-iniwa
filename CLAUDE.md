# CLAUDE.md

## Purpose

This file defines Claude Code's execution rules for the shared `robust-iniwa` Hugo theme. `AGENTS.md` owns design intent, model selection, handoff policy, Codex review, and documentation lifecycle.

## Read Before Editing

- Read `AGENTS.md`, this file, the active handoff in the requesting parent repository, and the files listed for inspection.
- Inspect the relevant README change table and existing `[mod]`, `[new]`, or `[removed]` markers before changing theme files.
- Confirm that the working repository is the standalone `robust-iniwa` checkout rather than either parent submodule, then identify the approved parent repositories, allowed files, constraints, non-goals, and verification.

## Implementation Rules

- If the user writes in Japanese, respond in Japanese.
- Implement and verify only the current independently verifiable slice.
- If the listed files are insufficient to reach the first scoped edit, stop and report the missing discovery or a proposed split instead of broadening the task.
- Preserve the existing Hugo template, Hugo Pipes, split-CSS, and plain-JavaScript structure.
- Keep optional `Site.Params` behavior compatible with both parent configurations and safe when unset.
- Preserve template escaping, DOMPurify sanitization in `load-memos.js`, and SRI hashes on external resources.
- Keep upstream-divergence markers and update the README change tables when theme files are added, modified, or removed.
- Return unresolved requirements, cross-project design choices, and security questions to Codex.
- Subagents are optional and limited to clearly parallel mechanical work within the same files, scope, and constraints.

## Cross-Repository Safety

- Work from the standalone repository root. Do not implement from either detached parent submodule checkout or copy uncommitted theme code into them merely to mirror work.
- Do not edit either parent repository, update a submodule pointer, check out a delivery branch, commit, push, or deploy unless that action is explicitly included.
- If another parent or pointer will need synchronization, leave it unchanged and report the repository, required action, and verification impact.
- Preserve unrelated user and other-agent changes. Treat unexpected parent or submodule diffs as having unknown authorship.
- Do not edit secrets, credentials, private IDs, local settings, generated parent output, production data, runtime state, or private environment details.
- Do not add dependencies or change build tooling, packaging, CI/CD, deployment, domains, or external exposure outside the approved scope.

## Verification

Use the smallest checks that demonstrate the approved change:

- Every change: `git diff --check`.
- Shared theme behavior: run `hugo` from `diary.iniwach.com` and `hugo --environment production --printPathWarnings` from `iniwach.com`.
- Rendering or interaction: run `hugo server -D` from the affected parent and inspect the page.
- Parameter-gated behavior: check configured and unset/default paths where practical.

Report any unavailable parent build, browser check, or runtime check as blocked.

## Reporting

Report:

- Changed files.
- Concise summary.
- Verification commands and results.
- Blocked checks.
- Subagent usage.
- Parent-site, sibling-site, and submodule-pointer impact.
- Files edited outside the approved scope.
- Design questions for Codex.
