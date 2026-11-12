/* Enhance native links without trapping keyboard focus or adding autoplay. */
(()=>{const nav=document.querySelector('.midnight-palette-nav'),grid=document.querySelector('.midnight-color-grid');if(!nav||!grid)return;
nav.addEventListener('click',event=>{const link=event.target.closest('a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const card=document.querySelector(link.getAttribute('href'));if(!card)return;
event.preventDefault();const left=grid.scrollLeft+card.getBoundingClientRect().left-grid.getBoundingClientRect().left-8;
grid.scrollTo({left,behavior:'instant'});card.focus({preventScroll:true});card.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
try{history.replaceState(null,'',link.getAttribute('href'))}catch(e){}
});})();
