import {JOB_STATUSES,DIRECTORY_STATUSES} from './config.js';

const KEYS={
  tracker:'careerTrackerV4',legacyTracker:'careerTrackerV3',favorites:'careerFavoritesV4',legacyFavorites:'careerFavoritesV3',savedSearches:'careerSavedSearchesV4',legacySavedSearches:'careerSavedSearchesV3',
  recent:'careerRecentlyViewedV4',legacyRecent:'careerRecentlyViewedV3',linkChecks:'careerLinkChecksV4',legacyLinkChecks:'careerLinkChecksV3',backupMeta:'careerBackupMetaV2',autoBackups:'careerAutoBackupsV1'
};
const DAY=86400000;
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
function migrate(primary,legacy,fallback){const current=read(primary,null);if(current!==null)return current;const old=read(legacy,null);if(old!==null){write(primary,old);return old}return fallback}
export function recordKey(record){return `${record.dataset || 'global'}:${record.id || record.url || record.title}`}
function isoDate(date){return date.toISOString().slice(0,10)}
export function dateAfterDays(days,from=new Date()){const d=new Date(from);d.setHours(12,0,0,0);d.setDate(d.getDate()+Number(days||0));return isoDate(d)}

const TRACKING_DEFAULTS={
  status:'Not started',notes:'',applicationDate:'',deadline:'',followUp:'',cvVersion:'',coverLetter:'',
  reviewAgain:'',reviewReason:'',reviewReasonOther:'',lastReviewedAt:'',notAvailableCheckedAt:'',history:[],monitorVacancy:false,
  contactName:'',contactRole:'',contactEmail:'',contactPhone:'',contactLinkedIn:'',lastContactDate:'',nextContactDate:'',relationshipNotes:'',
  jobDescription:'',snapshotDate:'',snapshotSource:'',interviewDate:'',interviewNotes:'',interviewQuestions:'',interviewOutcome:'',
  sourceChannel:'',salaryNotes:'',workMode:'',exclusionReason:'',contractType:'',gradeLevel:'',positionScope:'',remoteEligibility:'',nationalityRestrictions:'',languageRequirements:'',rosterOpportunity:'',deadlineTimezone:'',notAvailableCount:0,lastJobFoundAt:'',atsProvider:'',atsJobId:'',atsConnectorId:'',calendarNotes:'',opportunityTrack:'',applicationRequirements:{},applicationEffort:'',expectedCompetition:'',consultantType:'',assignmentDuration:'',volunteerCategory:'',allowanceStatus:'',secondmentType:'',sourceLifecycle:'Active',templatePackage:[]
};
export function getTracker(){return migrate(KEYS.tracker,KEYS.legacyTracker,{})}
export function getTracking(record){const raw=getTracker()[recordKey(record)]||{};const next={...TRACKING_DEFAULTS,...raw};if(raw.contact&&!next.contactName)next.contactName=raw.contact;return next}
function snapshotRecord(record){return {id:record.id,dataset:record.dataset,title:record.title,subtitle:record.subtitle,country:record.country,region:record.region,type:record.type,url:record.url,recordType:record.recordType,availability:record.availability,trust:record.trust,source:record.source,checked:record.checked,posted:record.posted,africaRegion:record.africaRegion,africaCategory:record.africaCategory,sourceClass:record.sourceClass,sourceRank:record.sourceRank,sourceGroup:record.sourceGroup,egyptEligibility:record.egyptEligibility,remoteScope:record.remoteScope,coverage:record.coverage,specialism:record.specialism,profileMatch:record.profileMatch,skillMatch:record.skillMatch,eligibility:record.eligibility,atsProvider:record.atsProvider,atsJobId:record.atsJobId,atsIdentifier:record.atsIdentifier,contractType:record.contractType,gradeLevel:record.gradeLevel,positionScope:record.positionScope,remoteEligibility:record.remoteEligibility,nationalityRestrictions:record.nationalityRestrictions,languageRequirements:record.languageRequirements,rosterOpportunity:record.rosterOpportunity,deadlineTimezone:record.deadlineTimezone,department:record.department,updatedAt:record.updatedAt,opportunityTrack:record.opportunityTrack,lifecycleStatus:record.lifecycleStatus}}
function timelineEntry(next,meta,now){return {at:now,status:next.status,reason:next.reviewReason||'',reasonOther:next.reviewReasonOther||'',reviewAgain:next.reviewAgain||'',action:meta.action||'Tracking updated',type:meta.type||'tracking',details:meta.details||''}}
export function saveTracking(record,values={},meta={}){
  const all=getTracker(),now=new Date().toISOString(),previous=getTracking(record),clean={...values};delete clean.reviewPreset;
  let next={...previous,...clean,updatedAt:now};const statusChanged=Object.prototype.hasOwnProperty.call(values,'status')&&values.status!==previous.status;
  if(statusChanged)next.lastStatusAt=now;
  if(next.status==='Not Available'){
    next.lastReviewedAt=values.lastReviewedAt||now;next.notAvailableCheckedAt=next.lastReviewedAt;
    const priorCount=Number(previous.notAvailableCount||0),newOccurrence=statusChanged||!previous.notAvailableCheckedAt;
    next.notAvailableCount=newOccurrence?priorCount+1:Math.max(1,priorCount);
    const adaptiveDays=next.notAvailableCount===1?30:next.notAvailableCount===2?60:90;
    if(!Object.prototype.hasOwnProperty.call(values,'reviewAgain')||!values.reviewAgain)next.reviewAgain=dateAfterDays(adaptiveDays);
    next.reviewCadenceDays=adaptiveDays;
  }
  if(next.status==='Job Found'){next.lastJobFoundAt=now;next.reviewAgain='';next.notAvailableCheckedAt=''}
  if(values.status&& !['Not Available','Job Found'].includes(values.status) && statusChanged){next.notAvailableCheckedAt='';if(!Object.prototype.hasOwnProperty.call(values,'reviewAgain'))next.reviewAgain=''}
  const changedFields=['reviewAgain','reviewReason','reviewReasonOther','lastReviewedAt','contactName','contactEmail','contactPhone','contactLinkedIn','lastContactDate','nextContactDate','relationshipNotes','jobDescription','snapshotDate','interviewDate','interviewOutcome','monitorVacancy'].filter(k=>Object.prototype.hasOwnProperty.call(values,k)&&values[k]!==previous[k]);
  if(statusChanged||changedFields.length||meta.action){const history=Array.isArray(previous.history)?[...previous.history]:[];history.push(timelineEntry(next,{...meta,details:meta.details||changedFields.join(', ')},now));next.history=history.slice(-250)}
  next.recordSnapshot=snapshotRecord(record);all[recordKey(record)]=next;write(KEYS.tracker,all);createAutomaticBackup();return next;
}
export function addTimelineEvent(record,{type='note',action='Activity recorded',details='',at=new Date().toISOString()}={}){const all=getTracker(),current=getTracking(record),history=[...(current.history||[]),{at,status:current.status,type,action,details,reason:'',reasonOther:'',reviewAgain:current.reviewAgain||''}].slice(-250);all[recordKey(record)]={...current,history,updatedAt:new Date().toISOString(),recordSnapshot:snapshotRecord(record)};write(KEYS.tracker,all);createAutomaticBackup();return all[recordKey(record)]}
export function restoreTracking(record,previous){const all=getTracker(),key=recordKey(record);if(!previous||previous.status==='Not started'&&!previous.updatedAt&&!previous.recordSnapshot)delete all[key];else all[key]=previous;write(KEYS.tracker,all);createAutomaticBackup(true)}
export function removeTracking(record){const all=getTracker();delete all[recordKey(record)];write(KEYS.tracker,all);createAutomaticBackup(true)}
export function statusesFor(record){return ['job','search','project'].includes(record.recordType) ? JOB_STATUSES : DIRECTORY_STATUSES}

