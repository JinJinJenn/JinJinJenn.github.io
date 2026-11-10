/* Decorative, bounded motion. Native content never depends on it. */
(()=>{'use strict';
 const scenes=[...document.querySelectorAll('[data-parallax-scene]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(pointer: fine)');
 const layers=scenes.flatMap(s=>[...s.querySelectorAll('[data-parallax-layer]')]);
 let visible=new Set(),frame=0,x=0,y=0,hasPointer=false;
 const stopped=()=>document.hidden||reduced.matches||document.documentElement.dataset.paused==='true';
 const reset=()=>layers.forEach(l=>{l.style.removeProperty('--px');l.style.removeProperty('--py');});
 function paint(){frame=0;if(stopped()){reset();return;}
   const h=innerHeight;
   for(const s of visible){const b=s.getBoundingClientRect();const scroll=Math.max(-1,Math.min(1,(h/2-(b.top+b.height/2))/h));const hero=s.classList.contains('hero-scene');
     const pointer=fine.matches?(hero?26:10):0,travel=fine.matches?(hero?38:16):6;
     for(const l of s.querySelectorAll('[data-parallax-layer]')){const d=Number(l.dataset.parallaxLayer)||.3;
       let px=x*pointer*d,py=(scroll*travel+y*pointer*.55)*d;
       if(l.dataset.parallaxMode==='outward'){
         // CSS parks this branch off-canvas. Keep its motion outward from that resting position.
         const mx=hasPointer?Math.max(0,Math.min(1,(x+1)/2)):0,my=hasPointer?Math.max(0,Math.min(1,(y+1)/2)):0;
         px=-Math.min(32,mx*pointer*Math.abs(d));
         py=-Math.min(42,(my*pointer*.55+Math.max(0,scroll)*travel)*Math.abs(d));
       }
       l.style.setProperty('--px',px.toFixed(2)+'px');l.style.setProperty('--py',py.toFixed(2)+'px');}
   }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);}schedule();},{rootMargin:'80px'});
 scenes.forEach(s=>observer.observe(s));
 addEventListener('pointermove',e=>{if(!fine.matches||stopped())return;x=e.clientX/innerWidth*2-1;y=e.clientY/innerHeight*2-1;hasPointer=true;schedule();},{passive:true});
 addEventListener('blur',()=>{x=0;y=0;hasPointer=false;schedule();});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-paused']});
 addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;reset();});
 schedule();
})();
