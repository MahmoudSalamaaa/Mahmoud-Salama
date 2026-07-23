const C='ms-communications-v3';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./assets/styles.css','./assets/styles-pro.css','./assets/app.js','./assets/app-pro.js','./assets/search-data.js']))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const y=x.clone();caches.open(C).then(c=>c.put(e.request,y));return x}).catch(()=>caches.match('./index.html')))));
