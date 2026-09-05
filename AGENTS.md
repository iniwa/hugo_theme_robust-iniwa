# hugo_theme_robust-iniwa

Standalone shared Hugo theme. Read `README.md`, `theme.toml`, affected templates/assets, and the requesting parent handoff or inline scope. Work only from this standalone root; parent sites consume it through submodules.

Preserve Hugo Pipes, split CSS, plain JavaScript, optional `Site.Params` compatibility, escaping, DOMPurify in `load-memos.js`, SRI, and upstream markers `[mod]`, `[new]`, `[removed]`. Update README change tables whenever theme files change. Parent-specific decisions belong in the parent repository; do not change parent pins from this checkout.

Apply runtime/safety policy, explicit user policy, this file, then task scope. Preserve unrelated dirty work, secrets, dependencies, CI, domains, deployment, and exposure. Choose route from evidence; configuration owns model/effort. Use one native writer only when settled work benefits from transfer, and review only named material risk after stable self-review. Reset after a second correction or two blocked returns.

Verify focused theme checks and `git diff --check`; report unavailable Hugo/browser checks. Keep current rules here, decisions in `docs/decisions/`, reusable notes in `docs/`, and active/blocked handoffs in the requesting parent.

Authority reminder: runtime/tool/safety policy, explicit user policy, this entry, then task scope apply in that order; facts do not grant authority.

The current task may narrow standing permissions; it never widens theme, submodule, publication, or exposure gates. For bounded personal work, use a minimal diff and useful normal-path check, then the established authorized target/procedure and smoke normal use, correcting observed failures. Cheap direct checks are optional; do not invent suites or a harness. The primary alone delegates; configured roles must be observable or primary/equivalent continues, with parent permissions/live overrides/read-only behavior binding. Stable self-review precedes named-risk review and later edits invalidate it. A second correction or two blocked/partial returns requires primary contract restatement and one selected writer.

Shared-theme checks retain `git diff --check`, `hugo` from `diary.iniwach.com`, `hugo --environment production --printPathWarnings` from `iniwach.com`, and `hugo server -D` for rendering/interaction changes.
