import {PROFILE} from './config.js';

export const OPPORTUNITY_TRACKS=[
  {id:'employment',name:'Permanent Employment',nameAr:'وظائف دائمة',icon:'EMP',description:'Staff and fixed-term employment roles.',keywords:['staff','permanent','fixed term','fixed-term','employee','employment']},
  {id:'consulting',name:'Consultancies',nameAr:'الاستشارات',icon:'CON',description:'Individual consultants, short-term assignments, EOIs, retainers and framework agreements.',keywords:['consultant','consultancy','individual consultant','short-term','technical assistance','expression of interest','eoi','retainer','framework agreement','rfx','request for proposal']},
  {id:'roster',name:'Rosters & Talent Pools',nameAr:'الروستر وقوائم المواهب',icon:'ROS',description:'Prequalified rosters, talent pipelines, standby experts and candidate pools.',keywords:['roster','talent pool','talent pipeline','standby expert','prequalified','candidate pipeline','long-term agreement','lta']},
  {id:'volunteer',name:'Volunteer Assignments',nameAr:'مهام التطوع',icon:'UNV',description:'National, international, online and specialist volunteer assignments.',keywords:['volunteer','unv','online volunteer','national volunteer','international volunteer','specialist assignment']},
  {id:'secondment',name:'Secondments',nameAr:'الانتداب',icon:'SEC',description:'Seconded national experts, mission deployments and temporary institutional assignments.',keywords:['secondment','seconded','national expert','csdp','mission position','temporary agent']},
  {id:'procurement',name:'Projects & Procurement',nameAr:'المشروعات والمشتريات',icon:'RFP',description:'EOIs, RFPs, calls for implementing partners, tenders and consulting-firm opportunities.',keywords:['procurement','tender','rfp','rfx','implementing partner','call for proposal','call for proposals','business opportunity','consulting firm','supplier']},
  {id:'traineeship',name:'Traineeships',nameAr:'التدريب',icon:'TRN',description:'Internships and traineeships. Hidden by default for senior profiles.',keywords:['intern','internship','trainee','traineeship','graduate programme','graduate program']}
];

