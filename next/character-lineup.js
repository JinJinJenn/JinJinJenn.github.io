/* Two views of the same original captures: no duplicate assets or character data. */
(() => {
  const root = document.getElementById('characters');
  const controls = root?.querySelector('.household-views');
  if (!root || !controls) return;
  const cards = root.querySelector('.chars');
  const mobile = window.matchMedia('(max-width:650px)');
  const hint = document.createElement('p');
  hint.className = 'lineup-scroll-hint';
  hint.textContent = 'Scroll across to compare all three characters, or choose Outfit stories for a vertical view.';
  cards.before(hint);
  function updateRegion() {
    const rail = mobile.matches && root.dataset.householdView === 'lineup';
    if (rail) {
      cards.setAttribute('tabindex', '0');
      cards.setAttribute('role', 'region');
      cards.setAttribute('aria-label', 'Three captured characters. Scroll horizontally to compare.');
    } else {
      cards.removeAttribute('tabindex');
      cards.removeAttribute('role');
      cards.removeAttribute('aria-label');
    }
  }
  mobile.addEventListener('change', updateRegion);
  function show(view) {
    root.dataset.householdView = view;
    updateRegion();
    controls.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.householdView === view));
    });
  }
  controls.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => show(button.dataset.householdView));
  });
  controls.hidden = false;
  show('lineup');
})();
