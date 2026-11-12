(() => {
  document.querySelectorAll('.inline-turntable').forEach((button, index) => {
    const img = button.closest('.stage').querySelector('img');
    if (!img) return;
    const name = button.closest('.char')?.querySelector('h3')?.textContent.trim() || 'Character ' + (index + 1);
    if (!img.id) img.id = 'inline-turntable-image-' + (index + 1);
    button.setAttribute('aria-controls', img.id);
    function label() {
      const playing = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + name + ' turntable');
      button.textContent = playing ? 'Ⅱ Pause turntable' : '↻ Play turntable';
    }
    label();
    button.addEventListener('click', () => {
      const play = button.getAttribute('aria-pressed') !== 'true';
      img.src = play ? img.dataset.animated : img.dataset.still;
      button.setAttribute('aria-pressed', String(play));
      label();
    });
  });
})();
