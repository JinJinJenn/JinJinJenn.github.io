/* Search only the visible project catalogue; original links and details stay intact. */
(() => {
  'use strict';
  const gallery = document.getElementById('mod-gallery');
  if (!gallery || gallery.querySelector('.mod-discovery')) return;
  const items = [...gallery.querySelectorAll('.mod-gallery-item')];
  if (!items.length) return;
  const topics = {moveanywhere:'homes','love-notes':'moments','surprise-gifts':'moments','thinking-of-you':'moments',toasts:'moments','gentle-hearts':'family','toddler-tv':'family'};
  const records = items.map(item => {
    const link = item.querySelector('[data-mod-gallery-target]');
    return {item, topic:topics[link.dataset.modGalleryTarget], text:link.textContent.toLocaleLowerCase()};
  });
  const form = document.createElement('form');
  form.className = 'mod-discovery';
  form.setAttribute('role','search');
  form.setAttribute('aria-label','Find a mod');
  form.innerHTML = '<div class="mod-search-row"><label for="mod-search">Find a mod</label><input id="mod-search" type="search" placeholder="Try gifts, birthday, or home" autocomplete="off" aria-controls="mod-project-list"><button type="reset" class="small-button">Reset</button></div><div class="mod-topic-buttons" role="group" aria-label="Filter projects by topic"><button type="button" data-topic="all" aria-pressed="true">All projects</button><button type="button" data-topic="homes" aria-pressed="false">Homes</button><button type="button" data-topic="moments" aria-pressed="false">Gifts &amp; notes</button><button type="button" data-topic="family" aria-pressed="false">Family &amp; play</button></div><p class="mod-match-count" role="status" aria-live="polite" aria-atomic="true"></p>';
  const list = gallery.querySelector('.mod-gallery-grid');
  list.id = 'mod-project-list';
  gallery.insertBefore(form,list);
  const empty = document.createElement('p');
  empty.className = 'mod-no-results';
  empty.textContent = 'No projects match that search. Try a different word or reset the filters.';
  empty.hidden = true;
  list.after(empty);
  const input = form.querySelector('input');
  const buttons = [...form.querySelectorAll('[data-topic]')];
  const count = form.querySelector('.mod-match-count');
  let topic = 'all';
  function apply() {
    const words = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const record of records) {
      const visible = (topic === 'all' || topic === record.topic) && words.every(word => record.text.includes(word));
      record.item.hidden = !visible;
      if (visible) shown++;
    }
    buttons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.topic === topic)));
    count.textContent = shown === items.length ? shown + ' projects' : shown + ' of ' + items.length + ' projects';
    empty.hidden = shown !== 0;
  }
  input.addEventListener('input',apply);
  buttons.forEach(button => button.addEventListener('click',() => {topic = button.dataset.topic; apply();}));
  form.addEventListener('submit',event => event.preventDefault());
  form.addEventListener('reset',event => {event.preventDefault();input.value = '';topic = 'all';apply();input.focus();});
  apply();
})();
