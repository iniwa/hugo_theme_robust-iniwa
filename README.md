[Robust](https://github.com/dim0627/hugo_theme_robust)というテーマをアレンジしました。  

**AIを利用してコードを書いてもらっています。**  

変更した箇所にはコメントアウトを入れてるつもりですが、抜けがあるかもしれません。  

このテーマを利用する際は、config.tomlに  
```toml
[taxonomies]
tag = "tags"
archive = "archives"

[params]
  theme_variant = "garden"   # もしくは`tech`。色を変数で指定しています。
```
を追加してください。  
色を変えたい場合は`static/css/variables.css`で良い感じにできると思います。  



## 変更点
 - htmlファイルによるデザインの変更
   - シェアボタンの削減
   - 更新日付の表示
   - archivesの追加（taxonomies）
 - cssファイルの棲み分け･編集
   - マウスホバーの実装
   - その他cssによるデザイン変更
   - 色指定を変数に
 - shortcodeの実装
   - アコーディオンの実装
   - 画像のタイル表示
   - 注釈のポップアップ表示
 - サイドバーが付いてくる･独立してスクロール
 - ページネーションの実装
 - OGPの改善

## 各Shortcodeの使い方  
### アコーディオン  
```md
{{< accordion title="ここをクリックして展開" >}}  
ここに文章を入力  
{{< /accordion >}}  
```

### 画像のグリッド表示  
記事の`index.md`と同じ階層に画像ファイルを保存して使う。  
```html
{{< img-view
  "sample1.JPEG"
  "sample2.JPEG"
  "sample3.JPEG"
 >}}
```

### 注釈のポップアップ表示  
```md
 これは {{< tip "ここにポップアップで出る注釈を書きます" >}}ポップアップの対象になる文章{{< /tip >}} です。  
```

## 参考にした記事様  
[zzzmisa's blog : HugoのテーマRobustのカスタマイズver3](https://blog.zzzmisa.com/customize_hugo_theme3/)  
[syocky tech blog : Hugoテーマ「Robust」をカスタマイズする](https://syocky.netlify.app/blog/2019/09/21/customize-hugo-robust/)  
[親方の徒然なる日々 : HugoでFontAwesomeを使用してみた。](https://blog.oyakata-life.net/hugo-site-use-font-awesome-icon/)  
[gkzz.dev : アコーディオンメニューをHugoで作った](https://gkzz.dev/posts/accordion-menu-hugo/)  
[テストウフ : Hugoのブログにページネーションを追加した](https://yoshikiito.net/blog/archives/add-pagination-to-hugo/)  
[TelBouzu's Blog : HugoのRobustでfaviconとかAdsenseの登録とか](https://telbouzu.com/how2hugo2/)  
[OLD SUNSET DAYS : Hugoでrobots.txtとsitemap.xmlを作る](https://hugo-de-blog.com/hugo-sitemap/)  
[アロハル ： HUGOでmeta descriptionなどのmetaタグを最適化する方法](https://aloha-ru.com/hugo/hugo-metadata/)  
[k-kazがHugoで遊ぶサイト : Hugoで外部サイトを新しいタブで開きたい。](https://k-kaz-git.github.io/post/hugo-alink/)  
[五里霧中 : GridレイアウトをCSSを利用したものに変更しました](https://blog.ast.moe/blog/2023-02-27/)



以下オリジナルREADME
---

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

* [Accelerated Mobile Pages Project](https://www.ampproject.org/) a.k.a AMP supported
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

# `config.toml` example

```
baseurl = "https://example.com/"
title = "SiteTitle"
theme = "hugo_theme_robust"

[services]
  [services.disqus]
    shortname = ''
  [services.googleAnalytics]
    id = 'UA-XXXXXXXX-XX' # Optical

[params]
description = "This is site description"
dateformat = "Jan 2, 2006" # Optional
# Fonts settings.
googlefonts = "https://fonts.googleapis.com/css?family=Lobster|Lato:400,700" # Optional, Include google fonts.
fontfamily = "Lato,YuGothic,'Hiragino Kaku Gothic Pro',Meiryo,sans-serif" # Optional, Override body font family.
logofontfamily = "Lobster, cursive" # Optional, Override logo font.

enableHighlight = true # highlight.js option

[params.author]
thumbnail = "images/author.jpg"
name = "John Doe"
description = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p><p>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
facebook = "https://www.facebook.com/daisuke.tsuji.735"
twitter = "https://twitter.com/dim0627"
github = "https://github.com/dim0627"

[outputs]
page = [ "HTML", "AMP" ] # if you want AMP enable.
```

# Frontmatter example

```
+++
date = "2016-09-28T17:00:00+09:00"
title = "Article title here"
thumbnail = "images/thumbnail.jpg" # Optional, referenced at `$HUGO_ROOT/static/images/thumbnail.jpg`
toc = true # Optional
+++
```

# Shortcodes

## Image

```
{{< img src="images/image.jpg" w="600" h="400" >}}
{{< img src="images/image.jpg" w="600" h="400" caption="Referenced from wikipedia." href="https://en.wikipedia.org/wiki/Lorem_ipsum" >}}
```

![screenshot](https://raw.githubusercontent.com/dim0627/hugo_theme_robust/master/images/include-images.png)

# Development mode

Supported development mode.

```
env HUGO_ENV="DEV" hugo server --watch --buildDrafts=true --buildFuture=true -t robust
```

This mode is

* Not show Google Analytics tags.
* Show `WordCount`.

And set `{{ if ne (getenv "HUGO_ENV") "DEV" }} Set elements here. {{ end }}` if you want to place only in a production environment.

