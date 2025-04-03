// 缓存名称及缓存文件列表
const CACHE_NAME = 'fundgene-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './favicon.svg',
  './logo192.png',
  './logo512.png',
  './assets/index.css',
  './assets/index.js'
];

// 安装Service Worker并缓存初始资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('已打开缓存');
        return cache.addAll(urlsToCache);
      })
  );
});

// 网络请求拦截，优先使用缓存，网络请求失败时回退到缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 仅缓存成功的请求
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // 克隆响应，因为响应是流，只能使用一次
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            // 不缓存API请求
            if (!event.request.url.includes('/api/')) {
              cache.put(event.request, responseToCache);
            }
          });
          
        return response;
      })
      .catch(() => {
        // 网络请求失败时，尝试从缓存获取
        return caches.match(event.request);
      })
  );
});

// 清理旧版本缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
