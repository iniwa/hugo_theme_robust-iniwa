# プログラム改善チェックリスト

コードベースを調査して洗い出した改善候補の一覧（2026-07-07 調査）。
2026-07-16 に上流 [zzzmisa/hugo_theme_robust](https://github.com/zzzmisa/hugo_theme_robust/releases) の
v2.0.0 / v2.1.0 リリースを調査し、輸入候補を追記した。

**運用方法**: 着手したい項目にチェック `[x]` を入れる → Codex が親サイト側の
`docs/handoffs/` に handoff を作成し、Claude Code（Sonnet 実務・auto モード）が実装する。
実装完了した項目は「完了アーカイブ」へ移動する。

- 優先度: **中** = 親サイトの SEO・保守性に影響 / **低** = 任意。
- ベースライン (2026-07-07): 親サイト 2 つ（`diary.iniwach.com` / `iniwach.com`）とも
  `hugo v0.160.1` でビルド成功・警告 0 件。
- テーマ変更後は両親サイトで submodule pointer 更新が必要（`AGENTS.md` 参照）。

---

## 1. テンプレート・SEO（上流 v2.0.0 由来）

- [ ] **【中】`<time datetime>` 属性を RFC 3339 形式に修正する**（上流 v2.0.0 の Bug Fix 相当）
  - 現状: `list.html` / `summary.html` / `li_sm.html` の datetime が
    `2006-01-02T15:04:05JST` 形式で、`JST` はリテラル出力されるため RFC 3339 として不正。
  - さらに `li_sm.html:22` は基準年が `2007-01-02...` になっており、Go の time layout として
    年トークン `2006` を含まないため **datetime の年が常に「2007」とリテラル出力される実バグ**。
  - 対応案: 3 ファイルとも `.Format "2006-01-02T15:04:05Z07:00"` に統一する。
- [ ] **【中】`<html>` に `lang` 属性を追加する**（上流 v2.1.0 の Bug Fix 相当）
  - 現状: `baseof.html:11` の `<html>` に `lang` がなく、アクセシビリティ・SEO 上不利。
  - 対応案: `<html lang="{{ .Site.Language.LanguageCode | default "ja" }}">`。1 行で完結。
- [ ] **【中】BreadcrumbList / WebSite の JSON-LD を追加する**
  - 上流は `layouts/_partials/breadcrumb_json_ld.html` / `website_json_ld.html` を新設。
    フォーク側は BlogPosting（`single_json_ld.html`）のみ。
  - 対応案: 上流 2 partial を輸入し、記事ページに BreadcrumbList、トップに WebSite を出力。
    既存の `single_json_ld.html`（独自差替済み）とはファイルを分けたまま共存できる。
- [ ] **【中】robots.txt / llms.txt の出力テンプレートを追加する**
  - 上流は `layouts/robots.txt` と `layouts/home.llms.txt` を新設。
  - 注意: 有効化には親サイト側 `hugo.toml` の `outputs` / `enableRobotsTXT` 設定が必要。
    テーマ側はテンプレート追加のみで、未設定の親には無害（出力されない）。
- [ ] **【中】記事画像に `loading="lazy"` / `decoding="async"` を付与する**（上流 v2.1.0）
  - 現状: フォークには `render-image.html` フックがなく、`img.html` shortcode にも lazy 指定なし。
  - 対応案: 上流の `layouts/_markup/render-image.html` を輸入し、
    `shortcodes/img.html` / `img-view.html` にも同属性を追加。ファーストビュー画像の扱いに注意。
- [ ] **【中】OGP メタタグの強化（og:locale / article:published_time / article:modified_time）**
  - フォークの `meta.html` は全面差替済みのため上流ファイルの丸ごと輸入は不可。
    上記 3 タグ（＋リストページの OGP 補完）だけを既存の IsHome / IsPage 分岐に選択的に移植する。
  - hreflang 対応は両親サイトとも単一言語のため見送り。
- [ ] **【低】Font Awesome CDN をインライン SVG（`icon.html` partial）に置き換える**
  - 上流は FA CDN を廃止し `layouts/_partials/icon.html`（Free 6.7.2 / CC BY 4.0）でインライン化。
    外部 CDN 依存・SRI ハッシュ管理・レンダリングブロックが消える。
  - フォークの使用箇所: `meta.html`（CDN ロード）、`list.html` / `summary.html` / `li_sm.html`
    （fa-calendar / fa-sync）、`share.html` ほか。使用アイコンの棚卸しが必要で作業量は中程度。
- [ ] **【低】Disqus 呼び出しを削除する**（上流 v2.0.0 で削除済み）
  - 現状: `single.html:26` に `{{ template "_internal/disqus.html" . }}` が残存。
    両親サイトとも Disqus 未設定なら実出力はないが、Hugo 側で deprecated のため警告要因になる。
- [ ] **【低】サイドバー partial を `partialCached` 化する**（上流 v2.0.0）
  - `baseof.html` の archives / tags / categories / latests はページ非依存のためキャッシュ可能。
    ビルド高速化。`author.html` / `memos.html` も対象にできるか確認する。
- [ ] **【低】Hugo 0.146+ の新テンプレート構造へ移行する**（上流 v2.0.0）
  - 上流は `layouts/_default/` → `layouts/`、`partials/` → `_partials/`、
    `shortcodes/` → `_shortcodes/` へ移行済み。旧構造は当面動くが将来の deprecation 対策。
  - 全ファイル移動を伴う大規模変更のため、他の輸入が一段落してから単独スライスで実施する。

## 2. スタイル・アクセシビリティ（上流 v2.1.0 由来）

- [ ] **【低】Google Fonts をオプション化し、システムフォントスタックを既定にする**
  - 現状: `baseof.html:17-21` は `params.googlefonts` 未設定時に Roboto Slab を**強制ロード**。
    上流は未設定時ロードなし＋システムフォント（Hiragino / Yu Gothic / Meiryo）既定に変更。
  - 対応案: else 側のフォールバックロードを削除し、`styles.scss` の font-family 既定を
    システムフォントスタックへ。`meta.html:13` の fonts.gstatic preconnect も googlefonts
    設定時のみ出力に連動させる。親サイトの見た目が変わるため両親で表示確認が必要。
- [ ] **【低】アクセシビリティ CSS の選択的輸入（コントラスト / リンク下線 / :focus-visible / タップターゲット）**
  - 上流: リンク色を WCAG AA（4.6:1）の `#1976d2` に調整、本文リンクに下線、
    `:focus-visible` のフォーカスリング、シェア・SNS アイコンを 40px 化。
  - フォークは CSS を `static/css/*.css` に分割済みのため、該当ルールを
    `variables.css` / `content.css` / `layout.css` へ選択的に移植する。配色は
    `theme_variant` ごとの見た目と衝突しないか両親でプレビュー確認。
- [ ] **【低】モバイルのカード高さ可変化・blockquote サイズ統一**
  - 上流はカード高さを可変にしてテキスト truncation を整理、blockquote のデバイス間
    サイズ差を解消。フォークの `styles.scss` / `layout.css` の該当箇所と突き合わせて移植。

## 3. 見送り（v2.0.0 / v2.1.0 のうち輸入しない項目）

- **AMP 削除・highlight.js 削除・BlogPosting 化・default.jpg 修正・apple-touch-icon 条件付き出力**: フォークで対応済み。
- **外部リンク render hook・twitter:site・404 ページ改善・logofontfamily 修正・CSS カスタムプロパティ化**: フォークが独自実装済み（`render-link.html` は sponsored 付与つき、`variables.css` あり）。
- **多言語（日本語ページの言語別 URL / hreflang）**: 両親サイトとも単一言語のため不要。
- **コードブロックの github-dark 統一・Chroma 用 `chroma.css`**: フォーク独自のウィンドウ風コードブロックスタイルと競合するため見送り。
- **CI（actions-hugo@v3）**: フォークに CI ワークフローが存在しないため対象外。

---

## 完了アーカイブ

- [x] **【中】AMP テンプレートの扱いを決める（削除）**（2026-07-07）
  - 対応: 未使用の `layouts/_default/baseof.amp.html`、`layouts/_default/single.amp.html`、`layouts/shortcodes/img.amp.html` を削除。README の変更点表と Features から AMP 対応記述を削除し、`assets/styles.scss` の未使用 `amp-img` セレクタも削除した。
- [x] **【中】`single_json_ld.html` の実在しない画像参照を `Site.Params` ベースに修正する**（2026-07-07）
  - 対応: `thumbnail` を Page Resources から解決し、Page Bundle 内画像がルートパスに化けないようにした。publisher logo は `Site.Params.publisher_logo`、未設定時は `Site.Params.author.thumbnail`、さらに未設定時は `images/thumbnail/default_thumbnail.png` を使う。記事画像の未設定時も `Site.Params.default_thumbnail` または同既定画像を使う。併せて `apple-touch-icon` の存在しない `images/logo.png` 参照も `Site.Params.apple_touch_icon` / `author.thumbnail` にフォールバックするよう修正した。
  - 関連: `iniwach.com` の site override は親 repo 側で削除する。
- [x] **【低】`HUGO_ENV` 依存の DEV 分岐を現行ワークフローに合わせる**（2026-07-07）
  - 対応: GA 出力は `hugo.IsProduction` のときのみ、WordCount 表示は非本番 build のときのみ出るように変更した。

- [x] **【低】pagination スタイルの二重管理を解消する**（2026-07-07）
  - 対応: `assets/styles.scss` の `.paging` 定義を削除し、`static/css/pagination.css` に wrapper スタイルを集約した。

- [x] **【低】`theme.toml` のメタデータを修正する**（2026-07-07）
  - 対応: `homepage` を `hugo_theme_robust-iniwa` に修正し、`min_version` を README と揃えて `0.158.0` に引き上げた。
