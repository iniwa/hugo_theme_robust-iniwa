# プログラム改善チェックリスト

コードベースを調査して洗い出した改善候補の一覧（2026-07-07 調査）。

**運用方法**: 着手したい項目にチェック `[x]` を入れる → Codex が親サイト側の
`docs/handoffs/` に handoff を作成し、Claude Code（Sonnet 実務・auto モード）が実装する。
実装完了した項目は「完了アーカイブ」へ移動する。

- 優先度: **中** = 親サイトの SEO・保守性に影響 / **低** = 任意。
- ベースライン (2026-07-07): 親サイト 2 つ（`diary.iniwach.com` / `iniwach.com`）とも
  `hugo v0.160.1` でビルド成功・警告 0 件。
- テーマ変更後は両親サイトで submodule pointer 更新が必要（`AGENTS.md` 参照）。

---

## 1. テンプレート

- [ ] **【中】`single_json_ld.html` の実在しない画像参照を `Site.Params` ベースに修正する**
  - 現状: `layouts/partials/single_json_ld.html` は publisher logo を `images/logo.png`（両親サイトとも存在しない）、`.Params.thumbnail` 未設定時のフォールバックを `images/default.png`（同じく存在しない）に固定。さらに `thumbnail` を `absURL` で直接解決するため Page Bundle 内画像がルートパスに化ける（diary の `2026/06/index.html` で `https://diary.iniwach.com/images/thumbnail.jpg` という 404 URL を実測）。`iniwach.com` はこのバグ回避のため 42 行の site override を維持している。
  - 対応案: `meta.html` に既にある Page Bundle 解決ロジック（Page Resources 検索）を JSON-LD にも適用し、publisher logo とデフォルトサムネイルを `Site.Params` から取得可能にする（例: `images/thumbnail/default_thumbnail.png` は両親サイトに存在）。修正後、`iniwach.com` の override を削除して動作確認。
  - 制約: 既存 frontmatter (`thumbnail`) の解釈を変えない。両親サイトの Search Console 構造化データでエラーが出ないこと。

- [ ] **【低】`HUGO_ENV` 依存の DEV 分岐を現行ワークフローに合わせる**
  - 現状: `getenv "HUGO_ENV"` 分岐が `baseof.html:49` / `list.html:43` / `li_sm.html:26` / `summary.html:31` にあるが、親サイトの開発は `config/development/` 切替で行い `HUGO_ENV` を設定しないため、WordCount 表示は常に無効・GA 抑止分岐も実質不使用（dev config に GA ID がないため実害なし）。
  - 対応案: `hugo.IsProduction` ベースに置換、または分岐ごと削除（挙動不変の機械的変更として実施可）。
  - 制約: dev ビルドで GA/AdSense が出ないことを維持。

## 2. スタイル・メタデータ

- [ ] **【低】pagination スタイルの二重管理を解消する**
  - 現状: `assets/styles.scss:498〜`（`.paging`、`list.html:61` で使用）と `static/css/pagination.css`（67 行、`.pagination` / `#paging`）にページネーション関連スタイルが分散。
  - 対応案: `pagination.css` へ集約（挙動不変）。見た目のリグレッションは両親サイトの一覧ページで目視確認。

- [ ] **【低】`theme.toml` のメタデータを修正する**
  - 現状: `homepage = "https://github.com/iniwa/hugo-theme-robust-iniwa"`（実リポジトリは `hugo_theme_robust-iniwa`。`licenselink` は正しい）。`min_version = '0.60.0'` は README の「Hugo 0.158+ 対応」と不整合。
  - 対応案: homepage の URL 修正、`min_version` を実態に合わせて引き上げ（機械的変更）。

---

## 完了アーカイブ

- [x] **【中】AMP テンプレートの扱いを決める（削除）**（2026-07-07）
  - 対応: 未使用の `layouts/_default/baseof.amp.html`、`layouts/_default/single.amp.html`、`layouts/shortcodes/img.amp.html` を削除。README の変更点表と Features から AMP 対応記述を削除し、`assets/styles.scss` の未使用 `amp-img` セレクタも削除した。
