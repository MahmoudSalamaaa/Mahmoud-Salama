(() => {
 const root=document.documentElement;
 const mode=root.dataset.languageMode||'en';
 const slug=root.dataset.articleSlug||'';
 const menu=document.querySelector('[data-nav-menu]');
 const toggle=document.querySelector('[data-nav-toggle]');
 const toast=document.querySelector('[data-toast]');
 const copy={en:{copied:'Article link copied',fallback:'Copy the link from your browser'},ar:{copied:'تم نسخ رابط المقال',fallback:'انسخ الرابط من المتصفح'},bi:{copied:'Article link copied',fallback:'Copy the link from your browser'}}[mode]||{};
 const showToast=message=>{if(!toast)return;toast.textContent=message;toast.classList.add('is-visible');clearTimeout(window.__msToast);window.__msToast=setTimeout(()=>toast.classList.remove('is-visible'),2200)};
 const track=(name,data={})=>{try{window.dispatchEvent(new CustomEvent('ms:article-engagement',{detail:{name,...data}}))}catch{}try{if(typeof window.va==='function')window.va('event',{name,data:{article:slug,language:mode,...data}})}catch{}};
 document.querySelectorAll('img[data-fallback-src]').forEach(img=>img.addEventListener('error',()=>{const fallback=img.dataset.fallbackSrc;if(fallback&&img.src!==fallback){img.removeAttribute('data-fallback-src');img.src=fallback}},{once:true}));
 const closeMenu=()=>{menu?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false')};
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));menu?.classList.toggle('is-open',!open)});
 menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
 document.addEventListener('click',event=>{if(menu?.classList.contains('is-open')&&!event.target.closest('.nav-shell'))closeMenu()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
 document.querySelectorAll('.language-option').forEach(link=>link.addEventListener('click',()=>track('Language selected',{selected:link.dataset.languageMode||''})));
 document.querySelectorAll('[data-pdf-link]').forEach(link=>link.addEventListener('click',()=>track('PDF opened')));
 document.querySelectorAll('.digital-card-link,.profile-link').forEach(link=>link.addEventListener('click',()=>track('Digital card opened')));
 document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',()=>{track('Print requested');window.print()}));
 document.querySelectorAll('[data-share]').forEach(button=>button.addEventListener('click',async()=>{const url=location.href;track('Share requested');try{if(navigator.share){await navigator.share({title:document.title,text:document.querySelector('meta[name="description"]')?.content||'',url});return}await navigator.clipboard.writeText(url);showToast(copy.copied)}catch(error){if(error?.name!=='AbortError')showToast(copy.fallback)}}));
 const progress=document.querySelector('.reading-progress');
 const scope=document.querySelector('[data-reading-scope]');
 const milestones=new Set();
 const updateProgress=()=>{if(!progress||!scope)return;const top=scope.getBoundingClientRect().top+window.scrollY;const end=top+scope.offsetHeight-window.innerHeight;const distance=Math.max(1,end-top);const pct=Math.max(0,Math.min(100,(window.scrollY-top)/distance*100));progress.style.width=`${pct}%`;[50,90].forEach(mark=>{if(pct>=mark&&!milestones.has(mark)){milestones.add(mark);track('Reading progress',{percent:mark})}})};
 addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress,{passive:true});updateProgress();
 const tocLinks=[...document.querySelectorAll('.toc a[href^="#"]')];
 const sections=tocLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
 if(sections.length&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(visible)tocLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')===`#${visible.target.id}`))},{rootMargin:'-22% 0px -68% 0px',threshold:[0,.01,1]});sections.forEach(section=>observer.observe(section))}
 const series=document.querySelector('[data-series-navigation]');
 const items=Array.isArray(window.MS_ARTICLES)?window.MS_ARTICLES:[];
 const index=items.findIndex(item=>item.slug===slug);
 if(series&&index>=0&&items.length>1){const make=(item,label,kind)=>`<a class="series-link ${kind}" href="${item.url}"><small>${label}</small><strong>${item.title}</strong></a>`;const prev=index>0?make(items[index-1],mode==='ar'?'المقال السابق':'Previous article','series-prev'):'';const next=index<items.length-1?make(items[index+1],mode==='ar'?'المقال التالي':'Next article','series-next'):'';if(prev||next){series.innerHTML=prev+next;series.hidden=false}}
})();
