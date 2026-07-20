import {PROFILE,MARKETS} from './config.js';

const SYNONYMS = {
  'digital transformation':['digital transformation','transformation','digitization','digitalisation','التحول الرقمي','تحول رقمي','رقمنة'],
  'enterprise architecture':['enterprise architecture','enterprise architect','business architect','solution architecture','معمارية مؤسسية','عمارة مؤسسية','هندسة مؤسسية'],
  'systems management':['systems manager','information systems','enterprise systems','applications manager','مدير نظم','نظم معلومات','إدارة الأنظمة','مدير أنظمة'],
  'healthcare technology':['healthcare technology','health it','digital health','health information systems','medical technology','تكنولوجيا صحية','تكنولوجيا الرعاية الصحية','نظم المعلومات الصحية','صحة رقمية'],
  'data governance':['data governance','data management','data privacy','حوكمة البيانات','إدارة البيانات'],
  'it governance':['it governance','technology governance','cobit','حوكمة تكنولوجيا المعلومات','حوكمة تقنية'],
  'program delivery':['program manager','programme manager','project manager','pmo','delivery manager','إدارة البرامج','مدير برنامج','إدارة المشاريع'],
  'leadership':['director','head','chief','manager','lead','senior','principal','قيادة','مدير','رئيس','تنفيذي'],
  'remote':['remote','work from home','distributed','home-based','عن بعد','من المنزل'],
  'government':['government','public sector','ministry','authority','حكومي','قطاع عام','وزارة','هيئة'],
  'medical':['medical','pharma','pharmaceutical','healthcare','hospital','clinical','طبي','دوائي','مستشفى','صحي'],
  'gcc':['gcc','gulf','saudi arabia','uae','qatar','kuwait','oman','bahrain','الخليج','السعودية','الإمارات','قطر','الكويت','عمان','البحرين'],
  'africa':['africa','african','أفريقيا','افريقيا'],
  'ngo':['ngo','ingos','nonprofit','non profit','humanitarian','development organization','civil society','منظمة','منظمات','غير حكومية','انسانية','إنسانية','تنموية'],
  'egypt':['egypt','cairo','alexandria','مصر','القاهرة','الإسكندرية']
};

const COUNTRY_ALIASES = {
  'مصر':'Egypt','القاهرة':'Egypt','السعودية':'Saudi Arabia','المملكة العربية السعودية':'Saudi Arabia',
  'الإمارات':'United Arab Emirates','الامارات':'United Arab Emirates','دبي':'United Arab Emirates','أبوظبي':'United Arab Emirates',
  'قطر':'Qatar','الكويت':'Kuwait','عمان':'Oman','البحرين':'Bahrain','الأردن':'Jordan','الاردن':'Jordan',
  'المغرب':'Morocco','تونس':'Tunisia','الجزائر':'Algeria','كينيا':'Kenya','نيجيريا':'Nigeria','جنوب أفريقيا':'South Africa',
  'أفريقيا':'Africa','افريقيا':'Africa','الخليج':'GCC','عن بعد':'Remote','عالمي':'Global'
};

const STOP_WORDS = new Set(['a','an','the','and','or','for','in','of','to','with','on','at','from','is','are','i','want','find','show','jobs','job','role','roles','وظيفة','وظائف','اريد','أريد','اعرض','في','من','على','او','أو','مع','بدون','غير','فقط']);

