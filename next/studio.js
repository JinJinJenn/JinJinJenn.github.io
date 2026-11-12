(()=>{const b=document.querySelector('.mode');if(!b)return;function label(){b.setAttribute('aria-label',document.documentElement.dataset.theme==='dark'?'Switch to light theme':'Switch to dark theme')}label();b.addEventListener('click',()=>{const v=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=v;try{localStorage.setItem('jenn-moonshot-theme',v)}catch(e){}label()});})();

/* Preview character-viewer playback, independent of the original site's shell. */
(() => {
  const dialog = document.getElementById('characterViewer');
  const button = dialog?.querySelector('[data-motion]');
  const image = document.getElementById('viewerImage');
  if (!button || !image) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  function applyMotion() {
    const still = paused || reducedMotion.matches;
    document.documentElement.dataset.paused = String(still);
    button.textContent = reducedMotion.matches ? 'Reduced motion' : still ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-pressed', String(still));
    button.setAttribute('aria-controls', image.id);
    button.disabled = reducedMotion.matches;
    const source = still ? image.dataset.still : image.dataset.animated;
    if (source) image.src = source;
  }
  button.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reducedMotion.addEventListener('change', applyMotion);
  applyMotion();
})();
