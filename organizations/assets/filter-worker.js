import {matchesSearch} from './productivity.js';
let records=[];
self.onmessage=e=>{
  const {type,id,payload}=e.data||{};
  if(type==='init'){records=payload||[];self.postMessage({type:'ready',id});return}
  if(type==='filter'){
    const c=payload||{};
    let rows=records.filter(r=>matchesSearch({notes:r.text},c.query||'')&&(!c.dataset||r.dataset===c.dataset)&&(!c.country||r.country===c.country)&&(!c.region||r.region===c.region)&&(!c.typeValue||r.type===c.typeValue)&&(!c.fit||r.profileMatch>=c.fit)&&(!c.availability||r.availability===c.availability)&&(!c.africaCategory||r.africaCategory===c.africaCategory)&&(!c.africaRegion||r.africaRegion===c.africaRegion)&&(!c.hideClosed||r.availability!=='Deadline Passed'));
    rows.sort((a,b)=>c.sort==='name'?a.title.localeCompare(b.title):c.sort==='newest'?(b.date-a.date):c.sort==='official'?(b.authority-a.authority||b.profileMatch-a.profileMatch):(b.profileMatch-a.profileMatch||b.trustScore-a.trustScore));
    self.postMessage({type:'result',id,indices:rows.map(x=>x.i)});
  }
};