const RULE_KEY='careerOpportunityRulesV1';
export const DEFAULT_RULES={
  hideTraineeships:true,excludeFrenchMandatory:true,excludeJunior:true,excludeOtherCitizens:true,excludeLowExperienceCeiling:true,excludeProgrammingHeavy:false,
  prioritizeHealthcare:true,prioritizeDigitalTransformation:true,prioritizeLeadership:true,prioritizeAfricaGCC:true,prioritizeInternationalOrganizations:true,prioritizeEgyptEligible:true,
  customExcludeTerms:[],customPriorityTerms:[]
};
function norm(v=''){return String(v||'').toLowerCase().replace(/\s+/g,' ').trim()}
function allText(record={}){return norm([record.title,record.subtitle,record.type,record.notes,record.country,record.region,record.location,record.contractType,record.positionScope,record.rosterOpportunity,record.source].join(' '))}
export function detectOpportunityTrack(record={}){
  const text=allText(record);
  if(/intern|trainee|graduate programme|graduate program/.test(text))return OPPORTUNITY_TRACKS.find(x=>x.id==='traineeship');
  if(/roster|talent pool|talent pipeline|standby expert|prequalified|candidate pipeline|long-term agreement|\blta\b/.test(text))return OPPORTUNITY_TRACKS.find(x=>x.id==='roster');
  if(/volunteer|\bunv\b|online volunteer/.test(text))return OPPORTUNITY_TRACKS.find(x=>x.id==='volunteer');
  if(/secondment|seconded|csdp|national expert|mission position/.test(text))return OPPORTUNITY_TRACKS.find(x=>x.id==='secondment');
  if(/procurement|tender|\brfp\b|\brfx\b|implementing partner|call for proposal|business opportunity|consulting firm|supplier/.test(text))return OPPORTUNITY_TRACKS.find(x=>x.id==='procurement');
  if(/consultant|consultancy|individual consultant|technical assistance|expression of interest|\beoi\b|retainer|framework agreement/.test(text))return OPPORTUNITY_TRACKS.find(x=>x.id==='consulting');
  return OPPORTUNITY_TRACKS.find(x=>x.id==='employment');
}
export function getRules(){try{return {...DEFAULT_RULES,...JSON.parse(localStorage.getItem(RULE_KEY)||'{}')}}catch{return {...DEFAULT_RULES}}}
export function saveRules(values={}){const next={...getRules(),...values};localStorage.setItem(RULE_KEY,JSON.stringify(next));return next}
export function evaluateRules(record={},rules=getRules()){
  const text=allText(record),reasons=[],bonuses=[];let excluded=false,bonus=0;
  const exclude=(condition,reason)=>{if(condition){excluded=true;reasons.push(reason)}};
  exclude(rules.hideTraineeships&&/intern|trainee|graduate programme|graduate program/.test(text),'Traineeship hidden for senior profile');
  exclude(rules.excludeFrenchMandatory&&/(french|français).{0,30}(mandatory|required|essential)|(?:mandatory|required|essential).{0,30}(french|français)/.test(text),'French is mandatory');
  exclude(rules.excludeJunior&&/\bjunior\b|entry[- ]level|0[-–]2 years|1[-–]3 years/.test(text),'Junior or entry-level role');
  exclude(rules.excludeOtherCitizens&&/nationals only|citizens only|must be a citizen|only citizens/.test(text)&&!/egyptian|egypt nationals/.test(text),'Restricted to citizens of another country');
  exclude(rules.excludeLowExperienceCeiling&&/(maximum|max\.?|up to)\s*(?:of\s*)?[0-7]\s*years/.test(text),'Experience ceiling below senior profile');
  exclude(rules.excludeProgrammingHeavy&&/hands-on coding|daily coding|software developer|full-stack|full stack|backend developer|frontend developer/.test(text),'Programming-heavy role');
  for(const term of rules.customExcludeTerms||[])exclude(term&&text.includes(norm(term)),`Excluded term: ${term}`);
  const add=(condition,points,label)=>{if(condition){bonus+=points;bonuses.push(label)}};
  add(rules.prioritizeHealthcare&&/health|medical|hospital|digital health|health information/.test(text),8,'Healthcare');
  add(rules.prioritizeDigitalTransformation&&/digital transformation|enterprise systems|enterprise architecture|integration|erp|crm/.test(text),10,'Digital transformation / enterprise systems');
  add(rules.prioritizeLeadership&&/director|head of|chief|manager|lead|principal|senior/.test(text),8,'Leadership level');
  add(rules.prioritizeAfricaGCC&&/africa|egypt|gcc|saudi|uae|emirates|qatar|kuwait|oman|bahrain|mena|middle east/.test(text),6,'Priority market');
  add(rules.prioritizeInternationalOrganizations&&/united nations|\bun\b|world bank|african development bank|ngo|international organization|multilateral/.test(text),6,'International organization');
  add(rules.prioritizeEgyptEligible&&/egypt|worldwide|global|africa|emea|mena|remote/.test(text),6,'Potentially eligible from Egypt');
  for(const term of rules.customPriorityTerms||[])add(term&&text.includes(norm(term)),4,`Priority term: ${term}`);
  return {excluded,reasons,bonus:Math.min(30,bonus),bonuses};
}

