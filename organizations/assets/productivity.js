const SETTINGS_KEY='careerProductivitySettingsV1';

export const SYNONYM_GROUPS=[
  ['systems manager','information systems manager','enterprise systems manager','applications manager','head of applications','head of information systems'],
  ['digital transformation','digital strategy','business transformation','technology transformation','digital modernization'],
  ['it director','head of it','technology director','director of information technology','country it manager','regional it manager'],
  ['enterprise architect','solution architect','business architect','technology architect','integration architect'],
  ['healthcare technology','digital health','health information systems','health informatics','medical technology'],
  ['data governance','information governance','data management','master data management','data quality'],
  ['project manager','program manager','programme manager','delivery manager','pmo lead'],
  ['remote','work from home','distributed','home based','home-based'],
  ['ngo','non governmental organization','non-governmental organization','humanitarian organization','development organization','civil society'],
  ['africa','african','sub saharan africa','sub-saharan africa','east africa','west africa','north africa','southern africa']
];

export const EXCLUSION_OPTIONS=[
  {id:'internship',label:'Internship / trainee',terms:['internship','intern','trainee','graduate program','graduate programme']},
  {id:'junior',label:'Junior / entry level',terms:['junior','entry level','entry-level','associate level']},
  {id:'french',label:'French required',terms:['french required','fluent french','francophone','maîtrise du français']},
  {id:'relocation',label:'Relocation unavailable',terms:['relocation required','must relocate','on-site only','onsite only']},
  {id:'citizenship',label:'Citizenship restricted',terms:['citizens only','nationality required','must be a citizen','security clearance']},
  {id:'programming',label:'Programming-heavy role',terms:['software developer','full stack','full-stack','backend developer','frontend developer','coding required','hands-on programming']},
  {id:'temporary',label:'Very short contract',terms:['one month contract','2 month contract','two month contract','three month contract','3 month contract']}
];

export const SEARCH_PRESETS=[
  {id:'africa-senior-tech',name:'Senior Technology Roles in Africa',nameAr:'وظائف تقنية قيادية في أفريقيا',query:'IT Director Systems Manager Digital Transformation Africa',filters:{dataset:'jobs'}},
  {id:'health-ngos',name:'Healthcare Technology NGOs',nameAr:'منظمات الصحة والتكنولوجيا',query:'healthcare technology digital health NGO Africa',filters:{dataset:'ngos'}},
  {id:'gcc-transformation',name:'Digital Transformation in GCC',nameAr:'التحول الرقمي في الخليج',query:'digital transformation GCC',filters:{dataset:'gcc'}},
  {id:'remote-enterprise',name:'Remote Enterprise Systems',nameAr:'أنظمة مؤسسية عن بُعد',query:'enterprise systems remote',filters:{dataset:'remote'}},
  {id:'development-tech',name:'International Development Technology',nameAr:'تكنولوجيا التنمية الدولية',query:'technology digital transformation development organization Africa',filters:{dataset:'ngos'}},
  {id:'egypt-senior-it',name:'Egypt Senior IT Management',nameAr:'إدارة تقنية عليا في مصر',query:'IT Director Systems Manager Egypt',filters:{dataset:'egypt'}}
];

