import {escapeHTML,safeUrl,openModal,closeModal,showToast} from './shell.js';
import {getLanguage,t} from './i18n.js';
import {getTracking,saveTracking,statusesFor,isFavorite,toggleFavorite,addRecentlyViewed,getLinkCheck} from './tracker.js';

const comparison=new Map();
const compareKey=record=>`${record.dataset}:${record.id}`;

function badgeClass(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-')}
function formatDate(value){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?escapeHTML(value):new Intl.DateTimeFormat(getLanguage()==='ar'?'ar-EG':'en-GB',{dateStyle:'medium'}).format(d)}

export function renderCard(record,{query='',compact=false}={}){
  const favorite=isFavorite(record),link=getLinkCheck(record);
  const score=record._search?.profileMatch??record.profileMatch??0;
  const isOpportunity=['job','search','project'].includes(record.recordType);
  const note=(record.notes||'').split(/\n/)[0].slice(0,180);
  return `<article class="result-card simple-card ${compact?'compact':''}" data-key="${escapeHTML(`${record.dataset}:${record.id}`)}">
    <button class="favorite ${favorite?'active':''}" data-action="favorite" aria-label="Favorite">${favorite?'★':'☆'}</button>
    <div class="record-kicker"><span>${escapeHTML(record.type||record.recordType||'Organization')}</span></div>
    <h3>${escapeHTML(record.title)}</h3>
    <p class="record-subtitle">${escapeHTML(record.subtitle||'')}</p>
    <div class="simple-meta"><span>⌖ ${escapeHTML(record.country||record.region||'Africa')}</span>${isOpportunity?`<span>◎ ${score}% ${t('profileMatch')}</span>`:''}<span class="status-pill ${badgeClass(record.availability)}">${escapeHTML(record.availability)}</span></div>
    ${note?`<p class="simple-note">${escapeHTML(note)}${(record.notes||'').length>180?'…':''}</p>`:''}
    ${link?`<span class="link-state ${badgeClass(link.state)}">${escapeHTML(link.state)}</span>`:''}
    <div class="card-actions simple-actions">
      <a class="button primary" href="${safeUrl(record.url)}" target="_blank" rel="noopener" data-action="open">${record.recordType==='directory'?(getLanguage()==='ar'?'فتح الموقع':'Open website'):t('openSource')} ↗</a>
      <button class="button secondary" data-action="details">${t('details')}</button>
    </div>
  </article>`;
}
export function bindCards(container,records,onChange=()=>{}){
  const byKey=new Map(records.map(r=>[`${r.dataset}:${r.id}`,r]));
  container.onclick=e=>{
    const card=e.target.closest('.result-card');if(!card)return;const record=byKey.get(card.dataset.key);if(!record)return;
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='favorite'){const value=toggleFavorite(record);e.target.textContent=value?'★':'☆';e.target.classList.toggle('active',value);onChange();showToast(value?'Added to favorites':'Removed from favorites')}
    if(action==='details')openRecordDetails(record,onChange);
    if(action==='compare')toggleComparison(record,e.target);
    if(action==='open')addRecentlyViewed(record);
  };
  container.onchange=e=>{if(e.target.dataset.action==='status'){const card=e.target.closest('.result-card'),record=byKey.get(card.dataset.key);if(record){saveTracking(record,{status:e.target.value});onChange();showToast('Tracking updated')}}};
}

export function openRecordDetails(record,onChange=()=>{}){
  const tracking=getTracking(record),statuses=statusesFor(record);
  const modal=openModal(`<div class="modal-heading"><div><span class="eyebrow">${escapeHTML(record.dataset)}</span><h2>${escapeHTML(record.title)}</h2><p>${escapeHTML(record.subtitle||'')}</p></div></div>
    <div class="detail-grid">
      <div><span>${t('country')}</span><b>${escapeHTML(record.country||record.region||'—')}</b></div>
      <div><span>${t('profileMatch')}</span><b>${record.profileMatch}%</b></div>
      <div><span>${t('availability')}</span><b>${escapeHTML(record.availability)}</b></div>
      <div><span>${t('trust')}</span><b>${escapeHTML(record.trust)}</b></div>
      <div><span>${t('lastChecked')}</span><b>${formatDate(record.checked)}</b></div>
      <div><span>${t('source')}</span><b>${escapeHTML(record.source||'—')}</b></div>
    </div>
    <p class="record-notes">${escapeHTML(record.notes||'No additional notes.')}</p>
    <form id="trackingForm" class="tracking-form">
      <label>${t('status')}<select name="status">${statuses.map(x=>`<option ${tracking.status===x?'selected':''}>${escapeHTML(x)}</option>`).join('')}</select></label>
      <label>${t('applicationDate')}<input type="date" name="applicationDate" value="${escapeHTML(tracking.applicationDate||'')}"></label>
      <label>${t('deadline')}<input type="date" name="deadline" value="${escapeHTML(tracking.deadline||'')}"></label>
      <label>${t('followUp')}<input type="date" name="followUp" value="${escapeHTML(tracking.followUp||'')}"></label>
      <label>${t('contact')}<input name="contact" value="${escapeHTML(tracking.contact||'')}"></label>
      <label>${t('cvVersion')}<input name="cvVersion" value="${escapeHTML(tracking.cvVersion||'')}"></label>
      <label class="full">${t('coverLetter')}<input name="coverLetter" value="${escapeHTML(tracking.coverLetter||'')}"></label>
      <label class="full">${t('notes')}<textarea name="notes">${escapeHTML(tracking.notes||'')}</textarea></label>
      <div class="form-actions full"><a class="button primary" href="${safeUrl(record.url)}" target="_blank" rel="noopener">${t('openSource')} ↗</a><button class="button secondary" type="submit">${t('save')}</button></div>
    </form>`,{wide:true});
  modal.querySelector('#trackingForm').onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.target));saveTracking(record,values);closeModal();onChange();showToast('Tracking details saved')};
}

