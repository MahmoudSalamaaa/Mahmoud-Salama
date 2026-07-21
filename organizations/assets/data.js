import {BUILD_DATE,DATASETS,LEGACY_BASE,PROFILE,ROLES,MARKETS,PLATFORM_TEMPLATES,MATRIX_TARGET} from './config.js';
import {profileMatch} from './scoring.js';
import {assessEligibility,eligibilityAdjustedMatch} from './eligibility.js';
import {sanitizeRecordInput} from './security.js';

const cache=new Map();
let seedCache=null;

export function parseCSV(text){
  const rows=[];let row=[],field='',quoted=false;
  text=String(text||'').replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(quoted){if(c==='"'&&n==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c}
    else if(c==='"')quoted=true;
    else if(c===','){row.push(field);field=''}
    else if(c==='\n'){row.push(field);rows.push(row);row=[];field=''}
    else if(c!=='\r')field+=c;
  }
  if(field.length||row.length){row.push(field);rows.push(row)}
  const headers=(rows.shift()||[]).map(x=>x.trim());
  return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}

async function fetchText(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),3500);
  try{
    const response=await fetch(url,{cache:'default',signal:controller.signal});
    if(!response.ok)throw new Error(`${response.status} ${url}`);
    return response.text();
  }finally{clearTimeout(timer)}
}

async function getSeed(){
  if(seedCache)return seedCache;
  try{seedCache=await (await fetch('./data/seed.json')).json()}catch{seedCache={}}
  return seedCache;
}

