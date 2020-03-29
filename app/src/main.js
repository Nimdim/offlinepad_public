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
  navigator.serviceWorker.register('sw.js?dev=' + dev, {scope: '/'})
  // .then((reg) => {
  //   // регистрация сработала
  //   console.log('Registration succeeded. Scope is ' + reg.scope);
  //   // reg.installing.postMessage({dev: window.webpackHotUpdate != null});
  //   // console.log("Done");
  // }).catch((error) => {
  //   // регистрация прошла неудачно
  //   console.log('Registration failed with ' + error);
  // });
}

let sw_communicate = function(data) {
  let promise = new Promise(function(resolve) {
    let messageChannel = new MessageChannel();
    let replyHandler = function(event) {
      resolve(event.data);
    };
    // messageChannel.port1.addEventListener('message', replyHandler);
    messageChannel.port1.onmessage = replyHandler;
    navigator.serviceWorker.controller.postMessage(data, [messageChannel.port2]);
  });
  return promise;
};

window.func = function() {
  debugger
  sw_communicate({command: "ping"}).then(function(reply) {
    debugger
    console.log(reply.pong);
  });
}

window.nd = function() {
  debugger
  sw_communicate({command: "new_download"}).then(function(reply) {
    debugger
    console.log(reply);
  });
}

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
