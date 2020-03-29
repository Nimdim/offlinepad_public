let server = location.protocol + "//" + location.host;
let dev = new URL(location).searchParams.get('dev');

console.log("server", server);
console.log("dev", dev);

let downloads = {};
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
        console.log("download port data", data);
        if (data === 'end') {
          console.log("download end");
          return controller.close()
        }

        if (data === 'abort') {
            console.log("download abort");
            controller.error('Aborted the download')
          return
        }

        console.log("download write");
        controller.enqueue(data)
      }
    //   console.log("inside stream", controller.enqueue("123 123 123"));
    //   controller.close();
    },
    cancel () {
      console.log('user aborted')
    }
  })
}

self.addEventListener('message', (event) => {
  console.log("message", event.data);
  // event.ports[0].postMessage(event.data);
  let data = event.data;
  switch(data.command) {
    case "ping":
      event.ports[0].postMessage({"pong": "ok"});
      console.log("pong posted");
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
  }
});

// self.addEventListener('install', e => {
//   e.waitUntil(initial_promise);
// //     new Promise((resolve, reject) => {
// //       self.addEventListener('message', (data) => {
// //         console.log("message", data);
// //         resolve();
// //       });
// //     })
// //   );
// });

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
  console.log("fetch /download", id);
  
  const responseHeaders = new Headers({
    'Content-Type': 'application/octet-stream; charset=utf-8',

    // To be on the safe side, The link can be opened in a iframe.
    // but octet-stream should stop it.
    'Content-Security-Policy': "default-src 'none'",
    'X-Content-Security-Policy': "default-src 'none'",
    'X-WebKit-CSP': "default-src 'none'",
    'X-XSS-Protection': '1; mode=block'
  });

//   let headers = new Headers(data.headers || {})

//   if (headers.has('Content-Length')) {
//     responseHeaders.set('Content-Length', headers.get('Content-Length'))
//   }

//   if (headers.has('Content-Disposition')) {
//     responseHeaders.set('Content-Disposition', headers.get('Content-Disposition'))
//   }

//   // data, data.filename and size should not be used anymore
//   if (data.size) {
//     console.warn('Depricated')
//     responseHeaders.set('Content-Length', data.size)
//   }

  let fileName = "download.txt";
  if (fileName) {
    // console.warn('Depricated')
    // Make filename RFC5987 compatible
    fileName = encodeURIComponent(downloads[id].filename).replace(/['()]/g, escape).replace(/\*/g, '%2A')
    responseHeaders.set('Content-Disposition', "attachment; filename*=UTF-8''" + fileName)
    // responseHeaders.set('Content-Disposition', "attachment; filename='" + fileName + "'");
  }

  return new Response(downloads[id].data, { headers: responseHeaders });
//   console.log(downloads[id].stream);
  return new Response(downloads[id].stream, { headers: responseHeaders });

  //   return new Response("ok");
}

self.addEventListener('fetch', (event) => {
  console.log("fetch", event.request.url);
  let resource = null;
  if(event.request.url.indexOf(server) == 0) {
    resource = event.request.url.replace(server, "");  
  }

  if(is_download(resource)) {
    event.respondWith(process_download(event.request.url));
    return;
  }

  let promise = null;
  if(if_cacheable_resource(resource)) {
    promise = caches.match(event.request).then((resp) => {
      return resp || fetch(event.request).then((response) => {
        return caches.open('v1').then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    });  
  } else {
    promise = fetch(event.request);
  }

  event.respondWith(promise);
});
