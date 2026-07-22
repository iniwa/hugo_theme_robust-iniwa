# プログラム改善チェックリスト

コードベースを調査して洗い出した改善候補の一覧（2026-07-07 調査）。
2026-07-16 に上流 [zzzmisa/hugo_theme_robust](https://github.com/zzzmisa/hugo_theme_robust/releases) の
v2.0.0 / v2.1.0 リリースを調査し、輸入候補を追記した。
2026-07-21 に現行コード、両親サイトの設定・生成結果、Hugo 0.160.1 での互換性を再確認し、
テーマ内で完結する全25項目を実装・検証・レビューして完了アーカイブへ移した。

残る4項目は、テーマの実装ではなく親サイトの公開文書、AdSense アカウント、配信地域、運用方針に
関する作業である。2026-07-22 に `iniwach.com` の方針決定、公開文書更新、テーマ pointer 更新、
production deployment、CMP 公開まで完了したが、AdSense のサイト審査は未承認である。サイト承認を
先行 gate とし、それまでは account 側の配信設定と experiment を進めない。下記項目は承認後の
account 設定と実配信検証が完了するまで未完了として扱う。

**運用方法**: 実装、検証、レビューが完了した項目だけを `[x]` にして「完了アーカイブ」へ移す。
親サイトの編集、submodule pointer 更新、commit、push、公開、AdSense アカウント操作はそれぞれ
明示的な承認が必要（`AGENTS.md` 参照）。

- 優先度: **高** = 実バグ・公開ポリシー・法令/プラットフォーム要件に直結 /
  **中** = SEO・アクセシビリティ・保守性に実益 / **低** = 効果が限定的または任意。
- ベースライン (2026-07-21): standalone テーマを指定した両親サイトの本番相当ビルドが成功。
- テーマ側の変更だけでは、下記の親サイト・外部運用項目は完了扱いにしない。

---

## 親サイト・外部運用の残件

- [ ] **【中】広告方式を段階検証する（親サイト側）**
  - `iniwach.com` で Auto ads を小さく試すか、今回用意した手動枠を採用するかを運営者が決定し、
    レイアウト、Core Web Vitals、収益性を確認する。`diary.iniwach.com` への展開は別判断とする。
  - サイト固有の方式、審査、公開条件は親リポジトリの `ADSENSE_PLAN.md` に記録する。
  - 状態: Auto ads の50% traffic experiment、in-page banner のみという方式は決定済み。テーマ側の
    共通 gate、手動広告 partial、CLS 予約領域、本番デプロイも完成。AdSense サイト承認後に
    account 設定、baseline 記録、experiment と評価を行う。
- [ ] **【高】プライバシーポリシー・運営者情報を再監査する（親サイト側）**
  - 両親とも `/privacy`、`/notice`、運営者情報は存在する。広告 Cookie、パーソナライズ広告、
    第三者配信、オプトアウト、問い合わせ先と実際の配信方式が一致するかを公開前に確認する。
  - 状態: `iniwach.com` の privacy / notice は公開文面を更新し、`no_ads: true` を設定して本番で
    loader が出ないことを確認済み。実際の広告配信開始前に account 設定との最終一致を再確認する。
- [ ] **【中】ads.txt の設置・更新手順を親サイト側へ記録する**
  - `ads.txt` はサイトルート配信が必要なためテーマでは持たない。`iniwach.com` には構造上の
    配置を確認済みで、広告を使わない `diary.iniwach.com` は現時点では不要。
  - publisher ID はこの公開リポジトリへ転記しない。将来 diary でも配信する場合の
    `subdomain=diary.iniwach.com` を含む手順は、親サイトの承認済み文書に記録する。
  - 状態: `iniwach.com/ADSENSE_PLAN.md` に照合手順を記録し、root URL の本番配信を確認済み。
    AdSense UI の snippet と status の最終照合はサイト承認後に行う。
- [ ] **【高】同意管理（CMP）または広告の地域制限を決定する**
  - 状態: EEA / UK / スイスには Google 認定 CMP を使う方針を決定して公開済み。サイト承認後、
    対象地域での3ボタン表示、TCF v2.3 の同意文字列、consent mode の実通信を確認する。
  - 決定と再開手順は `iniwach.com/ADSENSE_PLAN.md` に記録済み。テーマへ同意ロジックや地域判断を
    暗黙に組み込まない。

---

## 見送り（v2.0.0 / v2.1.0 のうち輸入しない項目）

- **AMP 削除・highlight.js 削除・BlogPosting 化・default.jpg 修正・apple-touch-icon 条件付き出力**:
  フォークで対応済み。
- **外部リンク render hook・twitter:site・404 ページ改善**: フォークで独自実装済み
  （`render-link.html` は sponsored 付与つき）。
- **robots.txt / llms.txt のテーマテンプレート追加**: 両親とも既存の static robots.txt を配信し、
  llms.txt の利用要件もない。親サイトが出力を明示的に採用するときに再検討する。
- **多言語（日本語ページの言語別 URL / hreflang）**: 両親サイトとも単一言語のため不要。
- **blockquote のデバイス間サイズ統一**: 現行差は desktop 14.4px / mobile 15px と小さく、
  実害が確認できないため不要。
- **短いヘッダー開閉 JS の外部ファイル化**: 現行はページ固有の小さなスクリプトで、
  追加リクエストとの交換になるため不要。
- **コードブロックの github-dark 統一・Chroma 用 `chroma.css`**: フォーク独自の
  ウィンドウ風コードブロックスタイルと競合するため見送り。
- **CI（actions-hugo@v3）**: 既存の `.github/workflows/test.yml` が最新の Hugo Extendedを取得し、
  `hugoBasicExample` を `--minify` でビルドしている。置換は CI 設計変更になるため除外する。

---

## 完了アーカイブ（2026-07-21）

### テンプレート・SEO

- [x] **【中】BreadcrumbList / WebSite の JSON-LD を追加する**
  - `website_json_ld.html` と `breadcrumb_json_ld.html` を追加し、home / single だけに安全な
    `dict` + `jsonify` 出力を行う。fixture と両親サイトの生成 JSON を検証した。
- [x] **【中】記事画像に `loading` / `decoding` と取得可能な実寸を追加する**
  - Markdown render hook、`img`、`img-view` を対応。既定 lazy、明示 eager、Page/Global Resource、
    query/fragment、SVG、Goldmark の追加属性を含む各経路を fixture で確認した。不要な派生画像生成も削減した。
- [x] **【中】OGP メタタグを強化する**
  - `og:locale`、記事日時、list 系 description / Twitter Card を既存分岐へ統合し、単一言語の
    hreflang は追加しなかった。両親サイトのビルドで出力を確認した。
- [x] **【低】Font Awesome CDN をインライン SVG に置き換える**
  - 使用アイコンを `icon.html` に集約し、外部 CDN を削除。アクセシブル名、`aria-hidden`、
    CC BY 4.0 帰属と変更表示を整備し、生成 HTML に旧 `<i>` / CDN が残らないことを確認した。
- [x] **【中】Disqus 呼び出しを現行 partial API へ移行する**
  - `_internal` template 呼び出しを `partial "disqus.html"` へ変更し、両親サイトでビルドした。
- [x] **【低】サイドバー partial を `partialCached` 化する**
  - ページ非依存の6 wrapper を言語variant付きでキャッシュし、template metrics で両サイトとも約98%の cache hitを確認した。
- [x] **【中】Hugo 0.146+ の新テンプレート構造へ移行する**
  - root layouts、`_markup`、`_partials`、`_shortcodes`、`taxonomy.html` へ移行し、pagination も
    partial API 化。旧 runtime path が残らず、両親サイトの全体ビルドが成功した。

### スタイル・アクセシビリティ

- [x] **【低】Google Fonts をオプション化し、システムフォントを既定にする**
  - 未設定時は stylesheet / gstatic preconnect を出さず、設定時だけ読み込む。`fontfamily` の
    上書きも含め fixture で両経路を確認した。
- [x] **【中】コントラスト、リンク下線、`:focus-visible`、タップターゲットを改善する**
  - variant ごとの操作色とリンク色を分離・調整。本文リンク、フォーカスリング、
    share / SNS の40pxターゲットを実装して両親サイトをビルドした。
- [x] **【中】モバイルのカード高さを可変化する**
  - 固定高と要約の切り詰めを解除し、旧疑似要素の省略記号も mobile で無効化した。

### バグ・不整合、保守性

- [x] **【低】`summary.html` の空 `with .Section` ブロックを削除する**
  - BOOKMARK の非表示方針を維持し、出力を持たないブロックだけを削除した。
- [x] **【低】`thumb-{{ .File.UniqueID }}` class の残骸を整理する**
  - 参照 CSS のない class を3テンプレートから削除し、ファイル起源でない Page の nil リスクも解消した。
- [x] **【低】`theme-color` をパラメータで上書き可能にする**
  - `Site.Params.theme_color` を追加し、未設定時の `#263238` を維持した。
- [x] **【低】`logofontfamily` をヘッダーのロゴにも適用する**
  - ヘッダーリンクに `.h-logo` を付与し、既存の動的 CSS を再利用した。
- [x] **【低】未使用の `single_meta.html` を削除する**
  - 参照を再確認して削除し、README の `[removed]` 表も同期した。
- [x] **【低】サムネイル解決ロジックを partial に共通化する**
  - `thumbnail.html` に Page Resource / static fallback を集約し、3テンプレートから利用する構成にした。
- [x] **【低】DRAFT ラベルの inline style を class 化する**
  - `.facts .draft` と variant 対応の `--color-draft` に統一した。
- [x] **【低】`latests.html` の既定50件を見直す**
  - `latests_count` 未設定時を10件に変更。明示設定済みの両親サイトの表示件数は維持した。
- [x] **【低】タクソノミーリンクの生成方法を統一する**
  - `GetTerms` / Page object / `RelPermalink` に統一し、文字列連結と余分な redirect を除去した。
- [x] **【低・条件付き】CSS 7ファイルを Hugo Pipes 管理に移行する**
  - 分割 source と順序を `assets/css/` に維持し、`resources.Concat`、minify、SHA-384 fingerprint、
    SRI 付きの1リクエストへ変更。生成 bundle と integrity の完全一致を検証した。

### アクセシビリティ・セキュリティ

- [x] **【中】`author.html` の SNS リンク属性とアクセシブル名を整備する**
  - 全SNS外部リンクを日本語 `aria-label` と `noopener nofollow` に統一し、装飾 SVG を読み上げ対象外にした。
- [x] **【中】`share.html` のクエリ組み立てに `urlquery` を通す**
  - title / URL を符号化し、`&` 等を含む fixture でパラメータ境界とアクセシブル名を確認した。
- [x] **【中】tip shortcode のキーボード操作を補完する**
  - Page path + source position 由来の一意 ID、`role="tooltip"`、`aria-describedby`、`aria-expanded`、
    hover / focus / click toggle / 外側 click / scroll / Escape を実装。Escape で focus を移動しない設計をレビューした。

### 広告設置準備（テーマ側）

- [x] **【中・条件付き】手動広告用 `layouts/_partials/ad.html` を新設する**
  - `page` / `slot` / `format` / 任意の `full_width` の dict 契約を実装。非本番、client 未設定、
    `no_ads: true`、page 欠落は完全な no-op、active 時だけ型・slot・format を検証する。
    active / inactive / error の fixture を確認した。
- [x] **【中・条件付き】広告枠の CLS 対策 CSS を用意する**
  - `<ins>` の `.ad-slot` と format modifier に幅100%および90px / 250px / 600pxの最小高を設定。
    固定高、loader、自動配置、実 ID は追加していない。

### 共通検証

- `git diff --check` を通過。
- `diary.iniwach.com`: standalone テーマを指定した `hugo` build が成功。
- `iniwach.com`: standalone テーマを指定した production + `--printPathWarnings` build が成功。
- パラメータ gate、JSON-LD、画像、font、share、tooltip、広告 partial、CSS SRI は一時 fixture で確認。
- 独立レビューで、両親互換、escaping、DOMPurify、SRI、外部 origin、旧 runtime path を再確認。

### 以前の完了項目

- [x] **【高】ページ単位の広告除外（`no_ads`）を実装する**（2026-07-21）
  - front matter の `no_ads: true` で AdSense head script を抑止し、未設定 / false の経路を維持した。
- [x] **【高】`<time datetime>` 属性を RFC 3339 形式に修正する**（2026-07-21）
  - Date / Lastmod を `2006-01-02T15:04:05Z07:00` に統一した。
- [x] **【中】`<html>` に `lang` 属性を追加する**（2026-07-21）
  - `.Site.Language.Locale` を root element に出力した。
- [x] **【低】`<meta charset>` の重複を解消する**（2026-07-21）
  - `baseof.html` の宣言を保持し、`meta.html` の重複だけを削除した。
- [x] **【中】AMP テンプレートの扱いを決める（削除）**（2026-07-07）
  - 未使用 AMP layouts / shortcode と SCSS selector を削除し、README を同期した。
- [x] **【中】`single_json_ld.html` の画像参照を `Site.Params` ベースに修正する**（2026-07-07）
  - Page Resources、publisher logo、default thumbnail の fallback を整備した。
- [x] **【低】`HUGO_ENV` 依存の DEV 分岐を現行ワークフローに合わせる**（2026-07-07）
  - GA は production、WordCount は non-production の `hugo.IsProduction` 分岐へ変更した。
- [x] **【低】pagination style の二重管理を解消する**（2026-07-07）
  - `.paging` を現在の `assets/css/pagination.css` に集約した。
- [x] **【低】`theme.toml` のメタデータを修正する**（2026-07-07）
  - homepage と Hugo `min_version` を現行リポジトリ / README に揃えた。
