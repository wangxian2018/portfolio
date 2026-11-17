(() => {
  'use strict';

  const dialog = document.querySelector('#project-dialog');
  const closeButton = dialog.querySelector('.dialog-close');
  const scrollArea = dialog.querySelector('.dialog-scroll');
  let returnTarget = null;
  let savedScrollY = 0;
  let pointerStartedOutside = false;

  function bindImageFallbacks(root) {
    root.querySelectorAll('.image-shell img').forEach((img) => {
      const showFallback = () => {
        const shell = img.closest('.image-shell');
        shell.classList.add('image-failed');
        const fallback = shell.querySelector('.image-fallback');
        if (fallback) fallback.hidden = false;
      };
      img.addEventListener('error', showFallback, { once: true });
      if (img.complete && img.naturalWidth === 0) showFallback();
    });
  }

  function openProject(trigger) {
    if (dialog.open) return;
    const template = document.getElementById(`project-${trigger.dataset.project}`);
    if (!template) return;

    const content = template.content;
    document.querySelector('#detail-title').textContent = content.querySelector('h3').textContent;
    document.querySelector('#detail-number').textContent = content.querySelector('[data-number]').textContent;
    document.querySelector('#detail-category').textContent = content.querySelector('[data-category]').textContent;
    document.querySelector('#detail-description').textContent = content.querySelector('[data-description]').textContent;
    document.querySelector('#detail-image').replaceChildren(content.querySelector('.image-shell').cloneNode(true));
    document.querySelector('#detail-tools').replaceChildren(...Array.from(content.querySelectorAll('li'), (li) => li.cloneNode(true)));
    bindImageFallbacks(dialog);

    returnTarget = trigger;
    savedScrollY = window.scrollY;
    document.body.classList.add('dialog-open');
    dialog.showModal();
    scrollArea.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
  }

  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', () => openProject(card));
  });

  closeButton.addEventListener('click', () => dialog.close());

  // 原生 modal 会隔离背景，但浏览器的反向 Tab 仍可能进入浏览器界面。
  // 在关闭按钮和可滚动内容之间显式循环，让键盘焦点始终可见。
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const atFirst = document.activeElement === closeButton;
    const atLast = document.activeElement === scrollArea;
    const outside = !dialog.contains(document.activeElement);
    if (event.shiftKey && (atFirst || outside)) {
      event.preventDefault();
      scrollArea.focus({ preventScroll: true });
    } else if (!event.shiftKey && (atLast || outside)) {
      event.preventDefault();
      closeButton.focus({ preventScroll: true });
    }
  });

  // 只有手势从遮罩开始并在遮罩结束时关闭，避免拖选说明时误关。
  function isOutside(event) {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  dialog.addEventListener('pointerdown', (event) => {
    pointerStartedOutside = event.target === dialog && isOutside(event);
  });
  dialog.addEventListener('click', (event) => {
    if (pointerStartedOutside && event.target === dialog && isOutside(event)) dialog.close();
    pointerStartedOutside = false;
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    pointerStartedOutside = false;
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    returnTarget?.focus({ preventScroll: true });
    returnTarget = null;
  });

  bindImageFallbacks(document);
})();
