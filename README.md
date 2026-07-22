# robust-iniwa

[Robust](https://github.com/dim0627/hugo_theme_robust) (by Daisuke Tsuji) を個人用にフォーク・改造した Hugo テーマです。  
個人用途の機能を多分に搭載していますが、`Site.Params` のオプション設定は、未設定時に機能を無効化するか、このREADMEに記載した安全な既定値へフォールバックします。

**AI を併用してコードを書いています。** 変更箇所には可能な限りコメントで `[mod]`, `[new]`, `[removed]` マーカーを入れていますが、抜けがあるかもしれません。  
見つけた場合は遠慮なく PR / Issue へ。

---

## サンプル `config.toml`

`config/production/config.toml` の例。Hugo 0.158+ の deprecation 対応済みフォーマットです。

```toml
baseURL = "https://example.com/"
defaultContentLanguage = "ja"
title = "サンプルサイト"
theme = "robust-iniwa"

hasCJKLanguage = true
enableRobotsTXT = false  # 自前の static/robots.txt を使う場合は false

[languages]
  [languages.ja]
    locale = "ja-jp"
    label = "Japanese"
    weight = 1

[pagination]
  pagerSize = 10

[taxonomies]
  tag = "tags"
  archive = "archives"  # 独自タクソノミー（年月別アーカイブ用）

[params.author]
  thumbnail      = "images/profile/Author.png"
  name           = "sample"
  description    = "ひとことプロフィール"   # ⚠ HTML としてそのまま展開されます (上流仕様)。信頼できる文字列のみ書くこと。<p>...</p> 等のタグも使えます
  twitter        = "https://twitter.com/sample"
  twitter_handle = "@sample"
  YouTube        = "https://www.youtube.com/@sample"
  Twitch         = "https://www.twitch.tv/sample"
  mail           = "https://docs.google.com/forms/sample"

[params]
  description       = "サイト説明"
  latests_count     = 10                         # サイドバー LATESTS の表示件数（未設定なら 10）
  og_worker_url     = ""                          # commit manifest がない場合に使う動的 OGP fallback
  adsense_client_id = ""                          # 設定すると本番ビルド時のみ AdSense スクリプトを <head> に挿入
  dateformat        = "2006/01/02"
  googlefonts       = "https://fonts.googleapis.com/css2?..." # 設定時のみ読み込み。未設定なら system font
  fontfamily        = "'Quicksand', 'Zen Maru Gothic', sans-serif"
  logofontfamily    = "'Quicksand', sans-serif"
  favicon           = "images/favicon.ico"
  apple_touch_icon  = ""                          # 未設定なら実在する author.thumbnail を使用。どちらもなければ出力しない
  theme_variant     = "garden"                   # data-theme 属性。CSS の variant 切替に利用
  theme_color       = ""                          # <meta name="theme-color"> の値。未設定なら "#263238"
  memos_url         = ""                          # Memos セルフホストの URL を入れるとサイドバーに統合表示

[params.umami]
  website_id = ""
  script_url = ""

[outputs]
  home = [ "HTML", "RSS" ]
  page = [ "HTML" ]

[services]
  [services.disqus]
    shortname = 'disqus-ID'
  [services.googleAnalytics]
    id = 'G-XXXXXXXXXX'

[markup]
  [markup.highlight]
    noClasses = true
    style = 'monokai'
    lineNumbersInTable = true
    tabWidth = 4

  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true   # YouTube 埋め込み等を残すために必要
```

`googlefonts` を未設定または空にすると外部フォントと `fonts.gstatic.com` の preconnect は出力せず、
日本語向けのシステムフォントスタックを使用します。`fontfamily` を設定した場合は、その値が優先されます。

### 事前生成 OGP

親サイトの data/ogp_manifest.json に schemaVersion 1 のcommit manifestが存在する場合、記事の og:image と twitter:image はmanifest内のcanonical permalinkに対応するimmutable R2 URLを使います。manifestが存在するのに記事entryやHTTPS URLが不正な場合は、Hugo buildを停止します。

manifestがない通常のローカルbuildでは、og_worker_url、記事thumbnail、既定画像の順による従来のfallbackを維持します。これによりPages設定を切り替える前と、切り戻し時にも既存Workerを利用できます。

親サイトはcatalog専用output formatで layouts/home.ogpcatalog.json を呼び出します。このtemplateはproductionの通常pageをgenerator catalogへ変換します。Hugoの仕様上、build.list: neverのpageは全page collectionから除外されるため、親サイトのconfig/ogp-catalog.tomlでparams.ogp_catalog_page_refsに明示します。Page Resourceはcontent配下、通常のthumbnail/imageはstatic配下のローカルPNG/JPEGとして解決し、外部background URLはbuild errorにします。

catalog outputはGitea workflow内だけでHUGO_OUTPUTS_HOMEを上書きして有効化し、通常のPages buildには含めません。Cloudflare Pagesでは、次のbuild commandを使用します。

    node themes/robust-iniwa/scripts/build-pages.mjs

build gateが必要とする環境変数は次のとおりです。

- CF_PAGES_COMMIT_SHA: Pagesが自動設定
- OGP_PUBLIC_BASE_URL: R2 custom domainのHTTPS origin
- HUGO_VERSION=0.160.1
- NODE_VERSION=22.18.0

build gateは同じcommit SHAのmanifests/v1/<sha>.jsonを最大10分待ちます。取得したJSONのcommit、generator digest、全image key、fingerprint、公開origin、UTF-8、response sizeを検証し、一時data fileを置いてproduction Hugo buildを実行した後に削除します。R2 API credentialはPagesへ渡しません。

依存なしのmanifest gate testは次で実行します。

    node --test scripts/build-pages.test.mjs

ページ単位で AdSense を表示しない場合は、コンテンツの front matter に `no_ads: true` を指定します。

```yaml
---
title: 広告なしのページ
no_ads: true
---
```

### 広告 partial の使用契約（準備中）

`layouts/_partials/ad.html` は広告枠の準備用 partial です。現時点ではどのテンプレートからも呼び出さず、実際の client ID / slot ID もテーマには記載しません。将来の呼出し側は `dict` で `page`、`slot`、`format`、任意の `full_width` を渡す契約です。

次のゲートをすべて満たす場合だけ active になります。

- `page` が存在する
- 本番ビルドである
- `page.Site.Params.adsense_client_id` が未設定でも空でもない
- `page.Params.no_ads` が有効でない

ゲートが inactive の場合は完全に空を返し、引数検証もしません。active の場合だけ、数字だけの文字列 `slot` と `format`（`auto` / `horizontal` / `vertical` / `rectangle`）を必須とし、不正値は `errorf` でビルドを止めます。任意の `full_width` は bool のみを受け付け、既定値は `true` です。値は Hugo の自動エスケープに任せ、`safeHTML` / `safeURL` は使用しません。

active 時の出力は `.adsbygoogle.ad-slot` の `<ins>` と、その直後の push script を各1個だけです。任意 class / HTML / script は受け取りません。AdSense loader は既存の条件付き head snippet に任せ、partial 自体は外部 origin を追加しません。`assets/css/layout.css` の format modifier が 90px / 250px / 600px の予約高を持ち、広告読込時の CLS を抑えます。

色を変えたい場合は `assets/css/variables.css` を編集してください。

フッターには `/notice` と `/privacy` への固定リンクがあります。それぞれ `content/notice.md` / `content/privacy.md` を用意してください。

---

## 上流 (Robust) からの変更点

`dim0627/hugo_theme_robust` をベースに、以下を改変しています。

### レイアウト・テンプレート

Hugo 0.146+ の lookup 構造に合わせ、通常のレイアウトは `layouts/` 直下、テンプレート内 partial は `layouts/_partials/`、shortcode は `layouts/_shortcodes/`、markup は `layouts/_markup/` に配置しています。論理的な partial / shortcode 呼出し名は従来どおりです。

| 種別 | ファイル | 内容 |
|:---|:---|:---|
| `[mod]` | `layouts/baseof.html` | Hugo 0.146+ のルート layout 構造へ移行。サイドバー構成を全面差替（archives / categories / latests / memos）、`data-theme` 属性、分割 CSS source を1本へ配信、スクロール連動ヘッダー JS、Umami 連携、フッターに Notice/Privacy リンク追加。ルート `<html lang="{{ .Site.Language.Locale }}">`、charset の保持位置を baseof.html に統一。author / archives / tags / categories / latests / memos の6 partial を `partialCached` で出力。Google Fonts は設定時だけ読み込み、未設定時は system font。ヘッダーロゴのリンクに `h-logo` class を付与し `logofontfamily` を適用可能に。highlight.js / `custom.css` / `Site.Copyright` 周りのデッドコードを削除。home のみ `website_json_ld.html`（WebSite JSON-LD）を `<head>` に出力 |
| `[mod]` | `layouts/list.html` | Hugo 0.146+ の現行 `pagination.html` partial へ切替、`_partials/thumbnail.html` 経由のサムネイル解決、Date / Lastmod の `datetime` Format を `2006-01-02T15:04:05Z07:00` に統一、Lastmod 表示追加、日付・更新・セクションのアイコンをローカル SVG 化、DRAFT 色を共通 class 化、c6 グリッド化 |
| `[mod]` | `layouts/summary.html` | `_partials/thumbnail.html` 経由のサムネイル解決、Date / Lastmod の `datetime` Format を `2006-01-02T15:04:05Z07:00` に統一、日付・更新アイコンをローカル SVG 化、DRAFT 色を共通 class 化、シェアボタンを記事下部のみに整理、空の `with .Section` ブロックを削除、記事フッターのタクソノミーリンクを `GetTerms`/Page object ベースに統一 |
| `[mod]` | `layouts/li_sm.html` | `_partials/thumbnail.html` 経由のサムネイル解決、Date の `datetime` Format を `2006-01-02T15:04:05Z07:00` に修正、日付・セクションのアイコンをローカル SVG 化、DRAFT 色を共通 class 化 |
| `[mod]` | `layouts/taxonomy.html` | `terms.html` を Hugo 0.146+ の taxonomy page layout へ移行（`term.html` は作成しない）。タクソノミー見出しリンクを `BaseURL` の文字列連結から `Data.Terms.Alphabetical` の Page object ベースへ変更 |
| `[mod]` | `layouts/single.html` | `single_meta.html` 呼び出しを `single_json_ld.html` / `breadcrumb_json_ld.html` 中心に整理。Disqus を旧 `{{ template "_internal/disqus.html" . }}` から現行 `{{ partial "disqus.html" . }}` API へ移行（未設定時は embedded partial の安全な既定動作） |
| `[mod]` | `layouts/404.html` | 「トップへ戻る」「最新の記事 5 件」を表示する独自 404 |
| `[mod]` | `layouts/_partials/meta.html` | OGP/Twitter Card を home/page/その他で分岐、commit manifest存在時はcanonical permalinkに対応するimmutable R2 URLを必須使用し、不完全なmanifestでbuildを停止。manifest未配置時はSatori Workers (`og_worker_url`) / 記事画像へfallback。`description` の自動フォールバック (Summary 160 文字 → `Site.Params.description` → `Site.Title`)、Page Bundles 対応の OG 画像解決、`adsense_client_id` 設定時かつ本番ビルド時の AdSense `<head>` snippet 注入（ページの `no_ads: true` で抑制）、Font Awesome CDN を廃止してローカル SVG 化、Google Fonts 用 preconnect を設定時だけ出力、`favicon.ico` と実在する `apple-touch-icon` の `<link>`、baseof.html と重複していた charset を削除、`theme-color` を `Site.Params.theme_color` で上書き可能に（既定値は維持）。全ページ共通の `og:locale`（`Site.Language.Locale` のみを使用し deprecated な `Lang` フォールバックは廃止。ハイフン/アンダースコアを正規化し、ASCII 英字2文字または数字3桁の region のみを採用、4文字の script subtag は region とみなさず、region が判定できない場合はタグを省略）、記事ページの `article:published_time` / `article:modified_time`、list/section/taxonomy/term ページの description・Twitter Card を追加 |
| `[new]` | `layouts/home.ogpcatalog.json` | productionの通常pageと`params.ogp_catalog_page_refs`で明示した`build.list: never`のpageからschemaVersion 1の事前生成catalogを出力。Page Resourceとstatic画像をrepository相対pathへ解決し、外部background URLを拒否 |
| `[new]` | `layouts/_partials/ad.html` | `page` / `slot` / `format` の dict 契約による広告枠。production、client ID 非空、`no_ads` 無効時だけ `.ad-slot`、`<ins>`、push script を各1個出力し、inactive 時は完全な no-op。active 時だけ必須引数を検証し、loader の追加や自動配置は行わない |
| `[mod]` | `layouts/_partials/author.html` | Author サムネを `/about_me` リンク化、Twitter → X、mail/Twitch/YouTube エントリを追加。全アイコンをローカル SVG 化し、リンクへ日本語のアクセシブル名と `noopener nofollow` を付与 |
| `[mod]` | `layouts/_partials/latests.html` | 表示件数を固定 10 件 → `Site.Params.latests_count` (default 10) で可変化 |
| `[mod]` | `layouts/_partials/share.html` | Pocket と Hatena→Twitter の順を整理し、Twitter アイコンを X に更新。動的クエリ値を `urlquery` で符号化し、日本語のアクセシブル名とローカル SVG を使用 |
| `[mod]` | `layouts/_partials/single_json_ld.html` | `NewsArticle` → `BlogPosting`、`description`・`author` 等のフィールド整備、URL を `Permalink` に修正。Page Bundles 対応の画像解決、`Site.Params` ベースの publisher logo / 既定サムネイル参照を追加。文字列手組みの JSON を廃止し、`dict` を1回 `jsonify | safeJS` する構成に変更（タイトル・説明中の `</script>` や引用符・`&` でも script 境界が壊れない） |
| `[mod]` | `layouts/_partials/taxonomy.html` | サイドバーのタクソノミーリンクを `BaseURL` の文字列連結から `ByCount` エントリの Page object ベースへ変更 |
| `[mod]` | `layouts/_partials/categories.html` / `layouts/_partials/tags.html` / `layouts/_partials/archives.html` | `taxonomy.html` 呼び出しから不要になった `baseurl` を削除 |
| `[new]` | `layouts/_markup/render-link.html` | 外部リンクを `target="_blank" rel="noopener"` で開く。Amazon/Rakuten 等のアフィリエイト系ドメインには `rel="sponsored"` を自動付与 |
| `[new]` | `layouts/_markup/render-image.html` | Markdown 画像を Page Resource / グローバル Resource から解決できる場合は `RelPermalink` を使用し、Hugo が画像メタデータを取得できる対応形式のみ実寸の `width` / `height` を出力。`loading`（既定 lazy）と `decoding="async"` を付与し、`eager_images` または Goldmark 属性で LCP 候補を eager に変更可能。テーマ管理属性との重複を避けつつ、`class` / `id` 等のその他の Goldmark 属性も保持 |
| `[mod]` | `layouts/_shortcodes/img.html` | 既存の src / caption / href / class / w / h を維持し、名前付き `loading` は lazy/eager のみ受け付けて既定 lazy、`decoding="async"` を追加 |
| `[new]` | `layouts/_partials/archives.html` | `archives` taxonomy をサイドバーに表示 |
| `[new]` | `layouts/_partials/memos.html` | `Site.Params.memos_url` を設定すると Memos (セルフホスト) のメモをサイドバーに表示 |
| `[new]` | `layouts/_partials/umami.html` | `Site.Params.umami.website_id` を設定すると Umami Analytics スクリプトを挿入 |
| `[new]` | `layouts/_partials/thumbnail.html` | `list.html` / `summary.html` / `li_sm.html` に重複していたサムネイル解決ロジックを共通化。Page Resources 一致時は `RelPermalink`、未一致時は `relURL`、未設定時は空文字列を返す |
| `[new]` | `layouts/_partials/icon.html` | Font Awesome Free 6.7.2 の使用アイコンをインライン SVG として提供し、外部 CDN・SRI 管理を不要化。SVG アイコンは Fonticons, Inc. による CC BY 4.0（[公式ソース](https://github.com/FortAwesome/Font-Awesome/tree/6.7.2/svgs)、[ライセンス](https://fontawesome.com/license/free)）。path data と viewBox は未変更で、インライン Hugo template 用に wrapper、class、fill、アクセシビリティ属性を変更 |
| `[new]` | `layouts/_partials/website_json_ld.html` | home のみ `WebSite` JSON-LD（`@context`/`@type`/`name`/`url`/`description`）を出力。`SearchAction` は含めない |
| `[new]` | `layouts/_partials/breadcrumb_json_ld.html` | single のみ `BreadcrumbList` JSON-LD を出力。`.Ancestors.Reverse`（Home→親の順）に現ページを加えて `position` 1..N を採番し、`name` は `LinkTitle`（未設定なら `Title`）、`item` は `Permalink` |
| `[new]` | `layouts/_shortcodes/accordion.html` | `<details>` ベースの折りたたみ |
| `[new]` | `layouts/_shortcodes/img-view.html` | 画像をグリッドで並べる。WebP 自動生成・列数指定対応 |
| `[mod]` | `layouts/_shortcodes/img-view.html` | 通常画像 / WebP、実寸、列数、リンク動作を維持し、`loading="lazy" decoding="async"` を追加。未使用だったモバイル用の2種類の派生画像生成を削除 |
| `[new]` | `layouts/_shortcodes/tip.html` | ページ内で一意な `role="tooltip"` と `aria-describedby` を持ち、hover / focus / click で表示して Escape でフォーカスを動かさず閉じるツールチップ |
| `[new]` | `layouts/sitemap.xml` | `/tags/` `/categories/` `/archives/` `/_draft/` を sitemap から除外 |
| `[removed]` | `layouts/partials/custom.css` | `assets/css/*.css` に分離したため削除 |
| `[removed]` | `layouts/partials/single_meta.html` | どのテンプレートからも参照されなくなったため削除（`single_json_ld.html` に一本化） |
| `[removed]` | `layouts/_default/baseof.amp.html` / `layouts/_default/single.amp.html` / `layouts/shortcodes/img.amp.html` | 親サイトで AMP 出力を行っていないため削除 |

### CSS / アセット

| 種別 | ファイル | 内容 |
|:---|:---|:---|
| `[mod]` | `assets/styles.scss` | コンテナ幅 68rem→76rem、グリッド比率 c4/c8 を 33/66→30/70、system font の既定化、モバイルカードの固定高と要約切り詰めの解除、コードブロックフォント調整、リストスタイル変更、インライン SVG の共通表示、シェア操作を 40px 四方に統一、その他細部 |
| `[mod]` | `assets/author.scss` | Author サムネのホバーアニメーション (拡大+透明)、影と角丸を全体 12px に統一、SNS 操作を 40px 四方に統一 |
| `[new]` | `assets/css/variables.css` | 色・サイズの CSS 変数。variant ごとの WCAG AA 対応色と広告枠の最小高さ (`--ad-slot-min-height`) もここ |
| `[new]` | `assets/css/layout.css` | レイアウト・ヘッダー・サイドバー・フッター、`:focus-visible`、DRAFT、広告枠 `.ad-slot` の幅100%・最小高さ |
| `[new]` | `assets/css/content.css` | 記事本文の見出し・テーブル、および本文リンクだけの下線 |
| `[new]` | `assets/css/pagination.css` | ページネーション |
| `[new]` | `assets/css/grid.css` | `img-view` のグリッド |
| `[new]` | `assets/css/tip.css` | `tip` ショートコード用ツールチップ。表示状態は JavaScript の `.show` class に一本化 |
| `[new]` | `assets/css/memos-style.css` | Memos サイドバー用 |
| `[new]` | `static/js/load-memos.js` | Memos 取得・描画 |
| `[new]` | `static/js/tooltip.js` | hover / focus / click、外側クリック、スクロール、Escape に対応する `tip` ショートコードの動作 |

上記7つの CSS は分割 source と順序を維持し、Hugo Pipes で結合・minify・SHA-384 fingerprint を行い、SRI 付きの1ファイルとして配信します。

### 機能サマリ
 - HTML テンプレートでのデザイン変更（シェアボタン整理、更新日表示、archives taxonomy 等）
 - CSS ファイルの棲み分け（色指定の変数化、マウスホバー、テーマバリアント）
 - ショートコード追加（accordion / img-view / tip）
 - サイドバー追従スクロール
 - ページネーションを Hugo 内蔵 partial に切替
 - OGP の改善（Page Bundles 対応・Satori Workers 連携）
 - Memos / Umami の表示
 - 外部リンクの新規タブ＆affiliate sponsored 自動付与
 - AdSense `<head>` snippet 注入（`adsense_client_id` 設定時・本番ビルド時。ページごとの `no_ads: true` で抑制可）
 - 独自 404 ページ

---

## 各 Shortcode の使い方

### アコーディオン

```md
{{</* accordion title="ここをクリックして展開" */>}}
ここに文章を入力
{{</* /accordion */>}}
```

### 画像のグリッド表示

記事の `index.md` と同じ階層に画像ファイルを保存して使う。先頭の数値で列数を指定可能（デフォルト 3）。

```md
{{</* img-view
  "sample1.JPEG"
  "sample2.JPEG"
  "sample3.JPEG"
*/>}}

{{</* img-view 2
  "wide1.JPEG"
  "wide2.JPEG"
*/>}}
```

### Markdown 画像と `img` ショートコードの読み込み制御

Markdown 画像は既定で `loading="lazy" decoding="async"` になります。ページの front matter に
`eager_images` をリストで指定すると、Markdown の destination と**完全一致**する画像だけを
`loading="eager"` にできます。画像リソースを解決でき、かつ Hugo が画像メタデータを取得できる
対応形式の場合だけ、実寸の `width` / `height` も出力します。

```yaml
---
eager_images:
  - "images/hero.jpg"
---
```

Markdown 画像の属性で `loading` を指定する場合は Goldmark の attributes を有効にしてください。
`loading` は `lazy` または `eager` の完全一致だけを受け付け、その他の値は無視します。

```toml
[markup.goldmark.parser]
  wrapStandAloneImageWithinParagraph = false
  [markup.goldmark.parser.attribute]
    block = true
```

```md
![ヒーロー画像](images/hero.jpg)
{loading=eager}
```

`img` ショートコードも `loading="lazy"` が既定で、`loading="eager"` を指定できます。
`decoding="async"` は常に出力されます。

```md
{{</* img src="images/hero.jpg" caption="ヒーロー画像" loading="eager" */>}}
```

### 注釈のポップアップ表示

```md
これは {{</* tip "ここにポップアップで出る注釈を書きます" */>}}ポップアップの対象になる文章{{</* /tip */>}} です。
```

---

## 参考にした記事

 - [zzzmisa's blog : HugoのテーマRobustのカスタマイズver3](https://blog.zzzmisa.com/customize_hugo_theme3/)
 - [syocky tech blog : Hugoテーマ「Robust」をカスタマイズする](https://syocky.netlify.app/blog/2019/09/21/customize-hugo-robust/)
 - [親方の徒然なる日々 : HugoでFontAwesomeを使用してみた。](https://blog.oyakata-life.net/hugo-site-use-font-awesome-icon/)
 - [gkzz.dev : アコーディオンメニューをHugoで作った](https://gkzz.dev/posts/accordion-menu-hugo/)
 - [テストウフ : Hugoのブログにページネーションを追加した](https://yoshikiito.net/blog/archives/add-pagination-to-hugo/)
 - [TelBouzu's Blog : HugoのRobustでfaviconとかAdsenseの登録とか](https://telbouzu.com/how2hugo2/)
 - [OLD SUNSET DAYS : Hugoでrobots.txtとsitemap.xmlを作る](https://hugo-de-blog.com/hugo-sitemap/)
 - [アロハル ： HUGOでmeta descriptionなどのmetaタグを最適化する方法](https://aloha-ru.com/hugo/hugo-metadata/)
 - [k-kazがHugoで遊ぶサイト : Hugoで外部サイトを新しいタブで開きたい。](https://k-kaz-git.github.io/post/hugo-alink/)
 - [五里霧中 : GridレイアウトをCSSを利用したものに変更しました](https://blog.ast.moe/blog/2023-02-27/)

---

## インストール

Hugo Extended 0.158.0 以上が必要です。Git submoduleとして導入する場合は、
利用するHugoサイトのルートで次を実行します。

```shell
git submodule add -b master https://github.com/iniwa/hugo_theme_robust-iniwa.git themes/robust-iniwa
```

サイト設定ではテーマ名を指定します。

```toml
theme = "robust-iniwa"
```

## 開発と検証

このテーマ単独ではコンテンツを持たないため、プレビューとサイトビルドは
利用するHugoサイトのルートから実行します。

```shell
hugo server --environment development --watch --buildDrafts --buildFuture
```

このフォークの変更では、`git diff --check`に加え、`diary.iniwach.com`で
`hugo`、`iniwach.com`で
`hugo --environment production --printPathWarnings`を実行します。表示や操作に
影響する場合は、該当する親サイトで`hugo server -D`を起動して確認します。

事前生成OGPの変更では、上記に加えて
`node --test scripts/build-pages.test.mjs`を実行します。

GitHub Actionsはpushとpull request時に、最新のHugo Extendedと
`hugoBasicExample`を使って`--minify`ビルドを実行します。

上流テーマの原文READMEと履歴は
[`dim0627/hugo_theme_robust`](https://github.com/dim0627/hugo_theme_robust)
を参照してください。
