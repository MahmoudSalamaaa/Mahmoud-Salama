
(() => {
  const body=document.body;
  const menu=document.querySelector('[data-nav-menu]');
  const toggle=document.querySelector('[data-nav-toggle]');
  const theme=document.querySelector('[data-theme]');
  const storage={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
  const saved=storage.get('ms-articles-theme');
  const preferred=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(saved==='dark'||(!saved&&preferred)) body.classList.add('dark');
  const syncTheme=()=>{if(theme){theme.textContent=body.classList.contains('dark')?'Light mode':'Dark mode';theme.setAttribute('aria-pressed',String(body.classList.contains('dark')))}};
  syncTheme();
  theme?.addEventListener('click',()=>{body.classList.toggle('dark');storage.set('ms-articles-theme',body.classList.contains('dark')?'dark':'light');syncTheme()});
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));menu?.classList.toggle('is-open',!open)});
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false')}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false')}});
  document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
  const toast=document.querySelector('[data-toast]');
  const showToast=(msg)=>{if(!toast)return;toast.textContent=msg;toast.classList.add('is-visible');clearTimeout(window.__msToast);window.__msToast=setTimeout(()=>toast.classList.remove('is-visible'),2200)};
  document.querySelectorAll('[data-share]').forEach(b=>b.addEventListener('click',async()=>{
    try{
      if(navigator.share){await navigator.share({title:document.title,text:document.querySelector('meta[name="description"]')?.content||'',url:location.href});return}
      await navigator.clipboard.writeText(location.href);showToast('Article link copied');
    }catch(err){if(err?.name!=='AbortError')showToast('Copy the link from your browser')}
  }));
  const progress=document.querySelector('.reading-progress');
  const updateProgress=()=>{if(!progress)return;const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,(scrollY/max)*100):0)+'%'};
  addEventListener('scroll',updateProgress,{passive:true});updateProgress();
  const tocLinks=[...document.querySelectorAll('.toc a[href^="#"]')];
  const sections=tocLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(sections.length&&'IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top).slice(0,1).forEach(entry=>{tocLinks.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+entry.target.id))})},{rootMargin:'-22% 0px -66% 0px',threshold:[0,1]});
    sections.forEach(s=>observer.observe(s));
  }
})();
