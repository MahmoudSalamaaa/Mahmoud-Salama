const DB_NAME='MahmoudCareerLocalDB';const DB_VERSION=2;
let dbPromise;
function openDB(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('attachments')){const s=db.createObjectStore('attachments',{keyPath:'id'});s.createIndex('recordKey','recordKey')}if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'recordKey'});if(!db.objectStoreNames.contains('snapshotVersions')){const s=db.createObjectStore('snapshotVersions',{keyPath:'id'});s.createIndex('recordKey','recordKey');s.createIndex('capturedAt','capturedAt')}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise;
}
function request(store,mode,fn){return openDB().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(store,mode),os=tx.objectStore(store),req=fn(os);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)}))}
export function addAttachment(recordKey,file){const item={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,recordKey,name:file.name,type:file.type||'application/octet-stream',size:file.size,createdAt:new Date().toISOString(),blob:file};return request('attachments','readwrite',s=>s.put(item)).then(()=>item)}
export function listAttachments(recordKey=null){return openDB().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction('attachments','readonly'),s=tx.objectStore('attachments'),req=recordKey?s.index('recordKey').getAll(recordKey):s.getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)}))}
export function getAttachment(id){return request('attachments','readonly',s=>s.get(id))}
export function deleteAttachment(id){return request('attachments','readwrite',s=>s.delete(id))}
export async function saveSnapshot(recordKey,snapshot){const capturedAt=snapshot.capturedAt||new Date().toISOString(),id=crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,item={recordKey,...snapshot,capturedAt},version={id,recordKey,...snapshot,capturedAt};await request('snapshots','readwrite',s=>s.put(item));await request('snapshotVersions','readwrite',s=>s.put(version));return item}
export function getSnapshot(recordKey){return request('snapshots','readonly',s=>s.get(recordKey))}
export function listSnapshots(){return request('snapshots','readonly',s=>s.getAll())}
export function listSnapshotVersions(recordKey=null){return openDB().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction('snapshotVersions','readonly'),s=tx.objectStore('snapshotVersions'),req=recordKey?s.index('recordKey').getAll(recordKey):s.getAll();req.onsuccess=()=>resolve((req.result||[]).sort((a,b)=>new Date(b.capturedAt)-new Date(a.capturedAt)));req.onerror=()=>reject(req.error)}))}
export function getSnapshotVersion(id){return request('snapshotVersions','readonly',s=>s.get(id))}
export function deleteSnapshotVersion(id){return request('snapshotVersions','readwrite',s=>s.delete(id))}
export function deleteSnapshot(recordKey){return request('snapshots','readwrite',s=>s.delete(recordKey))}
export function downloadBlob(item){const url=URL.createObjectURL(item.blob),a=document.createElement('a');a.href=url;a.download=item.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
