/* eslint no-fallthrough: "off" */
import Backbone from "backbone";
import _ from "lodash";
import IndexedDBStorage from "./indexeddb_storage.js";
import Notepad from './notepad.js';
import cryptobox from './cryptobox.js';
import axios from 'axios';

// if(global != null) {
//     var window = global;
// }

class NotepadsListStorage extends IndexedDBStorage {
    constructor() {
        super()
        this.DB_VERSION = 1;
    }
    
    _upgrade_needed(event) {
        let db = event.target.result;
        let store_options = { keyPath: "id", autoIncrement: true};
        switch(event.oldVersion) {
            case 0: {
                db.createObjectStore("notepads", store_options);
                db.createObjectStore("pin_codes", store_options);
                db.createObjectStore("passwords", store_options);
            }
        }
    }
}

let POST = async function(url, data) {
    let response = await axios.post(url, data);
    if(response.status == 200) {
        return response.data;
    }
    else {
        return {"error": "server error"};
    }
};

let DELETE = async function(url, data) {
    let response = await axios({
        method: 'delete',
        url: url,
        data: data
    });
    if(response.status == 200) {
        return response.data;
    }
    else {
        return {"error": "server error"};
    }
};

class NotepadReaderStorage extends IndexedDBStorage {
    constructor(version) {
        super()
        this.DB_VERSION = version;
    }
    
    _upgrade_needed() {
        throw new Error("must not be called");
    }
}

let NOTEPAD_DB_PREFIX = "a_";

class NotepadsList {
    constructor() {
        _.extend(this, Backbone.Events);
        this._storage = new NotepadsListStorage();
    }

    async init() {
        await this._storage.init("main");
        await this.reread_list();
    }

    async read_notepad_info_by_id(notepad_id) {
        let databases = await indexedDB.databases();
        let database = _.find(
            databases,
            (item) => {
                return item.name == NOTEPAD_DB_PREFIX + notepad_id
            }
        );
        return await this.read_notepad_info(database);
    }

    async read_notepad_info(database) {
        let reader = new NotepadReaderStorage(database.version);
        await reader.init(database.name)
        let info = await reader.get_item_from_store_using_index(
            "settings", "name_idx", "info"
        );
        await reader.close();
        return info;
    }

    async reread_list() {
        let databases = await indexedDB.databases();
        let promises = [];
        let notepad_db_names = [];
        this.databases = {};
        _.forEach(
            databases,
            (database) => {
                this.databases[database.name] = database.version;
                if(database.name.indexOf(NOTEPAD_DB_PREFIX) == 0) {
                    notepad_db_names.push(database.name);
                    let promise = this.read_notepad_info(database);
                    promises.push(promise);
                }
            }
        );

        let notepads = await Promise.all(promises);
        notepads = _.orderBy(notepads, "notepad_name");
        _.forEach(
            notepads,
            (item, index) => {
                let db_name = notepad_db_names[index];
                item.id = parseInt(db_name.replace(NOTEPAD_DB_PREFIX, ""));
            }
        );
        this.notepads = notepads;
    }

    // list() {
    //     let list = []
    //     _.forEach(this.databases, (version, name) => {
    //         if(name.indexOf(NOTEPAD_DB_PREFIX) == 0) {
    //             list.push(name);
    //         }
    //     });
    //     list = _.orderBy(list);
    //     return list;
    // }

    async delete(notepad_id) {
        if(this.has(notepad_id)) {
            await this._storage.delete_item_in_store("pin_codes", notepad_id);
            await this._storage.delete_item_in_store("passwords", notepad_id);
            await this._storage.delete_item_in_store("notepads", notepad_id);
            let promise = new Promise((resolve, reject) => {
                let request = indexedDB.deleteDatabase(NOTEPAD_DB_PREFIX + notepad_id);
                request.addEventListener("success", () => {
                    resolve();
                });
                request.addEventListener("error", () => {
                    reject();
                });
            });
            await promise;
            await this.reread_list();
            return true;
        } else {
            return false;
        }
    }

    has(notepad_id) {
        let list = _.filter(this.notepads, (notepad) => {
            return notepad.id == notepad_id;
        });
        return list.length > 0;
    }

    async set_pin_secret(notepad_id, pin, secret) {
        let part1 = cryptobox.random_numbers_list(secret.length);
        let part2 = [];
        for(let k = 0; k < secret.length; k++) {
            part2.push(part1[k] ^ secret[k]);
        }
        let result = await POST("/api/pin", {pin: pin, secret: part1});
        if(result.error == "ok") {
            this._set_pin_secret(notepad_id, part2, result.result);
        } else {
            return false;
        }
        return true;
    }

