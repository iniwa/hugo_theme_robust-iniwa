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

## Delegation and Role Policy

- Use GPT-5.6 Sol as the preferred main worker; the user's actual runtime model and reasoning choice remains authoritative. Sol owns intent, design, approval boundaries, integration, and user communication and can directly finish small or transfer-negative work. Use configured Luna roles (`bounded_explorer`/`bounded_implementer`) for bounded work and Terra roles (`adaptive_implementer`/`bounded_reviewer`) for adaptive implementation or risk-justified review; do not force delegation or pin the main reasoning level in project instructions.
- Use native Codex delegation: one `bounded_implementer` for settled, cohesive work; use `adaptive_implementer` directly when acceptance depends on unresolved native/platform or cross-layer lifecycle behavior.
- Use `bounded_explorer` only for independent read-only discovery and `bounded_reviewer` only for a concrete correctness, security, compatibility, or verification risk after the writer's stable self-review gate. If implementation changes after review, treat the review as diagnostic and request at most one fresh final review when risk warrants it.
- Keep one writer for overlapping files. A second correction round, or two blocked/partial returns, triggers a contract reset before further delegation. If a role is unavailable or its selection is unobservable, continue in the primary session or use an observable agent with equivalent constraints; Claude Code is unapproved unless the user explicitly changes this policy.
- Prefer the smallest correct change, reuse existing/platform-native capabilities, and make approval boundaries and definition of done explicit in the handoff. Verify the final diff and required checks before reporting completion.

Before implementation, classify the initial route from acceptance evidence: `small-primary` for small or transfer-negative work, `bounded` for settled multi-step work with one verifiable writer, `adaptive` when unresolved native/platform/runtime or cross-layer behavior is material, or `non-implementation` for analysis, design, review, or operations. Classification does not force delegation; reclassify only after a material scope change or contract reset. Name any material reviewer risk after the writer's stable self-review (pre-stable review is diagnostic only), reset the contract at the second correction round or after two blocked/partial returns, and use a fresh task boundary for an independent phase. The primary reintegrates through the stable diff and evidence rather than repeating discovery.

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

## Personal-Use Iteration

- Treat routine changes as personal-use iteration by default unless a verified project requirement or protected public-content, rights, human-approval, or data gate is stronger. Start with the smallest useful theme code or documentation change and, when useful, a focused build or page check. This standalone theme repository does not gain parent-site edits, deployment, submodule, or public publication authority from this rule; preserve its existing gates.
- This allowance covers bounded reversible work only. Preserve gates for credentials, authentication, permissions, external exposure, live data, infrastructure or cost, publication or release, parent submodules, and other project-specific protected behavior. Do not require speculative edge-case matrices, defensive hardening, or a full suite merely to permit ordinary iteration.
- If a target, check, or required approval is unavailable, distinguish source readiness from verified operation. Only important REQUIRED deferred checks belong in the existing issue or ledger, with their verification, approval, and resume conditions; optional or unnecessary checks do not create issues. Reconcile any operational checklist with the exact approval scope and conditions without weakening permanent prohibitions. For documentation-only changes, use the smallest relevant reference, fence, format, or sample check; do not invent an application runtime.
- If a project-required safety or approval review must precede application, return the stable source or diff with applicable pre-application checks first; runtime application and smoke are not run, passed, or complete until that gate clears. Ordinary work does not acquire review solely because optional checks were omitted.
