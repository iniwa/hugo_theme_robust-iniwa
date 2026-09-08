# AGENTS.md

## Purpose

This is the Codex-side working agreement for `robust-iniwa`, a public Hugo theme fork shared by `diary.iniwach.com` and `iniwach.com`.

`AGENTS.md` owns design intent, model and handoff policy, Codex review, and documentation lifecycle. `CLAUDE.md` provides compatibility guidance for implementation, verification, and reporting.

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

Default to primary design, implementation, related discovery, verification, corrections, and final acceptance at any task size. Delegate autonomously within existing authority only when replacing primary work lowers expected total effort, including handoff, communication, waiting, integration, verification, and corrections, or a named material risk or existing mandatory independent verification gate warrants it. Size or technical uncertainty alone is insufficient; routine direct work needs no per-task justification.

- Before implementation, decide whether to delegate, then choose the role and initial route: `small-primary` for direct work of any size, `bounded` for a settled delegated outcome, `adaptive` for delegated material technical uncertainty, or `non-implementation` for analysis, design, review, or operations. Reclassify only after a material scope change or contract reset.
- The user chooses the primary runtime model and effort. The primary owns interpretation, material design, authority, integration, final acceptance, and communication. Use configured roles without inherited history or model/effort overrides where supported. If selection is unavailable or unobservable, use the primary or an observable equivalent and record only exposed execution facts.
- When delegation meets the rule, use one `bounded_implementer` for settled cohesive work, `adaptive_implementer` directly for material unresolved native/platform or cross-layer acceptance uncertainty, and `bounded_explorer` only for independently valuable read-only discovery that is not cheap for the writer to perform. Do not force a predictable bounded-writer failure first.
- Only the primary delegates; children do not redelegate or invoke Claude Code. Choose parent permissions first, respect live overrides, and do not mix legacy sandbox settings with permission profiles. Read-only roles remain read-only even with write tools. Keep one writer for overlapping files or behavior.
- Settle the outcome, protected behavior, authority, acceptance mechanics, and focused and required affected checks before delegation. Ordinary delegation uses a short inline task; persist a handoff only for cross-session, interruption-sensitive, operationally risky, or separately executed work. The writer owns related discovery, implementation, verification, and corrections.
- Before acceptance review, self-review the stable diff against every criterion, relevant reference, and protected regression; run the required checks and return per-item passed/blocked/unmet evidence. Unchecked required items are not success. Candidate changes invalidate acceptance review; restabilize before a fresh final review if risk or a mandatory gate still warrants it.
- Use `bounded_reviewer` only for a named material risk or an existing mandatory independent review gate. Localized low-risk documents normally need self-review only. Normally use one reviewer; a second needs a distinct material risk, an unusable/blocked first review, or an existing mandatory multi-reviewer gate. Record the reason and preserve those mandatory gates.
- Consolidate findings for the same writer; integrate from stable diffs and evidence without repeating discovery merely to restore context. Keep one outcome and its corrections together; use a fresh task boundary for an independent phase with separate acceptance and verification.
- While children run, continue useful work within ownership and parallelism rules or wait for notifications. Do not add research/checks, inspect changing candidates, or repeat liveness polling, rereads, or state updates merely to fill the wait. Respond to errors, inconsistent state, user steering, and host progress rules.
- The primary may reclaim work of any size before correction thresholds when direct execution lowers remaining total effort or delegation is unavailable, after confirming child writes stopped and ownership returned, then resetting acceptance, protected boundaries, authority, environment, and evidence.
- At the second correction round for one outcome, or after two blocked/partial implementation returns caused by unresolved acceptance, authority, or environment, pause corrective delegation and reset that contract. Choose primary execution, or justified delegation to the same bounded writer if still bounded or an adaptive writer for material technical uncertainty. Resolve missing authority with user input and keep substantive corrections with one selected writer. Do not weaken verification or abandon safe blocked work.

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
