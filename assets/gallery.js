(()=>{'use strict';
 const dialog=document.getElementById('characterViewer');
 if(!dialog||typeof dialog.showModal!=='function')return;
 const cards=[...document.querySelectorAll('#characters .char')];
 const img=document.getElementById('viewerImage'),title=document.getElementById('viewerTitle'),description=document.getElementById('viewerDescription');
 let current=0,trigger=null;
 function show(index){
   current=(index+cards.length)%cards.length;const card=cards[current],source=card.querySelector('img[data-animated]');
   title.textContent=card.querySelector('h3').textContent;description.textContent=card.querySelector('p').textContent;
   img.alt=source.alt;img.dataset.animated=source.dataset.animated;img.dataset.still=source.dataset.still;
   img.src=document.documentElement.dataset.paused==='true'?img.dataset.still:img.dataset.animated;
   document.getElementById('viewerOriginal').href=source.dataset.animated;document.getElementById('viewerStill').href=source.dataset.still;
 }
 document.querySelectorAll('[data-character-open]').forEach(button=>{button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',event=>{if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();trigger=button;show(Number(button.dataset.characterOpen));dialog.showModal();});});
 document.getElementById('previousCharacter').addEventListener('click',()=>show(current-1));
 document.getElementById('nextCharacter').addEventListener('click',()=>show(current+1));
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{img.src=img.dataset.still||'img/characters/char-01.png';delete img.dataset.animated;delete img.dataset.still;if(trigger)trigger.focus();});
})();
