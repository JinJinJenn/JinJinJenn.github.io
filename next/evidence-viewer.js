(() => {
  'use strict';
  const links = [...document.querySelectorAll('[data-capture-open]')];
  if (!links.length || typeof HTMLDialogElement === 'undefined' ||
      typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'capture-viewer';
  dialog.setAttribute('aria-labelledby', 'captureTitle');
  dialog.innerHTML = '<form method="dialog" class="capture-viewer-bar"><h2 id="captureTitle">In-game capture</h2><button class="small-button" autofocus aria-label="Close image viewer">Close</button></form><div class="capture-load-state"><p role="status" aria-live="polite"></p><button type="button" class="small-button" data-capture-retry hidden>Try again</button></div><div class="capture-viewer-tools" aria-label="Image zoom"><button type="button" class="small-button" data-capture-zoom="in">Zoom in</button><button type="button" class="small-button" data-capture-zoom="out" disabled>Zoom out</button><button type="button" class="small-button" data-capture-zoom="fit" disabled>Fit image</button><output aria-live="polite">Fit</output></div><div class="capture-viewer-image"><img alt=""></div><p class="capture-viewer-caption" id="captureCaption"></p><a class="capture-viewer-original">Open original image</a>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const caption = dialog.querySelector('.capture-viewer-caption');
  const original = dialog.querySelector('.capture-viewer-original');
  const frame = dialog.querySelector('.capture-viewer-image');
  const zoomIn = dialog.querySelector('[data-capture-zoom="in"]');
  const zoomOut = dialog.querySelector('[data-capture-zoom="out"]');
  const fit = dialog.querySelector('[data-capture-zoom="fit"]');
  const zoomLabel = dialog.querySelector('output');
  const status = dialog.querySelector('.capture-load-state p');
  const retry = dialog.querySelector('[data-capture-retry]');
  let currentSource = '';
  let restoreRetryFocus = false;
  let trigger = null;
  function loadImage() {
    restoreRetryFocus = document.activeElement === retry;
    status.textContent = 'Loading full-size image…';
    retry.disabled = true;
    frame.setAttribute('aria-busy', 'true');
    image.hidden = true;
    image.removeAttribute('src');
    resetZoom();
    image.src = currentSource;
  }
  retry.addEventListener('click', loadImage);
  let scale = 1, fitWidth = 0;
  function resetZoom() {
    scale = 1;
    image.style.removeProperty('width');
    frame.classList.remove('is-zoomed');
    frame.removeAttribute('tabindex');
    frame.removeAttribute('aria-label');
    frame.scrollLeft = frame.scrollTop = 0;
    fitWidth = image.getBoundingClientRect().width;
    zoomIn.disabled = !image.complete || !image.naturalWidth;
    zoomOut.disabled = fit.disabled = true;
    zoomLabel.textContent = 'Fit';
  }
  function setZoom(next) {
    if (!image.complete || !image.naturalWidth) return;
    if (next <= 1) { resetZoom(); return; }
    if (scale === 1) fitWidth = image.getBoundingClientRect().width;
    scale = Math.min(4, next);
    frame.classList.add('is-zoomed');
    frame.tabIndex = 0;
    frame.setAttribute('aria-label', 'Enlarged image. Scroll to inspect the image.');
    image.style.width = Math.round(fitWidth * scale) + 'px';
    frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
    frame.scrollTop = Math.max(0, (frame.scrollHeight - frame.clientHeight) / 2);
    zoomIn.disabled = scale >= 4;
    zoomOut.disabled = fit.disabled = false;
    zoomLabel.textContent = Math.round(scale * 100) + '%';
  }
  zoomIn.addEventListener('click', () => setZoom(scale * 1.5));
  zoomOut.addEventListener('click', () => setZoom(scale / 1.5));
  fit.addEventListener('click', resetZoom);
  image.addEventListener('load', () => {
    if (!dialog.open) return;
    image.hidden = false;
    frame.removeAttribute('aria-busy');
    status.textContent = '';
    resetZoom();
    if (restoreRetryFocus) zoomIn.focus();
    restoreRetryFocus = false;
    retry.hidden = true;
  });
  image.addEventListener('error', () => {
    if (!dialog.open || !image.getAttribute('src')) return;
    image.hidden = true;
    frame.removeAttribute('aria-busy');
    status.textContent = 'This image could not load. Try again, or open the original image below.';
    retry.hidden = false;
    retry.disabled = false;
    resetZoom();
    if (restoreRetryFocus) retry.focus();
    restoreRetryFocus = false;
  });
  for (const link of links) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const source = link.querySelector('img');
      if (!source || dialog.open) return;
      event.preventDefault();
      trigger = link;
      title.textContent = link.dataset.captureTitle || 'In-game capture';
      currentSource = link.href;
      image.alt = source.alt;
      caption.textContent = source.alt;
      original.href = link.href;
      dialog.showModal();
      document.documentElement.classList.add('capture-viewer-open');
      loadImage();
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
    status.textContent = '';
    restoreRetryFocus = false;
    frame.removeAttribute('aria-busy');
    retry.hidden = true;
    resetZoom();
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
  });
  window.addEventListener('pagehide', () => { if (dialog.open) dialog.close(); });
  window.addEventListener('resize', () => { if (dialog.open) resetZoom(); });
})();
