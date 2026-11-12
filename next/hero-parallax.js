/* Input-driven depth for the scenery only; no perpetual animation loop. */
(() => {
  const hero = document.querySelector('.ensemble-hero');
  const world = hero?.querySelector('.hero-world');
  if (!world || typeof IntersectionObserver === 'undefined') return;
  const desktop = matchMedia('(min-width:1001px) and (hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, listening = false, frame = 0, x = 0, y = 0;
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    world.style.removeProperty('--world-x');
    world.style.removeProperty('--world-y');
  }
  function move(event) {
    if (event.pointerType !== 'mouse') return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!listening) return;
      const bounds = hero.getBoundingClientRect();
      const horizontal = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
      const vertical = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
      world.style.setProperty('--world-x', (-12 * horizontal).toFixed(2) + 'px');
      world.style.setProperty('--world-y', (-8 * vertical).toFixed(2) + 'px');
    });
  }
  function update() {
    const enabled = desktop.matches && !reduced.matches && visible &&
      document.visibilityState === 'visible' && document.documentElement.dataset.paused !== 'true';
    if (enabled === listening) return;
    listening = enabled;
    if (enabled) {
      world.dataset.parallax = 'active';
      hero.addEventListener('pointermove', move, {passive:true});
      hero.addEventListener('pointerleave', reset);
    } else {
      delete world.dataset.parallax;
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      reset();
    }
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }).observe(hero);
  new MutationObserver(update).observe(document.documentElement, {attributes:true, attributeFilter:['data-paused']});
  desktop.addEventListener('change', update);
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
})();
