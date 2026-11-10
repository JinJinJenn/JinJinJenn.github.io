(() => {
  'use strict';
  const links = [...document.querySelectorAll('[data-capture-open]')];
  if (!links.length || typeof HTMLDialogElement === 'undefined' ||
      typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'capture-viewer';
  dialog.setAttribute('aria-labelledby', 'captureTitle');
  dialog.innerHTML = '<form method="dialog" class="capture-viewer-bar"><h2 id="captureTitle">In-game capture</h2><button class="small-button" autofocus aria-label="Close screenshot viewer">Close</button></form><div class="capture-viewer-image"><img alt=""></div><p class="capture-viewer-caption" id="captureCaption"></p><a class="capture-viewer-original">Open original image</a>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const caption = dialog.querySelector('.capture-viewer-caption');
  const original = dialog.querySelector('.capture-viewer-original');
  let trigger = null;
  for (const link of links) {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const source = link.querySelector('img');
      if (!source || dialog.open) return;
      event.preventDefault();
      trigger = link;
      title.textContent = link.dataset.captureTitle || 'In-game capture';
      image.src = link.href;
      image.alt = source.alt;
      caption.textContent = source.alt;
      original.href = link.href;
      dialog.showModal();
      document.documentElement.classList.add('capture-viewer-open');
    });
  }
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('capture-viewer-open');
    image.removeAttribute('src');
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
  });
  window.addEventListener('pagehide', () => { if (dialog.open) dialog.close(); });
})();
