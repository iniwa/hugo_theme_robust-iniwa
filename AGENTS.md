# AGENTS.md

## Purpose
This file is the Codex-side working agreement for the `robust-iniwa` Hugo theme fork.
Claude Code uses `CLAUDE.md` for execution rules.

## Project Summary
- Project name: `robust-iniwa` — fork of [`dim0627/hugo_theme_robust`](https://github.com/dim0627/hugo_theme_robust)
- Purpose: personal Hugo theme, consumed as a git submodule by `diary.iniwach.com` and `iniwach.com`
- Repository: `https://github.com/iniwa/hugo_theme_robust-iniwa` (public)
- Stack: Hugo templates (Go html/template), SCSS via Hugo Pipes, split static CSS, vanilla JS

## Role Split / Model Policy
Same as the parent sites: Codex owns design and writes handoffs; Claude Code
runs in auto mode (automatic model selection) and executes coding work at
Sonnet level. Subagents are optional and limited to clearly parallelizable
mechanical work. Design questions return to Codex as report items.

Handoffs for theme tasks live in the requesting parent site repo
(`docs/handoffs/` of `diary.iniwach.com` or `iniwach.com`), not in this repo.

## Design Principles
- Features gated by `Site.Params` must degrade gracefully: unset params disable the feature without breaking the build or layout of either parent site.
- Mark divergence from upstream with `[mod]` / `[new]` / `[removed]` comments, and keep the README「上流 (Robust) からの変更点」tables up to date when files change.
- External resources (fonts, FontAwesome, scripts) require SRI hashes. Do not add new external origins or runtime dependencies without Codex review.
- Preserve the deliberate XSS/supply-chain hardening (template escaping, `load-memos.js` sanitizing, SRI). Do not weaken it for convenience.
- No build tooling, packaging, or CI/CD.

## Cross-Project Sync
This theme is shared by two parent sites. After a theme change:
1. Commit & push in this repo. Parent checkouts are usually detached HEAD — check out `master` first.
2. Bump the submodule pointer in **both** `diary.iniwach.com` and `iniwach.com`.

Shared `Site.Params` keys (e.g. `author.twitter_handle`, `og_worker_url`, `latests_count`) must stay compatible with both sites' configs.

## Constraints
- Do not commit automatically; leave commits and pushes to the user.
- Do not break either parent site; verify with `hugo server` from a parent checkout when possible.
- This repo is public: never include secrets, IDs, or environment details in code or docs.

## Design Record Scope
Keep this file focused on short, durable rules. Longer background belongs in
the parent site's `docs/decisions/`.
