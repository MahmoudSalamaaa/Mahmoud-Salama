import {NAV_ITEMS,PROFILE,VERSION} from './config.js';
import {getLanguage,setLanguage,applyTranslations,t} from './i18n.js';

export function escapeHTML(value=''){return String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
export function safeUrl(value=''){
  try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'#'}catch{return '#'}
}

export function renderShell(){
  const main=document.querySelector('main');if(main)main.id='mainContent';
  if(!document.querySelector('.skip-link'))document.body.insertAdjacentHTML('afterbegin',`<a class="skip-link" href="#mainContent">Skip to content</a>`);
  const current=location.pathname.split('/').pop()||'index.html',lang=getLanguage();
  const header=document.querySelector('[data-app-header]');
  if(header)header.innerHTML=`<div class="header-inner">
    <a class="brand" href="./index.html" aria-label="Mahmoud Salama Career Intelligence home">
      <img src="./mahmoud-salama-logo-optimized.png" alt="Mahmoud Salama logo" onerror="this.src='./icons/logo.svg'">
      <span><strong>Mahmoud Salama</strong><small>${lang==='ar'?'منصة ذكاء التوظيف والمشروعات':'Career & Project Intelligence'}</small></span>
    </a>
    <button class="mobile-menu-button" id="mobileMenuBtn" aria-expanded="false" aria-controls="mainNav">☰ <span data-i18n="menu">${t('menu')}</span></button>
    <nav class="main-nav" id="mainNav" aria-label="Primary navigation">${NAV_ITEMS.map(([href,en,ar])=>`<a href="./${href}" class="${current===href?'active':''}">${lang==='ar'?ar:en}</a>`).join('')}</nav>
    <div class="header-actions"><button class="icon-button" id="languageBtn" aria-label="Change language">${lang==='ar'?'EN':'ع'}</button><button class="icon-button" id="themeBtn" aria-label="Change theme">◐</button></div>
  </div>`;
  const footer=document.querySelector('[data-app-footer]');
  if(footer)footer.innerHTML=`<div class="footer-inner"><p><strong>Mahmoud Salama Career Intelligence</strong> · v${VERSION}</p><p data-i18n="disclaimer">${t('disclaimer')}</p><div class="footer-links"><a href="${PROFILE.website}" target="_blank" rel="noopener">Portfolio</a><a href="${PROFILE.digitalCard}" target="_blank" rel="noopener">Digital Card</a><a href="${PROFILE.cv}" target="_blank" rel="noopener">CV</a><a href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></div></div>`;
  bindShell();applyTranslations();
}

function bindShell(){
  const root=document.documentElement;
  root.dataset.theme=localStorage.getItem('career-theme')||'dark';
  document.getElementById('themeBtn')?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('career-theme',root.dataset.theme)});
  document.getElementById('languageBtn')?.addEventListener('click',()=>setLanguage(getLanguage()==='ar'?'en':'ar'));
  const btn=document.getElementById('mobileMenuBtn'),nav=document.getElementById('mainNav');
  btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});
  window.addEventListener('career-language-change',()=>location.reload());
}

export function showToast(message,type='info'){
  let toast=document.getElementById('appToast');
  if(!toast){toast=document.createElement('div');toast.id='appToast';toast.className='toast';toast.setAttribute('role','status');document.body.append(toast)}
  toast.textContent=message;toast.dataset.type=type;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2600);
}

export function downloadFile(filename,content,type='text/plain;charset=utf-8'){
  const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function toCSV(records){
  const headers=['dataset','title','subtitle','type','region','country','location','fit','profileMatch','availability','status','posted','checked','source','trust','url','notes'];
  return '\uFEFF'+[headers,...records.map(r=>headers.map(h=>r[h]??''))].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
}

export function openModal(content,{wide=false}={}){
  let modal=document.getElementById('appModal');
  if(!modal){modal=document.createElement('div');modal.id='appModal';modal.className='modal';modal.innerHTML='<div class="modal-card"><button class="modal-close" aria-label="Close">×</button><div class="modal-content"></div></div>';document.body.append(modal);modal.querySelector('.modal-close').onclick=()=>closeModal();modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()})}
  modal.querySelector('.modal-card').classList.toggle('wide',wide);modal.querySelector('.modal-content').innerHTML=content;modal.classList.add('open');document.body.classList.add('modal-open');return modal;
}
export function closeModal(){document.getElementById('appModal')?.classList.remove('open');document.body.classList.remove('modal-open')}

export async function registerServiceWorker(){if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('./sw.js')}catch{/* static preview may block */}}}
