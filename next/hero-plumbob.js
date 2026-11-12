(() => {
  'use strict';
  const root = document.documentElement;
  const jewel = document.getElementById('hero-plumbob');
  const control = document.querySelector('.hero-motion');
  const sharedMotion = document.querySelector('#characterViewer [data-motion]');
  if (!jewel || !control || !sharedMotion || jewel.dataset.plumbobReady !== 'true') return;
  const row = control.closest('.hero-motion-row');
  const hero = jewel.closest('.ensemble-hero');
  const copy = hero.querySelector('.ensemble-copy');
  const slot = document.createComment('Desktop animation control position');
  row.before(slot);
  const stacked = matchMedia('(max-width:1000px)');
  function placeControl() {
    const focused = document.activeElement === control;
    if (stacked.matches) hero.insertBefore(row, copy);
    else slot.after(row);
    if (focused) control.focus({preventScroll:true});
  }
  stacked.addEventListener('change', placeControl);
  placeControl();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function sync() {
    const paused = root.dataset.paused === 'true' || reduced.matches;
    control.hidden = false;
    control.disabled = reduced.matches;
    control.setAttribute('aria-pressed', String(paused));
    control.textContent = reduced.matches ? 'Motion off' : paused ? 'Play animation' : 'Pause animation';
    control.setAttribute('aria-label', reduced.matches ? 'Animation disabled by your reduced motion preference' : paused ? 'Play decorative plumbob animation' : 'Pause decorative plumbob animation');
  }
  control.addEventListener('click', () => { sharedMotion.click(); sync(); });
  new MutationObserver(sync).observe(root, {attributes:true, attributeFilter:['data-paused']});
  reduced.addEventListener('change', sync);
  sync();
})();
