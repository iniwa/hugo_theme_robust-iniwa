# CLAUDE.md

## Purpose

This file defines Claude Code's execution rules for the shared `robust-iniwa` Hugo theme. `AGENTS.md` owns design intent, model selection, handoff policy, Codex review, and documentation lifecycle.

## Read Before Editing

- Read `AGENTS.md`, this file, and either the active handoff in the requesting parent repository or an equivalent inline task scope permitted by `AGENTS.md`, then read the files listed for inspection.
- The handoff or equivalent inline prompt is the approved task scope. It may narrow durable project constraints but may not weaken them. Stop and return conflicts to Codex.
- Before editing, capture `git status --short` in the standalone repository and any in-scope parent. After editing, compare the final status and diff with those baselines. Do not reset, clean, stage, or rewrite pre-existing changes.
- Inspect the relevant README change table and existing `[mod]`, `[new]`, or `[removed]` markers before changing theme files.
- Confirm that the working repository is the standalone `robust-iniwa` checkout rather than either parent submodule, then identify the approved parent repositories, allowed files, constraints, non-goals, acceptance criteria, and verification.

## Implementation Rules

- If the user writes in Japanese, respond in Japanese.
- Preserve the established language of documentation, comments, identifiers, logs, and user-facing text unless the task explicitly changes it.
- Implement and verify only the current independently verifiable slice. Wait for Codex review before starting a later slice.
- If the listed files are insufficient to reach the first scoped edit, stop and report the missing discovery or a proposed split instead of broadening the task.
- Preserve the existing Hugo template, Hugo Pipes, split-CSS, and plain-JavaScript structure.
- Keep optional `Site.Params` behavior compatible with both parent configurations and safe when unset.
- Preserve template escaping, DOMPurify sanitization in `load-memos.js`, and SRI hashes on external resources.
- Keep upstream-divergence markers and update the README change tables when theme files are added, modified, or removed.
- Return unresolved requirements, cross-project design choices, and security questions to Codex. If a dependency, deployment, domain, or external-exposure change becomes necessary outside the approved task scope, stop and return it to Codex.
- Subagents are optional and limited to clearly parallel mechanical work within the same files, scope, and constraints.

## Cross-Repository Safety

- Work from the standalone repository root. Do not implement from either detached parent submodule checkout or copy uncommitted theme code into them merely to mirror work.
- Do not edit either parent repository, update a submodule pointer, check out a delivery branch, commit, push, or deploy unless that action is explicitly included.
- If another parent or pointer will need synchronization, leave it unchanged and report the repository, required action, and verification impact.
- Preserve unrelated user and other-agent changes across this repository, either parent, and their submodules. Treat unexpected diffs as having unknown authorship and keep them outside the current task unless confirmed.
- Do not inspect secrets, credentials, private IDs, personal data, or private environment details unless their contents are strictly necessary for the approved task.
- Do not edit secrets, credentials, private IDs, local settings, generated parent output, production data, runtime state, or private environment details unless the approved task explicitly requires the change.
- Never reproduce secrets, credentials, private IDs, personal data, or private infrastructure values in prompts, handoffs, reports, or external tools.
- Do not add dependencies or change build tooling, packaging, CI/CD, deployment, domains, or external exposure outside the approved task scope.

## Verification

Run the minimum sufficient verification that supports the acceptance criteria. Start with the most focused relevant check and add broader checks only when needed to demonstrate the complete approved change:

- Every change: `git diff --check`.
- Shared theme behavior: run `hugo` from `diary.iniwach.com` and `hugo --environment production --printPathWarnings` from `iniwach.com`.
- Rendering or interaction: run `hugo server -D` from the affected parent and inspect the page.
- Parameter-gated behavior: check configured and unset/default paths where practical.

Report any unavailable parent build, browser check, or runtime check as blocked.

## Reporting

Report:

- Changed files.
- Concise summary.
- Each verification command and result.
- Blocked checks.
- Partial edits left in the worktree, if any.
- Subagent usage.
- Parent-site, sibling-site, and submodule-pointer impact.
- Files edited outside the approved scope.
- Unmet acceptance criteria, usable partial results, remaining scope, and resume condition when the slice is incomplete.
- Design questions for Codex.
