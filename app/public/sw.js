const APP_VERSION = "1.37";

const RESOURCES = [
  '/',
  '/css/app.css',
  '/css/dark-theme.css',
  '/css/light-theme.css',
  '/css/materialize.css',
  '/css/style.css',
  '/js/app.js',
  '/js/chunk-vendors.js',
  '/js/jquery-2.1.1.min.js',
  '/js/Blob.js',
  '/js/materialize.js',
  '/js/materialize.min.js',
  '/favicon.ico',
  '/index.html',
  '/style.css',
  '/offlinepad.webmanifest',
  '/icon.png',
];

let server = location.protocol + "//" + location.host;
let dev = new URL(location).searchParams.get('dev');

let downloads = {};
let last_client = null;
let get_next_download_id = function() {
  let id = 0;
  return function() {
    id = id + 1;
    return id.toString();
  }
}();

function createStream (port) {
  return new ReadableStream({
    start (controller) {
      port.onmessage = ({ data }) => {
        if (data === 'end') {
          return controller.close()
        }
        if (data === 'abort') {
            controller.error('Aborted the download')
          return
        }
        controller.enqueue(data)
      }
    },
    cancel () {
      console.log('user aborted')
    }
  })
}

self.addEventListener('message', (event) => {
  let data = event.data;
  switch(data.command) {
    case "ping":
      event.ports[0].postMessage("pong");
      break;
    case "new_download": {
      let id = get_next_download_id();
      downloads[id] = {
        stream: createStream(event.ports[0]),
        data: data.data,
        filename: data.filename,
      }
      event.ports[0].postMessage(id);
      break;          
    }
    case 'skip_waiting':
      last_client = event.source.id
      self.skipWaiting();
      break;
    case 'get_version':
      event.ports[0].postMessage(APP_VERSION);
      break;
    case 'init': {
      let data = {
        "version": APP_VERSION,
      };
      if(last_client != null) {
        last_client = null;
        data.updated = true;
      }
      event.ports[0].postMessage(data);
      break;
    }
  }
});

addEventListener('install', installEvent => {
  if(dev == "0") {
    installEvent.waitUntil(
      caches.open(APP_VERSION).then(cache => cache.addAll(RESOURCES))
    )    
  }
});

addEventListener('activate', activateEvent => {
  if(dev == "0") {
    activateEvent.waitUntil(
      caches.keys().then(keyList => Promise.all(keyList.map(key => {
        if (key !== APP_VERSION) {
          return caches.delete(key);
        }
      }))).then(() => {
        clients.claim();
      })
    );    
  }
});

let if_cacheable_resource = function(resource) {
  if(dev == "1") {
    return false;
  }
  if(resource == null) {
    return false;
  }
  if(resource == "/") {
    return true;
  }
  if(resource.indexOf("/js/") == 0) {
    return true;
  }
  if(resource.indexOf("/css/") == 0) {
    return true;
  }
  if(resource.indexOf("/style.css") == 0) {
    return true;
  }
  return false;
}

let is_download = function(uri) {
  if(uri == null) {
    return false;
  }
  return uri.indexOf("/download") == 0;
}

let process_download = function(url) {
  let id = new URL(url).searchParams.get('id');
  if(id == null) {
    return new Response("ok");
  }
  if(downloads[id] == null) {
    let redirect_html = '<html><head><meta http-equiv="refresh" content="0;URL=/" /></head></html>';
    let headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
  
      // To be on the safe side, The link can be opened in a iframe.
      // but octet-stream should stop it.
      // 'Content-Security-Policy': "default-src 'none'",
      // 'X-Content-Security-Policy': "default-src 'none'",
      // 'X-WebKit-CSP': "default-src 'none'",
      // 'X-XSS-Protection': '1; mode=block'
    });
    return new Response(redirect_html, { headers: headers });
  }

  const responseHeaders = new Headers({
    'Content-Type': 'application/octet-stream',
    'Content-Length': downloads[id].data.length,

    // To be on the safe side, The link can be opened in a iframe.
    // but octet-stream should stop it.
    // 'Content-Security-Policy': "default-src 'none'",
    // 'X-Content-Security-Policy': "default-src 'none'",
    // 'X-WebKit-CSP': "default-src 'none'",
    // 'X-XSS-Protection': '1; mode=block'
  });

  let fileName = encodeURIComponent(downloads[id].filename).replace(/['()]/g, escape).replace(/\*/g, '%2A')
  // responseHeaders.set('Content-Disposition', "attachment; filename*=UTF-8''" + fileName)
  responseHeaders.set('Content-Disposition', 'attachment; filename="' + fileName + '"');
  // responseHeaders.set('Content-Disposition', 'attachment; filename="backup.data"');
  return new Response(downloads[id].data, { headers: responseHeaders });
  // return new Response(downloads[id].stream, { headers: responseHeaders });
}

self.addEventListener('fetch', (event) => {
  let resource = null;
  if(event.request.url.indexOf(server) == 0) {
    resource = event.request.url.replace(server, "");  
  }

  if(is_download(resource)) {
    event.respondWith(process_download(event.request.url));
    return;
  }

  if(resource != null) {
    if(resource.indexOf("/api") == 0) {
      event.respondWith(fetch(event.request));
      return;
    }  
  }

  if(event.request.url.indexOf("https://i3.ytimg.com/vi/") == 0) {
    event.respondWith(fetch(event.request));
    return;
  }

  if(dev == "0") {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(fetch(event.request));
  }
});
