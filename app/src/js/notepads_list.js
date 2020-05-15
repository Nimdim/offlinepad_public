/* eslint no-fallthrough: "off" */
import Backbone from "backbone";
import _ from "lodash";
import IndexedDBStorage from "./indexeddb_storage.js";
import Notepad from './notepad.js'

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
        // let index_options = {"unique": false};
        let unique_index = {"unique": true};
        switch(event.oldVersion) {
            case 0: {
                let notepads = db.createObjectStore("notepads", store_options);
                notepads;
                let pin_codes = db.createObjectStore("pin_codes", store_options);
                pin_codes.createIndex("notepad_id_idx", "notepad_id", unique_index);
            }
        }
    }
}

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
                    let reader = new NotepadReaderStorage(database.version);
                    let info_;
                    let promise = reader.init(database.name).then(
                        () => {
                            return reader.get_item_from_store_using_index(
                                "settings", "name_idx", "info"
                            );
                        }
                    ).then(
                        (info) => {
                            info_ = info;
                            return reader.close();
                        }
                    ).then(() => {return info_;})
                    promises.push(promise);
                }
            }
        );

        let notepads = await Promise.all(promises);
        debugger
        notepads = _.orderBy(notepads, "notepad_name");
        _.forEach(
            notepads,
            (item, index) => {
                debugger
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
        await this.reread_list();
        if(this.has(notepad_id)) {
            let pin_code_ids = await this._storage.get_item_ids_from_store_using_index(
                "pin_codes", "notepad_id_idx", notepad_id
            );
            for(let k = 0; k < pin_code_ids.length; k++) {
                let pin_code_id = pin_code_ids[k];
                await this._storage.delete_item_in_store("pin_codes", pin_code_id);
            }
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

    async open(notepad_id) {
        if(this.has(notepad_id)) {
            let notepad = new Notepad();
            await notepad.sync(NOTEPAD_DB_PREFIX + notepad_id);
            return notepad;
        } else {
            return false;
        }
    }

    async _new_notepad_record(name, encrypted) {
        let notepad = {
            name: name,
            encrypted: encrypted,
        }
        let notepad_id = await this._storage.create_item_in_store(
            "notepads", notepad
        );
        return notepad_id;
    }

    async create(notepad_name, options) {
        let notepad_id = await this._new_notepad_record(
            notepad_name, options.encrypted
        );
        let notepad = new Notepad();
        await notepad.create(NOTEPAD_DB_PREFIX + notepad_id, notepad_name, options);
        return {"id": notepad_id, "notepad": notepad};
    }

    async create_empty(notepad_name, options) {
        let notepad_id = await this._new_notepad_record(
            notepad_name, options.encrypted
        );
        let notepad = new Notepad();
        await notepad.create_empty(NOTEPAD_DB_PREFIX + notepad_id);
        return {"id": notepad_id, "notepad": notepad};
    }

    async import(import_data) {
        let info;
        _.forEach(import_data, (item) => {
            if(item.name == "info") {
                info = item;
            }
        });
        if(info == null) {
            throw new Error("no info");
        }
        let notepad_id = await this._new_notepad_record(
            info.notepad_name,
            info.encrypted,
        );
        let notepad = new Notepad();
        let maps = await notepad.import(NOTEPAD_DB_PREFIX + notepad_id, import_data);
        return {"id": notepad_id, "notepad": notepad, "maps": maps};
    }
  
}

export default NotepadsList;
