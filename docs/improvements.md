# プログラム改善チェックリスト

コードベースを調査して洗い出した改善候補の一覧（2026-07-07 調査）。
2026-07-16 に上流 [zzzmisa/hugo_theme_robust](https://github.com/zzzmisa/hugo_theme_robust/releases) の
v2.0.0 / v2.1.0 リリースを調査し、輸入候補を追記した。
2026-07-21 に現行コード、両親サイトの設定・生成結果、Hugo 0.160.1 での互換性を再確認し、
必要性・優先度・対応案を更新した。

**運用方法**: 着手する項目を選び、Codex が `AGENTS.md` の Model and Role Policy と
Handoff Workflow に従って、必要なら親サイト側の `docs/handoffs/` に承認済みスコープを
記録する。実装、検証、レビューが完了した項目だけを `[x]` にして「完了アーカイブ」へ移す。

- 優先度: **高** = 実バグ・公開ポリシー・法令/プラットフォーム要件に直結 /
  **中** = SEO・アクセシビリティ・保守性に実益 / **低** = 効果が限定的または任意。
- ベースライン (2026-07-07): 親サイト 2 つ（`diary.iniwach.com` / `iniwach.com`）とも
  `hugo v0.160.1` でビルド成功・警告 0 件。
- テーマ実装の承認は commit、push、または親サイトの submodule pointer 更新を許可しない。
  delivery と各親サイトの pointer 更新には、それぞれ明示的な承認が必要（`AGENTS.md` 参照）。

---

## 1. テンプレート・SEO（上流 v2.0.0 由来）

- [ ] **【中】BreadcrumbList / WebSite の JSON-LD を追加する**
  - 上流は `layouts/_partials/breadcrumb_json_ld.html` / `website_json_ld.html` を新設。
    フォーク側は BlogPosting（`single_json_ld.html`）のみ。
  - 対応案: 上流 2 partial を輸入し、記事ページに BreadcrumbList、トップに WebSite を出力。
    既存の `single_json_ld.html`（独自差替済み）とはファイルを分けたまま共存できる。
- [ ] **【中】記事画像に `loading="lazy"` / `decoding="async"` を付与する**（上流 v2.1.0）
  - 現状: フォークには `render-image.html` フックがなく、`img.html` shortcode にも lazy 指定なし。
  - 対応案: 上流の `layouts/_markup/render-image.html` を輸入し、
    `shortcodes/img.html` / `img-view.html` にも同属性を追加する。可能な画像には `width` /
    `height` も出力し、LCP 候補だけ `loading="eager"` に切り替えられる逃げ道を用意する。
- [ ] **【中】OGP メタタグの強化（og:locale / article:published_time / article:modified_time）**
  - フォークの `meta.html` は全面差替済みのため上流ファイルの丸ごと輸入は不可。
    上記 3 タグ（＋リストページの OGP 補完）だけを既存の IsHome / IsPage 分岐に選択的に移植する。
  - hreflang 対応は両親サイトとも単一言語のため見送り。
- [ ] **【低】Font Awesome CDN をインライン SVG（`icon.html` partial）に置き換える**
  - 上流は FA CDN を廃止し `layouts/_partials/icon.html`（Free 6.7.2 / CC BY 4.0）でインライン化。
    外部 CDN 依存・SRI ハッシュ管理・レンダリングブロックが消える。
  - フォークの使用箇所: `meta.html`（CDN ロード）、`list.html` / `summary.html` / `li_sm.html`
    （fa-calendar / fa-sync）、`share.html` ほか。使用アイコンの棚卸しが必要で作業量は中程度。
- [ ] **【中】Disqus 呼び出しを現行 partial API へ移行する**
  - 現状: `single.html` は旧 `{{ template "_internal/disqus.html" . }}` を使用している。
    両親サイトとも Disqus を設定しているため、上流どおり削除するとコメント機能が退行する。
  - 対応案: Hugo の現行 API `{{ partial "disqus.html" . }}` へ移行し、両親で出力を確認する。
- [ ] **【低】サイドバー partial を `partialCached` 化する**（上流 v2.0.0）
  - `baseof.html` の archives / tags / categories / latests はページ非依存のためキャッシュ可能。
    ただし、まず `--templateMetrics` で効果を測定し、言語・セクション等のキャッシュ variant を
    明示できる partial だけを対象にする。`author.html` / `memos.html` は別途確認する。
- [ ] **【中】Hugo 0.146+ の新テンプレート構造へ移行する**（上流 v2.0.0）
  - 上流は `layouts/_default/` → `layouts/`、`partials/` → `_partials/`、
    `shortcodes/` → `_shortcodes/` へ移行済み。旧構造は当面動くが将来の deprecation 対策。
  - pagination / Disqus の内部テンプレート呼び出しや taxonomy / term lookup も併せて棚卸しする。
    全ファイル移動を伴うため、単独スライスで両親の全ページ種別を回帰確認する。

## 2. スタイル・アクセシビリティ（上流 v2.1.0 由来）

- [ ] **【低】Google Fonts をオプション化し、システムフォントスタックを既定にする**
  - 現状: `baseof.html:17-21` は `params.googlefonts` 未設定時に Roboto Slab を**強制ロード**。
    上流は未設定時ロードなし＋システムフォント（Hiragino / Yu Gothic / Meiryo）既定に変更。
  - 対応案: else 側のフォールバックロードを削除し、`styles.scss` の font-family 既定を
    システムフォントスタックへ。`meta.html:13` の fonts.gstatic preconnect も googlefonts
    設定時のみ出力に連動させる。両親は現在フォントを明示設定しているため既存表示は変わらないが、
    未設定経路もサンプルサイトで確認する。
- [ ] **【中】アクセシビリティ CSS の選択的輸入（コントラスト / リンク下線 / :focus-visible / タップターゲット）**
  - 上流: リンク色を WCAG AA（4.6:1）の `#1976d2` に調整、本文リンクに下線、
    `:focus-visible` のフォーカスリング、シェア・SNS アイコンを 40px 化。
  - フォークは CSS を `static/css/*.css` に分割済みのため、該当ルールを
    `variables.css` / `content.css` / `layout.css` へ選択的に移植する。実測では garden の
    accent が約 4.4:1 と境界未満、tech は約 2.2:1 と明確に不足するため、variant ごとに調整する。
- [ ] **【中】モバイルのカード高さを可変化する**
  - 固定高と truncation の組合せで文字量・画面幅によって情報が欠けるため、上流の可変高実装を
    フォークの `styles.scss` / `layout.css` と突き合わせて選択的に移植する。

## 3. 見送り（v2.0.0 / v2.1.0 のうち輸入しない項目）

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
- **コードブロックの github-dark 統一・Chroma 用 `chroma.css`**: フォーク独自のウィンドウ風コードブロックスタイルと競合するため見送り。
- **CI（actions-hugo@v3）**: 既存の `.github/workflows/test.yml` が最新のHugo Extendedを
  取得し、`hugoBasicExample`を `--minify` でビルドしている。置換はCI設計の変更になるため、
  上流機能の単純輸入対象から除外する。

## 4. 独自調査での改善候補（2026-07-16 調査・上流とは無関係）

### 4.1 バグ・不整合

- [ ] **【低】`summary.html` の空 `with .Section` ブロックを削除する**
  - `summary.html` に `{{ with .Section }}{{ end }}` が空のまま残っている。履歴上、記事本文では
    BOOKMARK を意図的に非表示化しているため、表示の復元はせず無効な空ブロックだけを削除する。
- [ ] **【低】`thumb-{{ .File.UniqueID }}` クラスの残骸を整理する**
  - `list.html` / `summary.html` / `li_sm.html` のサムネイルはインライン style 化済みで、
    `thumb-<UniqueID>` クラスを参照する CSS はもう存在しない（生成 CSS 方式の名残）。
  - 併せて `.File` はファイル起源でないページで nil になり得るため、クラスを消さない場合は
    `with .File` ガードが必要。
- [ ] **【低】`theme-color` をパラメータで上書き可能にする**
  - `meta.html:20` の `<meta name="theme-color" content="#263238">` がハードコードで、
    `variables.css` の garden / tech 配色と一致していない。ただし variant と自動連動すると
    CSS 側との二重管理になるため、既定値は互換性のため維持し、`Site.Params.theme_color` だけ
    上書き可能にする。
- [ ] **【低】`logofontfamily` をヘッダーのロゴにも適用する**
  - 動的 CSS は `.h-logo` を対象にするが、ヘッダーのロゴリンクに同 class がなく、現状は
    フッターにしか効かない。既存 class を追加して両親の設定値が意図どおり反映されるようにする。

### 4.2 保守性・クリーンアップ

- [ ] **【低】未使用の `single_meta.html` を削除する**
  - `single.html` からの呼び出しは削除済みで、どのテンプレートからも参照されていない。
    中身も `default.png` 参照など古い実装のまま。削除して README の変更点表を更新する。
- [ ] **【低】サムネイル解決ロジックを partial に共通化する**
  - Page Resources → static パスのフォールバック処理が `list.html` / `summary.html` /
    `li_sm.html` の 3 箇所にコピペされている。`partials/thumb.html`（または returns 付き
    partial）に集約し、`▼▼▼ 修正箇所` 形式のコメントも `[mod]` 形式に揃える。
- [ ] **【低】DRAFT ラベルのインラインスタイルを class 化する**
  - `style="color: #2196f3;"` が上記 3 テンプレートに重複。`.facts .draft` などの class にして
    色は `variables.css` のカスタムプロパティへ。
- [ ] **【低】`latests.html` の既定 50 件を見直す**
  - サイドバーの LATESTS が未設定時 50 件描画され、全ページの DOM とビルド量を膨らませている。
    テーマ既定は 5〜10 件程度に下げ、多く出したいサイトだけ `latests_count` で増やす。
    両親は diary=5 / iniwach=50 を明示済みのため、既定変更による現行表示への影響はない。
- [ ] **【低】タクソノミーリンクの生成方法を統一する**
  - `taxonomy.html:5` / `summary.html:58,62` / `terms.html:13` が `BaseURL` の文字列連結で
    URL を組み立てており、末尾スラッシュも不統一（リダイレクトが 1 回挟まる）。
    Hugo の page object（`.GetTerms` / `.RelPermalink`）を使う方式へ統一する。

### 4.3 パフォーマンス

- [ ] **【低・条件付き】static CSS 7 ファイルを Hugo Pipes 管理に移行する**
  - `variables.css` ほか 7 ファイルが個別の render-blocking リクエストで、fingerprint がなく
    キャッシュバスティングも効かない。一方、合計は約 15 KB（非圧縮）で HTTP/2・HTTP/3 の
    7→1 リクエスト削減効果は未実証。まず計測し、必要なら分割ソースを保ったまま
    `resources.Concat` + `minify` + `fingerprint` で配信する。
  - split-CSS 維持は durable rule のため、構造変更は別途設計承認を得て単独スライスにする。

### 4.4 アクセシビリティ・セキュリティ

- [ ] **【中】`author.html` の SNS リンク属性とアクセシブル名を整備する**
  - mail / Twitch / YouTube（`author.html:19-21`）は `target="_blank"` なのに `noopener` がなく、
    アイコンに `aria-hidden` もない。全エントリを `rel="noopener nofollow"` +
    `aria-hidden="true"` + リンク自体への `aria-label`（例: "X アカウント"）で統一する。
  - 背景画像だけで表示している著者サムネイルにも、リンク側へ著者名を含むアクセシブル名を付ける。
- [ ] **【中】`share.html` のクエリ組み立てに `urlquery` を通す**
  - `.Title` がそのままクエリ文字列に入っており、`&` 等を含むタイトルでパラメータが壊れる。
    `{{ .Title | urlquery }}` / `{{ .Permalink | urlquery }}` に変更し、各ボタンへ
    `aria-label` も付与する。
- [ ] **【中】ツールチップ（tip shortcode）のキーボード操作を補完する**
  - `tooltip.js` はクリックとフォーカスのみで Esc キーで閉じられない。keydown（Escape）対応と、
    `tooltip-text` への `role="tooltip"`、一意な ID とトリガー側 `aria-describedby` を追加する。
    Escape で閉じてもトリガーから不要にフォーカスを奪わないことを確認する。

## 5. 広告（Google AdSense）設置準備

将来的に AdSense 等の広告を設置する想定での事前整備。head スニペット注入
（`meta.html` の `adsense_client_id`、本番ビルド限定）とページ単位の `no_ads` gate は実装済み。
方式選定や広告枠追加より先に、親サイト側のポリシー・同意管理を整える。
- [ ] **【中】広告方式を段階検証する（親サイト側）**
  - 上記の前提を整えた後、まず広告を利用する `iniwach.com` だけで Auto ads を小さく試し、
    レイアウト・Core Web Vitals・収益性を確認する。手動枠は Auto ads で制御できない配置が
    必要になった場合だけ実装する。`diary.iniwach.com` への展開は別判断とする。
  - サイト固有の方式・審査・公開判断は親リポジトリの `ADSENSE_PLAN.md` に記録し、
    テーマ側には共通パラメータと安全な既定動作だけを置く。
- [ ] **【中・条件付き】手動広告用 partial（`partials/ad.html`）を新設する**
  - `adsense_client_id` 設定時 + 本番ビルド時のみ `<ins class="adsbygoogle">` を出力する
    partial を作り、スロット ID・フォーマットは必須引数で渡す。`no_ads`、未設定、非本番の
    各経路では何も出力せず、必要な `adsbygoogle.push` も partial 側で一貫して扱う。
  - 設置候補: (1) 記事本文直下（`summary.html` の share の上）、(2) 記事一覧のカード間
    （`list.html` の n 件おき）、(3) サイドバー（`baseof.html` の partial 列）。
- [ ] **【中・条件付き】広告枠の CLS（レイアウトシフト）対策 CSS を用意する**
  - 広告コンテナに `min-height` を予約する `.ad-slot` クラスを `layout.css` /
    `variables.css` に追加し、読み込み前後でカードやサイドバーがガタつかないようにする。
    手動広告を採用しない場合は不要。
- [ ] **【高】プライバシーポリシー・運営者情報の内容を再監査する（親サイト側）**
  - 両親とも `/privacy` / `/notice` / 運営者情報は既に存在するため、新規ページ作成は不要。
    広告 Cookie、パーソナライズ広告、第三者配信、オプトアウト、問い合わせ先の記載と、
    実際の配信方式との一致を広告開始前に再確認する。
  - 現在の `iniwach.com/privacy/` は `no_ads` 未設定で広告 script が残るため、親リポジトリの
    承認済み handoff で front matter を設定する。
  - フッターのパラメータ化は現状不要。サイト固有の文面や判断はテーマではなく親側で管理する。
- [ ] **【中】ads.txt の設置手順を記録する（テーマ外・親サイト側作業）**
  - `ads.txt` はサイトルート配信が必要なためテーマでは持たず、公開リポジトリにも publisher ID を
    転記しない。`iniwach.com` は設置済み、広告を使わない `diary.iniwach.com` は現時点で不要。
  - 将来 diary サブドメインでも広告を配信する場合は、ルートドメイン側 ads.txt の
    `subdomain=diary.iniwach.com` を含む運用を親サイト handoff で確認する。
- [ ] **【高】同意管理（CMP）または広告の地域制限を決定する**
  - EEA / UK / スイスで Google 広告を配信する場合、Google 認定の TCF CMP 対応が必要。
    TCF v2.3 対応期限（2026-03-01）は経過済みのため、広告公開前の必須判断として扱う。
  - CMP を導入しない場合は対象地域への広告配信を制限する。親サイト固有の選択と設定は
    `ADSENSE_PLAN.md` に記録し、テーマ側へ同意ロジックを暗黙に組み込まない。

---

## 完了アーカイブ

- [x] **【高】ページ単位の広告除外（`no_ads`）を実装する**（2026-07-21）
  - 対応: front matter の `no_ads: true` で既存 AdSense head script を抑止し、未設定・`false`、
    非本番、client ID 未設定の既存経路は維持した。README に使用方法と `[mod]` 記録を追加した。
  - 検証: 一時ページで `true` は script 0 件、未設定・`false` は各 1 件を確認し、
    standalone テーマを使った両親サイトのビルドも成功した。
- [x] **【高】`<time datetime>` 属性を RFC 3339 形式に修正する**（2026-07-21）
  - 対応: `list.html` / `summary.html` の Date・Lastmod と `li_sm.html` の Date を
    `2006-01-02T15:04:05Z07:00` に統一し、`JST` リテラルと誤った `2007` layout を解消した。
  - 検証: standalone テーマを使って両親サイトをビルドし、生成された 1,236 個の
    `datetime` が HTML デコード後にすべて RFC 3339 形式であることを確認した。
- [x] **【中】`<html>` に `lang` 属性を追加する**（2026-07-21）
  - 対応: Hugo 0.158 で追加された `.Site.Language.Locale` を使い、root 要素へ `lang` を出力した。
  - 検証: 両親サイトの生成 HTML 127 ファイルすべてが `lang="ja-jp"` を持つことを確認した。
- [x] **【低】`<meta charset>` の重複を解消する**（2026-07-21）
  - 対応: `baseof.html` の先頭側を保持し、`meta.html` の重複宣言だけを削除した。
  - 検証: 両親サイトの生成 HTML 127 ファイルすべてで charset 宣言が 1 個であることを確認した。
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
