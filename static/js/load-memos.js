/* 追加ファイル */

/**
 * Memosデータを取得してコンテナに挿入する非同期関数
 * @param {HTMLElement} container - 挿入先のDOM要素
 * @param {string} workerUrl - データ取得先のWorker URL
 */
async function loadMemosForContainer(container, workerUrl) {
  // ローディング表示
  container.innerHTML = '<p style="text-align:center; color:#888;">読み込み中...</p>';

  // コンテナから data-limit 属性を取得 (なければデフォルト50件)
  const limit = container.dataset.limit || "50";
  
  // Workerに渡すURLを構築
  const fetchUrl = `${workerUrl}?limit=${encodeURIComponent(limit)}`;

  try {
    // 1. WorkersからMemosのデータを取得
    // 現在のページのURLを取得
    const currentUrl = window.location.href;

    const response = await fetch(fetchUrl, {
      method: "GET",
      // 👇 ここに特製ヘッダーを追加！
      headers: {
        "X-Source-Url": currentUrl
      }
    });
    if (!response.ok) {
      throw new Error(`データの取得に失敗しました: ${response.status}`);
    }

    const memos = await response.json();
    
    if (memos.error) {
       throw new Error(memos.error);
    }

    // 2. データをHTMLに変換して流し込む
    if (memos && memos.length > 0) {
      container.innerHTML = ""; // ローディング表示を消去
      
      // marked.js の存在確認
      if (typeof window.marked === 'undefined') {
        console.error("marked.js が読み込まれていません。");
        container.innerHTML = "<p>Markdownパーサーが見つかりません。</p>";
        return;
      }
      
      memos.forEach(memo => {
        // --- スタイル用の外枠 ---
        const memoElement = document.createElement("div");
        memoElement.className = "memo-item"; // memos-style.css のクラス

        // --- 本文 (Markdown) をレンダリング ---
        if (memo.content) {
          const contentDiv = document.createElement("div");
          contentDiv.className = "memo-content";
          // marked.parse を使用してHTMLに変換
          contentDiv.innerHTML = window.marked.parse(memo.content); 
          memoElement.appendChild(contentDiv);
        }

        // --- 画像 (resources) をレンダリング ---
        if (memo.resources && memo.resources.length > 0) {
          const resourcesDiv = document.createElement("div");
          resourcesDiv.className = "memo-resources";

          memo.resources.forEach(resource => {
            // 画像タイプのみ処理
            if (resource.type && resource.type.startsWith("image/")) {
              const img = document.createElement("img");
              
              // 画像パスを構築 (Memos v1 APIの構造に準拠)
              // 例: resources/xxxx.../filename.jpg
              const imagePath = `${resource.name}/${resource.filename}`;
              
              // Workerに ?image_path=... を付けて画像リクエスト（プロキシ経由）
              img.src = `${workerUrl}?image_path=${encodeURIComponent(imagePath)}`;
              
              img.alt = resource.filename || "image";
              img.loading = "lazy"; // 遅延読み込み
              
              // スタイル (CSSファイル側でも調整可能ですが、念のため)
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
        // 日付フォーマットの調整 (例: 2025/12/01 12:34)
        dateElement.innerText = new Date(memo.createdAt).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        memoElement.appendChild(dateElement);

        // コンテナに追加
        container.appendChild(memoElement);
      });
    } else {
      // メモが0件の場合
      container.innerHTML = "<p>投稿はまだありません。</p>";
    }

  } catch (error) {
    // エラーが発生した場合
    console.error("Memosの読み込みエラー:", error);
    container.innerHTML = `<p style="color:#d84315;">読み込みに失敗しました。<br><small>${error.message}</small></p>`;
  }
}

// --------------------------------------------------
// メイン実行部
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // HTML側 (memos.html) で指定したIDを取得
  const container = document.getElementById('memos-sidebar');
  
  // コンテナが存在しない、またはURL設定がない場合は何もしない
  if (!container || !container.dataset.url) return;

  // HTMLの data-url 属性からURLを取得
  const MEMOS_URL = container.dataset.url; 

  // 読み込み関数を実行
  loadMemosForContainer(container, MEMOS_URL);
});