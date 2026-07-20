const CACHE='mahmoud-career-hub-v4-uiux';
const SHELL=['./','./index.html','./explore.html','./africa-ngos.html','./regional-private-companies.html','./organizations.html','./dashboard.html','./tracker.html','./admin.html','./sources.html','./assets/app.css','./assets/config.js','./assets/i18n.js','./assets/data.js','./assets/tracker.js','./assets/shell.js','./assets/renderer.js','./assets/pages.js','./data/seed.json','./data/offline/africa-ngos.csv','./icons/logo.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.pathname.startsWith('/api/'))return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok&&url.origin===location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match('./index.html'))));
});
