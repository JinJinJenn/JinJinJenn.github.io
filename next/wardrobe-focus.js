(() => {
  'use strict';
  const study = document.getElementById('wardrobe-study');
  if (!study) return;
  const controls = study.querySelector('.wardrobe-controls');
  const art = study.querySelector('.wardrobe-art');
  const image = art?.querySelector('img');
  if (!controls || !image) return;
  const originalSizes = image.sizes;
  const originalAlt = image.alt;
  const status = study.querySelector('.wardrobe-selection');
  const looks = {
    all: {name:'All three outfits', shift:'0%', alt:originalAlt},
    everyday: {name:'Everyday outfit', shift:'0%', alt:'Adult rainbow-haired character concept wearing a lavender denim jacket, mint wide-leg trousers and white sneakers'},
    evening: {name:'Evening outfit', shift:'-33.333333%', alt:'Adult rainbow-haired character concept wearing a one-shoulder plum midi dress and lavender block heels'},
    festival: {name:'Festival outfit', shift:'-66.666667%', alt:'Adult rainbow-haired character concept wearing an iridescent jacket, purple shorts, lilac tights and chunky pastel boots'}
  };
  art.dataset.captureAlt = originalAlt;
  art.dataset.look = 'all';
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-wardrobe-look]');
    if (!button || !controls.contains(button)) return;
    const key = button.dataset.wardrobeLook;
    const look = looks[key];
    if (!look) return;
    art.dataset.look = key;
    art.style.setProperty('--wardrobe-shift', look.shift);
    image.sizes = key === 'all' ? originalSizes : '(max-width:650px) calc(300vw - 216px), 960px';
    image.alt = look.alt;
    controls.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    status.textContent = look.name + (key === 'all' ? ' shown together.' : ' enlarged. Open the full sheet to compare all three.');
  });
})();
