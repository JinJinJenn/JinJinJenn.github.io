/* Inline captures start only on request, and respect the shared motion choice. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sharedControl = document.querySelector('#characterViewer [data-motion]');
  const entries = [];
  document.querySelectorAll('.inline-turntable').forEach((button, index) => {
    const img = button.closest('.stage')?.querySelector('img');
    if (!img) return;
    const name = button.closest('.char')?.querySelector('h3')?.textContent.trim() || 'Character ' + (index + 1);
    if (!img.id) img.id = 'inline-turntable-image-' + (index + 1);
    button.setAttribute('aria-controls', img.id);
    const entry = {button, img, name, playing:false};
    entries.push(entry);
    button.addEventListener('click', () => {
      if (reducedMotion.matches) return;
      const play = !entry.playing;
      // A deliberate Play resumes the saved choice; Pause stops all motion.
      const globallyPaused = document.documentElement.dataset.paused === 'true';
      if (sharedControl && globallyPaused === play) sharedControl.click();
      entry.playing = play;
      render();
    });
  });
  function render() {
    const stopped = reducedMotion.matches || document.documentElement.dataset.paused === 'true';
    for (const entry of entries) {
      if (stopped) entry.playing = false;
      const {button, img, name, playing} = entry;
      const source = playing ? img.dataset.animated : img.dataset.still;
      // Do not restart or fetch captures merely because another control changed.
      if (source && img.getAttribute('src') !== source) img.setAttribute('src', source);
      button.disabled = reducedMotion.matches;
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', reducedMotion.matches ? name + ' turntable: reduced motion enabled' : (playing ? 'Pause ' : 'Play ') + name + ' turntable');
      button.textContent = reducedMotion.matches ? 'Reduced motion' : playing ? 'Ⅱ Pause turntable' : '↻ Play turntable';
    }
  }
  new MutationObserver(render).observe(document.documentElement, {attributes:true, attributeFilter:['data-paused']});
  reducedMotion.addEventListener('change', render);
  render();
})();