export function normalizeText(value=''){
  return String(value).toLowerCase().normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g,'')
    .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
    .replace(/[^\p{L}\p{N}+#.]+/gu,' ').trim();
}

export function tokenize(value=''){
  return normalizeText(value).split(/\s+/).filter(x=>x.length>1&&!STOP_WORDS.has(x));
}

export function expandQuery(query){
  const normalized=normalizeText(query),terms=new Set(tokenize(query));
  for(const [concept,variants] of Object.entries(SYNONYMS)){
    if(variants.some(v=>normalized.includes(normalizeText(v)))){
      tokenize(concept).forEach(x=>terms.add(x));
      variants.flatMap(tokenize).forEach(x=>terms.add(x));
    }
  }
  return [...terms];
}

export function parseIntent(query){
  const raw=String(query||''),normalized=normalizeText(raw),expanded=expandQuery(raw);
  const countries=[];
  for(const [alias,country] of Object.entries(COUNTRY_ALIASES)) if(normalized.includes(normalizeText(alias))) countries.push(country);
  for(const market of MARKETS) if(normalized.includes(normalizeText(market))) countries.push(market);
  const exclusions=[];
  const exclusionMatches=raw.matchAll(/(?:without|exclude|not requiring|لا يتطلب|بدون|استبعد)\s+([\p{L}\p{N}+#.-]{2,}(?:\s+[\p{L}\p{N}+#.-]{2,}){0,3})/giu);
  for(const match of exclusionMatches) exclusions.push(normalizeText(match[1]));
  const flags={
    remote:SYNONYMS.remote.some(v=>normalized.includes(normalizeText(v))),
    medical:SYNONYMS.medical.some(v=>normalized.includes(normalizeText(v))),
    government:SYNONYMS.government.some(v=>normalized.includes(normalizeText(v))),
    senior:/\b(senior|lead|head|director|chief|principal|manager)\b/i.test(raw)||/(كبير|مدير|رئيس|قياد)/.test(raw),
    openOnly:/(open|available|active|متاح|مفتوح|حالي)/i.test(raw),
    recent:/(recent|latest|newest|last 30|احدث|أحدث|حديث|اخر 30|آخر 30)/i.test(raw),
    ngo:SYNONYMS.ngo.some(v=>normalized.includes(normalizeText(v)))
  };
  return {query:raw,normalized,terms:expanded,countries:[...new Set(countries)],exclusions,flags};
}

function textOf(record){return normalizeText([record.title,record.subtitle,record.type,record.region,record.country,record.location,record.notes,record.source,record.recordType].filter(Boolean).join(' '))}
function recencyScore(record){
  const value=record.posted||record.checked;
  if(!value) return 0;
  const d=new Date(value);if(Number.isNaN(d.getTime())) return 0;
  const days=Math.max(0,(Date.now()-d.getTime())/86400000);
  return Math.max(0,1-Math.min(days,365)/365);
}

export function profileMatch(record){
  const text=textOf(record);let hits=0,weighted=0;
  PROFILE.keywords.forEach((keyword,index)=>{if(text.includes(normalizeText(keyword))){hits++;weighted+=index<8?1.35:1}});
  const existing=String(record.fit||'').toLowerCase();
  const fitBoost=existing==='high'?13:existing==='medium'?6:Number(record.fit)>0?Number(record.fit)*2:0;
  return Math.min(99,Math.round(28+(weighted/PROFILE.keywords.length)*72+fitBoost));
}

export function scoreRecord(record,intent){
  const text=textOf(record),title=normalizeText(record.title),subtitle=normalizeText(record.subtitle),terms=intent.terms;
  let score=0;const reasons=[],gaps=[];
  for(const term of terms){
    if(title.includes(term)){score+=8;reasons.push(`Title: ${term}`)}
    else if(subtitle.includes(term)){score+=5;reasons.push(`Organization: ${term}`)}
    else if(text.includes(term)){score+=2.5}
  }
  if(intent.countries.length){
    const match=intent.countries.some(c=>text.includes(normalizeText(c))||(c==='GCC'&&/(saudi|emirates|qatar|kuwait|oman|bahrain|gcc)/.test(text)));
    match?(score+=14,reasons.push('Target market')):(score-=8,gaps.push('Different market'));
  }
  if(intent.flags.remote){/remote|home based|distributed|worldwide/.test(text)?(score+=10,reasons.push('Remote-compatible')):(score-=4,gaps.push('Not clearly remote'))}
  if(intent.flags.medical){/health|medical|pharma|hospital|clinical/.test(text)?(score+=9,reasons.push('Healthcare sector')):(score-=3)}
  if(intent.flags.government){/government|public|authority|ministry|united nations|world bank/.test(text)?(score+=9,reasons.push('Public/institutional sector')):(score-=3)}
  if(intent.flags.ngo){/ngo|humanitarian|development|foundation|civil society|united nations|african union|multilateral/.test(text)?(score+=12,reasons.push('NGO / development sector')):(score-=5)}
  if(intent.flags.senior){/chief|director|head|manager|lead|principal|senior/.test(title)?(score+=8,reasons.push('Senior-level role')):(score-=2)}
  if(intent.flags.openOnly){/open|monitoring|available/.test(normalizeText(record.availability||record.status))?score+=5:score-=8}
  if(intent.flags.recent) score+=recencyScore(record)*7;
  for(const excluded of intent.exclusions){if(text.includes(excluded)){score-=25;gaps.push(`Excluded: ${excluded}`)}}
  const match=profileMatch(record);score+=(match-50)/5;
  if(match>=75) reasons.push('Strong profile alignment');
  score+=(record.trustScore||0)*1.4;
  return {score,reasons:[...new Set(reasons)].slice(0,4),gaps:[...new Set(gaps)].slice(0,3),profileMatch:match};
}

export function localSemanticSearch(query,records,{limit=100}={}){
  const intent=parseIntent(query);
  const ranked=records.map(record=>({...record,_search:scoreRecord(record,intent)}))
    .filter(record=>!query.trim()||record._search.score>0)
    .sort((a,b)=>b._search.score-a._search.score||b._search.profileMatch-a._search.profileMatch)
    .slice(0,limit);
  const interpretation=[];
  if(intent.countries.length) interpretation.push(`Markets: ${intent.countries.join(', ')}`);
  if(intent.flags.remote) interpretation.push('Remote work');
  if(intent.flags.medical) interpretation.push('Healthcare / medical');
  if(intent.flags.government) interpretation.push('Government / institutional');
  if(intent.flags.ngo) interpretation.push('NGO / development organizations');
  if(intent.flags.senior) interpretation.push('Senior leadership');
  if(intent.exclusions.length) interpretation.push(`Excluded: ${intent.exclusions.join(', ')}`);
  return {intent,ranked,summary:`Found ${ranked.length} locally ranked results`,interpretation:interpretation.join(' · ')||'Semantic matching across titles, sectors, locations and profile keywords'};
}

export function highlight(text,query){
  const safe=escapeHTML(text||'');const terms=tokenize(query).slice(0,8);
  if(!terms.length)return safe;
  const pattern=terms.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  return safe.replace(new RegExp(`(${pattern})`,'giu'),'<mark>$1</mark>');
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
