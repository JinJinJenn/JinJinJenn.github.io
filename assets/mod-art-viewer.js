/* Progressive enhancement: original detail links work with or without JS. */
(() => {
  'use strict';
  const cards = [...document.querySelectorAll('.mod-gallery-card')];
  if (!cards.length || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'mod-art-viewer';
  dialog.setAttribute('aria-labelledby', 'mod-art-title');
  dialog.innerHTML = '<form method="dialog" class="mod-art-heading"><h2 id="mod-art-title"></h2><button class="small-button" autofocus>Close</button></form><div class="mod-art-stage"><img alt=""></div><p class="mod-art-caption">Generated promotional artwork, not an in-game screenshot.</p><div class="mod-art-tools"><button class="small-button" type="button" data-art-prev aria-label="Previous artwork">← Previous</button><output aria-live="polite"></output><button class="small-button" type="button" data-art-next aria-label="Next artwork">Next →</button></div><a class="mod-art-original">Open full-size artwork</a>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  let current = 0, trigger = null;
  function show(index) {
    current = (index + cards.length) % cards.length;
    const card = cards[current], name = card.querySelector('h3').textContent;
    // Preview cards lead with a character, while the first image is only a decorative prop.
    // Keep the original site's artwork selection unchanged.
    const artwork = (document.body.classList.contains('moonshot') && card.querySelector('.layered-creator')) || card.querySelector('img');
    const source = new URL(artwork.getAttribute('src').replace('assets/thumbs/', 'assets/promo/'), document.baseURI).href;
    dialog.querySelector('h2').textContent = name;
    image.alt = name + ' promotional illustration';
    image.src = source;
    dialog.querySelector('output').textContent = (current + 1) + ' of ' + cards.length;
    dialog.querySelector('.mod-art-original').href = source;
  }
  cards.forEach((card, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'small-button mod-art-open';
    button.textContent = 'Explore artwork';
    button.setAttribute('aria-label', 'Explore ' + card.querySelector('h3').textContent + ' artwork');
    button.setAttribute('aria-haspopup', 'dialog');
    card.after(button);
    button.addEventListener('click', () => {
      if (dialog.open) return;
      trigger = button; show(index); dialog.showModal();
      document.documentElement.classList.add('mod-art-opened');
    });
  });
  dialog.querySelector('[data-art-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-art-next]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('mod-art-opened');
    image.removeAttribute('src');
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
  });
  window.addEventListener('pagehide', () => { if (dialog.open) dialog.close(); });
})();
