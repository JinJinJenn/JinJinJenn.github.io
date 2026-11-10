/* Native anchors remain useful without JS; enhancement only changes the view. */
(() => {
  'use strict';
  const root = document.getElementById('mods');
  if (!root || root.dataset.modBrowserReady === 'true') return;
  const browser = root.querySelector('[data-mod-gallery-browser]');
  const gallery = document.getElementById('mod-gallery');
  const details = document.getElementById('mod-details');
  const controls = browser && browser.querySelector('.mod-view-controls');
  const buttons = controls ? [...controls.querySelectorAll('[data-mod-view]')] : [];
  if (!browser || !gallery || !details || buttons.length !== 2) return;
  let pendingFocus = null;

  function focusAfterNavigation(request) {
    requestAnimationFrame(() => {
      if (pendingFocus !== request) return;
      pendingFocus = null;
      if (details.hidden || targetForHash(location.hash) !== request.target) return;
      request.heading.setAttribute('tabindex', '-1');
      request.heading.focus({ preventScroll: true });
    });
  }

  function targetForHash(hash) {
    if (!hash || hash === '#') return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch (_) { return null; }
  }
  function setView(mode) {
    if (mode !== 'details') pendingFocus = null;
    gallery.hidden = mode !== 'gallery';
    details.hidden = mode !== 'details';
    root.dataset.modView = mode;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.modView === mode)));
  }
  function showHash(shouldScroll) {
    const target = targetForHash(location.hash);
    setView(target && (target === details || details.contains(target)) ? 'details' : 'gallery');
    // Fragment navigation happens before hashchange in some browsers. Reveal
    // first, then correct the scroll once; use no animation, including when
    // reduced motion or the site's own pause preference is active.
    if (shouldScroll && target) {
      const destination = target === gallery || target === details ? root : target;
      destination.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
  function localTarget(link) {
    try {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return null;
      return targetForHash(url.hash);
    } catch (_) { return null; }
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    pendingFocus = null;
    const mode = button.dataset.modView;
    setView(mode);
    const hash = mode === 'details' ? '#mod-details' : '#mod-gallery';
    if (location.hash === hash) root.scrollIntoView({ block: 'start', behavior: 'instant' });
    else location.hash = hash; // Native history gives Back/Forward their normal meaning.
  }));
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    pendingFocus = null;
    const target = localTarget(link);
    if (!target || (target !== details && !details.contains(target))) return;
    setView('details'); // Unhide synchronously before native anchor navigation.
    if (gallery.contains(link)) {
      // Chrome's default fragment action can reset synchronous click focus.
      // Restore it only after that action, with a same-hash fallback and a
      // request identity so newer view/navigation choices always win.
      pendingFocus = { target, heading: target.querySelector('h3') || target };
      focusAfterNavigation(pendingFocus);
    }
    // Do not preventDefault: copied links, history, and native fragment URLs survive.
  });
  window.addEventListener('hashchange', () => {
    showHash(true);
    if (pendingFocus && targetForHash(location.hash) === pendingFocus.target) focusAfterNavigation(pendingFocus);
    else pendingFocus = null;
  });
  // A cached page should recover its view without overriding the browser's
  // restored reading position farther down an article.
  window.addEventListener('pageshow', () => { pendingFocus = null; showHash(false); });
  window.addEventListener('pagehide', () => { pendingFocus = null; });
  controls.hidden = false;
  root.dataset.modBrowserReady = 'true';
  showHash(false);
  if (location.hash) requestAnimationFrame(() => showHash(true));
})();