export const REQUIREMENTS=[
  ['cv','CV / Résumé'],['coverLetter','Cover Letter'],['phf','Personal History Form'],['p11','P11 Form'],['technicalProposal','Technical Proposal'],['financialProposal','Financial Proposal'],['writingSample','Writing Sample'],['references','Professional References'],['passport','Passport / ID'],['certificates','Academic Certificates'],['availability','Availability Statement'],['conflict','Conflict-of-Interest Declaration'],['vendorRegistration','Vendor / Consultant Registration'],['europass','Europass CV'],['portfolio','Executive Profile / Portfolio']
];
export function inferRequirements(record={},tracking={}){
  const text=allText(record);const detected={};
  const has=(key,pattern)=>{if(pattern.test(text))detected[key]=true};
  has('cv',/\bcv\b|resume|résumé/);has('coverLetter',/cover letter|motivation letter/);has('phf',/personal history form|php form/);has('p11',/\bp11\b/);has('technicalProposal',/technical proposal|technical offer/);has('financialProposal',/financial proposal|financial offer|fee proposal/);has('writingSample',/writing sample/);has('references',/reference|referee/);has('passport',/passport|identity document|national id/);has('certificates',/certificate|degree copy|academic document/);has('availability',/availability statement|availability date/);has('conflict',/conflict.of.interest/);has('vendorRegistration',/vendor registration|supplier registration|consultant registration|ungm registration/);has('europass',/europass/);has('portfolio',/portfolio|executive profile/);
  const current=tracking.applicationRequirements||{};return {...detected,...current};
}
export function readiness(requirements={}){const required=Object.entries(requirements).filter(([,v])=>v===true||v==='required'),ready=Object.entries(requirements).filter(([,v])=>v==='ready');return {required:required.length,ready:ready.length,total:required.length+ready.length,percent:(required.length+ready.length)?Math.round(ready.length/(required.length+ready.length)*100):100}}
function deadlineRisk(record={},tracking={}){const value=tracking.deadline||record.deadline||record.closingDate;if(!value)return {score:60,label:'Unknown'};const d=new Date(value),days=Math.ceil((d-Date.now())/86400000);if(Number.isNaN(d.getTime()))return {score:60,label:'Verify'};if(days<0)return {score:0,label:'Passed'};if(days<=2)return {score:25,label:'Critical'};if(days<=7)return {score:55,label:'High'};if(days<=21)return {score:80,label:'Low'};return {score:95,label:'Comfortable'}}
export function decisionScore(record={},tracking={}){
  const rule=evaluateRules(record),elig=record.eligibility||{},professional=Number(record.profileMatch||record._search?.profileMatch||50),eligScore=elig.key==='restricted'?0:elig.key==='eligible'?100:elig.key==='likely'?80:55,source=Math.min(100,Number(record.sourceRank||record.trustScore||3)*16),deadline=deadlineRisk(record,tracking),effort=tracking.applicationEffort||(/proposal|p11|personal history|vendor registration|rfx|eoi/.test(allText(record))?'High':'Medium'),effortScore=effort==='Low'?95:effort==='High'?45:70,competition=tracking.expectedCompetition||(/united nations|world bank|african development bank|director|chief/.test(allText(record))?'High':'Medium'),competitionScore=competition==='Low'?90:competition==='High'?55:70;
  let total=Math.round(professional*.30+eligScore*.25+source*.15+deadline.score*.10+effortScore*.10+competitionScore*.10)+rule.bonus; if(rule.excluded)total=Math.min(total,25); total=Math.max(0,Math.min(100,total));
  const priority=total>=85?'Apply now':total>=70?'High':total>=55?'Medium':total>=35?'Low':'Skip / verify';return {total,priority,professional,eligibility:eligScore,source,deadline:deadline.label,effort,competition,excluded:rule.excluded,reasons:rule.reasons,bonuses:rule.bonuses};
}

export const PROFILE_COVERAGE=[
  {track:'Enterprise Systems Leadership',readiness:94,strengths:['18+ years of enterprise systems and leadership','ERP, CRM, integration and data platforms'],gaps:['Keep executive evidence current']},
  {track:'Digital Transformation',readiness:92,strengths:['National and public-sector transformation','Program delivery and stakeholder management'],gaps:['Complete TOGAF credential when ready']},
  {track:'Healthcare Technology',readiness:91,strengths:['Healthcare procurement and health information systems','Digital health and reporting'],gaps:['Add quantified international-health outcomes']},
  {track:'International NGOs',readiness:78,strengths:['Public-sector and health-sector relevance','Strong cross-functional leadership'],gaps:['Create NGO-focused CV','Highlight development outcomes and donor-facing work']},
  {track:'UN Consultancies',readiness:72,strengths:['Technical and program-management depth','Government and healthcare domain expertise'],gaps:['Prepare P11 / PHP','Prepare technical and financial proposal templates','Register on consultant portals']},
  {track:'Rosters & Talent Pools',readiness:75,strengths:['Broad senior technology profile'],gaps:['Create concise competency stories','Maintain availability statement']},
  {track:'EU / EEAS Opportunities',readiness:58,strengths:['Technology governance and program delivery'],gaps:['Check nationality restrictions','Prepare Europass CV where requested']},
  {track:'French-required Africa roles',readiness:42,strengths:['Strong technical profile'],gaps:['French language capability','Target English-speaking and bilingual-optional roles first']}
];
export function recommendedTemplates(record={}){const track=detectOpportunityTrack(record).id,text=allText(record);const out=['executive-profile'];if(/health|medical/.test(text))out.push('healthcare-cv');if(/ngo|development|humanitarian|united nations|world bank/.test(text))out.push('ngo-leadership-cv','development-cover-letter');if(track==='consulting'||track==='procurement')out.push('technical-proposal','financial-proposal','expression-of-interest');if(track==='roster')out.push('roster-statement');if(/united nations|\bun\b/.test(text))out.push('un-personal-history');if(/eeas|european union|eu delegation/.test(text))out.push('europass-cv');return [...new Set(out)]}
export function lifecycleLabel(value='Active'){const v=value||'Active';return {key:norm(v).replace(/[^a-z0-9]+/g,'-'),label:v}}