function clean(value){return String(value??'').trim()}
function inferRecordType(dataset,row){
  const configured=DATASETS[dataset]?.kind;
  if(configured==='job')return row.type?.toLowerCase().includes('search')?'search':'job';
  return configured||'directory';
}
function inferTrust(row,dataset){
  const source=clean(row.source).toLowerCase(),url=clean(row.url).toLowerCase(),sourceClass=clean(row.sourceClass).toLowerCase();
  if(/official employer|official multilateral|official regional|official development bank|official african|official government/.test(sourceClass)||dataset==='government'||/official employer|official multilateral|official government|ministry|authority/.test(source))return {label:'Official source',score:5};
  if(/linkedin|indeed|glassdoor|bayt|gulftalent|wuzzuf|devex|reliefweb|careerjet|jooble/.test(source+' '+url))return {label:'Established platform',score:4};
  if(dataset==='recruitment')return {label:'Recruitment source',score:3};
  if(/generated|google search|monitoring/.test(source))return {label:'Generated search',score:2};
  return {label:'Unverified source',score:1};
}
function inferAvailability(row,recordType){
  const status=clean(row.status),lower=status.toLowerCase(),url=clean(row.url),posted=clean(row.posted);
  if(recordType==='search'||/monitor|live search/.test(lower+' '+clean(row.type).toLowerCase()))return 'Monitoring';
  if(recordType==='job'){
    if(/closing soon/.test(lower))return 'Closing Soon';
    if(/deadline passed|expired|closed/.test(lower))return 'Deadline Passed';
    if(/not available|unavailable/.test(lower))return 'Needs Verification';
    if(/open|available|active/.test(lower))return 'Open';
    if(recordType==='search'||/search|monitor/.test(lower))return 'Monitoring';
    return posted?'Needs Verification':'Monitoring';
  }
  if(/careers page available/.test(lower))return 'Careers Page Available';
  if(/official website only/.test(lower))return 'Official Website Only';
  if(/recruitment through platform/.test(lower))return 'Recruitment Through Platform';
  if(/status unknown/.test(lower))return 'Status Unknown';
  if(!url)return 'Status Unknown';
  if(/linkedin|indeed|bayt|glassdoor|gulftalent|wuzzuf|naukri/.test(url))return 'Recruitment Through Platform';
  if(/career|jobs|work-with-us|vacanc/.test(url))return 'Careers Page Available';
  return 'Official Website Only';
}
function africaCategory(type='',notes=''){
  const primary=String(type).toLowerCase(),text=`${type} ${notes}`.toLowerCase();
  if(/un |united nations|multilateral/.test(primary))return 'UN & Multilateral';
  if(/health|medical|digital health|disease|hospital/.test(primary))return 'Health & Digital Health';
  if(/humanitarian|relief|refugee|emergency/.test(primary))return 'Humanitarian';
  if(/civic|technology|innovation|digital|data|tech/.test(primary))return 'Technology & Civic Tech';
  if(/foundation|funder|philanthrop/.test(primary))return 'Foundations';
  if(/research|policy|think tank|institute/.test(primary))return 'Research & Policy';
  if(/pan-african|regional economic|development finance|african development|african .*organization|african .*institution/.test(primary))return 'African-led Organizations';
  if(/ngo/.test(primary))return /african/.test(primary)?'African-led Organizations':'International NGOs';
  if(/health|medical|digital health/.test(text))return 'Health & Digital Health';
  if(/technology|civic tech|digital innovation/.test(text))return 'Technology & Civic Tech';
  return 'Governance & Development';
}
function africaRegion(region='',country=''){
  const regionText=String(region).toLowerCase(),text=`${region} ${country}`.toLowerCase();
  if(/africa-wide|pan-african|sub-saharan/.test(regionText))return 'Pan-African';
  if(/north africa|egypt|morocco|tunisia|algeria|libya|sudan/.test(text))return 'North Africa';
  if(/east africa|eastern|horn|kenya|ethiopia|uganda|tanzania|rwanda|djibouti|somalia/.test(text))return 'East Africa';
  if(/west africa|western|nigeria|ghana|senegal|ivory|côte|sierra|liberia|gambia/.test(text))return 'West Africa';
  if(/central africa|cameroon|congo|chad|gabon/.test(text))return 'Central Africa';
  if(/southern africa|south africa|zimbabwe|zambia|botswana|malawi|mozambique|namibia/.test(text))return 'Southern Africa';
  return 'Pan-African';
}
function careerLink(url='',source=''){
  const text=`${url} ${source}`.toLowerCase();
  return /career|jobs|opportunit|vacanc|work-with-us|recruit/.test(text)?url:'';
}
function officialWebsite(url=''){
  try{const u=new URL(url);return `${u.protocol}//${u.host}/`}catch{return url}
}
function normalizeRow(dataset,row,index){
  const recordType=inferRecordType(dataset,row),trust=inferTrust(row,dataset);
  const record={...row,
    id:clean(row.id)||`${dataset}-${index+1}`,dataset,
    title:clean(row.title||row.name||row.organization||row.company)||'Untitled record',
    subtitle:clean(row.subtitle||row.company||row.organization||row.category||row.focus),
    type:clean(row.type||row.kind||row.category||DATASETS[dataset]?.label),
    region:clean(row.region||row.coverage),country:clean(row.country||row.market),location:clean(row.location||row.city||row.hq),
    fit:clean(row.fit||row.priority)||'Medium',status:clean(row.status)||'Not started',posted:clean(row.posted||row.freshness),
    checked:clean(row.checked)||BUILD_DATE,notes:clean(row.notes||row.roles||row.eligibility||row.restriction),source:clean(row.source)||trust.label,
    url:clean(row.url||row.career),recordType,trust:trust.label,trustScore:trust.score,linkStatus:'Unknown'
  };
  record.availability=inferAvailability(record,recordType);
  record.africaCategory=dataset==='ngos'?(clean(row.africaCategory||row.africa_category)||africaCategory(record.type,record.notes)):'';
  record.africaRegion=dataset==='ngos'?(clean(row.africaRegion||row.africa_region)||africaRegion(record.region,record.country)):'';
  record.careersUrl=dataset==='ngos'?careerLink(record.url,record.source):'';
  record.officialWebsite=dataset==='ngos'?(clean(row.officialWebsite||row.official_website)||officialWebsite(record.url)):'';
  record.headquarters=dataset==='ngos'?clean(row.headquarters||row.hq||record.country):'';
  record.fundingModel=dataset==='ngos'?clean(row.fundingModel||row.funding_model):'';
  record.operatingStatus=dataset==='ngos'?clean(row.operatingStatus||row.operating_status):'';
  record.careersLinkQuality=dataset==='ngos'?clean(row.careersLinkQuality||row.careers_link_quality):'';
  record.activeInCountry=dataset==='ngos'?clean(row.activeInCountry||row.active_in_country):'';
  record.regionalOffice=dataset==='ngos'?clean(row.regionalOffice||row.regional_office):'';
  record.organizationClass=dataset==='ngos'?clean(row.organizationClass||row.organization_class||record.africaCategory):'';
  record.sourceClass=clean(row.sourceClass||row.source_class);record.coverage=clean(row.coverage);record.specialism=clean(row.specialism);record.accountRequired=clean(row.accountRequired||row.account_required);record.alertsAvailable=clean(row.alertsAvailable||row.alerts_available);record.rssUrl=clean(row.rssUrl||row.rss_url);record.reviewFrequency=clean(row.reviewFrequency||row.review_frequency);record.priority=clean(row.priority);record.egyptEligibility=clean(row.egyptEligibility||row.egypt_eligibility);record.remoteScope=clean(row.remoteScope||row.remote_scope);record.officialApplyPolicy=clean(row.officialApplyPolicy||row.official_apply_policy);record.sourceRank=Number(row.sourceRank||row.source_rank||0);record.sourceGroup=clean(row.sourceGroup||row.source_group);record.careersLinkQuality=clean(row.careersLinkQuality||row.careers_link_quality||record.careersLinkQuality);
  record.opportunityTrack=clean(row.opportunityTrack||row.opportunity_track);record.lifecycleStatus=clean(row.lifecycleStatus||row.lifecycle_status)||'Active';record.contractType=clean(row.contractType||row.contract_type);record.gradeLevel=clean(row.gradeLevel||row.grade_level);record.positionScope=clean(row.positionScope||row.position_scope);record.remoteEligibility=clean(row.remoteEligibility||row.remote_eligibility);record.nationalityRestrictions=clean(row.nationalityRestrictions||row.nationality_restrictions);record.languageRequirements=clean(row.languageRequirements||row.language_requirements);record.rosterOpportunity=clean(row.rosterOpportunity||row.roster_opportunity);record.deadlineTimezone=clean(row.deadlineTimezone||row.deadline_timezone);record.atsProvider=clean(row.atsProvider||row.ats_provider);record.atsJobId=clean(row.atsJobId||row.ats_job_id);record.atsIdentifier=clean(row.atsIdentifier||row.ats_identifier);record.department=clean(row.department);record.updatedAt=clean(row.updatedAt||row.updated_at);
  record.skillMatch=profileMatch(record);record.eligibility=assessEligibility(record);record.profileMatch=eligibilityAdjustedMatch(record.skillMatch,record.eligibility);
  return record;
}