export function normalize(value=''){
  return String(value).toLowerCase().normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g,'')
    .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
    .replace(/[^\p{L}\p{N}+#.]+/gu,' ').trim();
}

export function recordText(record){
  return normalize([record.title,record.subtitle,record.type,record.region,record.country,record.location,record.notes,record.source,record.africaCategory,record.africaRegion,record.recordType].filter(Boolean).join(' '));
}

function synonymAlternatives(query){
  const q=normalize(query),alternatives=[];
  for(const group of SYNONYM_GROUPS){
    const normalized=group.map(normalize);
    if(normalized.some(term=>q.includes(term)))alternatives.push(normalized);
  }
  return alternatives;
}

export function matchesSearch(record,query=''){
  const q=normalize(query);if(!q)return true;
  const text=recordText(record),groups=synonymAlternatives(q);
  const consumed=new Set();
  for(const group of groups){
    group.forEach(term=>term.split(' ').forEach(token=>consumed.add(token)));
    if(!group.some(term=>text.includes(term)))return false;
  }
  const remaining=q.split(' ').filter(token=>token.length>1&&!consumed.has(token));
  return remaining.every(token=>text.includes(token));
}

export function getSettings(){
  try{return {...defaultSettings(),...(JSON.parse(localStorage.getItem(SETTINGS_KEY))||{})}}catch{return defaultSettings()}
}
export function defaultSettings(){return {exclusions:[],viewDensity:'comfortable',homeSections:['today','start','directories','recent'],autoMonitorLimit:10,autoMonitorOnToday:false,backupIntervalDays:7,officialSourcesFirst:true,sourceReviewMode:'priority'}}
export function saveSettings(values){const next={...getSettings(),...values};localStorage.setItem(SETTINGS_KEY,JSON.stringify(next));return next}
export function getActiveExclusions(){return getSettings().exclusions||[]}
export function matchesExclusions(record,active=getActiveExclusions()){
  if(!active?.length)return false;const text=recordText(record);
  return EXCLUSION_OPTIONS.filter(x=>active.includes(x.id)).some(x=>x.terms.some(term=>text.includes(normalize(term))));
}

export function dataFreshness(record,linkCheck=null,now=new Date()){
  const candidates=[record.checked,record.posted,linkCheck?.checkedAt].filter(Boolean).map(x=>new Date(x)).filter(d=>!Number.isNaN(d.getTime()));
  if(!candidates.length)return {key:'unknown',label:'Unknown',days:null,score:0};
  const latest=new Date(Math.max(...candidates.map(d=>d.getTime()))),days=Math.max(0,Math.floor((now-latest)/86400000));
  if(days<=30)return {key:'fresh',label:'Fresh',days,score:4};
  if(days<=60)return {key:'aging',label:'Aging',days,score:3};
  if(days<=90)return {key:'old',label:'Old',days,score:2};
  return {key:'stale',label:'Stale',days,score:1};
}

export function careersLinkQuality(record){
  const u=normalize(record.url),source=normalize(record.source),status=normalize(record.availability);
  if(/linkedin\.com\/jobs|indeed\.|glassdoor|google\.com\/search/.test(record.url||''))return {key:'platform',label:'Recruitment / search platform'};
  if(/job|career|vacanc|opportunit|work-with-us|join-us/.test(u)||/official careers|official employer/.test(source))return {key:'direct',label:'Direct careers page'};
  if(/open|closing soon/.test(status)&&record.recordType==='job')return {key:'vacancy',label:'Current vacancy page'};
  if(/official website only/.test(status))return {key:'website',label:'General website'};
  return {key:'unknown',label:'Careers page not confirmed'};
}

export function verificationState(record,linkCheck=null){
  if(/Generated/.test(record.source||''))return {key:'generated',label:'Generated search link'};
  if(linkCheck&&/broken|unavailable|timeout|error/i.test(linkCheck.state||''))return {key:'broken',label:'Broken or unavailable'};
  if(careersLinkQuality(record).key==='unknown')return {key:'missing-careers',label:'Missing direct careers page'};
  if((record.trustScore||0)>=4)return {key:'verified',label:'Verified official / established'};
  return {key:'manual',label:'Requires manual verification'};
}

export function duplicateGroups(records){
  const groups=new Map();
  for(const record of records){
    let host='';try{host=new URL(record.url).hostname.replace(/^www\./,'')}catch{}
    const title=normalize(record.title).replace(/\b(ltd|llc|inc|company|organization|organisation|foundation)\b/g,'').trim();
    const key=host?`host:${host}|${title.slice(0,40)}`:`name:${title}|${normalize(record.country)}`;
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(record);
  }
  return [...groups.values()].filter(group=>group.length>1);
}

export function ngoMetadata(record){
  const text=recordText(record);let category=record.africaCategory||'';
  if(!category){
    if(/african union|african development|pan african|pan-african/.test(text))category='African-led / Pan-African';
    else if(/united nations|\bun\b|world bank|multilateral/.test(text))category='UN & Multilateral';
    else if(/health|medical|amref|malaria|aids|tuberculosis/.test(text))category='Health & Digital Health';
    else if(/humanitarian|relief|refugee|rescue|red cross/.test(text))category='Humanitarian';
    else if(/research|policy|institute|think tank/.test(text))category='Research & Policy';
    else if(/foundation|trust/.test(text))category='Foundation';
    else if(/technology|digital|civic tech|innovation/.test(text))category='Technology & Civic Tech';
    else category='International / Development NGO';
  }
  const scope=record.africaRegion||record.region||'Africa-wide';
  const operatingStatus=record.operatingStatus||'Directory entry — current operations should be verified';
  const fundingModel=record.fundingModel||(/foundation/.test(text)?'Foundation-funded / grant-making':/united nations|world bank|development bank/.test(text)?'Multilateral / member-funded':'Not specified');
  return {category,scope,operatingStatus,fundingModel,headquarters:record.headquarters||record.country||'Not specified',activeInCountry:record.activeInCountry||'Not verified',regionalOffice:record.regionalOffice||'Not specified',organizationClass:record.organizationClass||category};
}

export function applicationAnalytics(items){
  const active=items.filter(x=>['Applied','Assessment','Interview','Follow-up','Offer','Rejected'].includes(x.status));
  const submitted=items.filter(x=>x.applicationDate||['Applied','Assessment','Interview','Follow-up','Offer','Rejected'].includes(x.status));
  const interviews=items.filter(x=>['Interview','Offer'].includes(x.status)||x.interviewDate);
  const offers=items.filter(x=>x.status==='Offer');
  const responses=items.filter(x=>['Assessment','Interview','Follow-up','Offer','Rejected'].includes(x.status));
  const days=responses.map(x=>{if(!x.applicationDate)return null;const end=x.lastStatusAt||x.updatedAt;const d=Math.round((new Date(end)-new Date(x.applicationDate))/86400000);return Number.isFinite(d)&&d>=0?d:null}).filter(x=>x!==null);
  const groupCount=field=>{const out={};submitted.forEach(x=>{const key=(field==='cvVersion'?x.cvVersion:x.recordSnapshot?.[field])||'Unknown';out[key]=(out[key]||0)+1});return out};
  const performance=field=>{const out={};submitted.forEach(x=>{const key=(field==='cvVersion'?x.cvVersion:x.recordSnapshot?.[field])||'Unknown';out[key]??={applications:0,responses:0,interviews:0,offers:0};const g=out[key];g.applications++;if(['Assessment','Interview','Follow-up','Offer','Rejected'].includes(x.status))g.responses++;if(['Interview','Offer'].includes(x.status)||x.interviewDate)g.interviews++;if(x.status==='Offer')g.offers++});Object.values(out).forEach(g=>{g.responseRate=Math.round(g.responses/g.applications*100);g.interviewRate=Math.round(g.interviews/g.applications*100)});return out};
  return {tracked:items.length,submitted:submitted.length,active:active.length,responses:responses.length,interviews:interviews.length,offers:offers.length,responseRate:submitted.length?Math.round(responses.length/submitted.length*100):0,interviewRate:submitted.length?Math.round(interviews.length/submitted.length*100):0,offerRate:submitted.length?Math.round(offers.length/submitted.length*100):0,averageResponseDays:days.length?Math.round(days.reduce((a,b)=>a+b,0)/days.length):null,byCountry:groupCount('country'),byDataset:groupCount('dataset'),bySource:groupCount('source'),byCv:groupCount('cvVersion'),performanceByCountry:performance('country'),performanceBySector:performance('type'),performanceBySource:performance('source'),performanceByCv:performance('cvVersion')};
}

export function emptyStateSuggestions(query,filters={}){
  const suggestions=[];
  if(filters.country)suggestions.push(`Remove country filter: ${filters.country}`);
  if(filters.type)suggestions.push(`Remove type filter: ${filters.type}`);
  if(filters.personal)suggestions.push(`Remove My Status filter: ${filters.personal}`);
  if(query){
    const groups=synonymAlternatives(query);if(groups.length)suggestions.push(`Try a related title: ${groups[0].slice(0,3).join(' / ')}`);
    suggestions.push('Search with fewer words');
  }
  suggestions.push('Temporarily disable permanent exclusions');
  return suggestions.slice(0,4);
}


export function sourceAuthorityRank(record={}){
  const cls=normalize(record.sourceClass||record.source),url=String(record.url||'').toLowerCase();
  if(record.sourceRank)return Number(record.sourceRank);
  if(/official employer|official multilateral|official regional|official development bank|official government/.test(cls))return 6;
  if(/official humanitarian|specialist platform/.test(cls))return 5;
  if(/regional job board|remote platform/.test(cls))return 4;
  if(/general platform|recruitment source/.test(cls))return 3;
  if(/generated|google search|monitoring/.test(cls)||/google\.com\/search/.test(url))return 1;
  return record.trustScore||2;
}
export function remoteEligibility(record={}){
  const explicit=record.egyptEligibility||'',scope=record.remoteScope||'',text=normalize([record.title,record.location,record.country,record.region,record.notes,explicit,scope].join(' '));
  if(explicit)return {label:explicit,key:/egypt explicitly|egypt-based|egypt,|egypt roles|international roles/.test(normalize(explicit))?'eligible':/check|varies|role/.test(normalize(explicit))?'unclear':'restricted'};
  if(/egypt/.test(text))return {label:'Egypt explicitly included',key:'eligible'};
  if(/worldwide|global remote|anywhere|africa|emea|middle east|mena/.test(text))return {label:'Potentially eligible from Egypt — verify listing',key:'eligible'};
  if(/us only|united states only|uk only|european union only|canada only/.test(text))return {label:'Likely location-restricted',key:'restricted'};
  if(/remote/.test(text))return {label:'Remote location unclear',key:'unclear'};
  return {label:'Not a remote listing / verify eligibility',key:'unclear'};
}
export function jobAttributes(record={}){
  const text=normalize([record.title,record.type,record.notes,record.subtitle].join(' '));
  const contract=/consultant|consultancy/.test(text)?'Consultancy':/intern/.test(text)?'Internship':/temporary|temp\b/.test(text)?'Temporary':/fixed term|fixed-term/.test(text)?'Fixed term':/contract/.test(text)?'Contract':record.contractType||'Not specified';
  const grade=(String(record.title||'')+' '+String(record.notes||'')).match(/\b(?:D-[12]|P-[1-5]|G-[1-7]|NO-[A-D]|NPSA-?\d+|IPSA-?\d+|PL\d|LP\d)\b/i)?.[0]||record.gradeLevel||'Not specified';
  const scope=/national[s]? only|nationals only|national position/.test(text)?'National position':/international professional|international position/.test(text)?'International position':record.positionScope||'Check vacancy';
  const nationality=/nationals only|citizenship|nationality/.test(text)?'Restriction mentioned — review details':record.nationalityRestrictions||'Not identified';
  const languages=(String(record.notes||'').match(/(?:language|languages|required language)[^.;|]*/i)||[])[0]||record.languageRequirements||'Check vacancy';
  const roster=/roster|talent pool|talent pipeline/.test(text)?'Roster / talent pool':'No roster signal';
  return {contract,grade,scope,nationality,languages,roster,deadlineTimezone:record.deadlineTimezone||'Source timezone / device display — verify'};
}
export function officialFirstGroups(records=[]){
  const map=new Map();
  records.filter(r=>['job','project'].includes(r.recordType)).forEach(r=>{
    const title=normalize(r.title).replace(/\b(senior|junior|consultant|officer|manager|lead)\b/g,'').trim();
    const org=normalize(r.subtitle||'');const country=normalize(r.country||r.location||'');const key=[title.slice(0,80),org.slice(0,50),country].join('|');
    if(!map.has(key))map.set(key,[]);map.get(key).push(r);
  });
  return [...map.values()].filter(g=>g.length>1).map(group=>({primary:[...group].sort((a,b)=>sourceAuthorityRank(b)-sourceAuthorityRank(a)||b.trustScore-a.trustScore)[0],alternatives:[...group].sort((a,b)=>sourceAuthorityRank(b)-sourceAuthorityRank(a)||b.trustScore-a.trustScore)}));
}
export function sourcePerformance(items=[],sources=[]){
  const out={};const byName=new Map(sources.map(s=>[normalize(s.title),s]));
  items.forEach(item=>{const snap=item.recordSnapshot||{},name=item.sourceChannel||snap.source||snap.subtitle||'Unknown source',key=normalize(name),matched=[...byName.entries()].find(([n])=>key.includes(n)||n.includes(key))?.[1],label=matched?.title||name;out[label]??={source:label,applications:0,responses:0,interviews:0,offers:0,expired:0,saved:0,rank:matched?sourceAuthorityRank(matched):0};const x=out[label];if(item.status==='Saved')x.saved++;if(item.applicationDate||['Applied','Assessment','Interview','Follow-up','Offer','Rejected'].includes(item.status))x.applications++;if(['Assessment','Interview','Follow-up','Offer','Rejected'].includes(item.status))x.responses++;if(['Interview','Offer'].includes(item.status)||item.interviewDate)x.interviews++;if(item.status==='Offer')x.offers++;if(snap.availability==='Deadline Passed'||item.status==='Closed')x.expired++;});
  Object.values(out).forEach(x=>{x.responseRate=x.applications?Math.round(x.responses/x.applications*100):0;x.interviewRate=x.applications?Math.round(x.interviews/x.applications*100):0;x.priorityScore=Math.round(x.interviewRate*.45+x.responseRate*.25+Math.min(x.applications,10)*3+x.rank*2-Math.min(x.expired,10)*2)});return Object.values(out).sort((a,b)=>b.priorityScore-a.priorityScore||b.applications-a.applications);
}

export function organizationPriority(record={},tracking={},linkCheck=null){
  const history=Array.isArray(tracking.history)?tracking.history:[];
  const interviews=history.filter(x=>/interview/i.test(`${x.status} ${x.action}`)).length+(tracking.interviewDate?1:0);
  const applications=history.filter(x=>/applied|application/i.test(`${x.status} ${x.action}`)).length+(tracking.applicationDate?1:0);
  const noSuitable=history.filter(x=>x.status==='Not Available'||/no suitable/i.test(x.action||'')).length;
  const changed=history.filter(x=>/page changed|new vacancy|job found/i.test(x.action||'')).length+(linkCheck?.changed?1:0);
  const fresh=dataFreshness(record,linkCheck),base=Math.round((record.profileMatch||50)*.45+(record.trustScore||2)*6+fresh.score*4);
  const score=Math.max(0,Math.min(100,base+interviews*12+applications*4+changed*8-noSuitable*5));
  const frequency=score>=85?3:score>=70?7:score>=50?30:score>=30?60:90;
  const label=score>=85?'Critical':score>=70?'High':score>=50?'Medium':score>=30?'Low':'Very low';
  return {score,label,reviewDays:frequency,interviews,applications,noSuitable,changed};
}

export function detectATSFromUrl(value=''){
  let url;try{url=new URL(value)}catch{return {provider:'unknown',identifier:'',confidence:0,label:'Unknown / custom careers page'}}
  const host=url.hostname.toLowerCase(),path=url.pathname.split('/').filter(Boolean);
  if(host.includes('greenhouse.io')||host.includes('greenhouse.com')){const idx=path.findIndex(x=>['embed','jobs'].includes(x));const identifier=host.startsWith('boards.')||host.startsWith('job-boards.')?(path[0]||''):(idx>=0?path[idx+1]||path[0]:path[0]);return {provider:'greenhouse',identifier,confidence:95,label:'Greenhouse Job Board API'}}
  if(host==='jobs.lever.co'||host==='jobs.eu.lever.co'){return {provider:host.includes('.eu.')?'lever-eu':'lever',identifier:path[0]||'',confidence:95,label:'Lever Postings API'}}
  if(host==='careers.smartrecruiters.com'||host.includes('smartrecruiters.com')){return {provider:'smartrecruiters',identifier:path[0]||'',confidence:95,label:'SmartRecruiters Posting API'}}
  if(host.includes('myworkdayjobs.com'))return {provider:'workday',identifier:host.split('.')[0],confidence:90,label:'Workday — monitored page / snapshot'};
  if(host.includes('successfactors')||host.includes('successfactors.eu'))return {provider:'successfactors',identifier:path[0]||host.split('.')[0],confidence:85,label:'SAP SuccessFactors — monitored page'};
  if(host.includes('oraclecloud.com')||host.includes('oracle.com')&&/career/.test(url.pathname))return {provider:'oracle',identifier:host.split('.')[0],confidence:80,label:'Oracle Recruiting — monitored page'};
  return {provider:'custom',identifier:host,confidence:40,label:'Custom careers page'};
}
