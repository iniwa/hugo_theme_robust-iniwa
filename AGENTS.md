# AGENTS.md

## Purpose

This is the Codex-side working agreement for `robust-iniwa`, a public Hugo theme fork shared by `diary.iniwach.com` and `iniwach.com`.

`AGENTS.md` owns design intent, model and handoff policy, Codex review, and documentation lifecycle. `CLAUDE.md` owns Claude Code execution, verification, and reporting rules.

## Project Facts

- Upstream: `dim0627/hugo_theme_robust`.
- Repository: `iniwa/hugo_theme_robust-iniwa`.
- Stack: Hugo 0.146+ templates (`layouts/`, `layouts/_markup/`, `layouts/_partials/`, and `layouts/_shortcodes/`), Hugo Pipes SCSS, split CSS sources under `assets/css/` concatenated in order into one minified, SHA-384 fingerprinted bundle with SRI, and vanilla JavaScript. Hugo Extended 0.158.0 or newer is required.
- Primary paths: `layouts/`, `assets/`, `assets/css/`, and `static/js/`.
- The canonical development checkout is the standalone repository root. Each parent consumes released commits through a detached-HEAD Git submodule.
- Theme-wide changes must remain compatible with both parent sites and their existing configurations.
- CI builds `hugoBasicExample` with the latest Hugo Extended using `./hugo --theme robust --minify`; this repository has no deployment job.

## Instruction Precedence

When instructions conflict, apply them in this order:

1. Runtime, tool, organization, and safety policy.
2. Explicit user instructions that change project policy.
3. Durable project instructions.
4. Other instructions for the current user task and the approved task scope.

The active handoff or equivalent inline prompt is the approved task scope. Verified repository facts override generation-source defaults. Only an explicit user instruction to change project policy may revise a durable project rule; other task instructions and approved scopes may narrow durable rules but may not weaken them. Report unresolved conflicts instead of guessing.

## Model and Role Policy

- Use GPT-5.3-Codex-Spark (`gpt-5.3-codex-spark`) proactively, when available, for low-risk, well-scoped, independently verifiable supporting work that requires no material design judgment or source-code implementation.
- GPT-5.6 Terra (`gpt-5.6-terra`) or Sol (`gpt-5.6-sol`) owns requirements and theme design. Whenever Terra is used, set its reasoning level to `high`. Prefer Sol for substantial ambiguity, risk, or cross-project reasoning.
- Run every Claude Code task with `--permission-mode auto`.
- After design is fixed, delegate source-code implementation first to Claude Code Sonnet 5 at effort medium from the approved repository root: `claude -p --model sonnet --effort medium --permission-mode auto "<handoff/task prompt>"`.
- Only when Sonnet 5 is unavailable because of usage limits or service availability, use GPT-5.6 Luna (`gpt-5.6-luna`) with reasoning level `max` for the same implementation slice.
- Implementation failure, failed verification, or a design question is not model unavailability. Return it to Codex instead of switching models.
- Apply this policy to every coordinating Codex model and its subagents; do not create coordinator-specific exceptions unless the user explicitly changes project policy.
- Codex may keep requirements, design, read-only investigation, review, synthesis, and small documentation-consistency changes in one context.
- Claude Code subagents are optional and limited to clearly parallel mechanical work inside the current task scope. They inherit its constraints.

## Durable Theme Rules

- Features controlled by `Site.Params` must degrade safely. An unset optional parameter disables or defaults the feature without breaking either parent build or layout.
- Keep shared parameter names and behavior compatible with both parent configurations.
- Mark divergence from upstream with existing `[mod]`, `[new]`, and `[removed]` comments. Keep the README's `上流 (Robust) からの変更点` tables synchronized when theme files change.
- Preserve template escaping, DOMPurify sanitization in `load-memos.js`, and SRI on external resources. Do not weaken XSS or supply-chain protections.
- Do not add an external origin, runtime dependency, or frontend build system, and do not change packaging, CI/CD, deployment, domains, or external exposure outside the approved task scope.
- Preserve the existing Hugo Pipes, plain JavaScript, and split-CSS structure unless an approved design requires a change.

