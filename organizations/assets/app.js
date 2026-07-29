(function(){'use strict';
const d=document,$=id=>d.getElementById(id),txt=v=>String(v==null?'':v).trim(),esc=v=>txt(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const APP_KEY='career_application_status_v1',THEME_KEY='career_theme_v1';
const statuses=['Not Reviewed','Saved','Interested','Applied','Follow-up','Interview','Offer','Rejected','Withdrawn','Not Available'];
function store(){try{return JSON.parse(localStorage.getItem(APP_KEY)||'{}')||{}}catch(_){return{}}}
function save(id,value){const s=store();s[id]={value,updatedAt:new Date().toISOString()};try{localStorage.setItem(APP_KEY,JSON.stringify(s))}catch(_){} window.dispatchEvent(new CustomEvent('career-status-changed',{detail:{id,value}}));}
function theme(value){d.documentElement.dataset.theme=value;try{localStorage.setItem(THEME_KEY,value)}catch(_){} }
try{theme(localStorage.getItem(THEME_KEY)||'light')}catch(_){theme('light')}
d.addEventListener('DOMContentLoaded',()=>{
 $('themeBtn')?.addEventListener('click',()=>theme(d.documentElement.dataset.theme==='dark'?'light':'dark'));
 $('menuBtn')?.addEventListener('click',()=>d.querySelector('.nav')?.classList.toggle('open'));
 const current=location.pathname.split('/').pop()||'index.html';d.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')?.endsWith(current)));
 if(d.body.dataset.page==='listing') initListing();
 initTracker();
});
function data(){return Array.isArray(window.__CAREER_PAGE_DATA__)?window.__CAREER_PAGE_DATA__:Array.isArray(window.CAREER_PAGE_DATA)?window.CAREER_PAGE_DATA:[]}
function rid(r,i){return txt(r.id||r.job_id||r.record_id)||`record-${i}`}
function title(r){return txt(r.title||r.name||r.company||r.organization)||'Untitled record'}
function org(r){return txt(r.company||r.organization||r.employer||'')}
function country(r){return txt(r.country||r.location||r.region||'')}
function type(r){return txt(r.type||r.category||r.sector||r.record_type||'Record')}
function url(r){return txt(r.url||r.link||r.career_url||r.website||'')}
function currentStatus(id,r){return txt(store()[id]?.value||r.application_status||'Not Reviewed')}
function select(id,value){return `<select class="status-select" data-id="${esc(id)}" aria-label="Application status">${statuses.map(s=>`<option${s===value?' selected':''}>${esc(s)}</option>`).join('')}</select>`}
function initListing(){
 const all=data();let filtered=[...all],page=1,view='cards';
 const q=$('searchInput'),countryFilter=$('countryFilter'),typeFilter=$('typeFilter'),appFilter=$('applicationFilter'),size=$('pageSize'),results=$('results'),count=$('resultCount'),pagination=$('pagination');
 function fill(el,vals){if(!el)return;[...new Set(vals.filter(Boolean))].sort().forEach(v=>{const o=d.createElement('option');o.value=o.textContent=v;el.appendChild(o)})}
 fill(countryFilter,all.map(country));fill(typeFilter,all.map(type));fill(appFilter,statuses);
 function apply(){const query=txt(q?.value).toLowerCase(),c=countryFilter?.value||'',t=typeFilter?.value||'',a=appFilter?.value||'';filtered=all.filter((r,i)=>{const id=rid(r,i);if(query&&!JSON.stringify(r).toLowerCase().includes(query))return false;if(c&&country(r)!==c)return false;if(t&&type(r)!==t)return false;if(a&&currentStatus(id,r)!==a)return false;return true});page=1;render()}
 function card(r,i){const id=rid(r,i),s=currentStatus(id,r),u=url(r);return `<article class="record-card" data-record-id="${esc(id)}" data-status="${esc(s)}"><div class="record-meta"><span class="badge">${esc(type(r))}</span><span class="badge">${esc(country(r)||'Location not specified')}</span></div><h3>${esc(title(r))}</h3><div class="org">${esc(org(r))}</div><p>${esc(txt(r.summary||r.notes||'Review the source and verify current availability before applying.'))}</p><div class="card-actions">${u?`<a class="primary" href="${esc(u)}" target="_blank" rel="noopener">Open source</a>`:''}${select(id,s)}</div></article>`}
 function table(rows,offset){return `<div class="table-scroll"><table class="data-table"><thead><tr><th>Title</th><th>Organization</th><th>Country</th><th>Type</th><th>Application</th><th>Source</th></tr></thead><tbody>${rows.map((r,j)=>{const id=rid(r,offset+j),s=currentStatus(id,r),u=url(r);return `<tr data-record-id="${esc(id)}"><td>${esc(title(r))}</td><td>${esc(org(r))}</td><td>${esc(country(r))}</td><td>${esc(type(r))}</td><td>${select(id,s)}</td><td>${u?`<a href="${esc(u)}" target="_blank" rel="noopener">Open</a>`:'—'}</td></tr>`}).join('')}</tbody></table></div>`}
 function bindStatuses(){results?.querySelectorAll('.status-select').forEach(el=>el.addEventListener('change',()=>{save(el.dataset.id,el.value);const host=el.closest('[data-record-id]');if(host)host.dataset.status=el.value}))}
 function render(){const ps=Number(size?.value||25),pages=Math.max(1,Math.ceil(filtered.length/ps));if(page>pages)page=pages;const offset=(page-1)*ps,rows=filtered.slice(offset,offset+ps);if(count)count.textContent=`${filtered.length.toLocaleString()} results`;if(results)results.innerHTML=rows.length?(view==='table'?table(rows,offset):`<div class="card-grid">${rows.map((r,j)=>card(r,offset+j)).join('')}</div>`):'<div class="empty">No records match the selected filters.</div>';if(pagination){pagination.innerHTML='';for(let i=1;i<=pages;i++){const b=d.createElement('button');b.textContent=i;b.className=i===page?'active':'';b.onclick=()=>{page=i;render()};pagination.appendChild(b)}}bindStatuses()}
 [q].forEach(x=>x?.addEventListener('input',apply));[countryFilter,typeFilter,appFilter,size].forEach(x=>x?.addEventListener('change',apply));$('clearFilters')?.addEventListener('click',()=>{if(q)q.value='';[countryFilter,typeFilter,appFilter].forEach(x=>{if(x)x.value=''});apply()});d.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;render()}));$('exportBtn')?.addEventListener('click',()=>{const rows=[['Title','Organization','Country','Type','Application','URL'],...filtered.map((r,i)=>[title(r),org(r),country(r),type(r),currentStatus(rid(r,i),r),url(r)])];const csv=rows.map(row=>row.map(v=>'"'+txt(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=d.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download=(d.title||'export').replace(/\W+/g,'-')+'.csv';a.click();URL.revokeObjectURL(a.href)});render();
}
function initTracker(){const host=$('trackerRows');if(!host)return;const s=store(),entries=Object.entries(s);host.innerHTML=entries.length?entries.map(([id,x])=>`<tr><td>${esc(id)}</td><td>${esc(x.value)}</td><td>${esc((x.updatedAt||'').slice(0,10))}</td></tr>`).join(''):'<tr><td colspan="3">No status updates have been saved yet.</td></tr>';const n=$('trackedCount');if(n)n.textContent=entries.length}
})();