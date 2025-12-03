/**
 * Memosローダー (複数コンテナ対応版)
 * 1. ページ内の ".memos-js-container" クラスを持つ要素をすべて探す
 * 2. 各コンテナの "data-limit" 属性を読み取る
 * 3. Workerに ?limit=... を付けて、Memosデータを取得
 * 4. 取得したデータをコンテナに挿入する
 */

// Workerのエンドポイント
const WORKER_URL = "https://memos-worker-iniwach.iniwaiwana.workers.dev/";

/**
 * Memosデータを取得してコンテナに挿入する非同期関数
 * @param {HTMLElement} container - 挿入先のDOM要素
 */
async function loadMemosForContainer(container) {
  // コンテナから data-limit 属性を取得 (なければデフォルト10件)
  const limit = container.dataset.limit || "10";
  
  // Workerに渡すURLを構築 (例: .../?limit=5)
  const fetchUrl = `${WORKER_URL}?limit=${encodeURIComponent(limit)}`;

  try {
    // 3. WorkersからMemosのデータを取得
    const response = await fetch(fetchUrl); 
    if (!response.ok) {
      throw new Error(`データの取得に失敗しました: ${response.status}`);
    }

    const memos = await response.json();
    
    if (memos.error) {
       throw new Error(memos.error);
    }

    // 4. データをHTMLに変換して流し込む
    if (memos && memos.length > 0) {
      container.innerHTML = ""; // 「読み込み中...」を消去
      
      if (typeof window.marked === 'undefined') {
        console.error("marked.js が読み込まれていません。");
        throw new Error("Markdownパーサーがありません。");
      }
      
      memos.forEach(memo => {
        // --- スタイル用の外枠 ---
        const memoElement = document.createElement("div");
        memoElement.className = "memo-item"; // (memos-style.css で定義したスタイル)

        // --- 本文 (Markdown) をレンダリング ---
        if (memo.content) {
          const contentDiv = document.createElement("div");
          contentDiv.className = "memo-content";
          contentDiv.innerHTML = window.marked.parse(memo.content); 
          memoElement.appendChild(contentDiv);
        }

        // --- 画像 (resources) をレンダリング ---
        if (memo.resources && memo.resources.length > 0) {
          const resourcesDiv = document.createElement("div");
          resourcesDiv.className = "memo-resources";

          memo.resources.forEach(resource => {
            if (resource.type && resource.type.startsWith("image/")) {
              const img = document.createElement("img");
              
              // 画像パスを構築 (例: "resources/c3Nn.../PXL...jpg")
              const imagePath = `${resource.name}/${resource.filename}`;
              
              // Workerに ?image_path=... を付けて画像リクエスト（プロキシ）
              img.src = `${WORKER_URL}?image_path=${encodeURIComponent(imagePath)}`;
              
              img.alt = resource.filename;
              img.style.maxWidth = "100%"; 
              img.style.borderRadius = "8px";
              img.style.marginTop = "8px";
              
              resourcesDiv.appendChild(img);
            }
          });
          memoElement.appendChild(resourcesDiv);
        }

        // --- 日付 ---
        const dateElement = document.createElement("small");
        dateElement.className = "memo-date";
        dateElement.innerText = new Date(memo.createdAt).toLocaleString('ja-JP');
        memoElement.appendChild(dateElement);

        container.appendChild(memoElement);
      });
    } else {
      // メモが0件の場合
      container.innerHTML = "<p>投稿はまだありません。</p>";
    }

  } catch (error) {
    // エラーが発生した場合
    console.error("Memosの読み込みエラー:", error.message, container);
    container.innerHTML = "<p>Memosの読み込みに失敗しました。</p>";
  }
}

// --------------------------------------------------
// メイン実行部
// --------------------------------------------------
// HTMLドキュメントが読み込まれたら、すべてのコンテナを探して実行
document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll(".memos-js-container");
  
  if (containers.length > 0) {
    containers.forEach(container => {
      loadMemosForContainer(container);
    });
  }
});