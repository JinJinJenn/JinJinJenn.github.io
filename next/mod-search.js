/* Search only the visible project catalogue; original links and details stay intact. */
(() => {
  'use strict';
  const gallery = document.getElementById('mod-gallery');
  if (!gallery || gallery.querySelector('.mod-discovery')) return;
  const items = [...gallery.querySelectorAll('.mod-gallery-item')];
  if (!items.length) return;
  const topics = {moveanywhere:'homes','love-notes':'moments','surprise-gifts':'moments','thinking-of-you':'moments',toasts:'moments','gentle-hearts':'family','toddler-tv':'family'};
  const aliases = {
    moveanywhere:'move moving house housing residential parks lot relocation',
    'love-notes':'love romantic letters messages note',
    'surprise-gifts':'surprise presents gift flower flowers',
    'thinking-of-you':'thoughts thinking affectionate note happy moodlet',
    toasts:'birthday birthdays anniversary anniversaries calendar dates celebration celebrations',
    'gentle-hearts':'gentle hearts relationship relationships happy moodlet',
    'toddler-tv':'toddler toddlers television tv kids channel children family'
  };
  const topicNames = {all:'All projects',homes:'Homes',moments:'Gifts & notes',family:'Family & play'};
  const records = items.map(item => {
    const link = item.querySelector('[data-mod-gallery-target]');
    return {item, topic:topics[link.dataset.modGalleryTarget], text:(link.textContent+' '+(aliases[link.dataset.modGalleryTarget] || '')).toLocaleLowerCase()};
  });
  const form = document.createElement('form');
  form.className = 'mod-discovery';
  form.setAttribute('role','search');
  form.setAttribute('aria-label','Find a mod');
  form.innerHTML = '<div class="mod-search-row"><label for="mod-search">Find a mod</label><input id="mod-search" type="search" placeholder="Try gifts, birthday, or home" autocomplete="off" aria-controls="mod-project-list"><button type="reset" class="small-button">Reset</button></div><div class="mod-topic-buttons" role="group" aria-label="Filter projects by topic"><button type="button" data-topic="all" aria-pressed="true">All projects</button><button type="button" data-topic="homes" aria-pressed="false">Homes</button><button type="button" data-topic="moments" aria-pressed="false">Gifts &amp; notes</button><button type="button" data-topic="family" aria-pressed="false">Family &amp; play</button></div><p class="mod-match-count" role="status" aria-live="polite" aria-atomic="true"></p>';
  const list = gallery.querySelector('.mod-gallery-grid');
  list.id = 'mod-project-list';
  gallery.insertBefore(form,list);
  const empty = document.createElement('div');
  empty.className = 'mod-no-results';
  empty.innerHTML = '<h3>No matching projects</h3><p class="mod-empty-explanation"></p><div class="mod-empty-actions"><button type="button" class="small-button" data-search-all>Search all topics</button><button type="button" class="small-button" data-search-reset>Show all seven projects</button></div>';
  const explanation = empty.querySelector('.mod-empty-explanation');
  const allTopics = empty.querySelector('[data-search-all]');
  empty.hidden = true;
  list.after(empty);
  const input = form.querySelector('input');
  const buttons = [...form.querySelectorAll('[data-topic]')];
  const count = form.querySelector('.mod-match-count');
  let topic = 'all';
  function apply() {
    const words = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    let matchingAnyTopic = 0;
    for (const record of records) {
      const matchesWords = words.every(word => record.text.includes(word));
      if (matchesWords) matchingAnyTopic++;
      const visible = (topic === 'all' || topic === record.topic) && matchesWords;
      record.item.hidden = !visible;
      if (visible) shown++;
    }
    buttons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.topic === topic)));
    count.textContent = shown === items.length ? shown + ' projects' : shown + ' of ' + items.length + ' projects';
    empty.hidden = shown !== 0;
    allTopics.hidden = topic === 'all' || matchingAnyTopic === 0;
    explanation.textContent = matchingAnyTopic > 0 && topic !== 'all'
      ? 'Nothing matches in '+topicNames[topic]+', but '+matchingAnyTopic+' '+(matchingAnyTopic === 1 ? 'project matches' : 'projects match')+' in other topics.'
      : 'Try another word, such as birthday, moving house or television, or return to the full collection.';
  }
  input.addEventListener('input',apply);
  buttons.forEach(button => button.addEventListener('click',() => {topic = button.dataset.topic; apply();}));
  form.addEventListener('submit',event => event.preventDefault());
  form.addEventListener('reset',event => {event.preventDefault();input.value = '';topic = 'all';apply();input.focus();});
  allTopics.addEventListener('click',() => {topic = 'all';apply();input.focus();});
  empty.querySelector('[data-search-reset]').addEventListener('click',() => form.reset());
  apply();
})();