export function reviewState(item,now=new Date()){const today=new Date(now);today.setHours(0,0,0,0);if(item.reviewAgain){const due=new Date(`${item.reviewAgain}T00:00:00`);if(!Number.isNaN(due.getTime())){const days=Math.ceil((due-today)/DAY);if(days<0)return {key:'overdue',label:'Overdue',days};if(days<=7)return {key:'due-week',label:'Due this week',days};if(days<=30)return {key:'due-month',label:'Due this month',days};return {key:'scheduled',label:'Scheduled',days}}}const reviewed=item.lastReviewedAt||item.notAvailableCheckedAt;if(reviewed){const age=Math.floor((today-new Date(reviewed))/DAY);if(age>=60)return {key:'stale',label:'Not reviewed for 60+ days',days:age};return {key:'recent',label:'Reviewed recently',days:age}}return {key:'unscheduled',label:'No review scheduled',days:null}}
export function isRecheckDue(item){return ['overdue','due-week'].includes(reviewState(item).key)}

export function getFavorites(){return new Set(migrate(KEYS.favorites,KEYS.legacyFavorites,[]))}
export function isFavorite(record){return getFavorites().has(recordKey(record))}
export function toggleFavorite(record){const set=getFavorites(),key=recordKey(record);set.has(key)?set.delete(key):set.add(key);write(KEYS.favorites,[...set]);createAutomaticBackup();return set.has(key)}
export function getSavedSearches(){return migrate(KEYS.savedSearches,KEYS.legacySavedSearches,[])}
export function saveSearch(search){const list=getSavedSearches(),normalized={id:crypto.randomUUID?.()||String(Date.now()),name:search.name||search.query,query:search.query||'',filters:search.filters||{},createdAt:new Date().toISOString()};list.unshift(normalized);write(KEYS.savedSearches,list.slice(0,50));createAutomaticBackup();return normalized}
export function deleteSavedSearch(id){write(KEYS.savedSearches,getSavedSearches().filter(x=>x.id!==id));createAutomaticBackup()}
export function addRecentlyViewed(record){const list=migrate(KEYS.recent,KEYS.legacyRecent,[]).filter(x=>x.key!==recordKey(record));list.unshift({key:recordKey(record),record:{...record},viewedAt:new Date().toISOString()});write(KEYS.recent,list.slice(0,30))}
export function getRecentlyViewed(){return migrate(KEYS.recent,KEYS.legacyRecent,[])}
export function saveLinkCheck(record,result){const checks=migrate(KEYS.linkChecks,KEYS.legacyLinkChecks,{}),key=recordKey(record),previous=checks[key];checks[key]={...result,checkedAt:result.checkedAt||new Date().toISOString()};write(KEYS.linkChecks,checks);if(result.changed&&previous?.fingerprint!==result.fingerprint){addTimelineEvent(record,{type:'monitor',action:'Careers page changed',details:`HTTP ${result.statusCode||'—'} · ${result.finalUrl||record.url}`});const tracking=getTracking(record);if(tracking.status==='Not Available')saveTracking(record,{reviewAgain:isoDate(new Date()),monitorVacancy:true},{type:'monitor',action:'Changed page returned to Review Queue',details:'The page fingerprint changed after a Not Available review.'})}createAutomaticBackup()}
export function getLinkCheck(record){return migrate(KEYS.linkChecks,KEYS.legacyLinkChecks,{})[recordKey(record)] || null}
export function getAllLinkChecks(){return migrate(KEYS.linkChecks,KEYS.legacyLinkChecks,{})}
export function getBackupMeta(){return read(KEYS.backupMeta,{lastBackupAt:'',lastImportAt:'',lastImportMode:'',lastAutoBackupAt:''})}
export function markBackupCreated(){const meta=getBackupMeta();meta.lastBackupAt=new Date().toISOString();write(KEYS.backupMeta,meta);return meta}
export function exportUserData(){return JSON.stringify({version:6,exportedAt:new Date().toISOString(),tracker:getTracker(),favorites:[...getFavorites()],savedSearches:getSavedSearches(),recent:getRecentlyViewed(),linkChecks:getAllLinkChecks()},null,2)}
export function previewImportUserData(data){const parsed=typeof data==='string'?JSON.parse(data):data;if(!parsed||typeof parsed!=='object')throw new Error('Invalid backup');return {parsed,tracker:Object.keys(parsed.tracker||{}).length,favorites:(parsed.favorites||[]).length,savedSearches:(parsed.savedSearches||[]).length,recent:(parsed.recent||[]).length,linkChecks:Object.keys(parsed.linkChecks||{}).length,exportedAt:parsed.exportedAt||''}}
function mergeLists(current,incoming,key='id'){const map=new Map();[...current,...incoming].forEach((x,i)=>map.set(x?.[key]||JSON.stringify(x)||String(i),x));return [...map.values()]}
export function importUserData(data,{mode='merge'}={}){const {parsed}=previewImportUserData(data),replace=mode==='replace';if(parsed.tracker)write(KEYS.tracker,replace?parsed.tracker:{...getTracker(),...parsed.tracker});if(parsed.favorites)write(KEYS.favorites,replace?parsed.favorites:[...new Set([...getFavorites(),...parsed.favorites])]);if(parsed.savedSearches)write(KEYS.savedSearches,replace?parsed.savedSearches:mergeLists(getSavedSearches(),parsed.savedSearches));if(parsed.recent)write(KEYS.recent,replace?parsed.recent:mergeLists(getRecentlyViewed(),parsed.recent,'key').slice(0,50));if(parsed.linkChecks)write(KEYS.linkChecks,replace?parsed.linkChecks:{...getAllLinkChecks(),...parsed.linkChecks});const meta=getBackupMeta();meta.lastImportAt=new Date().toISOString();meta.lastImportMode=mode;write(KEYS.backupMeta,meta);createAutomaticBackup(true);return true}
export function trackedItems(){return Object.values(getTracker()).filter(x=>x.recordSnapshot)}
export function contactItems(){return trackedItems().filter(x=>x.contactName||x.contactEmail||x.contactPhone||x.contactLinkedIn||x.relationshipNotes)}

export function createAutomaticBackup(force=false){const meta=getBackupMeta(),now=Date.now(),last=meta.lastAutoBackupAt?new Date(meta.lastAutoBackupAt).getTime():0;if(!force&&now-last<60*60*1000)return;const payload={id:new Date().toISOString(),createdAt:new Date().toISOString(),tracker:getTracker(),favorites:[...getFavorites()],savedSearches:getSavedSearches(),linkChecks:getAllLinkChecks()};const backups=read(KEYS.autoBackups,[]);backups.unshift(payload);write(KEYS.autoBackups,backups.slice(0,10));meta.lastAutoBackupAt=payload.createdAt;write(KEYS.backupMeta,meta)}
export function getAutomaticBackups(){return read(KEYS.autoBackups,[])}
export function restoreAutomaticBackup(id){const backup=getAutomaticBackups().find(x=>x.id===id);if(!backup)throw new Error('Backup not found');importUserData(backup,{mode:'replace'});return true}
export function deleteAutomaticBackup(id){write(KEYS.autoBackups,getAutomaticBackups().filter(x=>x.id!==id))}
