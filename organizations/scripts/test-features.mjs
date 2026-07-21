import atsHandler from '../api/ats-jobs.js';
import {detectATSFromUrl,organizationPriority,matchesSearch} from '../assets/productivity.js';
import {assessEligibility,eligibilityAdjustedMatch} from '../assets/eligibility.js';
import {parseCSV,generateSearchMatrix} from '../assets/data.js';
import {readFile} from 'node:fs/promises';
import {detectOpportunityTrack,decisionScore,evaluateRules,inferRequirements} from '../assets/opportunity-core.js';
import {buildZip} from '../assets/archive.js';
import {encryptPortableBackup,decryptPortableBackup} from '../assets/vault.js';

function response(){return {code:0,body:null,headers:{},status(n){this.code=n;return this},json(x){this.body=x;return this},setHeader(k,v){this.headers[k]=v}}}
const providerCases=[
  ['greenhouse',{jobs:[{id:1,title:'Digital Transformation Manager',location:{name:'Cairo, Egypt'},departments:[{name:'Technology'}],updated_at:'2026-07-20T12:00:00Z',absolute_url:'https://example.com/1',content:'<p>Lead systems</p>'}]}],
  ['lever',[{id:'l1',text:'Head of IT',categories:{team:'Technology',location:'Remote - EMEA',department:'IT',commitment:'Full-time'},createdAt:Date.now(),hostedUrl:'https://example.com/l1',descriptionPlain:'Enterprise systems'}]],
  ['smartrecruiters',{content:[{id:'s1',name:'Systems Manager',location:{city:'Nairobi',country:'Kenya',remote:true},department:{label:'IT'},releasedDate:'2026-07-20',ref:'https://example.com/s1',typeOfEmployment:{label:'Full-time'},experienceLevel:{label:'Director'}}]}]
];
for(const [provider,payload] of providerCases){globalThis.fetch=async()=>({ok:true,json:async()=>payload,headers:new Headers()});const res=response();await atsHandler({method:'POST',body:{provider,identifier:'test-company'}},res);if(res.code!==200||res.body.count!==1||!res.body.jobs[0].atsJobId)throw new Error(`${provider} connector mapping failed`);console.log(`✓ ${provider} connector mapping`)}
const detections={greenhouse:'https://boards.greenhouse.io/example/jobs/123',lever:'https://jobs.lever.co/example/abc',smartrecruiters:'https://careers.smartrecruiters.com/Example',workday:'https://example.wd3.myworkdayjobs.com/en-US/Careers',successfactors:'https://example.successfactors.com/career',oracle:'https://example.fa.eu2.oraclecloud.com/hcmUI/CandidateExperience'};
for(const [expected,url] of Object.entries(detections)){const got=detectATSFromUrl(url);if(got.provider!==expected)throw new Error(`${expected} detection failed: ${got.provider}`);console.log(`✓ ${expected} URL detection`)}
const eligible=assessEligibility({title:'Technology Manager',location:'Cairo, Egypt'}),restricted=assessEligibility({title:'IT Director',notes:'US only. Work authorization required'});if(eligible.key!=='eligible'||restricted.key!=='restricted'||eligibilityAdjustedMatch(90,restricted)>35)throw new Error('Eligibility gate failed');console.log('✓ Egypt eligibility gate');
if(!matchesSearch({title:'Head of IT',notes:'Enterprise applications'},'IT Director'))throw new Error('Search synonym failed');console.log('✓ synonym-aware search');
const priority=organizationPriority({profileMatch:90,trustScore:5,checked:'2026-07-20'},{history:[{status:'Interview',action:'Interview'}],interviewDate:'2026-07-20'},null);if(priority.score<70||priority.reviewDays>7)throw new Error('Organization priority failed');console.log('✓ organization priority');
const matrix=generateSearchMatrix();if(matrix.length!==25380)throw new Error(`Matrix count ${matrix.length}`);console.log('✓ 25,380 search matrix');
const sources=parseCSV(await readFile(new URL('../job-search-platforms.csv',import.meta.url),'utf8'));if(sources.length!==95)throw new Error(`Named sources ${sources.length}`);console.log('✓ 95 named sources');


const consulting={title:'Digital Transformation Individual Consultant',notes:'Submit CV, technical proposal and financial proposal. Worldwide remote.',profileMatch:88,trustScore:5,sourceRank:6,eligibility:{key:'eligible'}};
if(detectOpportunityTrack(consulting).id!=='consulting')throw new Error('Consulting track detection failed');
const decision=decisionScore(consulting,{applicationEffort:'High'});if(decision.total<55||decision.total>100)throw new Error(`Decision score failed ${decision.total}`);console.log('✓ consulting track and decision score');
const req=inferRequirements(consulting,{});if(!req.cv||!req.technicalProposal||!req.financialProposal)throw new Error('Requirements inference failed');console.log('✓ application requirements inference');
const zip=await buildZip([{name:'test/readme.txt',content:'hello'}]);if(zip.size<50||zip.type!=='application/zip')throw new Error('ZIP archive failed');console.log('✓ opportunity ZIP builder');
const encrypted=await encryptPortableBackup({tracker:{x:1}},'test-password-123');const decrypted=await decryptPortableBackup(encrypted,'test-password-123');if(decrypted.tracker.x!==1)throw new Error('Encrypted backup failed');console.log('✓ encrypted portable backup');

class LocalStorageMock{constructor(){this.map=new Map()}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
globalThis.localStorage=new LocalStorageMock();
const tracker=await import(`../assets/tracker.js?test=${Date.now()}`);const record={dataset:'organizations',id:'test',title:'Test Organization',recordType:'directory',url:'https://example.com'};
let item=tracker.saveTracking(record,{status:'Not Available'},{action:'No suitable job'});if(item.reviewCadenceDays!==30)throw new Error('First adaptive recheck failed');item=tracker.saveTracking(record,{status:'Saved'},{action:'Reset'});item=tracker.saveTracking(record,{status:'Not Available'},{action:'No suitable job'});if(item.reviewCadenceDays!==60)throw new Error('Second adaptive recheck failed');item=tracker.saveTracking(record,{status:'Saved'},{action:'Reset'});item=tracker.saveTracking(record,{status:'Not Available'},{action:'No suitable job'});if(item.reviewCadenceDays!==90)throw new Error('Third adaptive recheck failed');item=tracker.saveTracking(record,{status:'Job Found'},{action:'Job found'});if(item.reviewAgain||!item.lastJobFoundAt)throw new Error('Job Found transition failed');console.log('✓ adaptive 30/60/90 recheck and Job Found');
console.log('Feature tests complete.');
