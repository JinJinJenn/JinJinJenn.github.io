/* Inline captures start only on request, and respect the shared motion choice. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sharedControl = document.querySelector('#characterViewer [data-motion]');
  const entries = [];
  function cancelLoad(entry) {
    if (entry.loader) {
      entry.loader.onload = entry.loader.onerror = null;
      entry.loader.removeAttribute('src');
      entry.loader = null;
    }
    entry.pending = false;
  }
  document.querySelectorAll('.inline-turntable').forEach((button, index) => {
    const img = button.closest('.stage')?.querySelector('img');
    if (!img) return;
    const card = button.closest('.char');
    const name = card?.querySelector('h3')?.textContent.trim() || 'Character ' + (index + 1);
    if (!img.id) img.id = 'inline-turntable-image-' + (index + 1);
    button.setAttribute('aria-controls', img.id);
    const status = document.createElement('span');
    status.className = 'turntable-status';
    status.id = 'turntable-status-' + (index + 1);
    status.setAttribute('role', 'status');
    card.querySelector('.outfit-copy').append(status);
    button.setAttribute('aria-describedby', status.id);
    const entry = {button, img, name, status, playing:false, pending:false, failed:false, loader:null};
    entries.push(entry);
    button.addEventListener('click', () => {
      if (reducedMotion.matches) return;
      if (entry.pending) {
        cancelLoad(entry);
        status.textContent = '';
        render();
        return;
      }
      const play = !entry.playing;
      const globallyPaused = document.documentElement.dataset.paused === 'true';
      if (sharedControl && globallyPaused === play) sharedControl.click();
      entry.failed = false;
      status.textContent = '';
      if (!play) { entry.playing = false; render(); return; }
      // Keep the still visible until a requested animated capture has loaded.
      const loader = new Image();
      entry.loader = loader;
      entry.pending = true;
      loader.onload = () => {
        if (entry.loader !== loader) return;
        entry.loader = null;
        entry.pending = false;
        entry.playing = true;
        render();
      };
      loader.onerror = () => {
        if (entry.loader !== loader) return;
        entry.loader = null;
        entry.pending = false;
        entry.failed = true;
        status.textContent = 'The animation couldn’t load. The still image is unchanged; try again when you’re ready.';
        render();
      };
      render();
      loader.src = img.dataset.animated;
    });
  });
  function render() {
    const stopped = reducedMotion.matches || document.documentElement.dataset.paused === 'true';
    for (const entry of entries) {
      if (stopped) { entry.playing = false; cancelLoad(entry); }
      const {button, img, name, playing, pending, failed} = entry;
      const source = playing ? img.dataset.animated : img.dataset.still;
      if (source && img.getAttribute('src') !== source) img.setAttribute('src', source);
      button.disabled = reducedMotion.matches;
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', reducedMotion.matches ? name + ' turntable: reduced motion enabled' : (pending ? 'Cancel loading ' : playing ? 'Pause ' : failed ? 'Retry ' : 'Play ') + name + ' turntable');
      button.textContent = reducedMotion.matches ? 'Reduced motion' : pending ? 'Cancel loading' : playing ? 'Ⅱ Pause turntable' : failed ? '↻ Retry turntable' : '↻ Play turntable';
    }
  }
  new MutationObserver(render).observe(document.documentElement, {attributes:true, attributeFilter:['data-paused']});
  reducedMotion.addEventListener('change', render);
  render();
  entries.forEach(({button}) => { button.hidden = false; });
})();