    async _set_pin_secret(notepad_id, secret, pin_storage) {
        if(await this._get_pin_secret(notepad_id) != null) {
            await this._delete_pin_secret(notepad_id);
        }
        let data = {
            id: notepad_id,
            secret: secret,
            pin_storage: pin_storage,
        };
        await this._storage.create_item_in_store("pin_codes", data);
    }

    async get_pin_secret(notepad_id, pin) {
        let pin_secret_info = await this._get_pin_secret(notepad_id);
        if(pin_secret_info != null) {
            let part2 = pin_secret_info.secret;
            let result = await POST("/api/pin/" + pin_secret_info.pin_storage, {pin});
            if(result.error == "ok") {
                let part1 = result.result;
                let secret = [];
                for(let k = 0; k < part1.length; k++) {
                    secret.push(part1[k] ^ part2[k]);
                }
                return secret;
            } else {
                return result.error;
            }
        } else {
            return "no pin configured";
        }
    }

    async _get_pin_secret(notepad_id) {
        return await this._storage.get_item_from_store("pin_codes", notepad_id);
    }

    async get_password_secret(notepad_id) {
        let item = await this._storage.get_item_from_store("passwords", notepad_id);
        if(item != null) {
            item = item.password_secret;
        }
        return item;
    }

    async get_current_auth_method(notepad_id) {
        let item = await this._storage.get_item_from_store("notepads", notepad_id);
        let result = item.current_auth_method;
        if(result == null) {
            result = undefined;
        }
        return result;
    }

    async set_current_auth_method(current_method, notepad_id) {
        let data = {current_auth_method: current_method};
        await this._storage.edit_item_in_store("notepads", notepad_id, data);
    }

    async delete_pin_secret(notepad_id) {
        let pin_secret_info = await this._get_pin_secret(notepad_id);
        if(pin_secret_info != null) {
            let result = await DELETE("/api/pin/" + pin_secret_info.pin_storage, {});
            if(result.error == "ok") {
                await this._delete_pin_secret(notepad_id);
            }
            return result;
        } else {
            return {"error": "pin not set up"};
        }
    }

    async _delete_pin_secret(notepad_id) {
        await this._storage.delete_item_in_store("pin_codes", notepad_id);
    }

    async process_secret(auth_info, notepad_id) {
      switch(auth_info.method) {
        case "passphrase": {
          let secret = cryptobox.hash_hex(auth_info.value);
          return secret;
        }
        case "password": {
          if(notepad_id == null) {
            throw new Error("notepad_id is null");
          }
          let secret = cryptobox.hash_hex(auth_info.value);
          let password_secret = await this.get_password_secret(notepad_id);
          for(let k = 0; k < secret.length; k++) {
            secret[k] = secret[k] ^ password_secret[k];
          }
          return secret;
        }
        case "pin": {
          if(notepad_id == null) {
            throw new Error("notepad_id is null");
          }
          let secret = await this.get_pin_secret(notepad_id, auth_info.value);
          return secret;
        }
        default:
          throw new Error("not implemented " + auth_info.method);
      }
    }
  
    async set_password_secret(notepad_id, password, secret) {
        let item = await this.get_password_secret(notepad_id);
        if(item) {
            await this.delete_password_secret(notepad_id);
        }

        let password_hash = cryptobox.hash_hex(password);
        let password_secret = [];
        for(let k = 0; k < password_hash.length; k++) {
          password_secret.push(password_hash[k] ^ secret[k]);
        }
        await this._storage.create_item_in_store("passwords", {
            id: notepad_id,
            password_secret: password_secret,
        });
        return true;
    }

    async delete_password_secret(notepad_id) {
        await this._storage.delete_item_in_store("passwords", notepad_id);
    }

    async open(notepad_id, options) {
        if(this.has(notepad_id)) {
            let notepad = new Notepad();
            let result = await notepad.sync(NOTEPAD_DB_PREFIX + notepad_id, options);
            if (result === true) {
                notepad._state.info.id = notepad_id;
                return notepad;    
            } else {
                return result;
            }
        } else {
            return "id not existing";
        }
    }

    async _new_notepad_record() {
        let notepad = {};
        let notepad_id = await this._storage.create_item_in_store(
            "notepads", notepad
        );
        return notepad_id;
    }

    async create(notepad_name, options) {
        let notepad_id = await this._new_notepad_record();
        let notepad = new Notepad();
        await notepad.create(NOTEPAD_DB_PREFIX + notepad_id, notepad_name, options);
        await this.reread_list();
        return {"id": notepad_id, "notepad": notepad};
    }

    async create_empty(options) {
        let notepad_id = await this._new_notepad_record();
        let notepad = new Notepad();
        await notepad.create_empty(NOTEPAD_DB_PREFIX + notepad_id, options);
        return {"id": notepad_id, "notepad": notepad};
    }
}

export default NotepadsList;
