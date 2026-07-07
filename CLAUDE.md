# CLAUDE.md

## Codex / Claude Code Workflow
- This file holds Claude Code execution rules for the `robust-iniwa` theme fork; `AGENTS.md` records design intent and review criteria.
- Theme work normally arrives via a handoff in a parent site repo (`docs/handoffs/` of `diary.iniwach.com` or `iniwach.com`); read it before editing.
- Claude Code runs in auto mode (automatic model selection); coding work completes at Sonnet level. Return design questions to Codex instead of deciding locally.
- Never commit automatically. Leave commits, pushes, and submodule pointer bumps to the user.

## Project Structure
- `layouts/` — templates, partials, shortcodes (divergence from upstream is listed in README「上流 (Robust) からの変更点」)
- `assets/` — SCSS compiled by Hugo Pipes (`styles.scss`, `author.scss`)
- `static/css/` — split CSS: `variables.css` (colors/sizes, theme variants), `layout.css`, `content.css`, `pagination.css`, `grid.css`, `tip.css`, `memos-style.css`
- `static/js/` — `load-memos.js`, `tooltip.js`

## Execution Rules
- Keep `[mod]` / `[new]` / `[removed]` markers on changed code, and update the README change tables when files are added, modified, or removed.
- `Site.Params` 未設定時に該当機能が自動無効化される挙動を壊さない (both parent sites must keep building with their existing configs).
- Keep SRI hashes on external resources; do not add new external origins or dependencies.
- Preserve XSS-hardening (template escaping, sanitizing in `load-memos.js`).
- This checkout is usually a detached-HEAD submodule inside a parent repo. Before the user commits, `git checkout master` is required — mention this in the report.
- After a theme change is committed and pushed, **both** parent repos (`diary.iniwach.com`, `iniwach.com`) need a submodule pointer bump — mention this in the report.

## Verification
- Run `hugo server` from a parent site checkout and confirm the affected pages render.
- When touching params-gated features, check both the params-set and params-unset paths.
