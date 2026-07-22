
(()=>{
  'use strict';
  const CARD='https://mahmoud-salama.vercel.app/card.html';
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const accents={
    'exam.html':'#ff7185','practice.html':'#19c9f2','notes.html':'#7568ff','flashcards.html':'#7568ff',
    'mastery.html':'#38d8ad','planner.html':'#f2bd52','quality.html':'#ff9a62','search.html':'#19c9f2',
    'glossary.html':'#38d8ad','knowledge-map.html':'#7568ff','source-reader.html':'#f2bd52','settings.html':'#19c9f2',
    'cheatsheet.html':'#f2bd52','workspace.html':'#19c9f2'
  };
  let accent=accents[file];
  const cm=file.match(/chapter-(\d+)\.html/);
  if(!accent&&cm){const palette=['#19c9f2','#7568ff','#38d8ad','#f2bd52','#ff7185'];accent=palette[(Number(cm[1])-1)%palette.length]}
  document.documentElement.style.setProperty('--ms-page-accent',accent||'#19c9f2');

  function addGlobalUI(){
    const skip=document.createElement('a');skip.className='ms-skip-link';skip.href='#main-content';skip.textContent='تخطي إلى المحتوى';document.body.prepend(skip);
    const prog=document.createElement('div');prog.className='ms-reading-progress';prog.innerHTML='<span></span>';document.body.prepend(prog);
    const main=document.querySelector('.tp-main,.content,main');if(main&&!main.id)main.id='main-content';

    if(!document.querySelector('.ms-signature')){const sig=document.createElement('aside');sig.className='ms-signature';sig.setAttribute('aria-label','Mahmoud Salama Digital Card');sig.innerHTML=`<a href="${CARD}" target="_blank" rel="noopener"><img src="assets/logo.png" alt="Mahmoud Salama logo"><span><strong>Mahmoud Salama</strong><small>Enterprise Architecture · Digital Card ↗</small></span></a>`;document.body.append(sig);}

    if(main&&!main.querySelector('.ms-page-footer')){
      const footer=document.createElement('footer');footer.className='ms-page-footer';
      footer.innerHTML=`<div class="ms-footer-inner"><div class="ms-footer-brand"><img src="assets/logo.png" alt="Mahmoud Salama logo"><span><strong>Mahmoud Salama</strong><small>TOGAF Study Platform · Enterprise Architecture</small></span></div><a class="ms-footer-link" href="${CARD}" target="_blank" rel="noopener">Digital Card <span aria-hidden="true">↗</span></a></div>`;
      main.append(footer);
    }
    const top=document.createElement('button');top.className='ms-to-top';top.type='button';top.title='العودة إلى الأعلى';top.setAttribute('aria-label','العودة إلى الأعلى');top.textContent='↑';document.body.append(top);
    top.onclick=()=>scrollTo({top:0,behavior:'smooth'});
    const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?Math.min(100,scrollY/max*100):0;prog.firstElementChild.style.width=pct+'%';top.classList.toggle('visible',scrollY>700)};
    addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  }

  function enhancePlatformHeader(){
    const h=document.querySelector('.tp-header');if(!h)return;
    const nav=h.querySelector('.tp-nav');
    if(nav){
      [...nav.querySelectorAll('a')].forEach(a=>{const href=(a.getAttribute('href')||'').split('#')[0];if(href===file)a.classList.add('active')});
      const menu=document.createElement('button');menu.className='ms-nav-toggle';menu.type='button';menu.setAttribute('aria-label','فتح قائمة التنقل');menu.setAttribute('aria-expanded','false');menu.textContent='☰';
      menu.onclick=()=>{const open=h.classList.toggle('ms-nav-open');menu.setAttribute('aria-expanded',String(open))};
      h.insertBefore(menu,nav);
    }
    const theme=document.createElement('button');theme.className='ms-theme-toggle';theme.type='button';theme.setAttribute('aria-label','تبديل المظهر');
    const apply=t=>{document.body.dataset.msTheme=t;theme.textContent=t==='dark'?'☀':'◐';localStorage.setItem('togaf-global-theme',t)};
    apply(localStorage.getItem('togaf-global-theme')||'light');theme.onclick=()=>apply(document.body.dataset.msTheme==='dark'?'light':'dark');h.append(theme);
  }

  function replaceChapterBrand(){
    const mark=document.querySelector('.brand-mark');
    if(mark&&!mark.querySelector('img'))mark.innerHTML='<img src="assets/logo.png" alt="Mahmoud Salama TOGAF logo">';
  }

  function reveal(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const nodes=[...document.querySelectorAll('.tp-card,.section-card,.chapter-header,.tp-hero,.content>.hero')].slice(0,220);
    nodes.forEach(n=>n.classList.add('ms-reveal'));
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('ms-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.05});
    nodes.forEach(n=>io.observe(n));
  }

  function init(){addGlobalUI();enhancePlatformHeader();replaceChapterBrand();reveal()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
