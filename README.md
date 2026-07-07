# robust-iniwa

[Robust](https://github.com/dim0627/hugo_theme_robust) (by Daisuke Tsuji) を個人用にフォーク・改造した Hugo テーマです。  
個人用途の機能を多分に搭載していますが、`Site.Params` 未設定のものは自動で無効化されるためそのままでも動作します。

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
  latests_count     = 50                         # サイドバー LATESTS の表示件数（未設定なら 50）
  og_worker_url     = ""                          # Satori Workers の URL を入れると OGP 画像を動的生成
  adsense_client_id = ""                          # 設定すると本番ビルド時のみ AdSense スクリプトを <head> に挿入
  dateformat        = "2006/01/02"
  googlefonts       = "https://fonts.googleapis.com/css2?..."
  fontfamily        = "'Quicksand', 'Zen Maru Gothic', sans-serif"
  logofontfamily    = "'Quicksand', sans-serif"
  favicon           = "images/favicon.ico"
  apple_touch_icon  = ""                          # 未設定なら author.thumbnail を使用
  theme_variant     = "garden"                   # data-theme 属性。CSS の variant 切替に利用
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

色を変えたい場合は `static/css/variables.css` を編集してください。  
フッターには `/notice` と `/privacy` への固定リンクがあります。それぞれ `content/notice.md` / `content/privacy.md` を用意してください。

---

## 上流 (Robust) からの変更点

`dim0627/hugo_theme_robust` をベースに、以下を改変しています。

### レイアウト・テンプレート

| 種別 | ファイル | 内容 |
|:---|:---|:---|
| `[mod]` | `layouts/_default/baseof.html` | サイドバー構成を全面差替（archives / categories / latests / memos）、`data-theme` 属性、Cloudflare Pages 等の自前 CSS 分割（variables/layout/content/pagination/grid/tip/memos）、スクロール連動ヘッダー JS、Umami 連携、フッターに Notice/Privacy リンク追加。highlight.js / `custom.css` / `Site.Copyright` 周りのデッドコードを削除 |
| `[mod]` | `layouts/_default/list.html` | 内部 `_internal/pagination.html` への切替、Page Bundles 対応のサムネイル取得ロジック追加、Lastmod 表示追加、c6 グリッド化 |
| `[mod]` | `layouts/_default/summary.html` | サムネイルの Page Resources 解決を追加、シェアボタンを記事下部のみに整理 |
| `[mod]` | `layouts/_default/li_sm.html` | サムネイルの Page Resources 解決を追加 |
| `[mod]` | `layouts/_default/single.html` | `single_meta.html` 呼び出しを `single_json_ld.html` 中心に整理 |
| `[mod]` | `layouts/404.html` | 「トップへ戻る」「最新の記事 5 件」を表示する独自 404 |
| `[mod]` | `layouts/partials/meta.html` | OGP/Twitter Card を home/page/その他で分岐、`description` の自動フォールバック (Summary 160 文字)、Page Bundles 対応の OG 画像解決、Satori Workers (`og_worker_url`) 経由の動的 OG 画像、AdSense `<head>` snippet 注入、FontAwesome v6.7.2 ロード、`favicon.ico` と実在する `apple-touch-icon` の `<link>` |
| `[mod]` | `layouts/partials/author.html` | Author サムネを `/about_me` リンク化、Twitter → X アイコン、mail/Twitch/YouTube アイコンを追加 |
| `[mod]` | `layouts/partials/latests.html` | 表示件数を固定 10 件 → `Site.Params.latests_count` (default 50) で可変化 |
| `[mod]` | `layouts/partials/share.html` | Pocket と Hatena→Twitter の順を整理、Twitter アイコンを X に更新 |
| `[mod]` | `layouts/partials/single_json_ld.html` | `NewsArticle` → `BlogPosting`、`description`・`author` 等のフィールド整備、URL を `Permalink` に修正。Page Bundles 対応の画像解決、`Site.Params` ベースの publisher logo / 既定サムネイル参照を追加 |
| `[new]` | `layouts/_default/_markup/render-link.html` | 外部リンクを `target="_blank" rel="noopener"` で開く。Amazon/Rakuten 等のアフィリエイト系ドメインには `rel="sponsored"` を自動付与 |
| `[new]` | `layouts/partials/archives.html` | `archives` taxonomy をサイドバーに表示 |
| `[new]` | `layouts/partials/memos.html` | `Site.Params.memos_url` を設定すると Memos (セルフホスト) のメモをサイドバーに表示 |
| `[new]` | `layouts/partials/umami.html` | `Site.Params.umami.website_id` を設定すると Umami Analytics スクリプトを挿入 |
| `[new]` | `layouts/shortcodes/accordion.html` | `<details>` ベースの折りたたみ |
| `[new]` | `layouts/shortcodes/img-view.html` | 画像をグリッドで並べる。WebP 自動生成・列数指定対応 |
| `[new]` | `layouts/shortcodes/tip.html` | ホバーで注釈を出すツールチップ |
| `[new]` | `layouts/sitemap.xml` | `/tags/` `/categories/` `/archives/` `/_draft/` を sitemap から除外 |
| `[removed]` | `layouts/partials/custom.css` | `static/css/*.css` に分離したため削除 |
| `[removed]` | `layouts/_default/baseof.amp.html` / `layouts/_default/single.amp.html` / `layouts/shortcodes/img.amp.html` | 親サイトで AMP 出力を行っていないため削除 |

### CSS / アセット

| 種別 | ファイル | 内容 |
|:---|:---|:---|
| `[mod]` | `assets/styles.scss` | コンテナ幅 68rem→76rem、グリッド比率 c4/c8 を 33/66→30/70、コードブロックフォント調整、リストスタイル変更、その他細部 |
| `[mod]` | `assets/author.scss` | Author サムネのホバーアニメーション (拡大+透明)、影と角丸を全体 12px に統一 |
| `[new]` | `static/css/variables.css` | 色・サイズの CSS 変数。`theme_variant` ごとの切替もここ |
| `[new]` | `static/css/layout.css` | レイアウト・ヘッダー・サイドバー・フッター |
| `[new]` | `static/css/content.css` | 記事本文の見出し・テーブル等 |
| `[new]` | `static/css/pagination.css` | ページネーション |
| `[new]` | `static/css/grid.css` | `img-view` のグリッド |
| `[new]` | `static/css/tip.css` | `tip` ショートコード用ツールチップ |
| `[new]` | `static/css/memos-style.css` | Memos サイドバー用 |
| `[new]` | `static/js/load-memos.js` | Memos 取得・描画 |
| `[new]` | `static/js/tooltip.js` | `tip` ショートコードの動作 |

### 機能サマリ
 - HTML テンプレートでのデザイン変更（シェアボタン整理、更新日表示、archives taxonomy 等）
 - CSS ファイルの棲み分け（色指定の変数化、マウスホバー、テーマバリアント）
 - ショートコード追加（accordion / img-view / tip）
 - サイドバー追従スクロール
 - ページネーションを Hugo 内蔵 partial に切替
 - OGP の改善（Page Bundles 対応・Satori Workers 連携）
 - Memos / Umami の表示
 - 外部リンクの新規タブ＆affiliate sponsored 自動付与
 - AdSense `<head>` snippet 注入
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

## 以下オリジナル README

This theme is maintained by [Ress](https://github.com/ress997).

# What is this.

This is the grid based theme for Hugo.

[Hugo :: A fast and modern static website engine](https://gohugo.io/)

**You need the Hugo `extended` version.**

## PC View

![screenshot](https://raw.githubusercontent.com/dim0627/hugo_theme_robust/master/images/screenshot.png)

## SP View(Responsive)

![screenshot](https://raw.githubusercontent.com/dim0627/hugo_theme_robust/master/images/responsive.png)

# Features

* Responsive design
* Google Analytics
* Thumbnail
* Share button
* Structured data(Article and Breadcrumb)
* Twitter cards
* OGP
* Disqus
* Syntax Highlight
* Show `IsDraft`.

## Installation

```
$ cd themes
$ git clone https://github.com/dim0627/hugo_theme_robust.git
```

[Hugo \- Installing Hugo](http://gohugo.io/overview/installing/)

# Development mode

Supported development mode.

```
env HUGO_ENV="DEV" hugo server --watch --buildDrafts=true --buildFuture=true -t robust
```

This mode is

* Not show Google Analytics tags.
* Show `WordCount`.

And set `{{ if ne (getenv "HUGO_ENV") "DEV" }} Set elements here. {{ end }}` if you want to place only in a production environment.