## Cross-Repository Boundary

- For substantive cross-repository work, keep the theme handoff under `docs/handoffs/` in the requesting parent repository. A very small, fully scoped task may use an equivalent inline prompt. Either form authorizes only the repositories and files it names.
- Use the standalone repository root as the implementation root. Treat both detached parent submodule checkouts as read-only consumers; do not implement changes separately in them.
- Possible impact on the other parent is a report item, not authorization to edit it.
- Editing either parent, changing a submodule pointer, checking out a branch for delivery, committing, pushing, or deploying each requires explicit scope and authorization.
- When delivery actions are not authorized, leave both parent pointers unchanged and report the required synchronization for `diary.iniwach.com` and `iniwach.com`.
- Preserve unrelated user and other-agent changes across this repository, either parent, and their submodules. Treat unexpected diffs as having unknown authorship and keep them outside the current task or commit unless confirmed.
- Do not inspect secrets, credentials, private IDs, personal data, or private environment details unless their contents are strictly necessary for the approved task.
- Do not edit secrets, credentials, private IDs, local settings, generated parent output, production data, runtime state, or private environment details unless the approved task explicitly requires the change.
- Never reproduce secrets, credentials, private IDs, personal data, or private infrastructure values in prompts, handoffs, reports, or external tools.
- This repository is public. Never add or retain secrets, private IDs, credentials, machine inventory, or private environment details in it.

## Handoff Workflow

- One handoff covers one cohesive, independently verifiable theme change and its direct regression checks.
- Delegate only after the goal, files, constraints, non-goals, data sources, acceptance criteria, and verification are clear and material design choices are resolved.
- Size the slice so the first intended edit is reachable after reading the listed files. Run unresolved discovery as a separate read-only slice.
- Do not combine broad parent-site discovery, unresolved design, implementation, delivery, and pointer updates in one implicit scope.
- Treat a delegation that ends before meeting its acceptance criteria as interrupted rather than complete, even when its process exits normally. Record usable partial results, verification, remaining scope, and the resume condition; narrow a broad handoff before rerunning it.
- The implementer changes only the approved slice and returns design questions to Codex. Codex reviews the report and diff before another slice.
- The implementer reports changed files, each verification command and result, blocked checks, partial edits left in the worktree, subagent usage, and design questions.
- Keep only active or blocked handoffs in the requesting parent's `docs/handoffs/`. Move a completed handoff to that parent's `docs/handoffs/archive/` after implementation, verification, review, required runtime work, and follow-up are complete.

## Verification and Review

- Run `git diff --check` for every documentation or code change.
- Run the minimum sufficient verification that supports the acceptance criteria. Start with the most focused relevant check and add broader checks only as needed to demonstrate the complete scoped change.
- For theme behavior changes, build both consumers: run `hugo` from `diary.iniwach.com` and `hugo --environment production --printPathWarnings` from `iniwach.com`.
- When rendering or interaction matters, run `hugo server -D` from the relevant parent and inspect the affected page.
- For parameter-gated behavior, verify both configured and unset/default paths where practical.
- Report each verification command and result, any blocked parent build or browser check, and any partial edit rather than treating one parent as sufficient.

During review, confirm that both parent sites remain compatible, security hardening and upstream-divergence records were preserved, and no unapproved parent edit, pointer update, dependency, delivery, deployment, or exposure change occurred.

## Documentation Lifecycle

- Keep this file limited to short, current, durable rules and links.
- Keep the README change tables current with theme code. Put reusable theme-wide detail in `README.md` or `docs/` and parent-specific decisions in the requesting parent's `docs/decisions/`.
- Do not add task history or completed implementation narratives to this file.
