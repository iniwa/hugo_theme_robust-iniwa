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
- [x] **【中】`single_json_ld.html` の実在しない画像参照を `Site.Params` ベースに修正する**（2026-07-07）
  - 対応: `thumbnail` を Page Resources から解決し、Page Bundle 内画像がルートパスに化けないようにした。publisher logo は `Site.Params.publisher_logo`、未設定時は `Site.Params.author.thumbnail`、さらに未設定時は `images/thumbnail/default_thumbnail.png` を使う。記事画像の未設定時も `Site.Params.default_thumbnail` または同既定画像を使う。併せて `apple-touch-icon` の存在しない `images/logo.png` 参照も `Site.Params.apple_touch_icon` / `author.thumbnail` にフォールバックするよう修正した。
  - 関連: `iniwach.com` の site override は親 repo 側で削除する。
