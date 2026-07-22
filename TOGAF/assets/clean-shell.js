
(()=>{
  const d=document,b=d.body;
  const qs=(s,c=d)=>c.querySelector(s);
  const qsa=(s,c=d)=>[...c.querySelectorAll(s)];
  const safeStore={
    get(k){try{return localStorage.getItem(k)}catch(e){return null}},
    set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  };
  const progress=qs('.tp-reading-progress span');
  const update=()=>{if(!progress)return;const h=d.documentElement,m=h.scrollHeight-h.clientHeight;progress.style.width=(m?Math.min(100,h.scrollTop/m*100):0)+'%'};
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();

  const menu=qs('.tp-menu-toggle'),nav=qs('.tp-nav');
  if(menu&&nav){
    menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
    qsa('.tp-nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
    d.addEventListener('click',e=>{if(innerWidth<=1150&&!nav.contains(e.target)&&!menu.contains(e.target))nav.classList.remove('open')});
  }
  const page=(location.pathname.split('/').pop()||'index.html');
  qsa('.tp-nav a[data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
  const theme=qs('.tp-theme-toggle');
  const applyTheme=t=>{b.dataset.uiTheme=t;theme&&theme.setAttribute('aria-label',t==='dark'?'الوضع الفاتح':'الوضع الداكن')};
  applyTheme(safeStore.get('togaf-clean-theme')||'light');
  theme?.addEventListener('click',()=>{const t=b.dataset.uiTheme==='dark'?'light':'dark';applyTheme(t);safeStore.set('togaf-clean-theme',t)});
  qsa('.tp-more').forEach(x=>x.addEventListener('toggle',()=>{if(x.open)qsa('.tp-more').filter(y=>y!==x).forEach(y=>y.open=false)}));
})();
