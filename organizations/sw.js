const CACHE='mahmoud-career-hub-v9-opportunity-intelligence';
const SHELL=[
  './','./index.html','./today.html','./weekly-review.html','./explore.html','./africa-ngos.html','./africa-map.html',
  './regional-private-companies.html','./organizations.html','./dashboard.html','./tracker.html','./review-queue.html',
  './contacts.html','./documents.html','./version-history.html','./calendar.html','./analytics.html','./quality.html',
  './settings.html','./admin.html','./sources.html','./methodology.html','./job-search-platforms.html',
  './ats-connectors.html','./save-from-web.html','./opportunities.html','./consulting.html','./rosters.html','./volunteer-secondments.html','./requirements.html','./templates.html','./email-importer.html','./profile-coverage.html','./rules.html','./archive.html','./vault.html',
  './assets/app.css','./assets/config.js','./assets/i18n.js','./assets/data.js','./assets/tracker.js',
  './assets/productivity.js','./assets/eligibility.js','./assets/security.js','./assets/localdb.js','./assets/shell.js',
  './assets/renderer.js','./assets/pages.js','./assets/source-intelligence.js','./assets/ats.js','./assets/capture.js',
  './assets/calendar.js','./assets/version-history.js','./assets/weekly.js','./assets/opportunity-core.js','./assets/opportunity-pages.js','./assets/vault.js','./assets/archive.js','./assets/filter-client.js','./assets/filter-worker.js',
  './data/seed.json','./data/source-packs.json','./data/application-templates.json','./data/profile-coverage.json','./data/source-directory.csv','./job-search-platforms.csv',
  './data/offline/job-search-platforms.csv','./data/offline/africa-ngos.csv','./icons/logo.svg'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.pathname.startsWith('/api/'))return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok&&url.origin===location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}
    return response;
  }).catch(()=>event.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
