import Backbone from "backbone";
import _ from "lodash";

class ServiceWorkerAPI {

  constructor() {
    _.extend(this, Backbone.Events);    
  }

  is_available() {
    if (('serviceWorker' in navigator) &&
        ('ReadableStream' in window)) {
      return true;
    } else {
      return false;
    }
  }

  activate_new_worker() {
    this.communicate(
      {"command": "skip_waiting"},
      this._new_worker
    );
  }

  new_download(filename, data) {
    let args = {
      command: "new_download",
      data: data,
      filename: filename
    };
    return this.communicate(args);
  }

  communicate(data, worker) {
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
  }

  check_updates() {
    if(this._registration.waiting != null) {
      this._new_worker = this._registration.waiting;
      this.communicate(
        {"command": "get_version"},
        this._registration.waiting
      ).then((info) => {
          let id = info[0];
          this.trigger("update_available", id)
        }
      );
    } else {
        this._registration.update();
    }
  }

  start_updates_checking() {
    this.check_updates();
    setInterval(() => this.check_updates, 5 * 1000);
  }

  init() {
    let dev = "0";
    if(window.webpackHotUpdate != null) {
      dev = "1";
    }

    let promise = new Promise((resolve) => {
      navigator.serviceWorker.register('sw.js?dev=' + dev, {scope: '/'})
      .then((registration) => {
        this._registration = registration;
        this.start_updates_checking();
        this.communicate({"command": "init"}).then(function(info) {
          let data = info[0];
          resolve(data);
        })
      });
  
      let refreshing;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    });

    return promise;
  }
}

export default new ServiceWorkerAPI();
