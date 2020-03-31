import Vue from 'vue'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSave, faBoxOpen, faAngleDown, faAngleUp, faCaretDown, faSortAmountUp, faTh, faSortAmountDownAlt, faPlus, faTrash, faBars, faSearch, faTimes, faTimesCircle, faPen, faClock, faCheck, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faAngleDown)
library.add(faAngleUp)
library.add(faBars)
library.add(faBoxOpen)
library.add(faCalendarAlt)
library.add(faCaretDown)
library.add(faClock)
library.add(faCheck)
library.add(faPen)
library.add(faPlus)
library.add(faSave)
library.add(faSearch)
library.add(faSortAmountUp)
library.add(faSortAmountDownAlt)
library.add(faTh)
library.add(faTimes)
library.add(faTimesCircle)
library.add(faTrash)

if ('serviceWorker' in navigator) {
  let dev = "0";
  if(window.webpackHotUpdate != null) {
    dev = "1";
  }
  // navigator.serviceWorker.addEventListener('message', event => {
  //   debugger
  //   if(event.data.command == "updated") {
  //     app.$children[0].update_done = event.data.version;
  //   }
  // });
  navigator.serviceWorker.register('sw.js?dev=' + dev, {scope: '/'})
  .then(reg => {
    let check_updates = function() {
      if(reg.waiting != null) {
        window.newWorker = reg.waiting;
        sw_communicate({"command": "get_version"}, reg.waiting).then(
          function(info) {
            let id = info[0];
            app.$children[0].update_available = id;
          }
        )
      } else {
        reg.update();
      }
    };
    check_updates();
    setInterval(check_updates, 5 * 1000);
    sw_communicate({"command": "init"}).then(function(info) {
      let data = info[0];
      if(data.updated != null) {
        app.$children[0].update_done = data.updated;
      }
    })
  });

  let refreshing;
  // The event listener that is fired when the service worker updates
  // Here we reload the page
  navigator.serviceWorker.addEventListener('controllerchange', function () {
     if (refreshing) return;
     window.location.reload();
     refreshing = true;
  });
}

let sw_communicate = function(data, worker) {
  let promise = new Promise(function(resolve) {
    let messageChannel = new MessageChannel();
    let replyHandler = function(event) {
      resolve([event.data, messageChannel.port1]);
    };
    // messageChannel.port1.addEventListener('message', replyHandler);
    messageChannel.port1.onmessage = replyHandler;
    if(worker == null) {
      worker = navigator.serviceWorker.controller;
    }
    worker.postMessage(data, [messageChannel.port2]);
  });
  return promise;
};

// window.fn = function() {
//   sw_communicate({"command": "ping"}).then(function(info) {
//     debugger
//     console.log(info);
//   })
// };

// window.fw = function() {
//   sw_communicate({"command": "skip_waiting"}).then(function(info) {
//     console.log(info);
//   })
// };

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

let app = new Vue({
  render: h => h(App),
});
app.$mount('#app');
