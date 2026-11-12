/* Preserve native URL/history; focus after the mod browser has revealed its view. */
(() => {
  let pending = null;
  function focusDestination(request) {
    requestAnimationFrame(() => {
      if (pending !== request || location.hash !== request.hash) return;
      pending = null;
      const gallery = document.getElementById('mod-gallery');
      const target = document.getElementById(request.hash.slice(1));
      const heading = request.hash === '#mod-gallery'
        ? document.querySelector('#mods .collection-label h2')
        : target?.querySelector('h3');
      if (!heading || (request.hash === '#mod-gallery' ? gallery?.hidden : document.getElementById('mod-details')?.hidden)) return;
      heading.setAttribute('tabindex', '-1');
      heading.focus({preventScroll:true});
    });
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    pending = null;
    const link = event.target.closest?.('.project-trail a');
    if (!link) return;
    const hash = new URL(link.href, location.href).hash;
    pending = {hash};
    // Same-fragment clicks do not dispatch hashchange. Other clicks wait for
    // mod-gallery.js to reveal the destination before scheduling focus.
    if (location.hash === hash) focusDestination(pending);
  });
  window.addEventListener('hashchange', () => {
    if (pending?.hash === location.hash) focusDestination(pending);
    else pending = null;
  });
  window.addEventListener('pagehide', () => { pending = null; });
})();