function dedupe(rows){
  const seen=new Map();
  for(const r of rows){
    let normalizedUrl='';try{normalizedUrl=r.url?new URL(r.url,'https://local.invalid').href:''}catch{normalizedUrl=r.url||''}const key=normalizedUrl+'|'+r.title.toLowerCase()+'|'+r.country.toLowerCase();
    const prev=seen.get(key);if(!prev||r.trustScore>prev.trustScore)seen.set(key,r);
  }
  return [...seen.values()];
}

export async function loadDataset(dataset,{force=false,fillTarget=true}={}){
  if(!DATASETS[dataset])throw new Error(`Unknown dataset: ${dataset}`);
  if(cache.has(dataset)&&!force)return cache.get(dataset);
  const config=DATASETS[dataset],sources=[`./${config.file}`,`${LEGACY_BASE}${config.file}`,`./data/offline/${config.file}`];
  let raw=[],origin='seed';
  for(const source of sources){
    try{const text=await fetchText(source);raw=parseCSV(text);if(raw.length){origin=source.startsWith('http')?'legacy-github':'local';break}}catch{/* next */}
  }
  if(!raw.length){const seed=await getSeed();raw=seed[dataset]||[]}
  const custom=getCustomRecords(dataset);
  let rows=dedupe([...raw.map((r,i)=>normalizeRow(dataset,r,i)),...custom.map((r,i)=>normalizeRow(dataset,r,raw.length+i))]);
  if(fillTarget&&rows.length<config.target) rows=fillWithMonitoring(dataset,rows,config.target);
  rows.meta={dataset,origin,loadedAt:new Date().toISOString(),originalCount:raw.length,targetCount:config.target};
  cache.set(dataset,rows);return rows;
}

export async function loadMany(names=Object.keys(DATASETS),options={}){
  const results=await Promise.all(names.map(async name=>[name,await loadDataset(name,options)]));
  return Object.fromEntries(results);
}


