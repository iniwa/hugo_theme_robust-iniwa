/* ツールチップ制御用スクリプト (フォーカス解除対応版) */
document.addEventListener('DOMContentLoaded', () => {
  const tooltips = document.querySelectorAll('.tooltip');

  // 1. ツールチップをクリックした時の動作
  tooltips.forEach(tip => {
    tip.addEventListener('click', (e) => {
      e.stopPropagation(); // 親への伝播を止める

      const isOpen = tip.classList.contains('show');
      
      // 他をすべて閉じる
      closeAllTooltips();

      // もともと開いていなければ開く
      if (!isOpen) {
        tip.classList.add('show');
        adjustPosition(tip);
      }
    });
  });

  // 2. 画面のどこかをクリックしたら閉じる
  document.addEventListener('click', () => {
    closeAllTooltips();
  });

  // 3. スクロールしたら閉じる
  // (capture: true にすることで、ページ内部のあらゆるスクロールを検知)
  window.addEventListener('scroll', () => {
    closeAllTooltips();
  }, { capture: true, passive: true });

  // --- 関数定義 ---

  function closeAllTooltips() {
    // すべてのツールチップから .show を外す
    tooltips.forEach(t => t.classList.remove('show'));

    // 【修正点】フォーカスも強制的に外す
    // これをしないと、クリック後に :focus CSSが効いたままになり消えません
    if (document.activeElement && document.activeElement.classList.contains('tooltip')) {
      document.activeElement.blur();
    }
  }

  // 表示位置の自動調整
  function adjustPosition(target) {
    const tooltipText = target.querySelector('.tooltip-text');
    if (!tooltipText) return;

    // 一旦リセット
    tooltipText.style.left = '50%';
    tooltipText.style.transform = 'translateX(-50%)';
    tooltipText.style.right = 'auto';

    // 画面端の判定
    const rect = tooltipText.getBoundingClientRect();
    const padding = 10;

    // 左にはみ出す場合
    if (rect.left < padding) {
      tooltipText.style.left = '0';
      tooltipText.style.transform = 'translateX(-10%)'; 
    } 
    // 右にはみ出す場合
    else if (rect.right > window.innerWidth - padding) {
      tooltipText.style.left = 'auto';
      tooltipText.style.right = '0';
      tooltipText.style.transform = 'translateX(10%)';
    }
  }
});