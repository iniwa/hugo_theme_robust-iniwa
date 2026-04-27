/**
 * Memos プロキシ Worker から取得した投稿をサイドバーに描画する。
 *
 * 依存:
 *   - window.marked       : Markdown -> HTML 変換 (memos.html で UMD ロード)
 *   - window.DOMPurify    : marked 出力の sanitize (XSS 対策)
 *
 * Worker 契約 (themes/robust-iniwa の Worker と対):
 *   - GET ?limit=N           -> JSON 配列 [{ name, content, createdAt, resources[] }]
 *   - GET ?image_path=PATH   -> 画像バイナリ
 *   - リクエスト時に X-Source-Url ヘッダーで現在ページの URL を送る
 */

(() => {
  // ------------------------------------------------------------
  // ユーティリティ
  // ------------------------------------------------------------

  /**
   * Memos の content (Markdown + Worker 側で改行を <br> 化済み) を
   * marked -> DOMPurify の順で処理し、安全な HTML 文字列にする。
   */
  function renderSafeHTML(markdownLike) {
    const rawHtml = window.marked.parse(markdownLike);
    return window.DOMPurify.sanitize(rawHtml);
  }

  /** 文字列を 1 行のメッセージとしてコンテナに描画 (textContent で XSS 防止) */
  function renderMessage(container, text, color) {
    container.replaceChildren();
    const p = document.createElement("p");
    p.style.textAlign = "center";
    if (color) p.style.color = color;
    p.textContent = text;
    container.appendChild(p);
  }

  /** エラー表示 (タイトル + 詳細) を textContent で安全に描画 */
  function renderError(container, title, detail) {
    container.replaceChildren();
    const p = document.createElement("p");
    p.style.color = "#d84315";

    const titleNode = document.createTextNode(title);
    const small = document.createElement("small");
    small.textContent = detail;

    p.appendChild(titleNode);
    p.appendChild(document.createElement("br"));
    p.appendChild(small);
    container.appendChild(p);
  }

  /** 必要な依存ライブラリが読み込まれているかチェック */
  function ensureDependencies(container) {
    if (typeof window.marked === "undefined") {
      console.error("marked が読み込まれていません。");
      renderMessage(container, "Markdown パーサーが見つかりません。", "#d84315");
      return false;
    }
    if (typeof window.DOMPurify === "undefined") {
      console.error("DOMPurify が読み込まれていません。");
      renderMessage(container, "Sanitizer が見つかりません。", "#d84315");
      return false;
    }
    return true;
  }


  // ------------------------------------------------------------
  // 描画
  // ------------------------------------------------------------

  /** 1 件のメモを DOM 要素として組み立てる */
  function buildMemoElement(memo, workerUrl) {
    const item = document.createElement("div");
    item.className = "memo-item";

    // 本文 (Markdown) を sanitize して挿入
    if (memo.content) {
      const contentDiv = document.createElement("div");
      contentDiv.className = "memo-content";
      contentDiv.innerHTML = renderSafeHTML(memo.content);
      item.appendChild(contentDiv);
    }

    // 添付画像 (Memos resources のうち image/* のみ)
    if (Array.isArray(memo.resources) && memo.resources.length > 0) {
      const resourcesDiv = document.createElement("div");
      resourcesDiv.className = "memo-resources";

      memo.resources.forEach((resource) => {
        if (!resource.type || !resource.type.startsWith("image/")) return;

        const img = document.createElement("img");
        // Memos v1 API の path 形式: resources/{id}/{filename}
        const imagePath = `${resource.name}/${resource.filename}`;
        img.src = `${workerUrl}?image_path=${encodeURIComponent(imagePath)}`;
        img.alt = resource.filename || "image";
        img.loading = "lazy";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        img.style.marginTop = "8px";
        resourcesDiv.appendChild(img);
      });

      if (resourcesDiv.children.length > 0) {
        item.appendChild(resourcesDiv);
      }
    }

    // 投稿日時 (端末ローカルの日本時間表記)
    if (memo.createdAt) {
      const date = document.createElement("small");
      date.className = "memo-date";
      date.textContent = new Date(memo.createdAt).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      item.appendChild(date);
    }

    return item;
  }


  // ------------------------------------------------------------
  // メイン
  // ------------------------------------------------------------

  /** Worker から取得して container に描画 */
  async function loadMemos(container, workerUrl) {
    if (!ensureDependencies(container)) return;

    renderMessage(container, "読み込み中...", "#888");

    const limit = container.dataset.limit || "50";
    const fetchUrl = `${workerUrl}?limit=${encodeURIComponent(limit)}`;

    try {
      const response = await fetch(fetchUrl, {
        method: "GET",
        headers: { "X-Source-Url": window.location.href },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const memos = await response.json();
      if (memos && memos.error) {
        throw new Error(memos.error);
      }

      if (!Array.isArray(memos) || memos.length === 0) {
        renderMessage(container, "投稿はまだありません。");
        return;
      }

      container.replaceChildren();
      memos.forEach((memo) => container.appendChild(buildMemoElement(memo, workerUrl)));
    } catch (error) {
      console.error("Memos の読み込みエラー:", error);
      renderError(container, "読み込みに失敗しました。", error.message);
    }
  }


  // エントリポイント
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("memos-sidebar");
    if (!container || !container.dataset.url) return;
    loadMemos(container, container.dataset.url);
  });
})();
