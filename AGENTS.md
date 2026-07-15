# AGENTS.md

## Purpose

This is the Codex-side working agreement for `robust-iniwa`, a public Hugo theme fork shared by `diary.iniwach.com` and `iniwach.com`.

`AGENTS.md` owns design intent, model and handoff policy, Codex review, and documentation lifecycle. `CLAUDE.md` owns Claude Code execution, verification, and reporting rules.

## Project Facts

- Upstream: `dim0627/hugo_theme_robust`.
- Repository: `iniwa/hugo_theme_robust-iniwa`.
- Stack: Hugo templates, Hugo Pipes SCSS, split static CSS, and vanilla JavaScript. Hugo Extended is required.
- Primary paths: `layouts/`, `assets/`, `static/css/`, and `static/js/`.
- The canonical development checkout is the standalone repository root. Each parent consumes released commits through a detached-HEAD Git submodule.
- Theme-wide changes must remain compatible with both parent sites and their existing configurations.

## Model and Role Policy

- Use GPT-5.3-Codex-Spark (`gpt-5.3-codex-spark`) proactively, when available, for low-risk, well-scoped, independently verifiable supporting work that requires no material design judgment or source-code implementation.
- GPT-5.6 Terra (`gpt-5.6-terra`) or Sol (`gpt-5.6-sol`) owns requirements and theme design. Whenever Terra is used, set its reasoning level to `high`. Prefer Sol for substantial ambiguity, risk, or cross-project reasoning.
- After design is fixed, delegate source-code implementation first to Claude Code Sonnet 5 at effort medium from the approved repository root.
- Only when Sonnet 5 is unavailable because of usage limits or service availability, use GPT-5.6 Luna (`gpt-5.6-luna`) with reasoning level `max` for the same implementation slice.
- Implementation failure, failed verification, or a design question is not model unavailability. Return it to Codex instead of switching models.
- Apply this policy to every coordinating Codex model and its subagents; do not create coordinator-specific exceptions.
- Codex may keep requirements, design, read-only investigation, review, synthesis, and small documentation-consistency changes in one context.
- Claude Code subagents are optional and limited to clearly parallel mechanical work inside the approved handoff.

## Durable Theme Rules

- Features controlled by `Site.Params` must degrade safely. An unset optional parameter disables or defaults the feature without breaking either parent build or layout.
- Keep shared parameter names and behavior compatible with both parent configurations.
- Mark divergence from upstream with existing `[mod]`, `[new]`, and `[removed]` comments. Keep the README's `上流 (Robust) からの変更点` tables synchronized when theme files change.
- Preserve template escaping, DOMPurify sanitization in `load-memos.js`, and SRI on external resources. Do not weaken XSS or supply-chain protections.
- Do not add an external origin, runtime dependency, frontend build system, packaging, or CI/CD unless explicitly approved.
- Preserve the existing Hugo Pipes, plain JavaScript, and split-CSS structure unless an approved design requires a change.

## Cross-Repository Boundary

- A theme handoff lives under `docs/handoffs/` in the requesting parent repository and authorizes only the repositories and files it names.
- Use the standalone repository root as the implementation root. Treat both detached parent submodule checkouts as read-only consumers; do not implement changes separately in them.
- Possible impact on the other parent is a report item, not authorization to edit it.
- Editing either parent, changing a submodule pointer, checking out a branch for delivery, committing, pushing, or deploying each requires explicit scope and authorization.
- When delivery actions are not authorized, leave both parent pointers unchanged and report the required synchronization for `diary.iniwach.com` and `iniwach.com`.
- Preserve unrelated parent and submodule changes. Treat unexpected diffs as having unknown authorship and exclude them from the task or commit.
- This repository is public. Do not add secrets, private IDs, credentials, machine inventory, or private environment details.

## Handoff Workflow

- One handoff covers one cohesive, independently verifiable theme change and its direct regression checks.
- Size the slice so the first intended edit is reachable after reading the listed files. Run unresolved discovery as a separate read-only slice.
- Do not combine broad parent-site discovery, unresolved design, implementation, delivery, and pointer updates in one implicit scope.
- If a handoff times out before its intended edit, do not rerun it unchanged. Narrow the behavior, files, and verification first.
- The implementer changes only the approved slice and returns design questions to Codex. Codex reviews the report and diff before another slice.
- Keep only active or blocked handoffs in the requesting parent's `docs/handoffs/`. Move a completed handoff to that parent's `docs/handoffs/archive/` after implementation, verification, review, required runtime work, and follow-up are complete.

## Verification and Review

- Run `git diff --check` for every documentation or code change.
- For theme behavior changes, build both consumers: run `hugo` from `diary.iniwach.com` and `hugo --environment production --printPathWarnings` from `iniwach.com`.
- When rendering or interaction matters, run `hugo server -D` from the relevant parent and inspect the affected page.
- For parameter-gated behavior, verify both configured and unset/default paths where practical.
- Report any parent build or browser check that cannot be run rather than treating one parent as sufficient.

During review, confirm that both parent sites remain compatible, security hardening and upstream-divergence records were preserved, and no unapproved parent edit, pointer update, dependency, delivery, deployment, or exposure change occurred.

## Documentation Lifecycle

- Keep this file limited to short, current, durable rules and links.
- Keep the README change tables current with theme code. Put reusable theme-wide detail in `README.md` or `docs/` and parent-specific decisions in the requesting parent's `docs/decisions/`.
- Do not add task history or completed implementation narratives to this file.
