const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const STORE={apps:'career_apps_v4',contacts:'career_contacts_v4',saved:'career_saved_searches_v4',issues:'career_issue_reports_v4',favorites:'career_favorites_v4',availability:'career_availability_overrides_v4',preferences:'career_job_preferences_v1'};
const AVAILABILITY_OPTIONS=['Not Verified','Available','Possibly Available','Deadline Approaching','Career Page Available','Active Employer','Active Agency','Active Portal','Active Platform','Live Search','Expired','Not Available','Inactive','Broken Link'];
const APPLICATION_OPTIONS=['Not Reviewed','Saved','Interested','Shortlisted','Applied','Follow-up','Interview','Offer','Rejected','Withdrawn','Not Suitable','Ignored','Not Available'];
const MEMORY_STORE={};const storageCandidates=()=>{const out=[];for(const name of ['localStorage','sessionStorage']){try{const store=globalThis[name];if(store)out.push(store)}catch{}}return out};const getRaw=(k,d=null)=>{for(const store of storageCandidates()){try{const raw=store.getItem(k);if(raw!==null)return raw}catch{}}return Object.prototype.hasOwnProperty.call(MEMORY_STORE,k)?MEMORY_STORE[k]:d};const setRaw=(k,v)=>{MEMORY_STORE[k]=v;for(const store of storageCandidates()){try{store.setItem(k,String(v));return true}catch{}}return false};const get=(k,d={})=>{const raw=getRaw(k,null);if(raw===null||raw===undefined)return d;if(typeof raw!=='string')return raw;try{return JSON.parse(raw)??d}catch{return d}},set=(k,v)=>{MEMORY_STORE[k]=v;return setRaw(k,JSON.stringify(v))};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>(globalThis.crypto&&crypto.randomUUID?crypto.randomUUID():p+'-'+Date.now()+'-'+Math.random().toString(16).slice(2));
function toast(t){const x=$('#toast');if(!x)return;x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
function download(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),600)}
function csv(rows){if(!rows.length)return '';const keys=['title','organization','record_type','type','industry','region','country','location','availability_status','published_date','last_checked','match_score','source','source_quality','url','notes'];return [keys,...rows.map(r=>keys.map(k=>r[k]??''))].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')}
function qs(){return new URLSearchParams(location.search)}
function application(id){return get(STORE.apps,{})[id]||{status:'Not Reviewed',notes:'',applied_date:'',follow_up:''}}
function favorite(id){return get(STORE.favorites,[]).includes(id)}
function effectiveAvailability(r){return get(STORE.availability,{})[r.id]||r.availability_status||'Not Verified'}
function fitTier(score){score=Number(score||0);return score>=95?'Best Fit':score>=88?'Strong Fit':score>=78?'Good Fit':score>=65?'Moderate Fit':'Low Fit'}
function fitTierClass(score){score=Number(score||0);return score>=95?'fit-best':score>=88?'fit-strong':score>=78?'fit-good':score>=65?'fit-medium':'fit-low'}
function statusSlug(value){return String(value||'not-reviewed').trim().toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'not-reviewed'}
function applicationStatusClass(value){return 'app-status-'+statusSlug(value)}
function availabilityStatusClass(value){return 'availability-status-'+statusSlug(value)}
function removeStatusClasses(element,prefix){if(!element)return;[...element.classList].filter(name=>name.startsWith(prefix)).forEach(name=>element.classList.remove(name))}
function applicationBadge(status){return `<span class="badge application-state-badge ${applicationStatusClass(status)}" data-application-badge>Application · ${esc(status)}</span>`}
function statusLegend(){return `<span class="application-legend" aria-label="Application status color key"><i class="app-status-saved">Saved</i><i class="app-status-applied">Applied</i><i class="app-status-interview">Interview</i><i class="app-status-offer">Offer</i><i class="app-status-rejected">Rejected</i></span>`}
function paintApplicationSurface(element,status){if(!element)return;removeStatusClasses(element,'app-status-');element.classList.add(applicationStatusClass(status));element.dataset.applicationStatus=status}
function paintAvailabilitySurface(element,status){if(!element)return;removeStatusClasses(element,'availability-status-');element.classList.add(availabilityStatusClass(status));element.dataset.availabilityStatus=status}
function paintStatusVisuals(root,records){if(!root)return;const map=Array.isArray(records)?Object.fromEntries(records.map(r=>[String(r.id),r])):records||{};
  root.querySelectorAll('[data-status-record]').forEach(box=>{const id=String(box.dataset.statusRecord),record=map[id]||{id,availability_status:'Not Verified'},ap=application(id).status,av=effectiveAvailability(record);paintApplicationSurface(box,ap);paintAvailabilitySurface(box,av);const card=box.closest('.record-card,.hit-card,.lifestyle-card,.new-job-card,.vacancy-card,article');if(card){card.classList.add('status-colored-card');paintApplicationSurface(card,ap);paintAvailabilitySurface(card,av);const badges=card.querySelector('.badges');if(badges){let badge=badges.querySelector('[data-application-badge]');if(!badge){badges.insertAdjacentHTML('beforeend',applicationBadge(ap));badge=badges.querySelector('[data-application-badge]')}badge.textContent='Application · '+ap;paintApplicationSurface(badge,ap)}}const row=box.closest('tr');if(row){row.classList.add('status-colored-row');paintApplicationSurface(row,ap);paintAvailabilitySurface(row,av)}const appSelect=box.querySelector('[data-application]');if(appSelect)paintApplicationSurface(appSelect,ap);const avSelect=box.querySelector('[data-availability]');if(avSelect)paintAvailabilitySurface(avSelect,av);const current=box.querySelector('[data-current-application]');if(current)current.textContent=ap});
  root.querySelectorAll('[data-application]').forEach(select=>{const id=String(select.dataset.application),ap=application(id).status;paintApplicationSurface(select,ap);const row=select.closest('tr');if(row){row.classList.add('status-colored-row');paintApplicationSurface(row,ap);let badge=row.querySelector('[data-row-application-badge]');if(badge){badge.textContent=ap;paintApplicationSurface(badge,ap)}}});
  root.querySelectorAll('[data-availability]').forEach(select=>{const id=String(select.dataset.availability),record=map[id]||{id,availability_status:'Not Verified'},av=effectiveAvailability(record);paintAvailabilitySurface(select,av);const row=select.closest('tr');if(row)paintAvailabilitySurface(row,av)});
}

function badgeClass(v){v=(v||'').toLowerCase();return /available|active|offer|interview|live search/.test(v)&&!/not|possibly/.test(v)?'good':/expired|not available|inactive|rejected|withdrawn|not suitable|broken/.test(v)?'bad':'warn'}
function saveFavorite(id){let a=get(STORE.favorites,[]);a=a.includes(id)?a.filter(x=>x!==id):[...a,id];set(STORE.favorites,a);toast(a.includes(id)?'Saved to favorites':'Removed from favorites')}
function setAvailability(r,status){const a=get(STORE.availability,{});a[r.id]=status;set(STORE.availability,a);window.dispatchEvent(new CustomEvent('career-status-changed',{detail:{id:r.id,type:'availability',status}}));toast('Availability updated')}
function setApplication(r,status){const a=get(STORE.apps,{}),old=a[r.id]||{};a[r.id]={...old,status,title:r.title,organization:r.organization||r.company||'',country:r.country||'',url:r.url||'',record_id:r.id,applied_date:status==='Applied'&&!old.applied_date?new Date().toISOString().slice(0,10):old.applied_date||'',updated:new Date().toISOString()};set(STORE.apps,a);window.dispatchEvent(new CustomEvent('career-status-changed',{detail:{id:r.id,type:'application',status}}));toast('Application status updated')}
function reportIssue(r,type){const a=get(STORE.issues,[]);a.push({id:uid('issue'),record_id:r.id,title:r.title,type,reported_at:new Date().toISOString(),url:r.url});set(STORE.issues,a);toast('Issue saved for review')}
function optionTags(options,current){const values=options.includes(current)?options:[current,...options].filter(Boolean);return values.map(x=>`<option value="${esc(x)}" ${current===x?'selected':''}>${esc(x)}</option>`).join('')}
function statusControls(r){const av=effectiveAvailability(r),ap=application(r.id).status;return `<div class="job-status-controls ${applicationStatusClass(ap)} ${availabilityStatusClass(av)}" data-status-record="${esc(r.id)}"><div class="job-status-summary"><span>My application status</span><strong data-current-application>${esc(ap)}</strong></div><label class="availability-field"><span>Vacancy availability</span><select class="job-status-select availability-select ${availabilityStatusClass(av)}" data-availability="${esc(r.id)}">${optionTags(AVAILABILITY_OPTIONS,av)}</select></label><label class="application-field"><span>Application status</span><select class="job-status-select application-select ${applicationStatusClass(ap)}" data-application="${esc(r.id)}">${optionTags(APPLICATION_OPTIONS,ap)}</select></label></div>`}
function bindStatusControls(root,records){if(!root)return;const map=Array.isArray(records)?Object.fromEntries(records.map(r=>[String(r.id),r])):records||{};paintStatusVisuals(root,map);root.querySelectorAll('[data-availability]').forEach(el=>{el.onchange=e=>{e.stopPropagation();const r=map[String(el.dataset.availability)];if(r){setAvailability(r,el.value);paintStatusVisuals(root,map)}}});root.querySelectorAll('[data-application]').forEach(el=>{el.onchange=e=>{e.stopPropagation();const r=map[String(el.dataset.application)];if(r){setApplication(r,el.value);paintStatusVisuals(root,map)}}})}
function closeDrawer(){const d=$('#detailDrawer'),b=$('#drawerBackdrop');if(d)d.classList.remove('open');if(b)b.classList.remove('open')}
function initShell(){const active=document.body.dataset.navActive||document.body.dataset.page;$$('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===active));const theme=$('#themeBtn');document.documentElement.dataset.theme=getRaw('careerTheme','light')||'light';if(theme)theme.onclick=()=>{const n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;setRaw('careerTheme',n)};const menu=$('#menuBtn'),nav=$('#mainNav');if(menu&&nav)menu.onclick=()=>nav.classList.toggle('open');const close=$('#drawerClose'),backdrop=$('#drawerBackdrop');if(close)close.onclick=closeDrawer;if(backdrop)backdrop.onclick=closeDrawer;document.addEventListener('click',e=>{$$('details.more-menu[open]').forEach(d=>{if(!d.contains(e.target))d.removeAttribute('open')})});setTimeout(checkDueFollowups,650)}
function checkDueFollowups(){const today=new Date().toISOString().slice(0,10),due=Object.values(get(STORE.apps,{})).filter(a=>a.follow_up&&a.follow_up<=today&&!['Offer','Rejected','Withdrawn','Not Suitable','Ignored','Not Available'].includes(a.status));if(due.length)toast(`${due.length} follow-up reminder${due.length>1?'s':''} due`)}
async function loadJSON(url){const key=String(url).split('/').pop().replace(/\.json$/,'').replace(/-/g,'_');if(window.CAREER_CORE_DATA&&Object.prototype.hasOwnProperty.call(window.CAREER_CORE_DATA,key))return window.CAREER_CORE_DATA[key];const r=await fetch(url);if(!r.ok)throw new Error(url);return r.json()}
function openDrawer(r){const d=$('#detailDrawer'),b=$('#drawerBackdrop'),box=$('#drawerContent');if(!d||!b||!box)return;const a=application(r.id),m=r.match||{};box.className='drawer-status-surface '+applicationStatusClass(a.status)+' '+availabilityStatusClass(effectiveAvailability(r));const sources=(r.sources||[]).length?r.sources:(r.url?[{name:r.source||'Source',url:r.url,quality:r.source_quality||'B'}]:[]);box.innerHTML=`<p class="eyebrow">${esc(r.record_type||'Record')}</p><h2 class="detail-title">${esc(r.title)}</h2><p>${esc(r.organization||r.subtitle||'')}</p><div class="badges"><span class="badge ${badgeClass(effectiveAvailability(r))}">${esc(effectiveAvailability(r))}</span>${applicationBadge(a.status)}<span class="badge fit-tier ${fitTierClass(r.match_score)}">${fitTier(r.match_score)}</span>${r.is_priority||r.priority_tier?'<span class="badge gold">Priority employer</span>':''}<span class="badge quality-${esc((r.source_quality||'d').toLowerCase())}">Source ${esc(r.source_quality||'D')}</span><span class="score">${r.match_score||0}%</span></div><div class="match-bars">${['role','seniority','industry','location','technology'].map(k=>`<div class="match-row"><span>${k}</span><div class="bar"><i style="width:${m[k]||0}%"></i></div><b>${m[k]||0}</b></div>`).join('')}</div><div class="detail-grid">${[['Country',r.country],['Region',r.region],['Location',r.location],['Type',r.industry||r.type],['Published',r.published_date||r.posted_text||'Not provided'],['Last checked',r.last_checked||'Not provided'],['Verification',r.verification_level||'Not provided'],['Source quality',r.source_quality_label||r.source_quality||'Not provided']].map(x=>`<div class="detail-box"><small>${x[0]}</small>${esc(x[1]||'Not provided')}</div>`).join('')}</div><h3>Notes</h3><p>${esc(r.notes||'No notes')}</p><h3>Sources</h3><ul class="source-list">${sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name||s.url)}</a> <span class="badge quality-${esc((s.quality||'d').toLowerCase())}">${esc(s.quality||'')}</span></li>`).join('')||'<li>No source URL</li>'}</ul><div class="drawer-status-block"><h3>Availability</h3><label>Status<select id="drawerAvailability" class="job-status-select availability-select ${availabilityStatusClass(effectiveAvailability(r))}">${optionTags(AVAILABILITY_OPTIONS,effectiveAvailability(r))}</select></label><h3>Application</h3><label>Status<select id="drawerStatus" class="job-status-select application-select ${applicationStatusClass(a.status)}">${optionTags(APPLICATION_OPTIONS,a.status)}</select></label></div><div class="card-actions">${r.url?`<a class="button" href="${esc(r.url)}" target="_blank" rel="noopener">Open source</a>`:''}${r.internal_profile?`<a class="secondary" href="${esc(r.internal_profile)}">Employer profile</a>`:''}<button class="secondary" id="drawerFav">${favorite(r.id)?'Unsave':'Save'}</button><button class="secondary" data-issue="Broken link">Broken link</button><button class="secondary" data-issue="Duplicate record">Duplicate</button></div>`;d.classList.add('open');b.classList.add('open');$('#drawerAvailability').onchange=e=>{setAvailability(r,e.target.value);openDrawer(r)};$('#drawerStatus').onchange=e=>{setApplication(r,e.target.value);openDrawer(r)};$('#drawerFav').onclick=()=>saveFavorite(r.id);$$('[data-issue]').forEach(x=>x.onclick=()=>reportIssue(r,x.dataset.issue))}
function card(r){const a=application(r.id),av=effectiveAvailability(r);return `<article class="record-card status-colored-card ${applicationStatusClass(a.status)} ${availabilityStatusClass(av)} ${r.is_priority||r.priority_tier?'priority':''}" data-application-status="${esc(a.status)}" data-availability-status="${esc(av)}"><div class="badges"><span class="badge ${badgeClass(av)}">${esc(av)}</span>${applicationBadge(a.status)}<span class="badge fit-tier ${fitTierClass(r.match_score)}">${fitTier(r.match_score)}</span>${r.is_priority||r.priority_tier?'<span class="badge gold">Priority</span>':''}<span class="badge">${esc(r.record_type||'Record')}</span><span class="badge quality-${esc((r.source_quality||'d').toLowerCase())}">Source ${esc(r.source_quality||'D')}</span></div><h3>${esc(r.title)}</h3><div class="org">${esc(r.organization||r.subtitle||'')}</div><div class="record-meta"><span>${esc(r.country||r.region||'')}</span><span>${esc(r.industry||r.type||'')}</span><span>${esc(r.published_date||r.posted_text||'Date not provided')}</span><span class="application-meta ${applicationStatusClass(a.status)}">Application: <b>${esc(a.status)}</b></span></div>${r.notes?`<p class="record-note">${esc(String(r.notes).slice(0,180))}${String(r.notes).length>180?'…':''}</p>`:''}${statusControls(r)}<div class="card-actions"><button data-detail="${esc(r.id)}">Details · ${r.match_score||0}%</button>${r.url?`<a class="secondary" href="${esc(r.url)}" target="_blank" rel="noopener">Open</a>`:''}${r.internal_profile?`<a class="secondary" href="${esc(r.internal_profile)}">Profile</a>`:''}<button class="secondary" data-fav="${esc(r.id)}">${favorite(r.id)?'★':'☆'}</button></div></article>`}
function table(rows){return `<div class="table-scroll"><table class="data-table status-aware-table"><thead><tr><th>Title</th><th>Organization</th><th>Type</th><th>Region</th><th>Availability</th><th>Application</th><th>Match</th><th>Source</th><th></th></tr></thead><tbody>${rows.map(r=>{const ap=application(r.id).status,av=effectiveAvailability(r);return `<tr class="status-colored-row ${applicationStatusClass(ap)} ${availabilityStatusClass(av)}" data-application-status="${esc(ap)}"><td><b>${esc(r.title)}</b><br><small>${esc(r.record_type||'')}</small></td><td>${esc(r.organization||'')}</td><td>${esc(r.industry||r.type||'')}</td><td>${esc(r.country||r.region||'')}</td><td><select class="job-status-select table-status-select availability-select ${availabilityStatusClass(av)}" data-availability="${esc(r.id)}">${optionTags(AVAILABILITY_OPTIONS,av)}</select></td><td><span class="table-application-badge ${applicationStatusClass(ap)}" data-row-application-badge>${esc(ap)}</span><select class="job-status-select table-status-select application-select ${applicationStatusClass(ap)}" data-application="${esc(r.id)}">${optionTags(APPLICATION_OPTIONS,ap)}</select></td><td><span class="score">${r.match_score||0}%</span></td><td><span class="quality-${esc((r.source_quality||'d').toLowerCase())}">${esc(r.source_quality||'D')}</span> ${esc(r.source||'')}</td><td><button data-detail="${esc(r.id)}">Details</button></td></tr>`}).join('')}</tbody></table></div>`}
const WORKER_SOURCE=`let records=[];
self.onmessage=e=>{
 const m=e.data;
 if(m.type==='loadRecords'){
  records=(m.records||[]).map(r=>({...r,__hay:Object.values(r).filter(v=>typeof v==='string'||typeof v==='number').join(' ').toLowerCase()}));
  self.postMessage({type:'loaded',count:records.length});return
 }
 if(m.type==='search'){
  const out=run(m);
  self.postMessage({type:'results',requestId:m.requestId,total:out.length,records:out.slice(m.offset,m.offset+m.limit),facets:facets(out)})
 }
};
function tokens(q){const a=[],re=/(-?)(?:"([^"]+)"|(\w+):(?:"([^"]+)"|(\S+))|(\S+))/g;let m;while((m=re.exec(q||''))){if(m[3])a.push({field:m[3].toLowerCase(),value:(m[4]||m[5]||'').toLowerCase(),neg:m[1]==='-'});else a.push({value:(m[2]||m[6]||'').toLowerCase(),neg:m[1]==='-'})}return a}
function fmap(f){return({company:'organization',org:'organization',status:'availability_status',quality:'source_quality',match:'match_score',sector:'industry'})[f]||f}
function dateVal(r){return Date.parse(r.published_date||r.last_checked||'1900-01-01')||0}
function badAvailability(v){return /^(expired|not available|inactive|broken link|closed|vacancy closed|no longer available)$/i.test(String(v||''))}
function badApplication(v){return /^(rejected|withdrawn|not suitable|ignored|not available)$/i.test(String(v||''))}
const ROLE={
 technology_leadership:['cto','chief technology','technology director','it director','head of technology','technology lead','digital director','cio'],
 enterprise_architecture:['enterprise architect','solution architect','technical architect','domain architect','architecture lead','chief architect'],
 digital_transformation:['digital transformation','transformation director','transformation lead','digital strategy','business transformation'],
 program_delivery:['program manager','programme manager','project manager','delivery manager','portfolio manager','pmo','technical program'],
 healthcare_it:['healthcare technology','healthtech','digital health','health informatics','clinical system','healthcare it','fhir','hl7'],
 data_analytics:['data architect','data platform','analytics','business intelligence','power bi','data warehouse','data governance'],
 cloud_devops:['cloud','devops','sre','site reliability','gitops','kubernetes','openstack','infrastructure'],
 consulting_freelance:['consultant','consulting','advisor','advisory','freelance','fractional','contract']
};
const REGION={
 egypt:['egypt','cairo','giza','alexandria'],
 gcc:['gcc','saudi','riyadh','jeddah','uae','dubai','abu dhabi','qatar','doha','oman','muscat','kuwait','bahrain'],
 africa:['africa','south africa','nigeria','kenya','ghana','uganda','morocco','tunisia','algeria','côte d’ivoire','ivory coast'],
 remote:['remote','worldwide','global','home based','work from home','anywhere in the world'],
 europe:['europe','emea','united kingdom','uk','germany','france','netherlands','spain','italy','poland']
};
const MODEL={remote:['remote','work from home','home based','worldwide','anywhere'],hybrid:['hybrid'],onsite:['on-site','onsite','in office','in-office']};
const ENGAGEMENT={fulltime:['full time','full-time','permanent'],contract:['contract','fixed term','consultancy','consultant'],consulting:['consulting','freelance','fractional','project based','independent'],parttime:['part time','part-time','hourly']};
function any(hay,selected,map){return !selected?.length||selected.some(k=>(map[k]||[]).some(word=>hay.includes(word)))}
function prefResult(r,p,av,app){
 if(!p||!p.enabled)return{ok:true,boost:0};
 const availability=av[r.id]||r.availability_status||'Not Verified',application=app[r.id]?.status||'Not Reviewed';
 if(Number(r.match_score||0)<Number(p.minFit||0))return{ok:false,boost:0};
 if(p.hideUnavailable&&badAvailability(availability))return{ok:false,boost:0};
 if(p.hideNegative&&badApplication(application))return{ok:false,boost:0};
 const role=any(r.__hay,p.roles,ROLE),region=any(r.__hay,p.regions,REGION),model=any(r.__hay,p.workModels,MODEL),engagement=any(r.__hay,p.engagements,ENGAGEMENT);
 if(p.mode==='strict'&&(!role||!region||!model||!engagement))return{ok:false,boost:0};
 return{ok:true,boost:(role?16:0)+(region?10:0)+(model?6:0)+(engagement?4:0)}
}
function run(m){
 const ts=tokens(m.query),f=m.filters||{},app=m.application||{},av=m.availability_overrides||{},p=m.preferences||{};
 let out=records.filter(r=>{
  for(const t of ts){const ok=t.field?String(r[fmap(t.field)]||'').toLowerCase().includes(t.value):r.__hay.includes(t.value);if(t.neg?ok:!ok)return false}
  const availability=av[r.id]||r.availability_status;
  if(f.record_type&&r.record_type!==f.record_type)return false;
  if(f.availability&&availability!==f.availability)return false;
  if(f.country&&r.country!==f.country)return false;
  if(f.region&&r.region!==f.region)return false;
  if(f.type&&(r.industry||r.type)!==f.type)return false;
  if(f.source&&r.source!==f.source)return false;
  if(f.quality&&r.source_quality!==f.quality)return false;
  if(f.priority&&!(r.is_priority||r.priority_tier))return false;
  if((r.match_score||0)<(f.match||0))return false;
  if(f.application&&(app[r.id]?.status||'Not Reviewed')!==f.application)return false;
  return prefResult(r,p,av,app).ok
 });
 const s=m.sort||'match';
 function recommended(a,b){
  const avA=av[a.id]||a.availability_status||'Not Verified',avB=av[b.id]||b.availability_status||'Not Verified';
  const apA=app[a.id]?.status||'Not Reviewed',apB=app[b.id]?.status||'Not Reviewed';
  const badA=badAvailability(avA)||badApplication(apA)?1:0,badB=badAvailability(avB)||badApplication(apB)?1:0;
  if(badA!==badB)return badA-badB;
  const prefA=prefResult(a,p,av,app).boost,prefB=prefResult(b,p,av,app).boost;
  const fit=(Number(b.match_score||0)+prefB)-(Number(a.match_score||0)+prefA);
  if(fit)return fit;
  return dateVal(b)-dateVal(a)||String(a.title||'').localeCompare(String(b.title||''))
 }
 out.sort((a,b)=>s==='title'?String(a.title||'').localeCompare(String(b.title||'')):s==='country'?String(a.country||a.region||'').localeCompare(String(b.country||b.region||'')):s==='quality'?String(a.source_quality||'Z').localeCompare(String(b.source_quality||'Z')):s==='newest'?dateVal(b)-dateVal(a):s==='match_only'?(b.match_score||0)-(a.match_score||0):recommended(a,b));
 return out
}
function facets(rows){
 const o={};for(const k of ['record_type','availability_status','country','region','source'])o[k]=[...new Set(rows.map(r=>r[k]).filter(Boolean))].sort();
 o.type=[...new Set(rows.map(r=>r.industry||r.type).filter(Boolean))].sort();return o
}`;
function createWorker(){try{return new Worker(URL.createObjectURL(new Blob([WORKER_SOURCE],{type:'text/javascript'})))}catch(e){console.warn('Worker unavailable',e);return null}}
async function initListing(){
  const raw=Array.isArray(window.CAREER_PAGE_DATA)?window.CAREER_PAGE_DATA:await loadJSON('./'+document.body.dataset.file);
  const data=Array.isArray(raw)?raw:(raw?.records||raw?.jobs||raw?.platforms||raw?.companies||raw?.items||[]);
  const params=qs(),savedId=params.get('saved'),pendingSaved=savedId?get(STORE.saved,[]).find(x=>x.id===savedId):null;
  let current=[],view='cards',page=1,total=0,facets={},requestId=0,worker=createWorker(),workerReady=false,workerFailed=false;
  const required=['results','resultCount','searchInput','recordTypeFilter','availabilityFilter','applicationFilter','countryFilter','regionFilter','typeFilter','sourceFilter','qualityFilter','priorityFilter','matchFilter','sortSelect','pageSize'];
  const missing=required.filter(id=>!$('#'+id));
  if(missing.length){console.error('Listing page is missing controls:',missing);return}

  function filters(){return{
    record_type:$('#recordTypeFilter').value,
    availability:$('#availabilityFilter').value,
    application:$('#applicationFilter').value,
    country:$('#countryFilter').value,
    region:$('#regionFilter').value,
    type:$('#typeFilter').value,
    source:$('#sourceFilter').value,
    quality:$('#qualityFilter').value,
    priority:$('#priorityFilter').checked,
    match:+$('#matchFilter').value
  }}
  function queryTokens(q){
    const out=[],rx=/(-?)(?:"([^"]+)"|(\w+):(?:"([^"]+)"|(\S+))|(\S+))/g;let m;
    while((m=rx.exec(q||''))){if(m[3])out.push({field:m[3].toLowerCase(),value:(m[4]||m[5]||'').toLowerCase(),neg:m[1]==='-'});else out.push({value:(m[2]||m[6]||'').toLowerCase(),neg:m[1]==='-'})}
    return out
  }
  function mappedField(field){return({company:'organization',org:'organization',status:'availability_status',quality:'source_quality',match:'match_score',sector:'industry'})[field]||field}
  function dateValue(r){return Date.parse(r.published_date||r.last_checked||'1900-01-01')||0}
  function terminalAvailability(v){return /^(expired|not available|inactive|broken link|closed|vacancy closed|no longer available)$/i.test(String(v||''))}
  function terminalApplication(v){return /^(rejected|withdrawn|not suitable|ignored|not available)$/i.test(String(v||''))}
  function facetValues(rows,key){return [...new Set(rows.map(r=>key==='type'?(r.industry||r.type):r[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)))}
  function localSearch(){
    const f=filters(),tokens=queryTokens($('#searchInput').value),applications=get(STORE.apps,{}),availabilityOverrides=get(STORE.availability,{}),prefs=get(STORE.preferences,{});
    let rows=data.filter(r=>{
      const hay=Object.values(r||{}).filter(v=>typeof v==='string'||typeof v==='number').join(' ').toLowerCase();
      for(const token of tokens){const ok=token.field?String(r[mappedField(token.field)]||'').toLowerCase().includes(token.value):hay.includes(token.value);if(token.neg?ok:!ok)return false}
      const availability=availabilityOverrides[r.id]||r.availability_status;
      const appStatus=applications[r.id]?.status||'Not Reviewed';
      if(f.record_type&&r.record_type!==f.record_type)return false;
      if(f.availability&&availability!==f.availability)return false;
      if(f.application&&appStatus!==f.application)return false;
      if(f.country&&r.country!==f.country)return false;
      if(f.region&&r.region!==f.region)return false;
      if(f.type&&(r.industry||r.type)!==f.type)return false;
      if(f.source&&r.source!==f.source)return false;
      if(f.quality&&r.source_quality!==f.quality)return false;
      if(f.priority&&!(r.is_priority||r.priority_tier))return false;
      if(Number(r.match_score||0)<Number(f.match||0))return false;
      const preferenceRecord={...r,availability_status:availability,application_status:appStatus};
      if(window.CAREER_PREFERENCES&&!window.CAREER_PREFERENCES.matches(preferenceRecord,prefs))return false;
      return true
    });
    const sort=$('#sortSelect').value;
    rows.sort((a,b)=>{
      if(sort==='title')return String(a.title||'').localeCompare(String(b.title||''));
      if(sort==='country')return String(a.country||a.region||'').localeCompare(String(b.country||b.region||''));
      if(sort==='quality')return String(a.source_quality||'Z').localeCompare(String(b.source_quality||'Z'));
      if(sort==='newest')return dateValue(b)-dateValue(a);
      if(sort==='match_only')return Number(b.match_score||0)-Number(a.match_score||0);
      const avA=availabilityOverrides[a.id]||a.availability_status, avB=availabilityOverrides[b.id]||b.availability_status;
      const apA=applications[a.id]?.status||'Not Reviewed', apB=applications[b.id]?.status||'Not Reviewed';
      const badA=terminalAvailability(avA)||terminalApplication(apA)?1:0,badB=terminalAvailability(avB)||terminalApplication(apB)?1:0;
      if(badA!==badB)return badA-badB;
      const boostA=window.CAREER_PREFERENCES?window.CAREER_PREFERENCES.score({...a,availability_status:avA,application_status:apA},prefs):0;
      const boostB=window.CAREER_PREFERENCES?window.CAREER_PREFERENCES.score({...b,availability_status:avB,application_status:apB},prefs):0;
      return (Number(b.match_score||0)+boostB)-(Number(a.match_score||0)+boostA)||dateValue(b)-dateValue(a)||String(a.title||'').localeCompare(String(b.title||''))
    });
    total=rows.length;
    facets={record_type:facetValues(rows,'record_type'),availability_status:facetValues(rows,'availability_status'),country:facetValues(rows,'country'),region:facetValues(rows,'region'),source:facetValues(rows,'source'),type:facetValues(rows,'type')};
    const size=+$('#pageSize').value||25,offset=(page-1)*size;
    current=rows.slice(offset,offset+size);
    render();fillFacets()
  }
  function useLocalFallback(reason){
    if(workerFailed)return;
    workerFailed=true;workerReady=false;
    if(worker){try{worker.terminate()}catch{}worker=null}
    console.warn('Using the built-in search fallback.',reason||'Worker unavailable');
    localSearch()
  }
  if(worker){
    const timeout=setTimeout(()=>{if(!workerReady)useLocalFallback('Worker startup timeout')},7000);
    worker.onmessage=e=>{const m=e.data;if(m.type==='loaded'){workerReady=true;clearTimeout(timeout);run()}else if(m.type==='results'&&m.requestId===requestId){current=m.records;total=m.total;facets=m.facets;render();fillFacets()}};
    worker.onerror=e=>{clearTimeout(timeout);console.error('Search worker error:',e.message||e);useLocalFallback(e.message||'Worker error')};
    try{worker.postMessage({type:'loadRecords',records:data})}catch(e){clearTimeout(timeout);useLocalFallback(e)}
    localSearch();
  }else useLocalFallback('Worker could not be created');

  function run(){
    if(!worker||workerFailed){localSearch();return}
    requestId++;
    try{worker.postMessage({type:'search',requestId,query:$('#searchInput').value,filters:filters(),sort:$('#sortSelect').value,offset:(page-1)*+$('#pageSize').value,limit:+$('#pageSize').value,application:get(STORE.apps,{}),availability_overrides:get(STORE.availability,{}),preferences:get(STORE.preferences,{})})}catch(e){useLocalFallback(e)}
  }
  function render(){
    const box=$('#results');box.className=view==='cards'?'card-grid':'';box.innerHTML=view==='cards'?current.map(card).join(''):table(current);
    $('#resultCount').textContent=`${total.toLocaleString()} results`;
    $('#searchHint').innerHTML='Recommended ranking uses your saved job preferences. Card colors show your application status. '+statusLegend();
    box.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>openDrawer(current.find(r=>r.id===b.dataset.detail)));
    box.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>{saveFavorite(b.dataset.fav);render()});
    bindStatusControls(box,current);pagination()
  }
  function fill(id,values){const element=$(id),old=element.value;if(element.options.length<=1){(values||[]).forEach(value=>element.insertAdjacentHTML('beforeend',`<option>${esc(value)}</option>`));element.value=old}}
  function fillFacets(){
    fill('#recordTypeFilter',facets.record_type);fill('#availabilityFilter',facets.availability_status);fill('#countryFilter',facets.country);fill('#regionFilter',facets.region);fill('#typeFilter',facets.type);fill('#sourceFilter',facets.source);
    if($('#applicationFilter').options.length===1)APPLICATION_OPTIONS.forEach(value=>$('#applicationFilter').insertAdjacentHTML('beforeend',`<option>${value}</option>`));
    if(pendingSaved&&!pendingSaved._applied){const f=pendingSaved.filters||{};for(const [id,key] of [['recordTypeFilter','record_type'],['availabilityFilter','availability'],['applicationFilter','application'],['countryFilter','country'],['regionFilter','region'],['typeFilter','type'],['sourceFilter','source'],['qualityFilter','quality']])if(f[key])$('#'+id).value=f[key];if(f.priority)$('#priorityFilter').checked=true;if(f.match!=null){$('#matchFilter').value=f.match;$('#matchValue').textContent=f.match+'%'}pendingSaved._applied=true;run()}
  }
  function pagination(){const pages=Math.ceil(total/(+$('#pageSize').value||25)),container=$('#pagination');container.innerHTML='';for(const number of [...new Set([1,page-1,page,page+1,pages])].filter(number=>number>0&&number<=pages)){const button=document.createElement('button');button.textContent=number;button.className=number===page?'active':'';button.onclick=()=>{page=number;run();scrollTo({top:0,behavior:'smooth'})};container.append(button)}}

  let timer;
  ['searchInput','recordTypeFilter','availabilityFilter','applicationFilter','countryFilter','regionFilter','typeFilter','sourceFilter','qualityFilter','priorityFilter','matchFilter','sortSelect','pageSize'].forEach(id=>{$('#'+id).addEventListener(id==='searchInput'?'input':'change',()=>{page=1;$('#matchValue').textContent=$('#matchFilter').value+'%';clearTimeout(timer);timer=setTimeout(run,id==='searchInput'?140:0)})});
  $$('[data-view]').forEach(button=>button.onclick=()=>{$$('[data-view]').forEach(item=>item.classList.remove('active'));button.classList.add('active');view=button.dataset.view;render()});
  $('#clearFilters').onclick=()=>{$$('#filtersPanel select').forEach(element=>element.value='');$('#priorityFilter').checked=false;$('#matchFilter').value=0;$('#matchValue').textContent='0%';$('#searchInput').value='';page=1;run()};
  $('#filterToggle').onclick=()=>$('#filtersPanel').classList.toggle('open');
  $('#exportBtn').onclick=()=>download('career-results.csv','\ufeff'+csv(current),'text/csv');
  $('#saveSearchBtn').onclick=()=>{const saved=get(STORE.saved,[]),name=prompt('Name this search');if(!name)return;saved.push({id:uid('search'),name,query:$('#searchInput').value,filters:filters(),page:document.body.dataset.page,created:new Date().toISOString()});set(STORE.saved,saved);toast('Search saved')};
  $('#searchInput').value=pendingSaved?.query||params.get('q')||document.body.dataset.defaultQuery||'';
  window.addEventListener('career-status-changed',run);window.addEventListener('career-preferences-changed',run)
}
async function initHome(){const m=window.CAREER_CORE_DATA.manifest,b=window.CAREER_CORE_DATA.best_matches,q=window.CAREER_CORE_DATA.data_quality,c=m.datasets;$('#homeMetrics').innerHTML=[['All records',m.total_records],['Job records',c.jobs.count],['Employers',c.companies.count],['Organizations',c.organizations.count],['Multinationals',c.multinationals.count],['Projects',c.projects.count]].map(x=>`<div class="metric"><strong>${Number(x[1]).toLocaleString()}</strong><span>${x[0]}</span></div>`).join('');const groups={overall:'Overall',official:'Official',remote:'Remote',gcc:'GCC',healthcare:'Healthcare',architecture:'Architecture',leadership:'Leadership',supply_chain:'Supply Chain'};function showBest(k){$('#bestMatches').innerHTML=(b[k]||[]).slice(0,8).map(r=>`<div class="compact-item"><div><a href="./jobs.html?q=${encodeURIComponent(r.title)}"><b>${esc(r.title)}</b></a><br><small>${esc(r.organization)} · ${esc(r.country||r.region||'')}</small></div><span class="score">${r.match_score||0}%</span></div>`).join('');$$('#bestTabs button').forEach(x=>x.classList.toggle('active',x.dataset.group===k))}$('#bestTabs').innerHTML=Object.entries(groups).map(([k,v])=>`<button class="secondary" data-group="${k}">${v}</button>`).join('');$$('#bestTabs button').forEach(x=>x.onclick=()=>showBest(x.dataset.group));showBest('overall');const apps=Object.values(get(STORE.apps,{})),counts={};apps.forEach(a=>counts[a.status]=(counts[a.status]||0)+1);$('#pipelineSummary').innerHTML=['Interested','Applied','Interview','Offer','Rejected'].map(x=>`<div class="pipeline-row"><span>${x}</span><b>${counts[x]||0}</b></div>`).join('');const saved=get(STORE.saved,[]);$('#savedSummary').innerHTML=saved.slice(0,4).map(s=>`<div class="compact-item"><a href="./search.html?saved=${encodeURIComponent(s.id)}">${esc(s.name)}</a></div>`).join('')||'<div class="empty">No saved searches</div>';const sections=[['Jobs',c.jobs,'jobs.html'],['Official Jobs',c.official_jobs,'official-jobs.html'],['Employers',c.companies,'companies.html'],['Multinationals',c.multinationals,'multinationals.html'],['Healthcare',c.healthcare_companies,'healthcare-companies.html'],['Supply Chain',c.supply_chain_companies,'supply-chain-companies.html'],['Technology',c.technology_companies,'technology-companies.html'],['Agencies',c.agencies,'agencies.html'],['Government',c.government,'government.html'],['Projects',c.projects,'projects.html'],['Platforms',c.platforms,'platforms.html']];$('#sectionCards').innerHTML=sections.map(x=>`<a class="section-card" href="./${x[2]}"><strong>${x[0]}</strong><span>${Number((x[1]&&x[1].count)??x[1]??0).toLocaleString()} records</span></a>`).join('');$('#qualitySummary').innerHTML=`<div class="pipeline-row"><span>Duplicates merged</span><b>${q.counts.duplicates_merged}</b></div><div class="pipeline-row"><span>Missing job dates</span><b>${q.counts.missing_dates}</b></div><div class="pipeline-row"><span>Lower-confidence sources</span><b>${q.counts.unverified_sources}</b></div>`;$('#homeSearch').onsubmit=e=>{e.preventDefault();location.href='./search.html?q='+encodeURIComponent($('#homeQuery').value)}}
function initTracker(){if($('#pageActions'))$('#pageActions').innerHTML='<button class="secondary" id="enableReminders">Enable reminders</button>';if($('#enableReminders'))$('#enableReminders').onclick=async()=>{if('Notification'in window)toast('Notifications: '+await Notification.requestPermission())};const data=get(STORE.apps,{}),rows=Object.values(data).filter(a=>a.status&&a.status!=='Not Reviewed'),statuses=['Saved','Interested','Shortlisted','Applied','Follow-up','Interview','Offer','Rejected','Not Suitable','Not Available'];$('#trackerMetrics').innerHTML=statuses.map(s=>`<div class="metric status-metric ${applicationStatusClass(s)}"><strong>${rows.filter(r=>r.status===s).length}</strong><span>${s}</span></div>`).join('');$('#trackerRows').innerHTML=rows.map(r=>`<tr class="status-colored-row ${applicationStatusClass(r.status)}" data-id="${esc(r.record_id)}"><td><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a></td><td>${esc(r.organization)}</td><td>${esc(r.country)}</td><td><input type="date" data-field="applied_date" value="${esc(r.applied_date||'')}"></td><td><select class="job-status-select application-select ${applicationStatusClass(r.status)}" data-field="status">${APPLICATION_OPTIONS.filter(s=>s!=='Not Reviewed').map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td><input type="date" data-field="follow_up" value="${esc(r.follow_up||'')}"></td><td><input data-field="notes" value="${esc(r.notes||'')}"></td><td><button class="secondary" data-delete>×</button></td></tr>`).join('');$('#trackerEmpty').style.display=rows.length?'none':'block';$('#trackerRows').onchange=e=>{const tr=e.target.closest('tr'),all=get(STORE.apps,{});all[tr.dataset.id][e.target.dataset.field]=e.target.value;set(STORE.apps,all);toast('Tracker updated')};$('#trackerRows').onclick=e=>{if(e.target.matches('[data-delete]')){const tr=e.target.closest('tr'),all=get(STORE.apps,{});delete all[tr.dataset.id];set(STORE.apps,all);tr.remove()}};$('#exportTracker').onclick=()=>download('application-tracker.csv','\ufeff'+csv(rows.map(r=>({...r,record_type:'Application',availability_status:r.status}))), 'text/csv');$('#exportCalendar').onclick=()=>{const events=rows.filter(r=>r.follow_up).map(r=>`BEGIN:VEVENT\nDTSTART;VALUE=DATE:${r.follow_up.replaceAll('-','')}\nSUMMARY:Follow up: ${(r.title||'').replace(/[,;]/g,'')}\nDESCRIPTION:${(r.organization||'').replace(/[,;]/g,'')}\nEND:VEVENT`).join('\n');download('career-followups.ics','BEGIN:VCALENDAR\nVERSION:2.0\n'+events+'\nEND:VCALENDAR','text/calendar')}}
function initContacts(){const dialog=$('#contactDialog');function render(){const a=get(STORE.contacts,[]);$('#contactRows').innerHTML=a.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.company)}</td><td>${esc(c.role)}</td><td>${c.email?`<a href="mailto:${esc(c.email)}">Email</a>`:''} ${c.linkedin?`<a href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`:''}</td><td>${esc(c.last)}</td><td>${esc(c.relationship)}</td><td>${esc(c.follow)}</td><td><button class="secondary" data-edit="${esc(c.id)}">Edit</button> <button class="secondary" data-delete="${esc(c.id)}">×</button></td></tr>`).join('');$$('[data-delete]').forEach(b=>b.onclick=()=>{set(STORE.contacts,a.filter(x=>x.id!==b.dataset.delete));render()});$$('[data-edit]').forEach(b=>b.onclick=()=>open(a.find(x=>x.id===b.dataset.edit)))}function open(c={}){$('#contactId').value=c.id||'';$('#contactName').value=c.name||'';$('#contactCompany').value=c.company||'';$('#contactRole').value=c.role||'';$('#contactEmail').value=c.email||'';$('#contactLinkedIn').value=c.linkedin||'';$('#contactLast').value=c.last||'';$('#contactRelationship').value=c.relationship||'New';$('#contactFollow').value=c.follow||'';$('#contactNotes').value=c.notes||'';dialog.showModal()}$('#addContact').onclick=()=>open();$('#saveContact').onclick=e=>{e.preventDefault();let a=get(STORE.contacts,[]),id=$('#contactId').value||uid('contact'),c={id,name:$('#contactName').value,company:$('#contactCompany').value,role:$('#contactRole').value,email:$('#contactEmail').value,linkedin:$('#contactLinkedIn').value,last:$('#contactLast').value,relationship:$('#contactRelationship').value,follow:$('#contactFollow').value,notes:$('#contactNotes').value};a=a.filter(x=>x.id!==id);a.push(c);set(STORE.contacts,a);dialog.close();render()};render()}
function initSaved(){function render(){const a=get(STORE.saved,[]);$('#savedSearchRows').innerHTML=a.map(s=>`<div class="saved-card"><h3>${esc(s.name)}</h3><p>${esc(s.query||'All records')}</p><small>Created ${new Date(s.created).toLocaleDateString()}</small><div class="card-actions"><a class="button" href="./search.html?saved=${encodeURIComponent(s.id)}">Run</a><button class="secondary" data-delete="${esc(s.id)}">Delete</button></div></div>`).join('');$('#savedEmpty').style.display=a.length?'none':'block';$$('[data-delete]').forEach(b=>b.onclick=()=>{set(STORE.saved,a.filter(x=>x.id!==b.dataset.delete));render()})}render()}
function initQuality(){const q=window.CAREER_CORE_DATA.data_quality,c=q.counts;$('#qualityMetrics').innerHTML=[['Issues',c.issues],['Jobs',c.jobs],['Employers',c.companies],['Multinationals',c.multinationals],['Missing dates',c.missing_dates]].map(x=>`<div class="metric"><strong>${Number(x[1]).toLocaleString()}</strong><span>${x[0]}</span></div>`).join('');$('#sourceQuality').innerHTML=Object.entries(q.source_quality).map(([k,v])=>`<div class="pipeline-row"><span class="quality-${k.toLowerCase()}">Grade ${k}</span><b>${Number(v).toLocaleString()}</b></div>`).join('');const reports=get(STORE.issues,[]);$('#userIssues').innerHTML=reports.slice(-8).map(i=>`<div class="compact-item"><div><b>${esc(i.type)}</b><br><small>${esc(i.title)}</small></div></div>`).join('')||'<div class="empty">No user reports</div>';$('#exportIssues').onclick=()=>download('user-reported-issues.json',JSON.stringify(reports,null,2),'application/json');const types=[...new Set(q.issues.map(i=>i.type))].sort();types.forEach(t=>$('#issueTypeFilter').insertAdjacentHTML('beforeend',`<option>${esc(t)}</option>`));let page=1;function render(){const type=$('#issueTypeFilter').value,rows=q.issues.filter(i=>!type||i.type===type),slice=rows.slice((page-1)*50,page*50);$('#qualityRows').innerHTML=slice.map(i=>`<tr><td><span class="badge ${i.severity==='High'?'bad':i.severity==='Medium'?'warn':''}">${esc(i.severity)}</span></td><td>${esc(i.type)}</td><td>${esc(i.record_id)}</td><td>${esc(i.message)}</td></tr>`).join('');const pages=Math.ceil(rows.length/50);$('#qualityPagination').innerHTML=[1,page-1,page,page+1,pages].filter((x,i,a)=>x>0&&x<=pages&&a.indexOf(x)===i).map(n=>`<button data-p="${n}" class="${n===page?'active':''}">${n}</button>`).join('');$$('[data-p]').forEach(b=>b.onclick=()=>{page=+b.dataset.p;render()})}$('#issueTypeFilter').onchange=()=>{page=1;render()};render()}
window.CAREER_STATUS={availabilityOptions:AVAILABILITY_OPTIONS,applicationOptions:APPLICATION_OPTIONS,controls:statusControls,bind:bindStatusControls,paint:paintStatusVisuals,effectiveAvailability,application,setAvailability,setApplication,statusSlug,applicationStatusClass,availabilityStatusClass};
initShell();const page=document.body.dataset.page;if(document.body.dataset.file)initListing().catch(e=>{console.error(e);const r=$('#results');if(r)r.innerHTML='<div class="empty">The data could not be loaded. Confirm that the data/js bundle is uploaded with this page.</div>'});else if(page==='home')initHome();else if(page==='tracker')initTracker();else if(page==='contacts')initContacts();else if(page==='saved')initSaved();else if(page==='quality')initQuality();
