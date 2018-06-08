workbox.setConfig({ debug: false });
// Whether or not the service worker should skip over the waiting lifecycle stage.
workbox.skipWaiting();

// Whether or not the service worker should start controlling any existing clients as soon as it activates
workbox.clientsClaim();

// change these default names by altering all or some of the values
// https://developers.google.cn/web/tools/workbox/modules/workbox-core
workbox.core.setCacheNameDetails({
  prefix: 'demo'
});


// sw-register网络请求优先
workbox.routing.registerRoute(
  /\/sw-register\.js/,
  workbox.strategies.networkFirst()
);

// 缓存cdn数据
workbox.routing.registerRoute(
  new RegExp('http(s?)://cdn.bootcss.com/*'),
  workbox.strategies.cacheFirst({
    plugins: [
      // 让匹配的请求符合开发者指定的条件的返回结果可以被缓存
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      })
    ]
  })
);

// determine when and how long a file is cached as well as serve it to the browser without going to the network
// https://developers.google.cn/web/tools/workbox/modules/workbox-precaching
workbox.precaching.precacheAndRoute(self.__precacheManifest);
