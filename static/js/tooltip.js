/* [mod] hover/focus/click で開き、外側クリック・スクロール・Escape で閉じる */
document.addEventListener('DOMContentLoaded', () => {
  const tooltips = document.querySelectorAll('.tooltip');

  tooltips.forEach(tip => {
    let wasOpenOnPointerDown = null;

    // [mod] focusin が click より先に発火しても、押下前の状態を基準にトグルする。
    tip.addEventListener('pointerdown', () => {
      wasOpenOnPointerDown = tip.classList.contains('show');
    });

    tip.addEventListener('pointercancel', () => {
      wasOpenOnPointerDown = null;
    });

    tip.addEventListener('click', event => {
      event.stopPropagation();
      const wasOpen = wasOpenOnPointerDown === null
        ? tip.classList.contains('show')
        : wasOpenOnPointerDown;
      wasOpenOnPointerDown = null;

      closeAllTooltips();
      if (!wasOpen) openTooltip(tip);
    });

    tip.addEventListener('focusin', () => openTooltip(tip));

    tip.addEventListener('mouseenter', () => openTooltip(tip));

    tip.addEventListener('mouseleave', () => {
      if (!tip.contains(document.activeElement)) closeTooltip(tip);
    });

    tip.addEventListener('focusout', event => {
      if (!tip.contains(event.relatedTarget)) closeTooltip(tip);
    });

  });

  // [mod] hover だけで開いた場合も Escape で閉じ、フォーカスは変更しない。
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const hasOpenTooltip = Array.from(tooltips).some(tip => tip.classList.contains('show'));
    if (!hasOpenTooltip) return;
    event.preventDefault();
    event.stopPropagation();
    closeAllTooltips();
  }, { capture: true });

  // tooltip の外側をクリックしたらすべて閉じる。
  document.addEventListener('click', () => {
    closeAllTooltips();
  });

  // ページ内部を含むスクロールを検知してすべて閉じる。
  window.addEventListener('scroll', () => {
    closeAllTooltips();
  }, { capture: true, passive: true });

  function openTooltip(target) {
    closeAllTooltips(target);
    target.classList.add('show');
    target.setAttribute('aria-expanded', 'true');
    // [mod] show を付けた後に表示位置を計算する。
    adjustPosition(target);
  }

  function closeTooltip(target) {
    target.classList.remove('show');
    target.setAttribute('aria-expanded', 'false');
  }

  function closeAllTooltips(except = null) {
    tooltips.forEach(tip => {
      if (tip !== except) closeTooltip(tip);
    });
  }

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
