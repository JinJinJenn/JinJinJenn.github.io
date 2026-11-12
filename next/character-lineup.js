/* Two views of the same original captures: no duplicate assets or character data. */
(() => {
  const root = document.getElementById('characters');
  const controls = root?.querySelector('.household-views');
  if (!root || !controls) return;
  function show(view) {
    root.dataset.householdView = view;
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