function internalSourceRank(record){const c=clean(record.sourceClass||record.source).toLowerCase();if(record.sourceRank)return Number(record.sourceRank);if(/official employer|official multilateral|official regional|official development bank|official government/.test(c))return 6;if(/specialist|official humanitarian/.test(c))return 5;if(/regional job board|remote platform/.test(c))return 4;if(/general platform/.test(c))return 3;if(/generated|monitoring/.test(c))return 1;return record.trustScore||2}
function annotateOfficialSources(records){const groups=new Map();for(const r of records){if(!['job','project'].includes(r.recordType)||/generated/i.test(r.source||''))continue;const title=clean(r.title).toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\b(senior|junior|consultant|officer|manager|lead)\b/g,'').trim();const org=clean(r.subtitle).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const country=clean(r.country||r.location).toLowerCase();if(!title||!org)continue;const key=`${title.slice(0,90)}|${org.slice(0,60)}|${country}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)}for(const group of groups.values()){if(group.length<2)continue;const sorted=[...group].sort((a,b)=>internalSourceRank(b)-internalSourceRank(a)||b.trustScore-a.trustScore),primary=sorted[0],alternatives=sorted.map(x=>({title:x.title,url:x.url,source:x.source,dataset:x.dataset,rank:internalSourceRank(x)}));for(const r of group){r.primaryUrl=primary.url;r.primarySource=primary.source;r.isPrimarySource=r===primary;r.sourceAlternatives=alternatives}}return records}

export async function loadGlobal({force=false}={}){
  const priority=['jobs','egypt','gcc','remote','ngos','organizations','medical','recruitment','government','companies','platforms','projects'];
  const datasets=await loadMany(priority,{force,fillTarget:true});
  const all=[];for(const [name,rows] of Object.entries(datasets))for(const row of rows)all.push(row);
  return annotateOfficialSources(dedupe(all));
}

function fillWithMonitoring(dataset,rows,target){
  const generated=[...rows];let i=0;
  while(generated.length<target){
    const role=ROLES[i%ROLES.length],market=MARKETS[Math.floor(i/ROLES.length)%MARKETS.length],platform=PLATFORM_TEMPLATES[Math.floor(i/(ROLES.length*MARKETS.length))%PLATFORM_TEMPLATES.length];
    const url=platform.url(role,market),id=`generated-${dataset}-${i+1}`;
    generated.push(normalizeRow(dataset,{id,title:`${role} — ${market}`,subtitle:platform.name,type:'Live Search',region:market,country:market,fit:'High',status:'Monitoring',checked:BUILD_DATE,notes:'Dynamically generated search entry. It opens current search results and does not claim that a specific vacancy is open.',source:'Generated live search',url},generated.length));
    i++;
  }
  return generated;
}

export function generateSearchMatrix(){
  const records=[];let id=1,skipped=0;
  outer: for(const role of ROLES){
    for(const market of MARKETS){
      for(const platform of PLATFORM_TEMPLATES){
        if(skipped<20 && platform.name==='WUZZUF' && market!=='Egypt'){skipped++;continue}
        records.push(normalizeRow('platforms',{id:id++,title:role,subtitle:platform.name,type:'Live Platform Search',region:market,country:market,fit:PROFILE.keywords.some(k=>role.toLowerCase().includes(k.split(' ')[0]))?'High':'Medium',status:'Monitoring',checked:BUILD_DATE,notes:`Live search for ${role} in ${market} using ${platform.name}.`,source:'Generated search matrix',url:platform.url(role,market)},records.length));
        if(records.length===MATRIX_TARGET)break outer;
      }
    }
  }
  return records;
}

export function clearDataCache(){cache.clear();seedCache=null}
export function datasetSummary(rows){
  return {total:rows.length,countries:new Set(rows.map(x=>x.country).filter(Boolean)).size,highFit:rows.filter(x=>x.profileMatch>=75).length,active:rows.filter(x=>['Open','Monitoring','Careers Page Available'].includes(x.availability)).length,needsVerification:rows.filter(x=>x.availability==='Needs Verification').length};
}

const CUSTOM_KEY='careerCustomRecordsV1';
export function getCustomRecords(dataset=null){
  if(typeof localStorage==='undefined')return [];
  try{const all=JSON.parse(localStorage.getItem(CUSTOM_KEY)||'[]');return dataset?all.filter(x=>x.dataset===dataset):all}catch{return []}
}
export function saveCustomRecord(record){
  if(typeof localStorage==='undefined')throw new Error('Custom records require a browser');
  const all=getCustomRecords();const cleaned=sanitizeRecordInput(record);const value={...cleaned,id:cleaned.id||`custom-${Date.now()}`,dataset:cleaned.dataset||'jobs',checked:cleaned.checked||BUILD_DATE,source:cleaned.source||'Personal data manager'};
  const index=all.findIndex(x=>x.id===value.id);if(index>=0)all[index]=value;else all.unshift(value);localStorage.setItem(CUSTOM_KEY,JSON.stringify(all));clearDataCache();return value;
}
export function deleteCustomRecord(id){if(typeof localStorage==='undefined')return;localStorage.setItem(CUSTOM_KEY,JSON.stringify(getCustomRecords().filter(x=>x.id!==id)));clearDataCache()}
export function importCustomRecords(records){if(typeof localStorage==='undefined')return 0;const valid=(records||[]).map(sanitizeRecordInput).filter(x=>x&&x.title&&x.dataset&&DATASETS[x.dataset]);localStorage.setItem(CUSTOM_KEY,JSON.stringify(valid));clearDataCache();return valid.length}
