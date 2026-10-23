/* Offline-first companion with a network-fresh app entry.
   On iPhone Home Screen, Safari and standalone apps can have separate caches.
   Never erase localStorage: it contains the character sheet and turn state. */
const CACHE='alchemist-v18';
const FILES=['./','./index.html','./app.js?v=15','./rules.js','./combat.js','./icons.js','./data.js','./style.css?v=11','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('alchemist-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      // Bypass iOS HTTP cache while online; do not reuse an old index.html or JS.
      const fresh=await fetch(new Request(request,{cache:'no-store'}));
      if(!fresh.ok)throw new Error('HTTP '+fresh.status);
      const cache=await caches.open(CACHE);
      const key=request.mode==='navigate'?'./index.html':request;
      event.waitUntil(cache.put(key,fresh.clone()).catch(()=>{}));
      return fresh;
    }catch(error){
      const cached=await caches.match(request);
      if(cached)return cached;
      if(request.mode==='navigate'){
        const entry=await caches.match('./index.html');
        if(entry)return entry;
      }
      return Response.error();
    }
  })());
});