export function renderTable(records){
  return `<div class="table-wrap"><table><thead><tr><th>${t('name')}</th><th>${t('country')}</th><th>${t('type')}</th><th>${t('profileMatch')}</th><th>${t('availability')}</th><th>${t('lastChecked')}</th><th>${t('source')}</th></tr></thead><tbody>${records.map(r=>`<tr><td><a href="${safeUrl(r.url)}" target="_blank" rel="noopener">${escapeHTML(r.title)}</a><small>${escapeHTML(r.subtitle||'')}</small></td><td>${escapeHTML(r.country||r.region||'')}</td><td>${escapeHTML(r.type)}</td><td>${r.profileMatch}%</td><td>${escapeHTML(r.availability)}</td><td>${formatDate(r.checked)}</td><td>${escapeHTML(r.source)}</td></tr>`).join('')}</tbody></table></div>`;
}

function toggleComparison(record,button){
  const key=compareKey(record);
  if(comparison.has(key)){comparison.delete(key);button?.classList.remove('active')}
  else{
    if(comparison.size>=3){showToast('Compare up to three records');return}
    comparison.set(key,record);button?.classList.add('active');
  }
  renderCompareBar();
}
function renderCompareBar(){
  let bar=document.getElementById('compareBar');
  if(!comparison.size){bar?.remove();return}
  if(!bar){bar=document.createElement('div');bar.id='compareBar';bar.className='compare-bar';document.body.append(bar)}
  bar.innerHTML=`<div><strong>${comparison.size} selected</strong><span>Compare profile match, source trust, availability and market.</span></div><div><button class="button secondary" data-clear>Clear</button><button class="button primary" data-open>${t('compare')}</button></div>`;
  bar.querySelector('[data-clear]').onclick=()=>{comparison.clear();bar.remove();document.querySelectorAll('.compare-button.active').forEach(x=>x.classList.remove('active'))};
  bar.querySelector('[data-open]').onclick=openComparison;
}
function openComparison(){
  const rows=[...comparison.values()];
  openModal(`<div class="modal-heading"><span class="eyebrow">Side-by-side review</span><h2>${t('compare')}</h2></div><div class="comparison-table"><table><thead><tr><th>Criteria</th>${rows.map(r=>`<th>${escapeHTML(r.title)}</th>`).join('')}</tr></thead><tbody><tr><th>${t('profileMatch')}</th>${rows.map(r=>`<td><b>${r._search?.profileMatch??r.profileMatch}%</b></td>`).join('')}</tr><tr><th>${t('country')}</th>${rows.map(r=>`<td>${escapeHTML(r.country||r.region||'—')}</td>`).join('')}</tr><tr><th>${t('type')}</th>${rows.map(r=>`<td>${escapeHTML(r.type||'—')}</td>`).join('')}</tr><tr><th>${t('availability')}</th>${rows.map(r=>`<td>${escapeHTML(r.availability||'—')}</td>`).join('')}</tr><tr><th>${t('trust')}</th>${rows.map(r=>`<td>${escapeHTML(r.trust||'—')}</td>`).join('')}</tr><tr><th>${t('source')}</th>${rows.map(r=>`<td>${escapeHTML(r.source||'—')}</td>`).join('')}</tr><tr><th>Action</th>${rows.map(r=>`<td><a class="button primary small" href="${safeUrl(r.url)}" target="_blank" rel="noopener">${t('openSource')}</a></td>`).join('')}</tr></tbody></table></div>`,{wide:true});
}
