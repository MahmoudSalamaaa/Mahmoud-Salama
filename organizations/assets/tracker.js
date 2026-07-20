import {JOB_STATUSES,DIRECTORY_STATUSES} from './config.js';

const KEYS={tracker:'careerTrackerV3',favorites:'careerFavoritesV3',savedSearches:'careerSavedSearchesV3',recent:'careerRecentlyViewedV3',linkChecks:'careerLinkChecksV3'};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
function recordKey(record){return `${record.dataset || 'global'}:${record.id || record.url || record.title}`}

export function getTracker(){return read(KEYS.tracker,{})}
export function getTracking(record){return getTracker()[recordKey(record)] || {status:'Not started',notes:'',applicationDate:'',deadline:'',followUp:'',contact:'',cvVersion:'',coverLetter:''}}
export function saveTracking(record,values){const all=getTracker(),now=new Date().toISOString(),previous=getTracking(record);const statusChanged=values.status&&values.status!==previous.status;all[recordKey(record)]={...previous,...values,updatedAt:now,lastStatusAt:statusChanged?now:(previous.lastStatusAt||''),notAvailableCheckedAt:values.status==='Not Available'?now:(values.status&&values.status!=='Not Available'?'':previous.notAvailableCheckedAt||''),recordSnapshot:{id:record.id,dataset:record.dataset,title:record.title,subtitle:record.subtitle,country:record.country,url:record.url,recordType:record.recordType}};write(KEYS.tracker,all);return all[recordKey(record)]}
export function removeTracking(record){const all=getTracker();delete all[recordKey(record)];write(KEYS.tracker,all)}
export function statusesFor(record){return ['job','search','project'].includes(record.recordType) ? JOB_STATUSES : DIRECTORY_STATUSES}

export function getFavorites(){return new Set(read(KEYS.favorites,[]))}
export function isFavorite(record){return getFavorites().has(recordKey(record))}
export function toggleFavorite(record){const set=getFavorites(),key=recordKey(record);set.has(key)?set.delete(key):set.add(key);write(KEYS.favorites,[...set]);return set.has(key)}

export function getSavedSearches(){return read(KEYS.savedSearches,[])}
export function saveSearch(search){const list=getSavedSearches();const normalized={id:crypto.randomUUID?.()||String(Date.now()),name:search.name||search.query,query:search.query||'',filters:search.filters||{},createdAt:new Date().toISOString()};list.unshift(normalized);write(KEYS.savedSearches,list.slice(0,30));return normalized}
export function deleteSavedSearch(id){write(KEYS.savedSearches,getSavedSearches().filter(x=>x.id!==id))}

export function addRecentlyViewed(record){const list=read(KEYS.recent,[]).filter(x=>x.key!==recordKey(record));list.unshift({key:recordKey(record),record:{...record},viewedAt:new Date().toISOString()});write(KEYS.recent,list.slice(0,20))}
export function getRecentlyViewed(){return read(KEYS.recent,[])}

export function saveLinkCheck(record,result){const checks=read(KEYS.linkChecks,{});checks[recordKey(record)]={...result,checkedAt:result.checkedAt||new Date().toISOString()};write(KEYS.linkChecks,checks)}
export function getLinkCheck(record){return read(KEYS.linkChecks,{})[recordKey(record)] || null}

export function exportUserData(){return JSON.stringify({version:3,exportedAt:new Date().toISOString(),tracker:getTracker(),favorites:[...getFavorites()],savedSearches:getSavedSearches(),recent:getRecentlyViewed(),linkChecks:read(KEYS.linkChecks,{})},null,2)}
export function importUserData(data){
  const parsed=typeof data==='string'?JSON.parse(data):data;
  if(!parsed || typeof parsed!=='object') throw new Error('Invalid backup');
  if(parsed.tracker) write(KEYS.tracker,parsed.tracker);
  if(parsed.favorites) write(KEYS.favorites,parsed.favorites);
  if(parsed.savedSearches) write(KEYS.savedSearches,parsed.savedSearches);
  if(parsed.recent) write(KEYS.recent,parsed.recent);
  if(parsed.linkChecks) write(KEYS.linkChecks,parsed.linkChecks);
  return true;
}
export function trackedItems(){return Object.values(getTracker()).filter(x=>x.recordSnapshot)}
