import StorageInterface from "./storage_interface.js";
let PREFIX = "z_";
let PREFIX2 = "x_";

import _ from 'lodash'
import aesjs from 'aes-js'
let encrypt = function(s) {
  // An example 128-bit key (16 bytes * 8 bits/byte = 128 bits)
  var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
  
  // Convert text to bytes
  var text = s;
  var textBytes = aesjs.utils.utf8.toBytes(text);
  
  // The counter is optional, and if omitted will begin at 1
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  var encryptedBytes = aesCtr.encrypt(textBytes);
  
  // To print or store the binary data, you may convert it to hex
  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  return encryptedHex;
};

let decrypt = function(s) {
  var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
  // When ready to decrypt the hex string, convert it back to bytes
  var encryptedBytes = aesjs.utils.hex.toBytes(s);
  
  // The counter mode of operation maintains internal state, so to
  // decrypt a new instance must be instantiated.
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  var decryptedBytes = aesCtr.decrypt(encryptedBytes);
  
  // Convert our bytes back into text
  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText;
};


class LocalStorage extends StorageInterface{
    _init_storage() {
        if(window.localStorage == null) {
            throw new Error("локальное хранилище недоступно");
        }
    }

    _reset_internal_state() {
        this._autoincrement_id = window.localStorage[PREFIX2 + "ai"];
        if(this._autoincrement_id == null) {
            this._autoincrement_id = 0;
        } else {
            this._autoincrement_id = parseInt(this._autoincrement_id);
        }
        super._reset_internal_state();
    }

    _get_item_copy(id) {
        let copy = JSON.parse(window.localStorage[PREFIX + id]);
        if(copy.type == "tag") {
            copy.name = decrypt(copy.name);
        }
        if(copy.type == "note") {
            copy.text = decrypt(copy.text);
        }
        return copy;
    }

    _create_item(object) {
        let id = this._get_next_id();
        if(window.localStorage[PREFIX + id] != null) {
            throw new Error("Элемент с id=" + id + " уже сущестует в хранилище");
        }
        let copy = _.cloneDeep(object);
        if(copy.type == "tag") {
            copy.name = encrypt(copy.name);
        }
        if(copy.type == "note") {
            copy.text = encrypt(copy.text);
        }
        window.localStorage[PREFIX + id] = JSON.stringify(copy);
        return id;
    }

    _import_item(id, object) {
        let id_int = parseInt(id);
        this._autoincrement_id = Math.max(this._autoincrement_id, id_int);
        if(window.localStorage[PREFIX + id] != null) {
            throw new Error("Элемент с id=" + id + " уже сущестует в хранилище");
        }
        window.localStorage[PREFIX + id] = JSON.stringify(object);
    }

    _get_next_id() {
        this._autoincrement_id += 1;
        window.localStorage[PREFIX2 + "ai"] = this._autoincrement_id;
        return this._autoincrement_id.toString();
    }

    _has_item(id) {
        return window.localStorage.hasOwnProperty(PREFIX + id);
    }

    _set_item(id, object) {
        window.localStorage[PREFIX + id] = JSON.stringify(object);
    }

    _delete_item(id) {
        window.localStorage.removeItem(PREFIX + id);
    }

    _iterate_keys(callback) {
        for(let key in window.localStorage) {
            if(window.localStorage.hasOwnProperty(key) && key.indexOf(PREFIX) == 0) {
                callback(key.replace(PREFIX, ""));
            }
        }
    }
}

export default LocalStorage;
