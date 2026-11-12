/* Preserve native URL/history; move keyboard focus only after a trail click. */
(() => {
  let request = 0;
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('.project-trail a');
    if (!link) return;
    const hash = new URL(link.href, location.href).hash;
    const ticket = ++request;
    requestAnimationFrame(() => {
      if (ticket !== request || location.hash !== hash) return;
      const gallery = document.getElementById('mod-gallery');
      const target = document.getElementById(hash.slice(1));
      const heading = hash === '#mod-gallery'
        ? document.querySelector('#mods .collection-label h2')
        : target?.querySelector('h3');
      if (!heading || (hash === '#mod-gallery' ? gallery?.hidden : document.getElementById('mod-details')?.hidden)) return;
      heading.setAttribute('tabindex', '-1');
      heading.focus({preventScroll:true});
    });
  });
  window.addEventListener('pagehide', () => { request++; });
})();
