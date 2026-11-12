(() => {
  'use strict';
  const links = [...document.querySelectorAll('[data-capture-open]')];
  if (!links.length || typeof HTMLDialogElement === 'undefined' ||
      typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'capture-viewer';
  dialog.setAttribute('aria-labelledby', 'captureTitle');
  dialog.innerHTML = '<form method="dialog" class="capture-viewer-bar"><h2 id="captureTitle">In-game capture</h2><button class="small-button" autofocus aria-label="Close image viewer">Close</button></form><div class="concept-viewer-nav" hidden><button type="button" class="small-button" data-concept-prev>← Previous</button><output aria-live="polite"></output><button type="button" class="small-button" data-concept-next>Next →</button></div><div class="capture-load-state"><p role="status" aria-live="polite"></p><button type="button" class="small-button" data-capture-retry hidden>Try again</button></div><div class="capture-viewer-tools" aria-label="Image zoom"><button type="button" class="small-button" data-capture-zoom="in">Zoom in</button><button type="button" class="small-button" data-capture-zoom="out" disabled>Zoom out</button><button type="button" class="small-button" data-capture-zoom="fit" disabled>Fit image</button><output aria-live="polite">Fit</output></div><div class="capture-viewer-image"><img alt=""></div><p class="capture-viewer-caption" id="captureCaption"></p><a class="capture-viewer-original">Open original image</a>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const caption = dialog.querySelector('.capture-viewer-caption');
  const original = dialog.querySelector('.capture-viewer-original');
  const frame = dialog.querySelector('.capture-viewer-image');
  const zoomIn = dialog.querySelector('[data-capture-zoom="in"]');
  const zoomOut = dialog.querySelector('[data-capture-zoom="out"]');
  const fit = dialog.querySelector('[data-capture-zoom="fit"]');
  const zoomLabel = dialog.querySelector('.capture-viewer-tools output');
  const groupNav = dialog.querySelector('.concept-viewer-nav');
  const groupCount = groupNav.querySelector('output');
  const status = dialog.querySelector('.capture-load-state p');
  const retry = dialog.querySelector('[data-capture-retry]');
  let currentSource = '';
  let restoreRetryFocus = false;
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

  let group = [], current = 0;
  let trigger = null;
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
    if (restoreRetryFocus && (document.activeElement === document.body || document.activeElement === retry)) zoomIn.focus();
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
    if (restoreRetryFocus && (document.activeElement === document.body || document.activeElement === retry)) retry.focus();
    restoreRetryFocus = false;
  });
  function showArtwork(link) {
    const source = link.querySelector('img');
    title.textContent = link.dataset.captureTitle || 'Artwork';
    caption.textContent = link.dataset.captureAlt || source.alt;
    original.href = link.href;
    image.alt = link.dataset.captureAlt || source.alt;
    currentSource = link.href;
    retry.hidden = true;
    loadImage();
    groupCount.textContent = 'Concept art · '+(current + 1)+' of '+group.length;
    resetZoom();
  }
  function changeArtwork(delta) {
    if (group.length < 2) return;
    current = (current + delta + group.length) % group.length;
    showArtwork(group[current]);
  }
  groupNav.querySelector('[data-concept-prev]').addEventListener('click', () => changeArtwork(-1));
  groupNav.querySelector('[data-concept-next]').addEventListener('click', () => changeArtwork(1));
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || scale > 1 || group.length < 2) return;
    if (event.key === 'ArrowRight') {event.preventDefault();changeArtwork(1);}
    if (event.key === 'ArrowLeft') {event.preventDefault();changeArtwork(-1);}
  });
  for (const link of links) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const source = link.querySelector('img');
      if (!source || dialog.open) return;
      event.preventDefault();
      trigger = link;
      group = link.dataset.captureGroup ? links.filter(item => item.dataset.captureGroup === link.dataset.captureGroup) : [link];
      current = group.indexOf(link);
      groupNav.hidden = group.length < 2;
      dialog.showModal();
      showArtwork(link);
      document.documentElement.classList.add('capture-viewer-open');
      resetZoom();
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
    group = [];current = 0;
    resetZoom();
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
  });
  window.addEventListener('pagehide', () => { if (dialog.open) dialog.close(); });
  window.addEventListener('resize', () => { if (dialog.open) resetZoom(); });
})();
