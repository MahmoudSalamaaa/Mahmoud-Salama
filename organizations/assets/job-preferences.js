
(function(){
  const KEY='career_job_preferences_v1';
  const ROLE_OPTIONS=[
    ['technology_leadership','CTO / Technology Leadership'],
    ['enterprise_architecture','Enterprise / Solution Architecture'],
    ['digital_transformation','Digital Transformation'],
    ['program_delivery','Program / Project Delivery'],
    ['healthcare_it','Healthcare IT / Digital Health'],
    ['data_analytics','Data / Analytics / BI'],
    ['cloud_devops','Cloud / DevOps / SRE'],
    ['consulting_freelance','Consulting / Freelance']
  ];
  const REGION_OPTIONS=[
    ['egypt','Egypt'],['gcc','GCC'],['africa','Africa'],
    ['remote','Remote / Worldwide'],['europe','Europe']
  ];
  const MODE_OPTIONS=[['remote','Remote'],['hybrid','Hybrid'],['onsite','On-site']];
  const ENGAGEMENT_OPTIONS=[
    ['fulltime','Full-time'],['contract','Contract'],
    ['consulting','Consulting / Freelance'],['parttime','Part-time']
  ];
  const DEFAULTS={
    enabled:true,mode:'rank',minFit:70,
    roles:['technology_leadership','enterprise_architecture','digital_transformation','program_delivery','healthcare_it','data_analytics','cloud_devops','consulting_freelance'],
    regions:['egypt','gcc','africa','remote'],
    workModels:['remote','hybrid'],
    engagements:['fulltime','contract','consulting'],
    hideUnavailable:true,hideNegative:true
  };
  const roleKeywords={
    technology_leadership:['cto','chief technology','technology director','it director','head of technology','technology lead','digital director','cio'],
    enterprise_architecture:['enterprise architect','solution architect','technical architect','domain architect','architecture lead','chief architect'],
    digital_transformation:['digital transformation','transformation director','transformation lead','digital strategy','business transformation'],
    program_delivery:['program manager','programme manager','project manager','delivery manager','portfolio manager','pmo','technical program'],
    healthcare_it:['healthcare technology','healthtech','digital health','health informatics','clinical system','healthcare it','fhir','hl7'],
    data_analytics:['data architect','data platform','analytics','business intelligence','power bi','data warehouse','data governance'],
    cloud_devops:['cloud','devops','sre','site reliability','gitops','kubernetes','openstack','infrastructure'],
    consulting_freelance:['consultant','consulting','advisor','advisory','freelance','fractional','contract']
  };
  const regionKeywords={
    egypt:['egypt','cairo','giza','alexandria'],
    gcc:['gcc','saudi','riyadh','jeddah','uae','dubai','abu dhabi','qatar','doha','oman','muscat','kuwait','bahrain'],
    africa:['africa','south africa','nigeria','kenya','ghana','uganda','morocco','tunisia','algeria','ivory coast','côte d’ivoire'],
    remote:['remote','worldwide','global','home based','work from home','anywhere in the world'],
    europe:['europe','emea','united kingdom','uk','germany','france','netherlands','spain','italy','poland']
  };
  const modelKeywords={
    remote:['remote','work from home','home based','worldwide','anywhere'],
    hybrid:['hybrid'],
    onsite:['on-site','onsite','in office','in-office']
  };
  const engagementKeywords={
    fulltime:['full time','full-time','permanent'],
    contract:['contract','fixed term','consultancy','consultant'],
    consulting:['consulting','freelance','fractional','project based','independent'],
    parttime:['part time','part-time','hourly']
  };
  const stores=()=>{const out=[];for(const name of ['localStorage','sessionStorage']){try{const store=globalThis[name];if(store)out.push(store)}catch{}}return out};
  let memory={};
  const get=()=>{for(const store of stores()){try{return Object.assign({},DEFAULTS,JSON.parse(store.getItem(KEY)||'{}'))}catch{}}return Object.assign({},DEFAULTS,memory)};
  const save=value=>{memory=Object.assign({},value);for(const store of stores()){try{store.setItem(KEY,JSON.stringify(value));return true}catch{}}return false};
  const hasAny=(text,values,map)=>!values.length||values.some(key=>(map[key]||[]).some(word=>text.includes(word)));
  const badAvailability=value=>/^(expired|not available|inactive|broken link|closed|vacancy closed|no longer available)$/i.test(String(value||''));
  const badApplication=value=>/^(rejected|withdrawn|not suitable|ignored|not available)$/i.test(String(value||''));

  function preferenceScore(record,prefs=get()){
    const text=Object.values(record||{}).filter(value=>typeof value==='string'||typeof value==='number').join(' ').toLowerCase();
    let boost=0;
    if(hasAny(text,prefs.roles||[],roleKeywords))boost+=16;
    if(hasAny(text,prefs.regions||[],regionKeywords))boost+=10;
    if(hasAny(text,prefs.workModels||[],modelKeywords))boost+=6;
    if(hasAny(text,prefs.engagements||[],engagementKeywords))boost+=4;
    return boost;
  }
  function recordMatches(record,prefs=get()){
    if(!prefs.enabled)return true;
    const text=Object.values(record||{}).filter(value=>typeof value==='string'||typeof value==='number').join(' ').toLowerCase();
    const score=Number(record?.match_score||record?.fit||0);
    if(score&&score<Number(prefs.minFit||0))return false;
    if(prefs.hideUnavailable&&badAvailability(record?.availability_status))return false;
    if(prefs.hideNegative&&badApplication(record?.application_status))return false;
    if(prefs.mode==='strict'){
      if(!hasAny(text,prefs.roles||[],roleKeywords))return false;
      if(!hasAny(text,prefs.regions||[],regionKeywords))return false;
      if(!hasAny(text,prefs.workModels||[],modelKeywords))return false;
      if(!hasAny(text,prefs.engagements||[],engagementKeywords))return false;
    }
    return true;
  }
  function groupMarkup(title,name,options,selected){
    return `<fieldset class="pref-group"><legend>${title}</legend><div class="pref-check-grid">${
      options.map(([value,label])=>`<label><input type="checkbox" name="${name}" value="${value}" ${selected.includes(value)?'checked':''}><span>${label}</span></label>`).join('')
    }</div></fieldset>`;
  }
  function panelMarkup(prefs){
    return `<button class="job-preferences-button" id="jobPreferencesButton" aria-controls="jobPreferencesPanel" aria-expanded="false"><span>⚙</span><b>Job Preferences</b><small>${prefs.minFit}%+</small></button>
    <div class="job-preferences-backdrop" id="jobPreferencesBackdrop"></div>
    <aside class="job-preferences-panel" id="jobPreferencesPanel" aria-label="Job preferences">
      <div class="pref-head"><div><p class="eyebrow">PROJECT-WIDE SETTINGS</p><h2>Job Preferences</h2><p>Saved in this browser and used across every page.</p></div><button class="pref-close" id="jobPreferencesClose" aria-label="Close">×</button></div>
      <label class="pref-switch"><input type="checkbox" id="prefEnabled" ${prefs.enabled?'checked':''}><span>Apply my preferences across the project</span></label>
      <div class="pref-inline">
        <label><span>Preference mode</span><select id="prefMode"><option value="rank" ${prefs.mode==='rank'?'selected':''}>Rank matches first</option><option value="strict" ${prefs.mode==='strict'?'selected':''}>Strictly filter results</option></select></label>
        <label><span>Minimum fit: <b id="prefFitValue">${prefs.minFit}%</b></span><input type="range" id="prefMinFit" min="0" max="100" step="5" value="${prefs.minFit}"></label>
      </div>
      ${groupMarkup('Target role families','prefRoles',ROLE_OPTIONS,prefs.roles||[])}
      ${groupMarkup('Preferred regions','prefRegions',REGION_OPTIONS,prefs.regions||[])}
      ${groupMarkup('Work models','prefWorkModels',MODE_OPTIONS,prefs.workModels||[])}
      ${groupMarkup('Engagement types','prefEngagements',ENGAGEMENT_OPTIONS,prefs.engagements||[])}
      <div class="pref-flags">
        <label><input type="checkbox" id="prefHideUnavailable" ${prefs.hideUnavailable?'checked':''}><span>Hide unavailable, expired and broken records</span></label>
        <label><input type="checkbox" id="prefHideNegative" ${prefs.hideNegative?'checked':''}><span>Hide rejected, withdrawn and not-suitable records</span></label>
      </div>
      <div class="pref-summary" id="jobPreferencesSummary"></div>
      <div class="pref-actions"><button class="secondary" id="prefReset">Reset</button><button class="primary" id="prefSave">Save & Apply</button></div>
    </aside>`;
  }
  function selected(name){return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input=>input.value)}
  function readPanel(){
    return {
      enabled:document.querySelector('#prefEnabled').checked,
      mode:document.querySelector('#prefMode').value,
      minFit:Number(document.querySelector('#prefMinFit').value),
      roles:selected('prefRoles'),regions:selected('prefRegions'),
      workModels:selected('prefWorkModels'),engagements:selected('prefEngagements'),
      hideUnavailable:document.querySelector('#prefHideUnavailable').checked,
      hideNegative:document.querySelector('#prefHideNegative').checked
    }
  }
  function summary(prefs){
    const parts=[`${prefs.minFit}%+ fit`,prefs.mode==='strict'?'Strict filter':'Rank matches'];
    if(prefs.regions?.length)parts.push(`${prefs.regions.length} regions`);
    if(prefs.workModels?.length)parts.push(`${prefs.workModels.length} work modes`);
    return parts.map(value=>`<span>${value}</span>`).join('');
  }
  function openPanel(open){
    const panel=document.querySelector('#jobPreferencesPanel');
    const backdrop=document.querySelector('#jobPreferencesBackdrop');
    const button=document.querySelector('#jobPreferencesButton');
    panel?.classList.toggle('open',open);
    backdrop?.classList.toggle('open',open);
    button?.setAttribute('aria-expanded',String(open));
  }
  function parseCard(card){
    const text=card.textContent.toLowerCase();
    const scoreMatch=card.textContent.match(/\b(\d{2,3})%\b/);
    const availability=card.dataset.availabilityStatus||card.querySelector('[data-availability]')?.value||'';
    const application=card.dataset.applicationStatus||card.querySelector('[data-application]')?.value||'';
    return {text,match_score:scoreMatch?Number(scoreMatch[1]):0,availability_status:availability,application_status:application};
  }
  function applyToDOM(){
    const prefs=get();
    document.documentElement.dataset.preferencesEnabled=String(prefs.enabled);
    const button=document.querySelector('#jobPreferencesButton small');
    if(button)button.textContent=`${prefs.minFit}%+`;
    const box=document.querySelector('#jobPreferencesSummary');
    if(box)box.innerHTML=summary(prefs);
    const cards=document.querySelectorAll('.record-card,.hit-card,.r4a-card,.social-card,.lifestyle-card,.new-job-card,.vacancy-card,.healthcare-card,[data-status-record]');
    cards.forEach(element=>{
      const card=element.closest('.record-card,.hit-card,.r4a-card,.social-card,.lifestyle-card,.new-job-card,.vacancy-card,.healthcare-card,article,tr')||element;
      if(card.closest('#jobPreferencesPanel'))return;
      const record=parseCard(card);
      const matches=recordMatches(record,prefs);
      card.classList.toggle('preference-hidden',!matches);
      const boost=preferenceScore(record,prefs);
      card.classList.toggle('preference-priority',matches&&boost>=20);
      if(card.matches('article')&&matches&&prefs.mode==='rank'){
        const terminal=(prefs.hideUnavailable&&badAvailability(record.availability_status))||(prefs.hideNegative&&badApplication(record.application_status));
        card.style.order=terminal?'9999':String(-Math.round((record.match_score||0)*10+boost));
      }else if(card.matches('article')){
        card.style.removeProperty('order');
      }
    });
  }
  function init(){
    if(document.querySelector('#jobPreferencesPanel'))return;
    document.body.insertAdjacentHTML('beforeend',panelMarkup(get()));
    document.querySelector('#jobPreferencesButton').onclick=()=>openPanel(true);
    document.querySelector('#jobPreferencesClose').onclick=()=>openPanel(false);
    document.querySelector('#jobPreferencesBackdrop').onclick=()=>openPanel(false);
    document.querySelector('#prefMinFit').oninput=event=>document.querySelector('#prefFitValue').textContent=event.target.value+'%';
    document.querySelector('#prefSave').onclick=()=>{
      const prefs=readPanel();save(prefs);applyToDOM();openPanel(false);
      window.dispatchEvent(new CustomEvent('career-preferences-changed',{detail:prefs}));
      if(window.toast)window.toast('Job preferences saved');
    };
    document.querySelector('#prefReset').onclick=()=>{
      save(DEFAULTS);location.reload();
    };
    document.querySelector('#jobPreferencesSummary').innerHTML=summary(get());
    applyToDOM();
    let timer;
    const observer=new MutationObserver(()=>{
      clearTimeout(timer);timer=setTimeout(applyToDOM,120);
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('career-status-changed',applyToDOM);
  }
  window.CAREER_PREFERENCES={key:KEY,defaults:DEFAULTS,get,save,score:preferenceScore,matches:recordMatches,apply:applyToDOM};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
