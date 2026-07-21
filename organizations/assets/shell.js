import {NAV_ITEMS,SECONDARY_NAV_ITEMS,PROFILE,VERSION} from './config.js';
import {getLanguage,setLanguage,applyTranslations,t} from './i18n.js';
import {initVaultGuard,vaultConfigured,vaultUnlocked} from './vault.js';

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
    <a class="brand" href="./index.html" aria-label="Mahmoud Salama Career Hub home">
      <img src="./mahmoud-salama-logo-optimized.png" alt="Mahmoud Salama logo">
      <span><strong>Mahmoud Salama</strong><small>${lang==='ar'?'دليل الوظائف والجهات':'Career & Opportunity Hub'}</small></span>
    </a>
    <button class="mobile-menu-button" id="mobileMenuBtn" aria-expanded="false" aria-controls="mainNav"><span class="menu-icon" aria-hidden="true">☰</span><span>${t('menu')}</span></button>
    <nav class="main-nav" id="mainNav" aria-label="Primary navigation">
      ${NAV_ITEMS.map(([href,en,ar])=>`<a href="./${href}" class="${current===href?'active':''}">${lang==='ar'?ar:en}</a>`).join('')}
      <details class="more-menu" id="moreMenu"><summary>${lang==='ar'?'المزيد':'More'} <span aria-hidden="true">⌄</span></summary><div class="more-menu-panel">${SECONDARY_NAV_ITEMS.map(([href,en,ar])=>`<a href="./${href}" class="${current===href?'active':''}">${lang==='ar'?ar:en}</a>`).join('')}</div></details>
    </nav>
    <div class="header-actions"><a class="vault-header-indicator" href="./vault.html" title="Encrypted local vault">${vaultConfigured()?(vaultUnlocked()?'🔓':'🔒'):'◇'}</a><button class="icon-button header-icon" id="languageBtn" aria-label="Change language">${lang==='ar'?'EN':'ع'}</button><button class="icon-button header-icon" id="themeBtn" aria-label="Change theme"><span id="themeIcon" aria-hidden="true">☾</span></button></div>
  </div>`;
  const footer=document.querySelector('[data-app-footer]');
  if(footer)footer.innerHTML=`<div class="footer-inner"><div class="footer-brand"><strong>Mahmoud Salama Career & Opportunity Hub</strong><span>v${VERSION}</span></div><p data-i18n="disclaimer">${t('disclaimer')}</p><div class="footer-links"><a href="${PROFILE.website}" target="_blank" rel="noopener">Portfolio</a><a href="${PROFILE.digitalCard}" target="_blank" rel="noopener">Digital Card</a><a href="${PROFILE.cv}" target="_blank" rel="noopener">CV</a><a href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></div></div>`;
  bindShell();initVaultGuard();applyTranslations();
}

function bindShell(){
  const root=document.documentElement;
  root.dataset.theme=localStorage.getItem('career-theme')||'light';
  updateThemeIcon();
  document.getElementById('themeBtn')?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('career-theme',root.dataset.theme);updateThemeIcon()});
  document.getElementById('languageBtn')?.addEventListener('click',()=>setLanguage(getLanguage()==='ar'?'en':'ar'));
  const btn=document.getElementById('mobileMenuBtn'),nav=document.getElementById('mainNav');
  btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));btn.querySelector('.menu-icon').textContent=open?'×':'☰'});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');btn?.setAttribute('aria-expanded','false')}));
  document.addEventListener('click',e=>{const menu=document.getElementById('moreMenu');if(menu?.open&&!menu.contains(e.target))menu.removeAttribute('open')});
  window.addEventListener('career-language-change',()=>location.reload());
}
function updateThemeIcon(){const icon=document.getElementById('themeIcon');if(icon)icon.textContent=document.documentElement.dataset.theme==='dark'?'☀':'☾'}

export function showToast(message,type='info',options={}){
  if(type&&typeof type==='object'){options=type;type='info'}
  let toast=document.getElementById('appToast');
  if(!toast){toast=document.createElement('div');toast.id='appToast';toast.className='toast';toast.setAttribute('role','status');document.body.append(toast)}
  toast.innerHTML=`<span>${escapeHTML(message)}</span>${options?.label?`<button type="button">${escapeHTML(options.label)}</button>`:''}`;
  toast.dataset.type=type;toast.classList.add('show');
  const button=toast.querySelector('button');if(button)button.onclick=()=>{options.onAction?.();toast.classList.remove('show')};
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),options?.duration||4200);
}

export function downloadFile(filename,content,type='text/plain;charset=utf-8'){
  const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function toCSV(records){
  const headers=['dataset','title','subtitle','type','region','country','location','fit','profileMatch','availability','myStatus','status','reviewAgain','reviewReason','reviewReasonOther','applicationDate','deadline','followUp','contactName','contactRole','contactEmail','contactPhone','contactLinkedIn','lastContactDate','nextContactDate','cvVersion','coverLetter','interviewDate','interviewOutcome','linkStatus','freshness','careersLinkQuality','posted','checked','source','trust','url','notes'];
  return '\uFEFF'+[headers,...records.map(r=>headers.map(h=>r[h]??''))].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
}

export function openModal(content,{wide=false}={}){
  let modal=document.getElementById('appModal');
  if(!modal){modal=document.createElement('div');modal.id='appModal';modal.className='modal';modal.innerHTML='<div class="modal-card"><button class="modal-close" aria-label="Close">×</button><div class="modal-content"></div></div>';document.body.append(modal);modal.querySelector('.modal-close').onclick=()=>closeModal();modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()})}
  modal.querySelector('.modal-card').classList.toggle('wide',wide);modal.querySelector('.modal-content').innerHTML=content;modal.classList.add('open');document.body.classList.add('modal-open');return modal;
}
export function closeModal(){document.getElementById('appModal')?.classList.remove('open');document.body.classList.remove('modal-open')}

export async function registerServiceWorker(){if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('./sw.js')}catch{/* static preview may block */}}}

export function toExcelHTML(records,title='Export'){
  const rows=Array.isArray(records)?records:[];const headers=[...new Set(rows.flatMap(r=>Object.keys(r||{})).filter(k=>!['recordSnapshot','history'].includes(k)))];
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHTML(title)}</title><style>table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px}th,td{border:1px solid #bbb;padding:6px;text-align:left}th{background:#e8eef5}</style></head><body><table><thead><tr>${headers.map(h=>`<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${headers.map(h=>`<td>${escapeHTML(r?.[h]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
}
