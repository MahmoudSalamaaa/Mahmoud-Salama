function norm(value=''){return String(value).toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}+#.]+/gu,' ').trim()}
function text(record={}){return norm([record.title,record.subtitle,record.notes,record.country,record.region,record.location,record.egyptEligibility,record.remoteScope,record.nationalityRestrictions,record.languageRequirements,record.contractType,record.positionScope,record.type].filter(Boolean).join(' '))}
const EGYPT_TERMS=['egypt','cairo','mena','middle east','north africa','africa','emea','global','worldwide','international','any location','home based','home-based','remote'];
const RESTRICTED_TERMS=['us only','united states only','uk only','eu only','european union only','canada only','australia only','must be based in','must reside in','citizens only','national only','nationals only','security clearance required','work authorization required'];
const POSITIVE_REMOTE=['worldwide','global remote','remote anywhere','africa remote','emea remote','mena remote','egypt remote','home based','home-based'];
export function assessEligibility(record={}){
  const source=text(record),reasons=[],warnings=[];let score=70,status='unclear';
  const egyptExplicit=/egypt|cairo/.test(source),regional=EGYPT_TERMS.some(x=>source.includes(norm(x))),remotePositive=POSITIVE_REMOTE.some(x=>source.includes(norm(x)));
  const restricted=RESTRICTED_TERMS.filter(x=>source.includes(norm(x)));
  const nationality=/national only|nationals only|citizens only/.test(source)&&!/egypt|egyptian/.test(source);
  const foreignWorkAuth=/work authorization required|must be authorized to work/.test(source)&&!/egypt|worldwide|global/.test(source);
  const frenchRequired=/french required|fluent french|francophone|maitrise du francais/.test(source);
  if(restricted.length||nationality||foreignWorkAuth){status='restricted';score=20;reasons.push(nationality?'Nationality restriction appears incompatible with Egypt':'Location or work-authorization restriction may exclude Egypt')}
  else if(egyptExplicit){status='eligible';score=100;reasons.push('Egypt is explicitly included')}
  else if(remotePositive){status='eligible';score=92;reasons.push('Remote scope appears compatible with Egypt')}
  else if(regional){status='likely';score=82;reasons.push('Africa, MENA, EMEA or international scope may include Egypt')}
  else{warnings.push('Egypt eligibility is not stated and should be verified')}
  if(frenchRequired){score=Math.max(10,score-25);warnings.push('French appears to be required')}
  if(/local contract|national position|country national/.test(source)&&!egyptExplicit){score=Math.max(10,score-30);warnings.push('The role may be limited to local nationals or residents')}
  if(/relocation required|on site only|onsite only/.test(source)&&!egyptExplicit){score=Math.max(10,score-15);warnings.push('Relocation or on-site attendance may be required')}
  const label=status==='eligible'?'Eligible from Egypt':status==='likely'?'Likely eligible — verify':status==='restricted'?'Likely not eligible':'Eligibility unclear';
  return {key:status,label,score,reasons,warnings,egyptExplicit,remotePositive};
}
export function eligibilityAdjustedMatch(skillScore,assessment){const raw=Number(skillScore||0),a=assessment||{key:'unclear',score:70};if(a.key==='restricted')return Math.min(35,Math.round(raw*.4));if(a.key==='unclear')return Math.max(0,raw-10);if(a.key==='likely')return Math.max(0,raw-3);return raw}
export function eligibilityBadge(record){return assessEligibility(record)}
