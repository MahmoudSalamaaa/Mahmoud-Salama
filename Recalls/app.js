(() => {
  'use strict';
  const BASE_DATA = Array.isArray(window.MR_DATA) ? window.MR_DATA : [];
  const META = window.MR_META || {};
  const STORAGE_KEY = 'medicalRecallStudioStateV2';
  const CATEGORIES = ['All','History','Communication','Video','Clinical','Development','Others'];
  const COLORS = {History:'#08a7bd',Communication:'#f0784b',Video:'#e94f78',Clinical:'#17956f',Development:'#7655ca',Others:'#d89b24'};
  const FRAMEWORKS = {
    History:'Suggested structure:\n1. Presenting concern and agenda\n2. Chronology and symptom analysis\n3. Red flags and relevant systems review\n4. Past medical, medication and allergy history\n5. Birth, development, family and social context\n6. Focused summary, differentials and next steps',
    Communication:'Suggested structure:\n1. Introduce yourself, confirm identity and agenda\n2. Explore concerns, ideas and expectations\n3. Show empathy and acknowledge emotion\n4. Explain in clear, non-technical language\n5. Discuss options, risks and uncertainties\n6. Check understanding, agree a plan and safety-net',
    Video:'Suggested structure:\n1. Describe the observed signs objectively\n2. State the most likely diagnosis\n3. Give key differentials\n4. Identify red flags or immediate risks\n5. Outline confirmation and next steps',
    Clinical:'Suggested structure:\n1. Consent, hand hygiene and positioning\n2. General inspection and vital observations\n3. Focused examination in a logical sequence\n4. Summarise positive and negative findings\n5. State differentials\n6. Suggest investigations and management priorities',
    Development:'Suggested structure:\n1. Confirm age and corrected age where relevant\n2. Review gross motor, fine motor, language and social domains\n3. Ask about regression and functional impact\n4. Review hearing, vision, growth and behaviour\n5. Consider family, nursery/school and safeguarding context\n6. Summarise and propose multidisciplinary next steps',
    Others:'Suggested structure:\n1. Clarify the task\n2. Organise information logically\n3. State priorities and red flags\n4. Summarise and safety-net'
  };
  const SYNONYMS = {
    dka:['diabetic ketoacidosis'],as:['aortic stenosis'],vsd:['ventricular septal defect'],asd:['atrial septal defect'],itp:['immune thrombocytopenia','idiopathic thrombocytopenic purpura'],sle:['systemic lupus erythematosus'],cf:['cystic fibrosis'],tb:['tuberculosis'],adhd:['attention deficit hyperactivity disorder'],hx:['history'],exam:['examination'],haematuria:['hematuria'],anaemia:['anemia'],oedema:['edema'],diarrhoea:['diarrhea'],paediatric:['pediatric']
  };
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const slug = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const unique = a => [...new Set(a.filter(v => v !== null && v !== undefined && v !== ''))];
  const nowISO = () => new Date().toISOString();
  const dueToday = iso => !iso || new Date(iso).getTime() <= Date.now();

  const defaultState = () => ({
    favorites:[], important:[], completed:[], difficult:[], selected:[], notes:{}, answers:{}, review:{}, verification:{}, editedSessions:{}, customSessions:[], deletedSessions:[], changeLog:[],
    settings:{theme:'light',density:'comfortable',fontScale:100,contrast:false,focus:false,heroCollapsed:false},
    filters:{query:'',searchMode:'all',category:'All',year:'All',country:'All',center:'All',month:'All',specialty:'All',age:'All',context:'All',verification:'All',favoritesOnly:false,dueOnly:false,needsReviewOnly:false,sort:'date-desc'},
    page:1,pageSize:10,activeTab:'library'
  });
  let state = loadState();
  let currentSessions = [];
  let sourceContext = {sessionId:null,itemId:null,page:1,zoom:110,rotation:0};
  let noteItemId = null;
  let study = {deck:[],index:0,revealed:false,seconds:480,timer:null};
  let flash = {deck:[],index:0,revealed:false};
  let installPrompt = null;

  function loadState(){
    try { return mergeDeep(defaultState(), JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')); } catch { return defaultState(); }
  }
  function mergeDeep(target, source){
    if(!source || typeof source!=='object') return target;
    Object.keys(source).forEach(k=>{ if(source[k] && typeof source[k]==='object' && !Array.isArray(source[k])) target[k]=mergeDeep(target[k]||{},source[k]); else target[k]=source[k]; });
    return target;
  }
  function saveState(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }
  function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove('show'),2400); }
  function sessions(){
    const base=BASE_DATA.filter(s=>!state.deletedSessions.includes(s.id)).map(s=>state.editedSessions[s.id]||s);
    return [...base,...state.customSessions];
  }
  function allItems(){ return sessions().flatMap(s=>s.items.map(i=>({...i,session:s}))); }
  function findItem(id){ for(const s of sessions()){const i=s.items.find(x=>x.id===id);if(i)return {item:i,session:s};} return null; }
  function itemStatus(item){ return state.verification[item.id]?.status || item.verification || 'Verified'; }
  function itemConfidence(item){ return state.verification[item.id]?.confidence || item.confidence || 'High'; }
  function reviewInfo(id){ return state.review[id]||{}; }
  function isDue(id){ return dueToday(reviewInfo(id).due); }
  function toggleArray(key,id){ const a=state[key]; const n=a.indexOf(id); n>=0?a.splice(n,1):a.push(id); saveState(); }
  function setTab(name, push=true){
    state.activeTab=name; saveState();
    $$('.nav-tab, .mobile-nav-tab').forEach(b=>b.classList.toggle('is-active',b.dataset.tab===name));
    $$('.tab-panel').forEach(p=>p.classList.toggle('is-active',p.dataset.panel===name));
    if(push) history.replaceState(null,'',`#${name}`);
    if(name==='study') renderStudySetup();
    if(name==='flashcards') renderFlashcards();
    if(name==='analytics') renderAnalytics();
    if(name==='compare') renderCompare();
    if(name==='my-study') renderMyStudy();
    if(name==='editor') renderEditor();
    if(name==='about') renderAbout();
    if(push) window.scrollTo({top:$('#workspace').offsetTop-88,behavior:'smooth'});
  }

  function applySettings(){
    const s=state.settings;
    document.documentElement.dataset.theme=s.theme;
    document.documentElement.dataset.density=s.density;
    document.documentElement.dataset.contrast=s.contrast?'high':'normal';
    document.documentElement.style.setProperty('--font-scale',String(s.fontScale/100));
    document.body.classList.toggle('focus-mode',!!s.focus);
    document.body.classList.toggle('hero-collapsed',!!s.heroCollapsed);
    $('#themeBtn').textContent=s.theme==='dark'?'☀':'☾';
    $('#fontScale').value=s.fontScale; $('#densitySelect').value=s.density; $('#contrastToggle').checked=s.contrast; $('#focusToggle').checked=s.focus; $('#heroToggle').checked=s.heroCollapsed;
  }

  function populateFilters(){
    const data=sessions(), items=allItems();
    fillSelect('#yearFilter',unique(data.map(s=>s.year)).sort((a,b)=>b-a));
    fillSelect('#countryFilter',unique(data.map(s=>s.country)).sort());
    fillSelect('#centerFilter',unique(data.map(s=>s.center)).sort());
    fillSelect('#monthFilter',unique(data.map(s=>s.month)).sort());
    fillSelect('#specialtyFilter',unique(items.flatMap(x=>x.specialties)).sort());
    fillSelect('#ageFilter',unique(items.flatMap(x=>x.ageGroups)).sort());
    fillSelect('#contextFilter',unique(items.flatMap(x=>x.contexts)).sort());
    fillSelect('#verificationFilter',['Verified','Corrected','Needs Review','Unclear Handwriting','Source Not Fully Legible']);
    $('#categoryChips').innerHTML=CATEGORIES.map(c=>`<button class="filter-chip ${state.filters.category===c?'is-active':''}" data-category="${c}">${c}</button>`).join('');
    const f=state.filters;
    $('#searchInput').value=f.query; $('#searchMode').value=f.searchMode; $('#yearFilter').value=f.year; $('#countryFilter').value=f.country; $('#centerFilter').value=f.center; $('#monthFilter').value=f.month; $('#specialtyFilter').value=f.specialty; $('#ageFilter').value=f.age; $('#contextFilter').value=f.context; $('#verificationFilter').value=f.verification; $('#favoritesOnly').checked=f.favoritesOnly; $('#dueOnly').checked=f.dueOnly; $('#needsReviewOnly').checked=f.needsReviewOnly; $('#sortSelect').value=f.sort;
  }
  function fillSelect(sel,vals){ const el=$(sel); el.innerHTML='<option value="All">All</option>'+vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(''); }

  function levenshteinOne(a,b){
    if(Math.abs(a.length-b.length)>1) return false; if(a===b)return true;
    let i=0,j=0,d=0; while(i<a.length&&j<b.length){ if(a[i]===b[j]){i++;j++;continue;} if(++d>1)return false; if(a.length>b.length)i++; else if(b.length>a.length)j++; else{i++;j++;} } return d+(i<a.length||j<b.length?1:0)<=1;
  }
  function expandTerm(term){ const t=term.toLowerCase(); const out=[t]; Object.entries(SYNONYMS).forEach(([k,v])=>{if(t===k||v.includes(t))out.push(k,...v)}); return unique(out); }
  function queryParts(q){ const phrases=[...q.matchAll(/"([^"]+)"/g)].map(m=>m[1].toLowerCase()); const rest=q.replace(/"[^"]+"/g,' ').trim().toLowerCase().split(/\s+/).filter(Boolean); return [...phrases,...rest]; }
  function textMatches(text,q,mode){
    if(!q.trim())return true; const hay=text.toLowerCase(); const words=hay.split(/[^a-z0-9]+/).filter(Boolean);
    const tests=queryParts(q).map(term=>expandTerm(term).some(x=>hay.includes(x)|| (x.length>4&&words.some(w=>levenshteinOne(w,x)))));
    return mode==='any'?tests.some(Boolean):tests.every(Boolean);
  }
  function sessionText(s){ return [s.title,s.center,s.country,s.year,s.month,...s.items.flatMap(i=>[i.text,i.topic,...i.specialties,...i.ageGroups,...i.contexts])].join(' '); }
  function filteredSessions(){
    const f=state.filters;
    let out=sessions().filter(s=>{
      if(!textMatches(sessionText(s),f.query,f.searchMode))return false;
      if(f.year!=='All'&&String(s.year)!==String(f.year))return false;
      if(f.country!=='All'&&s.country!==f.country)return false;
      if(f.center!=='All'&&s.center!==f.center)return false;
      if(f.month!=='All'&&s.month!==f.month)return false;
      let its=s.items;
      if(f.category!=='All')its=its.filter(i=>i.category===f.category);
      if(f.specialty!=='All')its=its.filter(i=>i.specialties.includes(f.specialty));
      if(f.age!=='All')its=its.filter(i=>i.ageGroups.includes(f.age));
      if(f.context!=='All')its=its.filter(i=>i.contexts.includes(f.context));
      if(f.verification!=='All')its=its.filter(i=>itemStatus(i)===f.verification);
      if(f.favoritesOnly)its=its.filter(i=>state.favorites.includes(i.id)||state.favorites.includes(s.id));
      if(f.dueOnly)its=its.filter(i=>isDue(i.id));
      if(f.needsReviewOnly)its=its.filter(i=>itemStatus(i)!=='Verified');
      return its.length>0;
    });
    const dateVal=s=>new Date(`${s.year}-${monthNum(s.month)}-${String(s.day||1).padStart(2,'0')}`).getTime();
    out.sort((a,b)=>f.sort==='date-asc'?dateVal(a)-dateVal(b):f.sort==='center'?a.center.localeCompare(b.center):f.sort==='items-desc'?b.items.length-a.items.length:dateVal(b)-dateVal(a));
    return out;
  }
  function monthNum(m){return String(['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(m)+1||1).padStart(2,'0')}
  function visibleItems(s){
    const f=state.filters; return s.items.filter(i=>{
      if(f.category!=='All'&&i.category!==f.category)return false;
      if(f.specialty!=='All'&&!i.specialties.includes(f.specialty))return false;
      if(f.age!=='All'&&!i.ageGroups.includes(f.age))return false;
      if(f.context!=='All'&&!i.contexts.includes(f.context))return false;
      if(f.verification!=='All'&&itemStatus(i)!==f.verification)return false;
      if(f.favoritesOnly&&!state.favorites.includes(i.id)&&!state.favorites.includes(s.id))return false;
      if(f.dueOnly&&!isDue(i.id))return false;
      if(f.needsReviewOnly&&itemStatus(i)==='Verified')return false;
      return textMatches([i.text,i.topic,...i.specialties].join(' '),f.query,f.searchMode)||textMatches(sessionText(s),f.query,f.searchMode);
    });
  }
  function highlight(text,q){ if(!q.trim())return esc(text); const terms=queryParts(q).sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')); if(!terms.length)return esc(text); return esc(text).replace(new RegExp(`(${terms.join('|')})`,'ig'),'<mark>$1</mark>'); }

  function renderLibrary(){
    currentSessions=filteredSessions();
    const total=currentSessions.length; state.page=Math.min(state.page,Math.max(1,Math.ceil(total/state.pageSize))); saveState();
    $('#resultCount').textContent=total; $('#mobileResultCount').textContent=`${total} sessions`;
    const start=(state.page-1)*state.pageSize, pageData=currentSessions.slice(start,start+state.pageSize);
    $('#libraryResults').innerHTML=pageData.map((s,n)=>sessionCard(s,start+n+1)).join('');
    $('#emptyState').hidden=total>0; renderPagination(total); renderActiveFilters(); updateStats();
    const deep=new URLSearchParams(location.hash.split('?')[1]||''); const sid=deep.get('session'); if(sid){setTimeout(()=>document.getElementById(`session-${CSS.escape(sid)}`)?.scrollIntoView({behavior:'smooth',block:'start'}),60)}
  }
  function sessionCard(s,index){
    const items=visibleItems(s), groups=CATEGORIES.slice(1).filter(c=>items.some(i=>i.category===c));
    const status=s.items.some(i=>itemStatus(i)!=='Verified')?'Needs Review':'Verified';
    return `<article class="session-card ${state.selected.includes(s.id)?'is-selected':''}" id="session-${esc(s.id)}">
      <header class="session-head"><div class="session-index">${index}</div><div class="session-title"><h3>${highlight(s.title,state.filters.query)}</h3><div class="meta-row"><span class="meta-pill">${esc(s.country)}</span><span class="meta-pill">${esc(s.center)}</span><span class="meta-pill">${s.year}</span><span class="meta-pill">Page ${s.pages.join(', ')}</span><span class="status-badge ${status==='Verified'?'verified':'review'}">${status}</span></div></div>
      <div class="session-actions"><button class="mini-btn ${state.favorites.includes(s.id)?'is-active':''}" data-action="favorite-session" data-id="${s.id}">★</button><button class="mini-btn ${state.selected.includes(s.id)?'is-active':''}" data-action="select-session" data-id="${s.id}">Select</button><button class="mini-btn" data-action="share-session" data-id="${s.id}">Share</button><button class="mini-btn" data-action="source-session" data-id="${s.id}">Source</button><button class="mini-btn" data-action="print-session" data-id="${s.id}">Print</button></div></header>
      <div class="session-body">${groups.map(c=>categoryBlock(c,items.filter(i=>i.category===c),s)).join('')}</div></article>`;
  }
  function categoryBlock(cat,items,s){ return `<section class="category-block" style="--cat:${COLORS[cat]||COLORS.Others}"><div class="category-head"><h4>${cat}</h4><span class="category-badge">${items.length} item${items.length===1?'':'s'}</span></div><div class="recall-items">${items.map(i=>itemRow(i,s)).join('')}</div></section>`; }
  function itemRow(i,s){
    const status=itemStatus(i), completed=state.completed.includes(i.id), fav=state.favorites.includes(i.id), diff=state.difficult.includes(i.id), hasNote=!!state.notes[i.id]||!!state.answers[i.id];
    return `<div class="recall-item ${completed?'is-completed':''}" data-item-id="${esc(i.id)}"><input class="item-check" type="checkbox" ${completed?'checked':''} data-action="complete-item" data-id="${esc(i.id)}" aria-label="Mark completed"><div><div class="item-text">${highlight(i.text,state.filters.query)}</div><div class="item-tags"><span>${esc(i.specialties[0])}</span><span>${esc(i.ageGroups[0])}</span><span class="status-badge ${status==='Verified'?'verified':'review'}">${esc(status)} / ${esc(itemConfidence(i))}</span>${isDue(i.id)?'<span>Due</span>':''}</div></div><div class="item-actions"><button class="mini-btn ${fav?'is-active':''}" data-action="favorite-item" data-id="${esc(i.id)}" title="Favourite">★</button><button class="mini-btn ${diff?'is-active':''}" data-action="difficult-item" data-id="${esc(i.id)}" title="Difficult">!</button><button class="mini-btn ${hasNote?'is-active':''}" data-action="note-item" data-id="${esc(i.id)}">Note</button><button class="mini-btn" data-action="source-item" data-id="${esc(i.id)}" data-session="${esc(s.id)}">Page</button></div></div>`;
  }
  function renderPagination(total){ const pages=Math.ceil(total/state.pageSize), el=$('#pagination'); if(pages<=1){el.innerHTML='';return;} let html=`<button data-page="${Math.max(1,state.page-1)}">‹</button>`; for(let p=1;p<=pages;p++){if(p===1||p===pages||Math.abs(p-state.page)<=2)html+=`<button class="${p===state.page?'is-active':''}" data-page="${p}">${p}</button>`; else if(Math.abs(p-state.page)===3)html+='<span>…</span>';} html+=`<button data-page="${Math.min(pages,state.page+1)}">›</button>`; el.innerHTML=html; }
  function renderActiveFilters(){ const f=state.filters; const arr=[]; Object.entries(f).forEach(([k,v])=>{if(['query','searchMode','sort'].includes(k)){if(k==='query'&&v)arr.push(`Search: ${v}`);return;} if(v!==false&&v!=='All')arr.push(`${k}: ${v===true?'Yes':v}`)}); $('#activeFilters').innerHTML=arr.map(x=>`<span class="active-filter">${esc(x)}</span>`).join(''); }
  function updateStats(){ const ss=sessions(); $('#statSessions').textContent=ss.length; $('#statItems').textContent=ss.reduce((n,s)=>n+s.items.length,0).toLocaleString(); $('#statCentres').textContent=unique(ss.map(s=>s.center)).length; }

  function openSource(sessionId,itemId=null,page=null){
    const s=sessions().find(x=>x.id===sessionId); if(!s)return; const item=itemId?s.items.find(x=>x.id===itemId):null;
    sourceContext={sessionId,itemId,page:page||s.pages[0],zoom:110,rotation:0};
    $('#sourceTitle').textContent=item?item.topic:s.title; $('#sourceModal').hidden=false; document.body.style.overflow='hidden'; renderSource();
  }
  async function getPdfUrl(kind='source'){
    if(window.MR_EMBEDDED_PDFS){ const id=kind==='source'?'embeddedSourcePdf':'embeddedReadablePdf'; if(!getPdfUrl.cache)getPdfUrl.cache={}; if(!getPdfUrl.cache[id]){const b64=$(`#${id}`).textContent.replace(/\s/g,''); const chunks=[]; for(let o=0;o<b64.length;o+=1048576){const bin=atob(b64.slice(o,o+1048576));const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);chunks.push(a)} getPdfUrl.cache[id]=URL.createObjectURL(new Blob(chunks,{type:'application/pdf'}));} return getPdfUrl.cache[id]; }
    return kind==='source'?'docs/original-handwritten.pdf':'docs/readable-edition.pdf';
  }
  async function renderSource(){
    const s=sessions().find(x=>x.id===sourceContext.sessionId); if(!s)return; const i=sourceContext.itemId?s.items.find(x=>x.id===sourceContext.itemId):null;
    $('#sourcePageLabel').textContent=sourceContext.page; const items=i?[i]:s.items;
    $('#sourceTranscript').innerHTML=`<p class="callout"><strong>${esc(s.title)}</strong><br>${esc(s.country)} / ${s.center} / ${s.year}<br>Source pages: ${s.pages.join(', ')}</p>`+items.map(x=>`<div class="source-transcript-item"><b>${esc(x.category)} - ${esc(x.topic)}</b><p>${esc(x.text)}</p><span class="status-badge ${itemStatus(x)==='Verified'?'verified':'review'}">${esc(itemStatus(x))} / ${esc(itemConfidence(x))}</span></div>`).join('');
    const target=i||items[0]; $('#sourceVerification').value=itemStatus(target); $('#sourceConfidence').value=itemConfidence(target); $('#sourceReviewerNote').value=state.verification[target.id]?.note||'';
    const url=await getPdfUrl('source'); const full=`${url}#page=${sourceContext.page}&zoom=${sourceContext.zoom}`; $('#sourceFrame').src=full; $('#openSourceExternal').href=full; $('#sourceFrame').style.transform=`rotate(${sourceContext.rotation}deg)`;
  }
  function closeSource(){ $('#sourceModal').hidden=true; document.body.style.overflow=''; $('#sourceFrame').src='about:blank'; }

  function openNote(id){ const f=findItem(id); if(!f)return; noteItemId=id; $('#noteTitle').textContent=f.item.topic; $('#noteTextarea').value=state.notes[id]||''; $('#answerTextarea').value=state.answers[id]||f.item.editorialAnswer||FRAMEWORKS[f.item.category]||FRAMEWORKS.Others; $('#noteModal').hidden=false; document.body.style.overflow='hidden'; }
  function closeNote(){ $('#noteModal').hidden=true; document.body.style.overflow=''; noteItemId=null; }

  function buildStudyDeck(){ return filteredSessions(); }
  function renderStudySetup(){
    const view=$('#studyView'); if(!study.deck.length){view.innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Active recall</span><h2>Study Mode</h2><p>Run timed recall sessions using the current library filters.</p></div></div><div class="panel-card"><h3>Create a study session</h3><p>${filteredSessions().length} filtered sessions are available.</p><label class="field"><span>Timer per session</span><select id="studyTimerSelect"><option value="300">5 minutes</option><option value="480" selected>8 minutes</option><option value="600">10 minutes</option><option value="900">15 minutes</option></select></label><div class="hero-actions"><button id="startStudyBtn" class="primary-btn">Start filtered deck</button><button id="startRandomBtn" class="secondary-btn">Start random session</button></div></div>`;return;} renderStudyCard();
  }
  function startStudy(random=false){ study.deck=buildStudyDeck(); if(!study.deck.length){toast('No sessions match the current filters.');return;} if(random)study.deck.sort(()=>Math.random()-.5); study.index=0; study.revealed=false; study.seconds=Number($('#studyTimerSelect')?.value||480); clearInterval(study.timer); study.timer=setInterval(()=>{study.seconds=Math.max(0,study.seconds-1); const e=$('#studyTimer');if(e)e.textContent=formatTime(study.seconds);if(!study.seconds){clearInterval(study.timer);toast('Time is up. Reveal the station and review your answer.')}},1000); renderStudyCard(); }
  function renderStudyCard(){ const s=study.deck[study.index]; if(!s){study.deck=[];renderStudySetup();return;} $('#studyView').innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Active recall</span><h2>Study Mode</h2><p>Session ${study.index+1} of ${study.deck.length}</p></div><div class="timer" id="studyTimer">${formatTime(study.seconds)}</div></div><article class="study-card"><div class="study-top"><div><span class="status-badge verified">${esc(s.center)} / ${s.year}</span><h2>${esc(s.title)}</h2><p>Source page ${s.pages.join(', ')}</p></div><button class="secondary-btn" data-study-source="${s.id}">Verify source</button></div><div class="study-prompts ${study.revealed?'':'hidden-prompt'}">${s.items.map(i=>`<div class="source-transcript-item"><b>${esc(i.category)}</b><p>${esc(i.text)}</p></div>`).join('')}</div><div class="grade-row">${study.revealed?`<button class="grade-again" data-study-grade="again">Review again</button><button class="grade-hard" data-study-grade="hard">Difficult</button><button class="grade-good" data-study-grade="good">Know it</button><button class="grade-easy" data-study-grade="easy">Completed</button>`:`<button id="revealStudyBtn" class="primary-btn">Reveal recall prompts</button>`}<button id="nextStudyBtn" class="secondary-btn">Skip / next</button><button id="endStudyBtn" class="secondary-btn">End session</button></div></article>`; }
  function gradeStudy(g){ const s=study.deck[study.index]; s.items.forEach(i=>scheduleReview(i.id,g)); if(g==='hard')s.items.forEach(i=>{if(!state.difficult.includes(i.id))state.difficult.push(i.id)}); if(g==='easy')s.items.forEach(i=>{if(!state.completed.includes(i.id))state.completed.push(i.id)}); saveState(); study.index++; study.revealed=false; study.seconds=480; renderStudyCard(); }
  function formatTime(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}

  function dueDeck(){ const all=allItems(); const due=all.filter(x=>isDue(x.id)); return due.length?due:all.slice().sort(()=>Math.random()-.5); }
  function renderFlashcards(reset=false){ if(reset||!flash.deck.length){flash.deck=dueDeck();flash.index=0;flash.revealed=false;} const x=flash.deck[flash.index]; if(!x){$('#flashcardView').innerHTML='<div class="empty-state"><h3>No flashcards available</h3></div>';return;} const custom=state.answers[x.id]; $('#flashcardView').innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Spaced repetition</span><h2>Flashcards</h2><p>${flash.deck.filter(y=>isDue(y.id)).length} cards due. Card ${flash.index+1} of ${flash.deck.length}.</p></div><button id="resetFlashBtn" class="secondary-btn">Refresh deck</button></div><article class="flashcard-shell"><div class="flashcard-front"><span class="category-badge">${esc(x.category)} / ${esc(x.specialties[0])}</span><p>${esc(x.text)}</p></div>${flash.revealed?`<div class="flashcard-back">${esc(custom||FRAMEWORKS[x.category]||FRAMEWORKS.Others)}</div><div class="grade-row"><button class="grade-again" data-flash-grade="again">Again</button><button class="grade-hard" data-flash-grade="hard">Hard</button><button class="grade-good" data-flash-grade="good">Good</button><button class="grade-easy" data-flash-grade="easy">Easy</button></div>`:`<button id="revealFlashBtn" class="primary-btn">Reveal study framework</button>`}</article>`; }
  function scheduleReview(id,grade){ const r=state.review[id]||{ease:2.5,interval:0,repetitions:0}; const days={again:0,hard:1,good:r.interval?Math.max(3,Math.round(r.interval*r.ease)):3,easy:r.interval?Math.max(7,Math.round(r.interval*(r.ease+.3))):7}[grade]; r.ease=Math.max(1.3,r.ease+(grade==='again'?-.2:grade==='hard'?-.1:grade==='easy'?.15:0)); r.interval=days; r.repetitions=grade==='again'?0:r.repetitions+1; r.last=nowISO(); r.due=new Date(Date.now()+days*86400000).toISOString(); state.review[id]=r; saveState(); }
  function gradeFlash(g){ const x=flash.deck[flash.index]; scheduleReview(x.id,g); if(g==='hard'&&!state.difficult.includes(x.id))state.difficult.push(x.id); flash.index++; flash.revealed=false; saveState(); renderFlashcards(); }

  function renderAnalytics(){
    const ss=sessions(), its=allItems();
    const metrics=[['Sessions',ss.length],['Recall items',its.length],['Reviewed',state.completed.length],['Due today',its.filter(x=>isDue(x.id)).length]];
    $('#analyticsView').innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Patterns and coverage</span><h2>Analytics Dashboard</h2><p>Click a chart label to filter the library.</p></div></div><div class="dashboard-grid">${metrics.map(x=>`<article class="metric-card"><strong>${Number(x[1]).toLocaleString()}</strong><span>${x[0]}</span></article>`).join('')}</div><div class="two-col"><div class="panel-card"><h3>Items by category</h3>${chart(countBy(its,x=>x.category),'category')}</div><div class="panel-card"><h3>Sessions by year</h3>${chart(countBy(ss,x=>x.year),'year')}</div><div class="panel-card"><h3>Sessions by country</h3>${chart(countBy(ss,x=>x.country),'country',10)}</div><div class="panel-card"><h3>Items by specialty</h3>${chart(countBy(its.flatMap(x=>x.specialties.map(y=>({...x,key:y}))),x=>x.key),'specialty',12)}</div></div><div class="panel-card"><h3>Frequently recalled topics</h3>${chart(countBy(its,x=>x.topic),null,15)}</div>`;
  }
  function countBy(arr,key){ const o={};arr.forEach(x=>{const k=String(key(x)||'Not specified');o[k]=(o[k]||0)+1});return Object.entries(o).sort((a,b)=>b[1]-a[1]); }
  function chart(entries,filterKey,limit=20){ const e=entries.slice(0,limit),max=e[0]?.[1]||1; return `<div class="chart-list">${e.map(([k,v])=>`<div class="chart-row"><button ${filterKey?`data-chart-filter="${filterKey}" data-value="${esc(k)}"`:''}>${esc(k)}</button><div class="chart-track"><div class="chart-fill" style="width:${Math.max(3,v/max*100)}%"></div></div><span class="chart-value">${v}</span></div>`).join('')}</div>`; }

  function renderCompare(){ const ss=sessions(); $('#compareView').innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Cross-centre intelligence</span><h2>Compare Mode</h2><p>Compare countries, centres or years and identify shared or unique themes.</p></div></div><div class="panel-card"><div class="compare-controls"><label class="field"><span>Dimension</span><select id="compareDimension"><option value="country">Country</option><option value="center">Centre</option><option value="year">Year</option></select></label><label class="field"><span>First group</span><select id="compareA"></select></label><label class="field"><span>Second group</span><select id="compareB"></select></label><button id="runCompareBtn" class="primary-btn">Compare</button></div></div><div id="compareResults"></div>`; updateCompareOptions(); }
  function updateCompareOptions(){ const dim=$('#compareDimension')?.value||'country', vals=unique(sessions().map(s=>String(s[dim]))).sort(); ['#compareA','#compareB'].forEach((sel,j)=>{$(sel).innerHTML=vals.map((v,i)=>`<option ${i===j?'selected':''}>${esc(v)}</option>`).join('')}); }
  function runCompare(){ const dim=$('#compareDimension').value,a=$('#compareA').value,b=$('#compareB').value; const sa=sessions().filter(s=>String(s[dim])===a), sb=sessions().filter(s=>String(s[dim])===b); const ia=sa.flatMap(s=>s.items),ib=sb.flatMap(s=>s.items), ta=new Set(ia.map(i=>slug(i.topic))),tb=new Set(ib.map(i=>slug(i.topic))),shared=[...ta].filter(x=>tb.has(x)),onlyA=[...ta].filter(x=>!tb.has(x)),onlyB=[...tb].filter(x=>!ta.has(x)); const nameMap=new Map([...ia,...ib].map(i=>[slug(i.topic),i.topic])); $('#compareResults').innerHTML=`<div class="dashboard-grid"><article class="metric-card"><strong>${sa.length}</strong><span>${esc(a)} sessions</span></article><article class="metric-card"><strong>${sb.length}</strong><span>${esc(b)} sessions</span></article><article class="metric-card"><strong>${shared.length}</strong><span>Shared topics</span></article><article class="metric-card"><strong>${Math.abs(ia.length-ib.length)}</strong><span>Item-count difference</span></article></div><div class="two-col"><div class="panel-card"><h3>Category comparison</h3><table class="compare-table"><thead><tr><th>Category</th><th>${esc(a)}</th><th>${esc(b)}</th></tr></thead><tbody>${CATEGORIES.slice(1).map(c=>`<tr><td>${c}</td><td>${ia.filter(i=>i.category===c).length}</td><td>${ib.filter(i=>i.category===c).length}</td></tr>`).join('')}</tbody></table></div><div class="panel-card"><h3>Shared topics</h3><div class="taxonomy-list"><ul>${shared.slice(0,40).map(x=>`<li>${esc(nameMap.get(x)||x)}</li>`).join('')}</ul></div></div><div class="panel-card"><h3>Unique to ${esc(a)}</h3><ul>${onlyA.slice(0,35).map(x=>`<li>${esc(nameMap.get(x)||x)}</li>`).join('')}</ul></div><div class="panel-card"><h3>Unique to ${esc(b)}</h3><ul>${onlyB.slice(0,35).map(x=>`<li>${esc(nameMap.get(x)||x)}</li>`).join('')}</ul></div></div>`; }

  function renderMyStudy(){
    const fav=allItems().filter(x=>state.favorites.includes(x.id)), diff=allItems().filter(x=>state.difficult.includes(x.id)), comp=allItems().filter(x=>state.completed.includes(x.id)), due=allItems().filter(x=>isDue(x.id)), notes=allItems().filter(x=>state.notes[x.id]||state.answers[x.id]);
    $('#myStudyView').innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Personal workspace</span><h2>My Study</h2><p>Your progress is stored locally in this browser.</p></div><div class="toolbar-actions"><button id="exportProgressBtn" class="secondary-btn">Export progress</button><label class="secondary-btn" for="importProgressFile">Import progress</label><input id="importProgressFile" type="file" accept="application/json" hidden><button id="resetProgressBtn" class="secondary-btn">Reset</button></div></div><div class="dashboard-grid"><article class="metric-card"><strong>${fav.length}</strong><span>Favourites</span></article><article class="metric-card"><strong>${diff.length}</strong><span>Difficult</span></article><article class="metric-card"><strong>${comp.length}</strong><span>Completed</span></article><article class="metric-card"><strong>${due.length}</strong><span>Due for review</span></article></div><div class="two-col"><div class="panel-card"><h3>Favourites</h3>${myList(fav)}</div><div class="panel-card"><h3>Difficult topics</h3>${myList(diff)}</div><div class="panel-card"><h3>Due for review</h3>${myList(due.slice(0,30))}</div><div class="panel-card"><h3>Notes and answers</h3>${myList(notes)}</div></div>`;
  }
  function myList(arr){ if(!arr.length)return '<p class="muted">Nothing here yet.</p>'; return `<div class="my-list">${arr.slice(0,40).map(x=>`<div class="my-item"><div><b>${esc(x.topic)}</b><small>${esc(x.session.title)}</small></div><button class="mini-btn" data-open-item="${esc(x.id)}">Open</button></div>`).join('')}</div>`; }

  function renderEditor(selectedId=null){
    const ss=sessions(), id=selectedId||$('#editorSessionSelect')?.value||ss[0]?.id, s=ss.find(x=>x.id===id);
    $('#editorView').innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Content management</span><h2>Editor Mode</h2><p>Add, revise, verify, import or export structured recall data.</p></div><div class="toolbar-actions"><button id="newSessionBtn" class="primary-btn">New session</button><button id="exportDataBtn" class="secondary-btn">Export JSON</button><label class="secondary-btn" for="importDataFile">Import JSON</label><input id="importDataFile" type="file" accept="application/json" hidden></div></div><div class="editor-grid"><aside class="panel-card"><label class="field"><span>Find session</span><input id="editorSearch" placeholder="Search centre or title"></label><div class="editor-list" id="editorSessionList">${ss.map(x=>`<button class="${x.id===id?'is-active':''}" data-edit-session="${esc(x.id)}"><b>${esc(x.title)}</b><br><small>${x.center} / ${x.year}</small></button>`).join('')}</div></aside><div>${s?editorForm(s):'<div class="panel-card">Select a session.</div>'}<div class="panel-card"><h3>Change log</h3><div class="change-log">${state.changeLog.slice().reverse().slice(0,40).map(x=>`<p>${esc(new Date(x.at).toLocaleString())} - ${esc(x.action)}</p>`).join('')||'<p>No local edits yet.</p>'}</div></div></div></div>`;
  }
  function editorForm(s){ return `<form id="sessionEditor" class="panel-card" data-session-id="${esc(s.id)}"><div class="two-col"><label class="field"><span>Title</span><input name="title" value="${esc(s.title)}"></label><label class="field"><span>Session ID</span><input name="id" value="${esc(s.id)}" ${BASE_DATA.some(x=>x.id===s.id)?'readonly':''}></label><label class="field"><span>Country</span><input name="country" value="${esc(s.country)}"></label><label class="field"><span>Centre</span><input name="center" value="${esc(s.center)}"></label><label class="field"><span>Year</span><input name="year" type="number" value="${s.year}"></label><label class="field"><span>Month</span><input name="month" value="${esc(s.month||'')}"></label><label class="field"><span>Day</span><input name="day" type="number" value="${s.day||''}"></label><label class="field"><span>Source pages</span><input name="pages" value="${s.pages.join(', ')}"></label></div><h3>Recall items</h3><div class="editor-items" id="editorItems">${s.items.map(i=>editorItem(i)).join('')}</div><div class="dialog-actions"><button id="addEditorItemBtn" type="button" class="secondary-btn">Add item</button><button type="submit" class="primary-btn">Save session</button><button id="deleteSessionBtn" type="button" class="secondary-btn">Delete session</button></div></form>`; }
  function editorItem(i){ return `<div class="editor-item" data-item-id="${esc(i.id)}"><select class="ed-category">${CATEGORIES.slice(1).map(c=>`<option ${c===i.category?'selected':''}>${c}</option>`).join('')}</select><textarea class="ed-text" rows="3">${esc(i.text)}</textarea><button type="button" class="mini-btn" data-remove-editor-item>Remove</button></div>`; }
  function saveEditorForm(form){ const oldId=form.dataset.sessionId; const obj=Object.fromEntries(new FormData(form)); const old=sessions().find(x=>x.id===oldId); const id=obj.id.trim()||`custom-${Date.now()}`; const items=$$('.editor-item',form).map((r,n)=>{const existing=old?.items.find(x=>x.id===r.dataset.itemId); const cat=$('.ed-category',r).value,text=$('.ed-text',r).value.trim(); return {...(existing||{}),id:existing?.id||`${id}::${cat.toLowerCase()}::${n+1}`,category:cat,text,topic:text.split(/[.—;:]/)[0].slice(0,90),specialties:existing?.specialties||['General Paediatrics'],ageGroups:existing?.ageGroups||['Not specified'],contexts:existing?.contexts||['General'],verification:existing?.verification||'Needs Review',confidence:existing?.confidence||'Medium',editorialAnswer:existing?.editorialAnswer||'',tags:existing?.tags||[]};}).filter(x=>x.text); const s={...(old||{}),id,title:obj.title,country:obj.country,center:obj.center,region:old?.region||'',year:Number(obj.year),month:obj.month||null,day:obj.day?Number(obj.day):null,pages:obj.pages.split(',').map(x=>Number(x.trim())).filter(Boolean),items,lastReviewed:new Date().toISOString().slice(0,10),verification:items.some(i=>itemStatus(i)!=='Verified')?'Needs Review':'Verified',confidence:'Medium'}; if(BASE_DATA.some(x=>x.id===oldId))state.editedSessions[oldId]=s; else{const n=state.customSessions.findIndex(x=>x.id===oldId);if(n>=0)state.customSessions[n]=s;else state.customSessions.push(s)} state.changeLog.push({at:nowISO(),action:`Saved session ${s.title}`});saveState();populateFilters();renderLibrary();renderEditor(s.id);toast('Session saved locally.'); }

  function renderAbout(){
    $('#aboutView').innerHTML=`<div class="section-toolbar"><div><span class="section-kicker">Methodology and governance</span><h2>About the Project</h2><p>${esc(META.notice||'')}</p></div></div><div class="about-grid"><article class="panel-card"><h3>Purpose</h3><p>This project converts a handwritten recall archive into a structured, searchable and study-ready knowledge base. It preserves the original source-page reference beside every session while separating transcription from personal study notes and suggested answer workspaces.</p><h3>Verification model</h3><ul><li><b>Verified:</b> reviewed against the original handwritten page.</li><li><b>Corrected:</b> an editorial correction was recorded.</li><li><b>Needs Review:</b> interpretation remains uncertain.</li><li><b>Unclear Handwriting:</b> part of the source could not be read confidently.</li><li><b>Source Not Fully Legible:</b> image quality limits verification.</li></ul><div class="callout"><b>Clinical disclaimer</b><p>Recall text and user-created answer notes are educational material. They are not substitutes for current guidelines, supervised training or patient-specific clinical judgment.</p></div></article><article class="panel-card"><h3>Project profile</h3><table class="compare-table"><tr><th>Owner</th><td>${esc(META.owner)}</td></tr><tr><th>Edition</th><td>${esc(META.edition)}</td></tr><tr><th>Source pages</th><td>${META.sourcePages}</td></tr><tr><th>Sessions</th><td>${sessions().length}</td></tr><tr><th>Items</th><td>${allItems().length}</td></tr><tr><th>Last updated</th><td>${esc(META.lastUpdated)}</td></tr></table><h3>Included capabilities</h3><ul><li>Smart search and medical taxonomy</li><li>Side-by-side source verification</li><li>Study mode and spaced repetition</li><li>Favourites, notes and progress backup</li><li>Analytics and cross-centre comparison</li><li>Local editor and JSON import/export</li><li>Print-ready revision booklets</li><li>Offline-capable PWA deployment</li></ul></article></div>`;
  }

  function printSessions(list,title='Medical Recall Revision Booklet'){
    if(!list.length){toast('No sessions to print.');return;} $('#printRoot').innerHTML=`<div class="print-document"><section class="print-cover"><img src="assets/logo.png"><h1>${esc(title)}</h1><h2>Mahmoud Salama</h2><p>${esc(META.edition)} - ${new Date().toLocaleDateString()}</p><p>${list.length} sessions / ${list.reduce((n,s)=>n+s.items.length,0)} items</p></section>${list.map(s=>`<section class="print-session"><h2>${esc(s.title)}</h2><p class="print-meta">${esc(s.country)} | ${esc(s.center)} | ${s.year} | Source page ${s.pages.join(', ')}</p>${CATEGORIES.slice(1).filter(c=>s.items.some(i=>i.category===c)).map(c=>`<div class="print-category"><h3>${c}</h3><ul>${s.items.filter(i=>i.category===c).map(i=>`<li>${esc(i.text)}</li>`).join('')}</ul></div>`).join('')}</section>`).join('')}<div class="print-footer">Medical Recall Intelligence Library - educational recall material only.</div></div>`; setTimeout(()=>window.print(),100); }
  function exportJSON(obj,name){ const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
  function openItemFromStudy(id){ const f=findItem(id); if(!f)return; state.filters={...defaultState().filters,query:f.item.topic};state.page=1;populateFilters();renderLibrary();setTab('library');setTimeout(()=>document.querySelector(`[data-item-id="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),100); }

  function bindEvents(){
    $$('.nav-tab, .mobile-nav-tab').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
    $('[data-jump-library]').addEventListener('click',e=>{e.preventDefault();setTab('library')}); $('#heroStudyBtn').addEventListener('click',()=>setTab('study'));
    $('#themeBtn').addEventListener('click',()=>{state.settings.theme=state.settings.theme==='dark'?'light':'dark';saveState();applySettings()});
    $('#settingsBtn').addEventListener('click',()=>$('#settingsPopover').hidden=!$('#settingsPopover').hidden); $('#closeSettingsBtn').addEventListener('click',()=>$('#settingsPopover').hidden=true);
    $('#fontScale').addEventListener('input',e=>{state.settings.fontScale=Number(e.target.value);saveState();applySettings()}); $('#densitySelect').addEventListener('change',e=>{state.settings.density=e.target.value;saveState();applySettings()}); $('#contrastToggle').addEventListener('change',e=>{state.settings.contrast=e.target.checked;saveState();applySettings()}); $('#focusToggle').addEventListener('change',e=>{state.settings.focus=e.target.checked;saveState();applySettings()}); $('#heroToggle').addEventListener('change',e=>{state.settings.heroCollapsed=e.target.checked;saveState();applySettings()});
    const filterMap={searchInput:'query',searchMode:'searchMode',yearFilter:'year',countryFilter:'country',centerFilter:'center',monthFilter:'month',specialtyFilter:'specialty',ageFilter:'age',contextFilter:'context',verificationFilter:'verification',favoritesOnly:'favoritesOnly',dueOnly:'dueOnly',needsReviewOnly:'needsReviewOnly',sortSelect:'sort'};
    Object.entries(filterMap).forEach(([id,key])=>$('#'+id).addEventListener(id==='searchInput'?'input':'change',e=>{state.filters[key]=e.target.type==='checkbox'?e.target.checked:e.target.value;state.page=1;saveState();renderLibrary()}));
    $('#categoryChips').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;state.filters.category=b.dataset.category;state.page=1;saveState();populateFilters();renderLibrary()});
    $('#clearFiltersBtn').addEventListener('click',()=>{state.filters=defaultState().filters;state.page=1;saveState();populateFilters();renderLibrary()});
    $('#openFiltersBtn').addEventListener('click',()=>$('#filtersPanel').classList.add('open')); $('#closeFiltersBtn').addEventListener('click',()=>$('#filtersPanel').classList.remove('open'));
    $('#pagination').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;state.page=Number(b.dataset.page);saveState();renderLibrary();$('#workspace').scrollIntoView({behavior:'smooth'})});
    $('#libraryResults').addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(!a)return;const id=a.dataset.id;switch(a.dataset.action){case'favorite-session':toggleArray('favorites',id);renderLibrary();break;case'select-session':toggleArray('selected',id);renderLibrary();break;case'share-session':{const u=`${location.href.split('#')[0]}#library?session=${encodeURIComponent(id)}`;navigator.clipboard?.writeText(u);toast('Direct session link copied.');break}case'source-session':openSource(id);break;case'print-session':printSessions([sessions().find(s=>s.id===id)],'Single Recall Session');break;case'favorite-item':toggleArray('favorites',id);renderLibrary();break;case'difficult-item':toggleArray('difficult',id);renderLibrary();break;case'note-item':openNote(id);break;case'source-item':openSource(a.dataset.session,id);break;} });
    $('#libraryResults').addEventListener('change',e=>{if(e.target.dataset.action==='complete-item'){toggleArray('completed',e.target.dataset.id);renderLibrary()}});
    $('#selectVisibleBtn').addEventListener('click',()=>{const ids=currentSessions.slice((state.page-1)*state.pageSize,state.page*state.pageSize).map(s=>s.id);ids.forEach(id=>{if(!state.selected.includes(id))state.selected.push(id)});saveState();renderLibrary();toast('Visible sessions selected.');});
    $('#printFilteredBtn').addEventListener('click',()=>printSessions(currentSessions,'Filtered Medical Recall Revision Booklet')); $('#printSelectedBtn').addEventListener('click',()=>printSessions(sessions().filter(s=>state.selected.includes(s.id)),'Selected Medical Recall Revision Booklet'));
    $('#closeSourceBtn').addEventListener('click',closeSource); $('[data-close-source]').addEventListener('click',closeSource); $('#prevSourcePage').addEventListener('click',()=>{sourceContext.page=Math.max(1,sourceContext.page-1);renderSource()}); $('#nextSourcePage').addEventListener('click',()=>{sourceContext.page=Math.min(META.sourcePages||116,sourceContext.page+1);renderSource()}); $('#zoomInBtn').addEventListener('click',()=>{sourceContext.zoom=Math.min(200,sourceContext.zoom+15);renderSource()}); $('#zoomOutBtn').addEventListener('click',()=>{sourceContext.zoom=Math.max(50,sourceContext.zoom-15);renderSource()}); $('#rotateBtn').addEventListener('click',()=>{sourceContext.rotation=(sourceContext.rotation+90)%360;renderSource()}); $('#fullscreenBtn').addEventListener('click',()=>$('#pdfStage').requestFullscreen?.());
    $('#saveVerificationBtn').addEventListener('click',()=>{const s=sessions().find(x=>x.id===sourceContext.sessionId);const i=sourceContext.itemId?s.items.find(x=>x.id===sourceContext.itemId):s.items[0];state.verification[i.id]={status:$('#sourceVerification').value,confidence:$('#sourceConfidence').value,note:$('#sourceReviewerNote').value,updatedAt:nowISO()};state.changeLog.push({at:nowISO(),action:`Reviewed ${i.topic}`});saveState();renderLibrary();toast('Verification record saved.');});
    $('#closeNoteBtn').addEventListener('click',closeNote); $('[data-close-note]').addEventListener('click',closeNote); $('#saveNoteBtn').addEventListener('click',()=>{state.notes[noteItemId]=$('#noteTextarea').value;state.answers[noteItemId]=$('#answerTextarea').value;saveState();closeNote();renderLibrary();toast('Study note saved.');}); $('#deleteNoteBtn').addEventListener('click',()=>{$('#noteTextarea').value='';$('#answerTextarea').value='';delete state.notes[noteItemId];delete state.answers[noteItemId];saveState();closeNote();renderLibrary();});
    document.addEventListener('click',e=>{
      if(e.target.id==='startStudyBtn')startStudy(false); if(e.target.id==='startRandomBtn')startStudy(true); if(e.target.id==='revealStudyBtn'){study.revealed=true;renderStudyCard()} if(e.target.id==='nextStudyBtn'){study.index++;study.revealed=false;renderStudyCard()} if(e.target.id==='endStudyBtn'){clearInterval(study.timer);study.deck=[];renderStudySetup()} if(e.target.dataset.studyGrade)gradeStudy(e.target.dataset.studyGrade); if(e.target.dataset.studySource)openSource(e.target.dataset.studySource);
      if(e.target.id==='revealFlashBtn'){flash.revealed=true;renderFlashcards()} if(e.target.id==='resetFlashBtn')renderFlashcards(true); if(e.target.dataset.flashGrade)gradeFlash(e.target.dataset.flashGrade);
      if(e.target.dataset.chartFilter){const map={category:'category',year:'year',country:'country',specialty:'specialty'};state.filters[map[e.target.dataset.chartFilter]]=e.target.dataset.value;state.page=1;saveState();populateFilters();renderLibrary();setTab('library')}
      if(e.target.id==='runCompareBtn')runCompare(); if(e.target.dataset.openItem)openItemFromStudy(e.target.dataset.openItem);
      if(e.target.id==='exportProgressBtn')exportJSON({version:2,exportedAt:nowISO(),state},'medical-recall-progress.json'); if(e.target.id==='resetProgressBtn'&&confirm('Reset all favourites, notes and study progress?')){const settings=state.settings,filters=state.filters;state=defaultState();state.settings=settings;state.filters=filters;saveState();renderMyStudy();renderLibrary();toast('Progress reset.');}
      if(e.target.dataset.editSession)renderEditor(e.target.dataset.editSession); if(e.target.id==='newSessionBtn'){const s={id:`custom-${Date.now()}`,title:'New Recall Session',country:'',center:'',region:'',year:new Date().getFullYear(),month:null,day:null,pages:[],items:[],verification:'Needs Review',confidence:'Low',lastReviewed:new Date().toISOString().slice(0,10)};state.customSessions.push(s);saveState();renderEditor(s.id)} if(e.target.id==='addEditorItemBtn'){const c=$('#editorItems');c.insertAdjacentHTML('beforeend',editorItem({id:'',category:'History',text:'',specialties:['General Paediatrics'],ageGroups:['Not specified'],contexts:['General']}))} if(e.target.dataset.removeEditorItem!==undefined)e.target.closest('.editor-item').remove(); if(e.target.id==='deleteSessionBtn'){const form=$('#sessionEditor'),id=form.dataset.sessionId;if(confirm('Delete this session from the local project?')){if(BASE_DATA.some(x=>x.id===id))state.deletedSessions.push(id);else state.customSessions=state.customSessions.filter(x=>x.id!==id);state.changeLog.push({at:nowISO(),action:`Deleted session ${id}`});saveState();populateFilters();renderLibrary();renderEditor();}}
      if(e.target.id==='exportDataBtn')exportJSON({meta:META,sessions:sessions()},'medical-recall-data-edited.json');
    });
    document.addEventListener('submit',e=>{if(e.target.id==='sessionEditor'){e.preventDefault();saveEditorForm(e.target)}});
    document.addEventListener('change',async e=>{if(e.target.id==='compareDimension')updateCompareOptions(); if(e.target.id==='importProgressFile'){try{const j=JSON.parse(await e.target.files[0].text());state=mergeDeep(defaultState(),j.state||j);saveState();applySettings();populateFilters();renderLibrary();renderMyStudy();toast('Progress imported.')}catch{toast('Could not import progress file.')}} if(e.target.id==='importDataFile'){try{const j=JSON.parse(await e.target.files[0].text());const arr=j.sessions||j;if(!Array.isArray(arr))throw Error();state.customSessions=arr.filter(x=>!BASE_DATA.some(b=>b.id===x.id));arr.filter(x=>BASE_DATA.some(b=>b.id===x.id)).forEach(x=>state.editedSessions[x.id]=x);state.changeLog.push({at:nowISO(),action:`Imported ${arr.length} sessions`});saveState();populateFilters();renderLibrary();renderEditor();toast('Structured data imported.')}catch{toast('Could not import data file.')}}});
    $('#backToTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})); window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight,p=h?scrollY/h*100:0;$('#readingProgress').style.width=p+'%';$('#backToTop').classList.toggle('show',scrollY>700)});
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installBtn').hidden=false}); $('#installBtn').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').hidden=true}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#sourceModal').hidden)closeSource();if(!$('#noteModal').hidden)closeNote();$('#settingsPopover').hidden=true}});
  }

  function init(){
    applySettings(); populateFilters(); bindEvents(); updateStats(); renderLibrary();
    const hash=location.hash.slice(1).split('?')[0]; setTab(['library','study','flashcards','analytics','compare','my-study','editor','about'].includes(hash)?hash:state.activeTab||'library',false);
    if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
  init();
})();
