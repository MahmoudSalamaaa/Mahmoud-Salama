const CACHE='medical-recall-studio-v2-visual-refresh-20260722';
const ASSETS=[
  './','./index.html','./whats-new.html','./manifest.webmanifest',
  './styles.css','./app.js','./data/recalls-data.js',
  './assets/logo.png','./assets/icon-192.png','./assets/icon-512.png',
  './docs/readable-edition.pdf'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
